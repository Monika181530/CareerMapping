import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, User, BookOpen, Target, Clock, Activity,
  Map, MonitorPlay, ShieldAlert, GitBranch, GitCompare,
  Recycle, TrendingUp, Settings, LogOut, Shield
} from 'lucide-react';
import '../styles/global.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/skills', label: 'My Skills', icon: BookOpen },
  { path: '/career-goal', label: 'Career Goal', icon: Target },
  { path: '/constraints', label: 'Constraints', icon: Clock },
  { path: '/career-analysis', label: 'Career Analysis', icon: Activity },
  { path: '/roadmap', label: 'Roadmap', icon: Map },
  { path: '/career-monitoring', label: 'Career Monitoring', icon: MonitorPlay },
  { path: '/career-recovery', label: 'Career Recovery', icon: ShieldAlert },
  { path: '/alternative-careers', label: 'Alternatives', icon: GitBranch },
  { path: '/compare-careers', label: 'Compare Careers', icon: GitCompare },
  { path: '/skill-reuse', label: 'Skill Reuse', icon: Recycle },
  { path: '/progress', label: 'Progress', icon: TrendingUp },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Match current path or fallback to canonical
  const currentItem = navItems.find(item => {
    if (item.path === location.pathname) return true;
    if (item.path === '/career-analysis' && location.pathname === '/analysis') return true;
    if (item.path === '/career-monitoring' && location.pathname === '/monitoring') return true;
    if (item.path === '/career-recovery' && location.pathname === '/recovery') return true;
    if (item.path === '/alternative-careers' && location.pathname === '/alternatives') return true;
    if (item.path === '/compare-careers' && (location.pathname === '/compare' || location.pathname === '/career-comparison')) return true;
    return false;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-3)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'var(--sidebar-bg)',
        color: 'var(--sidebar-text)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 10
      }}>
        <div style={{ padding: '20px', fontSize: '20px', fontWeight: 'bold', color: 'white', borderBottom: '1px solid #1e293b' }}>
          🎯 CareerPath
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 20px',
                color: '#c084fc',
                background: 'rgba(168, 85, 247, 0.15)',
                textDecoration: 'none',
                gap: '12px',
                fontSize: '13px',
                fontWeight: 700,
                borderLeft: '4px solid #c084fc',
                marginBottom: '10px'
              }}
            >
              <Shield size={18} />
              Admin Console
            </NavLink>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (currentItem && currentItem.path === item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 20px',
                  color: isActive ? 'white' : 'var(--sidebar-text)',
                  textDecoration: 'none',
                  background: isActive ? 'var(--sidebar-active)' : 'transparent',
                  gap: '12px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  transition: '0.2s'
                }}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid #1e293b' }}>
          <div style={{ marginBottom: '12px', fontSize: '14px', color: 'white', fontWeight: 600 }}>
            {user?.name || 'Student User'}
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          background: 'var(--surface)',
          padding: '16px 30px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 5
        }}>
          <h1 style={{ fontSize: '22px', margin: 0, color: 'var(--text-primary)' }}>
            {currentItem?.label || 'Dashboard'}
          </h1>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--accent)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'ST'}
          </div>
        </header>
        <div style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
