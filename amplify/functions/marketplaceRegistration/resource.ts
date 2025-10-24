
import { defineFunction } from '@aws-amplify/backend';

export const marketplaceRegistration = defineFunction({
  name: 'marketplaceRegistration',
  entry: './handler.ts',
  timeoutSeconds: 10,
});
