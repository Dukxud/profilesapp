// src/VPNClientTab.jsx
export default function VPNClientTab({ downloading, onDownload, onSignOut }) {
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
        <h1 style={{ margin: 0 }}>VPN Client</h1>
      </div>

      <p style={{ fontSize: 14, color: '#4b5563', marginTop: 0 }}>
        Download the VPN client installer used to securely connect to our
        environment. Just click the button below and run the installer that
        downloads.
      </p>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
        }}
      >
        <button
          onClick={onDownload}
          disabled={downloading}
          style={{
            padding: '8px 14px',
            borderRadius: 9999,
            border: '1px solid #6b7280',
            background: '#90d6e9',
            color: '#111827',
            fontWeight: 700,
            cursor: downloading ? 'not-allowed' : 'pointer',
          }}
        >
          {downloading ? 'Preparing download…' : 'Download VPN Client'}
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
      </div>
    </div>
  );
}
