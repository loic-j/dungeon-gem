export interface EncounterTypeConfig {
  id: string;
  baseChance: number;
  chanceIncrement: number;
  maxChance?: number;
}

export interface EncounterState {
  configs: EncounterTypeConfig[];
  currentChances: Record<string, number>;
}

export const ENCOUNTER_CONFIGS: EncounterTypeConfig[] = [
  {
    id: "monster",
    baseChance: 0.5,
    chanceIncrement: 0.2,
  },
];

export function initEncounterState(
  configs: EncounterTypeConfig[] = ENCOUNTER_CONFIGS,
): EncounterState {
  const currentChances: Record<string, number> = {};
  for (const c of configs) {
    currentChances[c.id] = c.baseChance;
  }
  return { configs, currentChances };
}

/**
 * Roll encounter on room entry.
 * Configs are tried in order — first roll success wins.
 * Empty room → increment all encounter chances.
 * Encounter triggered → state unchanged (call onEncounterFinished after it resolves).
 */
export function enterRoom(state: EncounterState): {
  encounter: string;
  nextState: EncounterState;
} {
  let triggered: string | null = null;
  for (const config of state.configs) {
    if (Math.random() < state.currentChances[config.id]) {
      triggered = config.id;
      break;
    }
  }

  if (triggered === null) {
    const nextChances: Record<string, number> = {};
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
  encounterId: string,
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
