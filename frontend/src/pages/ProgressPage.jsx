import React, { useState, useEffect } from 'react';
import { roadmap, careers } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ProgressBar from '../components/ProgressBar';
import { CheckCircle2, Circle, PlayCircle, Award, TrendingUp } from 'lucide-react';

export default function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await roadmap.getProgress();
        setProgress(res);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch learning progress metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><LoadingSpinner size="large" /></div>;

  const completionPercent = progress?.completion_pct || 0;
  const completedCount = progress?.completed || 0;
  const totalCount = progress?.total || 0;
  const items = progress?.items || [];

  let motivationalMsg = 'Great start! Keep working through your foundational skills.';
  if (completionPercent >= 75) motivationalMsg = 'Almost there! You are nearly career-ready.';
  else if (completionPercent >= 50) motivationalMsg = 'Excellent! You are more than halfway through your roadmap.';
  else if (completionPercent >= 25) motivationalMsg = 'Good progress! Keep completing your skill goals.';

  const groupedItems = items.reduce((acc, item) => {
    const p = item.phase || item.phase_number || 1;
    if (!acc[p]) acc[p] = [];
    acc[p].push(item);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
        <span className="badge badge-blue" style={{ marginBottom: '8px' }}>LEARNING MILESTONES</span>
        <h1 style={{ fontSize: '30px', margin: '4px 0', color: 'var(--text-primary)' }}>
          Learning Progress & Milestones
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Target Career: <strong>{progress?.career_name || 'Software Developer'}</strong>
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Completion Card */}
      <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--accent)', marginBottom: '8px' }}>
          {completionPercent}%
        </div>
        <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 600 }}>
          {completedCount} of {totalCount} Skill Goals Completed
        </div>
        <div style={{ maxWidth: '600px', margin: '0 auto 20px auto' }}>
          <ProgressBar progress={completionPercent} />
        </div>
        <p style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>{motivationalMsg}</p>
      </div>

      {/* Phase Progression List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {Object.keys(groupedItems).sort((a,b)=>a-b).map(phaseNum => {
          const phaseSkills = groupedItems[phaseNum];
          const phaseCompleted = phaseSkills.filter(s => s.status === 'completed').length;
          
          return (
            <div key={phaseNum} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--primary)' }}>Phase {phaseNum}</h3>
                <span className="badge badge-gray">
                  {phaseCompleted} / {phaseSkills.length} completed
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {phaseSkills.map((s, idx) => {
                  const isDone = s.status === 'completed';
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: isDone ? '#d1fae5' : 'var(--surface-2)', borderRadius: '8px', border: isDone ? '1px solid #a7f3d0' : '1px solid var(--border)' }}>
                      {isDone ? <CheckCircle2 color="var(--accent-green)" size={20} style={{ marginRight: '12px' }} /> : <Circle color="var(--text-muted)" size={20} style={{ marginRight: '12px' }} />}
                      <strong style={{ fontSize: '15px', color: isDone ? '#065f46' : 'var(--text-primary)' }}>{s.skill_name}</strong>
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={'badge ' + (s.priority === 'High' ? 'badge-red' : 'badge-yellow')}>{s.priority} Priority</span>
                        <span className={'badge ' + (isDone ? 'badge-green' : 'badge-gray')}>{s.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
