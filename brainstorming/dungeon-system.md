# Dungeon System — Implementation Reference

## File Map

```
src/game/dungeon.ts              Types + pure state functions
src/game/data/dungeons.ts        Dungeon data (DUNGEON_1, ...)
src/game/data/monsters.ts        Monster library (includes boss monsters)
src/game/data/monsterSpells.ts   Shared spell catalog
src/renderer/dungeon.ts          3D dungeon geometry (reads DungeonGraphics)
src/renderer/scene.ts            Scene init (accepts DungeonGraphics)
src/ui/overlay.ts                UI (stage progress bar, boss mode)
src/audio/soundManager.ts        startBossMusic / stopBossMusic
src/main.ts                      AppState wiring, flow control
```

---

## Core Types

### `DungeonConfig`

Defined once per dungeon in `src/game/data/dungeons.ts`. Pure data — no runtime state.

```typescript
interface DungeonConfig {
  id: string;
  name: string;
  stages: StageConfig[];       // ordered, index 0 = first stage
  bossMonster: string;         // id matching a MonsterType in monsters.ts
  bossTitle: string;           // shown in UI during boss fight
  bossMusic?: () => void;      // called when boss fight starts
  graphics: DungeonGraphics;   // texture paths for floor/ceiling/wall
}
```

### `StageConfig`

Per-stage configuration. Encounter probabilities and available monsters can differ between stages.

```typescript
interface StageConfig {
  roomCount: number;                  // rooms before stage ends
  encounterConfigs: EncounterTypeConfig[];  // same format as encounterSystem
  availableMonsters: string[];        // monster ids for random encounters
}
```

### `DungeonProgress`

Runtime state — what stage/room the player is currently at. Lives in `AppState` in `main.ts`.

```typescript
interface DungeonProgress {
  dungeon: DungeonConfig;     // reference to the active dungeon definition
  currentStageIndex: number;  // 0-based
  roomsCleared: number;       // rooms completed in current stage
}
```

---

## Pure Functions (`src/game/dungeon.ts`)

All functions are pure — they return new state, never mutate.

| Function                         | Description                                       |
| -------------------------------- | ------------------------------------------------- |
| `createDungeonProgress(dungeon)` | Initial progress for a dungeon (stage 0, room 0)  |
| `getCurrentStage(progress)`      | Returns the active `StageConfig`                  |
| `isFinalStage(progress)`         | True when on the last stage                       |
| `isBossRoom(progress)`           | True when next room is the boss (final stage, last room) |
| `isStageComplete(progress)`      | True when `roomsCleared >= stage.roomCount`        |
| `completeRoom(progress)`         | Returns progress with `roomsCleared + 1`          |
| `advanceToNextStage(progress)`   | Returns progress at next stage, room 0            |
| `resetDungeonProgress(progress)` | Returns progress back to stage 0, room 0          |

---

## Room Flow (main.ts)

```
Player clicks Move
  └─> isBossRoom?
        YES → force boss monster, start boss music, setBossMode(true)
        NO  → enterRoom() → random encounter roll
                └─> empty   → completeRoom → onRoomCompleted
                └─> chest   → show chest UI → on resolve: completeRoom → onRoomCompleted
                └─> monster → pickMonsterFromIds(stage.availableMonsters)

onRoomCompleted
  └─> isStageComplete?
        NO  → show move button (continue exploring)
        YES → isFinalStage?
                YES → handleDungeonComplete (reset + loop)
                NO  → showStageTransition → advanceToNextStage
```

### Boss room detection

`isBossRoom` is checked **before** the encounter roll on every move. Condition:

```
isFinalStage(progress) && roomsCleared === stage.roomCount - 1
```

The boss room is always the last room of the last stage. If the player is at room index `roomCount - 1` on the final stage, the next move triggers the boss regardless of encounter roll.

---

## Monster Selection

Regular encounters: `pickMonsterFromIds(stage.availableMonsters, playerLevel)`

Boss: `findMonster(dungeon.bossMonster)` — direct lookup by id, skips the encounter roll.

Both functions live in `src/game/data/monsters.ts`.

- `MONSTER_LIBRARY` — regular monsters only (used by legacy `pickMonster`)
- `ALL_MONSTERS` (internal) — includes boss monsters; queried by `findMonster`

---

## UI Integration

### Stage Progress Bar

In `src/ui/overlay.ts`. Always visible in the bottom player panel (below XP bar).

```typescript
updateStageProgress(roomsCleared, totalRooms, stageIndex)
```

Called from `tick()` in `main.ts` on every render. Gold color (`#e8c01a`), format: `Stage X — N/M Rooms`.

### Boss Mode

```typescript
setBossMode(active: boolean, title?: string)
```

- `active=true`: shows `★ TITLE ★` label above enemy HP area, hides enemy level label
- `active=false`: restores normal enemy level display

Called when boss fight starts (move handler) and ends (victory / game over).

---

## Audio

| Function             | Trigger                                    |
| -------------------- | ------------------------------------------ |
| `startBossMusic()`   | Entering boss room; automatically stops bg music first |
| `stopBossMusic()`    | Victory over boss, game over, music toggle |
| `startBackgroundMusic()` | Restored after boss fight ends        |

Boss music is a separate looping E-minor battle theme (sawtooth/square oscillators, faster tempo than ambient).

---

## Adding a New Dungeon

1. Add monster types to `src/game/data/monsters.ts` (both regular and boss, add to `ALL_MONSTERS`)
2. Add spells to `src/game/data/monsterSpells.ts` if needed
3. Add textures to `public/sprites/`
4. Define `DungeonConfig` in `src/game/data/dungeons.ts`
5. Wire it in `main.ts` (currently hardcoded to `DUNGEON_1` — multi-dungeon selection TBD)

---

## Adding a New Stage to Dungeon 1

In `src/game/data/dungeons.ts`, add to `DUNGEON_1.stages`:

```typescript
stages: [
  {
    roomCount: 10,
    encounterConfigs: ENCOUNTER_CONFIGS,
    availableMonsters: ["skeleton"],
  },
  {
    roomCount: 8,
    encounterConfigs: [
      { id: "monster", baseChance: 0.65, chanceIncrement: 0.2 },
      { id: "chest",   baseChance: 0.15, chanceIncrement: 0.1 },
    ],
    availableMonsters: ["skeleton", "skeleton_king"],  // harder stage
  },
],
```

Stage transition (stairs) will automatically trigger between stages.
