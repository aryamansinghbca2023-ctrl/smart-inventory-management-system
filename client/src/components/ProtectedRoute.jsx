import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useEffect, useRef } from 'react';

const ROLE_PERMISSIONS = {
  Admin:    ['dashboard','inventory','categories','requests','users','reports','audit','settings'],
  Manager:  ['dashboard','inventory','categories','requests','reports'],
  Employee: ['dashboard','inventory','myrequests'],
};

const ProtectedRoute = ({ children, module }) => {
  const { user } = useAuth();
  const toast = useToast();
  const warned = useRef(false);

  useEffect(() => { warned.current = false; }, [module]);

  if (!user) return <Navigate to="/login" replace />;

  const allowed = ROLE_PERMISSIONS[user.role] || [];
  if (module && !allowed.includes(module)) {
    if (!warned.current) { warned.current = true; toast.error('Access Denied — Insufficient permissions'); }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
export { ROLE_PERMISSIONS };
