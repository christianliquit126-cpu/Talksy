import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, 'HH:mm');
}

export function formatLastSeen(timestamp) {
  if (!timestamp) return 'a while ago';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatChatListTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export function formatPostTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getCountryFlag(countryCode) {
  if (!countryCode) return '';
  const codePoints = [...countryCode.toUpperCase()].map(
    (c) => 127397 + c.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
}

export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
