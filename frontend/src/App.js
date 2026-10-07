import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import DashboardEtudiant from './pages/DashboardEtudiant';
import DashboardEnseignant from './pages/DashboardEnseignant';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', background: '#080c16' }}></div>;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login/:role" element={<Login />} />
    <Route path="/dashboard/etudiant" element={
      <ProtectedRoute role="etudiant"><DashboardEtudiant /></ProtectedRoute>
    } />
    <Route path="/dashboard/enseignant" element={
      <ProtectedRoute role="enseignant"><DashboardEnseignant /></ProtectedRoute>
    } />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

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
