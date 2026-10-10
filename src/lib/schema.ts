import { z } from 'zod';
export const categories = ['Model', 'Feature', 'API', 'Pricing', 'Promo', 'Research', 'Developer'] as const;
const timestamp = z.iso.datetime();
const safeUrl = z.url().refine(value => new URL(value).protocol === 'https:', 'HTTPS required');
export const updateSchema = z.object({
  id: z.string(), lab: z.string(), title: z.string(), summary: z.string(), benefit: z.string(),
  url: safeUrl, publishedAt: timestamp, updatedAt: timestamp, firstSeenAt: timestamp,
  category: z.enum(categories), score: z.number().min(0).max(100), important: z.boolean(),
  verification: z.enum(['official', 'community']), sourceIds: z.array(z.string()),
  contentHash: z.string(), summaryMethod: z.enum(['rules', 'llm']), originalExcerpt: z.string(),
  history: z.array(z.object({ at: timestamp, hash: z.string(), title: z.string(), excerpt: z.string() }))
});
export const sourceStatusSchema = z.object({
  id: z.string(), state: z.enum(['healthy', 'failed', 'pending']), checkedAt: timestamp.nullable(),
  lastSuccessAt: timestamp.nullable(), error: z.string().nullable(), itemCount: z.number(),
  etag: z.string().optional(), lastModified: z.string().optional()
});
export const discoverySchema = z.object({
  id: z.string(), title: z.string(), url: safeUrl, description: z.string(), benefit: z.string(), reason: z.string(),
  pricing: z.string(), signal: z.enum(['GitHub', 'Hacker News']), observedAt: timestamp,
  createdAt: timestamp.nullable(), freshness: z.enum(['new', 'trending', 'unknown']),
  stars: z.number().optional(), score: z.number(), license: z.string().nullable(), verified: z.boolean()
});
export const dealSchema = z.object({
  id: z.string(), lab: z.string(), title: z.string(), url: safeUrl, terms: z.string(),
  startsAt: timestamp.nullable(), endsAt: timestamp.nullable(), checkedAt: timestamp.nullable(),
  lastVerifiedAt: timestamp.nullable(), status: z.enum(['active', 'expired', 'unverified']),
  evidence: z.string(), error: z.string().nullable()
});
export const datasetSchema = z.object({
  version: z.literal(1), generatedAt: timestamp.nullable(), backfillDays: z.number(),
  updates: z.array(updateSchema), sources: z.array(sourceStatusSchema),
  discoveries: z.array(discoverySchema), deals: z.array(dealSchema),
  runs: z.array(z.object({ at: timestamp, succeeded: z.number(), failed: z.number(), updates: z.number() }))
});
export type Update = z.infer<typeof updateSchema>;
export type SourceStatus = z.infer<typeof sourceStatusSchema>;
export type Discovery = z.infer<typeof discoverySchema>;
export type Deal = z.infer<typeof dealSchema>;
export type Dataset = z.infer<typeof datasetSchema>;
export interface Lab { slug: string; name: string; tagline: string; domain: string; color: string; icon: string; }
export interface Source { id: string; lab: string; kind: 'rss' | 'github' | 'commits' | 'html'; url: string; official: boolean; selector?: string; }
export interface RawItem { title: string; url: string; date: string; content: string; }
