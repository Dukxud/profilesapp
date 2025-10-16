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
            <h1>Welcome {user?.username}</h1>
            
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

            <button
              style={{ marginTop: 8 }}
              disabled={!firstName.trim() || !lastName.trim()}
              onClick={() => { 
                localStorage.setItem('firstName', firstName.trim()); 
                localStorage.setItem('lastName', lastName.trim());
                localStorage.setItem('email', email.trim());
                
                if (organization.trim()) {
                  localStorage.setItem('organization', organization.trim());
                } else {
                  localStorage.removeItem('organization');
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
