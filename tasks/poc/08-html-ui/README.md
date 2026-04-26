# 08 — HTML UI Overlay

**Status: ✅ DONE**

## Goal

Create the HTML/CSS interface overlaid on the Three.js canvas.
Static display first — data will be connected in task 09.

## Files to Create

`src/ui/ui.ts` — DOM update functions
`src/ui/ui.css` — overlay styles
`index.html` — complete HTML structure

## UI Elements (reference wireframe: brainstorming/combat-first-screen-design.png)

**Enemy area (top)**
- Enemy HP: text `current/max`
- Enemy level

**Player area (bottom)**
- Player HP: bar + text `current/max`
- Player level
- Mana pool: dynamic colored circles (1 circle per token, color by element)
  - 🔥 red, 💧 blue, 🌿 green, ⚡ yellow
- 4 spell buttons: disabled (`disabled`) if insufficient mana
- Skip turn button
- Monster tension bar (rage bar): visual indicator with no numeric value

## `ui.ts` Functions to Implement

```typescript
updatePlayerHp(current: number, max: number): void
updateMonsterHp(current: number, max: number): void
updateManaDisplay(pool: ManaToken[]): void
updateSpellButtons(spells: Spell[], pool: ManaToken[]): void
updateTensionBar(probability: number): void  // 0.0 to 1.0, no number displayed
showGameOver(): void
hideGameOver(): void
```

## Playwright Tests

`tests/ui.spec.ts`

- All UI elements present in DOM (`data-testid`)
- Player HP bar visible
- 4 spell buttons present
- Skip turn button present
- Tension bar present (no numeric value displayed)
