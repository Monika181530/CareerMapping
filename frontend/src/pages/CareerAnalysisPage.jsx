import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { skillGap, careers, monitoring } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import DonutChart from '../components/DonutChart';
import SkillBadge from '../components/SkillBadge';
import { Target, CheckCircle, AlertTriangle, ArrowRight, Activity, Award } from 'lucide-react';

export default function CareerAnalysisPage() {
  const [analysis, setAnalysis] = useState(null);
  const [careerGoal, setCareerGoal] = useState(null);
  const [feasibility, setFeasibility] = useState('Feasible');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      const [goalRes, gapRes, feasRes] = await Promise.allSettled([
        careers.getCareerGoal(),
        skillGap.analyze(),
        monitoring.getFeasibility()
      ]);

      if (goalRes.status === 'fulfilled') setCareerGoal(goalRes.value);
      if (gapRes.status === 'fulfilled') setAnalysis(gapRes.value);
      if (feasRes.status === 'fulfilled') setFeasibility(feasRes.value.feasibility_status || 'Feasible');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch career analysis data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await skillGap.analyze();
      setAnalysis(res);
    } catch (err) {
      setError(err.response?.data?.detail || 'Skill gap analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><LoadingSpinner size="large" /></div>;

  if (!careerGoal) {
    return (
      <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)', maxWidth: '600px', margin: '40px auto' }}>
        <Target size={48} color="var(--accent)" style={{ marginBottom: '16px' }} />
        <h2>No Target Career Goal Set</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please complete student onboarding to select your target career goal.</p>
        <Link to="/onboarding" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>Go to Student Onboarding →</Link>
      </div>
    );
  }

  const strengths = analysis?.gaps?.filter(g => g.gap === 0) || [];
  const skillsToImprove = analysis?.gaps?.filter(g => g.gap > 0) || [];

  const getFeasibilityBadge = (status) => {
    if (status === 'Feasible' || analysis?.match_percentage >= 70) {
      return <span className="badge badge-green" style={{ fontSize: '14px', padding: '6px 14px' }}>✓ Feasible Path</span>;
    } else if (status === 'Needs Review' || analysis?.match_percentage >= 40) {
      return <span className="badge badge-yellow" style={{ fontSize: '14px', padding: '6px 14px' }}>⚠️ Needs Review</span>;
    } else {
      return <span className="badge badge-red" style={{ fontSize: '14px', padding: '6px 14px' }}>🛑 At Risk</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Header Card */}
      <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', tracking: '1px', fontWeight: 700, color: 'var(--accent)' }}>TARGET CAREER GOAL</span>
            <h1 style={{ fontSize: '32px', marginTop: '4px', marginBottom: '8px', color: 'var(--text-primary)' }}>
              {careerGoal.career?.career_name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '650px' }}>
              {careerGoal.career?.description}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            {getFeasibilityBadge(feasibility)}
            <button onClick={handleRunAnalysis} disabled={analyzing} className="btn btn-secondary">
              {analyzing ? <LoadingSpinner size="small" /> : '⚡ Re-Run Analysis'}
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Match Percentage & Overview */}
      {analysis && (
        <div className="grid-2">
          <div className="card" style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '30px' }}>
            <div style={{ width: '150px', flexShrink: 0 }}>
              <DonutChart percentage={analysis.match_percentage} />
            </div>
            <div>
              <h2 style={{ fontSize: '36px', color: 'var(--accent)', marginBottom: '4px', fontWeight: 800 }}>
                {analysis.match_percentage}%
              </h2>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Overall Skill Match</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                Your current proficiency matches {analysis.match_percentage}% of the total weighted industry skill requirements.
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity color="var(--accent)" size={22} /> Key Analysis Findings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: '6px' }}>
                <span>Total Required Skills:</span>
                <strong>{analysis.gaps.length} skills</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: '6px' }}>
                <span>Achieved / Strong Skills:</span>
                <strong style={{ color: 'var(--accent-green)' }}>{strengths.length} skills</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: '6px' }}>
                <span>Skills Needing Improvement / Missing:</span>
                <strong style={{ color: 'var(--danger)' }}>{skillsToImprove.length} skills</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRENGTHS SECTION */}
      {strengths.length > 0 && (
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={24} /> YOUR STRENGTHS ({strengths.length})
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            Your current proficiency meets or exceeds the industry requirement for these skills.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {strengths.map((item, idx) => (
              <div key={idx} style={{ padding: '14px 18px', background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: '16px' }}>{item.skill?.skill_name}</div>
                <div style={{ fontSize: '13px', color: '#047857', marginTop: '4px' }}>
                  Your Level: <strong>{item.student_level}/10</strong> | Req: {item.required_level}/10
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SKILLS TO IMPROVE SECTION */}
      {skillsToImprove.length > 0 && (
        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={24} /> SKILLS TO IMPROVE ({skillsToImprove.length})
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
            These skill gaps will form your personalized learning roadmap.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Skill Name</th>
                  <th>Current Level</th>
                  <th>Required Level</th>
                  <th>Skill Gap</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Importance Weight</th>
                </tr>
              </thead>
              <tbody>
                {skillsToImprove.map((item, idx) => {
                  const priority = item.classification === 'Missing' || item.classification === 'Major Gap' ? 'HIGH' : 'MEDIUM';
                  return (
                    <tr key={idx}>
                      <td><strong>{item.skill?.skill_name}</strong></td>
                      <td>{item.student_level}/10</td>
                      <td>{item.required_level}/10</td>
                      <td><span style={{ color: 'var(--danger)', fontWeight: 700 }}>-{item.gap}</span></td>
                      <td>
                        <span className={'badge ' + (item.classification === 'Missing' ? 'badge-red' : item.classification === 'Major Gap' ? 'badge-red' : 'badge-yellow')}>
                          {item.classification}
                        </span>
                      </td>
                      <td>
                        <span className={'badge ' + (priority === 'HIGH' ? 'badge-red' : 'badge-yellow')}>
                          {priority}
                        </span>
                      </td>
                      <td>{item.importance_weight}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CTA Button to Personalized Roadmap */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={() => navigate('/roadmap')} className="btn btn-primary btn-lg" style={{ padding: '16px 36px', fontSize: '18px', borderRadius: '10px' }}>
          View Personalized Roadmap →
        </button>
      </div>

    </div>
  );
}
