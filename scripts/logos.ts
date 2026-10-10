import * as icons from 'simple-icons';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { labs } from '../src/config/labs';
await mkdir('public/logos', { recursive: true });
for (const lab of labs) {
  const localNames: Record<string, string> = { 'google-deepmind': 'gemini', xai: 'grok', kimi: 'kimi', 'zai': 'zai', meta: 'meta', mistral: 'mistral', microsoft: 'microsoft', amazon: 'aws', tencent: 'tencent', bytedance: 'bytedance', ai21: 'ai21', qwen: 'qwen' };
  try { const svg = await readFile(`node_modules/@lobehub/icons-static-svg/icons/${localNames[lab.slug] || lab.slug}.svg`, 'utf8'); await writeFile(`public/logos/${lab.slug}.svg`, svg.replace(/currentColor/g, lab.color)); console.log(`${lab.slug}: local vendor vector`); continue; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  const key = `si${lab.icon.charAt(0).toUpperCase()}${lab.icon.slice(1)}`;
  const icon = (icons as Record<string, { path: string }>)[key];
  if (icon) { await writeFile(`public/logos/${lab.slug}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${lab.color}" d="${icon.path}"/></svg>`); console.log(`${lab.slug}: local vector`); continue; }
  try {
    const response = await fetch(`https://${lab.domain}/favicon.ico`, { signal: AbortSignal.timeout(12000) });
    if (!response.ok || /text\/html/.test(response.headers.get('content-type') || '')) throw new Error(`Not an icon: ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer()); if (bytes.length > 400000 || bytes.length < 20) throw new Error('Invalid icon size');
    await writeFile(`public/logos/${lab.slug}.ico`, bytes); console.log(`${lab.slug}: official favicon`);
  } catch (error) { console.warn(`${lab.slug}: ${error instanceof Error ? error.message : 'failed'}`); }
}
