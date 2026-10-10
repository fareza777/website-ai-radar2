import type { MetadataRoute } from 'next';
import { labs } from '../config/labs';
import { getData, siteUrl } from '../lib/data';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const data = await getData(); return ['', '/labs', '/discover', '/deals', ...labs.map(l => `/labs/${l.slug}`)].map(path => ({ url: `${siteUrl}${path}`, lastModified: data.generatedAt || undefined, changeFrequency: 'daily', priority: path === '' ? 1 : path === '/labs' ? 0.9 : 0.7 })); }
