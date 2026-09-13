# Integration validation — September 13, 2026

## Automated

- `node scripts/check.mjs`: JavaScript parses, referenced controls exist, 44 required static assets exist.
- `node --test`: 10 regression tests pass (capture continuity, restart cancellation for both AI teams, duplicate turn input, stale queued turns and effects, camera bounds, inspection clearing, movement retention).
- `git diff --check`: passes.

## Browser smoke checks

Tested the local static server in the Codex browser at desktop size and 390 × 844:

- Main menu, campaign builder, 500-point default army, and deployment load.
- Clicking a player formation selects it and reveals legal movement tiles. Fixed immediate SVG pointer capture that previously swallowed unit clicks.
- A legal move updates the battle record and changes the hint to remaining attacks.
- End turn runs allied and enemy actions and returns to the player in Round 2.
- All footer commands, including End turn, are visible in two rows at phone width.
- Terrain colors and tile edges are clear after removing the multicolored noise filter.
- No browser console errors observed in the tested session.

These are smoke checks, not a complete release acceptance. Physical touch, audio, all campaign victories, and the full checklist in ITERATION_WORKFLOW.md remain unverified. No ChatGPT Site release was performed.

## History preservation

The integration includes the recovered game history and the existing GitHub README commit `7aefcc2` as ancestors. `archive/main-v9`, `visual-rework-v10`, and `live-v9` retain the original bundle references. The existing GitHub `main` is preserved; integration is submitted through a pull request.
