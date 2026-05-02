import type { AppState } from "./appState";
import type { ManaToken, TurnPhase } from "./types";
import type { EncounterId } from "./encounterSystem";
import { findMonster } from "./data/monsters";
import { SPELL_LIBRARY } from "./data/spells";
import { ALL_DUNGEONS } from "./data/dungeons";
import type { DungeonConfig } from "./dungeon";
import { getCurrentStage, advanceToNextStage } from "./dungeon";

const SAVE_KEY = "dcg_save";
const SAVE_VERSION = 2;

const DUNGEON_REGISTRY: Record<string, DungeonConfig> = Object.fromEntries(
  ALL_DUNGEONS.map((d) => [d.id, d]),
);

interface SavedPlayer {
  hp: number;
  maxHp: number;
  manaPool: ManaToken[];
  maxMana: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  spellIds: string[];
}

interface SavedCombat {
  phase: TurnPhase;
  turn: number;
  monsterId: string;
  monsterHp: number;
  monsterActionPoints: number;
  monsterSpellLastCastTurn: Record<string, number>;
  monsterNextSpellId: string;
}

interface SavedState {
  version: number;
  phase: "EXPLORING" | "COMBAT" | "CHEST" | "STAGE_TRANSITION";
  isBoss: boolean;
  player: SavedPlayer;
  combat?: SavedCombat;
  dungeon: {
    id: string;
    currentStageIndex: number;
    roomsCleared: number;
  };
  encounter: {
    currentChances: Record<EncounterId, number>;
  };
}

export function saveGame(state: AppState): void {
  if (state.phase === "GAME_OVER") return;

  const player = state.phase === "COMBAT" ? state.combat.player : state.player;
  const { dungeon, encounter } = state;

  const saved: SavedState = {
    version: SAVE_VERSION,
    phase: state.phase,
    isBoss: state.phase === "COMBAT" ? state.isBoss : false,
    player: {
      hp: player.hp,
      maxHp: player.maxHp,
      manaPool: [...player.manaPool],
      maxMana: player.maxMana,
      level: player.level,
      experience: player.experience,
      experienceToNextLevel: player.experienceToNextLevel,
      spellIds: player.spells.map((s) => s.id),
    },
    ...(state.phase === "COMBAT" && {
      combat: {
        phase: state.combat.phase,
        turn: state.combat.turn,
        monsterId: state.combat.monster.definition.id,
        monsterHp: state.combat.monster.hp,
        monsterActionPoints: state.combat.monster.actionPoints,
        monsterSpellLastCastTurn: { ...state.combat.monster.spellLastCastTurn },
        monsterNextSpellId: state.combat.monster.nextSpell.id,
      },
    }),
    dungeon: {
      id: dungeon.dungeon.id,
      currentStageIndex: dungeon.currentStageIndex,
      roomsCleared: dungeon.roomsCleared,
    },
    encounter: {
      currentChances: { ...encounter.currentChances },
    },
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
  } catch {
    // Storage quota exceeded — ignore
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function setDevState(state: unknown): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGame(): AppState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;

  try {
    const saved = JSON.parse(raw) as Partial<SavedState>;

    if (saved.version !== SAVE_VERSION) {
      clearSave();
      return null;
    }

    if (!saved.player || !saved.dungeon || !saved.encounter) return null;

    const dungeonConfig = DUNGEON_REGISTRY[saved.dungeon.id];
    if (!dungeonConfig) return null;

    const spells = saved.player.spellIds
      .map((id) => SPELL_LIBRARY.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);

    const player = {
      hp: saved.player.hp,
      maxHp: saved.player.maxHp,
      manaPool: saved.player.manaPool,
      maxMana: saved.player.maxMana,
      level: saved.player.level,
      experience: saved.player.experience,
      experienceToNextLevel: saved.player.experienceToNextLevel,
      spells,
    };

    const dungeon = {
      dungeon: dungeonConfig,
      currentStageIndex: saved.dungeon.currentStageIndex,
      roomsCleared: saved.dungeon.roomsCleared,
    };

    const stage = getCurrentStage(dungeon);
    const encounter = {
      configs: stage.encounterConfigs,
      currentChances: saved.encounter.currentChances,
    };

    // CHEST/STAGE_TRANSITION → EXPLORING: room lost but dungeon position preserved
    switch (saved.phase) {
      case "EXPLORING":
      case "CHEST":
        return { phase: "EXPLORING", player, dungeon, encounter };
      case "STAGE_TRANSITION": {
        const nextDungeon = advanceToNextStage(dungeon);
        const nextStage = getCurrentStage(nextDungeon);
        const nextEncounter = {
          configs: nextStage.encounterConfigs,
          currentChances: { ...encounter.currentChances },
        };
        return {
          phase: "EXPLORING",
          player,
          dungeon: nextDungeon,
          encounter: nextEncounter,
        };
      }
      case "COMBAT": {
        if (!saved.combat) return null;

        const monsterType = findMonster(saved.combat.monsterId);
        if (!monsterType) return null;

        const monsterNextSpell = monsterType.spells.find(
          (s) => s.id === saved.combat!.monsterNextSpellId,
        );
        if (!monsterNextSpell) return null;

        const combat = {
          player,
          monster: {
            definition: monsterType,
            hp: saved.combat.monsterHp,
            actionPoints: saved.combat.monsterActionPoints,
            spellLastCastTurn: saved.combat.monsterSpellLastCastTurn,
            nextSpell: monsterNextSpell,
          },
          phase: saved.combat.phase,
          turn: saved.combat.turn,
        };

        return {
          phase: "COMBAT",
          isBoss: saved.isBoss ?? false,
          combat,
          dungeon,
          encounter,
        };
      }
      default:
        return null;
    }
  } catch {
    clearSave();
    return null;
  }
}
