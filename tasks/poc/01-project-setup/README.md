# 01 — Project Setup

**Status : ⬜ TODO**

## Objectif

Initialiser le projet avec toutes les dépendances et la structure de dossiers.

## Actions

- Créer le projet Vite + TypeScript (`npm create vite@latest`)
- Installer Three.js (`npm install three @types/three`)
- Installer Vitest (`npm install -D vitest`)
- Installer Playwright (`npm install -D @playwright/test`)
- Configurer `tsconfig.json` (strict mode)
- Configurer `vite.config.ts` (Vitest inclus)
- Créer la structure de dossiers src :
  ```
  src/
    game/       ← logique pure (zéro Three.js)
    renderer/   ← Three.js uniquement
    ui/         ← HTML/CSS overlay
    main.ts     ← point d'entrée
  ```
- Configurer scripts npm :
  ```json
  "dev": "vite",
  "build": "tsc && vite build",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:e2e": "playwright test"
  ```
- Créer `index.html` avec canvas + div UI overlay

## Tests

Aucun test automatisé à cette étape.
Vérification : `npm run dev` → page blanche sans erreur console.
