# Project Valhalla v11 validation

## Automated checks

- JavaScript parses successfully.
- Every referenced interface control exists.
- Required model, terrain, structure, voice-manifest, and audio assets exist.
- The browser bundle contains no ElevenLabs or other API credential.
- Fifteen gameplay regression tests pass.
- The dependency-free production server returns the game, JavaScript, voice manifest, and MP3 with correct content types.
- `git diff --check` passes.

## Regression coverage

- Movement remains spent after deselection and reselection.
- A formation can attack before moving.
- Enemy inspection does not spend or replace the selected formation.
- Capture requires two consecutive uncontested rounds and resets when vacant or contested.
- Tower and extreme elevation grant at most one additional range.
- Authored elevation never exceeds two levels.
- Duplicate turn input and stale AI/animation callbacks cannot mutate a replacement battle.
- Zooming out returns the camera to the battlefield.

## Visual changes inspected

- Masked checker-grid contamination on the twelve original miniature assets at render time without overwriting the source artwork.
- Replaced scattered pseudo-random elevation with connected authored plateaus.
- Rendered every wall segment on its own tile.
- Added back-to-front sorting for props, structures, and units.
- Reduced squad overlap and added compact squad-count badges.
- Tightened tile seams, softened the moving light overlay, and simplified terrain contrast.
- Kept all phone commands in a stable two-row deck.

## Remaining physical acceptance

A real-phone pass should still confirm touch feel, the 30.7-second supplied Adam briefing, and complete campaign balance before this branch replaces the live v9 Site. No Site publishing is performed by repository validation.
