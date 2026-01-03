// amplify/data/resource.ts
import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Profile: a
    .model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      email: a.email(),
      phone: a.string(),
      organization: a.string(),
      identityId: a.string(),
      portNum: a.string(),
      IPAddress: a.string(),
      language: a.string(),

      // NEW: MAC address for this device/profile
      macAddress: a.string(),

      // Who pays for this profile:
      // - For payer's own row: payingUserId === id
      // - For dependents: payingUserId = payer's Profile.id
      payingUserId: a.string(),

      // Optional: if you want to store the index explicitly
      vpnSeatIndex: a.integer(),

      // Actual VPN login string, e.g. "<payingUserId>_<index>"
      vpnUsername: a.string(),

      // Optional flags / billing cache; fine to leave null for now
      isActive: a.boolean(),
      subscriptionEndsAt: a.datetime(),
      stripeCustomerId: a.string(),
      stripeSubscriptionId: a.string(),
      vpnSeatLimit: a.integer(),
      deviceLabel: a.string(),
      deactivatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: { defaultAuthorizationMode: 'userPool' },
});
