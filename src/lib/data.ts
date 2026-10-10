import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cache } from 'react';
import { datasetSchema } from './schema';
export const getData = cache(async () => datasetSchema.parse(JSON.parse(await readFile(resolve('data/radar.json'), 'utf8'))));
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://website-ai-radar2.vercel.app';
