import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { admin } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Shield, Users, Target, BookOpen, Clock, Activity, CheckCircle,
  AlertTriangle, XCircle, Search, Filter, Plus, Edit2, Trash2,
  Eye, EyeOff, LogOut, ExternalLink, RefreshCw, Key, ChevronRight, X, Sparkles
} from 'lucide-react';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [feasibilityFilter, setFeasibilityFilter] = useState('all');
  const [showAllPasswords, setShowAllPasswords] = useState(true);

  // Modals
  const [dossierUserId, setDossierUserId] = useState(null);
  const [dossierData, setDossierData] = useState(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', password: '', education: '', role: 'student' });
  const [savingEdit, setSavingEdit] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', education: '', role: 'student' });
  const [addingUser, setAddingUser] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  // Load Admin Data
  const fetchData = async () => {
    setError('');
    try {
      const [ovData, usersData] = await Promise.all([
        admin.getOverview(),
        admin.getUsers()
      ]);
      setOverview(ovData);
      setUsersList(usersData);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to load administrative records.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Open Dossier
  const handleOpenDossier = async (uId) => {
    setDossierUserId(uId);
    setLoadingDossier(true);
    setDossierData(null);
    try {
      const data = await admin.getUserDossier(uId);
      setDossierData(data);
    } catch (err) {
      setError('Could not load user dossier details.');
    } finally {
      setLoadingDossier(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (u) => {
    setEditUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      password: u.password !== '(Managed via hash)' ? u.password : '',
      education: u.education || '',
      role: u.role || 'student'
    });
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setSavingEdit(true);
    setError('');
    try {
      await admin.updateUser(editUser.id, editForm);
      setSuccess(`User #${editUser.id} (${editForm.name}) updated successfully.`);
      setEditUser(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update user.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Add User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    setError('');
    try {
      await admin.createUser(addForm);
      setSuccess(`User '${addForm.name}' created successfully.`);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', education: '', role: 'student' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user.');
    } finally {
      setAddingUser(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${u.name}" (${u.email})? All associated career goals, audited skills, roadmaps, and records will be deleted.`)) {
      return;
    }
    setDeletingId(u.id);
    setError('');
    try {
      await admin.deleteUser(u.id);
      setSuccess(`User '${u.name}' has been deleted.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      // Feasibility filter
      if (feasibilityFilter !== 'all') {
        const uStatus = (u.feasibility_status || '').toLowerCase().trim();
        if (feasibilityFilter === 'feasible' && uStatus !== 'feasible') return false;
        if (feasibilityFilter === 'needs_review' && uStatus !== 'needs review') return false;
        if (feasibilityFilter === 'not_feasible' && uStatus !== 'not feasible') return false;
        if (feasibilityFilter === 'not_evaluated' && uStatus !== 'not evaluated') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = (u.name || '').toLowerCase().includes(q);
        const inEmail = (u.email || '').toLowerCase().includes(q);
        const inEdu = (u.education || '').toLowerCase().includes(q);
        const inPass = (u.password || '').toLowerCase().includes(q);
        const inGoal = (u.career_goal?.name || '').toLowerCase().includes(q);
        if (!inName && !inEmail && !inEdu && !inPass && !inGoal) return false;
      }

      return true;
    });
  }, [usersList, searchQuery, roleFilter, feasibilityFilter]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-3)' }}>
        <LoadingSpinner size="large" />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Authenticating Administrator Session & Loading Master Records...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-3)' }}>
      {/* Top Admin Navbar */}
      <nav style={{ background: '#0f172a', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', borderBottom: '1px solid #334155', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎯 CareerPath
          </span>
          <span style={{ background: 'rgba(168, 85, 247, 0.25)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.5)', padding: '3px 10px', borderRadius: '14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Shield size={12} /> Master Admin Console
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user?.email || 'admin@career.com'}</div>
          </div>

          <Link
            to="/dashboard"
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Student Portal View</span>
            <ExternalLink size={13} />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '32px 24px', flex: 1 }}>
        {/* Alerts */}
        {error && <div style={{ marginBottom: '20px' }}><ErrorMessage message={error} /></div>}
        {success && (
          <div style={{ padding: '14px 18px', background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} color="#10b981" /> {success}
            </span>
            <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Overview KPI Cards */}
        {overview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div className="card" style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL REGISTERED USERS</span>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', padding: '8px', borderRadius: '8px' }}>
                  <Users size={18} />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                {overview.total_users}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Students: <strong>{overview.total_students}</strong> &bull; Admins: <strong>{overview.total_admins}</strong>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>ACTIVE CAREER GOALS</span>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)', padding: '8px', borderRadius: '8px' }}>
                  <Target size={18} />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                {overview.total_goals}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Onboarded Profiles: <strong>{overview.onboarded_count}</strong>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>INDUSTRY CATALOGS</span>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '8px', borderRadius: '8px' }}>
                  <BookOpen size={18} />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                {overview.total_careers}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Core Technical Skills: <strong>{overview.total_skills}</strong>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>FEASIBILITY HEALTH</span>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '8px', borderRadius: '8px' }}>
                  <Activity size={18} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#047857', fontWeight: 700 }}>
                  🟢 {overview.feasibility_distribution.feasible} Feasible
                </span>
                <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', background: '#fffbeb', color: '#b45309', fontWeight: 700 }}>
                  🟡 {overview.feasibility_distribution.needs_review} Review
                </span>
                <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '6px', background: '#fef2f2', color: '#b91c1c', fontWeight: 700 }}>
                  🔴 {overview.feasibility_distribution.not_feasible} At Risk
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action & Filter Bar */}
        <div style={{ background: 'var(--surface)', padding: '18px 24px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, password, college, or career goal..."
              className="form-input"
              style={{ paddingLeft: '38px', width: '100%', fontSize: '13px' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-select"
              style={{ fontSize: '13px', padding: '8px 12px' }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="admin">Administrators Only</option>
            </select>

            <select
              value={feasibilityFilter}
              onChange={(e) => setFeasibilityFilter(e.target.value)}
              className="form-select"
              style={{ fontSize: '13px', padding: '8px 12px' }}
            >
              <option value="all">All Feasibility</option>
              <option value="feasible">Feasible Only</option>
              <option value="needs_review">Needs Review Only</option>
              <option value="not_feasible">Not Feasible Only</option>
              <option value="not_evaluated">Not Evaluated</option>
            </select>

            <button
              onClick={() => setShowAllPasswords(!showAllPasswords)}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {showAllPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showAllPasswords ? 'Mask Passwords' : 'Show Passwords'}</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              <Plus size={16} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Master User Table */}
        <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--accent)" />
              <span>User Accounts & Academic Credentials Directory</span>
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing <strong>{filteredUsers.length}</strong> of {usersList.length} user records
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px', width: '50px' }}>ID</th>
                  <th style={{ padding: '12px 16px' }}>Student / User</th>
                  <th style={{ padding: '12px 16px' }}>Login Password</th>
                  <th style={{ padding: '12px 16px' }}>Education / Institution</th>
                  <th style={{ padding: '12px 16px' }}>Target Career Goal</th>
                  <th style={{ padding: '12px 16px' }}>Match & Feasibility</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No user records found matching the current search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isFeasible = u.feasibility_status === 'Feasible';
                    const isNeedsReview = u.feasibility_status === 'Needs Review';
                    const isNotFeasible = u.feasibility_status === 'Not Feasible';

                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                        {/* ID */}
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          #{u.id}
                        </td>

                        {/* Name & Email */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                            {u.name}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                            {u.email}
                          </div>
                        </td>

                        {/* Password */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                            <Key size={12} color="var(--accent)" />
                            <code style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {showAllPasswords ? u.password : '••••••••'}
                            </code>
                          </div>
                        </td>

                        {/* Education / Institution */}
                        <td style={{ padding: '14px 16px', maxWidth: '240px' }}>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                            {u.education || 'Not specified'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {u.onboarding_completed ? '✅ Onboarded' : '⏳ Pending Onboarding'}
                          </div>
                        </td>

                        {/* Target Goal */}
                        <td style={{ padding: '14px 16px' }}>
                          {u.career_goal ? (
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {u.career_goal.name}
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {u.career_goal.industry} &bull; {u.skills_count} skills audited
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None selected</span>
                          )}
                        </td>

                        {/* Match & Feasibility */}
                        <td style={{ padding: '14px 16px' }}>
                          {u.feasibility_status !== 'Not Evaluated' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  display: 'inline-block',
                                  width: 'fit-content',
                                  background: isFeasible ? '#ecfdf5' : isNeedsReview ? '#fffbeb' : '#fef2f2',
                                  color: isFeasible ? '#047857' : isNeedsReview ? '#b45309' : '#b91c1c'
                                }}
                              >
                                {u.feasibility_status}
                              </span>
                              {u.skill_match_pct !== null && (
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                  Match: <strong>{u.skill_match_pct}%</strong>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Not Evaluated</span>
                          )}
                        </td>

                        {/* Role */}
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              background: u.role === 'admin' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                              color: u.role === 'admin' ? '#9333ea' : 'var(--accent)'
                            }}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            {/* Inspect Dossier */}
                            <button
                              onClick={() => handleOpenDossier(u.id)}
                              title="Inspect Full Academic Dossier"
                              style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: 'var(--accent)',
                                border: 'none',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                fontWeight: 600
                              }}
                            >
                              <Eye size={14} /> Dossier
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenEdit(u)}
                              title="Edit User Profile"
                              style={{
                                background: 'var(--surface-2)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Delete */}
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                disabled={deletingId === u.id}
                                title="Delete User Account"
                                style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  border: 'none',
                                  padding: '6px 8px',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL 1: Full Academic & Skill Dossier */}
      {dossierUserId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '14px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 10 }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={18} color="var(--accent)" />
                  <span>Student Academic Dossier — User #{dossierUserId}</span>
                </h3>
              </div>
              <button onClick={() => setDossierUserId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {loadingDossier ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <LoadingSpinner size="large" />
                  <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Fetching complete academic portfolio...</p>
                </div>
              ) : dossierData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Personal & Credential summary */}
                  <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full Name</span>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{dossierData.user.name}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email (Login User)</span>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{dossierData.user.email}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Password</span>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent)' }}>
                        <code>{dossierData.user.password}</code>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Institution / Education</span>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{dossierData.user.education || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Career Goal */}
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>🎯 Active Target Career Goal</h4>
                    {dossierData.career_goal ? (
                      <div style={{ padding: '14px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent)' }}>{dossierData.career_goal.career_name}</div>
                        <p style={{ margin: '4px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{dossierData.career_goal.description}</p>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                          Industry: <strong>{dossierData.career_goal.industry}</strong> &bull; Avg Salary: <strong>{dossierData.career_goal.salary}</strong>
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No target career goal selected yet.</p>
                    )}
                  </div>

                  {/* Audited Skills with Proficiency */}
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                      ⚡ Audited Technical Skills ({dossierData.skills.length})
                    </h4>
                    {dossierData.skills.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                        {dossierData.skills.map((sk) => (
                          <div key={sk.skill_id} style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '13px' }}>{sk.skill_name}</strong>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)' }}>Level {sk.proficiency_level}/10</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(sk.proficiency_level / 10) * 100}%`, height: '100%', background: 'var(--accent)' }} />
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{sk.category}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No skills entered yet.</p>
                    )}
                  </div>

                  {/* Learning Situation & Constraints */}
                  {dossierData.constraints && (
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>⏱️ Constraints & Time Availability</h4>
                      <div style={{ background: 'var(--surface-2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Weekly Hours:</span>
                          <div style={{ fontWeight: 700 }}>{dossierData.constraints.learning_hours_per_week || 15} hrs/week</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Target Deadline:</span>
                          <div style={{ fontWeight: 700 }}>{dossierData.constraints.career_deadline || 'Not set'}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Learning Mode:</span>
                          <div style={{ fontWeight: 700 }}>{dossierData.constraints.preferred_learning_mode || 'Self-paced'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Roadmap Milestones */}
                  {dossierData.roadmap && (
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>🗺️ Phased Learning Roadmap</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {dossierData.roadmap.items.map((item) => (
                          <div key={item.item_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '13px' }}>
                            <div>
                              <span style={{ fontWeight: 600 }}>Phase {item.phase_number}: {item.skill_name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                                (Target Level: {item.required_level} &bull; ~{item.estimated_weeks} wks)
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: item.status === 'completed' ? '#ecfdf5' : '#f1f5f9', color: item.status === 'completed' ? '#047857' : 'var(--text-secondary)' }}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit User */}
      {editUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '14px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)' }}>Edit User #{editUser.id}</h3>
              <button onClick={() => setEditUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">Email Address (Login Username)</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">Password (Update / Reset)</label>
                <input
                  type="text"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Enter new password to reset"
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">Education / Institution</label>
                <input
                  type="text"
                  value={editForm.education}
                  onChange={(e) => setEditForm({ ...editForm, education: e.target.value })}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">System Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditUser(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={savingEdit} className="btn btn-primary">
                  {savingEdit ? <LoadingSpinner size="small" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add New User */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '14px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)' }}>Create New User Account</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">Email (Login Username) *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@career.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">Password *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. secret123"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">Education / College</label>
                <input
                  type="text"
                  placeholder="e.g. B.E. CSE (Bannari Amman Institute of Tech)"
                  value={addForm.education}
                  onChange={(e) => setAddForm({ ...addForm, education: e.target.value })}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="form-label">Account Role</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={addingUser} className="btn btn-primary">
                  {addingUser ? <LoadingSpinner size="small" /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
