import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { currentUser, userProfile, logout, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [darkMode, setDarkMode] = useState(userProfile?.darkMode || false);
  const [notifications, setNotifications] = useState(userProfile?.notifications !== false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleToggleDark = async (value) => {
    setDarkMode(value);
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { darkMode: value }, { merge: true });
    } catch {}
  };

  const handleToggleNotifications = async (value) => {
    setNotifications(value);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { notifications: value }, { merge: true });
    } catch {}
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message?.replace('Firebase: ', '') || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const settingGroups = [
    {
      title: 'Appearance',
      items: [
        {
          label: 'Dark Mode',
          description: 'Switch between light and dark theme',
          control: (
            <Toggle value={darkMode} onChange={handleToggleDark} />
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          label: 'Push Notifications',
          description: 'Receive notifications for new messages',
          control: (
            <Toggle value={notifications} onChange={handleToggleNotifications} />
          ),
        },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-6">Settings</h1>

      {settingGroups.map((group) => (
        <div key={group.title} className="card p-5 mb-4">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">{group.title}</h3>
          <div className="space-y-4">
            {group.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-white">{item.label}</p>
                  {item.description && <p className="text-xs text-surface-500 mt-0.5">{item.description}</p>}
                </div>
                {item.control}
              </div>
            ))}
          </div>
        </div>
      ))}

      {currentUser?.email && !currentUser?.isAnonymous && (
        <div className="card p-5 mb-4">
          <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">Security</h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
            />
            <button type="submit" disabled={changingPassword} className="btn-primary text-sm">
              {changingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      <div className="card p-5 mb-4">
        <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">{userProfile?.displayName || 'Anonymous'}</p>
              <p className="text-xs text-surface-500">{currentUser?.email || 'Guest account'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">About</h3>
        <div className="space-y-2 text-sm text-surface-600 dark:text-surface-400">
          <p>Talksy v1.0.0</p>
          <p>A global chat platform connecting people worldwide.</p>
          <p className="text-xs text-surface-400 mt-2">
            By using Talksy, you agree to our Terms of Service and Privacy Policy.
            Please be respectful and kind to other users.
          </p>
        </div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        value ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
