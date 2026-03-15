import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './context/ToastContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <SettingsProvider>
        <AuthProvider>
          <InventoryProvider>
            <App />
          </InventoryProvider>
        </AuthProvider>
      </SettingsProvider>
    </ToastProvider>
  </React.StrictMode>
);
