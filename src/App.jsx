// src/App.jsx
import { useState, useEffect, useMemo } from 'react';
import { Authenticator, View, Heading, TextField, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';


export default function App() {
  const client = generateClient();
  const authUser = undefined; // temp: avoid useAuthenticator outside provider

  const [firstName, setFirstName] = useState(() => localStorage.getItem('firstName') || '');
  const [lastName, setLastName] = useState(() => localStorage.getItem('lastName') || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(() => localStorage.getItem('phone') || '');
  const [organization, setCompany] = useState(() => localStorage.getItem('organization') || '');
  const [billingAddress1, setBillingAddress1] = useState(() => localStorage.getItem('billingAddress1') || '');
  const [billingAddress2, setBillingAddress2] = useState(() => localStorage.getItem('billingAddress2') || '');
  const [billingCity, setBillingCity] = useState(() => localStorage.getItem('billingCity') || '');
  const [billingState, setBillingState] = useState(() => localStorage.getItem('billingState') || '');
  const [billingZip, setBillingZip] = useState(() => localStorage.getItem('billingZip') || '');
  const [billingCountry, setBillingCountry] = useState(() => localStorage.getItem('billingCountry') || '');
  const [profileId, setProfileId] = useState(() => localStorage.getItem('profileId') || '');


  async function loadLatest() {
    const { data } = await client.models.Profile.list({ authMode: 'userPool' });
    const p = data.at(-1);
    if (!p) return;
  
    setProfileId(p.id);
    setFirstName(p.firstName ?? '');
    setLastName(p.lastName ?? '');
    setPhone(p.phone ?? '');
    setCompany(p.organization ?? '');
    setBillingAddress1(p.billingAddress1 ?? '');
    setBillingAddress2(p.billingAddress2 ?? '');
    setBillingCity(p.billingCity ?? '');
    setBillingState(p.billingState ?? '');
    setBillingZip(p.billingZip ?? '');
    setBillingCountry(p.billingCountry ?? '');
  }

  const AutoLoad = useMemo(
    () =>
      function AutoLoad({ user }) {
        useEffect(() => {
          if (!user) return;
          let cancelled = false;
          (async () => {
            try {
              const { data } = await client.models.Profile.list({ authMode: 'userPool' });
              const p = data.at(-1);
              if (!p || cancelled) return;
              setProfileId(p.id);
              setFirstName(p.firstName ?? '');
              setLastName(p.lastName ?? '');
              setPhone(p.phone ?? '');
              setCompany(p.organization ?? '');
              setBillingAddress1(p.billingAddress1 ?? '');
              setBillingAddress2(p.billingAddress2 ?? '');
              setBillingCity(p.billingCity ?? '');
              setBillingState(p.billingState ?? '');
              setBillingZip(p.billingZip ?? '');
              setBillingCountry(p.billingCountry ?? '');
            } catch (e) {
              console.error('auto-load profile failed', e);
            }
          })();
          return () => {
            cancelled = true;
          };
        }, [user?.userId]);
        return null;
      },
    []
  );

  return (
    <div className="auth-shell">
      {/* “Accidental” watermark in the corner */}
      <img className="brand-watermark" src="/company.png" alt="" width={128} height={128} />

      <Authenticator
        style={{ width: '100%', maxWidth: 420 }}
        components={{
          Header() {
            return (
              <View textAlign="center" padding="medium">
                <Heading level={3} marginTop="0.25rem">
                  Project: SPARTA
                </Heading>
              </View>
            );
          },
        }}
      >
        {({ user, signOut }) => (
          <main className="app-authed">
            <AutoLoad user={user} />
            <h1>Welcome {firstName}</h1>

            <h2 style={{ marginTop: 24, marginBottom: 8 }}>Personal Information</h2>

            <TextField
              label="First name"
              placeholder="e.g., Ada"
              width="280px"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              isRequired
            />

            <TextField
              label="Last name"
              placeholder="e.g., Lovelace"
              width="280px"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              isRequired
            />

            <TextField
              label="Organization (optional)"
              placeholder="e.g., Acme Corp"
              width="280px"
              value={organization}
              onChange={(e) => setCompany(e.target.value)}
            />

            <TextField
              label="Email Address"
              placeholder="e.g., JohnDoe@gmail.com"
              width="280px"
              value={user?.attributes?.email ?? user?.signInDetails?.loginId ?? user?.username ?? email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              isReadOnly
            />

            <TextField
              label="Phone"
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





            <button
              style={{ marginTop: 8 }}
              disabled={!firstName.trim() || !lastName.trim() || !phone.trim()}

              onClick={async () => {
                localStorage.setItem('firstName', firstName.trim());
                localStorage.setItem('lastName', lastName.trim());
                localStorage.setItem('email', email.trim());
                localStorage.setItem('phone', phone.trim());
                localStorage.setItem('billingAddress1', billingAddress1.trim());
                localStorage.setItem('billingCity', billingCity.trim());
                localStorage.setItem('billingState', billingState.trim());
                localStorage.setItem('billingZip', billingZip.trim());
                localStorage.setItem('billingCountry', billingCountry.trim());

                if (organization.trim()) {
                  localStorage.setItem('organization', organization.trim());
                } else {
                  localStorage.removeItem('organization');
                }

                if (billingAddress2.trim()) {
                  localStorage.setItem('billingAddress2', billingAddress2.trim());
                } else {
                  localStorage.removeItem('billingAddress2');
                }

                // replace your current upsert line with this block
                const cognitoEmail = (
                  user?.attributes?.email ??
                  user?.signInDetails?.loginId ??
                  user?.username ??
                  email
                ).toString().trim();

                // empty → null (clears in DB)
                const nn = (s) => (s.trim() === '' ? null : s.trim());

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
                };

                const { data } = profileId
                  ? await client.models.Profile.update({ id: profileId, ...payload }, { authMode: 'userPool' })
                  : await client.models.Profile.create(payload, { authMode: 'userPool' });

                setProfileId(data.id);
                localStorage.setItem('profileId', data.id);
                await loadLatest();

              }}
            >
              Save profile
            </button>

            {/* <button style={{ marginTop: 8 }} onClick={async () => {
              const { data: profiles } = await client.models.Profile.list(); const p = profiles?.at(-1); if (!p) return;
              setProfileId(p.id);
              setFirstName(p.firstName ?? '');
              setLastName(p.lastName ?? '');
              setEmail(p.email ?? '');
              setPhone(p.phone ?? '');
              setCompany(p.organization ?? '');
              setBillingAddress1(p.billingAddress1 ?? '');
              setBillingAddress2(p.billingAddress2 ?? '');
              setBillingCity(p.billingCity ?? '');
              setBillingState(p.billingState ?? '');
              setBillingZip(p.billingZip ?? '');
              setBillingCountry(p.billingCountry ?? '');
            }}
            >Load from backend</button> */}

            {/* <button
              style={{ marginTop: 8 }}
              onClick={async () => {
                alert('clicked');
                const listFn = client?.models?.Profile?.list;
                if (!listFn) { alert('Profile.list is undefined — outputs/model not available'); return; }
                try {
                  const { data } = await listFn({ authMode: 'userPool' });
                  console.log('Profiles:', data);
                  alert(`Profiles in backend: ${data.length}`);
                } catch (e) {
                  console.error(e);
                  alert('Error: ' + (e?.errors?.[0]?.message || e.message || 'unknown'));
                }
              }}
            >
              Debug: count profiles
            </button> */}

            {/* <button
              style={{ marginTop: 8 }}
              onClick={() => alert('models: ' + (Object.keys(client?.models || {}).join(', ') || 'none'))}
            >
              Debug: models
            </button> */}

            {/* <button
              style={{ marginTop: 8 }}
              onClick={async () => {
                const { data } = await client.models.Profile.list({ authMode: 'userPool' });
                const p = data.at(-1);
                alert(p ? JSON.stringify(p, null, 2) : 'No profile found');
              }}
            >
              Debug: view backend profile
            </button> */}


            <button onClick={signOut}>Sign out</button>
          </main>
        )}
      </Authenticator>
    </div>
  );
}
