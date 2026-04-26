# Dungeon Crawler — CLAUDE.md

## Project

Browser-based turn-based dungeon crawler. First-person view. Element-based combat system.
See @brainstorming/game-design.md for full game design.
See @brainstorming/poc.md for current POC scope.

## Stack

- **Three.js** — 3D rendering (walls, sprites)
- **TypeScript** — strict mode
- **Vite** — build tool

## Commands

```bash
pnpm dev         # dev server (localhost:5173)
pnpm build       # production build
pnpm preview     # preview production build
pnpm typecheck   # tsc --noEmit
```

## Network access (WSL2 → other devices)

To access dev server from other devices on local network:

**1. Vite — bind all interfaces** (already set in `vite.config.ts`)
```ts
server: { host: '0.0.0.0' }
```

**2. Windows portproxy** (run in PowerShell admin, redo after reboot — WSL2 IP changes)
```powershell
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=<windows-lan-ip> connectport=5173 connectaddress=$(wsl hostname -I)
```
Use explicit Windows LAN IP (e.g. `192.168.0.139`) — `0.0.0.0` does not bind to LAN interface reliably.

**3. Windows Firewall — allow port**
```powershell
netsh advfirewall firewall add rule name="Vite Dev" dir=in action=allow protocol=TCP localport=5173
```

Verify portproxy: `netsh interface portproxy show all`

## Language

- All code, comments, variable names, UI text, and in-game content must be in **English**

## Code style

- Strict TypeScript — no `any`, no `as unknown`
- ES modules only — no CommonJS
- No comments unless the WHY is non-obvious
- Game logic and rendering must stay separated (no Three.js calls inside game logic)

## Architecture rules

- `src/game/` — pure game logic (state, combat, entities). Zero Three.js imports.
- `src/renderer/` — Three.js rendering only. Reads game state, never mutates it.
- `src/ui/` — HTML/CSS overlay (HP bar, mana, spell buttons)
- Game state is the single source of truth — renderer is a view only

## Target

- Format: vertical 9:16 (480×854)
- Mobile + desktop
- No backend — 100% client-side

## Key game concepts (quick ref)

- Turn order: gain mana → monster gains action point → player acts → monster rolls attack → apply status
- Mana: typed (fire/water/nature/lightning), 1 per turn, random, pool max starts at 3
- Monster attacks: probabilistic (`action_points / threshold`), not deterministic
- Damage: `base × modifier` (weakness ×1.2, resistance ×0.8, ceil)
