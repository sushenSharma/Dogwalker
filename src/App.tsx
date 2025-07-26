import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DogProvider } from './contexts/DogContext';
import { WalkProvider } from './contexts/WalkContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Friends from './pages/Friends';
import Walk from './pages/Walk';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Landing from './pages/Landing';
import AddDog from './pages/AddDog';
import MapView from './pages/MapView';
import CheckIn from './pages/CheckIn';
import Notifications from './pages/Notifications';
import AuthCallback from './pages/AuthCallback';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐕</div>
          <div className="text-xl font-semibold text-gray-900 mb-2">DogWalker</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!isAuthenticated ? <Landing /> : <Layout />}>
        {isAuthenticated && (
          <>
            <Route index element={<Home />} />
            <Route path="friends" element={<Friends />} />
            <Route path="walk" element={<Walk />} />
            <Route path="profile" element={<Profile />} />
          </>
        )}
      </Route>
      
      <Route path="/auth" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected Routes */}
      {isAuthenticated && (
        <>
          <Route path="/add-dog" element={<AddDog />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/notifications" element={<Notifications />} />
        </>
      )}

      {/* Redirect authenticated users from landing page */}
      {isAuthenticated && (
        <Route path="*" element={<Layout />}>
          <Route path="*" element={<Home />} />
        </Route>
      )}
      
      {/* Redirect unauthenticated users to landing */}
      {!isAuthenticated && (
        <Route path="*" element={<Landing />} />
      )}
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <DogProvider>
        <WalkProvider>
          <NotificationProvider>
            <Router>
              <AppContent />
            </Router>
          </NotificationProvider>
        </WalkProvider>
      </DogProvider>
    </AuthProvider>
  );
}

export default App;
