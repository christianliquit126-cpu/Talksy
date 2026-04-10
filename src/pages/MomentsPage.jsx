import { useState, useEffect } from 'react';
import {
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp,
  doc, updateDoc, arrayUnion, arrayRemove, limit, where
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import MediaUpload, { MediaPreview } from '../components/MediaUpload';
import { formatPostTime, getCountryFlag } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function MomentsPage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState('');
  const [pendingMedia, setPendingMedia] = useState(null);
  const [posting, setPosting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'moments'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('online', '==', true), limit(15));
    const unsub = onSnapshot(q, (snap) => {
      setOnlineUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handlePost = async () => {
    if (!caption.trim() && !pendingMedia) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'moments'), {
        caption: caption.trim(),
        mediaUrl: pendingMedia?.url || null,
        mediaType: pendingMedia?.resourceType || null,
        uid: currentUser.uid,
        displayName: userProfile?.displayName || 'Anonymous',
        photoURL: userProfile?.photoURL || null,
        country: userProfile?.country || '',
        countryCode: userProfile?.countryCode || '',
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      });
      setCaption('');
      setPendingMedia(null);
      setShowCreate(false);
      toast.success('Moment posted!');
    } catch {
      toast.error('Failed to post moment');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId, likes) => {
    const ref = doc(db, 'moments', postId);
    const isLiked = likes?.includes(currentUser.uid);
    try {
      await updateDoc(ref, {
        likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
      });
    } catch {}
  };

  const handleComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    try {
      const ref = doc(db, 'moments', postId);
      await updateDoc(ref, {
        comments: arrayUnion({
          uid: currentUser.uid,
          displayName: userProfile?.displayName || 'Anonymous',
          photoURL: userProfile?.photoURL || null,
          text,
          createdAt: new Date().toISOString(),
        }),
      });
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    } catch {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Moments</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-primary text-sm py-2 px-4"
        >
          + Share Moment
        </button>
      </div>

      <div className="mb-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 pb-2">
          <div className="story-circle" onClick={() => setShowCreate(true)}>
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary-300 bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
              <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs text-surface-600 dark:text-surface-400">Your Story</span>
          </div>
          {onlineUsers.map((u) => (
            <div key={u.id} className="story-circle" onClick={() => navigate(`/profile/${u.id}`)}>
              <div className="story-ring cursor-pointer">
                <Avatar src={u.photoURL} name={u.displayName} size={56} />
              </div>
              <span className="text-xs text-surface-600 dark:text-surface-400 truncate w-16 text-center">
                {u.displayName?.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <div className="card p-4 mb-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <Avatar src={userProfile?.photoURL} name={userProfile?.displayName} size={40} />
            <div>
              <p className="text-sm font-semibold text-surface-900 dark:text-white">{userProfile?.displayName}</p>
              <p className="text-xs text-surface-500">Share a moment with the world</p>
            </div>
          </div>
          <textarea
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="input-field resize-none mb-3"
          />
          {pendingMedia && (
            <div className="mb-3 relative">
              <MediaPreview url={pendingMedia.url} type={pendingMedia.resourceType} className="w-full max-h-48 object-cover" />
              <button
                onClick={() => setPendingMedia(null)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <MediaUpload onUpload={setPendingMedia} folder="talksy/moments">
              <div className="flex items-center gap-2 text-sm text-surface-500 hover:text-primary-500 cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add Photo/Video
              </div>
            </MediaUpload>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="btn-ghost text-sm py-1.5">Cancel</button>
              <button onClick={handlePost} disabled={posting || (!caption.trim() && !pendingMedia)} className="btn-primary text-sm py-1.5 px-4">
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => {
          const isLiked = post.likes?.includes(currentUser?.uid);
          const showComments = expandedComments[post.id];
          return (
            <div key={post.id} className="card overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${post.uid}`)}>
                  <Avatar src={post.photoURL} name={post.displayName} size={40} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-surface-900 dark:text-white">{post.displayName}</span>
                      {post.countryCode && <span className="text-sm">{getCountryFlag(post.countryCode)}</span>}
                    </div>
                    <p className="text-xs text-surface-500">{formatPostTime(post.createdAt)}</p>
                  </div>
                </div>
              </div>

              {post.caption && (
                <p className="px-4 pb-3 text-sm text-surface-800 dark:text-surface-200 leading-relaxed">{post.caption}</p>
              )}

              {post.mediaUrl && (
                <div className="w-full">
                  <MediaPreview url={post.mediaUrl} type={post.mediaType} className="w-full max-h-96 object-cover rounded-none" />
                </div>
              )}

              <div className="px-4 py-3 flex items-center gap-4 border-t border-surface-50 dark:border-surface-800">
                <button
                  onClick={() => handleLike(post.id, post.likes)}
                  className={`flex items-center gap-1.5 text-sm transition-all ${isLiked ? 'text-red-500' : 'text-surface-500 hover:text-red-400'}`}
                >
                  <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {post.likes?.length || 0}
                </button>
                <button
                  onClick={() => setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                  className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-500 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {post.comments?.length || 0}
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                  className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-500 transition-all ml-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>

              {showComments && (
                <div className="px-4 pb-4 border-t border-surface-50 dark:border-surface-800">
                  <div className="space-y-3 mt-3 max-h-40 overflow-y-auto">
                    {(post.comments || []).map((c, i) => (
                      <div key={i} className="flex gap-2">
                        <Avatar src={c.photoURL} name={c.displayName} size={28} />
                        <div className="flex-1 bg-surface-50 dark:bg-surface-800 rounded-xl px-3 py-2">
                          <span className="text-xs font-semibold text-surface-800 dark:text-surface-200">{c.displayName} </span>
                          <span className="text-xs text-surface-600 dark:text-surface-400">{c.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Avatar src={userProfile?.photoURL} name={userProfile?.displayName} size={28} />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        className="flex-1 bg-surface-100 dark:bg-surface-800 rounded-xl px-3 py-2 text-xs outline-none text-surface-900 dark:text-surface-100 placeholder:text-surface-400"
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                      />
                      <button onClick={() => handleComment(post.id)} className="text-primary-500 hover:text-primary-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {posts.length === 0 && (
          <div className="text-center py-16 text-surface-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">No moments yet</p>
            <p className="text-xs mt-1">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
