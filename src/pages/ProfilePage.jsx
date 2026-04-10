import { useState, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import MediaUpload from '../components/MediaUpload';
import { getCountryFlag } from '../utils/formatters';
import { countries } from '../utils/countries';
import { uploadToCloudinary } from '../utils/cloudinary';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    country: userProfile?.country || '',
    countryCode: userProfile?.countryCode || '',
    gender: userProfile?.gender || '',
    age: userProfile?.age || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...form,
        age: form.age ? parseInt(form.age) : null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await refreshUserProfile();
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (result) => {
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        photoURL: result.url,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await refreshUserProfile();
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to update profile picture');
    }
  };

  const handleCoverUpload = async (result) => {
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        coverPhoto: result.url,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await refreshUserProfile();
      toast.success('Cover photo updated!');
    } catch {
      toast.error('Failed to update cover photo');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative h-48 bg-gradient-cool rounded-b-none overflow-hidden">
        {userProfile?.coverPhoto ? (
          <img src={userProfile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-cool" />
        )}
        <MediaUpload onUpload={handleCoverUpload} folder="talksy/covers" accept="image/*">
          <button className="absolute bottom-3 right-3 bg-black/40 hover:bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg transition-all backdrop-blur-sm">
            Change Cover
          </button>
        </MediaUpload>
      </div>

      <div className="bg-white dark:bg-surface-900 px-6 pb-6 shadow-card">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            <Avatar src={userProfile?.photoURL} name={userProfile?.displayName} size={80} online={true} className="border-4 border-white dark:border-surface-900" />
            <MediaUpload onUpload={handleAvatarUpload} folder="talksy/avatars" accept="image/*">
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-primary rounded-full flex items-center justify-center border-2 border-white dark:border-surface-900 hover:opacity-90 transition-all cursor-pointer">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </MediaUpload>
          </div>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            className="btn-primary text-sm py-2 px-4"
          >
            {saving ? 'Saving...' : editing ? 'Save Profile' : 'Edit Profile'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Display Name</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                maxLength={200}
                className="input-field resize-none"
                placeholder="Tell people about yourself..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">Country</label>
                <select
                  value={form.country}
                  onChange={(e) => {
                    const c = countries.find((x) => x.name === e.target.value);
                    setForm({ ...form, country: e.target.value, countryCode: c?.code || '' });
                  }}
                  className="input-field"
                >
                  <option value="">Select country</option>
                  {countries.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1">Gender</label>
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
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1">Age</label>
              <input
                type="number"
                min="13"
                max="120"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="input-field"
                placeholder="Your age"
              />
            </div>
            <button onClick={() => setEditing(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white">
                {userProfile?.displayName || 'Anonymous'}
              </h2>
              {userProfile?.countryCode && (
                <span className="text-xl">{getCountryFlag(userProfile.countryCode)}</span>
              )}
              {userProfile?.online && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full font-medium">
                  Online
                </span>
              )}
            </div>
            {userProfile?.email && (
              <p className="text-sm text-surface-500 mb-2">{userProfile.email}</p>
            )}
            {userProfile?.bio && (
              <p className="text-sm text-surface-700 dark:text-surface-300 mb-3">{userProfile.bio}</p>
            )}
            <div className="flex flex-wrap gap-3 text-sm text-surface-600 dark:text-surface-400">
              {userProfile?.country && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {userProfile.country}
                </span>
              )}
              {userProfile?.gender && (
                <span className="capitalize">{userProfile.gender}</span>
              )}
              {userProfile?.age && (
                <span>{userProfile.age} years old</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
