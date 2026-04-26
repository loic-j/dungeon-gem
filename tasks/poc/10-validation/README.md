# 10 — Validation finale

**Status : ✅ DONE**

## Objectif

Vérifier tous les critères de validation du POC définis dans `brainstorming/poc.md`.
Tests Playwright complets + vérification manuelle mobile.

## Critères à valider

| Critère | Type de test |
|---------|-------------|
| Mana se génère et s'accumule correctement | Playwright |
| Sorts se désactivent si mana insuffisant | Playwright |
| Calcul dégâts correct (résistance feu, faiblesse eau) | Playwright |
| Barre de tension monstre monte chaque tour | Playwright |
| Monstre attaque de façon probabiliste | Playwright (mock random) |
| Enchaînement combat → nouveau combat | Playwright |
| Game Over déclenché correctement | Playwright |
| Interface lisible sur mobile (format vertical) | Playwright (`viewport`) |

## Tests Playwright

`tests/validation.spec.ts`

### Mana accumulation
- Skippper 3 tours → pool contient 3 mana (ou moins si remplacement subi)

### Calcul dégâts
- Lancer sort Feu → HP monstre = 10 - ceil(5×0.8) = 10 - 4 = 6
- Lancer sort Eau → HP monstre = 10 - ceil(5×1.2) = 10 - 6 = 4

### Tension bar
- Skip 1 tour → barre plus haute qu'au début
- Skip 2 tours → barre plus haute encore

### Game Over
- Simuler joueur à 3 HP (via mock state), monstre attaque → Game Over affiché

### Enchaînement
- Tuer monstre → vérifier HP monstre reset à 10/10

### Mobile
```typescript
test.use({ viewport: { width: 480, height: 854 } })
// Vérifier : tous boutons visibles, pas de scroll nécessaire
```

## Vérification manuelle (checklist)

- [ ] Ouvrir sur mobile (ou DevTools mobile 480×854)
- [ ] Jouer 5 combats complets sans bug
- [ ] Vérifier que la barre de tension crée bien un effet de suspense
- [ ] Vérifier que le Game Over s'affiche et que "Rejouer" fonctionne
- [ ] Pas d'erreur console pendant toute la session
