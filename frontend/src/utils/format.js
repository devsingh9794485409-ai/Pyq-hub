// src/utils/format.js
export const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ['y', 31536000],
    ['mo', 2592000],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ];
  for (const [label, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value}${label} ago`;
  }
  return 'just now';
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

export const TYPE_STYLES = {
  PYQ: 'bg-brand-50 text-brand-700 ring-1 ring-brand-200',
  Notes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Sessional: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
};

export const TYPE_LABELS = { PYQ: 'PYQ', Notes: 'Notes', Sessional: 'Sessional' };