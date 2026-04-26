# 02 — Game Types

**Status : ✅ DONE**

## Objectif

Définir toutes les structures de données TypeScript du jeu.
Aucune logique — uniquement types, interfaces et constantes.

## Fichiers à créer

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

`src/game/constants.ts` — données fixes du POC (sorts joueur, définition monstre)

## Tests

Vitest : vérifie que les constantes du POC sont correctement typées et ont les bonnes valeurs
(4 sorts, monstre threshold=3, résistance feu, faiblesse eau).
