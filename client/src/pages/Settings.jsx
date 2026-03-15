import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useInventory } from '../context/InventoryContext';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { resetAllData } = useInventory();
  const toast = useToast();
  const [local, setLocal] = useState({ ...settings });
  const [showReset, setShowReset] = useState(false);
  const [resetText, setResetText] = useState('');

  const saveSection = (keys) => {
    const patch = {};
    keys.forEach(k => { patch[k] = local[k]; });
    updateSettings(patch);
    toast.success('Settings saved');
  };

  const handleReset = () => {
    if (resetText !== 'RESET') { toast.error('Type RESET to confirm'); return; }
    resetAllData();
    setShowReset(false);
    setResetText('');
  };

  return (
    <div>
      <div className="page-header"><h1>Settings</h1></div>

      {/* Company */}
      <div className="card settings-section">
        <h3>🏢 Company Settings</h3>
        <div className="form-row" style={{ marginTop: 16 }}>
          <div className="form-group">
            <label>Company Name</label>
            <input value={local.companyName} onChange={e => setLocal({ ...local, companyName: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Currency Symbol</label>
            <input value={local.currency} onChange={e => setLocal({ ...local, currency: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Timezone</label>
          <select value={local.timezone} onChange={e => setLocal({ ...local, timezone: e.target.value })}>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => saveSection(['companyName', 'currency', 'timezone'])}>Save Company Settings</button>
      </div>

      {/* Inventory */}
      <div className="card settings-section">
        <h3>📦 Inventory Settings</h3>
        <div className="form-row" style={{ marginTop: 16 }}>
          <div className="form-group">
            <label>Low Stock Threshold</label>
            <input type="number" min="1" value={local.lowStockThreshold} onChange={e => setLocal({ ...local, lowStockThreshold: Number(e.target.value) })} />
          </div>
          <div className="form-group">
            <label>SKU Prefix</label>
            <input value={local.skuPrefix} onChange={e => setLocal({ ...local, skuPrefix: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label>Items Per Page</label>
          <select value={local.itemsPerPage} onChange={e => setLocal({ ...local, itemsPerPage: Number(e.target.value) })}>
            <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => saveSection(['lowStockThreshold', 'skuPrefix', 'itemsPerPage'])}>Save Inventory Settings</button>
      </div>

      {/* Notifications */}
      <div className="card settings-section">
        <h3>🔔 Notification Settings</h3>
        {[
          { key: 'emailLowStock', label: 'Email alerts for low stock items' },
          { key: 'emailNewRequests', label: 'Email alerts for new stock requests' },
          { key: 'emailDailySummary', label: 'Daily inventory summary email' },
        ].map(opt => (
          <div className="settings-row" key={opt.key}>
            <div><div className="label">{opt.label}</div></div>
            <label className="toggle">
              <input type="checkbox" checked={local[opt.key]} onChange={e => setLocal({ ...local, [opt.key]: e.target.checked })} />
              <div className="toggle-track"></div>
              <div className="toggle-thumb"></div>
            </label>
          </div>
        ))}
        <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => saveSection(['emailLowStock', 'emailNewRequests', 'emailDailySummary'])}>Save Notification Settings</button>
      </div>

      {/* Danger Zone */}
      <div className="danger-zone settings-section">
        <h3>⚠️ Danger Zone</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>Reset all data to factory defaults. This action cannot be undone.</p>
        <button className="btn btn-danger" onClick={() => setShowReset(true)}>Reset All Data</button>
      </div>

      <Modal show={showReset} onClose={() => setShowReset(false)} title="⚠️ Reset All Data" size="sm">
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>Type <strong style={{ color: 'var(--danger)' }}>RESET</strong> to confirm</p>
        <div className="form-group">
          <input value={resetText} onChange={e => setResetText(e.target.value)} placeholder='Type "RESET"' />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowReset(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleReset} disabled={resetText !== 'RESET'}>Confirm Reset</button>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
