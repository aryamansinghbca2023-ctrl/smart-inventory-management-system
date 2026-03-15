import { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSettings } from '../context/SettingsContext';

const Reports = () => {
  const [tab, setTab] = useState('stock');
  return (
    <div>
      <div className="page-header"><h1>Reports</h1></div>
      <div className="tabs">
        <button className={`tab ${tab === 'stock' ? 'active' : ''}`} onClick={() => setTab('stock')}>Stock Summary</button>
        <button className={`tab ${tab === 'low' ? 'active' : ''}`} onClick={() => setTab('low')}>Low Stock</button>
        <button className={`tab ${tab === 'movement' ? 'active' : ''}`} onClick={() => setTab('movement')}>Stock Movement</button>
      </div>
      {tab === 'stock' && <StockSummary />}
      {tab === 'low' && <LowStockReport />}
      {tab === 'movement' && <StockMovement />}
    </div>
  );
};

const exportCsv = (headers, rows, filename) => {
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = filename; a.click();
};

const StockSummary = () => {
  const { items } = useInventory();
  const { settings } = useSettings();
  const th = settings.lowStockThreshold;
  const getStatus = (q) => q === 0 ? 'Out of Stock' : q <= th ? 'Low Stock' : 'In Stock';
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const totalVal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => exportCsv(
          ['Name','Category','Qty','Price','Value','Status'],
          items.map(i => [i.name, i.category, i.quantity, i.price, i.price*i.quantity, getStatus(i.quantity)]),
          'stock_summary.csv'
        )}>📥 Export CSV</button>
      </div>
      <div className="table-container">
        <table><thead><tr><th>Name</th><th>Category</th><th>Qty</th><th>Price (₹)</th><th>Value (₹)</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}><td>{i.name}</td><td>{i.category}</td><td>{i.quantity}</td><td>₹{i.price.toLocaleString('en-IN')}</td>
                <td style={{ fontWeight: 600 }}>₹{(i.price * i.quantity).toLocaleString('en-IN')}</td>
                <td><span className={`badge ${getStatus(i.quantity) === 'In Stock' ? 'badge-success' : getStatus(i.quantity) === 'Low Stock' ? 'badge-warning' : 'badge-danger'}`}>{getStatus(i.quantity)}</span></td></tr>
            ))}
            <tr style={{ background: 'var(--bg-sidebar)', fontWeight: 700 }}>
              <td colSpan={2}>TOTAL</td><td>{totalQty}</td><td></td><td>₹{totalVal.toLocaleString('en-IN')}</td><td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LowStockReport = () => {
  const { items } = useInventory();
  const { settings } = useSettings();
  const lowItems = items.filter(i => i.quantity <= settings.lowStockThreshold);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => exportCsv(
          ['Name','Category','Qty','Supplier','Suggestion'],
          lowItems.map(i => [i.name, i.category, i.quantity, i.supplier, 'Reorder suggested']),
          'low_stock.csv'
        )}>📥 Export CSV</button>
      </div>
      {lowItems.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">✅</div><h3>All items well-stocked</h3><p>No items below threshold ({settings.lowStockThreshold})</p></div>
      ) : (
        <div className="table-container">
          <table><thead><tr><th>Name</th><th>Category</th><th>Qty</th><th>Supplier</th><th>Action</th></tr></thead>
            <tbody>{lowItems.map(i => (
              <tr key={i.id} style={{ background: i.quantity === 0 ? 'rgba(255,71,87,0.05)' : undefined }}>
                <td style={{ fontWeight: 500 }}>{i.name}</td><td>{i.category}</td>
                <td style={{ color: i.quantity === 0 ? 'var(--danger)' : 'var(--warning)', fontWeight: 700 }}>{i.quantity}</td>
                <td>{i.supplier}</td>
                <td><span className="badge badge-warning">Reorder suggested</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StockMovement = () => {
  const { auditLog } = useInventory();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const movements = useMemo(() => {
    let logs = auditLog.filter(l => ['CREATE', 'UPDATE', 'DELETE'].includes(l.action));
    if (from) logs = logs.filter(l => l.timestamp >= from);
    if (to) logs = logs.filter(l => l.timestamp <= to + ' 23:59:59');
    return logs;
  }, [auditLog, from, to]);

  return (
    <div>
      <div className="toolbar">
        <div className="toolbar-group">
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>From</label>
          <input type="date" className="filter-select" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="toolbar-group">
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>To</label>
          <input type="date" className="filter-select" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => exportCsv(
          ['Date','Action','Details','Done By'],
          movements.map(m => [m.timestamp, m.action, m.details, m.userName]),
          'stock_movement.csv'
        )}>📥 Export CSV</button>
      </div>
      {movements.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><h3>No movements</h3><p>Adjust date range</p></div>
      ) : (
        <div className="table-container">
          <table><thead><tr><th>Date</th><th>Action</th><th>Details</th><th>Done By</th></tr></thead>
            <tbody>{movements.map(m => (
              <tr key={m.id}><td style={{ fontSize: 12 }}>{m.timestamp}</td>
                <td><span className={`badge ${m.action === 'CREATE' ? 'badge-accent' : m.action === 'UPDATE' ? 'badge-info' : 'badge-danger'}`}>{m.action}</span></td>
                <td>{m.details}</td><td>{m.userName}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
