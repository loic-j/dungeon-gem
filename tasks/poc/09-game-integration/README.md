# 09 — Game Integration

**Status: ✅ DONE**

## Goal

Connect the game logic (tasks 02-06) to the UI (task 08).
Handle click events, update the display after each action, orchestrate the combat loop.

## Files to Create/Modify

`src/main.ts` — entry point, initializes everything and manages the loop

## Responsibilities

```
main.ts
  ├── initCombat() → initial GameState
  ├── render(state) → updates UI + Three.js
  ├── onClick spell → processPlayerAction → processMonsterPhase
  │                → checkCombatEnd → render
  ├── onClick skip → processPlayerAction(null) → processMonsterPhase
  │                → checkCombatEnd → render
  └── onClick "Play Again" → resetCombat → render
```

## Complete Integrated Flow

```
1. initCombat() → state
2. render(state)        ← displays initial state
3. [player clicks spell/skip]
4. processManaPhase     ← turn start
5. processPlayerAction  ← player action
6. processMonsterPhase  ← monster roll + possible attack
7. checkCombatEnd
   → VICTORY  : resetCombat → goto 2
   → GAME_OVER: showGameOver
   → null     : goto 2
```

## Playwright Tests

`tests/integration.spec.ts`

- Click spell with available mana → monster HP reduced
- Click spell without mana → button disabled, nothing happens
- Click skip → turn advances (monster AP +1 visible via tension bar)
- Monster dies → new combat starts (monster HP reset to 10)
- Player dies → Game Over screen displayed
- Click "Play Again" on Game Over → new combat starts
