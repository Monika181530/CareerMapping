import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recovery } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Layers, CheckCircle, XCircle, ArrowRight, Info } from 'lucide-react';

export default function SkillReusePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReuseData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await recovery.getTransferableSkills();
        setData(res);
      } catch (err) {
        console.error(err);
        setError('Failed to load skill reuse transfer data.');
      } finally {
        setLoading(false);
      }
    };
    fetchReuseData();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><LoadingSpinner size="large" /></div>;

  const transferableSkills = data?.transferable_skills || [];
  const missingSkills = data?.missing_skills_for_alternative || [];
  const skillReuseScore = data?.skill_reuse_score || 82.0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Banner */}
      <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
        <span className="badge badge-teal" style={{ marginBottom: '8px' }}>TRANSFERABLE SKILLS MATRIX</span>
        <h1 style={{ fontSize: '30px', margin: '4px 0', color: 'var(--text-primary)' }}>
          Skill Reuse Analysis
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Transferring from <strong>{data?.original_career || 'Software Developer'}</strong> $\rightarrow$ <strong>{data?.top_alternative_career || 'Backend Developer'}</strong>
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Skill Reuse Score Banner */}
      <div className="card" style={{ padding: '24px', background: 'var(--surface-2)', borderLeft: '5px solid var(--accent-green)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--surface)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Skill Reuse Score</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-green)' }}>{skillReuseScore}%</div>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>Maximizing Your Hard-Earned Learning Effort</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                {data?.explanation || ('Your existing skills overlap strongly with ' + (data?.top_alternative_career || 'Backend Developer') + '. Pursuing this alternative minimizes redundant learning.')}
              </p>
          </div>
        </div>
      </div>

      {/* Transferable Skills Matrix Table */}
      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Skill Transfer & Reusability Matrix</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Category</th>
                <th>Your Level</th>
                <th>Target Transfer Status</th>
                <th>Action Required</th>
              </tr>
            </thead>
            <tbody>
              {transferableSkills.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.skill_name}</strong></td>
                  <td><span className="badge badge-gray">{item.category}</span></td>
                  <td>Level {item.proficiency_level}/10</td>
                  <td>
                    {item.is_reusable ? (
                      <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        ✓ Reusable
                      </span>
                    ) : (
                      <span className="badge badge-blue">
                        ✓ Foundational
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '13px' }}>
                      Preserved Effort
                    </span>
                  </td>
                </tr>
              ))}

              {missingSkills.map((skillName, idx) => (
                <tr key={'missing-' + idx}>
                  <td><strong>{skillName}</strong></td>
                  <td><span className="badge badge-gray">Required Skill</span></td>
                  <td>Level 0/10</td>
                  <td>
                    <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      ✗ New skill required
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '13px' }}>
                      Acquire in Roadmap
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Breakdown Card */}
      <div className="card" style={{ padding: '24px', background: 'var(--surface-3)' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={18} color="var(--accent)" /> Mathematical Formula Breakdown
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, fontFamily: 'monospace' }}>
          Skill Reuse Score = [ ∑ (Importance Weight × min(Student Level, Required Level)) / ∑ (Importance Weight × Required Level) ] × 100 = <strong>{skillReuseScore}%</strong>
        </p>
      </div>

    </div>
  );
}
