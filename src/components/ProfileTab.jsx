import { TextField } from '@aws-amplify/ui-react';

const Req = ({ text }) => (
  <span>
    {text}
    <span style={{ color: '#dc2626' }}> *</span>
  </span>
);

export function ProfileTab({
  form,
  onChange,
  userEmail,
  lastUpdated,
  isMarketplaceLinked,
  marketProduct,
  savedToast,
  canSave,
  saving,
  onSave,
  onSignOut,
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginTop: 4,
        }}
      >
        <img src="/company.png" alt="AIVault" width={96} height={96} />
        <h1 style={{ margin: 0 }}>Welcome {form.firstName || 'back'}</h1>
      </div>

      <div style={{ fontSize: 12, color: '#6b7280' }}>
        {lastUpdated
          ? `Last saved: ${new Date(lastUpdated).toLocaleString()}`
          : 'Not saved yet'}
      </div>

      {isMarketplaceLinked && (
        <div
          style={{
            display: 'inline-block',
            marginTop: 6,
            padding: '4px 8px',
            borderRadius: 9999,
            background: '#ecfeff',
            border: '1px solid #0891b2',
            color: '#0e7490',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          AWS Marketplace linked {marketProduct ? `(${marketProduct})` : ''}
        </div>
      )}

      <h2 style={{ marginTop: 24, marginBottom: 8 }}>Personal Information</h2>

      <TextField
        label={<Req text="First name" />}
        placeholder="e.g., Ada"
        width="280px"
        value={form.firstName}
        onChange={(e) => onChange('firstName', e.target.value)}
        isRequired
      />

      <TextField
        label={<Req text="Last name" />}
        placeholder="e.g., Lovelace"
        width="280px"
        value={form.lastName}
        onChange={(e) => onChange('lastName', e.target.value)}
        isRequired
      />

      <TextField
        label="Organization"
        placeholder="e.g., Acme Corp"
        width="280px"
        value={form.organization}
        onChange={(e) => onChange('organization', e.target.value)}
      />

      <TextField
        label={<Req text="Email Address" />}
        placeholder="e.g., JohnDoe@gmail.com"
        width="280px"
        value={userEmail}
        isRequired
        isReadOnly
      />

      <TextField
        label={<Req text="Phone" />}
        placeholder="e.g., 123-456-7890"
        width="280px"
        value={form.phone}
        onChange={(e) => onChange('phone', e.target.value)}
        isRequired
      />

      <h2 style={{ marginTop: 24, marginBottom: 8 }}>Billing Information</h2>

      <TextField
        label="Address line 1"
        placeholder="e.g., 123 Main St"
        width="280px"
        value={form.billingAddress1}
        onChange={(e) => onChange('billingAddress1', e.target.value)}
        isRequired
      />

      <TextField
        label="Address line 2"
        placeholder="e.g., Unit 1103"
        width="280px"
        value={form.billingAddress2}
        onChange={(e) => onChange('billingAddress2', e.target.value)}
      />

      <TextField
        label="City"
        placeholder="e.g., New York City"
        width="280px"
        value={form.billingCity}
        onChange={(e) => onChange('billingCity', e.target.value)}
        isRequired
      />

      <TextField
        label="State"
        placeholder="e.g., New York"
        width="280px"
        value={form.billingState}
        onChange={(e) => onChange('billingState', e.target.value)}
        isRequired
      />

      <TextField
        label="Zip Code"
        placeholder="e.g., 10001"
        width="280px"
        value={form.billingZip}
        onChange={(e) => onChange('billingZip', e.target.value)}
        isRequired
      />

      <TextField
        label="Country"
        placeholder="e.g., United States of America"
        width="280px"
        value={form.billingCountry}
        onChange={(e) => onChange('billingCountry', e.target.value)}
        isRequired
      />

      <div style={{ color: 'red', marginTop: 12 }}>
        TODO: Add Terms of Service & Privacy Policy consent
      </div>

      {savedToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            background: '#10b981',
            color: 'white',
            padding: '10px 14px',
            borderRadius: 12,
            boxShadow: '0 6px 20px rgba(0,0,0,.2)',
            fontWeight: 600,
          }}
        >
          Saved ✓
        </div>
      )}

      <button
        style={{
          marginTop: 8,
          padding: '10px 16px',
          borderRadius: 10,
          border: canSave ? '1px solid #6b7280' : '1px solid #e5e7eb',
          background: canSave ? '#90d6e9' : '#e5e7eb',
          color: canSave ? '#111' : 'white',
          fontWeight: 700,
          cursor: canSave ? 'pointer' : 'not-allowed',
        }}
        disabled={!canSave || saving}
        onClick={onSave}
      >
        {saving ? 'Saving…' : 'Save profile'}
      </button>

      <button
        onClick={onSignOut}
        style={{
          marginTop: 8,
          marginLeft: 8,
          padding: '10px 16px',
          borderRadius: 10,
          border: '1px solid #222',
          background: '#90d6e9',
          color: '#111',
          fontWeight: 700,
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </div>
  );
}
