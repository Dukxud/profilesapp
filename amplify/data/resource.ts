

import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
  Profile: a
    .model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      email: a.email(),
      phone: a.string(),
      organization: a.string(),
      billingAddress1: a.string(),
      billingAddress2: a.string(),
      billingCity: a.string(),
      billingState: a.string(),
      billingZip: a.string(),
      billingCountry: a.string(),
      identityId: a.string(),
      

      // marketplace info
      marketplaceCustomerId: a.string(),
      marketplaceProductCode: a.string(),
      marketplaceLinkedAt: a.datetime(),
      plan: a.string(),                    // negotiated plan name/label
      entitled: a.boolean(),               // true once Marketplace shows active entitlement
      contractEndAt: a.datetime(),         // optional: when the contract ends (for UI)

    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: { defaultAuthorizationMode: 'userPool' },
});
