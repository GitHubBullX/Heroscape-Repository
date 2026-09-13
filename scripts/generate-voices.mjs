import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = resolve(projectRoot, 'voices.config.json');
const outputDir = resolve(projectRoot, 'dist/voices');
const apiKey = process.env.ELEVENLABS_API_KEY;
const force = process.argv.includes('--force');

if (!apiKey) throw new Error('Set ELEVENLABS_API_KEY in your terminal before generating voices. The key is never written into the game.');

let config;
try {
  config = JSON.parse(await readFile(configPath, 'utf8'));
} catch {
  throw new Error('Copy voices.config.example.json to voices.config.json and add your ElevenLabs voice IDs.');
}

const lines = {
  Narrator: { online: 'Valhalla command online.', barricade: 'Barricade deployed.', victory: 'Victory is ours!', defeat: 'The battle is lost.' },
  'Skywatch Rangers': { ready: 'Eyes on the horizon.', attack: 'Loose arrows!' },
  'Iron Guard': { ready: 'The shield wall stands.', attack: 'Hold the line!' },
  Stormcallers: { ready: 'The storm answers.', attack: 'Thunder, strike!' },
  'Frost Wolves': { ready: 'The pack is hunting.', attack: 'Run them down!' },
  'Aegis Titan': { ready: 'Titan online.', attack: 'Brace for impact!' },
  'Valkyrie Scouts': { ready: 'Wings ready.', attack: 'From the skies!' },
  'Dawnfield Medics': { ready: 'I will keep them standing.', attack: 'Cover the wounded!' },
  'Aegis Engineer': { ready: 'Tools ready.', attack: 'Fortify this ground!' },
  'Verdant Lancer': { ready: 'Saddle and spear.', attack: 'Charge!' },
  'Castle Sentinel': { ready: 'I keep the watch.', attack: 'None shall pass!' },
  Chronomancer: { ready: 'The moment is ours.', attack: 'Your time ends now.' }
};

const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const manifest = { provider: 'ElevenLabs', modelId: config.modelId || 'eleven_multilingual_v2', lines: {} };
await mkdir(outputDir, { recursive: true });

for (const [character, cues] of Object.entries(lines)) {
  const voiceId = config.voices?.[character] || config.defaultVoiceId;
  if (!voiceId || voiceId.startsWith('REPLACE_')) throw new Error(`Add a voice ID for ${character} or set defaultVoiceId in voices.config.json.`);
  manifest.lines[character] = {};
  for (const [cue, text] of Object.entries(cues)) {
    const filename = `${slug(character)}-${cue}.mp3`;
    const destination = resolve(outputDir, filename);
    manifest.lines[character][cue] = `voices/${filename}`;
    let exists = false;
    try { await access(destination); exists = true; } catch {}
    if (exists && !force) {
      console.log(`Keeping ${filename}`);
      continue;
    }
    const endpoint = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`);
    endpoint.searchParams.set('output_format', config.outputFormat || 'mp3_44100_128');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
      body: JSON.stringify({ text, model_id: manifest.modelId, voice_settings: config.voiceSettings || undefined })
    });
    if (!response.ok) throw new Error(`ElevenLabs rejected ${character}/${cue} (${response.status}): ${await response.text()}`);
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    console.log(`Generated ${filename}`);
  }
}

await writeFile(resolve(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Voice pack ready in dist/voices/. Review the clips, then commit the MP3 files and manifest with the game.');

