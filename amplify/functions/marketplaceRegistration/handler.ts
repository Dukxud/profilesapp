import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import {
  MarketplaceMeteringClient,
  ResolveCustomerCommand,
} from '@aws-sdk/client-marketplace-metering';
import { env } from 'process';

const mmClient = new MarketplaceMeteringClient({
    region: env.AWS_REGION ?? env.AWS_DEFAULT_REGION ?? 'us-east-2',
  });

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Marketplace sends a short-lived token
    const hdr = event.headers || {};
    const qs = event.queryStringParameters || {};

    const token =
      hdr['x-amzn-marketplace-token'] ||
      hdr['X-Amzn-Marketplace-Token'] || // some proxies normalize case
      qs['x-amzn-marketplace-token'] ||
      qs['token'];

    if (!token) {
      return {
        statusCode: 400,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
        body: JSON.stringify({ ok: false, error: 'Missing marketplace token' }),
      };
    }

    const resp = await mmClient.send(
      new ResolveCustomerCommand({ RegistrationToken: token })
    );

    // Expect: { CustomerIdentifier, ProductCode } when valid
    const customerIdentifier = resp.CustomerIdentifier;
    const productCode = resp.ProductCode;

    if (!customerIdentifier || !productCode) {
      return {
        statusCode: 502,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
        },
        body: JSON.stringify({ ok: false, error: 'ResolveCustomer returned empty result' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
      },
      body: JSON.stringify({
        ok: true,
        customerIdentifier,
        productCode,
      }),
    };
  } catch (e: any) {
    console.error('ResolveCustomer error:', e);
    return {
      statusCode: 500,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
      },
      body: JSON.stringify({ ok: false, error: 'ResolveCustomer failed' }),
    };
  }
};
