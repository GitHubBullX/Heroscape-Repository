# Project Valhalla — Controlled Iteration Workflow

## Protected baseline

- Live release: Version 9
- Commit: `8d5a3ceeb635a1681c724669c03ac63221d1790b`
- Rule: experimental graphics never replace the live build until the checklist below passes.

## Current candidate

- Branch: `visual-rework-v10`
- Visual baseline: Version 8 (`a11876c`)
- Mechanics retained from Version 9: capped tower range, capped height combat bonuses, movement animation, weapon sounds.
- Visual thesis: a readable tabletop battlefield—tight plastic hexes, grounded miniatures, visible elevation sidewalls, restrained motion, and no effects that obscure tactical information.

## Acceptance checklist

### Terrain

- Adjacent hexes appear connected at normal phone zoom.
- No black holes, floating terrain, or detached elevation layers.
- Water, grass, snow, lava, road, and stone remain distinguishable without labels.
- Elevation is readable without making the battlefield cluttered.
- Trees and structures are anchored to the terrain.

### Units and interaction

- Every living squad member is represented by one miniature.
- Miniatures remain readable against every terrain type.
- A unit can move no more than once per turn, including after deselection/reselection.
- A selected unit can attack without moving first.
- Enemy units can be inspected without changing turn state.
- Tapping an invalid empty hex or Deselect clears selection safely.

### Range and combat

- Entering a tower adds at most one space of range.
- Elevation attack and defense bonuses are capped.
- Line of sight still blocks attacks through sufficiently high terrain.
- Melee and ranged attacks both work before and after movement.

### Camera and phone use

- Dragging pans at every zoom level.
- Zooming does not strand the camera outside the board.
- Controls remain tappable without covering the active battlefield.
- The board stays understandable on a phone-sized viewport.

## Release rule

Test the candidate separately, compare screenshots with the live release, and record pass/fail results. Publish only when every gameplay item passes and the candidate is visibly clearer than Version 9. Otherwise discard the branch or revise it without affecting the live game.

## Credit-efficient model routing

- Lightweight Codex: CSS values, labels, asset swaps, and one-line fixes.
- Medium reasoning: isolated gameplay bugs with exact reproduction steps.
- Sol High: renderer architecture, enemy AI, rules, balance, and final integration review.
- Batch related requests into one candidate and deploy once after approval.
