// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './components/LandingPage';

// Auth Components
// import SignUp from './components/auth/SignUp';
import SignUp from './components/auth/SignUp';
import Login from './components/auth/Login';
import EmailVerification from './components/auth/EmailVerification';

// Profile Components
import ProfileView from './components/profile/ProfileView';
import ProfileSetup from './components/profile/ProfileSetup';

// Feed Components
import NewsFeed from './components/feed/NewsFeed';

// Jobs Components
import JobsList from './components/jobs/JobsList';
import JobListing from './components/jobs/JobListing';
import CreateJob from './components/jobs/CreateJob';
import JobApplicants from './components/jobs/JobApplicants';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const RecruiterRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (userProfile?.role !== 'recruiter') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              
              {/* Job Listings (Public) */}
              <Route path="/jobs" element={<JobsList />} />
              <Route path="/jobs/:jobId" element={<JobListing />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <NewsFeed />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfileView />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile/:uid" 
                element={<ProfileView />} 
              />
              
              <Route 
                path="/profile/setup" 
                element={
                  <ProtectedRoute>
                    <ProfileSetup />
                  </ProtectedRoute>
                } 
              />
              
              {/* Recruiter Routes */}
              <Route 
                path="/jobs/create" 
                element={
                  <RecruiterRoute>
                    <CreateJob />
                  </RecruiterRoute>
                } 
              />
              
              <Route 
                path="/jobs/:jobId/applicants" 
                element={
                  <RecruiterRoute>
                    <JobApplicants />
                  </RecruiterRoute>
                } 
              />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
export default App;