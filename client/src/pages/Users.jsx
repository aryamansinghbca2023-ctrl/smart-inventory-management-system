import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const ROLES = ['Admin', 'Manager', 'Employee'];

const Users = () => {
  const { users, addUser, updateUser, toggleUserStatus } = useInventory();
  const { user: me } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'Employee', password: '', confirmPassword: '', status: 'Active' });
  const [errors, setErrors] = useState({});

  const openAdd = () => { setEditId(null); setForm({ name: '', email: '', role: 'Employee', password: '', confirmPassword: '', status: 'Active' }); setErrors({}); setShowModal(true); };
  const openEdit = (u) => { setEditId(u.id); setForm({ name: u.name, email: u.email, role: u.role, password: '', confirmPassword: '', status: u.status }); setErrors({}); setShowModal(true); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!editId && !form.password) e.password = 'Required';
    if (form.password && form.password !== form.confirmPassword) e.confirmPassword = 'Passwords must match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editId) {
      const updates = { name: form.name, email: form.email, role: form.role, status: form.status };
      if (form.password) updates.password = form.password;
      updateUser(editId, updates);
    } else {
      addUser({ ...form });
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users ({users.length})</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
      </div>
      <div className="table-container">
        <table><thead><tr><th>Avatar</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
          <tbody>{users.map(u => (
            <tr key={u.id}>
              <td><div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #0099cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'white' }}>{u.avatar}</div></td>
              <td style={{ fontWeight: 500 }}>{u.name}</td>
              <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
              <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
              <td>
                <span className={`status-pill ${u.status === 'Active' ? 'active' : 'inactive'}`}
                  onClick={() => toggleUserStatus(u.id)}>
                  {u.status === 'Active' ? '● Active' : '● Inactive'}
                </span>
              </td>
              <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{u.lastLogin}</td>
              <td><button className="btn-icon" onClick={() => openEdit(u)} title="Edit">✏️</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit User' : 'Add User'}>
        <div className="form-row">
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>
          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <label>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
            <label>Password{editId ? ' (leave blank to keep)' : ''}</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>
          <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
            <label>Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Update' : 'Create User'}</button>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
