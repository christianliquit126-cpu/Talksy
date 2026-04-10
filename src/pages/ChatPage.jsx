import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { formatChatListTime, formatLastSeen, getCountryFlag, truncateText } from '../utils/formatters';
import PrivateChatWindow from '../components/PrivateChatWindow';

export default function ChatPage() {
  const { currentUser, userProfile } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageAt', 'desc')
    );
    const unsub = onSnapshot(q, async (snap) => {
      const convs = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          const otherUid = data.participants.find((p) => p !== currentUser.uid);
          try {
            const userSnap = await getDoc(doc(db, 'users', otherUid));
            const otherUser = userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : { id: otherUid, displayName: 'Unknown User' };
            return { id: d.id, ...data, otherUser };
          } catch {
            return { id: d.id, ...data, otherUser: { id: otherUid, displayName: 'Unknown User' } };
          }
        })
      );
      setConversations(convs);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  useEffect(() => {
    if (chatId) {
      const conv = conversations.find((c) => c.id === chatId);
      if (conv?.otherUser) setSelectedUser(conv.otherUser);
    }
  }, [chatId, conversations]);

  const clearUnread = async (convId) => {
    if (!currentUser || !convId) return;
    try {
      await setDoc(
        doc(db, 'conversations', convId),
        { unread: { [currentUser.uid]: 0 } },
        { merge: true }
      );
    } catch {}
  };

  const handleSelectConv = (conv) => {
    setSelectedUser(conv.otherUser);
    clearUnread(conv.id);
    navigate(`/chat/${conv.id}`);
  };

  if (selectedUser || chatId) {
    const otherUserId = selectedUser?.uid || chatId;
    return (
      <div className="flex h-full">
        <div className="hidden md:flex flex-col w-80 border-r border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 h-full">
          <ConversationList
            conversations={conversations}
            currentUser={currentUser}
            selectedId={chatId}
            onSelect={handleSelectConv}
            loading={loading}
          />
        </div>
        <div className="flex-1 min-w-0">
          <PrivateChatWindow
            otherUserId={otherUserId}
            onBack={() => { setSelectedUser(null); navigate('/chat'); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 md:max-w-md border-r border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900 h-full">
        <ConversationList
          conversations={conversations}
          currentUser={currentUser}
          selectedId={chatId}
          onSelect={handleSelectConv}
          loading={loading}
        />
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="text-center text-surface-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm font-medium">Select a conversation</p>
          <p className="text-xs mt-1">Or go to Users to start a new chat</p>
        </div>
      </div>
    </div>
  );
}

function ConversationList({ conversations, currentUser, selectedId, onSelect, loading }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-surface-100 dark:border-surface-800">
        <h2 className="text-lg font-display font-bold text-surface-900 dark:text-white">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-surface-200 dark:bg-surface-700 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
                  <div className="h-2.5 bg-surface-200 dark:bg-surface-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-surface-400">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-sm font-medium">No conversations yet</p>
            <p className="text-xs mt-1">Go to Users to start chatting</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const unreadCount = conv.unread?.[currentUser?.uid] || 0;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-surface-50 dark:hover:bg-surface-800 transition-all ${
                  selectedId === conv.id ? 'bg-primary-50 dark:bg-primary-950/30' : ''
                }`}
              >
                <Avatar
                  src={conv.otherUser?.photoURL}
                  name={conv.otherUser?.displayName}
                  size={48}
                  online={conv.otherUser?.online}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-surface-900 dark:text-white' : 'font-semibold text-surface-900 dark:text-white'}`}>
                      {conv.otherUser?.displayName || 'User'}
                    </span>
                    <span className="text-xs text-surface-400 flex-shrink-0 ml-2">
                      {formatChatListTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-xs truncate ${unreadCount > 0 ? 'font-semibold text-surface-700 dark:text-surface-300' : 'text-surface-500'}`}>
                      {truncateText(conv.lastMessage || 'Start chatting', 40)}
                    </p>
                    {unreadCount > 0 && (
                      <span className="flex-shrink-0 ml-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
