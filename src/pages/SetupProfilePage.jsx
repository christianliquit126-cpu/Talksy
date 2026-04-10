import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { countries } from '../utils/countries';
import toast from 'react-hot-toast';

export default function SetupProfilePage() {
  const { currentUser, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ country: '', countryCode: '', gender: '', age: '', bio: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.country) { toast.error('Please select your country'); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...form,
        age: form.age ? parseInt(form.age) : null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await refreshUserProfile();
      navigate('/');
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-cool">
      <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-card-hover p-8 w-full max-w-md animate-bounce-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Set Up Your Profile</h2>
          <p className="text-surface-500 text-sm mt-1">Tell the world a bit about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Country</label>
            <select
              value={form.country}
              onChange={(e) => {
                const c = countries.find((x) => x.name === e.target.value);
                setForm({ ...form, country: e.target.value, countryCode: c?.code || '' });
              }}
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
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
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
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Age</label>
            <input
              type="number"
              min="13"
              max="120"
              placeholder="Your age"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Bio</label>
            <textarea
              placeholder="Tell people about yourself..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              maxLength={200}
              className="input-field resize-none"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
            {saving ? 'Saving...' : 'Continue to Talksy'}
          </button>
        </form>
      </div>
    </div>
  );
}
