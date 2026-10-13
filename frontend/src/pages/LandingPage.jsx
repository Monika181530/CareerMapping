import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, Map, ShieldAlert, GitBranch, Recycle, Activity, Compass, Award, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/api';

const LandingPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleStartJourney = () => {
    if (isAuthenticated) {
      navigate('/onboarding');
    } else {
      navigate('/register');
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const response = await auth.login({ email: 'demo@career.com', password: 'demo123' });
      if (response && response.access_token) {
        login(response.access_token, response.user);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      navigate('/login');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-3)' }}>
      {/* Navigation Header */}
      <nav style={{ padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎯 CareerPath
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/about" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500 }}>How It Works</Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go to Dashboard</Link>
          ) : (
            <>
              <button
                onClick={handleDemoLogin}
                disabled={demoLoading}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {demoLoading ? 'Loading Demo...' : '⚡ Instant Demo'}
              </button>
              <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500 }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section style={{ padding: '90px 20px', textAlign: 'center', background: 'linear-gradient(135deg, var(--sidebar-bg) 0%, var(--primary) 100%)', color: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: '20px', fontSize: '14px', fontWeight: 600, marginBottom: '20px', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
              ✦ Automated Industry Skill-Gap Analysis & Career Recovery Engine
            </span>
            <h1 style={{ fontSize: '48px', lineHeight: '1.2', marginBottom: '20px', fontWeight: 800, color: '#ffffff' }}>
              Build Your Personalized Career Path
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.9, maxWidth: '750px', margin: '0 auto 40px auto', lineHeight: '1.6', color: '#e2e8f0' }}>
              Discover the skills you need, understand your industry skill gaps, build a personalized learning roadmap, and recover into alternative career paths without losing the skills you already developed.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={handleStartJourney} className="btn" style={{ background: 'var(--accent)', color: 'white', padding: '14px 32px', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
                Start My Career Journey →
              </button>
              {!isAuthenticated && (
                <button onClick={handleDemoLogin} disabled={demoLoading} className="btn" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '14px 28px', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                  {demoLoading ? 'Signing in...' : '⚡ Try Live Demo'}
                </button>
              )}
              <Link to="/about" className="btn" style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.4)', color: 'white', padding: '14px 28px', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', textDecoration: 'none' }}>
                How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section style={{ padding: '40px 40px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--accent)' }}>12+</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: '4px' }}>Industry Career Paths</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--accent)' }}>26+</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: '4px' }}>Core Technical Skills</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--accent-green)' }}>100%</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: '4px' }}>Explainable Skill Reuse</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--accent-teal)' }}>Dynamic</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500, marginTop: '4px' }}>Recovery Roadmap</div>
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <section style={{ padding: '80px 40px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>Platform Core Capabilities</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Designed for students to navigate skill requirements and recover learning effort gracefully.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {[
              { title: 'Personalized Career Mapping', icon: Target, desc: 'Align your current skills and education with actual industry requirements and target deadlines.' },
              { title: 'Industry Skill-Gap Analysis', icon: Activity, desc: 'Rule-based quantitative calculation of proficiency gaps against weighted career standards.' },
              { title: 'Personalized Roadmap', icon: Map, desc: 'Dynamic phase-by-phase learning schedule based on your weekly available learning hours.' },
              { title: 'Career Monitoring', icon: Compass, desc: 'Real-time feasibility calculation based on ongoing skill updates and target deadlines.' },
              { title: 'Career Recovery Engine', icon: ShieldAlert, desc: 'Preserves your hard-earned learning effort by identifying optimal alternative career trajectories.' },
              { title: 'Skill Reuse Maximizer', icon: Recycle, desc: 'Calculates exact skill reuse percentages and minimizes additional learning hours required.' },
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: '32px', textAlign: 'left' }}>
                <div style={{ background: 'var(--surface-2)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid var(--border)' }}>
                  <f.icon size={30} color="var(--accent)" />
                </div>
                <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow Steps */}
        <section style={{ padding: '80px 40px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', marginBottom: '40px', fontWeight: 700 }}>Your Personalized Journey</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              {[
                { step: '1', title: 'Onboarding & Skill Audit', desc: 'Tell us about your education, current skills with proficiency levels (1-10), and weekly available learning hours.' },
                { step: '2', title: 'Target Career Selection', desc: 'Select your target career goal from our database of software, data, QA, DevOps, and security roles.' },
                { step: '3', title: 'Automated Skill-Gap Analysis', desc: 'Our engine evaluates your proficiency against industry standard benchmarks and highlights exact gaps.' },
                { step: '4', title: 'Personalized Learning Roadmap', desc: 'Receive a phased learning plan prioritized by urgency and structured around your weekly constraints.' },
                { step: '5', title: 'Career Monitoring & Recovery', desc: 'If your goal becomes unfeasible or deadline changes, our Recovery Engine calculates skill reuse and ranks alternative paths.' }
              ].map((item) => (
                <div key={item.step} style={{ display: 'flex', gap: '20px', padding: '24px', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)', alignItems: 'flex-start' }}>
                  <div style={{ background: 'var(--accent)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '40px' }}>
              <button onClick={handleStartJourney} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '18px', fontWeight: 'bold' }}>
                Start My Career Journey Now →
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '40px', textAlign: 'center', background: 'var(--sidebar-bg)', color: 'var(--sidebar-text)', borderTop: '1px solid #1e293b' }}>
        <p>© 2026 CareerPath — Hyper-Personalized Career Path Mapping Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
