import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const Login = lazy(() => import('./components/Auth/Login'));
const Register = lazy(() => import('./components/Auth/Register'));
const TeacherDashboard = lazy(() => import('./components/Dashboard/TeacherDashboard'));
const ParentDashboard = lazy(() => import('./components/Dashboard/ParentDashboard'));
const ObservationLog = lazy(() => import('./components/ObservationLog/ObservationLog'));
const Profile = lazy(() => import('./components/Profile/Profile'));

const FullscreenSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-sand-200 border-t-brand-600"></div>
  </div>
);

// Protected Route component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullscreenSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard'} replace />;
  }

  return children;
};

// Public Routes
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <FullscreenSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<FullscreenSpinner />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />

            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute allowedRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/observation-log/:studentId" element={
              <ProtectedRoute allowedRole="teacher">
                <ObservationLog />
              </ProtectedRoute>
            } />

            {/* Parent Routes */}
            <Route path="/parent/dashboard" element={
              <ProtectedRoute allowedRole="parent">
                <ParentDashboard />
              </ProtectedRoute>
            } />

            {/* Profile Route */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
