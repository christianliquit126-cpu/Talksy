export default function Avatar({ src, name, size = 40, online = false, className = '' }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const colors = [
    'from-violet-500 to-purple-600',
    'from-pink-500 to-rose-600',
    'from-orange-500 to-amber-600',
    'from-teal-500 to-cyan-600',
    'from-blue-500 to-indigo-600',
    'from-green-500 to-emerald-600',
    'from-red-500 to-rose-600',
    'from-fuchsia-500 to-pink-600',
  ];

  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
  const gradient = colors[colorIdx];

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      {src ? (
        <img
          src={src}
          alt={name || 'User'}
          className="rounded-full object-cover w-full h-full"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold`}
        style={{
          fontSize: size * 0.35,
          display: src ? 'none' : 'flex',
        }}
      >
        {initials}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
      )}
    </div>
  );
}
