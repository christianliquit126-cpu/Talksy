import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider, isConfigured } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);

  async function createUserProfile(user, extra = {}) {
    const ref = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const profile = {
          uid: user.uid,
          displayName: user.displayName || extra.displayName || 'Anonymous',
          email: user.email || null,
          photoURL: user.photoURL || null,
          coverPhoto: null,
          bio: '',
          country: extra.country || '',
          countryCode: extra.countryCode || '',
          gender: extra.gender || '',
          age: extra.age || null,
          isAnonymous: user.isAnonymous,
          online: true,
          lastSeen: serverTimestamp(),
          createdAt: serverTimestamp(),
          blockedUsers: [],
          reportedUsers: [],
          notifications: true,
          darkMode: false,
          ...extra,
        };
        await setDoc(ref, profile);
        return profile;
      }
      return snap.data();
    } catch (err) {
      console.error('Failed to create user profile:', err);
      return null;
    }
  }

  async function updateUserOnlineStatus(uid, online) {
    try {
      await setDoc(doc(db, 'users', uid), { online, lastSeen: serverTimestamp() }, { merge: true });
    } catch {}
  }

  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    return result;
  }

  async function loginWithFacebook() {
    const result = await signInWithPopup(auth, facebookProvider);
    await createUserProfile(result.user);
    return result;
  }

  async function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function registerWithEmail(email, password, displayName, extra = {}) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await createUserProfile(result.user, { displayName, ...extra });
    return result;
  }

  async function loginAsGuest() {
    const result = await signInAnonymously(auth);
    await createUserProfile(result.user, { displayName: `Guest_${Math.random().toString(36).slice(2, 7)}` });
    return result;
  }

  async function logout() {
    if (currentUser) {
      await updateUserOnlineStatus(currentUser.uid, false);
    }
    return signOut(auth);
  }

  async function refreshUserProfile() {
    if (!currentUser) return;
    try {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) setUserProfile(snap.data());
    } catch {}
  }

  useEffect(() => {
    let unsubscribed = false;

    const timeout = setTimeout(() => {
      if (!unsubscribed) {
        setLoading(false);
      }
    }, 8000);

    let unsub;
    try {
      unsub = onAuthStateChanged(
        auth,
        async (user) => {
          clearTimeout(timeout);
          if (unsubscribed) return;
          setCurrentUser(user);
          if (user) {
            try {
              await updateUserOnlineStatus(user.uid, true);
              const snap = await getDoc(doc(db, 'users', user.uid));
              if (snap.exists()) setUserProfile(snap.data());
            } catch {}
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        },
        (err) => {
          clearTimeout(timeout);
          console.error('Auth error:', err);
          setFirebaseError(err.message);
          setLoading(false);
        }
      );
    } catch (err) {
      clearTimeout(timeout);
      console.error('Firebase init error:', err);
      setFirebaseError(err.message);
      setLoading(false);
    }

    return () => {
      unsubscribed = true;
      clearTimeout(timeout);
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      if (currentUser) updateUserOnlineStatus(currentUser.uid, false);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [currentUser]);

  if (!isConfigured && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-400 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>T</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Firebase Not Configured</h2>
          <p className="text-sm text-gray-500 mb-4">
            To use Talksy, add your Firebase and Cloudinary credentials.
            Copy <code className="bg-gray-100 px-1 rounded">.env.example</code> to{' '}
            <code className="bg-gray-100 px-1 rounded">.env</code> and fill in your project details.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-xs text-gray-600 font-mono space-y-1">
            <p>VITE_FIREBASE_API_KEY=...</p>
            <p>VITE_FIREBASE_AUTH_DOMAIN=...</p>
            <p>VITE_FIREBASE_PROJECT_ID=...</p>
            <p>VITE_FIREBASE_STORAGE_BUCKET=...</p>
            <p>VITE_FIREBASE_MESSAGING_SENDER_ID=...</p>
            <p>VITE_FIREBASE_APP_ID=...</p>
            <p>VITE_CLOUDINARY_CLOUD_NAME=...</p>
            <p>VITE_CLOUDINARY_UPLOAD_PRESET=...</p>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Get Firebase credentials at <strong>console.firebase.google.com</strong>
            <br />Get Cloudinary credentials at <strong>cloudinary.com</strong>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #d946ef 0%, #f97316 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 0 20px rgba(217,70,239,0.3)' }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'Poppins, sans-serif' }}>T</span>
        </div>
        <div style={{ width: 32, height: 32, border: '3px solid #d946ef', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 12 }} />
        <p style={{ fontSize: 14, color: '#71717a' }}>Loading Talksy...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (firebaseError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-400 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-black text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>T</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Firebase Not Configured</h2>
          <p className="text-sm text-gray-500 mb-4">
            To use Talksy, you need to configure your Firebase credentials.
            Copy <code className="bg-gray-100 px-1 rounded">.env.example</code> to{' '}
            <code className="bg-gray-100 px-1 rounded">.env</code> and fill in your Firebase project details.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left text-xs text-gray-600 font-mono space-y-1">
            <p>VITE_FIREBASE_API_KEY=...</p>
            <p>VITE_FIREBASE_AUTH_DOMAIN=...</p>
            <p>VITE_FIREBASE_PROJECT_ID=...</p>
            <p>VITE_CLOUDINARY_CLOUD_NAME=...</p>
            <p>VITE_CLOUDINARY_UPLOAD_PRESET=...</p>
          </div>
        </div>
      </div>
    );
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    registerWithEmail,
    loginAsGuest,
    logout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
