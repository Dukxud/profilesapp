import { defineFunction } from '@aws-amplify/backend';

export const generateVpnUsername = defineFunction({
  name: 'generateVpnUsername',
  entry: './handler.ts',
  timeoutSeconds: 10,
});
