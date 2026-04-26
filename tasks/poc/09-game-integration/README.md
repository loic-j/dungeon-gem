# 09 — Game Integration

**Status : ⬜ TODO**

## Objectif

Brancher la logique de jeu (tâches 02-06) sur l'UI (tâche 08).
Gérer les événements clics, mettre à jour l'affichage après chaque action, orchestrer la boucle de combat.

## Fichiers à créer/modifier

`src/main.ts` — point d'entrée, initialise tout et gère la boucle

## Responsabilités

```
main.ts
  ├── initCombat() → GameState initial
  ├── render(state) → met à jour UI + Three.js
  ├── onClick sort → processPlayerAction → processMonsterPhase
  │                → checkCombatEnd → render
  ├── onClick skip → processPlayerAction(null) → processMonsterPhase
  │                → checkCombatEnd → render
  └── onClick "Rejouer" → resetCombat → render
```

## Flux complet intégré

```
1. initCombat() → state
2. render(state)        ← affiche état initial
3. [joueur clique sort/skip]
4. processManaPhase     ← début du tour
5. processPlayerAction  ← action joueur
6. processMonsterPhase  ← monstre roll + attaque éventuelle
7. checkCombatEnd
   → VICTORY  : resetCombat → goto 2
   → GAME_OVER: showGameOver
   → null     : goto 2
```

## Tests Playwright

`tests/integration.spec.ts`

- Cliquer sort avec mana disponible → HP monstre réduit
- Cliquer sort sans mana → bouton désactivé, rien ne se passe
- Cliquer skip → tour avance (monster AP +1 visible via tension bar)
- Monstre meurt → nouveau combat démarre (monstre HP reset à 10)
- Joueur meurt → écran Game Over affiché
- Cliquer "Rejouer" sur Game Over → nouveau combat démarre
