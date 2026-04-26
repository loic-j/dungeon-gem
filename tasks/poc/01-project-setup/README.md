# 01 — Project Setup

**Status: ✅ DONE**

## Goal

Initialize the project with all dependencies and folder structure.

## Actions

- Create Vite + TypeScript project (`pnpm create vite@latest`)
- Install Three.js (`pnpm add three @types/three`)
- Install Vitest (`pnpm add -D vitest`)
- Install Playwright (`pnpm add -D @playwright/test`)
- Configure `tsconfig.json` (strict mode)
- Configure `vite.config.ts` (Vitest included)
- Create src folder structure:
  ```
  src/
    game/       ← pure logic (zero Three.js)
    renderer/   ← Three.js only
    ui/         ← HTML/CSS overlay
    main.ts     ← entry point
  ```
- Configure pnpm scripts:
  ```json
  "dev": "vite",
  "build": "tsc && vite build",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:e2e": "playwright test"
  ```
- Create `index.html` with canvas + UI overlay div

## Tests

No automated tests at this stage.
Verification: `pnpm dev` → blank page with no console errors.
