import { useState, useEffect, useRef } from 'react';
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp,
  doc, getDoc, setDoc, where, updateDoc, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import MediaUpload, { MediaPreview } from './MediaUpload';
import { formatMessageTime, formatLastSeen, getCountryFlag } from '../utils/formatters';
import { translateText, getBrowserLanguage } from '../utils/translate';
import toast from 'react-hot-toast';

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

export default function PrivateChatWindow({ otherUserId, onBack }) {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typingOther, setTypingOther] = useState(false);
  const [translatedIds, setTranslatedIds] = useState({});
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const chatId = getChatId(currentUser?.uid, otherUserId);

  useEffect(() => {
    async function loadUser() {
      const snap = await getDoc(doc(db, 'users', otherUserId));
      if (snap.exists()) setOtherUser({ id: snap.id, ...snap.data() });
    }
    loadUser();
  }, [otherUserId]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, 'privateChats', chatId, 'messages'),
      orderBy('createdAt', 'asc'),
      
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return unsub;
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !otherUserId) return;
    const typingRef = doc(db, 'privateTyping', `${chatId}_${otherUserId}`);
    const unsub = onSnapshot(typingRef, (snap) => {
      if (snap.exists()) setTypingOther(snap.data().typing);
    });
    return unsub;
  }, [chatId, otherUserId]);

  const setTypingStatus = async (isTyping) => {
    try {
      await setDoc(doc(db, 'privateTyping', `${chatId}_${currentUser.uid}`), {
        typing: isTyping,
        uid: currentUser.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch {}
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    setTypingStatus(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTypingStatus(false), 2000);
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setTypingStatus(false);
    try {
      const msgRef = collection(db, 'privateChats', chatId, 'messages');
      await addDoc(msgRef, {
        text: text.trim(),
        uid: currentUser.uid,
        displayName: userProfile?.displayName || 'Anonymous',
        photoURL: userProfile?.photoURL || null,
        createdAt: serverTimestamp(),
        type: 'text',
        status: 'sent',
      });
      await setDoc(doc(db, 'conversations', chatId), {
        participants: [currentUser.uid, otherUserId],
        lastMessage: text.trim(),
        lastMessageAt: serverTimestamp(),
        lastMessageBy: currentUser.uid,
      }, { merge: true });
      setText('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleMediaUpload = async (result) => {
    try {
      await addDoc(collection(db, 'privateChats', chatId, 'messages'), {
        text: '',
        mediaUrl: result.url,
        mediaType: result.resourceType,
        uid: currentUser.uid,
        displayName: userProfile?.displayName || 'Anonymous',
        photoURL: userProfile?.photoURL || null,
        createdAt: serverTimestamp(),
        type: result.resourceType === 'video' ? 'video' : 'image',
        status: 'sent',
      });
      await setDoc(doc(db, 'conversations', chatId), {
        participants: [currentUser.uid, otherUserId],
        lastMessage: result.resourceType === 'video' ? 'Sent a video' : 'Sent a photo',
        lastMessageAt: serverTimestamp(),
        lastMessageBy: currentUser.uid,
      }, { merge: true });
    } catch {
      toast.error('Failed to send media');
    }
  };

  const handleTranslate = async (msg) => {
    if (translatedIds[msg.id]) {
      setTranslatedIds((prev) => { const n = { ...prev }; delete n[msg.id]; return n; });
      return;
    }
    try {
      const lang = getBrowserLanguage();
      const translated = await translateText(msg.text, lang);
      setTranslatedIds((prev) => ({ ...prev, [msg.id]: translated }));
    } catch {
      toast.error('Translation failed');
    }
  };

  const handleReport = async () => {
    try {
      await addDoc(collection(db, 'reports'), {
        reportedBy: currentUser.uid,
        reportedUser: otherUserId,
        reason: 'Reported by user',
        createdAt: serverTimestamp(),
      });
      toast.success('User reported');
    } catch {
      toast.error('Failed to report user');
    }
  };

  const handleBlock = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const blocked = userProfile?.blockedUsers || [];
      if (!blocked.includes(otherUserId)) {
        await updateDoc(userRef, { blockedUsers: [...blocked, otherUserId] });
        toast.success('User blocked');
        navigate('/chat');
      }
    } catch {
      toast.error('Failed to block user');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-900">
      <div className="flex items-center gap-3 p-4 border-b border-surface-100 dark:border-surface-800">
        <button onClick={onBack} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all md:hidden">
          <svg className="w-5 h-5 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <Avatar src={otherUser?.photoURL} name={otherUser?.displayName} size={40} online={otherUser?.online} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-surface-900 dark:text-white text-sm">
              {otherUser?.displayName || 'User'}
            </span>
            {otherUser?.countryCode && (
              <span className="text-sm">{getCountryFlag(otherUser.countryCode)}</span>
            )}
          </div>
          <p className="text-xs text-surface-500">
            {typingOther ? (
              <span className="text-primary-500 font-medium">typing...</span>
            ) : otherUser?.online ? (
              <span className="text-green-500">Online</span>
            ) : (
              <span>Last seen {formatLastSeen(otherUser?.lastSeen)}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/profile/${otherUserId}`)}
            className="p-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
          <div className="relative group">
            <button className="p-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-xl shadow-lg hidden group-hover:block z-50">
              <button onClick={handleReport} className="w-full text-left px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-all rounded-t-xl">
                Report User
              </button>
              <button onClick={handleBlock} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-b-xl">
                Block User
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.uid === currentUser?.uid;
          return (
            <div key={msg.id} className={`flex gap-3 animate-fade-in ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && <Avatar src={msg.photoURL} name={msg.displayName} size={32} />}
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={isMe ? 'message-bubble-mine' : 'message-bubble-other'}>
                  {msg.mediaUrl && (
                    <div className="mb-2">
                      <MediaPreview url={msg.mediaUrl} type={msg.mediaType} />
                    </div>
                  )}
                  {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                  {translatedIds[msg.id] && (
                    <div className="mt-1.5 pt-1.5 border-t border-white/20">
                      <p className="text-xs opacity-80">Translated: {translatedIds[msg.id]}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-surface-400">{formatMessageTime(msg.createdAt)}</span>
                  {isMe && (
                    <span className="text-xs text-surface-400">
                      {msg.status === 'seen' ? 'Seen' : msg.status === 'delivered' ? 'Delivered' : 'Sent'}
                    </span>
                  )}
                  {msg.text && !isMe && (
                    <button
                      onClick={() => handleTranslate(msg)}
                      className="text-xs text-primary-400 hover:text-primary-600 transition-colors"
                    >
                      {translatedIds[msg.id] ? 'Original' : 'Translate'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-surface-100 dark:border-surface-800">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <MediaUpload onUpload={handleMediaUpload} folder="talksy/private">
            <div className="p-2.5 rounded-xl text-surface-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </div>
          </MediaUpload>
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={handleInputChange}
            className="flex-1 bg-surface-100 dark:bg-surface-800 border-none rounded-2xl px-4 py-3 text-sm outline-none text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="p-3 bg-gradient-primary rounded-xl text-white disabled:opacity-50 hover:opacity-90 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
