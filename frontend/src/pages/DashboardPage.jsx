import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { skillGap, roadmap, careers, monitoring } from '../services/api';
import KPICard from '../components/KPICard';
import DonutChart from '../components/DonutChart';
import SkillGapChart from '../components/SkillGapChart';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Target, Activity, Map, ShieldAlert, ArrowRight, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [roadmapProgress, setRoadmapProgress] = useState(null);
  const [careerGoal, setCareerGoal] = useState(null);
  const [feasibility, setFeasibility] = useState('Feasible');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, rdRes, cgRes, feasRes] = await Promise.allSettled([
          skillGap.getSummary(),
          roadmap.getProgress(),
          careers.getCareerGoal(),
          monitoring.getFeasibility()
        ]);

        if (cgRes.status === 'fulfilled') setCareerGoal(cgRes.value);
        if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
        if (rdRes.status === 'fulfilled') setRoadmapProgress(rdRes.value);
        if (feasRes.status === 'fulfilled') setFeasibility(feasRes.value.feasibility_status || 'Feasible');
      } catch (err) {
        setError('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><LoadingSpinner size="large" /></div>;

  const hasCareerGoal = careerGoal && careerGoal.career;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Welcome Banner */}
      <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: 'white' }}>
        <h1 style={{ color: 'white', fontSize: '28px', marginBottom: '8px' }}>Hello, {user?.name || 'Student'}! 👋</h1>
        <p style={{ color: '#e2e8f0', margin: 0, fontSize: '16px' }}>
          Welcome to your personalized career path mapping dashboard.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* PROMPT IF ONBOARDING / CAREER GOAL NOT COMPLETED */}
      {!hasCareerGoal && (
        <div className="card" style={{ padding: '40px', textAlign: 'center', background: 'var(--surface-2)', border: '2px dashed var(--accent)' }}>
          <Target size={52} color="var(--accent)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', marginBottom: '12px', color: 'var(--primary)' }}>Complete Student Onboarding First</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto 24px auto', fontSize: '15px' }}>
            To view your personalized skill match %, industry gaps, and learning roadmap, please provide your skills and target career goal in our step-by-step onboarding wizard.
          </p>
          <button onClick={() => navigate('/onboarding')} className="btn btn-primary btn-lg" style={{ padding: '14px 32px' }}>
            Start Student Onboarding Wizard →
          </button>
        </div>
      )}

      {/* REAL STUDENT DASHBOARD METRICS */}
      {hasCareerGoal && (
        <>
          {/* KPI Cards Row */}
          <div className="kpi-grid">
            <KPICard title="Current Career Goal" value={careerGoal.career?.career_name} icon="🎯" />
            <KPICard title="Overall Skill Match" value={summary ? summary.match_percentage + '%' : '—'} icon="✨" />
            <KPICard title="Skill Gaps Count" value={summary?.total_gaps !== undefined ? summary.total_gaps + ' missing' : '—'} icon="📉" />
            <KPICard title="Roadmap Progress" value={roadmapProgress ? roadmapProgress.completion_pct + '%' : '0%'} icon="🚀" />
          </div>

          {/* Two Column Section */}
          <div className="grid-2">
            
            {/* Left Column: Skill Match & Gaps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Skill Match Breakdown</h3>
                {summary ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ width: '130px', flexShrink: 0 }}>
                      <DonutChart percentage={summary.match_percentage} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '24px', color: 'var(--accent)', margin: 0 }}>{summary.match_percentage}% Match</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Your skills match {summary.match_percentage}% of target requirements for <strong>{summary.career_name}</strong>.
                      </p>
                      <Link to="/career-analysis" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
                        View Full Skill Analysis →
                      </Link>
                    </div>
                  </div>
                ) : <p style={{ color: 'var(--text-muted)' }}>No analysis data available.</p>}
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Top Skill Gaps</h3>
                {summary?.gaps?.length > 0 ? (
                  <SkillGapChart gaps={summary.gaps.slice(0, 5)} />
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No skill gaps detected!</p>
                )}
                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <Link to="/career-analysis" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
                    See all gaps & recommendations →
                  </Link>
                </div>
              </div>

            </div>

            {/* Right Column: Roadmap & Career Recovery Alert */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Roadmap Progress</h3>
                {roadmapProgress?.items?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {roadmapProgress.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', background: 'var(--surface-2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '14px' }}>{item.skill_name}</strong>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Phase {item.phase}</span>
                        </div>
                        <span className={'badge ' + (item.status === 'completed' ? 'badge-green' : 'badge-yellow')}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                    <div style={{ marginTop: '12px' }}>
                      <Link to="/roadmap" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
                        Open Interactive Roadmap →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No active roadmap generated yet.</p>
                    <Link to="/roadmap" className="btn btn-sm btn-primary">Generate Roadmap</Link>
                  </div>
                )}
              </div>

              <div className="card" style={{ padding: '24px', background: 'var(--surface-2)', borderLeft: '4px solid var(--accent-teal)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <ShieldAlert size={22} color="var(--accent-teal)" />
                  <h3 style={{ fontSize: '18px', margin: 0 }}>Career Recovery Engine</h3>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Explore alternative career paths that maximize your existing skills and minimize extra learning time.
                </p>
                <Link to="/career-recovery" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  Explore Career Recovery →
                </Link>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}
