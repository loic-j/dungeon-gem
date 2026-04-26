# 07 — Three.js Scene

**Status : ⬜ TODO**

## Objectif

Créer la scène 3D de base : caméra, murs du donjon, sprite monstre, sprite joueur.
Assets placeholders (couleurs unies) — pas de sprites définitifs à ce stade.

## Fichiers à créer

`src/renderer/scene.ts` — setup scène Three.js
`src/renderer/sprites.ts` — création sprites billboard
`src/renderer/dungeon.ts` — géométrie murs/sol/plafond

## Ce qui est rendu

```
┌─────────────────────┐
│  [plafond]          │
│  [mur gauche]       │  ← BoxGeometry texturée couleur
│         [Monstre]   │  ← THREE.Sprite (billboard, placeholder)
│  [mur droite]       │
│  [sol]              │
│  [personnage joueur]│  ← THREE.Sprite bas gauche
└─────────────────────┘
```

## Spécifications techniques

- Canvas : ratio 9:16, `ResizeObserver` pour adaptation écran
- Caméra : `PerspectiveCamera`, FOV 75, positionnée face au couloir
- Monstre : `THREE.Sprite` centré dans le couloir, placeholder couleur rouge
- Joueur : `THREE.Sprite` bas gauche, placeholder couleur bleue
- Renderer : `WebGLRenderer`, `antialias: true`

## Tests

Pas de test automatisé — vérification manuelle dans le navigateur :
- Canvas visible, bon ratio vertical
- Sprite monstre visible et centré
- Sprite joueur visible bas gauche
- Pas d'erreur console WebGL
