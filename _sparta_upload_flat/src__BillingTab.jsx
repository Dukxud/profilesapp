// src/BillingTab.jsx
import { useState } from 'react';

export default function BillingTab({ email, onSignOut }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        // TODO: replace with your real API Gateway URL
        'https://1d7z59fui9.execute-api.us-east-2.amazonaws.com/prod/billing/create-checkout-session',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data?.url) {
        // Stripe-hosted Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Subscribe failed', err);
      setError('Could not start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <img src="/company.png" alt="AIVault" width={96} height={96} />
        <h1 style={{ margin: 0 }}>Billing</h1>
      </div>

      <p style={{ fontSize: 14, color: '#4b5563', marginTop: 0 }}>
        Subscribe to unlock AI Security analysis for your models.
      </p>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 14, marginTop: 0, marginBottom: 8 }}>
          Current plan: <strong>Foundational</strong> · <strong>$100 / month</strong>
        </p>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            padding: '8px 14px',
            borderRadius: 9999,
            border: '1px solid #6b7280',
            background: '#90d6e9',
            color: '#111827',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Redirecting…' : 'Subscribe / Manage billing'}
        </button>

        <button
          onClick={onSignOut}
          style={{
            marginLeft: 8,
            padding: '8px 14px',
            borderRadius: 9999,
            border: '1px solid #e5e7eb',
            background: 'white',
            color: '#111827',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>

        {error && (
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: '#b91c1c',
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
