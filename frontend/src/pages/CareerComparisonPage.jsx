import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { careers, recovery } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GitCompare, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function CareerComparisonPage() {
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get('target');

  const [allCareers, setAllCareers] = useState([]);
  const [career1Id, setCareer1Id] = useState('');
  const [career2Id, setCareer2Id] = useState(targetId || '');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        const [careersList, goal] = await Promise.all([
          careers.getAllCareers(),
          careers.getCareerGoal().catch(() => null)
        ]);
        
        const list = careersList || [];
        setAllCareers(list);
        
        const defaultGoalId = goal?.career_id || goal?.career?.id || (list[0]?.id) || '';
        setCareer1Id(String(defaultGoalId));
        
        if (targetId) {
          setCareer2Id(String(targetId));
        } else if (list.length > 1) {
          const second = list.find(c => String(c.id) !== String(defaultGoalId));
          setCareer2Id(String(second?.id || ''));
        }
      } catch (err) {
        setError('Failed to load careers list.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [targetId]);

  const handleCompare = async () => {
    if (!career1Id || !career2Id) return;
    setComparing(true);
    setError('');
    try {
      const res = await recovery.compare([Number(career1Id), Number(career2Id)]);
      setComparison(res.comparison || []);
    } catch (err) {
      console.error(err);
      setError('Failed to run comparison API.');
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    if (career1Id && career2Id && !loading) {
      handleCompare();
    }
  }, [career1Id, career2Id, loading]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><LoadingSpinner size="large" /></div>;

  const c1 = comparison && comparison[0];
  const c2 = comparison && comparison[1];

  const chartData = (c1 && c2) ? [
    {
      metric: 'Skill Match %',
      [c1.career_name]: c1.match_percentage,
      [c2.career_name]: c2.match_percentage,
    },
    {
      metric: 'Skill Reuse %',
      [c1.career_name]: c1.skill_reuse_score,
      [c2.career_name]: c2.skill_reuse_score,
    },
    {
      metric: 'Recovery Score',
      [c1.career_name]: c1.recovery_score,
      [c2.career_name]: c2.recovery_score,
    }
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Banner */}
      <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-teal" style={{ marginBottom: '8px' }}>SIDE-BY-SIDE ANALYSIS</span>
            <h1 style={{ fontSize: '30px', margin: '4px 0', color: 'var(--text-primary)' }}>
              Compare Career Paths
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Evaluate skill overlap, reuse percentage, learning effort, and recovery scores between roles.
            </p>
          </div>
        </div>
      </div>

      {/* Selectors Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="grid-2" style={{ alignItems: 'flex-end', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Career 1 (Original / Target Goal)</label>
            <select className="form-select" value={career1Id} onChange={e => setCareer1Id(e.target.value)}>
              {allCareers.map(c => <option key={c.id} value={c.id}>{c.career_name} ({c.industry})</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Career 2 (Alternative Path)</label>
            <select className="form-select" value={career2Id} onChange={e => setCareer2Id(e.target.value)}>
              {allCareers.map(c => <option key={c.id} value={c.id}>{c.career_name} ({c.industry})</option>)}
            </select>
          </div>
        </div>

        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <button onClick={handleCompare} disabled={comparing} className="btn btn-primary">
            {comparing ? <LoadingSpinner size="small" /> : '⚡ Compare Careers'}
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* COMPARISON RESULTS TABLE & CHARTS */}
      {c1 && c2 && (
        <>
          <div className="card" style={{ padding: '28px', overflowX: 'auto' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Side-by-Side Metrics Table</h2>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Metric</th>
                  <th style={{ width: '37.5%', color: 'var(--accent)', fontSize: '18px' }}>{c1.career_name}</th>
                  <th style={{ width: '37.5%', color: 'var(--accent-teal)', fontSize: '18px' }}>{c2.career_name}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Industry</strong></td>
                  <td><span className="badge badge-gray">{c1.industry}</span></td>
                  <td><span className="badge badge-gray">{c2.industry}</span></td>
                </tr>
                <tr>
                  <td><strong>Overall Skill Match</strong></td>
                  <td><strong style={{ fontSize: '18px', color: 'var(--accent)' }}>{c1.match_percentage}%</strong></td>
                  <td><strong style={{ fontSize: '18px', color: 'var(--accent-teal)' }}>{c2.match_percentage}%</strong></td>
                </tr>
                <tr>
                  <td><strong>Skill Reuse Score</strong></td>
                  <td><strong style={{ color: 'var(--accent)' }}>{c1.skill_reuse_score}%</strong></td>
                  <td><strong style={{ color: 'var(--accent-teal)' }}>{c2.skill_reuse_score}%</strong></td>
                </tr>
                <tr>
                  <td><strong>Composite Recovery Score</strong></td>
                  <td><span className="badge badge-blue">{c1.recovery_score}/100</span></td>
                  <td><span className="badge badge-green">{c2.recovery_score}/100</span></td>
                </tr>
                <tr>
                  <td><strong>Feasibility Status</strong></td>
                  <td><span className={'badge ' + (c1.feasibility_status === 'Feasible' ? 'badge-green' : 'badge-yellow')}>{c1.feasibility_status}</span></td>
                  <td><span className={'badge ' + (c2.feasibility_status === 'Feasible' ? 'badge-green' : 'badge-yellow')}>{c2.feasibility_status}</span></td>
                </tr>
                <tr>
                  <td><strong>Estimated Additional Effort</strong></td>
                  <td>~{c1.estimated_months} month(s) ({c1.estimated_weeks} wks)</td>
                  <td>~{c2.estimated_months} month(s) ({c2.estimated_weeks} wks)</td>
                </tr>
                <tr>
                  <td><strong>Existing Reusable Skills ({c1.existing_skills?.length || 0} vs {c2.existing_skills?.length || 0})</strong></td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {c1.existing_skills?.map((s, i) => <span key={i} className="badge badge-green">{s}</span>)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {c2.existing_skills?.map((s, i) => <span key={i} className="badge badge-green">{s}</span>)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Missing Skills Needed ({c1.missing_skills?.length || 0} vs {c2.missing_skills?.length || 0})</strong></td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {c1.missing_skills?.map((s, i) => <span key={i} className="badge badge-red">{s}</span>)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {c2.missing_skills?.map((s, i) => <span key={i} className="badge badge-red">{s}</span>)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Average Salary Range</strong></td>
                  <td><strong>{c1.avg_salary_range || '4L - 12L'}</strong></td>
                  <td><strong>{c2.avg_salary_range || '5L - 15L'}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Visual Comparison Bar Chart */}
          <div className="card" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Visual Comparison Chart</h2>
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={c1.career_name} fill="#3b82f6" name={c1.career_name} />
                  <Bar dataKey={c2.career_name} fill="#10b981" name={c2.career_name} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
