// src/App.jsx
import { useState, useEffect, useMemo } from 'react';
import { Authenticator, View, Heading, TextField} from '@aws-amplify/ui-react';
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
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [organization, setCompany] = useState('');
  const [billingAddress1, setBillingAddress1] = useState('');
  const [billingAddress2, setBillingAddress2] = useState('');
  const [billingCity, setBillingCity]         = useState('');
  const [billingState, setBillingState]       = useState('');
  const [billingZip, setBillingZip]           = useState('');
  const [billingCountry, setBillingCountry]   = useState('');
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


  async function refreshUploads() {
    try {
      setLoadingUploads(true);
      const { items } = await list({
        // This scopes to the signed-in user’s folder:
        path: ({ identityId }) => `uploads/${identityId}/`,
        options: { pageSize: 50 },
      });
      setUploads(items ?? []);
    } catch (e) {
      console.warn('refreshUploads failed:', e);
      setUploads([]); // fall back to empty list, no pop-up
    } finally {
      setLoadingUploads(false);
    }
  }
  

  async function loadLatest() {
    const opts = { authMode: 'userPool' };
  
    // Owner-scoped: returns ONLY the current user's profiles
    const { data } = await client.models.Profile.list(opts);
    if (!data || data.length === 0) {
      setProfileId('');
      return; // nothing saved yet
    }
  
    // Pick the most recently updated (fallback to createdAt)
    const latest = [...data].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    )[0];
  
    setProfileId(latest.id);
    setFirstName(latest.firstName ?? '');
    setLastName(latest.lastName ?? '');
    setPhone(latest.phone ?? '');
    setCompany(latest.organization ?? '');
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
        
          // Landing reset: force Profile tab + clear any client-side caches
          setActiveTab('profile');
        
          // uploads tab state
          setDocFile(null);
          setUploads([]);
          setUploading(false);
          setUploadPct(0);
        
          // hard wipe any lingering localStorage (belt & suspenders)
          [
            'profileOwner','profileId','firstName','lastName','email','phone','organization',
            'billingAddress1','billingAddress2','billingCity','billingState','billingZip','billingCountry'
          ].forEach((k) => localStorage.removeItem(k));
        
          // On user change, clear in-memory fields (no localStorage)
          setProfileId('');
          setFirstName('');
          setLastName('');
          setPhone('');
          setCompany('');
          setBillingAddress1('');
          setBillingAddress2('');
          setBillingCity('');
          setBillingState('');
          setBillingZip('');
          setBillingCountry('');
          setLastUpdated('');
          setEmail(user?.attributes?.email ?? user?.signInDetails?.loginId ?? user?.username ?? '');
        
          (async () => {
            try {
              if (!cancelled) await loadLatest(); // loads ONLY this user's rows
            } catch (e) {
              console.error('auto-load profile failed', e);
            }
          })();
        
          return () => { cancelled = true; };
        }, [user?.attributes?.sub, user?.userId, user?.username]);
        
        return null;
      },
    []
  );

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
                  width={64}
                  height={64}
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
            (user?.attributes?.email ?? user?.signInDetails?.loginId ?? user?.username)
          );

          return (
            <main className="app-authed">
              
            <AutoLoad user={user} />

            {/* TAB BAR (bar-style, single segmented control) */}
            <div
              role="tablist"
              aria-label="Profile sections"
              style={{
                display: 'inline-flex',
                border: '1px solid #222',
                borderRadius: 9999,
                overflow: 'hidden',
                marginBottom: 12
              }}
            >
              <button
                role="tab"
                aria-selected={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
                style={{
                  padding: '8px 16px',
                  fontWeight: 700,
                  background: activeTab === 'profile' ? '#90d6e9' : '#f4f4f5',
                  color: '#111',
                  cursor: 'pointer',
                  border: 'none',
                  outline: 'none'
                }}
              >
                Profile
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'documents'}
                onClick={() => setActiveTab('documents')}
                style={{
                  padding: '8px 16px',
                  fontWeight: 700,
                  background: activeTab === 'documents' ? '#90d6e9' : '#f4f4f5',
                  color: '#111',
                  cursor: 'pointer',
                  borderLeft: '1px solid #222',   // divider inside the bar
                  borderTop: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  outline: 'none'
                }}
              >
                Uploads
              </button>
            </div>


            {activeTab === 'profile' && (<div>

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
                  <h1 style={{ margin: 0 }}>Welcome {firstName}</h1>
              </div>

              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {lastUpdated ? `Last saved: ${new Date(lastUpdated).toLocaleString()}` : 'Not saved yet'}
              </div>

              <h2 style={{ marginTop: 24, marginBottom: 8 }}>Personal Information</h2>

              <TextField
                label={<Req text="First name" />}
                placeholder="e.g., Ada"
                width="280px"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                isRequired
              />

              <TextField
                label={<Req text="Last name" />}
                placeholder="e.g., Lovelace"
                width="280px"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                isRequired
              />

              <TextField
                label="Organization"
                placeholder="e.g., Acme Corp"
                width="280px"
                value={organization}
                onChange={(e) => setCompany(e.target.value)}
              />

              <TextField
                label={<Req text="Email Address" />}
                placeholder="e.g., JohnDoe@gmail.com"
                width="280px"
                value={user?.attributes?.email ?? user?.signInDetails?.loginId ?? user?.username ?? email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
                isReadOnly
              />

              <TextField
                label={<Req text="Phone" />}
                placeholder="e.g., 123-456-7890"
                width="280px"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                isRequired
              />

              <h2 style={{ marginTop: 24, marginBottom: 8 }}>Billing Information</h2>


              <TextField
                label="Address line 1"
                placeholder="e.g., 123 Main St"
                width="280px"
                value={billingAddress1}
                onChange={(e) => setBillingAddress1(e.target.value)}
                isRequired
              />

              <TextField
                label="Address line 2"
                placeholder="e.g., Unit 1103"
                width="280px"
                value={billingAddress2}
                onChange={(e) => setBillingAddress2(e.target.value)}
              />

              <TextField
                label="City"
                placeholder="e.g., New York City"
                width="280px"
                value={billingCity}
                onChange={(e) => setBillingCity(e.target.value)}
                isRequired
              />

              <TextField
                label="State"
                placeholder="e.g., New York"
                width="280px"
                value={billingState}
                onChange={(e) => setBillingState(e.target.value)}
                isRequired
              />

              <TextField
                label="Zip Code"
                placeholder="e.g., 10001"
                width="280px"
                value={billingZip}
                onChange={(e) => setBillingZip(e.target.value)}
                isRequired
              />

              <TextField
                label="Country"
                placeholder="e.g., United States of America"
                width="280px"
                value={billingCountry}
                onChange={(e) => setBillingCountry(e.target.value)}
                isRequired
              />

              <div style={{ color: 'red', marginTop: 12 }}>TODO: Add Terms of Service & Privacy Policy consent</div>

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
                      fontWeight: 600
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
                    color: canSave ? '#6b7280' : 'white',
                    fontWeight: 700,
                    cursor: canSave ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!canSave || saving}
                  onClick={async () => {
                    if (saving) return;        
                    setSaving(true);           
                    try {
                      const cognitoEmail = (
                        user?.attributes?.email ??
                        user?.signInDetails?.loginId ??
                        user?.username ??
                        email
                      ).toString().trim();

                      const nn = (s) => (s.trim() === '' ? null : s.trim());

                      const { identityId } = await fetchAuthSession();
                      const payload = {
                        firstName: firstName.trim(),
                        lastName:  lastName.trim(),
                        email:     cognitoEmail,
                        phone:     phone.trim(),
                        organization:   nn(organization),
                        billingAddress1: nn(billingAddress1),
                        billingAddress2: nn(billingAddress2),
                        billingCity:     nn(billingCity),
                        billingState:    nn(billingState),
                        billingZip:      nn(billingZip),
                        billingCountry:  nn(billingCountry),
                        identityId,
                      };

                      const { data } = profileId
                        ? await client.models.Profile.update({ id: profileId, ...payload }, { authMode: 'userPool' })
                        : await client.models.Profile.create(payload, { authMode: 'userPool' });

                      setProfileId(data.id);
                      setLastUpdated(data?.updatedAt || data?.createdAt || new Date().toISOString());
                      await loadLatest();
                      setSavedToast(true);
                      setTimeout(() => setSavedToast(false), 3000);
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  {saving ? 'Saving…' : 'Save profile'}
                </button>

                <button
                  onClick={() => {


                    // uploads tab state
                    setDocFile(null);
                    setUploads([]);
                    setUploading(false);
                    setUploadPct(0);

                    // profile state
                    setSavedToast(false);
                    setSaving(false);
                    setLastUpdated('');
                    setProfileId('');
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setPhone('');
                    setCompany('');
                    setBillingAddress1('');
                    setBillingAddress2('');
                    setBillingCity('');
                    setBillingState('');
                    setBillingZip('');
                    setBillingCountry('');

                    // 2) LocalStorage wipe (belt & suspenders)
                    [
                      'profileOwner','profileId','firstName','lastName','email','phone','organization',
                      'billingAddress1','billingAddress2','billingCity','billingState','billingZip','billingCountry'
                    ].forEach((k) => localStorage.removeItem(k));

                    // 3) End Cognito session
                    signOut();
                  }}
                  style={{
                    marginTop: 8,
                    marginLeft: 8,
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: '1px solid #222',
                    background: '#90d6e9',
                    color: '#111',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                Sign out
                </button>


              </div>)}


              {activeTab === 'documents' && (
                <div>
                  <h2 style={{ marginTop: 24, marginBottom: 8 }}>Uploads</h2>

                  <label style={{ display: 'block', width: 280 }}>
                  <span style={{ display: 'block', marginBottom: 4 }}>
                    Upload a file
                  </span>
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
                    onClick={async () => {
                      if (!docFile || uploading) return;

                      setUploading(true);
                      setUploadPct(0);
                      try {
                        const { result } = await uploadData({
                          path: ({ identityId }) =>
                            `uploads/${identityId}/${Date.now()}_${docFile.name}`, // unique per user
                          data: docFile,
                          options: {
                            contentType: docFile.type || 'application/octet-stream',
                            metadata: {
                              userSub:   (user?.attributes?.sub ?? '').toString(),
                              email:     (user?.attributes?.email ?? user?.signInDetails?.loginId ?? user?.username ?? '').toString(),
                              profileId: (profileId ?? '').toString(),
                              profileName: `${firstName || ''} ${lastName || ''}`.trim(),
                            },

                            onProgress: ({ transferredBytes, totalBytes }) => {
                              if (!totalBytes) return;
                              const pct = Math.round((transferredBytes / totalBytes) * 100);
                              setUploadPct(pct);
                            },
                          },
                        });
                        await result;                 // wait for the upload to finish
                        setDocFile(null);             // clear picker
                        setUploadPct(100);            // cap at 100 for the toast/UX
                        await refreshUploads();       // show it in the list
                      } catch (e) {
                        console.error('Upload failed:', e);
                        alert('Upload failed. Please try again.');
                      } finally {
                        setUploading(false);
                        setTimeout(() => setUploadPct(0), 1200); // reset the meter after a moment
                      }
                    }}
                    disabled={!docFile || uploading}
                    style={{
                      marginTop: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #222',
                      background: !docFile || uploading ? '#e5e7eb' : '#90d6e9',
                      color: '#111',
                      fontWeight: 700,
                      cursor: !docFile || uploading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {uploading ? `Uploading… ${uploadPct}%` : 'Upload file'}
                  </button>


                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                    (We’ll wire this to S3 next sip—this just picks a file)
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={refreshUploads}
                      disabled={loadingUploads}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #222',
                        background: '#f4f4f5',
                        cursor: loadingUploads ? 'not-allowed' : 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {loadingUploads ? 'Refreshing…' : 'Refresh list'}
                    </button>

                    <ul style={{ marginTop: 8, maxHeight: 180, overflowY: 'auto', paddingLeft: 16 }}>
                    {uploads.length === 0 ? (
                      <li style={{ color: '#6b7280' }}>No uploads yet.</li>
                    ) : (
                      uploads.map((item) => (
                        <li key={item.path} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ flex: 1 }}>
                            {item.path.split('/').pop()} — {item.size ?? 0} bytes
                          </span>
                          <button
                            onClick={async () => {
                              try {
                                const { url } = await getUrl({
                                  path: item.path,
                                  options: { expiresIn: 300 }, // 5 minutes
                                });
                                window.open(url.toString(), '_blank', 'noopener,noreferrer');
                              } catch (e) {
                                console.error('getUrl failed:', e);
                                alert('Could not open file.');
                              }
                            }}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              border: '1px solid #222',
                              background: '#f4f4f5',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Open
                          </button>
                        </li>
                      ))
                    )}
                    </ul>

                  </div>


                  <button
                    onClick={() => {


                      // uploads tab state
                      setDocFile(null);
                      setUploads([]);
                      setUploading(false);
                      setUploadPct(0);

                      // profile state
                      setSavedToast(false);
                      setSaving(false);
                      setLastUpdated('');
                      setProfileId('');
                      setFirstName('');
                      setLastName('');
                      setEmail('');
                      setPhone('');
                      setCompany('');
                      setBillingAddress1('');
                      setBillingAddress2('');
                      setBillingCity('');
                      setBillingState('');
                      setBillingZip('');
                      setBillingCountry('');

                      // 2) LocalStorage wipe (belt & suspenders)
                      [
                        'profileOwner','profileId','firstName','lastName','email','phone','organization',
                        'billingAddress1','billingAddress2','billingCity','billingState','billingZip','billingCountry'
                      ].forEach((k) => localStorage.removeItem(k));

                      // 3) End Cognito session
                      signOut();
                    }}
                    style={{
                      marginTop: 8,
                      marginLeft: 8,
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: '1px solid #222',
                      background: '#90d6e9',
                      color: '#111',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                  Sign out
                  </button>

                </div>
              )}




            </main>
          );
        }}
      </Authenticator>
    </div>
  );
}
