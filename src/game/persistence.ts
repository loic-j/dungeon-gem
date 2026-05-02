import type { AppState } from "./appState";
import type { ManaToken, TurnPhase } from "./types";
import type { EncounterId } from "./encounterSystem";
import { findMonster } from "./data/monsters";
import { SPELL_LIBRARY } from "./data/spells";
import { ALL_DUNGEONS } from "./data/dungeons";
import type { DungeonConfig } from "./dungeon";
import { getCurrentStage } from "./dungeon";

const SAVE_KEY = "dcg_save";
const SAVE_VERSION = 1;

const DUNGEON_REGISTRY: Record<string, DungeonConfig> = Object.fromEntries(
  ALL_DUNGEONS.map((d) => [d.id, d]),
);

interface SavedState {
  version: number;
  phase: "EXPLORING" | "COMBAT" | "CHEST";
  isBoss: boolean;
  player: {
    hp: number;
    maxHp: number;
    manaPool: ManaToken[];
    maxMana: number;
    level: number;
    experience: number;
    experienceToNextLevel: number;
    spellIds: string[];
  };
  combat: {
    phase: TurnPhase;
    turn: number;
    monsterId: string;
    monsterHp: number;
    monsterActionPoints: number;
    monsterSpellLastCastTurn: Record<string, number>;
    monsterNextSpellId: string;
  };
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

  const { combat, dungeon, encounter } = state;
  const saved: SavedState = {
    version: SAVE_VERSION,
    phase: state.phase,
    isBoss: state.phase === "COMBAT" ? state.isBoss : false,
    player: {
      hp: combat.player.hp,
      maxHp: combat.player.maxHp,
      manaPool: [...combat.player.manaPool],
      maxMana: combat.player.maxMana,
      level: combat.player.level,
      experience: combat.player.experience,
      experienceToNextLevel: combat.player.experienceToNextLevel,
      spellIds: combat.player.spells.map((s) => s.id),
    },
    combat: {
      phase: combat.phase,
      turn: combat.turn,
      monsterId: combat.monster.definition.id,
      monsterHp: combat.monster.hp,
      monsterActionPoints: combat.monster.actionPoints,
      monsterSpellLastCastTurn: { ...combat.monster.spellLastCastTurn },
      monsterNextSpellId: combat.monster.nextSpell.id,
    },
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

    if (!saved.player || !saved.combat || !saved.dungeon || !saved.encounter)
      return null;

    const dungeonConfig = DUNGEON_REGISTRY[saved.dungeon.id];
    if (!dungeonConfig) return null;

    const monsterType = findMonster(saved.combat.monsterId);
    if (!monsterType) return null;

    const monsterNextSpell = monsterType.spells.find(
      (s) => s.id === saved.combat!.monsterNextSpellId,
    );
    if (!monsterNextSpell) return null;

    const spells = saved.player.spellIds
      .map((id) => SPELL_LIBRARY.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);

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

    const combat = {
      player: {
        hp: saved.player.hp,
        maxHp: saved.player.maxHp,
        manaPool: saved.player.manaPool,
        maxMana: saved.player.maxMana,
        level: saved.player.level,
        experience: saved.player.experience,
        experienceToNextLevel: saved.player.experienceToNextLevel,
        spells,
      },
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

    const base = { combat, dungeon, encounter };

    // CHEST → EXPLORING: chest is lost but dungeon position preserved
    switch (saved.phase) {
      case "EXPLORING":
      case "CHEST":
        return { ...base, phase: "EXPLORING" };
      case "COMBAT":
        return { ...base, phase: "COMBAT", isBoss: saved.isBoss ?? false };
      default:
        return null;
    }
  } catch {
    clearSave();
    return null;
  }
}
