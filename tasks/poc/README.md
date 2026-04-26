# POC — Task List

Incremental implementation of the proof of concept.
Full scope: @brainstorming/poc.md

## Testing Strategy

| Tool | Usage |
|-------|-------|
| **Vitest** | Unit tests for game logic (pure TypeScript, zero DOM) |
| **Playwright** | E2E tests on the HTML UI (clicks, displayed state, game over) |

The Three.js canvas is not automatically tested — manual verification in the browser.
Vitest and Playwright tests are runnable at any time:
```bash
pnpm test             # Vitest (unit)
pnpm test:e2e         # Playwright (E2E)
```

---

## Tasks

| # | Task | Status | Tests |
|---|-------|--------|-------|
| 01 | [Project Setup](01-project-setup/README.md) | ✅ DONE | — |
| 02 | [Game Types](02-game-types/README.md) | ✅ DONE | Vitest |
| 03 | [Mana System](03-mana-system/README.md) | ✅ DONE | Vitest |
| 04 | [Combat Logic](04-combat-logic/README.md) | ✅ DONE | Vitest |
| 05 | [Turn Machine](05-turn-machine/README.md) | ✅ DONE | Vitest |
| 06 | [Monster AI](06-monster-ai/README.md) | ✅ DONE | Vitest |
| 07 | [Three.js Scene](07-threejs-scene/README.md) | ✅ DONE | Manual |
| 08 | [HTML UI Overlay](08-html-ui/README.md) | ✅ DONE | Playwright |
| 09 | [Game Integration](09-game-integration/README.md) | ✅ DONE | Playwright |
| 10 | [Final Validation](10-validation/README.md) | ✅ DONE | Playwright |

## Status Legend
- ⬜ TODO
- 🔄 IN PROGRESS
- ✅ DONE
- ❌ BLOCKED
