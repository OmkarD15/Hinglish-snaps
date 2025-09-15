import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// ✅ FIX: Import AuthProvider from the new, combined context file
import { AuthProvider } from "/Users/ovdah/Desktop/Endinews/server/frontend/src/store/authcontext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);