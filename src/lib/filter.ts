import type { Update } from './schema';
export interface Filters { query?: string; lab?: string; category?: string; range?: string; important?: boolean; unread?: boolean; read?: string[]; savedOnly?: boolean; saved?: string[]; sort?: string; from?: string; to?: string; now: string; }
const day = (date: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));
export function filterUpdates(items: Update[], f: Filters): Update[] {
  const query = f.query?.trim().toLowerCase(); const now = Date.parse(f.now);
  return items.filter(item => {
    if (query && !`${item.title} ${item.summary} ${item.lab} ${item.category} ${item.originalExcerpt}`.toLowerCase().includes(query)) return false;
    if (f.lab && f.lab !== 'all' && item.lab !== f.lab) return false;
    if (f.category && f.category !== 'all' && item.category !== f.category) return false;
    if (f.important && !item.important) return false;
    if (f.unread && f.read?.includes(item.id)) return false;
    if (f.savedOnly && !f.saved?.includes(item.id)) return false;
    if (f.range === 'today' && day(item.publishedAt) !== day(f.now)) return false;
    if (f.range && /^\d+$/.test(f.range) && Date.parse(item.publishedAt) < now - Number(f.range) * 86400000) return false;
    if (f.from && day(item.publishedAt) < f.from) return false;
    if (f.to && day(item.publishedAt) > f.to) return false;
    return true;
  }).sort((a, b) => f.sort === 'important' ? b.score - a.score || Date.parse(b.publishedAt) - Date.parse(a.publishedAt) : Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
