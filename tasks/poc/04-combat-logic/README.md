# 04 — Combat Logic

**Status: ✅ DONE**

## Goal

Implement damage calculation and spell application. Pure TypeScript, zero DOM.

## Files to Create

`src/game/combat.ts`

## Functions to Implement

```typescript
// Returns the element modifier (1.2 / 1.0 / 0.8)
getElementModifier(spellElement: Element, monster: Monster): number

// Calculates final damage (rounded up)
calculateDamage(baseDamage: number, modifier: number): number

// Applies a player spell → returns new GameState
applyPlayerSpell(state: GameState, spell: Spell): GameState

// Applies a monster spell → returns new GameState
applyMonsterSpell(state: GameState, spell: Spell): GameState
```

## Business Rules

- Modifiers: weakness ×1.2, neutral ×1.0, resistance ×0.8
- Rounding: `Math.ceil(baseDamage × modifier)`
- An element can be neither resistance nor weakness → ×1.0
- `applyPlayerSpell`: consumes mana + reduces monster HP
- `applyMonsterSpell`: reduces player HP
- HP cannot drop below 0

## Vitest Tests

`src/game/combat.test.ts`

- Fire vs fire resistance → `Math.ceil(5 × 0.8)` = 4
- Water vs water weakness → `Math.ceil(5 × 1.2)` = 6
- Lightning vs neutral → 5
- Nature vs neutral → 5
- Monster HP does not drop below 0
- Player HP does not drop below 0
- Mana consumed after `applyPlayerSpell`
