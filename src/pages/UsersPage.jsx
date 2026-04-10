import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { getCountryFlag, formatLastSeen } from '../utils/formatters';
import { countries } from '../utils/countries';

export default function UsersPage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterOnline, setFilterOnline] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('online', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.id !== currentUser?.uid);
      setUsers(all);
    });
    return unsub;
  }, [currentUser]);

  const filtered = users.filter((u) => {
    const blocked = userProfile?.blockedUsers?.includes(u.id);
    if (blocked) return false;
    if (search && !u.displayName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCountry && u.country !== filterCountry) return false;
    if (filterGender && u.gender !== filterGender) return false;
    if (filterOnline && !u.online) return false;
    return true;
  });

  const handleStartChat = (userId) => {
    navigate(`/private/${userId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Discover People</h1>
        <p className="text-surface-500 text-sm mt-1">Find and connect with people from around the world</p>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl p-4 shadow-card mb-6 space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="input-field flex-1 min-w-32"
          >
            <option value="">All Countries</option>
            {countries.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
          </select>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="input-field flex-1 min-w-24"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="other">Other</option>
          </select>

          <button
            onClick={() => setFilterOnline(!filterOnline)}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              filterOnline
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
            }`}
          >
            Online only
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-surface-900 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-200 animate-fade-in"
          >
            <div className="flex items-start gap-3">
              <Avatar src={user.photoURL} name={user.displayName} size={48} online={user.online} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-surface-900 dark:text-white text-sm truncate">
                    {user.displayName}
                  </span>
                  {user.countryCode && (
                    <span className="text-base flex-shrink-0">{getCountryFlag(user.countryCode)}</span>
                  )}
                </div>
                <p className="text-xs text-surface-500 mt-0.5">
                  {user.online ? (
                    <span className="text-green-500 font-medium">Online</span>
                  ) : (
                    <span>Last seen {formatLastSeen(user.lastSeen)}</span>
                  )}
                </p>
                {user.country && (
                  <p className="text-xs text-surface-400 mt-0.5">{user.country}</p>
                )}
              </div>
            </div>

            {user.bio && (
              <p className="text-xs text-surface-600 dark:text-surface-400 mt-3 line-clamp-2">{user.bio}</p>
            )}

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => handleStartChat(user.id)}
                className="flex-1 bg-gradient-primary text-white text-xs font-semibold py-2 px-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
              >
                Message
              </button>
              <button
                onClick={() => navigate(`/profile/${user.id}`)}
                className="px-3 py-2 text-xs font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-all"
              >
                Profile
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-surface-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
