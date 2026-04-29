import type { CombatState, MonsterSpell } from "./types";
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

export function initCombat(): CombatState {
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
  };
}

export function processManaPhase(state: CombatState): CombatState {
  return {
    ...state,
    turn: state.turn + 1,
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
  state: CombatState,
  spellId: string | null,
): CombatState {
  if (spellId === null) {
    return { ...state, phase: "MONSTER_ACTION" };
  }
  const spell = state.player.spells.find((s) => s.id === spellId);
  if (!spell) return { ...state, phase: "MONSTER_ACTION" };
  return { ...applyPlayerSpell(state, spell), phase: "MONSTER_ACTION" };
}

export function processMonsterPhase(state: CombatState): {
  state: CombatState;
  attacked: boolean;
  spell: MonsterSpell | null;
} {
  if (!rollMonsterAttack(state.monster)) {
    return { state: { ...state, phase: "CHECK_END" }, attacked: false, spell: null };
  }

  const spell = state.monster.nextSpell;
  const next = applyMonsterSpell(state, spell);
  const updatedLastCast = { ...next.monster.spellLastCastTurn, [spell.id]: state.turn };
  const nextSpell = chooseMonsterSpell(
    { ...next.monster, spellLastCastTurn: updatedLastCast },
    state.turn + 1,
  );

  return {
    state: {
      ...next,
      monster: {
        ...next.monster,
        actionPoints: -1,
        spellLastCastTurn: updatedLastCast,
        nextSpell,
      },
      phase: "CHECK_END",
    },
    attacked: true,
    spell,
  };
}

export function checkCombatEnd(
  state: CombatState,
): "VICTORY" | "GAME_OVER" | null {
  if (state.monster.hp <= 0) return "VICTORY";
  if (state.player.hp <= 0) return "GAME_OVER";
  return null;
}

export function resetCombat(state: CombatState): CombatState {
  return {
    ...state,
    player: {
      ...state.player,
      manaPool: initManaPool(),
    },
    monster: spawnMonster(pickMonster(state.player.level)),
    phase: "PLAYER_ACTION",
    turn: 1,
  };
}
