import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { ROLE_PERMISSIONS } from './ProtectedRoute';

const NAV_ITEMS = [
  { path: '/',           label: 'Dashboard',      icon: '📊', module: 'dashboard' },
  { path: '/inventory',  label: 'Inventory',      icon: '📦', module: 'inventory' },
  { path: '/categories', label: 'Categories',     icon: '📁', module: 'categories' },
  { path: '/requests',   label: 'Stock Requests', icon: '🔄', module: 'requests' },
  { path: '/myrequests', label: 'My Requests',    icon: '📋', module: 'myrequests' },
  { path: '/users',      label: 'Users',          icon: '👤', module: 'users' },
  { path: '/reports',    label: 'Reports',        icon: '📈', module: 'reports' },
  { path: '/audit',      label: 'Audit Log',      icon: '🕵️', module: 'audit' },
  { path: '/settings',   label: 'Settings',       icon: '⚙️', module: 'settings' },
];

const PAGE_TITLES = {
  '/': 'Dashboard', '/inventory': 'Inventory', '/categories': 'Categories',
  '/requests': 'Stock Requests', '/myrequests': 'My Requests', '/users': 'User Management',
  '/reports': 'Reports', '/audit': 'Audit Log', '/settings': 'Settings',
};

const Layout = ({ children, searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  const { pendingRequestCount } = useInventory();
  const [collapsed, setCollapsed] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const ddRef = useRef(null);

  const allowed = ROLE_PERMISSIONS[user?.role] || [];
  const navItems = NAV_ITEMS.filter(n => allowed.includes(n.module));
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';
  const showBadge = ['Admin', 'Manager'].includes(user?.role) && pendingRequestCount > 0;

  useEffect(() => {
    const handleClick = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">📦</span>
          <h2>INVORA</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{user?.avatar}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '▶' : '◀'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`main-area ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="topbar">
          <div className="topbar-left"><h2>{pageTitle}</h2></div>
          <div className="topbar-right">
            <div className="search-box">
              <span>🔍</span>
              <input placeholder="Search inventory..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="notif-btn" onClick={() => navigate(user?.role === 'Employee' ? '/myrequests' : '/requests')}>
              🔔
              {showBadge && <span className="notif-badge">{pendingRequestCount}</span>}
            </button>
            <div className="user-dropdown" ref={ddRef} onClick={() => setDdOpen(!ddOpen)}>
              <div className="dd-avatar">{user?.avatar}</div>
              <span className="dd-name">{user?.name}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▼</span>
              {ddOpen && (
                <div className="dd-menu">
                  <button className="dd-menu-item" onClick={() => { setDdOpen(false); }}>👤 Profile</button>
                  <button className="dd-menu-item danger" onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="content-area">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
