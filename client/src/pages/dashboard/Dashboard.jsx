import { useAuth } from '../../context/AuthContext';
import { useInventory } from '../../context/InventoryContext';
import { useSettings } from '../../context/SettingsContext';

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'Admin') return <AdminDash />;
  if (user.role === 'Manager') return <ManagerDash />;
  return <EmployeeDash />;
};

const AdminDash = () => {
  const { items, users, auditLog, requests } = useInventory();
  const { settings } = useSettings();
  const th = settings.lowStockThreshold;
  const totalValue = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= th);
  const cats = [...new Set(items.map(i => i.category))];
  const catCounts = cats.map(c => ({ name: c, count: items.filter(i => i.category === c).reduce((s, i) => s + i.quantity, 0) }));
  const maxCount = Math.max(...catCounts.map(c => c.count), 1);

  return (
    <div>
      <div className="stats-grid">
        <StatCard icon="📦" value={items.length} label="Total Items" trend="+4.2%" up />
        <StatCard icon="💰" value={`₹${totalValue.toLocaleString('en-IN')}`} label="Inventory Value" trend="+12.5%" up color="var(--success)" />
        <StatCard icon="⚠️" value={lowStock.length} label="Low Stock Items" trend={lowStock.length > 0 ? 'Needs attention' : 'All good'} up={lowStock.length === 0} color="var(--warning)" />
        <StatCard icon="👤" value={users.length} label="Total Users" trend="Active" up color="var(--info)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>Stock by Category</h3>
          <div className="bar-chart">
            {catCounts.map(c => (
              <div className="bar-col" key={c.name}>
                <div className="bar-value">{c.count}</div>
                <div className="bar" style={{ height: `${(c.count / maxCount) * 140}px` }}></div>
                <div className="bar-label">{c.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>Recent Activity</h3>
          <div className="activity-feed">
            {auditLog.slice(0, 5).map(l => (
              <div className="activity-item" key={l.id}>
                <div className="activity-dot" style={{ background: actionColor(l.action) }}></div>
                <div className="activity-time">{l.timestamp.split(' ')[1]?.slice(0,5)}</div>
                <div className="activity-text"><span className="activity-user">{l.userName}</span> — {l.details}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {lowStock.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15, color: 'var(--warning)' }}>⚠️ Low Stock Alert</h3>
          <div className="table-container">
            <table><thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Supplier</th></tr></thead>
              <tbody>{lowStock.map(i => (
                <tr key={i.id}><td>{i.name}</td><td>{i.category}</td><td style={{ color: 'var(--warning)', fontWeight: 700 }}>{i.quantity}</td><td>{i.supplier}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ManagerDash = () => {
  const { items, requests, categories } = useInventory();
  const { settings } = useSettings();
  const th = settings.lowStockThreshold;
  const pending = requests.filter(r => r.status === 'Pending');
  const lowStock = items.filter(i => i.quantity > 0 && i.quantity <= th);
  const inStock = items.filter(i => i.quantity > th).length;
  const outOfStock = items.filter(i => i.quantity === 0).length;
  const total = items.length || 1;
  const pIn = Math.round((inStock / total) * 100);
  const pLow = Math.round((lowStock.length / total) * 100);
  const pOut = Math.round((outOfStock / total) * 100);
  const r = 60; const c = 2 * Math.PI * r;

  return (
    <div>
      <div className="stats-grid">
        <StatCard icon="📦" value={items.length} label="Total Items" />
        <StatCard icon="🔄" value={pending.length} label="Pending Requests" color="var(--warning)" />
        <StatCard icon="⚠️" value={lowStock.length} label="Low Stock" color="var(--danger)" />
        <StatCard icon="📁" value={categories.length} label="Categories" color="var(--info)" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>Pending Requests</h3>
          {pending.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No pending requests 🎉</p> : (
            <div className="table-container"><table><thead><tr><th>Item</th><th>By</th><th>Qty</th><th>Date</th></tr></thead>
              <tbody>{pending.slice(0, 5).map(r => (
                <tr key={r.id}><td>{r.itemName}</td><td>{r.requesterName}</td><td>{r.qty}</td><td>{r.date}</td></tr>
              ))}</tbody></table></div>
          )}
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: 16, fontSize: 15 }}>Stock Status</h3>
          <div className="donut-chart">
            <svg viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={r} fill="none" stroke="var(--success)" strokeWidth="16"
                strokeDasharray={`${(pIn/100)*c} ${c}`} strokeDashoffset={c*0.25} strokeLinecap="round"/>
              <circle cx="80" cy="80" r={r} fill="none" stroke="var(--warning)" strokeWidth="16"
                strokeDasharray={`${(pLow/100)*c} ${c}`} strokeDashoffset={c*0.25 - (pIn/100)*c} strokeLinecap="round"/>
              <circle cx="80" cy="80" r={r} fill="none" stroke="var(--danger)" strokeWidth="16"
                strokeDasharray={`${(pOut/100)*c} ${c}`} strokeDashoffset={c*0.25 - ((pIn+pLow)/100)*c} strokeLinecap="round"/>
            </svg>
            <div className="donut-center">{items.length}<span>Items</span></div>
          </div>
          <div className="chart-legend">
            <div className="legend-item"><div className="legend-dot" style={{background:'var(--success)'}}></div>In Stock ({inStock})</div>
            <div className="legend-item"><div className="legend-dot" style={{background:'var(--warning)'}}></div>Low ({lowStock.length})</div>
            <div className="legend-item"><div className="legend-dot" style={{background:'var(--danger)'}}></div>Out ({outOfStock})</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeDash = () => {
  const { user } = useAuth();
  const { items, requests } = useInventory();
  const myReqs = requests.filter(r => r.requestedBy === user.id);
  const pending = myReqs.filter(r => r.status === 'Pending').length;
  const approved = myReqs.filter(r => r.status === 'Approved').length;

  return (
    <div>
      <div className="welcome-banner">
        <h1>Good morning, {user.name.split(' ')[0]} 👋</h1>
        <p>Here's your inventory overview for today</p>
      </div>
      <div className="stats-grid">
        <StatCard icon="📦" value={items.length} label="Available Items" />
        <StatCard icon="⏳" value={pending} label="Pending Requests" color="var(--warning)" />
        <StatCard icon="✅" value={approved} label="Approved Requests" color="var(--success)" />
      </div>
      {myReqs.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 12, fontSize: 15 }}>My Recent Requests</h3>
          <div className="table-container"><table><thead><tr><th>Item</th><th>Qty</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>{myReqs.slice(0, 5).map(r => (
              <tr key={r.id}><td>{r.itemName}</td><td>{r.qty}</td><td>{r.date}</td>
                <td><span className={`badge badge-${r.status === 'Approved' ? 'success' : r.status === 'Rejected' ? 'danger' : 'warning'}`}>{r.status}</span></td></tr>
            ))}</tbody></table></div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, value, label, trend, up, color }) => (
  <div className="stat-card" style={{ '--glow-color': color ? color.replace(')', ',0.12)').replace('var(', '').replace(')', '') : undefined }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {trend && <div className={`stat-trend ${up ? 'trend-up' : 'trend-down'}`}>{up ? '↑' : '↓'} {trend}</div>}
  </div>
);

const actionColor = (a) => ({ CREATE: 'var(--accent)', UPDATE: 'var(--info)', DELETE: 'var(--danger)', LOGIN: 'var(--text-muted)', APPROVE: 'var(--success)', REJECT: 'var(--warning)' }[a] || 'var(--text-muted)');

export default Dashboard;
