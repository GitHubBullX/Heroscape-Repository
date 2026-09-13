# Optional ElevenLabs voice pack

The supplied Adam recording is used as the opening battle briefing when Sound is enabled. Its 30.7-second runtime indicates that it is a combined recording rather than one short cue, so it is deliberately not replayed for individual attacks.

Individual lines that are not listed in `manifest.json` fall back to the browser's built-in speech synthesis.

To create the higher-quality local voice pack, copy `voices.config.example.json` to the ignored file `voices.config.json`, add ElevenLabs voice IDs, set `ELEVENLABS_API_KEY` in your terminal, and run `npm run voices:generate`.

The API key is used only by the generation script. It must never be placed in `dist/`, committed to Git, or sent from the browser.
