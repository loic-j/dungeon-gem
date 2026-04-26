# 05 — Turn Machine

**Status: ✅ DONE**

## Goal

Implement the turn state machine. Orchestrates mana + combat + phases.

## Files to Create

`src/game/turnMachine.ts`

## Turn Flow

```
GAIN_MANA
  → addManaToPool (player)
  → monster.actionPoints += 1
  → phase = PLAYER_ACTION

PLAYER_ACTION
  → player chooses spell or skip
  → if spell: consumeMana + applyPlayerSpell
  → phase = MONSTER_ACTION

MONSTER_ACTION
  → roll = Math.random() < (actionPoints / threshold)
  → if roll: applyMonsterSpell + actionPoints = 0
  → phase = CHECK_END

CHECK_END
  → monster HP ≤ 0 → VICTORY
  → player HP ≤ 0 → GAME_OVER
  → otherwise → GAIN_MANA (next turn)
```

## Functions to Implement

```typescript
// Creates the initial combat state
initCombat(): GameState

// Executes the GAIN_MANA phase → returns new state
processManaPhase(state: GameState): GameState

// Executes the player action (spell or skip) → returns new state
processPlayerAction(state: GameState, spellId: string | null): GameState

// Executes the monster phase → returns new state + boolean attackOccurred
processMonsterPhase(state: GameState): { state: GameState; attacked: boolean }

// Checks combat end → returns 'VICTORY' | 'GAME_OVER' | null
checkCombatEnd(state: GameState): 'VICTORY' | 'GAME_OVER' | null

// Resets the monster for a new combat (victory → next combat)
resetCombat(state: GameState): GameState
```

## Vitest Tests

`src/game/turnMachine.test.ts`

- `initCombat`: player 20/20 HP, 1 mana, monster 10/10 HP, 0 AP
- `processManaPhase`: pool +1 mana, monster AP +1
- `processPlayerAction` skip: mana unchanged, monster HP unchanged
- `processPlayerAction` valid spell: mana consumed, monster HP reduced
- `processMonsterPhase`: AP reset to 0 if attack cast
- `checkCombatEnd`: GAME_OVER if player HP ≤ 0
- `checkCombatEnd`: VICTORY if monster HP ≤ 0
- `checkCombatEnd`: null if combat ongoing
- `resetCombat`: monster returns to 10/10, AP reset, mana pool reset
