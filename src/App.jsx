// src/App.jsx
import { useState, useEffect } from 'react';
import { Authenticator, View, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import { list, uploadData, getUrl } from 'aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';

import ProfileTab from './ProfileTab';
import UploadsTab from './UploadsTab';
import VPNClientTab from './VPNClientTab';
import BillingTab from './BillingTab';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'aiSecurity', label: 'AI Security' },
  { id: 'vpnClient', label: 'VPN Client' },
  { id: 'billing', label: 'Billing' },
];

const TERMS_VERSION = '2025-11-18-v1';
const TERMS_STORAGE_KEY = 'aivault_terms_version';

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
  const [downloadingVpn, setDownloadingVpn] = useState(false);


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
    if (activeTab === 'aiSecurity') {
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

  const handleDownloadVpnClient = async () => {
    if (downloadingVpn) return;

    setDownloadingVpn(true);
    try {
      const { url } = await getUrl({
        path: 'downloads/vpn-client-installer.msi',
        options: {
          // Strong hint: treat as file download, not inline view
          contentDisposition: 'attachment; filename="vpn-client-installer.msi"',
        },
      });

      const link = document.createElement('a');
      link.href = url.toString();
      link.download = 'vpn-client-installer.exe';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('VPN client download failed', err);
      alert('Could not start VPN client download. Please try again.');
    } finally {
      setDownloadingVpn(false);
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
                  AI Vault
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

          const handleUserChange = (nextUser) => {
            setActiveTab('profile');
            resetUploadsState();
            resetProfileState();
            clearProfileStorage();
            setEmail(deriveUserEmail(nextUser));

            loadLatest().catch((e) =>
              console.error('auto-load profile failed', e)
            );
          };

          return (
            <>
              <main className="app-authed">
                <AutoLoad user={user} onUserChange={handleUserChange} />

                <nav
                  role="tablist"
                  aria-label="Profile sections"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: 4,
                    marginBottom: 12,
                  }}
                >
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          padding: '6px 10px',
                          fontWeight: 600,
                          background: 'transparent',
                          border: 'none',
                          borderBottom: isActive
                            ? '2px solid #0f766e'
                            : '2px solid transparent',
                          color: isActive ? '#0f172a' : '#6b7280',
                          cursor: 'pointer',
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>



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

                {activeTab === 'aiSecurity' && (
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

                {activeTab === 'vpnClient' && (
                  <VPNClientTab
                    downloading={downloadingVpn}
                    onDownload={handleDownloadVpnClient}
                    onSignOut={handleSignOut}
                  />
                )}

                {activeTab === 'billing' && (
                  <BillingTab
                    email={
                      user?.attributes?.email ??
                      user?.signInDetails?.loginId ??
                      user?.username ??
                      email
                    }
                    onSignOut={handleSignOut}
                  />
                )}

              <footer className="app-footer">
                <span>© {new Date().getFullYear()} AIVault</span>

                <span>
                  <a
                    href="/terms.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms &amp; Conditions
                  </a>
                  {' · '}
                  <a
                    href="/privacy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </span>
              </footer>

              </main>
            </>
          );
        }}
      </Authenticator>
    </div>
  );
}

function AutoLoad({ user, onUserChange }) {
  useEffect(() => {
    if (!user) return;
    onUserChange(user);
  }, [user?.attributes?.sub, user?.userId, user?.username]);

  return null;
}

