import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import { getCountryFlag, formatLastSeen } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
      setLoading(false);
    }
    load();
  }, [userId]);

  const handleMessage = () => navigate(`/private/${userId}`);

  const handleReport = async () => {
    try {
      await addDoc(collection(db, 'reports'), {
        reportedBy: currentUser.uid,
        reportedUser: userId,
        reason: 'Reported by user',
        createdAt: serverTimestamp(),
      });
      toast.success('User reported. Thank you for keeping Talksy safe.');
    } catch {
      toast.error('Failed to report user');
    }
  };

  const handleBlock = async () => {
    try {
      const blocked = userProfile?.blockedUsers || [];
      if (!blocked.includes(userId)) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          blockedUsers: [...blocked, userId],
        });
        await refreshUserProfile();
        toast.success('User blocked');
        navigate('/users');
      }
    } catch {
      toast.error('Failed to block user');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-48 bg-surface-200 dark:bg-surface-700 rounded-2xl mb-4" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-surface-200 dark:bg-surface-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-1/3" />
              <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-surface-400 py-16">
        <p>User not found</p>
      </div>
    );
  }

  const isBlocked = userProfile?.blockedUsers?.includes(userId);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative h-48 bg-gradient-cool overflow-hidden">
        {profile.coverPhoto ? (
          <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-cool" />
        )}
      </div>

      <div className="bg-white dark:bg-surface-900 px-6 pb-6 shadow-card">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <Avatar
            src={profile.photoURL}
            name={profile.displayName}
            size={80}
            online={profile.online}
            className="border-4 border-white dark:border-surface-900"
          />
          {currentUser?.uid !== userId && !isBlocked && (
            <div className="flex gap-2">
              <button onClick={handleMessage} className="btn-primary text-sm py-2 px-4">
                Message
              </button>
              <button onClick={handleReport} className="btn-ghost text-sm py-2 px-3 text-surface-500">
                Report
              </button>
              <button onClick={handleBlock} className="btn-ghost text-sm py-2 px-3 text-red-500">
                Block
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-display font-bold text-surface-900 dark:text-white">
            {profile.displayName}
          </h2>
          {profile.countryCode && (
            <span className="text-xl">{getCountryFlag(profile.countryCode)}</span>
          )}
          {profile.online ? (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full font-medium">
              Online
            </span>
          ) : (
            <span className="text-xs text-surface-500">
              Last seen {formatLastSeen(profile.lastSeen)}
            </span>
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-surface-700 dark:text-surface-300 mb-3">{profile.bio}</p>
        )}

        <div className="flex flex-wrap gap-3 text-sm text-surface-600 dark:text-surface-400">
          {profile.country && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {profile.country}
            </span>
          )}
          {profile.gender && <span className="capitalize">{profile.gender}</span>}
          {profile.age && <span>{profile.age} years old</span>}
        </div>
      </div>
    </div>
  );
}
