import { readFile, access } from 'node:fs/promises';
import { Script } from 'node:vm';

const root = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const code = await readFile(new URL('game.js', root), 'utf8');
new Script(code, { filename: 'game.js' });
if (/xi-api-key|ELEVENLABS_API_KEY|sk_[a-z0-9]{16,}/i.test(code)) throw new Error('A credential-like value was found in the browser bundle.');

const assets = new Set([...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1]));
for (let i = 0; i < 24; i++) assets.add(`models/unit-${i}.png`);
for (let i = 0; i < 8; i++) {
  assets.add(`structures/structure-${i}.png`);
  assets.add(`terrain/physical/tile-${i}.png`);
}
try {
  const manifest = JSON.parse(await readFile(new URL('voices/manifest.json', root), 'utf8'));
  for (const cues of Object.values(manifest.lines || {})) for (const asset of Object.values(cues)) assets.add(asset.replace(/^voices\//, 'voices/'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
for (const [, id] of code.matchAll(/document\.querySelector\(['"]#([\w-]+)['"]\)/g)) {
  if (!ids.has(id)) throw new Error(`Missing game control #${id}`);
}
await Promise.all([...assets].map(asset => access(new URL(asset, root))));
console.log(`Validated JavaScript, game controls, and ${assets.size} assets. dist/ is ready to serve.`);
