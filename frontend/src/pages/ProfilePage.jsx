import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { profile } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProfilePage() {
  const [prof, setProf] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const interestOptions = ['Software Development', 'Data Science', 'Web Development', 'Mobile Development', 'Problem Solving', 'AI/ML', 'Cybersecurity', 'Cloud Computing', 'Testing', 'Business Analysis', 'Database Management', 'DevOps'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profData, intData] = await Promise.all([
          profile.getProfile(),
          profile.getInterests()
        ]);
        setProf(profData);
        setInterests(intData.interests || []);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await profile.updateProfile(prof);
      await profile.setInterests({ interests });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><LoadingSpinner /></div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1>My Profile</h1>
      {error && <ErrorMessage message={error} />}
      {success && <div style={{ padding: '16px', background: 'rgba(46, 204, 113, 0.2)', color: 'var(--accent-green)', borderRadius: '6px', border: '1px solid var(--accent-green)' }}>{success}</div>}

      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '16px' }}>Personal Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Name</label>
            <input type="text" value={prof?.name || ''} onChange={e => setProf({...prof, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email (Read Only)</label>
            <input type="email" value={prof?.email || ''} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Education</label>
            <input type="text" value={prof?.education || ''} onChange={e => setProf({...prof, education: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }} />
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '16px' }}>Interests</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {interestOptions.map(interest => (
            <button key={interest} onClick={() => toggleInterest(interest)} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border)', background: interests.includes(interest) ? 'var(--accent)' : 'var(--surface-2)', color: interests.includes(interest) ? '#fff' : 'var(--text-primary)', cursor: 'pointer' }}>
              {interest}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{ padding: '12px', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' }}>
        {saving ? <LoadingSpinner size="small" /> : 'Save Profile'}
      </button>
    </div>
  );
}
