import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await auth.login({ email, password });
      if (response && response.access_token) {
        login(response.access_token, response.user);
        if (response.user?.onboarding_completed) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--sidebar-bg) 0%, var(--primary) 100%)', color: 'var(--text-primary)' }}>
      <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ← Back to Home
          </Link>
          <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', fontWeight: 600 }}>Public Portal</span>
        </div>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--accent)', fontSize: '24px' }}>CareerPath Sign In</h1>
        {error && <ErrorMessage message={error} />}
        
        {/* Quick Demo Access Card */}
        <div style={{ background: 'var(--surface-2)', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Quick Evaluator / Demo Access:</strong>
            <button
              type="button"
              onClick={() => {
                setEmail('demo@career.com');
                setPassword('demo123');
              }}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--accent)',
                background: 'var(--accent)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ⚡ Autofill Demo
            </button>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
            Email: <code>demo@career.com</code> &bull; Password: <code>demo123</code>
          </div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
            {loading ? <LoadingSpinner size="small" /> : 'Log In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Create public account</Link>
        </p>
      </div>
    </div>
  );
}
