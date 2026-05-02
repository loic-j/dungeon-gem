import type {
  CombatState,
  Player,
  MonsterSpell,
  MonsterType,
  StatusEffect,
} from "./types";
import {
  PLAYER_START_HP,
  PLAYER_START_MAX_MANA,
  PLAYER_START_LEVEL,
  PLAYER_START_EXPERIENCE,
  xpToNextLevel,
  ACTION_POINTS_AFTER_ATTACK,
} from "./constants";
import { SPELL_LIBRARY, STARTER_SPELLS } from "./data/spells";
import { spawnMonster } from "./data/monsters";
import { addManaToPool, initManaPool } from "./mana";
import { applyPlayerSpell, applyMonsterSpell } from "./combat";
import { rollMonsterAttack, chooseMonsterSpell } from "./monsterAI";
import { tickEffects, hasSlowEffect } from "./statusEffects";
import {
  getManaDrawWeights,
  getInitialManaBonus,
  getCombatShieldTotal,
} from "./rewards";

export function initPlayer(): Player {
  return {
    hp: PLAYER_START_HP,
    maxHp: PLAYER_START_HP,
    manaPool: initManaPool(),
    maxMana: PLAYER_START_MAX_MANA,
    spells: SPELL_LIBRARY.filter((s) => STARTER_SPELLS.includes(s.id)),
    level: PLAYER_START_LEVEL,
    experience: PLAYER_START_EXPERIENCE,
    experienceToNextLevel: xpToNextLevel(PLAYER_START_LEVEL),
    activeRewards: [],
  };
}

export function processManaPhase(state: CombatState): CombatState {
  const slow = hasSlowEffect(state.monsterEffects);
  const manaBias = getManaDrawWeights(state.player.activeRewards);
  return {
    ...state,
    turn: state.turn + 1,
    player: {
      ...state.player,
      manaPool: addManaToPool(
        state.player.manaPool,
        state.player.maxMana,
        manaBias,
      ),
    },
    monster: {
      ...state.monster,
      actionPoints: slow
        ? state.monster.actionPoints
        : state.monster.actionPoints + 1,
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

export function processPlayerCast(
  state: CombatState,
  spellId: string,
): CombatState {
  const spell = state.player.spells.find((s) => s.id === spellId);
  if (!spell) return state;
  return { ...applyPlayerSpell(state, spell), phase: "PLAYER_ACTION" };
}

export function processMonsterPhase(state: CombatState): {
  state: CombatState;
  attacked: boolean;
  spell: MonsterSpell | null;
} {
  if (!rollMonsterAttack(state.monster)) {
    return {
      state: { ...state, phase: "CHECK_END" },
      attacked: false,
      spell: null,
    };
  }

  const spell = state.monster.nextSpell;
  const next = applyMonsterSpell(state, spell);
  const updatedLastCast = {
    ...next.monster.spellLastCastTurn,
    [spell.id]: state.turn,
  };
  const nextSpell = chooseMonsterSpell(
    { ...next.monster, spellLastCastTurn: updatedLastCast },
    state.turn + 1,
  );

  return {
    state: {
      ...next,
      monster: {
        ...next.monster,
        actionPoints: ACTION_POINTS_AFTER_ATTACK,
        spellLastCastTurn: updatedLastCast,
        nextSpell,
      },
      phase: "CHECK_END",
    },
    attacked: true,
    spell,
  };
}

export function processStatusEffects(state: CombatState): CombatState {
  return tickEffects(state);
}

export function checkCombatEnd(
  state: CombatState,
): "VICTORY" | "GAME_OVER" | null {
  if (state.monster.hp <= 0) return "VICTORY";
  if (state.player.hp <= 0) return "GAME_OVER";
  return null;
}

export function resetCombat(player: Player, monster: MonsterType): CombatState {
  let initialMana = initManaPool();

  for (const { element, amount } of getInitialManaBonus(player.activeRewards)) {
    for (let i = 0; i < amount; i++) {
      if (initialMana.length < player.maxMana) {
        initialMana = [...initialMana, element];
      }
    }
  }

  const shieldTotal = getCombatShieldTotal(player.activeRewards);
  const playerEffects: StatusEffect[] =
    shieldTotal > 0 ? [{ type: "shield", amount: shieldTotal }] : [];

  return {
    player: { ...player, manaPool: initialMana },
    monster: spawnMonster(monster),
    phase: "PLAYER_ACTION",
    turn: 0,
    playerEffects,
    monsterEffects: [],
  };
}
