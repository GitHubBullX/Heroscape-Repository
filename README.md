# Project Valhalla

A browser-based tactical hex game inspired by Heroscape. Build a 500-point army, command heroes and squads, and fight computer-controlled enemies across three campaign missions and one skirmish map. The battlefield uses SVG and painted miniature images; this is a single-player prototype.

## Run locally

Install Node.js 22 or newer, then run:

```sh
git clone https://github.com/GitHubBullX/Heroscape-Repository.git
cd Heroscape-Repository
# Until the import PR is merged:
git switch codex/connect-and-stabilize
node scripts/serve.mjs
```

Open http://127.0.0.1:4173. No dependency installation is needed. `npm run dev` is equivalent if npm is installed. Set `PORT` to choose a different local port.

## Validate

```sh
node scripts/check.mjs
node --test
```

With npm, use `npm run check`, `npm test`, and `npm run build`. The game is authored directly in `dist/`; build validates the static release files instead of generating a second copy. GitHub Actions runs validation and regression tests on pushes and pull requests. It does not deploy the game.

## Source layout

- `dist/game.js`: game rules, AI, UI, SVG rendering, and audio.
- `dist/index.html` and CSS files: interface and styling.
- `dist/models/`, `dist/terrain/`, `dist/structures/`: game artwork.
- `tests/`: regression tests against the actual game code with a controlled clock and DOM stub.
- `scripts/`: local server and release-file checks.
- `.openai/hosting.json`: existing ChatGPT Site association.
- `ITERATION_WORKFLOW.md`: gameplay and visual release checklist.

## Recovered history and integration

The source was recovered from `Project-Valhalla-Complete/PROJECT_HISTORY.bundle` on September 13, 2026. The pre-existing GitHub README commit is retained as an ancestor of the integration branch.

- `archive/main-v9`: original bundle `main`, `8d5a3ce`.
- `visual-rework-v10`: original candidate branch, `118bb2c`.
- `live-v9`: original tag, preserved exactly.
- `codex/connect-and-stabilize`: recovered source, GitHub history, development commands, CI, and stability fixes.

The integration fixes interrupted objective capture, AI work continuing after mission replacement, duplicate turn starts, stale animation callbacks, zoom-out camera bounds, inspection clearing, and pointer capture swallowing unit clicks. Phone controls now remain visible in two rows and terrain is easier to distinguish. See `VALIDATION.md` for automated and browser checks; full release acceptance remains separate.

The existing hosted game is at https://project-valhalla-tactics.mmcwhirter25.chatgpt.site. Pushing to GitHub does not update that Site. Preserve the Site association and follow `ITERATION_WORKFLOW.md` before a separate release.
