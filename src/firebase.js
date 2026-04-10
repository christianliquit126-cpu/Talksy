import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: apiKey || 'demo-api-key',
  authDomain: authDomain || 'demo.firebaseapp.com',
  projectId: projectId || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000:web:000000',
};

export const isConfigured = !!(apiKey && authDomain && projectId);

let app;
try {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
} catch (err) {
  console.error('Firebase init failed:', err);
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

googleProvider.addScope('profile');
googleProvider.addScope('email');

export default app;
