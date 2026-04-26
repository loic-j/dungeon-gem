# Game Design — Dungeon Crawler Élémentaire

## Concept général

Dungeon crawler tour par tour, vue combat fixe (pas de navigation couloir).
Boucle : Combat → Récompense → Combat → ...
Progression infinie (roguelike endless).

---

## Interface combat

> Wireframe : [combat-first-screen-design.png](combat-first-screen-design.png)

```
┌─────────────────────────────┐
│  HP / Level                 │
│               [Enemy]       │
│                             │
│  [My Character]  HP / Level │
│                  ○○○○○○←mana│
│                  [Spell 1]  │
│                  [Spell 2]  │
│                  [Spell 3]  │
│  [Skip turn]    [Spell 4]  │
└─────────────────────────────┘
```

**Joueur (bas)**
- **HP** : barre + format `current/max` (ex: `8/20`)
- **Level** : niveau actuel
- **Mana** : cercles individuels typés (couleur par élément) — UI affiche jusqu'à 6 cercles (max possible après upgrades)
- **Sorts** : 4 slots cliquables (désactivés si mana insuffisant)
- **Skip turn** : passe le tour sans action

**Ennemi (haut)**
- **HP** : affiché (joueur voit les HP ennemis)
- **Level** : affiché

---

## Système de Mana

### Types de mana
| Type | Élément |
|------|---------|
| 🔥 | Feu |
| 💧 | Eau |
| 🌿 | Nature |
| ⚡ | Foudre |

### Règles
- **Début de combat** : joueur commence avec **1 mana** tiré aléatoirement
- **Chaque tour** : gain de **1 mana** tiré aléatoirement
- Mana non utilisé **se cumule** (dans la limite du maximum)
- **Si maximum atteint** : on retire 1 mana aléatoire existant, puis on ajoute le nouveau tirage → le total ne dépasse jamais le max
- Pool **remis à zéro** entre chaque combat
- **Maximum améliorable** via niveaux et bonus

### Valeurs
| Moment | Valeur |
|--------|--------|
| Maximum départ | 3 |
| Mana début combat | 1 (aléatoire) |
| Mana gagné/tour | 1 (aléatoire) |
| Maximum évolutif | oui, via progression |

### Implications stratégiques
- Dépenser tôt = contrôle du pool, pas de remplacement subi
- Accumuler = risque de perdre un type précis au prochain tour
- Sorts coûteux nécessitent de planifier plusieurs tours d'avance
- Augmenter le maximum = moins de remplacements forcés, plus de flexibilité

---

## Système de Sorts

### Règles générales
- **Départ** : 1 sort prédéfini
- **Max actifs** : 4 sorts simultanément
- **Level up** : sorts aléatoires proposés → joueur choisit
- **Si 4 sorts atteints** : possibilité de supprimer un sort existant pour en apprendre un nouveau

### Prérequis mana d'un sort
- Typé : requiert X mana d'un élément spécifique (ex: 2🔥)
- Neutre : accepte n'importe quel type de mana

### Élément principal d'un sort
- Chaque sort a un élément principal (feu / eau / nature / foudre)
- Utilisé dans le calcul des dégâts vs résistances/faiblesses ennemis

---

## Progression du joueur

| Élément | Détail |
|---------|--------|
| Niveaux | Infini |
| Level up | Sorts aléatoires proposés au choix |
| Pool mana | Améliorable via récompenses |
| HP max | À définir (améliorable ?) |
| Stats | À définir |

---

## Boucle de jeu

```
START
  └─> Combat
        └─> [Victoire] Phase Récompense
              └─> (amélioration pool / nouveau sort / autre ?)
                    └─> Combat suivant
        └─> [Défaite] Game Over ? ou checkpoint ?
```

---

## À définir

- Mécanique combat détaillée (calcul dégâts, résistances, faiblesses)
- Types d'ennemis et leurs éléments
- Contenu phase récompense (quelles options ?)
- Game over ou système de checkpoint ?
- Stats joueur (ATK, DEF, SPD ?)
- Nombre de sorts dans le pool disponible (combien proposés au level up ?)
