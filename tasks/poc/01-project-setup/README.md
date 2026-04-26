# 01 — Project Setup

**Status : ✅ DONE**

## Objectif

Initialiser le projet avec toutes les dépendances et la structure de dossiers.

## Actions

- Créer le projet Vite + TypeScript (`pnpm create vite@latest`)
- Installer Three.js (`pnpm add three @types/three`)
- Installer Vitest (`pnpm add -D vitest`)
- Installer Playwright (`pnpm add -D @playwright/test`)
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
- Configurer scripts pnpm :
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
Vérification : `pnpm dev` → page blanche sans erreur console.
