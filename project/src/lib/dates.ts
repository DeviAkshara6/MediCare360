export function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function nowTime(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function isPastDate(date: string): boolean {
  return date < todayISO();
}

export function isToday(date: string): boolean {
  return date === todayISO();
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatDate(date: string): string {
  if (!date) return '—';
  const [y, m, d] = date.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return date;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function formatTime(time: string): string {
  if (!time) return '—';
  const [hStr, m] = time.split(':');
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

export function daysFromNow(date: string): number {
  const [y, m, d] = date.split('-').map((n) => parseInt(n, 10));
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.round(diff / 86400000);
}

export function relativeDay(date: string): string {
  const n = daysFromNow(date);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n > 0) return `In ${n} days`;
  return `${Math.abs(n)} days ago`;
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}
