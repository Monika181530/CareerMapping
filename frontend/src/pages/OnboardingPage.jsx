import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { skills, profile, careers, skillGap, roadmap } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Personal Information
  const [fullName, setFullName] = useState(user?.name || '');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');

  // Step 2: Education
  const [highestEducation, setHighestEducation] = useState(user?.education || 'B.E / B.Tech');
  const [specialization, setSpecialization] = useState('Information Technology');
  const [currentYear, setCurrentYear] = useState('3rd Year');
  const [institution, setInstitution] = useState('');

  // Step 3: Current Skills
  const [availableSkills, setAvailableSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customSkillName, setCustomSkillName] = useState('');

  // Step 4: Interests
  const defaultInterestOptions = [
    'Software Development', 'Web Development', 'Data Analysis',
    'Artificial Intelligence', 'Machine Learning', 'Cybersecurity',
    'Cloud Computing', 'DevOps', 'Testing / QA', 'Database',
    'UI/UX', 'Business Analysis', 'Problem Solving', 'Research'
  ];
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [otherInterest, setOtherInterest] = useState('');

  // Step 5: Career Goal
  const [availableCareers, setAvailableCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [careerSearch, setCareerSearch] = useState('');

  // Step 6: Constraints
  const [learningHours, setLearningHours] = useState(15);
  const [targetDate, setTargetDate] = useState('');
  const [learningMethod, setLearningMethod] = useState('Self Learning');
  const [selectedPreferences, setSelectedPreferences] = useState(['Technical work', 'Development', 'More problem solving']);
  const [additionalConstraint, setAdditionalConstraint] = useState('');

  const preferenceOptions = [
    'Remote work', 'Technical work', 'Development', 'Data-oriented work',
    'Less coding', 'More problem solving', 'Creative work', 'Research'
  ];

  useEffect(() => {
    // Load skills & careers from backend
    skills.getAllSkills()
      .then(res => setAvailableSkills(res || []))
      .catch(() => setError('Could not load skills list from server'));

    careers.getAllCareers()
      .then(res => setAvailableCareers(res || []))
      .catch(() => setError('Could not load careers list from server'));

    // Fetch existing user data if available
    skills.getUserSkills()
      .then(res => {
        if (res && res.length > 0) {
          setUserSkills(res.map(us => ({
            skill_id: us.skill_id,
            skill_name: us.skill?.skill_name || `Skill #${us.skill_id}`,
            proficiency_level: us.proficiency_level
          })));
        }
      })
      .catch(() => {});

    profile.getInterests()
      .then(res => {
        if (res && res.interests && res.interests.length > 0) {
          setSelectedInterests(res.interests);
        }
      })
      .catch(() => {});

    careers.getCareerGoal()
      .then(res => {
        if (res && res.career) {
          setSelectedCareer(res.career);
        }
      })
      .catch(() => {});

    profile.getConstraints()
      .then(res => {
        if (res && res.id !== 0) {
          if (res.learning_hours_per_week) setLearningHours(res.learning_hours_per_week);
          if (res.career_deadline) setTargetDate(res.career_deadline);
          if (res.preferred_learning_mode) setLearningMethod(res.preferred_learning_mode);
        }
      })
      .catch(() => {});

    profile.getProfile()
      .then(res => {
        if (res && res.name) setFullName(res.name);
      })
      .catch(() => {});
  }, []);

  const handleNext = () => {
    setError('');
    if (step === 1 && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (step === 3 && userSkills.length === 0) {
      setError('Please add at least one skill to proceed.');
      return;
    }
    if (step === 5 && !selectedCareer) {
      setError('Please select a target career goal.');
      return;
    }
    setStep(s => Math.min(s + 1, 7));
  };

  const handleBack = () => {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  };

  // Skill Handlers
  const handleAddSkill = (sk) => {
    if (!userSkills.some(s => s.skill_id === sk.id)) {
      setUserSkills([...userSkills, { skill_id: sk.id, skill_name: sk.skill_name, proficiency_level: 5 }]);
    }
  };

  const handleRemoveSkill = (skillId) => {
    setUserSkills(userSkills.filter(s => s.skill_id !== skillId));
  };

  const handleProficiencyChange = (skillId, level) => {
    setUserSkills(userSkills.map(s => s.skill_id === skillId ? { ...s, proficiency_level: parseInt(level) } : s));
  };

  // Interest Handlers
  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Preference Handlers
  const togglePreference = (pref) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== pref));
    } else {
      setSelectedPreferences([...selectedPreferences, pref]);
    }
  };

  // Final Action: Analyze My Career (Backend Submit)
  const handleAnalyzeCareer = async () => {
    setAnalyzing(true);
    setError('');
    try {
      // 1. Save user profile info
      await profile.updateProfile({ name: fullName, education: highestEducation + ' - ' + specialization });

      // 2. Save skills to backend
      await skills.bulkAddSkills(userSkills.map(s => ({ skill_id: s.skill_id, proficiency_level: s.proficiency_level })));

      // 3. Save interests
      const allInterestsList = [...selectedInterests];
      if (otherInterest.trim()) allInterestsList.push(otherInterest.trim());
      if (allInterestsList.length > 0) {
        await profile.setInterests({ interests: allInterestsList });
      }

      // 4. Save career goal
      if (selectedCareer) {
        await careers.setCareerGoal({ career_id: selectedCareer.id });
      }

      // 5. Save constraints
      await profile.setConstraints({
        learning_hours_per_week: parseInt(learningHours),
        career_deadline: targetDate || null,
        preferred_learning_mode: learningMethod,
        career_preferences: selectedPreferences.join(', ') + (additionalConstraint ? ' | Note: ' + additionalConstraint : '')
      });

      // 6. Mark onboarding completed
      await profile.completeOnboarding();

      // 7. Run skill gap analysis & generate roadmap
      await skillGap.analyze();
      await roadmap.generate();

      // 8. Redirect directly to Dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Failed to submit analysis request');
    } finally {
      setAnalyzing(false);
    }
  };

  const skillCategories = ['All', 'Programming', 'Web', 'Database', 'DevOps', 'Data Science', 'QA', 'Soft Skills'];
  const filteredSkills = availableSkills.filter(s => {
    if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
    return true;
  });

  const filteredCareers = availableCareers.filter(c => 
    c.career_name.toLowerCase().includes(careerSearch.toLowerCase()) ||
    c.industry.toLowerCase().includes(careerSearch.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sidebar-bg)', color: 'var(--text-primary)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', background: 'var(--surface)', padding: '40px', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: '28px', marginBottom: '8px' }}>🎯 Student Onboarding & Career Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Provide your inputs to generate a personalized skill-gap analysis and roadmap.</p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span>Progress</span>
            <span>{step <= 6 ? 'Step ' + step + ' of 6' : 'Summary & Final Analysis'}</span>
          </div>
          <div style={{ background: 'var(--surface-3)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-teal))', height: '100%', width: Math.round((step / 7) * 100) + '%', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* STEP CONTENT CONTAINER */}
        <div style={{ minHeight: '380px' }}>
          
          {/* STEP 1: Personal Information */}
          {step === 1 && (
            <div className="animate-fade">
              <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>Step 1 — Personal Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input type="text" className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Monika Student" required />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Age (Optional)</label>
                    <input type="number" className="form-input" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 21" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location (Optional)</label>
                    <input type="text" className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Mumbai, India" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Education */}
          {step === 2 && (
            <div className="animate-fade">
              <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>Step 2 — Education Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Highest Education *</label>
                    <select className="form-select" value={highestEducation} onChange={e => setHighestEducation(e.target.value)}>
                      <option value="Diploma">Diploma</option>
                      <option value="B.E / B.Tech">B.E / B.Tech</option>
                      <option value="B.Sc">B.Sc</option>
                      <option value="BCA">BCA</option>
                      <option value="MCA">MCA</option>
                      <option value="M.E / M.Tech">M.E / M.Tech</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Degree / Specialization *</label>
                    <input type="text" className="form-input" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g. Information Technology / Computer Science" />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Current Academic Status *</label>
                    <select className="form-select" value={currentYear} onChange={e => setCurrentYear(e.target.value)}>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Institution / College Name</label>
                    <input type="text" className="form-input" value={institution} onChange={e => setInstitution(e.target.value)} placeholder="e.g. National Institute of Technology" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Current Skills */}
          {step === 3 && (
            <div className="animate-fade">
              <h2 style={{ fontSize: '20px', marginBottom: '8px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>Step 3 — What skills do you currently have?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Select skills from our database or custom search, and specify your proficiency level (1 to 10).</p>
              
              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
                {skillCategories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className="chip" style={{ background: selectedCategory === cat ? 'var(--accent)' : 'var(--surface-2)', color: selectedCategory === cat ? 'white' : 'var(--text-primary)', border: selectedCategory === cat ? 'none' : '1px solid var(--border)' }}>
                    {cat}
                  </button>
                ))}
              </div>

              {/* Skill Picker Buttons */}
              <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', maxHeight: '140px', overflowY: 'auto', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {filteredSkills.map(sk => {
                  const isAdded = userSkills.some(s => s.skill_id === sk.id);
                  return (
                    <button key={sk.id} onClick={() => handleAddSkill(sk)} disabled={isAdded} className="btn btn-sm" style={{ background: isAdded ? 'var(--surface-3)' : 'var(--surface)', color: isAdded ? 'var(--text-muted)' : 'var(--text-primary)', border: '1px solid var(--border)', cursor: isAdded ? 'default' : 'pointer' }}>
                      {isAdded ? '✓ ' + sk.skill_name : '+ ' + sk.skill_name}
                    </button>
                  );
                })}
              </div>

              {/* Added Skills List */}
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Your Selected Skills ({userSkills.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                {userSkills.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', background: 'var(--surface-2)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                    No skills added yet. Click on the skill buttons above to add them.
                  </div>
                )}
                {userSkills.map(s => (
                  <div key={s.skill_id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ minWidth: '120px', fontWeight: 600 }}>{s.skill_name}</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="range" min="1" max="10" value={s.proficiency_level} onChange={e => handleProficiencyChange(s.skill_id, e.target.value)} style={{ flex: 1 }} />
                      <span className="badge badge-blue" style={{ minWidth: '90px', textAlign: 'center' }}>
                        Level {s.proficiency_level}/10 {s.proficiency_level >= 8 ? 'Advanced' : s.proficiency_level >= 5 ? 'Intermediate' : 'Beginner'}
                      </span>
                    </div>
                    <button onClick={() => handleRemoveSkill(s.skill_id)} className="btn btn-sm btn-danger">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Interests */}
          {step === 4 && (
            <div className="animate-fade">
              <h2 style={{ fontSize: '20px', marginBottom: '8px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>Step 4 — What areas are you interested in?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>Select all domain areas that align with your career preferences.</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                {defaultInterestOptions.map(option => {
                  const isSelected = selectedInterests.includes(option);
                  return (
                    <div key={option} onClick={() => toggleInterest(option)} className={'chip ' + (isSelected ? 'selected' : '')} style={{ padding: '10px 18px', fontSize: '14px', cursor: 'pointer' }}>
                      {isSelected ? '✓ ' : '+ '} {option}
                    </div>
                  );
                })}
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Other Specific Interest (Optional)</label>
                <input type="text" className="form-input" value={otherInterest} onChange={e => setOtherInterest(e.target.value)} placeholder="e.g. Blockchain Development, Quantum Computing" />
              </div>
            </div>
          )}

          {/* STEP 5: Career Goal */}
          {step === 5 && (
            <div className="animate-fade">
              <h2 style={{ fontSize: '20px', marginBottom: '8px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>Step 5 — What career are you currently aiming for?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Select your target career goal from our industry database.</p>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <input type="text" className="form-input" placeholder="🔍 Search career goal..." value={careerSearch} onChange={e => setCareerSearch(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px', maxHeight: '300px', overflowY: 'auto' }}>
                {filteredCareers.map(c => {
                  const isSelected = selectedCareer?.id === c.id;
                  return (
                    <div key={c.id} onClick={() => setSelectedCareer(c)} className="card" style={{ padding: '16px', cursor: 'pointer', border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)', background: isSelected ? '#dbeafe' : 'var(--surface-2)', transition: '0.2s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <h4 style={{ margin: 0, color: isSelected ? 'var(--accent)' : 'var(--text-primary)', fontSize: '16px' }}>{c.career_name}</h4>
                        <span className="badge badge-gray">{c.industry}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {selectedCareer && (
                <div style={{ marginTop: '20px', padding: '16px', background: 'var(--surface-3)', borderRadius: '8px', borderLeft: '4px solid var(--accent)' }}>
                  <strong>Selected Target Career:</strong> {selectedCareer.career_name}
                  <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>{selectedCareer.description}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Personal Constraints */}
          {step === 6 && (
            <div className="animate-fade">
              <h2 style={{ fontSize: '20px', marginBottom: '8px', borderBottom: '2px solid var(--border)', paddingBottom: '10px' }}>Step 6 — Tell us about your learning situation</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">1. Learning Hours Available per Week</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="range" min="1" max="40" value={learningHours} onChange={e => setLearningHours(e.target.value)} style={{ flex: 1 }} />
                      <span className="badge badge-blue" style={{ fontSize: '14px' }}>{learningHours} hrs / week</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">2. Target Deadline Date</label>
                    <input type="date" className="form-input" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">3. Preferred Learning Method</label>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {['Self Learning', 'Online Courses', 'Projects', 'College Curriculum', 'Mixed'].map(mode => (
                      <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                        <input type="radio" name="learningMode" value={mode} checked={learningMethod === mode} onChange={e => setLearningMode(e.target.value)} />
                        {mode}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">4. Career Work Preferences</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {preferenceOptions.map(pref => {
                      const isSelected = selectedPreferences.includes(pref);
                      return (
                        <div key={pref} onClick={() => togglePreference(pref)} className={'chip ' + (isSelected ? 'selected' : '')}>
                          {isSelected ? '✓ ' : '+ '} {pref}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">5. Additional Constraints / Notes (Optional)</label>
                  <textarea className="form-textarea" placeholder="e.g. Final year exams in May, focusing on backend..." value={additionalConstraint} onChange={e => setAdditionalConstraint(e.target.value)} rows={3}></textarea>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: SUMMARY & FINAL ANALYSIS TRIGGER */}
          {step === 7 && (
            <div className="animate-fade">
              <h2 style={{ fontSize: '22px', marginBottom: '16px', color: 'var(--primary)', textAlign: 'center' }}>📋 YOUR CAREER PROFILE SUMMARY</h2>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>Review your inputs before generating your quantitative skill gap analysis and roadmap.</p>

              <div style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Education</strong>
                  <div style={{ fontSize: '16px', fontWeight: 600 }}>{highestEducation} — {specialization} ({currentYear})</div>
                </div>

                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Target Career Goal</strong>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent)' }}>{selectedCareer?.career_name || 'Not Selected'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selectedCareer?.description}</div>
                </div>

                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Current Skills ({userSkills.length})</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {userSkills.map(s => (
                      <span key={s.skill_id} className="badge badge-blue">
                        {s.skill_name}: Level {s.proficiency_level}/10
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Selected Interests</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {selectedInterests.map(i => <span key={i} className="badge badge-green">{i}</span>)}
                    {otherInterest && <span className="badge badge-green">{otherInterest}</span>}
                  </div>
                </div>

                <div>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase' }}>Constraints & Preferences</strong>
                  <div style={{ fontSize: '14px', marginTop: '4px' }}>
                    ⏱️ <strong>{learningHours} hours/week</strong> | Preferred Mode: <strong>{learningMethod}</strong> {targetDate && ' | Target Date: ' + targetDate}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Preferences: {selectedPreferences.join(', ')}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button onClick={handleAnalyzeCareer} disabled={analyzing} className="btn btn-lg btn-primary" style={{ padding: '16px 40px', fontSize: '20px', borderRadius: '10px', width: '100%', justifyContent: 'center' }}>
                  {analyzing ? <LoadingSpinner size="medium" /> : '⚡ ANALYZE MY CAREER'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Navigation Buttons (Steps 1 to 6) */}
        {step <= 6 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <button onClick={handleBack} disabled={step === 1 || loading} className="btn btn-secondary">
              ← Back
            </button>
            <button onClick={handleNext} className="btn btn-primary">
              {step === 6 ? 'Review & Summary →' : 'Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
