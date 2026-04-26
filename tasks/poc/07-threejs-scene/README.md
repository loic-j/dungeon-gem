# 07 — Three.js Scene

**Status: ✅ DONE**

## Goal

Create the base 3D scene: camera, dungeon walls, monster sprite, player sprite.
Placeholder assets (solid colors) — no final sprites at this stage.

## Files to Create

`src/renderer/scene.ts` — Three.js scene setup
`src/renderer/sprites.ts` — billboard sprite creation
`src/renderer/dungeon.ts` — wall/floor/ceiling geometry

## What is Rendered

```
┌─────────────────────┐
│  [ceiling]          │
│  [left wall]        │  ← BoxGeometry with color texture
│         [Monster]   │  ← THREE.Sprite (billboard, placeholder)
│  [right wall]       │
│  [floor]            │
│  [player character] │  ← THREE.Sprite bottom left
└─────────────────────┘
```

## Technical Specifications

- Canvas: 9:16 ratio, `ResizeObserver` for screen adaptation
- Camera: `PerspectiveCamera`, FOV 75, positioned facing the corridor
- Monster: `THREE.Sprite` centered in corridor, red color placeholder
- Player: `THREE.Sprite` bottom left, blue color placeholder
- Renderer: `WebGLRenderer`, `antialias: true`

## Tests

No automated test — manual verification in the browser:
- Canvas visible, correct vertical ratio
- Monster sprite visible and centered
- Player sprite visible bottom left
- No WebGL console errors
