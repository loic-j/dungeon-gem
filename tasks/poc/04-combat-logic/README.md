# 04 — Combat Logic

**Status : ⬜ TODO**

## Objectif

Implémenter le calcul des dégâts et l'application des sorts. Pur TypeScript, zéro DOM.

## Fichiers à créer

`src/game/combat.ts`

## Fonctions à implémenter

```typescript
// Retourne le modificateur d'élément (1.2 / 1.0 / 0.8)
getElementModifier(spellElement: Element, monster: Monster): number

// Calcule les dégâts finaux (arrondi supérieur)
calculateDamage(baseDamage: number, modifier: number): number

// Applique un sort joueur → retourne nouveau GameState
applyPlayerSpell(state: GameState, spell: Spell): GameState

// Applique un sort monstre → retourne nouveau GameState
applyMonsterSpell(state: GameState, spell: Spell): GameState
```

## Règles métier

- Modificateurs : faiblesse ×1.2, neutre ×1.0, résistance ×0.8
- Arrondi : `Math.ceil(baseDamage × modifier)`
- Un élément peut être ni résistance ni faiblesse → ×1.0
- `applyPlayerSpell` : consomme mana + réduit HP monstre
- `applyMonsterSpell` : réduit HP joueur
- HP ne peut pas descendre sous 0

## Tests Vitest

`src/game/combat.test.ts`

- Feu vs résistance feu → `Math.ceil(5 × 0.8)` = 4
- Eau vs faiblesse eau → `Math.ceil(5 × 1.2)` = 6
- Foudre vs neutre → 5
- Nature vs neutre → 5
- HP monstre ne descend pas sous 0
- HP joueur ne descend pas sous 0
- Mana consommé après `applyPlayerSpell`
