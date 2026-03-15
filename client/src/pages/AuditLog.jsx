import { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';

const ACTION_COLORS = { CREATE: 'badge-accent', UPDATE: 'badge-info', DELETE: 'badge-danger', LOGIN: 'badge-gray', APPROVE: 'badge-success', REJECT: 'badge-warning' };

const AuditLog = () => {
  const { auditLog, users } = useInventory();
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;

  const filtered = useMemo(() => {
    let logs = [...auditLog];
    if (filterUser) logs = logs.filter(l => l.userId === filterUser);
    if (filterAction) logs = logs.filter(l => l.action === filterAction);
    if (from) logs = logs.filter(l => l.timestamp >= from);
    if (to) logs = logs.filter(l => l.timestamp <= to + ' 23:59:59');
    return logs;
  }, [auditLog, filterUser, filterAction, from, to]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const actions = [...new Set(auditLog.map(l => l.action))];
  const uniqueUsers = [...new Map(auditLog.map(l => [l.userId, { id: l.userId, name: l.userName }])).values()];

  return (
    <div>
      <div className="page-header"><h1>Audit Log</h1></div>
      <div className="toolbar">
        <select className="filter-select" value={filterUser} onChange={e => { setFilterUser(e.target.value); setPage(1); }}>
          <option value="">All Users</option>
          {uniqueUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="filter-select" value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          {actions.map(a => <option key={a}>{a}</option>)}
        </select>
        <div className="toolbar-group">
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>From</label>
          <input type="date" className="filter-select" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} />
        </div>
        <div className="toolbar-group">
          <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>To</label>
          <input type="date" className="filter-select" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} />
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🕵️</div><h3>No log entries</h3><p>Adjust your filters</p></div>
      ) : (
        <>
          <div className="table-container">
            <table><thead><tr><th>#</th><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Details</th><th>IP</th></tr></thead>
              <tbody>{paged.map((l, i) => (
                <tr key={l.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{(page - 1) * perPage + i + 1}</td>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{l.timestamp}</td>
                  <td style={{ fontWeight: 500 }}>{l.userName}</td>
                  <td><span className={`badge badge-${l.role.toLowerCase()}`}>{l.role}</span></td>
                  <td><span className={`badge ${ACTION_COLORS[l.action] || 'badge-gray'}`}>{l.action}</span></td>
                  <td style={{ maxWidth: 280, whiteSpace: 'normal', fontSize: 12, color: 'var(--text-secondary)' }}>{l.details}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{l.ip}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
              <span className="page-info">{filtered.length} entries</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLog;
