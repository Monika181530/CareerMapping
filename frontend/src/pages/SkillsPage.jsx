import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { skills } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SkillsPage() {
  const [userSkills, setUserSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkillId, setNewSkillId] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(5);

  const fetchSkills = async () => {
    try {
      const [uSkills, aSkills] = await Promise.all([
        skills.getUserSkills(),
        skills.getAllSkills()
      ]);
      setUserSkills(uSkills);
      setAllSkills(aSkills);
    } catch (err) {
      setError('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleUpdate = async (skillId, level) => {
    try {
      await skills.updateUserSkill(skillId, { proficiency_level: parseInt(level) });
      setUserSkills(userSkills.map(s => s.skill.id === skillId ? { ...s, proficiency_level: parseInt(level) } : s));
    } catch (err) {
      alert('Failed to update skill');
    }
  };

  const handleDelete = async (skillId) => {
    try {
      await skills.deleteUserSkill(skillId);
      setUserSkills(userSkills.filter(s => s.skill.id !== skillId));
    } catch (err) {
      alert('Failed to delete skill');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillId) return;
    try {
      await skills.addUserSkill({ skill_id: newSkillId, proficiency_level: newSkillLevel });
      setShowAddForm(false);
      fetchSkills();
    } catch (err) {
      alert('Failed to add skill');
    }
  };

  const categories = ['All', ...new Set(allSkills.map(s => s.category))];
  const filteredSkills = activeCategory === 'All' ? userSkills : userSkills.filter(s => s.skill.category === activeCategory);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><LoadingSpinner /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>My Skills</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Total Skills: {userSkills.length}</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ padding: '10px 20px', borderRadius: '6px', background: 'var(--accent)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          {showAddForm ? 'Cancel' : '+ Add Skill'}
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {showAddForm && (
        <form onSubmit={handleAddSkill} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Select Skill</label>
            <select value={newSkillId} onChange={e => setNewSkillId(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}>
              <option value="">-- Choose Skill --</option>
              {allSkills.filter(s => !userSkills.find(us => us.skill.id === s.id)).map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Proficiency Level (1-10): {newSkillLevel}</label>
            <input type="range" min="1" max="10" value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)} style={{ width: '100%' }} />
          </div>
          <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', background: 'var(--accent-green)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', height: '42px' }}>Save</button>
        </form>
      )}

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border)', background: activeCategory === cat ? 'var(--accent)' : 'var(--surface-2)', color: activeCategory === cat ? '#fff' : 'var(--text-primary)', cursor: 'pointer' }}>{cat}</button>
        ))}
      </div>

      {filteredSkills.length === 0 ? (
        <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No skills found in this category.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredSkills.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', gap: '16px' }}>
              <div style={{ flex: '1 1 200px' }}>
                <h4 style={{ margin: '0 0 4px 0' }}>{item.skill.name}</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.skill.category}</span>
              </div>
              <div style={{ flex: '2 1 300px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input type="range" min="1" max="10" value={item.proficiency_level} onChange={(e) => handleUpdate(item.skill.id, e.target.value)} style={{ flex: 1 }} />
                <span style={{ width: '40px', textAlign: 'right' }}>{item.proficiency_level}/10</span>
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <div style={{ width: '100%', height: '8px', background: 'var(--surface-2)', borderRadius: '4px' }}>
                  <div style={{ width: `${item.proficiency_level * 10}%`, height: '100%', background: 'var(--accent)', borderRadius: '4px' }}></div>
                </div>
              </div>
              <button onClick={() => handleDelete(item.skill.id)} style={{ padding: '8px 12px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
