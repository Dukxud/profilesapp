import { useEffect, useMemo, useState } from 'react';
import { Authenticator, View, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import outputs from './amplify_outputs.json';
import { useProfileForm } from './hooks/useProfileForm';
import { useMarketplaceLink } from './hooks/useMarketplaceLink';
import { useUploads } from './hooks/useUploads';
import { AutoLoad } from './components/AutoLoad';
import { ProfileTab } from './components/ProfileTab';
import { UploadsTab } from './components/UploadsTab';
import { TabBar } from './components/TabBar';

export default function App() {
  const client = useMemo(() => generateClient(), []);
  const profile = useProfileForm(client);
  const uploads = useUploads();
  const [activeTab, setActiveTab] = useState('profile');

  const REG_URL = useMemo(
    () =>
      `${(
        outputs.custom?.API?.marketplaceApi?.endpoint ??
        outputs.API?.marketplaceApi?.endpoint ??
        ''
      ).replace(/\/$/, '')}/marketplace/register`,
    []
  );

  useMarketplaceLink({
    client,
    regUrl: REG_URL,
    profileId: profile.profileId,
    onLinked: profile.applyMarketplaceLink,
    reloadProfile: profile.loadLatest,
  });

  useEffect(() => {
    if (activeTab === 'uploads') {
      uploads.refreshUploads();
    }
  }, [activeTab, uploads.refreshUploads]);

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
          const userEmail = (
            user?.attributes?.email ??
            user?.signInDetails?.loginId ??
            user?.username ??
            ''
          ).toString();

          const handleSave = () =>
            profile.saveProfile({ user, fallbackEmail: userEmail });

          const handleSignOut = () => {
            uploads.resetUploads();
            profile.resetForm();
            profile.clearPersistedDraft();
            setActiveTab('profile');
            signOut();
          };

          return (
            <main className="app-authed">
              <AutoLoad
                user={user}
                onReset={() => {
                  setActiveTab('profile');
                  uploads.resetUploads();
                  profile.resetForm();
                }}
                onLoad={profile.loadLatest}
              />

              <TabBar activeTab={activeTab} onSelect={setActiveTab} />

              {activeTab === 'profile' && (
                <ProfileTab
                  form={profile.form}
                  onChange={profile.updateField}
                  userEmail={userEmail}
                  lastUpdated={profile.lastUpdated}
                  isMarketplaceLinked={profile.isMarketplaceLinked}
                  marketProduct={profile.marketProduct}
                  savedToast={profile.savedToast}
                  canSave={profile.canSave}
                  saving={profile.saving}
                  onSave={handleSave}
                  onSignOut={handleSignOut}
                />
              )}

              {activeTab === 'uploads' && (
                <UploadsTab
                  docFile={uploads.docFile}
                  setDocFile={uploads.setDocFile}
                  uploads={uploads.uploads}
                  loadingUploads={uploads.loadingUploads}
                  uploading={uploads.uploading}
                  uploadPct={uploads.uploadPct}
                  onUpload={() =>
                    uploads.uploadDocument({
                      user,
                      profileId: profile.profileId,
                      firstName: profile.form.firstName,
                      lastName: profile.form.lastName,
                    })
                  }
                  onOpen={uploads.openUpload}
                />
              )}
            </main>
          );
        }}
      </Authenticator>
    </div>
  );
}
