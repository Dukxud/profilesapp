import { useEffect } from 'react';

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
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    onReset?.({ user });
    LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

    (async () => {
      try {
        if (!cancelled) {
          await onLoad?.();
        }
      } catch (error) {
        console.error('auto-load profile failed', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.attributes?.sub, user?.userId, user?.username, onLoad, onReset]);

  return null;
}
