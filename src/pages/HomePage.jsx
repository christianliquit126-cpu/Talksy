import { useState, useEffect, useRef } from 'react';
import {
  collection, query, orderBy, limit, onSnapshot,
  addDoc, serverTimestamp, where, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import { MediaPreview } from '../components/MediaUpload';
import MediaUpload from '../components/MediaUpload';
import { formatMessageTime, getCountryFlag } from '../utils/formatters';
import { translateText, getBrowserLanguage } from '../utils/translate';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [translatedIds, setTranslatedIds] = useState({});
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'globalChat'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse();
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('online', '==', true), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      setOnlineUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'globalTyping'), where('typing', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      const users = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.uid !== currentUser?.uid);
      setTypingUsers(users);
    });
    return unsub;
  }, [currentUser]);

  const setTypingStatus = async (isTyping) => {
    if (!currentUser) return;
    try {
      const { setDoc, doc } = await import('firebase/firestore');
      await setDoc(doc(db, 'globalTyping', currentUser.uid), {
        uid: currentUser.uid,
        name: userProfile?.displayName || 'Someone',
        typing: isTyping,
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
      await addDoc(collection(db, 'globalChat'), {
        text: text.trim(),
        uid: currentUser.uid,
        displayName: userProfile?.displayName || 'Anonymous',
        photoURL: userProfile?.photoURL || null,
        countryCode: userProfile?.countryCode || '',
        country: userProfile?.country || '',
        createdAt: serverTimestamp(),
        type: 'text',
      });
      setText('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleMediaUpload = async (result) => {
    try {
      await addDoc(collection(db, 'globalChat'), {
        text: '',
        mediaUrl: result.url,
        mediaType: result.resourceType,
        uid: currentUser.uid,
        displayName: userProfile?.displayName || 'Anonymous',
        photoURL: userProfile?.photoURL || null,
        countryCode: userProfile?.countryCode || '',
        country: userProfile?.country || '',
        createdAt: serverTimestamp(),
        type: result.resourceType === 'video' ? 'video' : 'image',
      });
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

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col h-full">
        <div className="p-4 border-b border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-display font-bold text-surface-900 dark:text-white">Global Chat</h1>
              <p className="text-xs text-surface-500">{onlineUsers.length} people online</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-500 font-medium">Live</span>
            </div>
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {onlineUsers.slice(0, 15).map((u) => (
              <div key={u.id} className="story-circle">
                <div className="story-ring">
                  <Avatar src={u.photoURL} name={u.displayName} size={44} />
                </div>
                <span className="text-xs text-surface-600 dark:text-surface-400 truncate w-14 text-center">
                  {u.displayName?.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.uid === currentUser?.uid;
            return (
              <div key={msg.id} className={`flex gap-3 animate-fade-in ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && (
                  <div className="flex-shrink-0">
                    <Avatar src={msg.photoURL} name={msg.displayName} size={34} />
                  </div>
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                        {msg.displayName}
                      </span>
                      {msg.countryCode && (
                        <span className="text-sm">{getCountryFlag(msg.countryCode)}</span>
                      )}
                    </div>
                  )}
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

          {typingUsers.length > 0 && (
            <div className="flex gap-3">
              <Avatar src={typingUsers[0]?.photoURL} name={typingUsers[0]?.name} size={34} />
              <div className="message-bubble-other">
                <div className="typing-indicator flex gap-1 py-0.5">
                  <span /><span /><span />
                </div>
                <p className="text-xs text-surface-400 mt-1">
                  {typingUsers.map((u) => u.name).join(', ')} is typing...
                </p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-900">
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <MediaUpload onUpload={handleMediaUpload} folder="talksy/chat">
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
              className="p-3 bg-gradient-primary rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
