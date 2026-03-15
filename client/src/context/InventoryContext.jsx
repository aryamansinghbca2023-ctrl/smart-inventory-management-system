import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const InventoryContext = createContext();
export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [requests, setRequests] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const toast = useToast();

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const promises = [
        apiFetch('/products?limit=1000').catch(() => ({ products: [] })),
        apiFetch('/categories').catch(() => ({ categories: [] })),
        apiFetch('/requests').catch(() => ({ requests: [] }))
      ];

      if (user.role === 'Admin' || user.role === 'Manager') {
        promises.push(apiFetch('/users').catch(() => ({ users: [] })));
      }
      if (user.role === 'Admin') {
        promises.push(apiFetch('/logs?limit=1000').catch(() => ({ logs: [] })));
      }

      const results = await Promise.all(promises);
      const dataProducts = results[0]?.products || [];
      const dataCategories = results[1]?.categories || [];
      const dataRequests = results[2]?.requests || [];
      const dataUsers = results[3]?.users || [];
      const dataLogs = results[4]?.logs || [];

      setItems(dataProducts.map(p => ({
        id: p._id, name: p.name, sku: p.sku, 
        category: p.category?.name || 'Uncategorized', 
        quantity: p.quantity, price: p.unitPrice, 
        supplier: p.supplier, description: p.description
      })));

      setCategories(dataCategories.map(c => ({
        id: c._id, name: c.name, color: c.color, itemCount: c.itemCount
      })));

      setRequests(dataRequests.map(r => ({
        id: r._id, itemName: r.product?.name, qty: r.quantity, 
        note: r.status === 'pending' ? r.reason : r.reviewNote,
        status: r.status === 'pending' ? 'Pending' : r.status === 'approved' ? 'Approved' : 'Rejected',
        date: new Date(r.createdAt).toISOString().slice(0, 10),
        requestedBy: r.requestedBy?._id, requesterName: r.requestedBy?.name
      })));

      if (dataUsers.length > 0) {
        setUsers(dataUsers.map(u => ({
          id: u._id, name: u.name, email: u.email, role: u.role, 
          status: u.status === 'active' ? 'Active' : 'Inactive',
          avatar: u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
          lastLogin: u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'
        })));
      }

      if (dataLogs.length > 0) {
        setAuditLog(dataLogs.map(l => ({
          id: l._id, userId: l.user?._id || l.user, action: l.action, details: l.details,
          userName: l.userName || l.user?.name, role: l.userRole || l.user?.role,
          timestamp: new Date(l.createdAt).toLocaleString(), ip: l.ip
        })));
      }
    } catch (err) {
      toast.error('Failed to sync data with server');
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addLog = useCallback(() => {}, []); // Handled by backend

  // ── INVENTORY ──
  const addItem = useCallback(async (item) => {
    try {
      const cat = categories.find(c => c.name === item.category);
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({ ...item, unitPrice: item.price, category: cat?.id })
      });
      toast.success(`"${item.name}" added to inventory`);
      loadData();
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to add item'); return false;
    }
  }, [categories, loadData, toast]);

  const updateItem = useCallback(async (id, updates) => {
    try {
      let payload = { ...updates };
      if (updates.price !== undefined) payload.unitPrice = updates.price;
      if (updates.category) {
        const cat = categories.find(c => c.name === updates.category);
        if (cat) payload.category = cat.id;
      }
      await apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast.success('Item updated');
      loadData();
    } catch (err) { toast.error(err.message || 'Update failed'); }
  }, [categories, loadData, toast]);

  const deleteItem = useCallback(async (id) => {
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      toast.success('Item deleted');
      loadData();
    } catch (err) { toast.error(err.message); }
  }, [loadData, toast]);

  const deleteItems = useCallback(async (ids) => {
    try {
      await Promise.all(ids.map(id => apiFetch(`/products/${id}`, { method: 'DELETE' })));
      toast.success(`${ids.length} items deleted`);
      loadData();
    } catch (err) { toast.error('Some items could not be deleted natively. They might have requests.'); loadData(); }
  }, [loadData, toast]);

  // ── CATEGORIES ──
  const addCategory = useCallback(async (cat) => {
    try {
      await apiFetch('/categories', { method: 'POST', body: JSON.stringify(cat) });
      toast.success(`Category "${cat.name}" created`);
      loadData();
    } catch(err) { toast.error(err.message); }
  }, [loadData, toast]);

  const updateCategory = useCallback(async (id, updates) => {
    try {
      await apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      toast.success('Category updated');
      loadData();
    } catch(err) { toast.error(err.message); }
  }, [loadData, toast]);

  const deleteCategory = useCallback(async (id) => {
    try {
      await apiFetch(`/categories/${id}`, { method: 'DELETE' });
      toast.success('Category deleted');
      loadData();
      return true;
    } catch(err) { toast.warning(err.message); return false; }
  }, [loadData, toast]);

  // ── STOCK REQUESTS ──
  const addRequest = useCallback(async (req) => {
    try {
      await apiFetch('/requests', { 
        method: 'POST', 
        body: JSON.stringify({ product: req.itemId, quantity: req.qty, reason: req.reason }) 
      });
      toast.success('Stock request submitted');
      loadData();
    } catch(err) { toast.error(err.message); }
  }, [loadData, toast]);

  const approveRequest = useCallback(async (id, note = '') => {
    try {
      await apiFetch(`/requests/${id}/approve`, { method: 'PUT', body: JSON.stringify({ reviewNote: note }) });
      toast.success('Request approved — inventory updated');
      loadData();
    } catch(err) { toast.error(err.message); }
  }, [loadData, toast]);

  const rejectRequest = useCallback(async (id, note) => {
    try {
      await apiFetch(`/requests/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reviewNote: note }) });
      toast.info('Request rejected');
      loadData();
    } catch(err) { toast.error(err.message); }
  }, [loadData, toast]);

  // ── USERS ──
  const addUser = useCallback(async (u) => {
    try {
      const statusPayload = u.status === 'Active' ? 'active' : 'inactive';
      await apiFetch('/users', { method: 'POST', body: JSON.stringify({ ...u, status: statusPayload }) });
      toast.success(`User "${u.name}" created`);
      loadData();
    } catch(err) { toast.error(err.message); }
  }, [loadData, toast]);

  const updateUser = useCallback(async (id, updates) => {
    try {
      let payload = { ...updates };
      if (updates.status) payload.status = updates.status === 'Active' ? 'active' : 'inactive';
      await apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast.success('User updated');
      loadData();
    } catch(err) { toast.error(err.message); }
  }, [loadData, toast]);

  const toggleUserStatus = useCallback(async (id) => {
    try {
      await apiFetch(`/users/${id}/toggle`, { method: 'PATCH' });
      toast.success('User status updated');
      loadData();
    } catch(err) { toast.warning(err.message); }
  }, [loadData, toast]);

  // ── COMPUTED VALUES ──
  const pendingRequestCount = requests.filter(r => r.status === 'Pending').length;
  const getCategoryItemCount = useCallback((catName) => {
    return items.filter(i => i.category === catName).length;
  }, [items]);

  const resetAllData = useCallback(async () => {
    try {
      await apiFetch('/settings/reset', { method: 'POST', body: JSON.stringify({ confirm: 'RESET' }) });
      toast.info('System data reset');
      loadData();
    } catch (err) { toast.error(err.message); }
  }, [loadData, toast]);

  return (
    <InventoryContext.Provider value={{
      items, categories, requests, auditLog, users, loading,
      addItem, updateItem, deleteItem, deleteItems,
      addCategory, updateCategory, deleteCategory,
      addRequest, approveRequest, rejectRequest,
      addUser, updateUser, toggleUserStatus,
      pendingRequestCount, getCategoryItemCount, addLog, resetAllData,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
