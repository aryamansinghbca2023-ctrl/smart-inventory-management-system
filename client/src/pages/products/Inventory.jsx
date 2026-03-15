import { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { genSKU } from '../../data/mockData';

const EMPTY = { name: '', category: '', sku: '', quantity: '', price: '', supplier: '', description: '' };

const Inventory = ({ globalSearch }) => {
  const { items, categories, addItem, updateItem, deleteItem, deleteItems } = useInventory();
  const { settings } = useSettings();
  const { user } = useAuth();
  const canEdit = ['Admin', 'Manager'].includes(user?.role);
  const th = settings.lowStockThreshold;
  const perPage = settings.itemsPerPage;

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const q = globalSearch || search;

  const getStatus = (qty) => qty === 0 ? 'Out of Stock' : qty <= th ? 'Low Stock' : 'In Stock';

  const filtered = useMemo(() => {
    let list = [...items];
    if (q) list = list.filter(i => i.name.toLowerCase().includes(q.toLowerCase()) || i.sku.toLowerCase().includes(q.toLowerCase()));
    if (filterCat) list = list.filter(i => i.category === filterCat);
    if (filterStatus) list = list.filter(i => getStatus(i.quantity) === filterStatus);
    list.sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [items, q, filterCat, filterStatus, sortCol, sortDir, th]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const openAdd = () => { setEditId(null); setForm({ ...EMPTY, category: categories[0]?.name || '' }); setErrors({}); setShowModal(true); };
  const openEdit = (item) => { setEditId(item.id); setForm({ name: item.name, category: item.category, sku: item.sku, quantity: String(item.quantity), price: String(item.price), supplier: item.supplier, description: item.description || '' }); setErrors({}); setShowModal(true); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.category) e.category = 'Required';
    if (!form.sku.trim()) e.sku = 'Required';
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Valid number required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid number required';
    if (!form.supplier.trim()) e.supplier = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = { ...form, quantity: Number(form.quantity), price: Number(form.price) };
    if (editId) updateItem(editId, data);
    else addItem(data);
    setShowModal(false);
  };

  const handleDelete = () => { deleteItem(confirmDel); setConfirmDel(null); };
  const handleBulkDelete = () => { deleteItems(selected); setSelected([]); setConfirmBulk(false); };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const toggleAll = () => {
    const pageIds = paged.map(i => i.id);
    const allSel = pageIds.every(id => selected.includes(id));
    setSelected(allSel ? selected.filter(id => !pageIds.includes(id)) : [...new Set([...selected, ...pageIds])]);
  };

  const exportCSV = () => {
    const headers = ['SKU','Name','Category','Quantity','Price','Supplier','Status'];
    const rows = filtered.map(i => [i.sku, i.name, i.category, i.quantity, i.price, i.supplier, getStatus(i.quantity)]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'inventory.csv'; a.click();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Inventory ({filtered.length})</h1>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}>📥 Export CSV</button>
          {canEdit && selected.length > 0 && <button className="btn btn-danger btn-sm" onClick={() => setConfirmBulk(true)}>🗑️ Delete ({selected.length})</button>}
          {canEdit && <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>}
        </div>
      </div>
      <div className="toolbar">
        <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
          <span>🔍</span>
          <input placeholder="Search by name or SKU..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option>In Stock</option><option>Low Stock</option><option>Out of Stock</option>
        </select>
      </div>
      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📦</div><h3>No items found</h3><p>Try adjusting your filters or add a new item</p></div>
        ) : (
        <table>
          <thead><tr>
            {canEdit && <th><div className={`checkbox ${paged.every(i => selected.includes(i.id)) && paged.length > 0 ? 'checked' : ''}`} onClick={toggleAll}>✓</div></th>}
            {[['sku','SKU'],['name','Name'],['category','Category'],['quantity','Qty'],['price','Price (₹)'],['supplier','Supplier']].map(([key, label]) => (
              <th key={key} onClick={() => handleSort(key)}>{label}{sortCol === key && <span className="sort-arrow">{sortDir === 'asc' ? '▲' : '▼'}</span>}</th>
            ))}
            <th>Status</th>
            {canEdit && <th>Actions</th>}
          </tr></thead>
          <tbody>{paged.map(item => {
            const st = getStatus(item.quantity);
            return (
              <tr key={item.id}>
                {canEdit && <td><div className={`checkbox ${selected.includes(item.id) ? 'checked' : ''}`} onClick={() => toggleSelect(item.id)}>✓</div></td>}
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{item.sku}</td>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td><span className="badge badge-gray">{item.category}</span></td>
                <td style={{ fontWeight: 600, color: st === 'Out of Stock' ? 'var(--danger)' : st === 'Low Stock' ? 'var(--warning)' : 'var(--text-primary)' }}>{item.quantity}</td>
                <td>₹{item.price.toLocaleString('en-IN')}</td>
                <td>{item.supplier}</td>
                <td><span className={`badge ${st === 'In Stock' ? 'badge-success' : st === 'Low Stock' ? 'badge-warning' : 'badge-danger'}`}>{st}</span></td>
                {canEdit && <td><div className="table-actions">
                  <button className="btn-icon" onClick={() => openEdit(item)} title="Edit">✏️</button>
                  <button className="btn-icon danger" onClick={() => setConfirmDel(item.id)} title="Delete">🗑️</button>
                </div></td>}
              </tr>
            );
          })}</tbody>
        </table>
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
          <span className="page-info">{filtered.length} items</span>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Item' : 'Add New Item'}>
        <div className="form-row">
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>
          <div className={`form-group ${errors.category ? 'has-error' : ''}`}>
            <label>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="">Select</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            {errors.category && <div className="error-text">{errors.category}</div>}
          </div>
        </div>
        <div className="form-row">
          <div className={`form-group ${errors.sku ? 'has-error' : ''}`}>
            <label>SKU</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} style={{ flex: 1 }} />
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => setForm({ ...form, sku: genSKU(settings.skuPrefix) })}>Auto</button>
            </div>
            {errors.sku && <div className="error-text">{errors.sku}</div>}
          </div>
          <div className={`form-group ${errors.quantity ? 'has-error' : ''}`}>
            <label>Quantity</label><input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
            {errors.quantity && <div className="error-text">{errors.quantity}</div>}
          </div>
        </div>
        <div className="form-row">
          <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
            <label>Unit Price (₹)</label><input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            {errors.price && <div className="error-text">{errors.price}</div>}
          </div>
          <div className={`form-group ${errors.supplier ? 'has-error' : ''}`}>
            <label>Supplier</label><input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
            {errors.supplier && <div className="error-text">{errors.supplier}</div>}
          </div>
        </div>
        <div className="form-group">
          <label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Update' : 'Add Item'}</button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal show={!!confirmDel} onClose={() => setConfirmDel(null)} title="Delete Item" size="sm">
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 8 }}>Are you sure? This cannot be undone.</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setConfirmDel(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>

      {/* Bulk Delete Confirm */}
      <Modal show={confirmBulk} onClose={() => setConfirmBulk(false)} title="Bulk Delete" size="sm">
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Delete {selected.length} selected items? This cannot be undone.</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setConfirmBulk(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleBulkDelete}>Delete All</button>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
