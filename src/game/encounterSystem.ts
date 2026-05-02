export type EncounterId = "monster" | "chest";
export type EncounterResult = EncounterId | "empty";

export interface EncounterTypeConfig {
  id: EncounterId;
  baseChance: number;
  chanceIncrement: number;
  maxChance?: number;
}

export interface EncounterState {
  configs: EncounterTypeConfig[];
  currentChances: Record<EncounterId, number>;
}

export function initEncounterState(
  configs: EncounterTypeConfig[],
): EncounterState {
  const currentChances = {} as Record<EncounterId, number>;
  for (const c of configs) {
    currentChances[c.id] = c.baseChance;
  }
  return { configs, currentChances };
}

/**
 * Roll encounter on room entry.
 * Configs are tried highest-chance first — first roll success wins.
 * Empty room → increment all encounter chances.
 * Encounter triggered → state unchanged (call onEncounterFinished after it resolves).
 */
export function enterRoom(state: EncounterState): {
  encounter: EncounterResult;
  nextState: EncounterState;
} {
  const sorted = [...state.configs].sort(
    (a, b) => state.currentChances[b.id] - state.currentChances[a.id],
  );
  let triggered: EncounterId | null = null;
  for (const config of sorted) {
    if (Math.random() < state.currentChances[config.id]) {
      triggered = config.id;
      break;
    }
  }

  if (triggered === null) {
    const nextChances = {} as Record<EncounterId, number>;
    for (const config of state.configs) {
      const max = config.maxChance ?? 1.0;
      nextChances[config.id] = Math.min(
        state.currentChances[config.id] + config.chanceIncrement,
        max,
      );
    }
    return {
      encounter: "empty",
      nextState: { ...state, currentChances: nextChances },
    };
  }

  return { encounter: triggered, nextState: state };
}

/**
 * Call when a non-empty encounter finishes (victory or game over).
 * Resets that encounter's chance to base; all others unchanged.
 */
export function onEncounterFinished(
  encounterId: EncounterId,
  state: EncounterState,
): EncounterState {
  const config = state.configs.find((c) => c.id === encounterId);
  if (!config) return state;
  return {
    ...state,
    currentChances: {
      ...state.currentChances,
      [encounterId]: config.baseChance,
    },
  };
}
