// amplify/functions/marketplaceRegistration/handler.ts
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // We’ll parse the Marketplace token here in the next sip and call ResolveCustomer.
  console.log('registration event:', JSON.stringify(event));
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
