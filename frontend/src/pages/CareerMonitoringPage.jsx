import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { monitoring, careers } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertCircle, RefreshCw, Calendar, Clock, ArrowRight, Activity, Compass, CheckCircle } from 'lucide-react';

export default function CareerMonitoringPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [learningHours, setLearningHours] = useState('15');
  const [deadline, setDeadline] = useState('');
  const [updating, setUpdating] = useState(false);

  const navigate = useNavigate();

  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await monitoring.getData();
      setData(res);
      if (res) {
        if (res.learning_hours_per_week) setLearningHours(String(res.learning_hours_per_week));
        if (res.career_deadline) setDeadline(res.career_deadline);
      }
    } catch (err) {
      setError('Failed to load career monitoring metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReanalyze = async (e) => {
    if (e) e.preventDefault();
    try {
      setUpdating(true);
      setError('');
      setSuccessMsg('');
      const updated = await monitoring.updateMonitoring({
        learning_hours_per_week: Number(learningHours),
        career_deadline: deadline || null
      });
      setData(updated);
      setSuccessMsg(`⚡ Career feasibility reanalyzed! Updated status: ${updated.feasibility_status}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to reanalyze career constraints.';
      setError(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><LoadingSpinner size="large" /></div>;

  const feasibility = data?.feasibility_status || 'Feasible';
  const matchPercent = data?.skill_match_pct || 0;
  const showRecoveryAlert = feasibility === 'Needs Review' || feasibility === 'Not Feasible';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-teal" style={{ marginBottom: '8px' }}>LIVE CAREER MONITORING</span>
            <h1 style={{ fontSize: '30px', margin: '6px 0', color: 'var(--text-primary)' }}>
              {data?.career_name || 'Target Career Objective'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              {data?.career_description || 'Track your feasibility and constraint alignment.'}
            </p>
          </div>
          <button onClick={handleReanalyze} disabled={updating} className="btn btn-primary">
            {updating ? <LoadingSpinner size="small" /> : '⚡ Reanalyze Career'}
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {successMsg && (
        <div className="card" style={{ padding: '16px', background: '#ecfdf5', borderColor: 'var(--accent-green)', color: '#065f46', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle size={20} color="var(--accent-green)" /> {successMsg}
        </div>
      )}

      {/* Recovery Alert Banner */}
      {showRecoveryAlert && (
        <div className="alert alert-warning" style={{ padding: '20px', borderRadius: '10px' }}>
          <AlertCircle size={28} color="var(--warning)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', color: '#92400e' }}>Your current career path feasibility is at risk ({feasibility})</h3>
            <p style={{ margin: 0, color: '#b45309', fontSize: '14px' }}>
              {data?.feasibility_reason || 'Your time constraints or skill gaps may make this career challenging within your target deadline. Explore alternative careers to reuse your existing skills.'}
            </p>
          </div>
          <button onClick={() => navigate('/career-recovery')} className="btn btn-warning" style={{ whiteSpace: 'nowrap' }}>
            Explore Career Recovery →
          </button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid-4">
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Feasibility Status</div>
          <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '8px', color: feasibility === 'Feasible' ? 'var(--accent-green)' : feasibility === 'Needs Review' ? 'var(--warning)' : 'var(--danger)' }}>
            {feasibility}
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Estimated Weeks Needed</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent)', marginTop: '8px' }}>
            {data?.weeks_needed || 0} weeks
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Available Weeks</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-teal)', marginTop: '8px' }}>
            {data?.available_weeks || 0} weeks
          </div>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Last Evaluated</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '12px' }}>
            {data?.monitored_at || 'Just now'}
          </div>
        </div>
      </div>

      {/* Constraints Update Form */}
      <div className="card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Update Learning Constraints</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Adjust your weekly learning availability or deadline date, then click <strong>Reanalyze Career</strong> to recalculate your feasibility.
        </p>

        <form onSubmit={handleReanalyze} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Available Learning Hours per Week</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} color="var(--accent)" />
                <input 
                  type="number" 
                  className="form-input" 
                  value={learningHours} 
                  onChange={e => setLearningHours(e.target.value)} 
                  min="1" max="168" required 
                />
                <span className="badge badge-blue">{learningHours} hrs/wk</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Career Deadline Date</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={20} color="var(--accent)" />
                <input 
                  type="date" 
                  className="form-input" 
                  value={deadline} 
                  onChange={e => setDeadline(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <button type="submit" disabled={updating} className="btn btn-lg btn-primary" style={{ padding: '14px 32px' }}>
              {updating ? <LoadingSpinner size="small" /> : '⚡ Reanalyze Career'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
