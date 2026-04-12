import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import SetupProfilePage from './pages/SetupProfilePage';
import DashboardPage from './pages/DashboardPage';
import RandomChatPage from './pages/RandomChatPage';
import ChatPage from './pages/ChatPage';
import UsersPage from './pages/UsersPage';
import MomentsPage from './pages/MomentsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import UserProfilePage from './pages/UserProfilePage';
import PrivateChatPage from './pages/PrivateChatPage';

function ProtectedRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser && !userProfile?.country && !currentUser.isAnonymous) {
    return <Navigate to="/setup" replace />;
  }
  return children;
}

function AppRoutes() {
  const { currentUser, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/auth" element={currentUser ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/setup" element={<SetupProfilePage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="random" element={<RandomChatPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:chatId" element={<ChatPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="moments" element={<MomentsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/:userId" element={<UserProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="private/:userId" element={<PrivateChatPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(26, 10, 46, 0.95)',
              backdropFilter: 'blur(20px)',
              color: '#f1f0ff',
              borderRadius: '16px',
              fontSize: '14px',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.2)',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
