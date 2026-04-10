import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return format(date, 'HH:mm');
  } catch {
    return '';
  }
}

export function formatLastSeen(timestamp) {
  if (!timestamp) return 'a while ago';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'a while ago';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'a while ago';
  }
}

export function formatChatListTime(timestamp) {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  } catch {
    return '';
  }
}

export function formatPostTime(timestamp) {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
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
