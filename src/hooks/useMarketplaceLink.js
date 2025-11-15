import { useEffect } from 'react';

export function useMarketplaceLink({ client, regUrl, profileId, onLinked, reloadProfile }) {
  useEffect(() => {
    if (!regUrl) return;

    const url = new URL(window.location.href);
    const token =
      url.searchParams.get('x-amzn-marketplace-token') ||
      url.searchParams.get('token');

    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(regUrl, {
          headers: { 'x-amzn-marketplace-token': token },
        });
        const json = await res.json();

        if (!json?.ok || !json.customerIdentifier || !json.productCode) {
          console.warn('Marketplace link failed:', json);
          return;
        }

        if (profileId) {
          await client.models.Profile.update(
            {
              id: profileId,
              marketplaceCustomerId: json.customerIdentifier,
              marketplaceProductCode: json.productCode,
              marketplaceLinkedAt: new Date().toISOString(),
            },
            { authMode: 'userPool' }
          );
          if (!cancelled) {
            onLinked?.({
              customerIdentifier: json.customerIdentifier,
              productCode: json.productCode,
            });
            await reloadProfile?.();
          }
        } else {
          localStorage.setItem(
            'pendingMarketplaceLink',
            JSON.stringify({
              customerIdentifier: json.customerIdentifier,
              productCode: json.productCode,
              linkedAt: new Date().toISOString(),
            })
          );
        }

        console.log('Marketplace linked:', json);
      } catch (error) {
        console.error('Registration call failed:', error);
      } finally {
        url.searchParams.delete('x-amzn-marketplace-token');
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [client, profileId, regUrl, onLinked, reloadProfile]);
}
