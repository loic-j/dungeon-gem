# 06 — Monster AI

**Status: ✅ DONE**

## Goal

Implement the monster decision system and expose attack probability for the UI.

## Files to Create

`src/game/monsterAI.ts`

## Functions to Implement

```typescript
// Returns the current attack probability (0.0 to 1.0)
getAttackProbability(monster: Monster): number

// Determines if the monster attacks this turn (random roll)
rollMonsterAttack(monster: Monster): boolean

// Chooses which spell the monster casts (random from its set)
chooseMonsterSpell(monster: Monster): Spell
```

## Business Rules

- Probability: `actionPoints / threshold` (between 0 and 1)
- If `actionPoints >= threshold` → probability can exceed 1.0, but the roll remains `Math.random() < proba` (thus near certain)
- Spell chosen randomly from the monster's spells

## Testability Note

`rollMonsterAttack` uses `Math.random()` → seed injection or mock needed for deterministic tests.
Vitest supports `vi.spyOn(Math, 'random')` to control the result.

## Vitest Tests

`src/game/monsterAI.test.ts`

- `getAttackProbability`: AP=0, threshold=3 → 0
- `getAttackProbability`: AP=1, threshold=3 → 0.333...
- `getAttackProbability`: AP=3, threshold=3 → 1.0
- `rollMonsterAttack`: Math.random mocked at 0.1, AP=1, threshold=3 → false (0.1 > 0.333)
- `rollMonsterAttack`: Math.random mocked at 0.1, AP=3, threshold=3 → true (0.1 < 1.0)
- `chooseMonsterSpell`: returns a spell from the monster's set
