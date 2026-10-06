import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profile } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Sliders, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [education, setEducation] = useState(user?.education || 'B.Tech');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [learningPref, setLearningPref] = useState('Self Learning');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await profile.updateProfile({ name, education });
      setSuccessMsg('Profile settings saved successfully.');
    } catch (err) {
      setErrorMsg('Error updating profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Header */}
      <div className="card" style={{ padding: '28px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)' }}>
        <span className="badge badge-teal" style={{ marginBottom: '8px' }}>PREFERENCES & ACCOUNT</span>
        <h1 style={{ fontSize: '30px', margin: '4px 0', color: 'var(--text-primary)' }}>
          Settings & Account Preferences
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Manage your account profile details and learning preferences.
        </p>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {errorMsg && <ErrorMessage message={errorMsg} />}

      {/* Account Settings */}
      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="var(--accent)" /> Student Profile Settings
        </h2>

        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Education / Specialization</label>
            <input type="text" className="form-input" value={education} onChange={e => setEducation(e.target.value)} required />
          </div>

          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <LoadingSpinner size="small" /> : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Preferences */}
      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={20} color="var(--accent)" /> Learning Preferences
        </h2>

        <div className="form-group">
          <label className="form-label">Default Learning Mode</label>
          <select className="form-select" value={learningPref} onChange={e => setLearningPref(e.target.value)}>
            <option value="Self Learning">Self Learning</option>
            <option value="Online Courses">Online Courses</option>
            <option value="Projects">Projects</option>
            <option value="College Curriculum">College Curriculum</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>
      </div>

      {/* Security Info */}
      <div className="card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="var(--accent-green)" /> Security & Session
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Authenticated via JWT Bearer Token with direct crypt password encryption.
        </p>
      </div>

    </div>
  );
}
