import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { countries } from '../utils/countries';
import toast from 'react-hot-toast';

function generateUsername() {
  const adjectives = ['Vibe', 'Chill', 'Neon', 'Cosmic', 'Shadow', 'Solar', 'Luna', 'Storm', 'Blaze', 'Pixel', 'Nova', 'Echo', 'Drift', 'Fuzz', 'Glitch', 'Hyper', 'Indie', 'Jasper', 'Kira', 'Lux'];
  const nouns = ['King', 'Queen', 'Cat', 'Wolf', 'Fox', 'Bird', 'Panda', 'Tiger', 'Bear', 'Star', 'Moon', 'Cloud', 'Fire', 'Ice', 'Wave', 'Dream', 'Spirit', 'Ghost', 'Angel', 'Devil'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}_${num}`;
}

function calculateAge(birthday) {
  if (!birthday) return null;
  const today = new Date();
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function SetupProfilePage() {
  const { currentUser, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(generateUsername());
  const [country, setCountry] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [detectingCountry, setDetectingCountry] = useState(true);
  const age = calculateAge(birthday);

  useEffect(() => {
    async function detectCountry() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.country_name) {
          setCountry(data.country_name);
          setCountryCode(data.country_code || '');
        }
      } catch {
      } finally {
        setDetectingCountry(false);
      }
    }
    detectCountry();
  }, []);

  const handleCountryChange = (e) => {
    const c = countries.find((x) => x.name === e.target.value);
    setCountry(e.target.value);
    setCountryCode(c?.code || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!country) { toast.error('Please select your country'); return; }
    if (age !== null && age < 13) { toast.error('You must be at least 13 years old'); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: username,
        country,
        countryCode,
        gender,
        age: age || null,
        birthday: birthday || null,
        bio,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await refreshUserProfile();
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-6 relative">
      <div className="blur-dot absolute top-0 right-0 w-80 h-80 bg-violet-600 opacity-20 translate-x-1/3 -translate-y-1/3" />
      <div className="blur-dot absolute bottom-0 left-0 w-64 h-64 bg-pink-500 opacity-15 -translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Talksy" className="w-14 h-14 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-white">Set Up Your Vibe</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Customize your profile before you start chatting
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Username
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field flex-1"
                  maxLength={24}
                  required
                />
                <button
                  type="button"
                  onClick={() => setUsername(generateUsername())}
                  className="px-3 rounded-2xl text-sm transition-all hover:opacity-80"
                  style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
                  title="Generate new username"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                This is how others will see you in random chats
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Country
                {detectingCountry && (
                  <span className="ml-2 text-xs text-violet-400">Detecting...</span>
                )}
              </label>
              <select
                value={country}
                onChange={handleCountryChange}
                className="input-field"
                required
              >
                <option value="">Select your country</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Birthday
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="input-field"
                style={{ colorScheme: 'dark' }}
              />
              {age !== null && (
                <p className="text-xs mt-1.5" style={{ color: 'rgba(167,139,250,0.9)' }}>
                  You are {age} years old
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input-field"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Bio <span style={{ color: 'rgba(255,255,255,0.25)' }}>(optional)</span>
              </label>
              <textarea
                placeholder="Tell people about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                maxLength={200}
                className="input-field resize-none"
              />
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </div>
              ) : 'Start Vibing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
