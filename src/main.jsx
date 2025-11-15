import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import outputs from './amplifyOutputs';
import App from './App.jsx';
import './index.css';

Amplify.configure(outputs);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
