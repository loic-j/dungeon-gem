# POC — Liste des tâches

Implémentation incrémentale du proof of concept.
Périmètre complet : @brainstorming/poc.md

## Stratégie de test

| Outil | Usage |
|-------|-------|
| **Vitest** | Tests unitaires logique de jeu (pur TypeScript, zéro DOM) |
| **Playwright** | Tests E2E sur l'UI HTML (clics, état affiché, game over) |

Le canvas Three.js n'est pas testé automatiquement — vérification manuelle dans le navigateur.
Les tests Vitest et Playwright sont exécutables à tout moment :
```bash
pnpm test             # Vitest (unit)
pnpm test:e2e         # Playwright (E2E)
```

---

## Tâches

| # | Tâche | Status | Tests |
|---|-------|--------|-------|
| 01 | [Project Setup](01-project-setup/README.md) | ⬜ TODO | — |
| 02 | [Game Types](02-game-types/README.md) | ⬜ TODO | Vitest |
| 03 | [Mana System](03-mana-system/README.md) | ⬜ TODO | Vitest |
| 04 | [Combat Logic](04-combat-logic/README.md) | ⬜ TODO | Vitest |
| 05 | [Turn Machine](05-turn-machine/README.md) | ⬜ TODO | Vitest |
| 06 | [Monster AI](06-monster-ai/README.md) | ⬜ TODO | Vitest |
| 07 | [Three.js Scene](07-threejs-scene/README.md) | ⬜ TODO | Manuel |
| 08 | [HTML UI Overlay](08-html-ui/README.md) | ⬜ TODO | Playwright |
| 09 | [Game Integration](09-game-integration/README.md) | ⬜ TODO | Playwright |
| 10 | [Validation finale](10-validation/README.md) | ⬜ TODO | Playwright |

## Légende status
- ⬜ TODO
- 🔄 IN PROGRESS
- ✅ DONE
- ❌ BLOCKED
