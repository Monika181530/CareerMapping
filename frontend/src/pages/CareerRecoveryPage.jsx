import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recovery, careers } from '../services/api';
import { Activity, Search, Calculator, BarChart2, CheckCircle, ArrowRight } from 'lucide-react';

const SkillBadge = ({ skill }) => (
  <span style={{ 
    display: 'inline-flex', 
    alignItems: 'center', 
    backgroundColor: '#dbeafe', 
    color: '#1e3a8a', 
    padding: '4px 12px', 
    borderRadius: '16px', 
    fontSize: '14px',
    margin: '4px'
  }}>
    {skill.name} <span style={{ marginLeft: '4px', opacity: 0.7 }}> (Lvl {skill.level || 5})</span>
  </span>
);

const CareerRecoveryPage = () => {
  const [careerGoal, setCareerGoal] = useState(null);
  const [transferableSkills, setTransferableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [goal, skills] = await Promise.all([
          careers.getCareerGoal(),
          recovery.getTransferableSkills()
        ]);
        setCareerGoal(goal);
        setTransferableSkills(skills?.filter(s => s.level >= 5) || []);
      } catch (err) {
        setError('Failed to load data for recovery engine.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    
    // Simulate steps for UX
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    
    setStep(1);
    await delay(800);
    setStep(2);
    await delay(800);
    setStep(3);
    await delay(800);
    setStep(4);
    await delay(800);
    
    try {
      await recovery.analyze({ include_interests: true });
      setStep(5);
      await delay(800);
      navigate('/alternatives');
    } catch (err) {
      setError('Analysis failed. Please try again.');
      setAnalyzing(false);
      setStep(0);
    }
  };

  const steps = [
    { num: 1, text: 'Identifying transferable skills...', icon: Activity },
    { num: 2, text: 'Searching alternative careers...', icon: Search },
    { num: 3, text: 'Calculating skill reuse scores...', icon: Calculator },
    { num: 4, text: 'Ranking alternatives by recovery score...', icon: BarChart2 },
    { num: 5, text: 'Analysis complete!', icon: CheckCircle }
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Recovery Engine...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '8px', color: '#111827' }}>Career Recovery Engine</h1>
      <p style={{ color: '#4b5563', marginBottom: '32px', fontSize: '18px' }}>Pivot to a new path while maximizing your existing skills.</p>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginTop: 0, marginBottom: '16px' }}>How it works</h2>
          <ul style={{ paddingLeft: '20px', color: '#4b5563', lineHeight: '1.6' }}>
            <li><strong>Identify transferable skills:</strong> We find which of your strong skills can be reused.</li>
            <li><strong>Find alternatives:</strong> We scan the market for careers matching your skill profile.</li>
            <li><strong>Calculate skill reuse:</strong> We measure how much of your current knowledge applies.</li>
            <li><strong>Rank by recovery score:</strong> We suggest the paths of least resistance to your new goal.</li>
          </ul>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginTop: 0, marginBottom: '8px' }}>Current Target: {careerGoal?.name || 'Unknown'}</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>If this path is no longer feasible, use your strong transferable skills to pivot.</p>
          
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Your Strong Transferable Skills (Level 5+)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {transferableSkills.length > 0 ? (
              transferableSkills.map((skill, idx) => <SkillBadge key={idx} skill={skill} />)
            ) : (
              <span style={{ color: '#9ca3af' }}>No strong transferable skills found.</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '40px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
        {!analyzing ? (
          <div>
            <button 
              onClick={runAnalysis}
              style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '16px 32px', fontSize: '18px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)' }}
            >
              <Activity size={24} />
              Run Career Recovery Analysis
            </button>
            <div style={{ marginTop: '16px' }}>
              <button onClick={() => navigate('/alternatives')} style={{ background: 'none', border: 'none', color: '#2563eb', textDecoration: 'underline', cursor: 'pointer' }}>
                View previous results
              </button>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '24px' }}>Analyzing Options...</h3>
            {steps.map((s) => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', opacity: step >= s.num ? 1 : 0.3 }}>
                {step === s.num && step < 5 ? (
                  <div className="spinner"><Activity size={24} color="#2563eb" /></div>
                ) : (
                  <s.icon size={24} color={step > s.num || step === 5 ? '#10b981' : '#9ca3af'} />
                )}
                <span style={{ fontWeight: step === s.num ? 'bold' : 'normal', color: step >= s.num ? '#1f2937' : '#9ca3af' }}>
                  {s.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1.5s linear infinite; display: inline-flex; }
      `}} />
    </div>
  );
};

export default CareerRecoveryPage;
