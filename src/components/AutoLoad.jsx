import { useEffect, useMemo, useRef } from 'react';

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

export function AutoLoad({ user, onReset, onLoad }) {
  const resetRef = useRef(onReset);
  const loadRef = useRef(onLoad);
  const identityKey = useMemo(() => {
    if (!user) return '';
    const rawId =
      user?.userId ??
      user?.attributes?.sub ??
      user?.username ??
      user?.signInDetails?.loginId ??
      '';
    return rawId ? rawId.toString() : '';
  }, [user]);

  useEffect(() => {
    resetRef.current = onReset;
  }, [onReset]);

  useEffect(() => {
    loadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    if (!identityKey) return undefined;
    let cancelled = false;

    resetRef.current?.({ user });
    LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

    (async () => {
      try {
        if (!cancelled) {
          await loadRef.current?.();
        }
      } catch (error) {
        console.error('auto-load profile failed', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [identityKey, user]);

  return null;
}
