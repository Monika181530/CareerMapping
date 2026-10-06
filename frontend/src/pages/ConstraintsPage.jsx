import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { profile } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ConstraintsPage() {
  const [learningHours, setLearningHours] = useState(10);
  const [deadline, setDeadline] = useState('');
  const [learningMode, setLearningMode] = useState('Self-paced');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchConstraints = async () => {
      try {
        const data = await profile.getConstraints();
        if (data) {
          if (data.learning_hours_per_week) setLearningHours(data.learning_hours_per_week);
          if (data.career_deadline) setDeadline(data.career_deadline.split('T')[0]);
          if (data.preferred_learning_mode) setLearningMode(data.preferred_learning_mode);
          if (data.career_preferences) setPreferences(data.career_preferences);
        }
      } catch (err) {
        setError('Failed to load constraints');
      } finally {
        setLoading(false);
      }
    };
    fetchConstraints();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await profile.setConstraints({
        learning_hours_per_week: parseInt(learningHours),
        career_deadline: deadline,
        preferred_learning_mode: learningMode,
        career_preferences: preferences
      });
      setSuccess('Learning constraints updated successfully!');
    } catch (err) {
      setError('Failed to update constraints');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><LoadingSpinner /></div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1>Learning Constraints</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Update your learning preferences to customize your roadmap generation.</p>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <div style={{ padding: '16px', background: 'rgba(46, 204, 113, 0.2)', color: 'var(--accent-green)', borderRadius: '6px', border: '1px solid var(--accent-green)' }}>{success}</div>}

      <form onSubmit={handleSave} style={{ background: 'var(--surface)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Learning Hours per Week: <strong style={{ color: 'var(--text-primary)' }}>{learningHours} hrs</strong></label>
          <input type="range" min="1" max="40" value={learningHours} onChange={e => setLearningHours(e.target.value)} style={{ width: '100%' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Career Goal Target Date</label>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-secondary)' }}>Preferred Learning Mode</label>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Self-paced', 'Instructor-led', 'Mixed'].map(mode => (
              <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="learningMode" value={mode} checked={learningMode === mode} onChange={e => setLearningMode(e.target.value)} />
                {mode}
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Career Preferences / Notes</label>
          <textarea value={preferences} onChange={e => setPreferences(e.target.value)} rows={4} style={{ width: '100%', padding: '12px', borderRadius: '6px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} placeholder="Any specific tools, frameworks, or domain preferences..."></textarea>
        </div>

        <button type="submit" disabled={saving} style={{ padding: '14px', borderRadius: '6px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
          {saving ? <LoadingSpinner size="small" /> : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}
