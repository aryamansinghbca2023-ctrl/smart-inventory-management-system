import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Inventory from './pages/products/Inventory';
import Categories from './pages/Categories';
import StockRequests from './pages/StockRequests';
import Users from './pages/Users';
import Reports from './pages/Reports';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';

const AppRoutes = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Routes>
        <Route path="/" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute module="inventory"><Inventory globalSearch={searchQuery} /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute module="categories"><Categories /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute module="requests"><StockRequests /></ProtectedRoute>} />
        <Route path="/myrequests" element={<ProtectedRoute module="myrequests"><StockRequests myOnly /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute module="users"><Users /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute module="reports"><Reports /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute module="audit"><AuditLog /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute module="settings"><Settings /></ProtectedRoute>} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
