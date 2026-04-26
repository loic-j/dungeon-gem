# Tech Stack — Dungeon Crawler Élémentaire

## Concept

Dungeon crawler 2D/3D navigateur, vue première personne, tour par tour.
Système de combat basé sur les éléments (feu, eau, foudre, ...).
Format vertical, compatible mobile & PC.

## Décisions techniques

### Framework de rendu
**Three.js** — WebGL 3D, idéal pour vue première personne style Dungeon Master / Legend of Grimrock.
- Phaser 3 écarté (conçu pour vue top-down 2D, mauvais outil pour vue FPS)

### Build & langage
**TypeScript + Vite**
- TypeScript : expérience existante, détection d'erreurs tôt
- Vite : setup rapide, hot reload, build optimisé mobile

### Setup initial
```bash
pnpm create vite@latest dungeon-crawler -- --template vanilla-ts
pnpm add three @types/three
```

### Architecture map
```
Map = tableau 2D JSON
[0,0,0,0]
[0,1,1,0]   ← 0=mur, 1=couloir
[0,1,0,0]
```
Pas besoin de Tiled — JSON simple suffit pour petit projet.

### Rendu scène
| Élément | Technique Three.js |
|---|---|
| Murs / sol / plafond | `BoxGeometry` avec textures |
| Ennemis | `THREE.Sprite` (billboard, toujours face caméra) |
| UI (HP, éléments, actions) | HTML/CSS par-dessus canvas Three.js |

### Logique de jeu
Tour par tour — state machine simple :
```
PLAYER_TURN → clic action → ENEMY_TURN → calcul réponse → PLAYER_TURN
```
Pas de physics engine. Pas de game loop complexe. Logique 100% event-driven.

## Outils assets

| Outil | Usage | Coût |
|---|---|---|
| Leonardo.ai | Génération sprites ennemis + textures murs | Gratuit (150 tokens/jour) |
| Remove.bg | Suppression fond sprites | Gratuit |
| Photopea | Assemblage / resize assets (navigateur) | Gratuit |
| Libresprite | Écarté — pas nécessaire (pas de pixel art manuel) | — |
| Tiled | Écarté — JSON simple suffit | — |

## Résolution cible
- `480x854` (format 9:16 vertical)
- Three.js renderer redimensionnable via `ResizeObserver`

## Références visuelles
- Legend of Grimrock
- Etrian Odyssey
- Dungeon Master / Eye of the Beholder (style classique)

## À définir
- Système éléments : mécaniques combat (feu > eau > foudre > ?)
- Nombre d'éléments et interactions
- Types d'ennemis
- Progression / structure des niveaux
