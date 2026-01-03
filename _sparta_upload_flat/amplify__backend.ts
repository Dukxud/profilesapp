import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import { RestApi, LambdaIntegration, Cors, AuthorizationType } from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { marketplaceRegistration } from './functions/marketplaceRegistration/resource';

export const backend = defineBackend({
  auth,
  data,
  storage,
  marketplaceRegistration, // ← include the function
});

// ===== Create a small REST API and wire the function =====
const apiStack = backend.createStack('marketplace-api');

const api = new RestApi(apiStack, 'MarketplaceRestApi', {
  restApiName: 'marketplaceApi',
  deploy: true,
  deployOptions: { stageName: 'prod' },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
  },
});

// connect the Lambda as a GET /marketplace/register route
const registrationIntegration = new LambdaIntegration(
  backend.marketplaceRegistration.resources.lambda
);

api.root
  .addResource('marketplace')
  .addResource('register')
  .addMethod('GET', registrationIntegration, {
    authorizationType: AuthorizationType.NONE,
});

// ===== Grant the Lambda the Marketplace permission we need =====
backend.marketplaceRegistration.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['aws-marketplace:ResolveCustomer'],
    resources: ['*'],
  })
);

// (Optional but handy) output the API endpoint into amplify_outputs.json
backend.addOutput({
  custom: {
    API: {
      [api.restApiName]: {
        endpoint: api.url,
        region: Stack.of(api).region,
        apiName: api.restApiName,
      },
    },
  },
});
