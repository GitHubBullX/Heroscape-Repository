# Heroscape: Tactical Fantasy Board Game

A modern implementation of a tactical hex-based board game inspired by Heroscape. Build armies, customize terrain, and engage in epic squad-based battles.

## Features

- **Hex-based Grid Combat**: Strategic positioning on a modular hexagonal battlefield
- **Dynamic Terrain**: Customizable 3D terrain with elevation, obstacles, and special tiles
- **Squad-Based Gameplay**: Command diverse heroes with unique abilities and stats
- **Turn-Based Strategy**: Action point economy with special abilities and power cards
- **Multiplayer Support**: Up to 4 players in competitive or cooperative modes
- **Collectible Heroes**: 50+ unique heroes with varied roles (warriors, mages, archers, healers)
- **Campaign Mode**: Story-driven missions with progression and unlockables

## Quick Start

```bash
# Clone the repository
git clone https://github.com/GitHubBullX/Heroscape-Repository.git
cd Heroscape-Repository

# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
Heroscape-Repository/
├── docs/                      # Game design documentation
│   ├── GAME_DESIGN.md        # Core game mechanics
│   ├── RULES.md              # Complete rulebook
│   ├── HEROES.md             # Hero roster and abilities
│   └── TERRAIN.md            # Terrain types and modifiers
├── src/
│   ├── core/                 # Game engine
│   │   ├── game.ts           # Main game controller
│   │   ├── board.ts          # Hex grid system
│   │   ├── unit.ts           # Character/unit system
│   │   └── combat.ts         # Combat resolution
│   ├── ui/                   # User interface
│   │   ├── board-view.ts     # Board rendering
│   │   ├── ui-controller.ts  # UI state management
│   │   └── hud.ts            # Heads-up display
│   ├── data/                 # Game data
│   │   ├── heroes.json       # Hero definitions
│   │   ├── abilities.json    # Special abilities
│   │   └── terrain.json      # Terrain types
│   └── utils/                # Utility functions
├── tests/                    # Unit tests
├── package.json
└── tsconfig.json
```

## Game Overview

### Core Mechanics

- **Hex Grid**: 20-40 hex battlefield with elevation system (0-3 levels)
- **Action Points (AP)**: Each hero has 3-5 AP per turn for movement and actions
- **Health & Armor**: Units have HP pools and damage mitigation
- **Special Abilities**: Each hero has 2-4 unique powers
- **Team Composition**: Build squads of 3-8 heroes within a point budget

### Victory Conditions

1. **Elimination**: Reduce enemy heroes to 0 HP
2. **Objective Control**: Hold strategic positions
3. **Scenario-Based**: Campaign-specific win conditions

## Development Roadmap

- [ ] Phase 1: Core game engine (hex grid, movement, basic combat)
- [ ] Phase 2: Hero roster & abilities system
- [ ] Phase 3: UI & board visualization
- [ ] Phase 4: Multiplayer networking
- [ ] Phase 5: Campaign & progression system

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT License - See LICENSE file for details.
