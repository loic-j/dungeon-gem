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
- **Mana** : cercles individuels typés (couleur par élément) — UI s'adapte dynamiquement à la taille du pool actuel
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
- **Level up** : sorts aléatoires proposés pour certains niveaux → joueur choisit
- **Si 4 sorts atteints** : possibilité de supprimer un sort existant pour en apprendre un nouveau

### Prérequis mana d'un sort
- Typé : requiert X mana d'un élément spécifique (ex: 2🔥) ou plusieurs éléments (ex: 1🔥, 2🌿)
- Neutre : accepte n'importe quel type de mana

### Propriétés d'un sort
| Propriété | Description |
|-----------|-------------|
| Élément | feu / eau / nature / foudre / neutre |
| Dégâts | valeur fixe (utilisée dans calcul final) |
| Effets spéciaux | optionnels (voir exemples) |

### Exemples d'effets spéciaux
- Soigne X HP au joueur
- Le prochain sort inflige +X dégâts supplémentaires
- *(autres à définir)*

### Élément principal d'un sort
- Utilisé dans le calcul des dégâts vs résistances/faiblesses ennemis

---

## Système de HP

### Valeurs de départ
- **HP départ** : 20 current / 20 max

### Sources de perte
- Dégâts subis en combat

### Sources de gain (current HP)
- **+3 HP** après chaque combat gagné
- Sorts de soin (éventuellement)

### Sources de gain (max HP)
- Récompenses niveau up

---

## Système de Monstres

### Définition
- Types de monstres **prédéfinis** (liste fixe)
- Chaque combat : monstre tiré **aléatoirement** selon niveau joueur et niveau du type de monstre

### Propriétés d'un type de monstre
| Propriété | Description |
|-----------|-------------|
| HP max | Fixe par type |
| HP départ | Fixe par type |
| Sorts | Set de 1 à 4 sorts prédéfinis |
| Threshold | Seuil de points d'action pour lancer un sort |
| Résistances | 0 à N éléments (dégâts réduits) |
| Faiblesses | 0 à N éléments (dégâts augmentés) |

### Mécanique d'action monstre (par tour)
1. Monstre gagne **+1 point d'action**
2. Calcul chance de lancer un sort : `points_action / threshold`
   - Exemple : threshold=4, points=3 → **75% de chance** de lancer un sort
3. Si sort lancé → **points d'action remis à 0**, effets appliqués
4. Si sort de dégâts → joueur perd des HP

### Implications
- Monstre inactif en début de combat (peu de points d'action)
- Tension croissante à chaque tour sans attaque
- Threshold **fixe par type** → définit le "rythme" du monstre : élevé = lent mais imprévisible, bas = agressif

---

## Progression du joueur

| Élément | Détail |
|---------|--------|
| Niveaux | Infini |
| HP départ | 20/20 |
| HP max | Améliorable via level up |
| Level up | Sorts aléatoires proposés au choix pour certains niveaux |
| Pool mana | Améliorable via récompenses |
| Stats | À définir |

---

## Boucle de jeu

```
START
  └─> Combat
        └─> [Victoire] Phase Récompense
              └─> Combat suivant
        └─> [Défaite] Game Over
```

---

## Phase Récompense & Level Up

> **TODO** : système à développer
>
> **Mécanique** : le joueur choisit parmi **3 récompenses** proposées à la fin de chaque combat.
>
> ### Idées de récompenses
>
> **Mana**
> - Augmenter la probabilité de tirer un type de mana spécifique
> - Augmenter le mana maximum
> - Démarrer les combats avec +1 mana d'un certain type
>
> **HP**
> - Augmenter les HP max
> - Soigner des HP
>
> **Sorts**
> - Apprendre un nouveau sort (parmi X proposés)
>
> **Passifs**
> - Bonus passif (à définir)
> - ...
>
> *Contenu et équilibrage restent à définir.*

---

## Mécanique de Combat

### Calcul des dégâts
```
dégâts finaux = dégâts_sort × modificateur_élément  (arrondi supérieur)

modificateur:
  faiblesse   → ×1.2
  neutre      → ×1
  résistance  → ×0.8
```

### Structure d'un tour
```
1. Gain mana joueur       (+1 aléatoire)
2. Gain point d'action monstre (+1)
3. Phase joueur           → choisit sort ou skip
4. Phase monstre          → roll (points/threshold)
                             si succès : lance sort + reset points à 0
5. Fin de tour            → applique statuts actifs (brûlure, poison...)
```

### Télégraphie monstre
- Barre visuelle type "rage" montrant la pression d'attaque
- **Valeur exacte non affichée** → tension maintenue pour le joueur

### Idées d'effets de sorts (non liés à l'élément)
- Brûlure : X dégâts/tour pendant N tours
- Poison : X dégâts/tour pendant N tours
- Étourdissement : reset points d'action monstre à 0
- Ralentissement : monstre gagne moins de points d'action
- Soin : restaure X HP au joueur
- Amplification : prochain sort inflige +X dégâts

---

## À définir

- Types d'ennemis et leurs éléments
- Stats joueur (ATK, DEF, SPD ?)
- Nombre de sorts proposés au level up
