export default function UploadsTab({
    docFile,
    uploads,
    uploading,
    uploadPct,
    loadingUploads,
    onFileSelect,
    onUpload,
    onOpenFile,
    onRefresh,
    onSignOut,
  }) {
    const handleFileChange = (e) => {
      const file = e.target.files?.[0] ?? null;
      onFileSelect(file);
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
          <img src="/company.png" alt="AIVault" width={72} height={72} />
          <h1 style={{ margin: 0 }}>Uploads</h1>
        </div>
  
        <p style={{ fontSize: 14, color: '#4b5563', marginTop: 0 }}>
          Upload documents or files associated with your profile. Files are stored
          under your private identity in S3.
        </p>
  
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <input
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
  
          {docFile && (
            <div style={{ fontSize: 13, marginBottom: 8 }}>
              Selected file:{' '}
              <span style={{ fontWeight: 600 }}>{docFile.name}</span>
            </div>
          )}
  
          {uploading && (
            <div style={{ fontSize: 13, marginBottom: 8 }}>
              Uploading… {uploadPct}%
              <div
                style={{
                  marginTop: 4,
                  width: '100%',
                  maxWidth: 260,
                  height: 6,
                  borderRadius: 9999,
                  background: '#e5e7eb',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${uploadPct}%`,
                    height: '100%',
                    background: '#22c55e',
                    transition: 'width 120ms linear',
                  }}
                />
              </div>
            </div>
          )}
  
          <button
            onClick={onUpload}
            disabled={!docFile || uploading}
            style={{
              marginTop: 4,
              padding: '8px 14px',
              borderRadius: 9999,
              border:
                !docFile || uploading
                  ? '1px solid #e5e7eb'
                  : '1px solid #6b7280',
              background: !docFile || uploading ? '#e5e7eb' : '#90d6e9',
              color: '#111827',
              fontWeight: 700,
              cursor: !docFile || uploading ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? 'Uploading…' : 'Upload file'}
          </button>
  
          <button
            onClick={onRefresh}
            disabled={loadingUploads}
            style={{
              marginLeft: 8,
              padding: '8px 14px',
              borderRadius: 9999,
              border: '1px solid #e5e7eb',
              background: 'white',
              color: '#111827',
              fontWeight: 600,
              cursor: loadingUploads ? 'not-allowed' : 'pointer',
            }}
          >
            {loadingUploads ? 'Refreshing…' : 'Refresh list'}
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
  
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 16 }}>
            Your files
          </h2>
  
          {loadingUploads && uploads.length === 0 && (
            <div style={{ fontSize: 13, color: '#6b7280' }}>Loading…</div>
          )}
  
          {!loadingUploads && uploads.length === 0 && (
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              No files uploaded yet.
            </div>
          )}
  
          {uploads.length > 0 && (
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 8,
                maxHeight: 260,
                overflowY: 'auto',
              }}
            >
              {uploads.map((item) => {
                const name = item.path.split('/').pop() || item.path;
                const sizeKb =
                  item.size != null ? Math.round(item.size / 1024) : null;
  
                return (
                  <div
                    key={item.path}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 4px',
                      borderBottom: '1px solid #f3f4f6',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ overflow: 'hidden' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          maxWidth: 220,
                        }}
                      >
                        {name}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>
                        {sizeKb != null ? `${sizeKb} KB · ` : ''}
                        {new Date(item.lastModified).toLocaleString()}
                      </div>
                    </div>
  
                    <button
                      onClick={() => onOpenFile(item)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 9999,
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Open
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
  