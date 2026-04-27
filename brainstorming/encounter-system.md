# Encounter System

## Concept

Each room the player enters rolls against a set of encounter types. Each type has a chance that starts at a base value and escalates after empty rooms — guaranteeing encounters never feel infinitely avoidable.

---

## Mechanics

### Per room entry

1. Each encounter type is tried **in config order** — first success triggers.
2. If none succeed → **empty room**: every encounter type's chance increases by its `chanceIncrement`.
3. If one triggers → encounter starts; **state unchanged** until it resolves.

### After encounter resolves (victory or game over)

- The triggered encounter's chance **resets to `baseChance`**.
- All other encounter types **keep their current (possibly elevated) chances**.

---

## Current Encounter Types

| ID        | Base chance | Increment per empty room | Max  |
| --------- | ----------- | ------------------------ | ---- |
| `monster` | 50%         | +20%                     | 100% |

---

## Configuration

Edit `ENCOUNTER_CONFIGS` in [src/game/encounterSystem.ts](../src/game/encounterSystem.ts):

```typescript
export const ENCOUNTER_CONFIGS: EncounterTypeConfig[] = [
  {
    id: "monster",
    baseChance: 0.5,
    chanceIncrement: 0.2,
    // maxChance: 1.0  ← optional, defaults to 1.0
  },
  // Add more encounter types here — they are tried in array order
];
```

### Adding a new encounter type

1. Add an entry to `ENCOUNTER_CONFIGS` with a unique `id`.
2. In `main.ts`, handle the new `encounter` id in the `enterRoom` result switch.
3. Call `onEncounterFinished(id, encounterState)` when that encounter resolves.

---

## API (`src/game/encounterSystem.ts`)

```typescript
// Initialize encounter state (uses ENCOUNTER_CONFIGS by default)
initEncounterState(configs?) → EncounterState

// Roll on room entry — returns encounter id ("empty" if none triggered)
// Mutates chances: empty → increments all; encounter → state unchanged
enterRoom(state) → { encounter: string; nextState: EncounterState }

// Call after a non-empty encounter ends — resets that type to baseChance
onEncounterFinished(encounterId, state) → EncounterState
```

---

## Example sequence

| Room | Monster chance | Roll result | After         |
| ---- | -------------- | ----------- | ------------- |
| 1    | 50%            | Empty       | Monster → 70% |
| 2    | 70%            | Empty       | Monster → 90% |
| 3    | 90%            | **Monster** | (combat)      |
| —    | —              | Victory     | Monster → 50% |
| 4    | 50%            | Empty       | Monster → 70% |
