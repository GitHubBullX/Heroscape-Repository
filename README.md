# Project Valhalla

A phone-friendly tactical hex game inspired by the physical presence and army-commanding scale of Heroscape. Build a 500-point army, command heroes and squads, and fight computer-controlled forces across three campaign missions and one skirmish battlefield.

## Run locally

Install Node.js 22 or newer, then run:

```sh
npm run dev
```

Open `http://127.0.0.1:4173`. The project has no runtime dependencies and is authored directly in `dist/`.

## Validate

```sh
npm run check
npm test
npm run build
```

GitHub Actions runs the same checks for branches and pull requests. It does not deploy or alter the existing ChatGPT Site.

## ElevenLabs voices

The included Adam recording plays once as the opening battle briefing. Missing character cues fall back to browser speech synthesis, so gameplay never depends on an external voice service.

To generate separate ElevenLabs clips:

1. Copy `voices.config.example.json` to `voices.config.json`.
2. Add the desired ElevenLabs voice IDs.
3. Set `ELEVENLABS_API_KEY` in the terminal environment.
4. Run `npm run voices:generate`.
5. Review and commit the generated `dist/voices/` clips and manifest.

The API key is never used by browser code or committed to Git. ElevenLabs specifically warns against exposing API keys in client-side applications.

## Layout

- `dist/game.js`: rules, AI, interaction, rendering, and audio playback.
- `dist/index.html` and CSS files: interface and responsive styling.
- `dist/models/`, `dist/terrain/`, `dist/structures/`: painted game artwork.
- `dist/voices/`: local voice assets and their runtime manifest.
- `scripts/`: local server, release validation, and optional voice generation.
- `tests/`: regression tests against the actual game bundle.
- `ITERATION_WORKFLOW.md`: protected-release and visual QA checklist.

The live v9 tag remains the protected baseline. Develop on a branch, require passing checks and physical-phone review, and merge only after the candidate is clearly better.

