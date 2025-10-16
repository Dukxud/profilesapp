// src/App.jsx
import { useState } from 'react';
import { Authenticator, View, Heading, TextField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function App() {
  const [firstName, setFirstName] = useState(() => localStorage.getItem('firstName') || '');
  const [lastName, setLastName] = useState(() => localStorage.getItem('lastName') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('email') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('phone') || '');
  const [organization, setCompany] = useState(() => localStorage.getItem('organization') || '');
  const [billingAddress1, setBillingAddress1] = useState(() => localStorage.getItem('billingAddress1') || '');
  const [billingAddress2, setBillingAddress2] = useState(() => localStorage.getItem('billingAddress2') || '');
  const [billingCity, setBillingCity] = useState(() => localStorage.getItem('billingCity') || '');
  const [billingState, setBillingState] = useState(() => localStorage.getItem('billingState') || '');
  const [billingZip, setBillingZip] = useState(() => localStorage.getItem('billingZip') || '');
  const [billingCountry, setBillingCountry] = useState(() => localStorage.getItem('billingCountry') || '');


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
            <h1>Welcome {firstName}</h1>
            
            <h2 style={{ marginTop: 24, marginBottom: 8 }}>Personal information</h2>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
              />
              
              <TextField
                label="Phone"
                placeholder="e.g., 123-456-7890"
                width="280px"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                isRequired
              />

            <h2 style={{ marginTop: 24, marginBottom: 8 }}>Billing information</h2>


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

            <button
              style={{ marginTop: 8 }}
              disabled={!firstName.trim() || !lastName.trim()}
              onClick={() => { 
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

              }}
            >
              Save profile
            </button>

            <button onClick={signOut}>Sign out</button>
          </main>
        )}
      </Authenticator>
    </div>
  );
}
