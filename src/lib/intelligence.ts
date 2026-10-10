import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import { z } from 'zod';
import { labs } from '../config/labs';
import type { Update, Source, RawItem, Deal } from './schema';
export const hash = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 24);
export function cleanText(value: string): string { const $ = load(value); $('script,style,nav,footer').remove(); return $.text().replace(/\s+/g, ' ').trim(); }
export function canonicalUrl(value: string): string | null {
  try { const url = new URL(value); if (url.protocol !== 'https:') return null; url.hash = ''; for (const key of [...url.searchParams.keys()]) if (/^utm_|^(ref|source|fbclid|gclid)$/i.test(key)) url.searchParams.delete(key); url.searchParams.sort(); url.pathname = url.pathname.replace(/\/$/, '') || '/'; return url.toString().replace(/\/$/, ''); } catch { return null; }
}
export function normalizeDate(value: string, now: string): string | null {
  if (!value || !(/\d{4}-\d{2}-\d{2}/.test(value) || /\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}/.test(value) || /[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}/.test(value))) return null;
  const date = new Date(value); if (!Number.isFinite(date.getTime()) || date.getTime() > new Date(now).getTime() || date.getUTCFullYear() < 2000) return null; return date.toISOString();
}
export function classify(title: string, kind: Source['kind']): Update['category'] {
  if (/free credit|discount|promotion|promo|trial/i.test(title)) return 'Promo';
  if (/pricing|subscription|cost|price/i.test(title)) return 'Pricing';
  if (/research|paper|benchmark|study/i.test(title)) return 'Research';
  if (/sdk|changelog|release notes|v\d+\.\d+/i.test(title) || (kind === 'github' || kind === 'commits')) return 'Developer';
  if (/api|endpoint/i.test(title)) return 'API';
  if (/model|reasoning|llm|introducing.*(?:gpt|claude|gemini|grok|qwen)|llama|nemotron/i.test(title)) return 'Model';
  return 'Feature';
}
export function rank(title: string, category: Update['category']): number {
  const weights = { Model: 82, Feature: 64, API: 72, Pricing: 76, Promo: 75, Research: 58, Developer: 46 };
  return Math.max(0, Math.min(100, weights[category] + (/launch|introducing|new|frontier|release/i.test(title) ? 8 : 0) - (/patch|fix|bump|chore/i.test(title) ? 12 : 0)));
}
const benefits: Record<Update['category'], string> = {
  Model: 'Evaluate capabilities, licensing, and compatibility before switching models in your workflow.',
  Feature: 'Check whether this feature could simplify your workflow or everyday tasks.',
  API: 'Review API documentation and integration compatibility before changing your application.',
  Pricing: 'Compare the official pricing terms against your requirements and usage volume.',
  Promo: 'Verify eligibility, regions, quotas, and expiry dates in the official terms before claiming an offer.',
  Research: 'Study the methods and limitations to assess whether this research is relevant to your project.',
  Developer: 'Review SDK or tooling changes, including breaking changes, before updating dependencies.'
};
export function englishAnalysis(item: Pick<Update, 'lab' | 'category' | 'title'>): Pick<Update, 'summary' | 'benefit'> {
  const lab = labs.find(l => l.slug === item.lab)?.name || item.lab;
  return { summary: `${lab} published ${item.category === 'Developer' ? 'a developer update' : `a ${item.category.toLowerCase()} update`}: “${item.title}”. This rule-based overview is not an independent analysis; read the original source for details.`, benefit: benefits[item.category] };
}
export function normalizeItem(raw: RawItem, source: Source, now: string): Update | null {
  const url = canonicalUrl(raw.url); const publishedAt = normalizeDate(raw.date, now); const title = cleanText(raw.title).slice(0, 400);
  if (!url || !publishedAt || !title) return null;
  const content = cleanText(raw.content).slice(0, 12000); const category = classify(title, source.kind); const score = rank(title, category);
  return { id: hash(`${source.lab}:${url}`), lab: source.lab, title, url, publishedAt, updatedAt: now, firstSeenAt: now, category, score,
    important: score >= 78, verification: source.official ? 'official' : 'community', sourceIds: [source.id],
    ...englishAnalysis({ lab: source.lab, category, title }), originalExcerpt: content.slice(0, 1200), contentHash: hash(`${title}:${content}`), summaryMethod: 'rules', history: [] };
}
export function mergeUpdates(existing: Update[], incoming: Update[], now: string): Update[] {
  const merged = new Map(existing.map(item => [item.id, item]));
  for (const item of incoming) {
    const equivalent = [...merged.values()].find(old => old.lab === item.lab && (old.url === item.url || (old.title.toLowerCase() === item.title.toLowerCase() && Math.abs(Date.parse(old.publishedAt) - Date.parse(item.publishedAt)) < 86400000)));
    if (!equivalent) { merged.set(item.id, item); continue; }
    const changed = equivalent.contentHash !== item.contentHash;
    merged.set(equivalent.id, { ...(changed ? item : equivalent), id: equivalent.id, firstSeenAt: equivalent.firstSeenAt,
      updatedAt: changed ? now : equivalent.updatedAt, sourceIds: [...new Set([...equivalent.sourceIds, ...item.sourceIds])],
      history: changed ? [...equivalent.history, { at: equivalent.updatedAt, hash: equivalent.contentHash, title: equivalent.title, excerpt: equivalent.originalExcerpt }] : equivalent.history });
  }
  return [...merged.values()].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
export function dealState(deal: Pick<Deal, 'checkedAt' | 'startsAt' | 'endsAt' | 'evidence'>, now: string): Deal['status'] {
  const time = Date.parse(now);
  if (deal.endsAt && Date.parse(deal.endsAt) <= time) return 'expired';
  if (deal.startsAt && Date.parse(deal.startsAt) > time) return 'unverified';
  if (!deal.checkedAt || !deal.evidence || time - Date.parse(deal.checkedAt) > 86400000 || Date.parse(deal.checkedAt) > time) return 'unverified';
  return 'active';
}
const summarySchema = z.object({ summary: z.string().min(8).max(800), benefit: z.string().min(8).max(600) });
export function applySummary(item: Update, value: unknown): Update { return { ...item, ...summarySchema.parse(value), summaryMethod: 'llm' }; }
