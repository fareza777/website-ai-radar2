import { readFile } from 'node:fs/promises';
import { datasetSchema } from '../src/lib/schema';
import { labs, sources, discoverySources } from '../src/config/labs';
const data = datasetSchema.parse(JSON.parse(await readFile('data/radar.json', 'utf8')));
if (labs.length < 20 || new Set(labs.map(l => l.slug)).size !== labs.length) throw new Error('Twenty distinct labs required');
if (new Set(data.updates.map(item => item.id)).size !== data.updates.length) throw new Error('Duplicate update IDs');
for (const item of data.updates) {
  if (!labs.some(l => l.slug === item.lab)) throw new Error(`Unknown lab ${item.lab}`);
  if (Date.parse(item.publishedAt) > Date.now()) throw new Error('Future publication date');
  if (!item.sourceIds.every(id => sources.some(source => source.id === id))) throw new Error('Unknown source ID');
}
for (const source of [...sources, ...discoverySources]) if (!data.sources.some(s => s.id === source.id)) throw new Error(`Missing status ${source.id}`);
console.log(JSON.stringify({ updates: data.updates.length, discoveries: data.discoveries.length, deals: data.deals.length, healthy: data.sources.filter(s => s.state === 'healthy').length, failed: data.sources.filter(s => s.state === 'failed').length, coveredLabs: new Set(data.updates.map(u => u.lab)).size, earliest: data.updates.at(-1)?.publishedAt, latest: data.updates[0]?.publishedAt }, null, 2));
