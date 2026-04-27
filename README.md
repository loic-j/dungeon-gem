# Dungeon Crawler

Turn-based dungeon crawler with element-based combat. Runs in the browser, no backend.

## Stack

- [Three.js](https://threejs.org/) — 3D first-person rendering
- TypeScript (strict)
- Vite

## Gameplay

Fight monsters in an infinite loop. Each combat:

1. Gain 1 random mana per turn (fire / water / nature / lightning)
2. Cast spells matching your mana — deal typed damage against monster resistances/weaknesses
3. Monster builds action points each turn → probabilistic attack when threshold reached
4. Win → next combat. Die → game over

**Damage formula:** `base × modifier` (weakness ×1.2, resistance ×0.8, ceil)

## Architecture

```
src/
  game/       — pure game logic (no Three.js)
  renderer/   — Three.js scene, reads game state only
  ui/         — HTML/CSS overlay (HP, mana, spells)
  audio/      — sound manager
```

Game state is the single source of truth. Renderer never mutates state.

## Getting Started

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

## Commands

```bash
pnpm dev         # dev server
pnpm build       # production build
pnpm preview     # preview build
pnpm typecheck   # type check
pnpm test        # unit tests (vitest)
pnpm test:e2e    # e2e tests (playwright)
```

## Target

- Vertical 9:16 (480×854)
- Mobile + desktop
- 100% client-side
