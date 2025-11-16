// src/App.jsx
import { useState, useEffect, useMemo } from 'react';
import { Authenticator, View, Heading, TextField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import { list, uploadData, getUrl } from 'aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';

const Req = ({ text }) => (
  <span>
    {text}
    <span style={{ color: '#dc2626' }}> *</span>
  </span>
);

export default function App() {
  const client = generateClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [billingAddress1, setBillingAddress1] = useState('');
  const [billingAddress2, setBillingAddress2] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [billingCountry, setBillingCountry] = useState('');
  const [profileId, setProfileId] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [docFile, setDocFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  const PROFILE_STORAGE_KEYS = [
    'profileOwner',
    'profileId',
    'firstName',
    'lastName',
    'email',
    'phone',
    'organization',
    'billingAddress1',
    'billingAddress2',
    'billingCity',
    'billingState',
    'billingZip',
    'billingCountry',
  ];

  const resetProfileState = () => {
    setSavedToast(false);
    setSaving(false);
    setLastUpdated('');
    setProfileId('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setOrganization('');
    setBillingAddress1('');
    setBillingAddress2('');
    setBillingCity('');
    setBillingState('');
    setBillingZip('');
    setBillingCountry('');
  };

  const resetUploadsState = () => {
    setDocFile(null);
    setUploads([]);
    setLoadingUploads(false);
    setUploading(false);
    setUploadPct(0);
  };

  const clearProfileStorage = () => {
    PROFILE_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
  };

  const deriveUserEmail = (user) =>
    user?.attributes?.email ??
    user?.signInDetails?.loginId ??
    user?.username ??
    '';

  async function refreshUploads() {
    try {
      setLoadingUploads(true);
      const { items } = await list({
        path: ({ identityId }) => `uploads/${identityId}/`,
        options: { pageSize: 50 },
      });
      setUploads(items ?? []);
    } catch (e) {
      console.warn('refreshUploads failed:', e);
      setUploads([]);
    } finally {
      setLoadingUploads(false);
    }
  }

  useEffect(() => {
    if (activeTab === 'uploads') {
      refreshUploads();
    }
  }, [activeTab]);

  async function loadLatest() {
    const opts = { authMode: 'userPool' };
    const { data } = await client.models.Profile.list(opts);

    if (!data || data.length === 0) {
      setProfileId('');
      return;
    }

    const latest = [...data].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    )[0];

    setProfileId(latest.id);
    setFirstName(latest.firstName ?? '');
    setLastName(latest.lastName ?? '');
    setPhone(latest.phone ?? '');
    setOrganization(latest.organization ?? '');
    setBillingAddress1(latest.billingAddress1 ?? '');
    setBillingAddress2(latest.billingAddress2 ?? '');
    setBillingCity(latest.billingCity ?? '');
    setBillingState(latest.billingState ?? '');
    setBillingZip(latest.billingZip ?? '');
    setBillingCountry(latest.billingCountry ?? '');
    setLastUpdated(latest.updatedAt || latest.createdAt || '');
  }

  const AutoLoad = useMemo(
    () =>
      function AutoLoad({ user }) {
        useEffect(() => {
          if (!user) return;
          let cancelled = false;

          setActiveTab('profile');
          resetUploadsState();
          resetProfileState();
          clearProfileStorage();
          setEmail(deriveUserEmail(user));

          (async () => {
            try {
              if (!cancelled) await loadLatest();
            } catch (e) {
              console.error('auto-load profile failed', e);
            }
          })();

          return () => {
            cancelled = true;
          };
        }, [user?.attributes?.sub, user?.userId, user?.username]);

        return null;
      },
    []
  );

  const handleUpload = async () => {
    if (!docFile || uploading) return;

    setUploading(true);
    setUploadPct(0);

    try {
      const uploadTask = uploadData({
        path: ({ identityId }) =>
          `uploads/${identityId}/${Date.now()}-${docFile.name}`,
        data: docFile,
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (!totalBytes) return;
            const pct = Math.round((transferredBytes / totalBytes) * 100);
            setUploadPct(pct);
          },
        },
      });

      await uploadTask.result;

      setDocFile(null);
      setUploadPct(0);
      await refreshUploads();
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenFile = async (item) => {
    try {
      const { url } = await getUrl({ path: item.path });
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Open file failed', err);
      alert('Could not open file. Please try again.');
    }
  };

  return (
    <div className="auth-shell">
      <Authenticator
        style={{ width: '100%', maxWidth: 420 }}
        components={{
          Header() {
            return (
              <View textAlign="center" padding="medium">
                <img
                  src="/company.png"
                  alt="AIVault"
                  width={128}
                  height={128}
                  style={{ display: 'block', margin: '0 auto 6px' }}
                />
                <Heading level={3} marginTop="0.25rem">
                  Project: SPARTA
                </Heading>
              </View>
            );
          },
        }}
      >
        {({ user, signOut }) => {
          const canSave = Boolean(
            firstName.trim() &&
              lastName.trim() &&
              phone.trim() &&
              (user?.attributes?.email ??
                user?.signInDetails?.loginId ??
                user?.username)
          );

          const handleSignOut = () => {
            resetUploadsState();
            resetProfileState();
            clearProfileStorage();
            setActiveTab('profile');
            signOut();
          };

          const handleProfileFieldChange = (field, value) => {
            switch (field) {
              case 'firstName':
                setFirstName(value);
                break;
              case 'lastName':
                setLastName(value);
                break;
              case 'phone':
                setPhone(value);
                break;
              case 'organization':
                setOrganization(value);
                break;
              case 'billingAddress1':
                setBillingAddress1(value);
                break;
              case 'billingAddress2':
                setBillingAddress2(value);
                break;
              case 'billingCity':
                setBillingCity(value);
                break;
              case 'billingState':
                setBillingState(value);
                break;
              case 'billingZip':
                setBillingZip(value);
                break;
              case 'billingCountry':
                setBillingCountry(value);
                break;
              default:
                break;
            }
          };

          const handleSaveProfile = async () => {
            if (saving) return;
            setSaving(true);
            try {
              const cognitoEmail = (
                user?.attributes?.email ??
                user?.signInDetails?.loginId ??
                user?.username ??
                email
              )
                .toString()
                .trim();

              const nn = (s) => (s.trim() === '' ? null : s.trim());
              const { identityId } = await fetchAuthSession();

              const payload = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: cognitoEmail,
                phone: phone.trim(),
                organization: nn(organization),
                billingAddress1: nn(billingAddress1),
                billingAddress2: nn(billingAddress2),
                billingCity: nn(billingCity),
                billingState: nn(billingState),
                billingZip: nn(billingZip),
                billingCountry: nn(billingCountry),
                identityId,
              };

              const { data } = profileId
                ? await client.models.Profile.update(
                    { id: profileId, ...payload },
                    { authMode: 'userPool' }
                  )
                : await client.models.Profile.create(
                    { ...payload },
                    { authMode: 'userPool' }
                  );

              setProfileId(data.id);
              setLastUpdated(
                data?.updatedAt || data?.createdAt || new Date().toISOString()
              );
              await loadLatest();
              setSavedToast(true);
              setTimeout(() => setSavedToast(false), 3000);
            } finally {
              setSaving(false);
            }
          };

          return (
            <main className="app-authed">
              <AutoLoad user={user} />

              <div
                role="tablist"
                aria-label="Profile sections"
                style={{
                  display: 'inline-flex',
                  border: '1px solid #222',
                  borderRadius: 9999,
                  overflow: 'hidden',
                  marginBottom: 12,
                }}
              >
                <button
                  role="tab"
                  aria-selected={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                  style={{
                    padding: '8px 16px',
                    fontWeight: 700,
                    background:
                      activeTab === 'profile' ? '#90d6e9' : '#f4f4f5',
                    color: '#111',
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                  }}
                >
                  Profile
                </button>

                <button
                  role="tab"
                  aria-selected={activeTab === 'uploads'}
                  onClick={() => setActiveTab('uploads')}
                  style={{
                    padding: '8px 16px',
                    fontWeight: 700,
                    background:
                      activeTab === 'uploads' ? '#90d6e9' : '#f4f4f5',
                    color: '#111',
                    cursor: 'pointer',
                    borderLeft: '1px solid #222',
                    borderTop: 'none',
                    borderRight: 'none',
                    borderBottom: 'none',
                    outline: 'none',
                  }}
                >
                  Uploads
                </button>
              </div>

              {activeTab === 'profile' && (
                <ProfileTab
                  firstName={firstName}
                  lastName={lastName}
                  email={
                    user?.attributes?.email ??
                    user?.signInDetails?.loginId ??
                    user?.username ??
                    email
                  }
                  phone={phone}
                  organization={organization}
                  billingAddress1={billingAddress1}
                  billingAddress2={billingAddress2}
                  billingCity={billingCity}
                  billingState={billingState}
                  billingZip={billingZip}
                  billingCountry={billingCountry}
                  lastUpdated={lastUpdated}
                  saving={saving}
                  canSave={canSave}
                  savedToast={savedToast}
                  onChangeField={handleProfileFieldChange}
                  onSave={handleSaveProfile}
                  onSignOut={handleSignOut}
                />
              )}

              {activeTab === 'uploads' && (
                <UploadsTab
                  docFile={docFile}
                  uploads={uploads}
                  uploading={uploading}
                  uploadPct={uploadPct}
                  loadingUploads={loadingUploads}
                  onFileSelect={setDocFile}
                  onUpload={handleUpload}
                  onOpenFile={handleOpenFile}
                  onRefresh={refreshUploads}
                  onSignOut={handleSignOut}
                />
              )}
            </main>
          );
        }}
      </Authenticator>
    </div>
  );
}

function ProfileTab({
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          <img src="/company.png" alt="AIVault" width={96} height={96} />
          <h1 style={{ margin: 0 }}>Welcome {firstName}</h1>
        </div>

        <div style={{ fontSize: 12, color: '#6b7280' }}>
          {lastUpdated
            ? `Last saved: ${new Date(lastUpdated).toLocaleString()}`
            : 'Not saved yet'}
        </div>

        <h2 style={{ marginTop: 24, marginBottom: 8 }}>Personal Information</h2>

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

        <h2 style={{ marginTop: 24, marginBottom: 8 }}>Billing Information</h2>

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

        <div style={{ color: 'red', marginTop: 12 }}>
          TODO: Add Terms of Service &amp; Privacy Policy consent
        </div>

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

function UploadsTab({
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
