// src/App.jsx
import { Authenticator, View, Heading, TextField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function App() {
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
            <TextField label="First name" placeholder="e.g., Ada" width="280px" />
            <div style={{ marginTop: 8 }}>Profile setup coming soon…</div>

            <button onClick={signOut}>Sign out</button>
          </main>
        )}
      </Authenticator>
    </div>
  );
}
