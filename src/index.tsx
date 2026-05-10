import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

/**
 * Inner component that bridges AuthContext and DataContext.
 * DataProvider needs loggedInUser and error/success callbacks from AuthContext.
 */
const AppWithProviders: React.FC = () => {
  const auth = useAuth();

  return (
    <DataProvider
      loggedInUser={auth.loggedInUser}
      onError={(msg) => {
        auth.setError(msg);
        auth.setIsErrorModalOpen(true);
      }}
      onSuccess={(msg) => {
        auth.setSuccessMessage(msg);
        if (msg) {
          setTimeout(() => auth.setSuccessMessage(null), 5000);
        }
      }}
    >
      <App />
    </DataProvider>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AppWithProviders />
    </AuthProvider>
  </React.StrictMode>
);
