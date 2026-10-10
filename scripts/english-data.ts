import { readFile, writeFile } from 'node:fs/promises';
import { datasetSchema } from '../src/lib/schema';
import { englishAnalysis } from '../src/lib/intelligence';
import { dealCandidates } from '../src/config/labs';
const path = 'data/radar.json';
const data = datasetSchema.parse(JSON.parse(await readFile(path, 'utf8')));
data.updates = data.updates.map(item => item.summaryMethod === 'rules' ? { ...item, ...englishAnalysis(item) } : item);
const replacements = [
  ['Ditemukan melalui diskusi komunitas Hacker News.', 'Found through a Hacker News community discussion.'],
  ['Repositori publik terkait AI.', 'Public AI-related repository.'],
  ['Periksa tautan produk dan diskusi untuk memahami use case serta keterbatasan sebelum mencoba.', 'Review the product link and discussion to understand its use cases and limitations before trying it.'],
  ['Tinjau README, demo, lisensi, dan aktivitas pengembangan sebelum mengadopsi proyek.', 'Review the README, demo, license, and development activity before adopting this project.'],
  ['Sinyal komunitas:', 'Community signal:'], [' poin dan ', ' points and '], [' komentar.', ' comments.'],
  ['Tanggal ini adalah tanggal posting, bukan tanggal peluncuran produk.', 'This date is the post date, not the product launch date.'],
  ['Harga dan status gratis belum diverifikasi.', 'Pricing and free access have not been verified.'],
  ['Kode publik; harga layanan/API belum diverifikasi.', 'Public code; service and API pricing have not been verified.'],
  ['Sinyal repositori AI publik:', 'Public AI repository signal:'], ['diperbarui pada', 'updated on'], ['tanggal tidak tersedia', 'date unavailable'], ['Popularitas bukan jaminan kualitas.', 'Popularity does not guarantee quality.']
];
const translate = (value: string) => replacements.reduce((text, [from, to]) => text.replaceAll(from, to), value);
data.discoveries = data.discoveries.map(item => ({ ...item, description: translate(item.description), benefit: translate(item.benefit), reason: translate(item.reason), pricing: translate(item.pricing) }));
data.deals = data.deals.map(item => ({ ...item, terms: dealCandidates.find(c => c.id === item.id)?.terms || item.terms, error: item.error?.replace('Tidak ditemukan bukti penawaran yang cocok pada sumber resmi.', 'No matching offer evidence was found on the official source.') || null }));
await writeFile(path, `${JSON.stringify(datasetSchema.parse(data), null, 2)}\n`);
console.log(`English presentation migrated for ${data.updates.length} updates; all source facts and dates retained.`);
