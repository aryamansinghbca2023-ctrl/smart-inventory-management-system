import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from './ToastContext';

const SettingsContext = createContext();
export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    companyName: 'INVORA Inc.',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    lowStockThreshold: 10,
    skuPrefix: 'SKU-',
    itemsPerPage: 10,
    emailLowStock: true,
    emailNewRequests: true,
    emailDailySummary: false,
  });
  
  const toast = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiFetch('/settings');
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (patch) => {
    const updated = { ...settings, ...patch };
    setSettings(updated); // Optimistic UI update
    
    try {
      const res = await apiFetch('/settings', {
        method: 'PUT',
        body: JSON.stringify(patch)
      });
      if (res.success) {
        setSettings(res.settings);
        toast.success('Settings saved successfully');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update settings');
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
