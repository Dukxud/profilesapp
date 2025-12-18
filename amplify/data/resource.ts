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

      // NEW FIELDS FOR PAYER / VPN / BILLING LOGIC

      // Who pays for this profile:
      // - For payer's own row: payingUserId === id
      // - For dependents: payingUserId = payer's Profile.id
      payingUserId: a.string(),

      // VPN seat index under that payer:
      // 1 for payer's own seat, 2+ for dependents
      vpnSeatIndex: a.integer(),

      // Actual VPN login string, e.g. "<payingUserId>_<vpnSeatIndex>"
      vpnUsername: a.string(),

      // Whether this seat is currently allowed to use VPN
      isActive: a.boolean(),

      // Cached subscription end time for this payer (only meaningful on payer row)
      subscriptionEndsAt: a.datetime(),

      // Stripe linkage (only meaningful on payer row)
      stripeCustomerId: a.string(),
      stripeSubscriptionId: a.string(),

      // Max seats allowed for this payer (only meaningful on payer row)
      vpnSeatLimit: a.integer(),

      // Human label for this device/profile, e.g. "Mom's iPhone"
      deviceLabel: a.string(),

      // When this specific seat was deactivated (if ever)
      deactivatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: { defaultAuthorizationMode: 'userPool' },
});
