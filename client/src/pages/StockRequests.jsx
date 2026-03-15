import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const StockRequests = ({ myOnly = false }) => {
  const { requests, items, approveRequest, rejectRequest, addRequest } = useInventory();
  const { user } = useAuth();
  const canApprove = ['Admin', 'Manager'].includes(user?.role);
  const [tab, setTab] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [showApprove, setShowApprove] = useState(null);
  const [showReject, setShowReject] = useState(null);
  const [approveNote, setApproveNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [form, setForm] = useState({ itemId: '', qty: '', reason: '' });
  const [formErrors, setFormErrors] = useState({});

  const list = myOnly ? requests.filter(r => r.requestedBy === user?.id) : requests;
  const filtered = tab === 'All' ? list : list.filter(r => r.status === tab);

  const handleAddSubmit = () => {
    const e = {};
    if (!form.itemId) e.itemId = 'Select an item';
    if (!form.qty || Number(form.qty) < 1) e.qty = 'Min 1';
    if (!form.reason.trim()) e.reason = 'Required';
    setFormErrors(e);
    if (Object.keys(e).length) return;
    const item = items.find(i => i.id === form.itemId);
    addRequest({ itemId: form.itemId, itemName: item?.name || '', requestedBy: user.id, requesterName: user.name, qty: Number(form.qty), reason: form.reason });
    setShowAdd(false);
    setForm({ itemId: '', qty: '', reason: '' });
  };

  const handleApprove = () => { approveRequest(showApprove, approveNote); setShowApprove(null); setApproveNote(''); };
  const handleReject = () => {
    if (!rejectNote.trim()) { setRejectError('Reason is required'); return; }
    rejectRequest(showReject, rejectNote); setShowReject(null); setRejectNote(''); setRejectError('');
  };

  return (
    <div>
      <div className="page-header">
        <h1>{myOnly ? 'My Requests' : 'Stock Requests'}</h1>
        <button className="btn btn-primary" onClick={() => { setFormErrors({}); setShowAdd(true); }}>+ New Request</button>
      </div>
      <div className="tabs">
        {['All', 'Pending', 'Approved', 'Rejected'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t} {t !== 'All' && `(${(tab === 'All' ? list : list).filter(r => r.status === t).length})`}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🔄</div><h3>No requests</h3><p>{tab === 'All' ? 'No requests yet' : `No ${tab.toLowerCase()} requests`}</p></div>
      ) : (
        <div className="table-container">
          <table><thead><tr><th>#</th><th>Item</th><th>Requested By</th><th>Qty</th><th>Reason</th><th>Date</th><th>Status</th>{canApprove && <th>Actions</th>}</tr></thead>
            <tbody>{filtered.map((r, i) => (
              <tr key={r.id}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ fontWeight: 500 }}>{r.itemName}</td>
                <td>{r.requesterName}</td>
                <td>{r.qty}</td>
                <td style={{ maxWidth: 200, whiteSpace: 'normal', fontSize: 12, color: 'var(--text-secondary)' }}>{r.reason}</td>
                <td>{r.date}</td>
                <td><span className={`badge ${r.status === 'Approved' ? 'badge-success' : r.status === 'Rejected' ? 'badge-danger' : 'badge-warning'}`}>{r.status}</span></td>
                {canApprove && <td><div className="table-actions">
                  {r.status === 'Pending' && <>
                    <button className="btn btn-sm btn-primary" onClick={() => { setApproveNote(''); setShowApprove(r.id); }}>✓</button>
                    <button className="btn btn-sm btn-danger" onClick={() => { setRejectNote(''); setRejectError(''); setShowReject(r.id); }}>✕</button>
                  </>}
                  {r.note && <span style={{ fontSize: 11, color: 'var(--text-muted)' }} title={r.note}>📝</span>}
                </div></td>}
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* New Request Modal */}
      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="Raise Stock Request" size="sm">
        <div className={`form-group ${formErrors.itemId ? 'has-error' : ''}`}>
          <label>Select Item</label>
          <select value={form.itemId} onChange={e => setForm({ ...form, itemId: e.target.value })}>
            <option value="">Choose an item</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.category})</option>)}
          </select>
          {formErrors.itemId && <div className="error-text">{formErrors.itemId}</div>}
        </div>
        <div className={`form-group ${formErrors.qty ? 'has-error' : ''}`}>
          <label>Quantity Needed</label>
          <input type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />
          {formErrors.qty && <div className="error-text">{formErrors.qty}</div>}
        </div>
        <div className={`form-group ${formErrors.reason ? 'has-error' : ''}`}>
          <label>Reason</label>
          <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Why do you need this?" />
          {formErrors.reason && <div className="error-text">{formErrors.reason}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAddSubmit}>Submit</button>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal show={!!showApprove} onClose={() => setShowApprove(null)} title="Approve Request" size="sm">
        <div className="form-group"><label>Note (optional)</label><textarea value={approveNote} onChange={e => setApproveNote(e.target.value)} placeholder="Optional approval note" /></div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowApprove(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleApprove}>Approve</button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal show={!!showReject} onClose={() => setShowReject(null)} title="Reject Request" size="sm">
        <div className={`form-group ${rejectError ? 'has-error' : ''}`}>
          <label>Rejection Reason (required)</label>
          <textarea value={rejectNote} onChange={e => { setRejectNote(e.target.value); setRejectError(''); }} placeholder="Why is this rejected?" />
          {rejectError && <div className="error-text">{rejectError}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowReject(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleReject}>Reject</button>
        </div>
      </Modal>
    </div>
  );
};

export default StockRequests;
