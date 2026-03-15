import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DEMO_CREDS = [
  { email: 'admin@store.com', pass: 'admin123', role: 'Admin' },
  { email: 'manager@store.com', pass: 'manager123', role: 'Manager' },
  { email: 'employee@store.com', pass: 'emp123', role: 'Employee' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);
  const { login, loading, getRoleFromEmail } = useAuth();
  const navigate = useNavigate();
  const detectedRole = getRoleFromEmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const fillCreds = (cred) => { setEmail(cred.email); setPassword(cred.pass); };

  return (
    <div className="login-page">
      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <h1><span className="logo-text">INVORA</span></h1>
        <p className="subtitle">Smart Inventory Management System</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password" required />
          </div>
          {detectedRole && (
            <div style={{ marginBottom: 16 }}>
              <span className={`badge badge-${detectedRole.toLowerCase()}`}>Role: {detectedRole}</span>
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: 15 }}>
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 20, marginBottom: 8 }}>Demo Credentials</p>
        <div className="demo-chips">
          {DEMO_CREDS.map(c => (
            <button key={c.email} className="demo-chip" onClick={() => fillCreds(c)} type="button">
              {c.role}: {c.email}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
