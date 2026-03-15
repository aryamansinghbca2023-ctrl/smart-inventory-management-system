import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useToast } from './ToastContext';
import { apiFetch } from '../utils/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('invora_token');
      if (!token) {
        setInitialLoading(false);
        return;
      }
      try {
        const res = await apiFetch('/auth/me');
        if (res.success && res.user) {
          const u = res.user;
          setUser({
            id: u._id, name: u.name, email: u.email, 
            role: u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase(),
            avatar: u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
          });
        }
      } catch (err) {
        localStorage.removeItem('invora_token');
      }
      setInitialLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.success) {
        localStorage.setItem('invora_token', res.token);
        const transformedUser = {
          ...res.user,
          role: res.user.role.charAt(0).toUpperCase() + res.user.role.slice(1).toLowerCase()
        };
        setUser(transformedUser);
        toast.success(`Welcome back, ${res.user.name}!`);
        setLoading(false);
        return transformedUser;
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Login failed');
      throw err;
    }
  }, [toast]);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {}
    localStorage.removeItem('invora_token');
    setUser(null);
    toast.info('Logged out successfully');
  }, [toast]);

  const getRoleFromEmail = (email) => {
    if (email.includes('admin')) return 'Admin';
    if (email.includes('manager')) return 'Manager';
    if (email.includes('emp')) return 'Employee';
    return '';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getRoleFromEmail }}>
      {!initialLoading && children}
    </AuthContext.Provider>
  );
};
