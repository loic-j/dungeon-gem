# 05 — Turn Machine

**Status : ✅ DONE**

## Objectif

Implémenter la machine à états du tour de jeu. Orchestre mana + combat + phases.

## Fichiers à créer

`src/game/turnMachine.ts`

## Flux d'un tour

```
GAIN_MANA
  → addManaToPool (joueur)
  → monster.actionPoints += 1
  → phase = PLAYER_ACTION

PLAYER_ACTION
  → joueur choisit sort ou skip
  → si sort : consumeMana + applyPlayerSpell
  → phase = MONSTER_ACTION

MONSTER_ACTION
  → roll = Math.random() < (actionPoints / threshold)
  → si roll : applyMonsterSpell + actionPoints = 0
  → phase = CHECK_END

CHECK_END
  → monstre HP ≤ 0 → VICTORY
  → joueur HP ≤ 0 → GAME_OVER
  → sinon → GAIN_MANA (tour suivant)
```

## Fonctions à implémenter

```typescript
// Crée l'état initial d'un combat
initCombat(): GameState

// Exécute la phase GAIN_MANA → retourne nouveau state
processManaPhase(state: GameState): GameState

// Exécute l'action joueur (sort ou skip) → retourne nouveau state
processPlayerAction(state: GameState, spellId: string | null): GameState

// Exécute la phase monstre → retourne nouveau state + boolean attackOccurred
processMonsterPhase(state: GameState): { state: GameState; attacked: boolean }

// Vérifie fin de combat → retourne 'VICTORY' | 'GAME_OVER' | null
checkCombatEnd(state: GameState): 'VICTORY' | 'GAME_OVER' | null

// Réinitialise le monstre pour un nouveau combat (victoire → combat suivant)
resetCombat(state: GameState): GameState
```

## Tests Vitest

`src/game/turnMachine.test.ts`

- `initCombat` : joueur 20/20 HP, 1 mana, monstre 10/10 HP, 0 AP
- `processManaPhase` : pool +1 mana, monstre AP +1
- `processPlayerAction` skip : mana inchangé, monstre HP inchangé
- `processPlayerAction` sort valide : mana consommé, monstre HP réduit
- `processMonsterPhase` : AP reset à 0 si attaque lancée
- `checkCombatEnd` : GAME_OVER si joueur HP ≤ 0
- `checkCombatEnd` : VICTORY si monstre HP ≤ 0
- `checkCombatEnd` : null si combat en cours
- `resetCombat` : monstre revient à 10/10, AP reset, mana pool reset
