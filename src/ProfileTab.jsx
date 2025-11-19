// src/ProfileTab.jsx
import { TextField } from '@aws-amplify/ui-react';

const Req = ({ text }) => (
    <span>
        {text}
        <span style={{ color: '#dc2626' }}> *</span>
    </span>
);

export default function ProfileTab({
    firstName,
    lastName,
    email,
    phone,
    organization,
    billingAddress1,
    billingAddress2,
    billingCity,
    billingState,
    billingZip,
    billingCountry,
    lastUpdated,
    saving,
    canSave,
    savedToast,
    onChangeField,
    onSave,
    onSignOut,
}) {
    return (
        <>
            <div>
                {/* Header row with stable width so typing doesn't recenter the card */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginTop: 16,
                        marginBottom: 4,
                        width: '100%',
                    }}
                >
                    <img src="/company.png" alt="AIVault" width={96} height={96} />
                    <h1
                        style={{
                            margin: 0,
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        Welcome {firstName}
                    </h1>
                </div>

                <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {lastUpdated
                        ? `Last saved: ${new Date(lastUpdated).toLocaleString()}`
                        : 'Not saved yet'}
                </div>

                <h2 style={{ marginTop: 24, marginBottom: 8 }}>Personal Information</h2>

                {/* Center PERSONAL fields */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <TextField
                        label={<Req text="First name" />}
                        placeholder="e.g., Ada"
                        width="280px"
                        value={firstName}
                        onChange={(e) => onChangeField('firstName', e.target.value)}
                        isRequired
                    />

                    <TextField
                        label={<Req text="Last name" />}
                        placeholder="e.g., Lovelace"
                        width="280px"
                        value={lastName}
                        onChange={(e) => onChangeField('lastName', e.target.value)}
                        isRequired
                    />

                    <TextField
                        label="Organization"
                        placeholder="e.g., Acme Corp"
                        width="280px"
                        value={organization}
                        onChange={(e) => onChangeField('organization', e.target.value)}
                    />

                    <TextField
                        label={<Req text="Email address" />}
                        placeholder="e.g., ada@example.com"
                        width="280px"
                        value={email}
                        isRequired
                        isReadOnly
                    />

                    <TextField
                        label={<Req text="Phone" />}
                        placeholder="e.g., 123-456-7890"
                        width="280px"
                        value={phone}
                        onChange={(e) => onChangeField('phone', e.target.value)}
                        isRequired
                    />
                </div>

                {/* <h2 style={{ marginTop: 24, marginBottom: 8 }}>Billing Information</h2> */}

                {/* Center BILLING fields
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <TextField
                        label={<Req text="Address line 1" />}
                        placeholder="Street address"
                        width="280px"
                        value={billingAddress1}
                        onChange={(e) => onChangeField('billingAddress1', e.target.value)}
                        isRequired
                    />

                    <TextField
                        label="Address line 2"
                        placeholder="Apt, suite, etc. (optional)"
                        width="280px"
                        value={billingAddress2}
                        onChange={(e) => onChangeField('billingAddress2', e.target.value)}
                    />

                    <TextField
                        label={<Req text="City" />}
                        placeholder="e.g., New York City"
                        width="280px"
                        value={billingCity}
                        onChange={(e) => onChangeField('billingCity', e.target.value)}
                        isRequired
                    />

                    <TextField
                        label={<Req text="State / Province" />}
                        placeholder="e.g., New York"
                        width="280px"
                        value={billingState}
                        onChange={(e) => onChangeField('billingState', e.target.value)}
                        isRequired
                    />

                    <TextField
                        label={<Req text="ZIP / Postal code" />}
                        placeholder="e.g., 10001"
                        width="280px"
                        value={billingZip}
                        onChange={(e) => onChangeField('billingZip', e.target.value)}
                        isRequired
                    />

                    <TextField
                        label={<Req text="Country" />}
                        placeholder="e.g., United States"
                        width="280px"
                        value={billingCountry}
                        onChange={(e) => onChangeField('billingCountry', e.target.value)}
                        isRequired
                    />
                </div> */}

                {/* <div style={{ color: 'red', marginTop: 12 }}>
                    TODO: Add Terms of Service &amp; Privacy Policy consent
                </div> */}

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
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        color: '#111',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    Sign out
                </button>
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
                        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                        fontSize: 14,
                    }}
                >
                    Profile saved
                </div>
            )}
        </>
    );
}
