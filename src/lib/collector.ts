import Parser from 'rss-parser';
import { load } from 'cheerio';
import { normalizeDate } from './intelligence';
import type { Source, RawItem, SourceStatus } from './schema';
const parser = new Parser();
export type Fetcher = typeof fetch;
export function requestHeaders(url: string, token?: string): Record<string, string> {
  const headers: Record<string, string> = { 'User-Agent': 'AI-Radar/1.0 (+https://github.com/fareza777/website-ai-radar2)', Accept: 'application/json, application/rss+xml, text/html;q=0.9' };
  if (token && new URL(url).hostname === 'api.github.com') headers.Authorization = `Bearer ${token}`;
  return headers;
}
export async function getResponse(url: string, options: { fetcher?: Fetcher; token?: string; headers?: Record<string, string> } = {}): Promise<Response> {
  const response = await (options.fetcher || fetch)(url, { headers: { ...requestHeaders(url, options.token), ...options.headers }, signal: AbortSignal.timeout(20000), redirect: 'follow' });
  if (!response.ok && response.status !== 304) throw new Error(`HTTP ${response.status} ${new URL(url).hostname}`);
  const length = Number(response.headers.get('content-length') || 0); if (length > 8_000_000) throw new Error('Source exceeds 8 MB');
  return response;
}
function dateFromHtml(html: string, now: string): string | null {
  const $ = load(html);
  const meta = $('meta[property="article:published_time"],meta[name="date"],meta[itemprop="datePublished"]').first().attr('content');
  if (meta) return normalizeDate(meta, now);
  for (const script of $('script[type="application/ld+json"]').toArray()) {
    try { const value: unknown = JSON.parse($(script).text()); const find = (node: unknown): string | null => {
      if (Array.isArray(node)) { for (const child of node) { const found = find(child); if (found) return found; } }
      else if (node && typeof node === 'object') { const object = node as Record<string, unknown>; if (typeof object.datePublished === 'string') return normalizeDate(object.datePublished, now); for (const child of Object.values(object)) { const found = find(child); if (found) return found; } }
      return null;
    }; const date = find(value); if (date) return date; } catch { /* Malformed publisher JSON-LD: try the next documented date field. */ }
  }
  const time = $('time').first(); return normalizeDate(time.attr('datetime') || time.text(), now);
}
export async function parseSource(source: Source, body: string, now: string, fetcher?: Fetcher, token?: string): Promise<RawItem[]> {
  if (source.kind === 'rss') { const feed = await parser.parseString(body); return feed.items.map(item => ({ title: item.title || '', url: item.link || '', date: item.isoDate || item.pubDate || '', content: item.content || item.contentSnippet || item.summary || '' })); }
  if (source.kind === 'commits') {
    const commits: unknown = JSON.parse(body); if (!Array.isArray(commits)) throw new Error('Invalid GitHub commits response');
    return commits.map(item => ({ title: `${source.url.split('/')[5]} · Developer activity: ${(item.commit?.message || '').split('\n')[0]}`, url: item.html_url || '', date: item.commit?.committer?.date || '', content: item.commit?.message || '' }));
  }
  if (source.kind === 'github') {
    const releases: unknown = JSON.parse(body); if (!Array.isArray(releases)) throw new Error('Invalid GitHub releases response');
    return releases.filter(item => !item.draft).map(item => ({ title: `${source.url.split('/')[5]} · ${item.name || item.tag_name}`, url: item.html_url || '', date: item.published_at || '', content: item.body || '' }));
  }
  const $ = load(body); const links = [...new Set($(source.selector || 'article a').toArray().map(a => $(a).attr('href')).filter((v): v is string => Boolean(v)).map(link => new URL(link, source.url).toString()))].filter(url => new URL(url).hostname === new URL(source.url).hostname).slice(0, 45);
  const items: RawItem[] = []; let failed = 0;
  for (let start = 0; start < links.length; start += 4) {
    await Promise.all(links.slice(start, start + 4).map(async url => {
      try { const response = await getResponse(url, { fetcher, token }); const html = await response.text(); const page = load(html); const date = dateFromHtml(html, now); if (!date) return;
        const title = page('h1').first().text() || page('meta[property="og:title"]').attr('content') || ''; page('script,style,nav,footer').remove();
        const content = page('article').text() || page('main').text() || page('meta[name="description"]').attr('content') || '';
        items.push({ title, url, date, content }); } catch { failed++; }
    }));
  }
  if (failed && !items.length) throw new Error('All article requests failed');
  return items;
}
export async function collectSource(source: Source, previous: SourceStatus | undefined, now: string, fetcher?: Fetcher, token?: string): Promise<{ items: RawItem[]; status: SourceStatus }> {
  const base: SourceStatus = previous || { id: source.id, state: 'pending', checkedAt: null, lastSuccessAt: null, error: null, itemCount: 0 };
  try {
    const conditional: Record<string, string> = {}; if (base.etag) conditional['If-None-Match'] = base.etag; if (base.lastModified) conditional['If-Modified-Since'] = base.lastModified;
    const response = await getResponse(source.url, { fetcher, token, headers: conditional });
    const items = response.status === 304 ? [] : await parseSource(source, await response.text(), now, fetcher, token);
    return { items, status: { ...base, state: 'healthy', checkedAt: now, lastSuccessAt: now, error: null, itemCount: response.status === 304 ? base.itemCount : items.length,
      etag: response.headers.get('etag') || base.etag, lastModified: response.headers.get('last-modified') || base.lastModified } };
  } catch (error) { return { items: [], status: { ...base, state: 'failed', checkedAt: now, error: error instanceof Error ? error.message : 'Unknown source error' } }; }
}
