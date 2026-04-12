import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Random Chat',
      desc: 'Get matched with strangers instantly. Skip, like, and connect with new people every time.',
      gradient: 'from-violet-600 to-purple-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Private Chat',
      desc: 'Send direct messages to friends you\'ve made. Real-time, fast, and always live.',
      gradient: 'from-pink-500 to-rose-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      title: 'Real-time Messaging',
      desc: 'Messages delivered instantly. Typing indicators, online status, and zero delay.',
      gradient: 'from-blue-500 to-indigo-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
    },
    {
      title: 'Like and Match',
      desc: 'Heart someone during a random chat. If they heart back, it\'s a match — add as friends.',
      gradient: 'from-rose-500 to-pink-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: 'Global Community',
      desc: 'Meet people from 100+ countries. Filter by country, age, and shared interests.',
      gradient: 'from-emerald-500 to-teal-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Moments Feed',
      desc: 'Share photos, videos, and thoughts. Like and comment on what people post.',
      gradient: 'from-amber-500 to-orange-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const moods = ['Chill', 'Study', 'Gaming', 'Love Advice', 'Just Talk', 'Creative'];

  return (
    <div className="min-h-screen app-bg overflow-x-hidden">
      <div className="blur-dot absolute top-0 left-1/4 w-96 h-96 bg-violet-600 opacity-20 -translate-y-1/2" />
      <div className="blur-dot absolute top-1/3 right-0 w-80 h-80 bg-pink-500 opacity-15 translate-x-1/2" />
      <div className="blur-dot absolute bottom-0 left-0 w-72 h-72 bg-blue-600 opacity-15 translate-y-1/2 -translate-x-1/4" />

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Talksy" className="w-9 h-9" />
          <span className="font-display font-black text-2xl gradient-text">Talksy</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/auth')}
            className="btn-secondary text-sm py-2 px-5"
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/auth?mode=register')}
            className="btn-primary text-sm py-2 px-5"
          >
            Sign Up
          </button>
        </div>
      </nav>

      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live now — thousands chatting
          </div>
          <h1 className="font-display font-black text-6xl md:text-7xl lg:text-8xl leading-none mb-6">
            <span className="text-white">Meet.</span>{' '}
            <span className="gradient-text">Chat.</span>{' '}
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Connect.</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
            Make new friends through random, anonymous chats. Filter by mood, country, and interests. It only takes a second to find someone new.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
            <button
              onClick={() => navigate('/auth')}
              className="btn-primary text-base py-4 px-8"
            >
              Start Chatting
            </button>
            <button
              onClick={() => navigate('/auth')}
              style={{
                background: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(124,58,237,0.15) 100%)',
                border: '1.5px solid rgba(236,72,153,0.4)',
                color: '#f472b6',
              }}
              className="font-semibold py-4 px-8 rounded-2xl hover:opacity-80 active:scale-95 transition-all duration-200 text-base"
            >
              Try Random Chat
            </button>
          </div>

          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {moods.map((mood) => (
              <span key={mood} className="mood-chip text-xs">
                {mood}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full max-w-sm lg:max-w-md animate-float">
          <div className="glass-card p-1 shadow-glow-primary">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,13,26,0.9)' }}>
              <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2" style={{ borderColor: '#0d0d1a' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Jade #142</p>
                    <p className="text-xs text-green-400">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3 min-h-48">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }} />
                  <div>
                    <div className="message-bubble-other text-sm py-2.5 px-3">Hey, how's it going?</div>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>11s</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-row-reverse">
                  <div>
                    <div className="message-bubble-mine text-sm py-2.5 px-3">Hi! I'm good, just chilling. You?</div>
                    <p className="text-xs mt-1 text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>8s</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }} />
                  <div>
                    <div className="message-bubble-other text-sm py-2.5 px-3">Same! Looking for someone cool to chat with.</div>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>3s</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-2xl px-4 py-2.5 text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                    Type a message...
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 glass-card-hover rounded-2xl p-3 flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">VibeKing_77 liked you!</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Tap the heart to match</p>
            </div>
            <button className="btn-primary text-xs py-1.5 px-4">Friends</button>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
            Everything you need to{' '}
            <span className="gradient-text">connect</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Built for Gen Z, designed to feel like a social app — not a boring chat widget.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass-card-hover rounded-2xl p-6 group">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-2xl mx-auto px-6 md:px-12 py-24 text-center">
        <div className="glass-card p-12">
          <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-4">
            Ready to vibe?
          </h2>
          <p className="text-white/50 mb-8">Join thousands of people already chatting on Talksy.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/auth?mode=register')}
              className="btn-primary text-base py-4 px-8"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="btn-secondary text-base py-4 px-8"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 text-center py-8 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.png" alt="Talksy" className="w-5 h-5" />
          <span className="font-display font-bold text-sm gradient-text">Talksy</span>
        </div>
        <p className="text-xs">Chat. Connect. Vibe. — Made with love for Gen Z</p>
      </footer>
    </div>
  );
}
