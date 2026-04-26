# 03 — Mana System

**Status: ✅ DONE**

## Goal

Implement the mana system logic. Pure TypeScript, zero DOM.

## Files to Create

`src/game/mana.ts`

## Functions to Implement

```typescript
// Draws a random mana type from the 4 elements
drawRandomMana(): ManaToken

// Adds 1 mana to the pool. If pool full → removes 1 random before adding
addManaToPool(pool: ManaToken[], max: number): ManaToken[]

// Checks if the pool contains the required mana to cast a spell
canCastSpell(pool: ManaToken[], cost: ManaToken[]): boolean

// Removes the mana used to cast a spell from the pool
consumeMana(pool: ManaToken[], cost: ManaToken[]): ManaToken[]

// Creates the initial pool at combat start (1 random mana)
initManaPool(): ManaToken[]
```

## Business Rules

- Pool never exceeds `maxMana`
- If pool is full when adding: remove 1 **random** existing mana before adding
- `canCastSpell`: must check each token of the cost individually (e.g. cost `[fire, fire]` requires 2 fire in the pool)
- Pool reset between combats (handled in turn machine, not here)

## Vitest Tests

`src/game/mana.test.ts`

- `addManaToPool`: non-full pool → adds normally
- `addManaToPool`: full pool → size stays equal to max
- `canCastSpell`: sufficient pool → true
- `canCastSpell`: insufficient pool → false
- `canCastSpell`: missing type → false even if quantity OK
- `consumeMana`: removes exactly the cost tokens
- `initManaPool`: returns exactly 1 mana
