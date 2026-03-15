import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import Modal from '../components/Modal';
import { CATEGORY_COLORS } from '../data/mockData';

const Categories = () => {
  const { categories, items, addCategory, updateCategory, deleteCategory } = useInventory();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [error, setError] = useState('');

  const openAdd = () => { setEditId(null); setName(''); setColor(CATEGORY_COLORS[0]); setError(''); setShowModal(true); };
  const openEdit = (cat) => { setEditId(cat.id); setName(cat.name); setColor(cat.color); setError(''); setShowModal(true); };

  const handleSave = () => {
    if (!name.trim()) { setError('Name is required'); return; }
    if (editId) updateCategory(editId, { name: name.trim(), color });
    else addCategory({ name: name.trim(), color });
    setShowModal(false);
  };

  const getCount = (catName) => items.filter(i => i.category === catName).length;

  return (
    <div>
      <div className="page-header">
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Category</button>
      </div>
      {categories.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📁</div><h3>No categories</h3><p>Create your first category</p></div>
      ) : (
        <div className="category-grid">
          {categories.map(cat => (
            <div className="category-card" key={cat.id}>
              <div className="category-dot" style={{ background: cat.color }}></div>
              <div className="category-info">
                <div className="category-name">{cat.name}</div>
                <div className="category-count">{getCount(cat.name)} items</div>
              </div>
              <div className="category-actions">
                <button className="btn-icon" onClick={() => openEdit(cat)} title="Edit">✏️</button>
                <button className="btn-icon danger" onClick={() => deleteCategory(cat.id)} title="Delete">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal show={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Category' : 'Add Category'} size="sm">
        <div className={`form-group ${error ? 'has-error' : ''}`}>
          <label>Category Name</label>
          <input value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder="e.g., Electronics" />
          {error && <div className="error-text">{error}</div>}
        </div>
        <div className="form-group">
          <label>Color</label>
          <div className="color-picker">
            {CATEGORY_COLORS.map(c => (
              <div key={c} className={`color-option ${color === c ? 'selected' : ''}`}
                style={{ background: c }} onClick={() => setColor(c)}></div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Update' : 'Create'}</button>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
