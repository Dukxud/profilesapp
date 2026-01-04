// src/App.jsx
import { useState, useEffect, useRef } from 'react';
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

const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Arabic',
];

const IDLE_MINS = 5;
const WARN_MINS = 1;
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
  const [language, setLanguage] = useState('English');
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
    'language',
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
    setLanguage('English');
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
    setLanguage(latest.language ?? 'English')
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
              case 'language':
                setLanguage(value);
                break;
              default:
                break;
            }
          };

          const handleSaveProfile = async () => {
            if (saving) return;
            setSaving(true);

            try {
              // Derive email from Cognito / state
              const cognitoEmail =
                user?.attributes?.email ??
                user?.signInDetails?.loginId ??
                user?.username ??
                email;

              const clean = (val) => (val ?? '').toString().trim();

              const { identityId } = await fetchAuthSession();

              // 🔑 ONLY send fields that exist on Profile in resource.ts
              const payload = {
                firstName: clean(firstName),
                lastName: clean(lastName),
                email: clean(cognitoEmail),
                phone: clean(phone),
                organization: clean(organization),
                language: clean(language || 'English') || 'English',
                identityId,
                // portNum, IPAddress, macAddress, etc. can be added later *if* you actually use them
              };

              const result = profileId
                ? await client.models.Profile.update(
                  { id: profileId, ...payload },
                  { authMode: 'userPool' }
                )
                : await client.models.Profile.create(
                  payload,
                  { authMode: 'userPool' }
                );

              // If GraphQL barfs, it’ll show up here instead of “data.id null”
              if (result?.errors?.length) {
                console.error('Profile save GraphQL errors:', result.errors);
                throw new Error(result.errors[0].message || 'Failed to save profile');
              }

              const saved = result?.data;
              if (!saved) {
                throw new Error('Profile save returned no data');
              }

              setProfileId(saved.id);
              setLastUpdated(
                saved.updatedAt || saved.createdAt || new Date().toISOString()
              );

              await loadLatest();
              setSavedToast(true);
              setTimeout(() => setSavedToast(false), 3000);
            } catch (err) {
              console.error('Save profile failed:', err);
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
                <AutoSignOutOnIdle
                  user={user}
                  onSignOut={handleSignOut}
                  idleMs={IDLE_MINS * 60 * 1000}
                  warnMs={WARN_MINS * 60 * 1000}
                />

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
                    language={language}
                    languageOptions={LANGUAGE_OPTIONS}
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

function AutoSignOutOnIdle({
  user,
  onSignOut,
  idleMs = IDLE_MINS * 60 * 1000,
  warnMs = WARN_MINS * 60 * 1000,
}) {
  const logoutTimerRef = useRef(null);
  const warnTimerRef = useRef(null);
  const tickRef = useRef(null);
  const deadlineRef = useRef(0);

  const [showWarn, setShowWarn] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!user) return;

    const clearAll = () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
      logoutTimerRef.current = null;
      warnTimerRef.current = null;
      tickRef.current = null;
    };

    const updateCountdown = () => {
      const msLeft = Math.max(0, deadlineRef.current - Date.now());
      setSecondsLeft(Math.ceil(msLeft / 1000));
    };

    const resetTimer = () => {
      clearAll();
      setShowWarn(false);
      setSecondsLeft(0);

      deadlineRef.current = Date.now() + idleMs;

      // Schedule warning bubble
      const warnDelay = Math.max(0, idleMs - warnMs);
      warnTimerRef.current = setTimeout(() => {
        setShowWarn(true);
        updateCountdown();
        tickRef.current = setInterval(updateCountdown, 250);
      }, warnDelay);

      // Schedule actual sign-out
      logoutTimerRef.current = setTimeout(() => {
        clearAll();
        setShowWarn(false);
        onSignOut();
      }, idleMs);
    };

    // Treat these as “activity”
    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'pointerdown',
      'wheel',
    ];

    events.forEach((evt) =>
      window.addEventListener(evt, resetTimer, { passive: true })
    );

    // When they come back to the tab, restart the timer
    const onVisibility = () => {
      if (document.visibilityState === 'visible') resetTimer();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Start timer immediately on login
    resetTimer();

    return () => {
      clearAll();
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [user?.attributes?.sub, user?.userId, user?.username, idleMs, warnMs, onSignOut]);

  if (!showWarn) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 9999,
        maxWidth: 340,
        background: '#0f172a',
        color: '#fff',
        padding: '12px 14px',
        borderRadius: 12,
        boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 6 }}>
        You’re about to be signed out 😴
      </div>
      <div style={{ opacity: 0.9, lineHeight: 1.3 }}>
        AFK timeout in <b>{secondsLeft}s</b>. Move your mouse / press a key to stay signed in.
      </div>
    </div>
  );
}

