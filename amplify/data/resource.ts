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
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: { defaultAuthorizationMode: 'userPool' },
});
