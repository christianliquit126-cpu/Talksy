import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { formatLastSeen, getCountryFlag } from '../utils/formatters';

const moods = [
  { label: 'Chill', color: 'from-blue-500 to-cyan-500' },
  { label: 'Study', color: 'from-emerald-500 to-teal-500' },
  { label: 'Gaming', color: 'from-violet-500 to-purple-600' },
  { label: 'Love Advice', color: 'from-pink-500 to-rose-500' },
  { label: 'Just Talk', color: 'from-amber-500 to-orange-400' },
  { label: 'Creative', color: 'from-fuchsia-500 to-pink-500' },
];

export default function DashboardPage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recentConvs, setRecentConvs] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), where('online', '==', true), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      setOnlineUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter(u => u.id !== currentUser?.uid));
    });
    return unsub;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageAt', 'desc'),
      limit(5)
    );
    const unsub = onSnapshot(q, (snap) => {
      setRecentConvs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [currentUser]);

  const handleStartRandom = () => {
    navigate(selectedMood ? `/random?mood=${encodeURIComponent(selectedMood)}` : '/random');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-white mb-1">
          Hey, <span className="gradient-text">{userProfile?.displayName?.split('_')[0] || 'there'}</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)' }} className="text-sm">
          {onlineUsers.length} people online right now
        </p>
      </div>

      <div className="glass-card p-6 mb-6" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(236,72,153,0.1) 100%)', borderColor: 'rgba(124,58,237,0.25)' }}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="flex-1">
            <h2 className="font-display font-bold text-xl text-white mb-1">Try Random Chat</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Get matched with a stranger instantly. Skip, heart, and connect.
            </p>
          </div>
          <button
            onClick={handleStartRandom}
            className="btn-primary whitespace-nowrap"
          >
            Find a Match
          </button>
        </div>

        <div className="mt-5">
          <p className="text-xs mb-3 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Select your mood</p>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => (
              <button
                key={mood.label}
                onClick={() => setSelectedMood(selectedMood === mood.label ? '' : mood.label)}
                className={`mood-chip text-xs ${selectedMood === mood.label ? 'active' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${mood.color} flex-shrink-0`} />
                {mood.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {onlineUsers.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-white">Online Now</h2>
            <button
              onClick={() => navigate('/users')}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              See all
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {onlineUsers.slice(0, 12).map((u) => (
              <div
                key={u.id}
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
                onClick={() => navigate(`/private/${u.id}`)}
              >
                <div className="story-ring group-hover:scale-105 transition-transform">
                  <Avatar src={u.photoURL} name={u.displayName} size={52} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-white font-medium truncate w-16 text-center">
                    {u.displayName?.split('_')[0]}
                  </p>
                  {u.countryCode && (
                    <p className="text-sm text-center">{getCountryFlag(u.countryCode)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Messages', desc: 'Chat with your friends', path: '/chat', icon: '💬', gradient: 'from-violet-600 to-purple-600' },
          { label: 'Discover People', desc: 'Find users worldwide', path: '/users', icon: '🌍', gradient: 'from-blue-500 to-indigo-500' },
          { label: 'Share Moments', desc: 'Post photos & thoughts', path: '/moments', icon: '✨', gradient: 'from-pink-500 to-rose-400' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="glass-card-hover rounded-2xl p-5 text-left group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}>
              <span>{item.icon}</span>
            </div>
            <p className="font-semibold text-white text-sm">{item.label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.desc}</p>
          </button>
        ))}
      </div>

      {recentConvs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-white">Recent Chats</h2>
            <button
              onClick={() => navigate('/chat')}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              See all
            </button>
          </div>
          <div className="space-y-2">
            {recentConvs.map((conv) => {
              const otherUid = conv.participants?.find(p => p !== currentUser?.uid);
              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className="glass-card-hover rounded-2xl w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {conv.lastMessage || 'Start chatting'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Tap to continue
                    </p>
                  </div>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
