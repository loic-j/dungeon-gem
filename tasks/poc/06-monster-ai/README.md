# 06 — Monster AI

**Status : ⬜ TODO**

## Objectif

Implémenter le système de décision du monstre et exposer la probabilité d'attaque pour l'UI.

## Fichiers à créer

`src/game/monsterAI.ts`

## Fonctions à implémenter

```typescript
// Retourne la probabilité d'attaque actuelle (0.0 à 1.0)
getAttackProbability(monster: Monster): number

// Détermine si le monstre attaque ce tour (roll aléatoire)
rollMonsterAttack(monster: Monster): boolean

// Choisit quel sort le monstre lance (aléatoire parmi son set)
chooseMonsterSpell(monster: Monster): Spell
```

## Règles métier

- Probabilité : `actionPoints / threshold` (entre 0 et 1)
- Si `actionPoints >= threshold` → probabilité peut dépasser 1.0, mais le roll reste `Math.random() < proba` (donc quasi certain)
- Sort choisi aléatoirement parmi les sorts du monstre

## Note sur la testabilité

`rollMonsterAttack` utilise `Math.random()` → injection de seed ou mock nécessaire pour tests déterministes.
Vitest supporte `vi.spyOn(Math, 'random')` pour contrôler le résultat.

## Tests Vitest

`src/game/monsterAI.test.ts`

- `getAttackProbability` : AP=0, threshold=3 → 0
- `getAttackProbability` : AP=1, threshold=3 → 0.333...
- `getAttackProbability` : AP=3, threshold=3 → 1.0
- `rollMonsterAttack` : Math.random mocké à 0.1, AP=1, threshold=3 → false (0.1 > 0.333)
- `rollMonsterAttack` : Math.random mocké à 0.1, AP=3, threshold=3 → true (0.1 < 1.0)
- `chooseMonsterSpell` : retourne un sort du set du monstre
