import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle, loginWithFacebook, loginWithEmail, registerWithEmail, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!displayName.trim()) { toast.error('Please enter your name'); return; }
        await registerWithEmail(email, password, displayName);
      }
      navigate('/');
    } catch (err) {
      toast.error(err.message?.replace('Firebase: ', '').replace(/ \(auth\/.*\)/, '') || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebook = async () => {
    setLoading(true);
    try {
      await loginWithFacebook();
      navigate('/');
    } catch (err) {
      toast.error('Facebook sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await loginAsGuest();
      navigate('/');
    } catch (err) {
      toast.error('Guest login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-cool items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 100 + 20,
                height: Math.random() * 100 + 20,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="relative text-center text-white max-w-md">
          <img src="/logo.png" alt="Talksy" className="w-24 h-24 mx-auto mb-6 drop-shadow-lg" />
          <h1 className="text-5xl font-display font-black mb-4">Talksy</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Connect with people from every corner of the world. Share moments, chat instantly, and build friendships across borders.
          </p>
          <div className="mt-8 flex items-center gap-6 justify-center text-white/70">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">100+</p>
              <p className="text-sm">Countries</p>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Real-time</p>
              <p className="text-sm">Messaging</p>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">Free</p>
              <p className="text-sm">Forever</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-surface-950">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <img src="/logo.png" alt="Talksy" className="w-10 h-10" />
            <span className="font-display font-bold text-2xl gradient-text">Talksy</span>
          </div>

          <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white mb-1">
            {mode === 'login' ? 'Welcome back' : 'Join Talksy'}
          </h2>
          <p className="text-surface-500 mb-6 text-sm">
            {mode === 'login' ? 'Sign in to continue connecting with the world.' : 'Create your account and start chatting globally.'}
          </p>

          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-surface-200 dark:border-surface-700 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleFacebook}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-blue-600 rounded-xl text-sm font-medium text-white hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
            <span className="text-xs text-surface-400">or</span>
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-field"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Please wait...
                </div>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-4">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-primary-500 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-800">
            <button
              onClick={handleGuest}
              disabled={loading}
              className="w-full py-2.5 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
            >
              Continue as Guest (limited access)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
