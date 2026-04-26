# Tech Stack — Elemental Dungeon Crawler

## Concept

Browser-based 2D/3D dungeon crawler, first-person view, turn-based.
Element-based combat system (fire, water, lightning, ...).
Vertical format, compatible mobile & PC.

## Technical Decisions

### Rendering Framework
**Three.js** — WebGL 3D, ideal for first-person view style Dungeon Master / Legend of Grimrock.
- Phaser 3 ruled out (designed for top-down 2D view, wrong tool for FPS view)

### Build & Language
**TypeScript + Vite**
- TypeScript: existing experience, early error detection
- Vite: fast setup, hot reload, optimized mobile build

### Initial Setup
```bash
pnpm create vite@latest dungeon-crawler -- --template vanilla-ts
pnpm add three @types/three
```

### Architecture Map
```
Map = 2D JSON array
[0,0,0,0]
[0,1,1,0]   ← 0=wall, 1=corridor
[0,1,0,0]
```
No need for Tiled — simple JSON is enough for a small project.

### Scene Rendering
| Element | Three.js Technique |
|---|---|
| Walls / floor / ceiling | `BoxGeometry` with textures |
| Enemies | `THREE.Sprite` (billboard, always facing camera) |
| UI (HP, elements, actions) | HTML/CSS overlaid on Three.js canvas |

### Game Logic
Turn-based — simple state machine:
```
PLAYER_TURN → click action → ENEMY_TURN → calculate response → PLAYER_TURN
```
No physics engine. No complex game loop. Logic 100% event-driven.

## Asset Tools

| Tool | Usage | Cost |
|---|---|---|
| Leonardo.ai | Enemy sprite + wall texture generation | Free (150 tokens/day) |
| Remove.bg | Sprite background removal | Free |
| Photopea | Asset assembly / resize (browser-based) | Free |
| Libresprite | Ruled out — not needed (no manual pixel art) | — |
| Tiled | Ruled out — simple JSON is enough | — |

## Target Resolution
- `480x854` (9:16 vertical format)
- Three.js renderer resizable via `ResizeObserver`

## Visual References
- Legend of Grimrock
- Etrian Odyssey
- Dungeon Master / Eye of the Beholder (classic style)

## To Be Defined
- Element system: combat mechanics (fire > water > lightning > ?)
- Number of elements and interactions
- Enemy types
- Progression / level structure
