import { readFile, access } from 'node:fs/promises';
import { Script } from 'node:vm';
const root = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', root), 'utf8');
const code = await readFile(new URL('game.js', root), 'utf8');
new Script(code, { filename: 'game.js' });
const assets = new Set([...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m => m[1]));
for (let i = 0; i < 24; i++) assets.add(`models/unit-${i}.png`);
for (let i = 0; i < 8; i++) {
  assets.add(`structures/structure-${i}.png`);
  assets.add(`terrain/physical/tile-${i}.png`);
}
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
for (const [, id] of code.matchAll(/document\.querySelector\(['"]#([\w-]+)['"]\)/g)) {
  if (!ids.has(id)) throw new Error(`Missing game control #${id}`);
}
await Promise.all([...assets].map(asset => access(new URL(asset, root))));
console.log(`Validated JavaScript, game controls, and ${assets.size} assets. dist/ is the ready-to-serve static build.`);
