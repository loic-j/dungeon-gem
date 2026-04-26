# POC — Proof of Concept

Objectif : valider les mécaniques core du jeu avec le minimum de contenu.
Pas de système de récompense, pas de progression. Combat seul.

---

## Périmètre

### Ce qui est implémenté
- Combat tour par tour complet
- Système de mana (pool, tirage aléatoire, accumulation, remplacement si plein)
- 4 sorts joueur simples
- 1 type de monstre
- Calcul dégâts avec résistances/faiblesses
- Mécanique points d'action monstre + barre de tension visuelle
- Structure d'un tour complète (gain mana → action joueur → action monstre → statuts)
- Écran Game Over si joueur meurt
- Enchaînement de combats (même monstre répété)

### Ce qui est exclu
- Système de récompenses
- Level up / progression joueur
- Effets de statut (brûlure, poison, étourdissement...)
- Sorts spéciaux / effets secondaires
- Plusieurs types de monstres
- Sprites / assets définitifs (placeholders acceptés)

---

## Sorts du joueur (4 sorts fixes)

| Sort | Élément | Coût mana | Dégâts |
|------|---------|-----------|--------|
| Flamme | 🔥 Feu | 1🔥 | 5 |
| Vague | 💧 Eau | 1💧 | 5 |
| Éclair | ⚡ Foudre | 1⚡ | 5 |
| Racines | 🌿 Nature | 1🌿 | 5 |

---

## Monstre (type unique)

| Propriété | Valeur |
|-----------|--------|
| HP max | 10 |
| HP départ | 10 |
| Sort | Attaque basique — 3 dégâts |
| Threshold | 3 |
| Résistance | 🔥 Feu (×0.8) |
| Faiblesse | 💧 Eau (×1.2) |

---

## Déroulement d'un combat POC

```
Début combat
  → Joueur : 1 mana aléatoire, 20/20 HP
  → Monstre : 10/10 HP, 0 points d'action

Chaque tour :
  1. Joueur gagne 1 mana (aléatoire)
  2. Monstre gagne 1 point d'action
  3. Joueur choisit un sort (si mana dispo) ou skip
  4. Monstre roll : points/3 → chance d'attaquer (barre visuelle)
     si attaque → joueur perd 3 HP, points reset à 0
  5. (pas de statuts dans le POC)

Fin combat :
  → Monstre HP ≤ 0 : victoire → nouveau combat (même monstre)
  → Joueur HP ≤ 0 : Game Over
```

---

## Critères de validation du POC

- [ ] Mana se génère et s'accumule correctement
- [ ] Sorts se désactivent si mana insuffisant
- [ ] Calcul dégâts correct (résistance feu, faiblesse eau)
- [ ] Barre de tension monstre monte visuellement chaque tour
- [ ] Monstre attaque de façon probabiliste (pas systématique)
- [ ] Enchaînement combat → nouveau combat fonctionne
- [ ] Game Over déclenché correctement
- [ ] Interface lisible sur mobile (format vertical)
