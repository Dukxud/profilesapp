// index.js - Lambda for /billing/create-checkout-session

const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

// Fallback if FRONTEND_URL is not set (we'll set it though)
const DEFAULT_FRONTEND_URL = 'https://main.d3t4mgul7gcq89.amplifyapp.com';

exports.handler = async (event) => {
  const headers = event.headers || {};
  const origin =
    headers.origin ||
    headers.Origin ||
    process.env.FRONTEND_URL ||
    DEFAULT_FRONTEND_URL;

  const method =
    event.requestContext?.http?.method ||
    event.httpMethod ||
    'GET';

  // Handle CORS preflight if OPTIONS hits Lambda
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
      },
      body: '',
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const email = typeof body.email === 'string' ? body.email.trim() : undefined;

    if (!process.env.STRIPE_PRICE_ID) {
      console.error('Missing STRIPE_PRICE_ID env var');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'OPTIONS,POST',
        },
        body: JSON.stringify({ message: 'Billing not configured' }),
      };
    }

    const frontend = process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      payment_method_types: ['card'],
      customer_email: email || undefined,
      success_url: `${frontend}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend}/billing?canceled=1`,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe checkout error', err);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
      },
      body: JSON.stringify({ message: 'Failed to create checkout session' }),
    };
  }
};
