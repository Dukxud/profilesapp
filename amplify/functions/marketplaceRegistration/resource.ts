// amplify/functions/marketplaceRegistration/resource.ts
import { defineFunction } from '@aws-amplify/backend';

/**
 * Handles the AWS Marketplace redirect (registration step).
 */
export const marketplaceRegistration = defineFunction({
  name: 'marketplaceRegistration',
  entry: './handler.ts',
  timeoutSeconds: 10,
  // ResolveCustomer is an action-level permission (no resource ARN), so resource must be "*"
  permissions: [
    {
      actions: ['aws-marketplace:ResolveCustomer'],
      resources: ['*'],
    },
  ],
});
