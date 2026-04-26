# 02 — Game Types

**Status: ✅ DONE**

## Goal

Define all TypeScript data structures for the game.
No logic — only types, interfaces, and constants.

## Files to Create

`src/game/types.ts`

```typescript
type Element = 'fire' | 'water' | 'nature' | 'lightning'
type ManaToken = Element

interface Spell {
  id: string
  name: string
  element: Element
  damage: number
  manaCost: ManaToken[]
}

interface Player {
  hp: number
  maxHp: number
  manaPool: ManaToken[]
  maxMana: number
  spells: Spell[]
  level: number
}

interface Monster {
  hp: number
  maxHp: number
  spells: Spell[]
  threshold: number
  actionPoints: number
  resistances: Element[]
  weaknesses: Element[]
}

type TurnPhase =
  | 'GAIN_MANA'
  | 'PLAYER_ACTION'
  | 'MONSTER_ACTION'
  | 'CHECK_END'

interface GameState {
  player: Player
  monster: Monster
  phase: TurnPhase
  turn: number
  log: string[]
}
```

`src/game/constants.ts` — fixed POC data (player spells, monster definition)

## Tests

Vitest: verifies that POC constants are correctly typed and have the right values
(4 spells, monster threshold=3, fire resistance, water weakness).
