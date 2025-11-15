export function UploadsTab({
  docFile,
  setDocFile,
  uploads,
  loadingUploads,
  uploading,
  uploadPct,
  onUpload,
  onOpen,
}) {
  return (
    <div>
      <h2 style={{ marginTop: 24, marginBottom: 8 }}>Uploads</h2>

      <label style={{ display: 'block', width: 280 }}>
        <input
          type="file"
          onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
          style={{ width: '100%' }}
        />
      </label>

      {docFile && (
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
          Selected: {docFile.name} ({Math.ceil(docFile.size / 1024)} KB)
        </div>
      )}

      <button
        onClick={onUpload}
        disabled={!docFile || uploading}
        style={{
          marginTop: 10,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #222',
          background: !docFile || uploading ? '#e5e7eb' : '#90d6e9',
          color: '#111',
          fontWeight: 700,
          cursor: !docFile || uploading ? 'not-allowed' : 'pointer',
        }}
      >
        {uploading ? `Uploading… ${uploadPct}%` : 'Upload file'}
      </button>

      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        {loadingUploads && <div>Loading uploads…</div>}
        <ul style={{ marginTop: 12, maxHeight: 180, overflowY: 'auto', paddingLeft: 16 }}>
          {uploads.length === 0 ? (
            <li style={{ color: '#6b7280' }}>No uploads yet.</li>
          ) : (
            uploads.map((item) => (
              <li key={item.path} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1 }}>
                  {item.path.split('/').pop()} — {item.size ?? 0} bytes
                </span>
                <button
                  onClick={() => onOpen(item.path)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid #222',
                    background: '#f4f4f5',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Open
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
