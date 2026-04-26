# 03 — Mana System

**Status : ⬜ TODO**

## Objectif

Implémenter la logique du système de mana. Pur TypeScript, zéro DOM.

## Fichiers à créer

`src/game/mana.ts`

## Fonctions à implémenter

```typescript
// Tire un type de mana aléatoire parmi les 4 éléments
drawRandomMana(): ManaToken

// Ajoute 1 mana au pool. Si pool plein → retire 1 aléatoire avant d'ajouter
addManaToPool(pool: ManaToken[], max: number): ManaToken[]

// Vérifie si le pool contient les mana requis pour un sort
canCastSpell(pool: ManaToken[], cost: ManaToken[]): boolean

// Retire les mana utilisés pour un sort du pool
consumeMana(pool: ManaToken[], cost: ManaToken[]): ManaToken[]

// Crée le pool initial en début de combat (1 mana aléatoire)
initManaPool(): ManaToken[]
```

## Règles métier à respecter

- Pool ne dépasse jamais `maxMana`
- Si pool plein au moment d'ajouter : retirer 1 mana **aléatoire** existant avant ajout
- `canCastSpell` : doit vérifier chaque token du coût individuellement (ex: coût `[fire, fire]` nécessite 2 fire dans le pool)
- Pool remis à zéro entre combats (géré dans turn machine, pas ici)

## Tests Vitest

`src/game/mana.test.ts`

- `addManaToPool` : pool non plein → ajoute normalement
- `addManaToPool` : pool plein → taille reste égale au max
- `canCastSpell` : pool suffisant → true
- `canCastSpell` : pool insuffisant → false
- `canCastSpell` : type manquant → false même si quantité OK
- `consumeMana` : retire exactement les tokens du coût
- `initManaPool` : retourne exactement 1 mana
