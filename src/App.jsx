import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import UsersPage from './pages/UsersPage';
import MomentsPage from './pages/MomentsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import UserProfilePage from './pages/UserProfilePage';
import PrivateChatPage from './pages/PrivateChatPage';
import SetupProfilePage from './pages/SetupProfilePage';

function ProtectedRoute({ children }) {
  const { currentUser, userProfile } = useAuth();
  if (!currentUser) return <Navigate to="/auth" replace />;
  if (currentUser && !userProfile?.country && !currentUser.isAnonymous) {
    return <Navigate to="/setup" replace />;
  }
  return children;
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={currentUser ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/setup" element={<SetupProfilePage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
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
              background: '#18181b',
              color: '#f4f4f5',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
