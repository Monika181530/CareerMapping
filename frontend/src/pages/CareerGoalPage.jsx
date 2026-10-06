import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { careers } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CareerGoalPage() {
  const [allCareers, setAllCareers] = useState([]);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const [careersRes, goalRes] = await Promise.allSettled([
          careers.getAllCareers(),
          careers.getCareerGoal()
        ]);
        if (careersRes.status === 'fulfilled') setAllCareers(careersRes.value);
        if (goalRes.status === 'fulfilled' && goalRes.value) {
          setCurrentGoal(goalRes.value);
          setSelectedId(goalRes.value.career_id);
        }
      } catch (err) {
        setError('Failed to load careers data');
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await careers.setCareerGoal({ career_id: selectedId });
      setSuccess('Career goal saved successfully!');
      setTimeout(() => navigate('/analysis'), 1500);
    } catch (err) {
      setError('Failed to save career goal');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><LoadingSpinner /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1>Career Goal</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Select a target career to get a personalized skill analysis and learning roadmap.</p>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <div style={{ padding: '16px', background: 'rgba(46, 204, 113, 0.2)', color: 'var(--accent-green)', borderRadius: '6px', border: '1px solid var(--accent-green)' }}>{success} Redirecting to analysis...</div>}

      {currentGoal && (
        <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <strong>Current Goal:</strong> <span style={{ color: 'var(--accent)' }}>{currentGoal.career.career_name}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {allCareers.map(c => (
          <div key={c.id} onClick={() => setSelectedId(c.id)} style={{ background: selectedId === c.id ? 'var(--accent)' : 'var(--surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', color: selectedId === c.id ? 'white' : 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: selectedId === c.id ? '0 4px 12px rgba(0,0,0,0.2)' : 'none' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0' }}>{c.career_name}</h3>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>{c.industry}</span>
            </div>
            <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>{c.description ? (c.description.length > 100 ? c.description.substring(0, 100) + '...' : c.description) : 'No description available.'}</p>
            <div style={{ marginTop: 'auto', fontSize: '12px', fontWeight: 'bold' }}>
              Required Skills: {c.career_skills ? c.career_skills.length : 0}
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving || !selectedId || selectedId === currentGoal?.career_id} style={{ padding: '14px 24px', borderRadius: '8px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start', fontSize: '16px', marginTop: '16px' }}>
        {saving ? <LoadingSpinner size="small" /> : 'Save Career Goal'}
      </button>
    </div>
  );
}
