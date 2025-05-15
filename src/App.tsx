import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import CreateElection from './pages/admin/CreateElection';
import ManageElection from './pages/admin/ManageElection';
import ElectionResults from './pages/ElectionResults';
import VoterDashboard from './pages/voter/Dashboard';
import VotePage from './pages/voter/VotePage';
import VotingHistory from './pages/voter/VotingHistory';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/create-election" element={
              <ProtectedRoute requiredRole="admin">
                <CreateElection />
              </ProtectedRoute>
            } />
            <Route path="admin/election/:id" element={
              <ProtectedRoute requiredRole="admin">
                <ManageElection />
              </ProtectedRoute>
            } />
            
            {/* Voter Routes */}
            <Route path="voter" element={
              <ProtectedRoute requiredRole="voter">
                <VoterDashboard />
              </ProtectedRoute>
            } />
            <Route path="voter/election/:id" element={
              <ProtectedRoute requiredRole="voter">
                <VotePage />
              </ProtectedRoute>
            } />
            <Route path="voter/history" element={
              <ProtectedRoute requiredRole="voter">
                <VotingHistory />
              </ProtectedRoute>
            } />
            
            {/* Public Routes */}
            <Route path="election/results/:id" element={<ElectionResults />} />
            
            {/* Not Found and Redirects */}
            <Route path="404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;