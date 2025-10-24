// amplify/api/resource.ts
import { defineApi } from '@aws-amplify/backend';
import { marketplaceRegistration } from '../functions/marketplaceRegistration/resource';

export const api = defineApi({
  name: 'publicApi',
  routes: {
    // Marketplace will hit this after subscription/offer acceptance
    'GET /marketplace/register': marketplaceRegistration,
  },
});
