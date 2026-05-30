import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BuildingsPage from './pages/BuildingsPage';
import BuildingDetailPage from './pages/BuildingDetailPage';
import NewBuildingPage from './pages/NewBuildingPage';
import NewAssessmentPage from './pages/NewAssessmentPage';
import AssessmentDetailPage from './pages/AssessmentDetailPage';
import ReportPage from './pages/ReportPage';
import AssessmentsListPage from './pages/AssessmentsListPage';
import UserManagementPage from './pages/UserManagementPage';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="buildings" element={<BuildingsPage />} />
        <Route path="buildings/new" element={<ProtectedRoute adminOnly><NewBuildingPage /></ProtectedRoute>} />
        <Route path="buildings/:id" element={<BuildingDetailPage />} />
        <Route path="assessments" element={<AssessmentsListPage />} />
        <Route path="assessments/new" element={<ProtectedRoute adminOnly><NewAssessmentPage /></ProtectedRoute>} />
        <Route path="assessments/:id" element={<AssessmentDetailPage />} />
        <Route path="reports/:id" element={<ReportPage />} />
        <Route path="users" element={<ProtectedRoute adminOnly><UserManagementPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
