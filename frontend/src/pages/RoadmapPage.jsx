import React, { useState, useEffect } from 'react';
import { roadmap, careers } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { CheckCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react';

export default function RoadmapPage() {
  const [roadmapData, setRoadmapData] = useState(null);
  const [careerGoal, setCareerGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchRoadmap = async () => {
    try {
      const [rmRes, cgRes] = await Promise.all([
        roadmap.getRoadmap().catch(() => null),
        careers.getCareerGoal().catch(() => null)
      ]);
      setRoadmapData(rmRes);
      setCareerGoal(cgRes);
    } catch (err) {
      setError('Failed to fetch roadmap data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const newRoadmap = await roadmap.generate();
      setRoadmapData(newRoadmap);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate roadmap.');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkComplete = async (itemId) => {
    try {
      await roadmap.updateItem(itemId, { status: 'completed' });
      fetchRoadmap();
    } catch (err) {
      alert('Failed to update item status');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><LoadingSpinner size="large" /></div>;

  if (!roadmapData && !generating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <h2>No Personalized Roadmap Yet</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Click below to dynamically generate a learning roadmap from your missing skills.</p>
        <button onClick={handleGenerate} className="btn btn-primary btn-lg">
          ⚡ Generate Personalized Roadmap
        </button>
      </div>
    );
  }

  if (generating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <LoadingSpinner size="large" />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Analyzing missing skills and generating phase-based roadmap...</p>
      </div>
    );
  }

  const items = roadmapData?.items || [];
  const groupedItems = items.reduce((acc, item) => {
    const p = item.phase_number;
    if (!acc[p]) acc[p] = [];
    acc[p].push(item);
    return acc;
  }, {});

  const totalItems = items.length;
  const completedItems = items.filter(i => i.status === 'completed').length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Header */}
      <div className="card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>Personalized Learning Roadmap</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Dynamic trajectory for <strong>{careerGoal?.career?.career_name || roadmapData?.career?.career_name}</strong>
          </p>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="btn btn-secondary">
          <RefreshCw size={16} /> Regenerate Roadmap
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Progress Bar Container */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px' }}>
          <strong>Roadmap Completion Status</strong>
          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{completedItems} / {totalItems} Tasks Completed ({progressPct}%)</span>
        </div>
        <ProgressBar progress={progressPct} />
      </div>

      {/* Vertical Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {Object.keys(groupedItems).sort((a,b)=>a-b).map(phaseNum => (
          <div key={phaseNum} style={{ display: 'flex', gap: '24px' }}>
            
            {/* Phase Badge Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', zIndex: 2, boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>
                {phaseNum}
              </div>
              <div style={{ width: '3px', flex: 1, background: 'var(--border)', margin: '8px 0' }}></div>
            </div>

            {/* Phase Content Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>Phase {phaseNum}</h3>
                <span className="badge badge-gray">{groupedItems[phaseNum].length} Skill Goals</span>
              </div>

              {groupedItems[phaseNum].map(item => {
                const name = item.skill?.skill_name || item.skill_name;
                const isDone = item.status === 'completed';
                return (
                  <div key={item.id} className="card" style={{ padding: '22px', borderLeft: isDone ? '4px solid var(--accent-green)' : '4px solid var(--accent)', opacity: isDone ? 0.8 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>{name}</h4>
                          <span className={'badge ' + (item.priority === 'High' ? 'badge-red' : 'badge-yellow')}>
                            {item.priority} Priority
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span>⏱️ Estimated: <strong>{item.estimated_weeks} weeks</strong></span>
                          <span>Level Increase: <strong>{item.current_level}/10 → {item.required_level}/10</strong></span>
                        </div>
                      </div>

                      <div>
                        {isDone ? (
                          <span className="badge badge-green" style={{ padding: '6px 12px' }}>✓ Completed</span>
                        ) : (
                          <button onClick={() => handleMarkComplete(item.id)} className="btn btn-sm btn-success">
                            Mark Complete ✓
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
