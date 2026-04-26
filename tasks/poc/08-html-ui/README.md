# 08 — HTML UI Overlay

**Status : ✅ DONE**

## Objectif

Créer l'interface HTML/CSS posée par-dessus le canvas Three.js.
Affichage statique d'abord — les données seront branchées en tâche 09.

## Fichiers à créer

`src/ui/ui.ts` — fonctions de mise à jour DOM
`src/ui/ui.css` — styles overlay
`index.html` — structure HTML complète

## Éléments UI (référence wireframe : brainstorming/combat-first-screen-design.png)

**Zone ennemi (haut)**
- HP ennemi : texte `current/max`
- Level ennemi

**Zone joueur (bas)**
- HP joueur : barre + texte `current/max`  
- Level joueur
- Mana pool : cercles colorés dynamiques (1 cercle par token, couleur par élément)
  - 🔥 rouge, 💧 bleu, 🌿 vert, ⚡ jaune
- 4 boutons sorts : désactivés (`disabled`) si mana insuffisant
- Bouton Skip turn
- Barre de tension monstre (rage bar) : indicateur visuel sans valeur numérique

## Fonctions `ui.ts` à implémenter

```typescript
updatePlayerHp(current: number, max: number): void
updateMonsterHp(current: number, max: number): void
updateManaDisplay(pool: ManaToken[]): void
updateSpellButtons(spells: Spell[], pool: ManaToken[]): void
updateTensionBar(probability: number): void  // 0.0 à 1.0, pas de chiffre affiché
showGameOver(): void
hideGameOver(): void
```

## Tests Playwright

`tests/ui.spec.ts`

- Tous les éléments UI présents dans le DOM (`data-testid`)
- HP bar joueur visible
- 4 boutons sorts présents
- Bouton skip turn présent
- Barre tension présente (sans valeur numérique affichée)
