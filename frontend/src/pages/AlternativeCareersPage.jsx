import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { recovery } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Target, Clock, ArrowRight, BarChart2, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AlternativeCareersPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('recovery_score');
  const navigate = useNavigate();

  const fetchAlternatives = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await recovery.getRecommendations();
      setData(res);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch career recovery recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlternatives();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><LoadingSpinner size="large" /></div>;

  const alternatives = data?.alternatives || [];
  const originalCareer = data?.original_career;

  if (alternatives.length === 0) {
    return (
      <div className="card" style={{ maxWidth: '700px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
        <ShieldAlert size={48} color="var(--accent)" style={{ marginBottom: '16px' }} />
        <h2>No Career Recovery Recommendations Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please run the Career Recovery Engine to analyze alternative paths.</p>
        <Link to="/career-recovery" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
          Go to Career Recovery Engine →
        </Link>
      </div>
    );
  }

  const sortedAlternatives = [...alternatives].sort((a, b) => {
    if (sortBy === 'recovery_score') return b.recovery_score - a.recovery_score;
    if (sortBy === 'skill_reuse') return b.skill_reuse_score - a.skill_reuse_score;
    if (sortBy === 'time') return a.estimated_months - b.estimated_months;
    return 0;
  });

  const getScoreBadge = (score) => {
    if (score >= 70) return <span className="badge badge-green" style={{ fontSize: '18px', padding: '6px 14px' }}>{score}/100</span>;
    if (score >= 50) return <span className="badge badge-yellow" style={{ fontSize: '18px', padding: '6px 14px' }}>{score}/100</span>;
    return <span className="badge badge-red" style={{ fontSize: '18px', padding: '6px 14px' }}>{score}/100</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Header Card */}
      <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="badge badge-teal" style={{ marginBottom: '8px' }}>CAREER RECOVERY OPTIONS</span>
            <h1 style={{ fontSize: '30px', margin: '6px 0', color: 'var(--text-primary)' }}>
              Alternative Career Recommendations
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Original Goal: <strong>{originalCareer?.career_name || 'Software Developer'}</strong> — Ranked alternatives to maximize your existing skill reuse.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sort By:</label>
            <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 'auto', padding: '8px 14px' }}>
              <option value="recovery_score">Recovery Score (High to Low)</option>
              <option value="skill_reuse">Skill Reuse % (High to Low)</option>
              <option value="time">Estimated Time (Shortest First)</option>
            </select>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Alternative Career Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {sortedAlternatives.map((item, idx) => {
          const career = item.career;
          return (
            <div key={idx} className="card" style={{ padding: '28px', borderLeft: '5px solid var(--accent)' }}>
              
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--primary)' }}>{career.career_name}</h2>
                    <span className="badge badge-gray">{career.industry}</span>
                    <span className={'badge ' + (item.feasibility_status === 'Feasible' ? 'badge-green' : 'badge-yellow')}>
                      {item.feasibility_status}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px', margin: 0, maxWidth: '650px' }}>
                    {career.description}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Recovery Score
                  </div>
                  {getScoreBadge(item.recovery_score)}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid-3" style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Skill Reuse Score</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)' }}>{item.skill_reuse_score}%</div>
                  <div style={{ background: 'var(--surface-3)', height: '6px', borderRadius: '3px', marginTop: '6px' }}>
                    <div style={{ background: 'var(--accent)', height: '100%', borderRadius: '3px', width: item.skill_reuse_score + '%' }} />
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Estimated Additional Effort</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ~{item.estimated_months} month(s) ({item.estimated_weeks || item.effort_score} wks)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Average Salary Range</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-green)' }}>
                    {career.avg_salary_range || '4L - 12L'}
                  </div>
                </div>
              </div>

              {/* Existing vs Missing Skills */}
              <div className="grid-2" style={{ marginBottom: '20px' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--accent-green)', display: 'block', marginBottom: '8px' }}>
                    ✓ Reusable Skills You Have ({item.existing_skills?.length || 0}):
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {item.existing_skills?.length > 0 ? (
                      item.existing_skills.map((s, i) => <span key={i} className="badge badge-green">{s}</span>)
                    ) : <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>None</span>}
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--danger)', display: 'block', marginBottom: '8px' }}>
                    ✗ New Skills to Acquire ({item.missing_skills?.length || 0}):
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {item.missing_skills?.length > 0 ? (
                      item.missing_skills.map((s, i) => <span key={i} className="badge badge-red">{s}</span>)
                    ) : <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>None missing</span>}
                  </div>
                </div>
              </div>

              {/* Explainable Reasoning */}
              <div style={{ padding: '14px 18px', background: 'var(--surface-3)', borderRadius: '8px', borderLeft: '4px solid var(--accent-teal)', marginBottom: '20px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Why this career?</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-primary)' }}>{item.reasoning}</p>
              </div>

              {/* Actions Row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Link to="/compare-careers" className="btn btn-secondary">
                  <BarChart2 size={16} /> Compare Careers
                </Link>
                <Link to="/skill-reuse" className="btn btn-teal">
                  View Skill Reuse Matrix →
                </Link>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
