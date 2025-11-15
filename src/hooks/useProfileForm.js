import { useCallback, useMemo, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  phone: '',
  organization: '',
  billingAddress1: '',
  billingAddress2: '',
  billingCity: '',
  billingState: '',
  billingZip: '',
  billingCountry: '',
};

const LOCAL_STORAGE_KEYS = [
  'profileOwner',
  'profileId',
  'firstName',
  'lastName',
  'email',
  'phone',
  'organization',
  'billingAddress1',
  'billingAddress2',
  'billingCity',
  'billingState',
  'billingZip',
  'billingCountry',
];

export function useProfileForm(client) {
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM }));
  const [profileId, setProfileId] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isMarketplaceLinked, setIsMarketplaceLinked] = useState(false);
  const [marketProduct, setMarketProduct] = useState('');

  const canSave = useMemo(
    () =>
      Boolean(
        form.firstName.trim() &&
          form.lastName.trim() &&
          form.phone.trim()
      ),
    [form.firstName, form.lastName, form.phone]
  );

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setForm({ ...EMPTY_FORM });
    setProfileId('');
    setSaving(false);
    setSavedToast(false);
    setLastUpdated('');
    setIsMarketplaceLinked(false);
    setMarketProduct('');
  }, []);

  const applyMarketplaceLink = useCallback(({ customerIdentifier, productCode }) => {
    if (!customerIdentifier || !productCode) return;
    setIsMarketplaceLinked(true);
    setMarketProduct(productCode ?? '');
  }, []);

  const loadLatest = useCallback(async () => {
    const opts = { authMode: 'userPool' };
    const { data } = await client.models.Profile.list(opts);
    if (!data || data.length === 0) {
      setProfileId('');
      setIsMarketplaceLinked(false);
      setMarketProduct('');
      setLastUpdated('');
      setForm({ ...EMPTY_FORM });
      return;
    }

    const latest = [...data].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    )[0];

    setProfileId(latest.id);
    setForm({
      firstName: latest.firstName ?? '',
      lastName: latest.lastName ?? '',
      phone: latest.phone ?? '',
      organization: latest.organization ?? '',
      billingAddress1: latest.billingAddress1 ?? '',
      billingAddress2: latest.billingAddress2 ?? '',
      billingCity: latest.billingCity ?? '',
      billingState: latest.billingState ?? '',
      billingZip: latest.billingZip ?? '',
      billingCountry: latest.billingCountry ?? '',
    });
    setIsMarketplaceLinked(!!latest.marketplaceCustomerId);
    setMarketProduct(latest.marketplaceProductCode ?? '');
    setLastUpdated(latest.updatedAt || latest.createdAt || '');
  }, [client]);

  const nn = useCallback((value) => {
    const trimmed = value?.trim?.() ?? '';
    return trimmed === '' ? null : trimmed;
  }, []);

  const saveProfile = useCallback(
    async ({ user, fallbackEmail }) => {
      if (saving) return;
      setSaving(true);
      try {
        const cognitoEmail = (
          user?.attributes?.email ??
          user?.signInDetails?.loginId ??
          user?.username ??
          fallbackEmail ??
          ''
        ).toString().trim();

        const { identityId } = await fetchAuthSession();
        const payload = {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: cognitoEmail,
          phone: form.phone.trim(),
          organization: nn(form.organization),
          billingAddress1: nn(form.billingAddress1),
          billingAddress2: nn(form.billingAddress2),
          billingCity: nn(form.billingCity),
          billingState: nn(form.billingState),
          billingZip: nn(form.billingZip),
          billingCountry: nn(form.billingCountry),
          identityId,
        };

        let marketplacePatch = {};
        const raw = localStorage.getItem('pendingMarketplaceLink');
        if (!profileId && raw) {
          try {
            const { customerIdentifier, productCode, linkedAt } = JSON.parse(raw);
            if (customerIdentifier && productCode) {
              marketplacePatch = {
                marketplaceCustomerId: customerIdentifier,
                marketplaceProductCode: productCode,
                marketplaceLinkedAt: linkedAt || new Date().toISOString(),
              };
            }
          } catch {
            /* ignore malformed localStorage */
          }
        }

        const { data } = profileId
          ? await client.models.Profile.update(
              { id: profileId, ...payload },
              { authMode: 'userPool' }
            )
          : await client.models.Profile.create(
              { ...payload, ...marketplacePatch },
              { authMode: 'userPool' }
            );

        setIsMarketplaceLinked(!!data.marketplaceCustomerId);
        setMarketProduct(data.marketplaceProductCode ?? '');

        if (!profileId && marketplacePatch.marketplaceCustomerId) {
          localStorage.removeItem('pendingMarketplaceLink');
        }

        setProfileId(data.id);
        setLastUpdated(data?.updatedAt || data?.createdAt || new Date().toISOString());
        await loadLatest();
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
      } finally {
        setSaving(false);
      }
    },
    [client, form, loadLatest, nn, profileId, saving]
  );

  const clearPersistedDraft = useCallback(() => {
    LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }, []);

  return {
    form,
    profileId,
    saving,
    savedToast,
    lastUpdated,
    isMarketplaceLinked,
    marketProduct,
    canSave,
    updateField,
    resetForm,
    saveProfile,
    loadLatest,
    applyMarketplaceLink,
    clearPersistedDraft,
  };
}
