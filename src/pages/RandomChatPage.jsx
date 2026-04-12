import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection, doc, setDoc, getDoc, deleteDoc, addDoc, onSnapshot,
  query, where, serverTimestamp, orderBy, getDocs, limit, updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { formatMessageTime, getCountryFlag } from '../utils/formatters';
import toast from 'react-hot-toast';

const MOODS = ['Chill', 'Study', 'Gaming', 'Love Advice', 'Just Talk', 'Creative'];
const MOOD_COLORS = {
  'Chill': 'from-blue-500 to-cyan-500',
  'Study': 'from-emerald-500 to-teal-500',
  'Gaming': 'from-violet-500 to-purple-600',
  'Love Advice': 'from-pink-500 to-rose-500',
  'Just Talk': 'from-amber-500 to-orange-400',
  'Creative': 'from-fuchsia-500 to-pink-500',
};

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_rc_');
}

export default function RandomChatPage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [phase, setPhase] = useState('idle'); // idle | searching | chatting | matched
  const [selectedMood, setSelectedMood] = useState(searchParams.get('mood') || '');
  const [partner, setPartner] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typingOther, setTypingOther] = useState(false);
  const [liked, setLiked] = useState(false);
  const [partnerLiked, setPartnerLiked] = useState(false);
  const [matchPopup, setMatchPopup] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const queueUnsub = useRef(null);
  const chatUnsub = useRef(null);
  const typingUnsub = useRef(null);
  const chatDocUnsub = useRef(null);

  const cleanup = useCallback(async () => {
    if (queueUnsub.current) { queueUnsub.current(); queueUnsub.current = null; }
    if (chatUnsub.current) { chatUnsub.current(); chatUnsub.current = null; }
    if (typingUnsub.current) { typingUnsub.current(); typingUnsub.current = null; }
    if (chatDocUnsub.current) { chatDocUnsub.current(); chatDocUnsub.current = null; }
    if (currentUser) {
      try { await deleteDoc(doc(db, 'randomQueue', currentUser.uid)); } catch {}
    }
  }, [currentUser]);

  useEffect(() => {
    return () => { cleanup(); };
  }, [cleanup]);

  const enterChat = useCallback(async (id, partnerId) => {
    setChatId(id);
    try {
      const partnerSnap = await getDoc(doc(db, 'users', partnerId));
      if (partnerSnap.exists()) setPartner({ id: partnerSnap.id, ...partnerSnap.data() });
    } catch {}
    setPhase('chatting');
    setMessages([]);
    setLiked(false);
    setPartnerLiked(false);
    setMatchPopup(false);

    chatUnsub.current = onSnapshot(
      query(collection(db, 'randomChats', id, 'messages'), orderBy('createdAt', 'asc')),
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
      }
    );

    chatDocUnsub.current = onSnapshot(doc(db, 'randomChats', id), (snap) => {
      if (!snap.exists()) { handleDisconnect(); return; }
      const data = snap.data();
      const isLiked = data?.liked?.[currentUser.uid] === true;
      const isPartnerLiked = data?.liked?.[partnerId] === true;
      setLiked(isLiked);
      setPartnerLiked(isPartnerLiked);
      if (isLiked && isPartnerLiked) setMatchPopup(true);
    });

    typingUnsub.current = onSnapshot(doc(db, 'randomTyping', `${id}_${partnerId}`), (snap) => {
      setTypingOther(snap.exists() && snap.data()?.typing === true);
    });
  }, [currentUser]);

  const findMatch = async () => {
    if (!currentUser) return;
    setPhase('searching');

    try {
      const q = query(
        collection(db, 'randomQueue'),
        where('status', '==', 'waiting'),
        limit(10)
      );
      const snap = await getDocs(q);
      const others = snap.docs.filter(d => d.id !== currentUser.uid);

      if (others.length > 0) {
        const match = others[Math.floor(Math.random() * others.length)];
        const partnerId = match.id;
        const id = getChatId(currentUser.uid, partnerId);

        await setDoc(doc(db, 'randomChats', id), {
          participants: [currentUser.uid, partnerId],
          createdAt: serverTimestamp(),
          liked: { [currentUser.uid]: false, [partnerId]: false },
          mood: selectedMood || null,
        });

        try { await deleteDoc(doc(db, 'randomQueue', partnerId)); } catch {}
        try { await deleteDoc(doc(db, 'randomQueue', currentUser.uid)); } catch {}

        enterChat(id, partnerId);
      } else {
        await setDoc(doc(db, 'randomQueue', currentUser.uid), {
          uid: currentUser.uid,
          displayName: userProfile?.displayName || 'Anonymous',
          photoURL: userProfile?.photoURL || null,
          countryCode: userProfile?.countryCode || '',
          mood: selectedMood || null,
          status: 'waiting',
          joinedAt: serverTimestamp(),
        });

        queueUnsub.current = onSnapshot(
          query(
            collection(db, 'randomChats'),
            where('participants', 'array-contains', currentUser.uid),
            orderBy('createdAt', 'desc'),
            limit(1)
          ),
          (snap) => {
            if (snap.docs.length > 0) {
              const chatData = snap.docs[0].data();
              const id = snap.docs[0].id;
              const partnerId = chatData.participants.find(p => p !== currentUser.uid);
              if (queueUnsub.current) { queueUnsub.current(); queueUnsub.current = null; }
              deleteDoc(doc(db, 'randomQueue', currentUser.uid)).catch(() => {});
              enterChat(id, partnerId);
            }
          }
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to find a match. Try again.');
      setPhase('idle');
    }
  };

  const handleNext = async () => {
    if (chatId) {
      try { await deleteDoc(doc(db, 'randomChats', chatId)); } catch {}
    }
    await cleanup();
    setPhase('idle');
    setPartner(null);
    setChatId(null);
    setMessages([]);
    setMatchPopup(false);
  };

  const handleDisconnect = () => {
    cleanup();
    setPhase('idle');
    setPartner(null);
    setChatId(null);
    setMessages([]);
    setMatchPopup(false);
    toast('The other person disconnected.', { icon: '👋' });
  };

  const setTypingStatus = async (isTyping) => {
    if (!chatId || !currentUser) return;
    try {
      await setDoc(doc(db, 'randomTyping', `${chatId}_${currentUser.uid}`), {
        typing: isTyping, uid: currentUser.uid, updatedAt: serverTimestamp(),
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
    if (!text.trim() || sending || !chatId) return;
    setSending(true);
    setTypingStatus(false);
    const msgText = text.trim();
    setText('');
    try {
      await addDoc(collection(db, 'randomChats', chatId, 'messages'), {
        text: msgText,
        uid: currentUser.uid,
        displayName: userProfile?.displayName || 'Anonymous',
        photoURL: userProfile?.photoURL || null,
        createdAt: serverTimestamp(),
      });
    } catch {
      toast.error('Failed to send');
      setText(msgText);
    } finally {
      setSending(false);
    }
  };

  const handleLike = async () => {
    if (!chatId || liked) return;
    try {
      await updateDoc(doc(db, 'randomChats', chatId), {
        [`liked.${currentUser.uid}`]: true,
      });
    } catch {}
  };

  const handleAddFriend = async () => {
    if (!partner) return;
    navigate(`/private/${partner.id}`);
    toast.success('Opening private chat!');
  };

  if (phase === 'idle') {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="w-full max-w-lg animate-slide-up">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center animate-glow-pulse"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="font-display font-black text-4xl text-white mb-2">Random Chat</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-base">
              Get matched with a stranger instantly. Skip anytime, like if you vibe.
            </p>
          </div>

          <div className="glass-card p-6 mb-6">
            <p className="text-sm font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
              What's your mood right now?
            </p>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(selectedMood === mood ? '' : mood)}
                  className={`mood-chip text-sm ${selectedMood === mood ? 'active' : ''}`}
                >
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${MOOD_COLORS[mood]} flex-shrink-0`} />
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={findMatch}
            className="btn-primary w-full py-4 text-lg"
          >
            Find a Random Match
          </button>

          <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
            You'll be matched anonymously with someone online
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'searching') {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full animate-pulse-ring" style={{ background: 'rgba(124,58,237,0.3)' }} />
            <div className="absolute inset-2 rounded-full animate-pulse-ring" style={{ background: 'rgba(236,72,153,0.2)', animationDelay: '0.5s' }} />
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              <svg className="w-10 h-10 text-white animate-searching" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">Finding your match...</h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {selectedMood ? `Looking for someone who's feeling ${selectedMood}` : 'Searching for someone online'}
          </p>
          <button
            onClick={async () => { await cleanup(); setPhase('idle'); }}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {matchPopup && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}>
          <div className="glass-card p-8 text-center max-w-sm match-popup" style={{ borderColor: 'rgba(236,72,153,0.4)' }}>
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ec4899, #f97316)' }}>
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="font-display font-black text-2xl text-white mb-2">It's a Match!</h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
              You and {partner?.displayName} liked each other. Add as friends to keep chatting!
            </p>
            <div className="flex gap-3">
              <button onClick={handleAddFriend} className="btn-primary flex-1">
                Add Friend
              </button>
              <button onClick={() => setMatchPopup(false)} className="btn-secondary flex-1">
                Keep Chatting
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <Avatar src={partner?.photoURL} name={partner?.displayName} size={40} online />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">{partner?.displayName || 'Stranger'}</span>
            {partner?.countryCode && <span className="text-sm">{getCountryFlag(partner.countryCode)}</span>}
          </div>
          <p className="text-xs text-green-400">
            {typingOther ? <span style={{ color: '#a78bfa' }}>typing...</span> : 'Connected'}
          </p>
        </div>

        <button
          onClick={handleLike}
          className={`p-2.5 rounded-xl transition-all ${liked ? 'scale-110' : 'hover:scale-105'}`}
          style={{
            background: liked ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${liked ? 'rgba(236,72,153,0.5)' : 'rgba(255,255,255,0.1)'}`,
          }}
          title={liked ? 'Liked!' : 'Like this person'}
        >
          <svg className="w-5 h-5" fill={liked ? '#ec4899' : 'none'} stroke={liked ? '#ec4899' : 'currentColor'} viewBox="0 0 24 24" style={{ color: liked ? '#ec4899' : 'rgba(255,255,255,0.5)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {partnerLiked && !liked && (
          <div className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.3)' }}>
            Liked you!
          </div>
        )}

        <button
          onClick={handleNext}
          className="btn-secondary text-sm py-2 px-4"
        >
          Next
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#a78bfa' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              You're matched with {partner?.displayName || 'Stranger'}!
            </p>
            <p className="text-xs mt-1">Say hi to start the conversation</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.uid === currentUser?.uid;
          return (
            <div key={msg.id} className={`flex gap-2 animate-fade-in ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && <Avatar src={msg.photoURL} name={msg.displayName} size={30} />}
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                <div className={isMe ? 'message-bubble-mine' : 'message-bubble-other'}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {formatMessageTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        {typingOther && (
          <div className="flex gap-2">
            <Avatar src={partner?.photoURL} name={partner?.displayName} size={30} />
            <div className="message-bubble-other">
              <div className="typing-indicator flex gap-1 py-0.5"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={handleInputChange}
            className="input-field flex-1"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="p-3 rounded-xl text-white disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
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
