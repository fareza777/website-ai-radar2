import { describe, it, expect } from 'vitest';
import { canonicalUrl, normalizeDate, classify, normalizeItem, mergeUpdates, dealState, cleanText, rank, applySummary } from '../src/lib/intelligence';
import { labs, sources } from '../src/config/labs';
import { filterUpdates } from '../src/lib/filter';
import type { Source } from '../src/lib/schema';
const now = '2026-10-09T10:00:00.000Z';
const source: Source = { id: 'openai-blog', lab: 'openai', kind: 'rss', url: 'https://openai.com/news/rss.xml', official: true };
const raw = { title: 'Introducing a new model', url: 'https://openai.com/index/model/?utm_source=rss', date: '2026-10-01T10:00:00Z', content: '<p>A new reasoning model.</p>' };
const item = () => normalizeItem(raw, source, now)!;
describe('intelligence contracts', () => {
  it('covers twenty distinct labs and source IDs', () => { expect(labs).toHaveLength(20); expect(new Set(sources.map(s => s.id)).size).toBe(sources.length); for (const lab of labs) expect(sources.some(s => s.lab === lab.slug)).toBe(true); });
  it('canonicalizes tracking without destroying meaningful parameters', () => { expect(canonicalUrl(raw.url)).toBe('https://openai.com/index/model'); expect(canonicalUrl('https://example.org/a?b=2&ref=feed&a=1#x')).toBe('https://example.org/a?a=1&b=2'); expect(canonicalUrl('javascript:alert(1)')).toBeNull(); expect(canonicalUrl('garbage')).toBeNull(); });
  it('rejects missing, ambiguous and future publication dates', () => { expect(normalizeDate('', now)).toBeNull(); expect(normalizeDate('October 2026', now)).toBeNull(); expect(normalizeDate('2027-01-01', now)).toBeNull(); expect(normalizeDate('2026-10-01', now)).toBe('2026-10-01T00:00:00.000Z'); });
  it('does not manufacture publication dates', () => { expect(normalizeItem({ ...raw, date: '' }, source, now)).toBeNull(); expect(normalizeItem({ ...raw, url: 'javascript:x' }, source, now)).toBeNull(); expect(normalizeItem({ ...raw, title: '' }, source, now)).toBeNull(); });
  it.each([['New reasoning model', 'Model'], ['API endpoint', 'API'], ['Subscription pricing', 'Pricing'], ['Free credits promotion', 'Promo'], ['Research paper', 'Research'], ['SDK release', 'Developer'], ['New interface', 'Feature']])('classifies %s', (title, category) => { expect(classify(title, source.kind)).toBe(category); });
  it('gives SDK releases a developer category and bounded relevance', () => { expect(classify('v1.2', 'github')).toBe('Developer'); expect(rank('new frontier model', 'Model')).toBeGreaterThan(rank('SDK patch fix', 'Developer')); expect(rank('something', 'Feature')).toBeLessThanOrEqual(100); });
  it('provides English rule-based analysis with honest original excerpt', () => { expect(item().summary).toContain('OpenAI published'); expect(item().benefit).toContain('Evaluate capabilities'); expect(item().summaryMethod).toBe('rules'); expect(item().originalExcerpt).toBe('A new reasoning model.'); expect(item().verification).toBe('official'); expect(cleanText('<script>bad()</script><p>Hi &amp; bye</p>')).toBe('Hi & bye'); });
  it('deduplicates across sources and tracks content revisions', () => {
    const first = item(); const duplicate = { ...first, sourceIds: ['mirror'] };
    expect(mergeUpdates([first], [duplicate], now)).toHaveLength(1);
    expect(mergeUpdates([first], [duplicate], now)[0].sourceIds).toContain('mirror');
    const changed = normalizeItem({ ...raw, content: 'Changed pricing information' }, source, '2026-10-09T11:00:00.000Z')!;
    const merged = mergeUpdates([first], [changed], now)[0];
    expect(merged.history).toHaveLength(1); expect(merged.history[0].excerpt).toBe(first.originalExcerpt); expect(merged.firstSeenAt).toBe(first.firstSeenAt);
  });
  it('retains unchanged updatedAt and all history when a source fails', () => { const first = item(); expect(mergeUpdates([first], [], now)).toEqual([first]); expect(mergeUpdates([first], [first], '2026-10-09T12:00:00.000Z')[0].updatedAt).toBe(first.updatedAt); });
  it('does not merge different labs or unrelated titles', () => { const first = item(); expect(mergeUpdates([first], [{ ...first, id: 'other', lab: 'meta' }], now)).toHaveLength(2); });
  it('preserves cached AI summaries unless source content changes', () => { const first = { ...item(), summaryMethod: 'llm' as const, summary: 'Ringkasan AI' }; expect(mergeUpdates([first], [item()], now)[0].summary).toBe('Ringkasan AI'); });
  it('validates optional summaries without trusting external instructions', () => { expect(applySummary(item(), { summary: 'Ringkasan Indonesia', benefit: 'Manfaat praktis' }).summaryMethod).toBe('llm'); expect(() => applySummary(item(), { summary: '' })).toThrow(); });
  it('expires offers and refuses stale or future-start verification', () => {
    expect(dealState({ checkedAt: now, evidence: 'Free of charge', endsAt: '2026-10-08T00:00:00Z', startsAt: null }, now)).toBe('expired');
    expect(dealState({ checkedAt: now, evidence: 'Free', endsAt: null, startsAt: null }, now)).toBe('active');
    expect(dealState({ checkedAt: '2026-10-01T00:00:00Z', evidence: 'Free', endsAt: null, startsAt: null }, now)).toBe('unverified');
    expect(dealState({ checkedAt: now, evidence: 'Free', endsAt: null, startsAt: '2026-10-10T00:00:00Z' }, now)).toBe('unverified');
    expect(dealState({ checkedAt: null, evidence: '', endsAt: null, startsAt: null }, now)).toBe('unverified');
  });
});
describe('feed filtering', () => {
  const items = [item(), { ...item(), id: 'old', lab: 'meta', publishedAt: '2026-09-02T10:00:00Z', important: false, score: 20 }];
  it('supports query, lab, category, ranges, important, unread and saved', () => {
    expect(filterUpdates(items, { range: '7', now })).toHaveLength(0);
    expect(filterUpdates(items, { range: '30', now })).toHaveLength(1);
    expect(filterUpdates(items, { lab: 'meta', now })[0].id).toBe('old');
    expect(filterUpdates(items, { category: 'API', now })).toHaveLength(0);
    expect(filterUpdates(items, { query: 'introducing', now })).toHaveLength(2);
    expect(filterUpdates(items, { important: true, now })).toHaveLength(1);
    expect(filterUpdates(items, { unread: true, read: [items[0].id], now })).toHaveLength(1);
    expect(filterUpdates(items, { savedOnly: true, saved: [items[0].id], now })).toHaveLength(1);
    expect(filterUpdates(items, { sort: 'important', now })[0].score).toBeGreaterThan(20);
    expect(filterUpdates(items, { from: '2026-09-01', to: '2026-09-03', now })).toHaveLength(1);
  });
  it('defines Today in Asia/Jakarta, not server timezone', () => { const midnight = { ...item(), publishedAt: '2026-10-08T18:00:00Z' }; expect(filterUpdates([midnight], { range: 'today', now })).toHaveLength(1); });
});
