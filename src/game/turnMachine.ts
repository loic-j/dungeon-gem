import type { GameState } from "./types";
import {
  PLAYER_START_HP,
  PLAYER_START_MAX_MANA,
  PLAYER_START_LEVEL,
  PLAYER_START_EXPERIENCE,
  xpToNextLevel,
} from "./constants";
import { SPELL_LIBRARY } from "./data/spells";
import { pickMonster, spawnMonster } from "./data/monsters";
import { addManaToPool, initManaPool } from "./mana";
import { applyPlayerSpell, applyMonsterSpell } from "./combat";
import { rollMonsterAttack, chooseMonsterSpell } from "./monsterAI";

export function initCombat(): GameState {
  return {
    player: {
      hp: PLAYER_START_HP,
      maxHp: PLAYER_START_HP,
      manaPool: initManaPool(),
      maxMana: PLAYER_START_MAX_MANA,
      spells: SPELL_LIBRARY,
      level: PLAYER_START_LEVEL,
      experience: PLAYER_START_EXPERIENCE,
      experienceToNextLevel: xpToNextLevel(PLAYER_START_LEVEL),
    },
    monster: spawnMonster(pickMonster(PLAYER_START_LEVEL)),
    phase: "PLAYER_ACTION",
    turn: 1,
    log: [],
  };
}

export function processManaPhase(state: GameState): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      manaPool: addManaToPool(state.player.manaPool, state.player.maxMana),
    },
    monster: {
      ...state.monster,
      actionPoints: state.monster.actionPoints + 1,
    },
    phase: "PLAYER_ACTION",
  };
}

export function processPlayerAction(
  state: GameState,
  spellId: string | null,
): GameState {
  if (spellId === null) {
    return { ...state, phase: "MONSTER_ACTION" };
  }
  const spell = state.player.spells.find((s) => s.id === spellId);
  if (!spell) return { ...state, phase: "MONSTER_ACTION" };
  return { ...applyPlayerSpell(state, spell), phase: "MONSTER_ACTION" };
}

export function processMonsterPhase(state: GameState): {
  state: GameState;
  attacked: boolean;
} {
  if (!rollMonsterAttack(state.monster)) {
    return { state: { ...state, phase: "CHECK_END" }, attacked: false };
  }
  const spell = chooseMonsterSpell(state.monster, state.turn);
  const next = applyMonsterSpell(state, spell);
  return {
    state: {
      ...next,
      monster: {
        ...next.monster,
        actionPoints: -1,
        spellLastCastTurn: {
          ...next.monster.spellLastCastTurn,
          [spell.id]: state.turn,
        },
      },
      phase: "CHECK_END",
    },
    attacked: true,
  };
}

export function checkCombatEnd(
  state: GameState,
): "VICTORY" | "GAME_OVER" | null {
  if (state.monster.hp <= 0) return "VICTORY";
  if (state.player.hp <= 0) return "GAME_OVER";
  return null;
}

export function resetCombat(state: GameState): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      manaPool: initManaPool(),
    },
    monster: spawnMonster(pickMonster(state.player.level)),
    phase: "PLAYER_ACTION",
    turn: 1,
    log: [],
  };
}
