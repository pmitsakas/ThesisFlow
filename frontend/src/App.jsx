import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import SystemSettings from './pages/SystemSettings';
import BrowseTopics from './pages/BrowseTopics';
import MyDissertation from './pages/MyDissertation';
import CreateTopic from './pages/CreateTopic';
import MyTopics from './pages/MyTopics';
import MyStudents from './pages/MyStudents';
import DissertationDetails from './pages/DissertationDetails';
import MyProposals from './pages/MyProposals';
import ProposeTopic from './pages/ProposeTopic';
import PendingProposals from './pages/PendingProposals';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SystemSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/browse-topics"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <BrowseTopics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-dissertation"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyDissertation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dissertation/:id"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'student', 'admin']}>
                  <DissertationDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-topic"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <CreateTopic />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-topics"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <MyTopics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-students"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <MyStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-proposals"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyProposals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/propose-topic"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ProposeTopic />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pending-proposals"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <PendingProposals />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;