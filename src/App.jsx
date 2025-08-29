// src/App.jsx
import { Authenticator, View, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function App() {
  return (
    <div className="auth-shell">
      {/* “Accidental” watermark in the corner */}
      <img className="brand-watermark" src="/company.png" alt="" width={128} height={128} />



      <Authenticator
        style={{ width: '100%', maxWidth: 420 }} // keeps the card nicely narrow
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
            <button onClick={signOut}>Sign out</button>
          </main>
        )}
      </Authenticator>
    </div>
  );
}
