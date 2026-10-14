import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SkillsPage from './pages/SkillsPage';
import CareerGoalPage from './pages/CareerGoalPage';
import ConstraintsPage from './pages/ConstraintsPage';
import CareerAnalysisPage from './pages/CareerAnalysisPage';
import RoadmapPage from './pages/RoadmapPage';
import CareerMonitoringPage from './pages/CareerMonitoringPage';
import CareerRecoveryPage from './pages/CareerRecoveryPage';
import AlternativeCareersPage from './pages/AlternativeCareersPage';
import CareerComparisonPage from './pages/CareerComparisonPage';
import SkillReusePage from './pages/SkillReusePage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Admin Console Route */}
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

          {/* Student Onboarding Wizard */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

          {/* Protected Dashboard Shell Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/career-goal" element={<CareerGoalPage />} />
            <Route path="/constraints" element={<ConstraintsPage />} />
            
            {/* Career Analysis */}
            <Route path="/career-analysis" element={<CareerAnalysisPage />} />
            <Route path="/analysis" element={<CareerAnalysisPage />} />

            {/* Roadmap */}
            <Route path="/roadmap" element={<RoadmapPage />} />

            {/* Career Monitoring */}
            <Route path="/career-monitoring" element={<CareerMonitoringPage />} />
            <Route path="/monitoring" element={<CareerMonitoringPage />} />

            {/* Career Recovery */}
            <Route path="/career-recovery" element={<CareerRecoveryPage />} />
            <Route path="/recovery" element={<CareerRecoveryPage />} />

            {/* Alternative Careers */}
            <Route path="/alternative-careers" element={<AlternativeCareersPage />} />
            <Route path="/alternatives" element={<AlternativeCareersPage />} />

            {/* Compare Careers */}
            <Route path="/compare-careers" element={<CareerComparisonPage />} />
            <Route path="/career-comparison" element={<CareerComparisonPage />} />
            <Route path="/compare" element={<CareerComparisonPage />} />

            {/* Skill Reuse */}
            <Route path="/skill-reuse" element={<SkillReusePage />} />

            {/* Progress & Settings */}
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
