import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, Shield, UserPlus, BookOpen, Compass, Award } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [education, setEducation] = useState('B.Tech');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await auth.register({ name, email, password, education });
      if (response && response.access_token) {
        login(response.access_token, response.user);
        navigate('/onboarding');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--sidebar-bg) 0%, var(--primary) 100%)', padding: '40px 20px', color: 'var(--text-primary)' }}>
      <div style={{ background: 'var(--surface)', borderRadius: '16px', width: '100%', maxWidth: '960px', boxShadow: '0 16px 40px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1.1fr' }}>
        
        {/* Left Panel — Beginner Guidelines & Benefits */}
        <div style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 100%)', padding: '40px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 CareerPath
            </div>
            
            <h2 style={{ fontSize: '26px', margin: '0 0 16px 0', fontWeight: 800, lineHeight: 1.3 }}>
              Beginner Registration & Career Guidance
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '30px' }}>
              Create your account to store your personal career profile, evaluate industry skill gaps, and generate your personalized learning roadmap.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                  <Shield size={20} color="#60a5fa" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#f8fafc' }}>Secure Database Storage</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Your data is securely linked to your user account in PostgreSQL and protected with password encryption.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  <BookOpen size={20} color="#34d399" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#f8fafc' }}>Zero Forced Default Skills</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Beginners start with 0 pre-selected skills. You choose only the skills you actually possess.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                  <Compass size={20} color="#c084fc" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#f8fafc' }}>Dynamic Career Recovery</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Track time feasibility and pivot into alternative paths without losing your hard-earned skills.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginTop: '30px' }}>
            <Link to="/about" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Read Full Site Guidelines & How It Works →
            </Link>
          </div>
        </div>

        {/* Right Panel — Registration Form */}
        <div style={{ padding: '40px', background: 'var(--surface)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Create Beginner Account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Fill in your details to start your career mapping journey.</p>
          </div>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Monika Nithesh" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="e.g. student@gmail.com" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Education Level</label>
              <select value={education} onChange={(e) => setEducation(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px' }}>
                <option value="B.E.">B.E.</option>
                <option value="B.Tech">B.Tech</option>
                <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                <option value="MCA">MCA</option>
                <option value="MBA">MBA</option>
                <option value="M.Tech">M.Tech</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button type="submit" disabled={loading} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? <LoadingSpinner size="small" /> : <><UserPlus size={18} /> Create Account & Start Onboarding</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)', margin: '20px 0 0 0' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Log In Here</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
