import type {
  AppState,
  ExploringState,
  CombatAppState,
  ChestState,
  GameOverState,
  StageTransitionState,
  Step,
} from "./appState";
import {
  processPlayerAction,
  processPlayerCast,
  processMonsterPhase,
  processStatusEffects,
  processManaPhase,
  checkCombatEnd,
  resetCombat,
} from "./turnMachine";
import { applyExperience } from "./experience";
import {
  isBossRoom,
  isStageComplete,
  isFinalStage,
  completeRoom,
  advanceToNextStage,
  getCurrentStage,
  resetDungeonProgress,
} from "./dungeon";
import {
  enterRoom,
  onEncounterFinished,
  initEncounterState,
} from "./encounterSystem";
import { findMonster, pickMonsterFromIds } from "./data/monsters";

// ── Exploring ────────────────────────────────────────────────────────────────

export function moveForward(state: ExploringState): Step[] {
  const footstep: Step = { type: "effect", effect: { type: "PLAY_FOOTSTEP" } };
  const walk: Step = { type: "effect", effect: { type: "ANIMATE_WALK" } };

  if (isStageComplete(state.dungeon)) {
    return [footstep, walk, ...roomCompletionSteps(state)];
  }

  if (isBossRoom(state.dungeon)) {
    return [footstep, walk, ...bossEncounterSteps(state)];
  }

  const { encounter, nextState: nextEncounter } = enterRoom(state.encounter);
  const s: ExploringState = { ...state, encounter: nextEncounter };

  if (encounter === "chest") return [footstep, walk, ...chestRoomSteps(s)];
  if (encounter !== "empty")
    return [footstep, walk, ...monsterEncounterSteps(s)];

  const afterRoom: ExploringState = { ...s, dungeon: completeRoom(s.dungeon) };
  return [
    footstep,
    walk,
    { type: "state", state: afterRoom },
    ...roomCompletionSteps(afterRoom),
  ];
}

function bossEncounterSteps(state: ExploringState): Step[] {
  const boss = findMonster(state.dungeon.dungeon.bossMonster);
  if (!boss) return emptyRoomSteps(state);

  const combat = processManaPhase(resetCombat(state.player, boss));
  const next: CombatAppState = {
    phase: "COMBAT",
    isBoss: true,
    combat,
    dungeon: state.dungeon,
    encounter: state.encounter,
  };
  return [
    { type: "effect", effect: { type: "SET_MONSTER_TYPE", monster: boss } },
    { type: "state", state: next },
    {
      type: "effect",
      effect: {
        type: "ANIMATE_MANA_GAIN",
        index: combat.player.manaPool.length - 1,
      },
    },
    { type: "effect", effect: { type: "PLAY_MONSTER_APPEAR_SOUND" } },
    {
      type: "effect",
      effect: {
        type: "SET_BOSS_MODE",
        enabled: true,
        title: state.dungeon.dungeon.bossTitle,
      },
    },
    { type: "effect", effect: { type: "PLAY_BOSS_MUSIC" } },
  ];
}

function monsterEncounterSteps(state: ExploringState): Step[] {
  const stage = getCurrentStage(state.dungeon);
  const monster = pickMonsterFromIds(stage.availableMonsters);
  const combat = processManaPhase(resetCombat(state.player, monster));
  const next: CombatAppState = {
    phase: "COMBAT",
    isBoss: false,
    combat,
    dungeon: state.dungeon,
    encounter: state.encounter,
  };
  return [
    { type: "effect", effect: { type: "SET_MONSTER_TYPE", monster } },
    { type: "state", state: next },
    {
      type: "effect",
      effect: {
        type: "ANIMATE_MANA_GAIN",
        index: combat.player.manaPool.length - 1,
      },
    },
    { type: "effect", effect: { type: "PLAY_MONSTER_APPEAR_SOUND" } },
  ];
}

function chestRoomSteps(state: ExploringState): Step[] {
  const next: ChestState = {
    phase: "CHEST",
    player: state.player,
    dungeon: state.dungeon,
    encounter: state.encounter,
  };
  return [
    { type: "state", state: next },
    { type: "effect", effect: { type: "SHOW_CHEST_CLOSED" } },
  ];
}

function emptyRoomSteps(state: ExploringState): Step[] {
  const afterRoom: ExploringState = {
    ...state,
    dungeon: completeRoom(state.dungeon),
  };
  return [
    { type: "state", state: afterRoom },
    ...roomCompletionSteps(afterRoom),
  ];
}

function roomCompletionSteps(state: ExploringState): Step[] {
  if (!isStageComplete(state.dungeon)) return [];
  if (isFinalStage(state.dungeon)) return dungeonCompleteSteps(state);

  const transition: StageTransitionState = {
    phase: "STAGE_TRANSITION",
    player: state.player,
    dungeon: state.dungeon,
    encounter: state.encounter,
    stairsReached: false,
  };
  return [{ type: "state", state: transition }];
}

export function moveForwardFromTransition(state: StageTransitionState): Step[] {
  if (!state.stairsReached) {
    const atStairs: StageTransitionState = { ...state, stairsReached: true };
    return [
      { type: "effect", effect: { type: "PLAY_FOOTSTEP" } },
      { type: "effect", effect: { type: "ANIMATE_STAGE_TRANSITION" } },
      { type: "state", state: atStairs },
    ];
  }

  const nextDungeon = advanceToNextStage(state.dungeon);
  const next: ExploringState = {
    phase: "EXPLORING",
    player: state.player,
    dungeon: nextDungeon,
    encounter: initEncounterState(
      getCurrentStage(nextDungeon).encounterConfigs,
    ),
  };
  return [
    { type: "effect", effect: { type: "PLAY_FOOTSTEP" } },
    { type: "effect", effect: { type: "FADE_TO_BLACK" } },
    { type: "effect", effect: { type: "HIDE_STAGE_TRANSITION" } },
    { type: "state", state: next },
    { type: "effect", effect: { type: "DELAY", ms: 250 } },
    { type: "effect", effect: { type: "FADE_FROM_BLACK" } },
  ];
}

function dungeonCompleteSteps(state: ExploringState): Step[] {
  const resetDungeon = resetDungeonProgress(state.dungeon);
  const next: ExploringState = {
    phase: "EXPLORING",
    player: state.player,
    dungeon: resetDungeon,
    encounter: initEncounterState(
      getCurrentStage(resetDungeon).encounterConfigs,
    ),
  };
  return [
    {
      type: "effect",
      effect: {
        type: "SHOW_MESSAGE",
        text: `${state.dungeon.dungeon.name}\nCOMPLETE!`,
        color: "#e8c01a",
      },
    },
    { type: "state", state: next },
  ];
}

// ── Chest ─────────────────────────────────────────────────────────────────────

export function openChest(state: ChestState): Step[] {
  const next: ExploringState = {
    phase: "EXPLORING",
    player: state.player,
    dungeon: completeRoom(state.dungeon),
    encounter: onEncounterFinished("chest", state.encounter),
  };
  return [
    { type: "effect", effect: { type: "ANIMATE_CHEST_OPEN" } },
    { type: "effect", effect: { type: "SHOW_ITEM_SELECTION" } },
    { type: "effect", effect: { type: "HIDE_CHEST" } },
    { type: "state", state: next },
    ...roomCompletionSteps(next),
  ];
}

// ── Combat ────────────────────────────────────────────────────────────────────

export function castSpell(state: CombatAppState, spellId: string): Step[] {
  const steps: Step[] = [];
  const spell = state.combat.player.spells.find((s) => s.id === spellId);
  if (!spell) return steps;

  steps.push(
    {
      type: "effect",
      effect: { type: "PLAY_SPELL_SOUND", element: spell.element },
    },
    { type: "effect", effect: { type: "ANIMATE_PLAYER_ATTACK" } },
  );

  const afterSpell = processPlayerCast(state.combat, spellId);
  steps.push({
    type: "state",
    state: { ...state, combat: afterSpell } as AppState,
  });

  if (checkCombatEnd(afterSpell) === "VICTORY") {
    return [...steps, ...victorySteps({ ...state, combat: afterSpell })];
  }

  return steps;
}

export function takeTurn(
  state: CombatAppState,
  spellId: string | null,
): Step[] {
  const steps: Step[] = [];

  if (spellId !== null) {
    const spell = state.combat.player.spells.find((s) => s.id === spellId);
    if (spell) {
      steps.push(
        {
          type: "effect",
          effect: { type: "PLAY_SPELL_SOUND", element: spell.element },
        },
        { type: "effect", effect: { type: "ANIMATE_PLAYER_ATTACK" } },
      );
    }
  }

  const afterPlayer = processPlayerAction(state.combat, spellId);
  steps.push({
    type: "state",
    state: { ...state, combat: afterPlayer } as AppState,
  });

  if (checkCombatEnd(afterPlayer) === "VICTORY") {
    return [...steps, ...victorySteps({ ...state, combat: afterPlayer })];
  }

  steps.push({ type: "effect", effect: { type: "DELAY", ms: 100 } });

  const {
    state: afterMonster,
    attacked,
    spell: monsterSpell,
  } = processMonsterPhase(afterPlayer);
  steps.push({
    type: "state",
    state: { ...state, combat: afterMonster } as AppState,
  });

  if (attacked && monsterSpell) {
    steps.push(
      { type: "effect", effect: { type: "PLAY_MONSTER_ATTACK_SOUND" } },
      { type: "effect", effect: { type: "ANIMATE_MONSTER_ATTACK" } },
      { type: "effect", effect: { type: "FLASH_SCREEN" } },
      {
        type: "effect",
        effect: {
          type: "SHOW_MONSTER_ATTACK_POPUP",
          name: monsterSpell.name,
          damage: monsterSpell.damage,
        },
      },
    );
  }

  steps.push({ type: "effect", effect: { type: "DELAY", ms: 300 } });

  const outcome = checkCombatEnd(afterMonster);
  if (outcome === "GAME_OVER")
    return [...steps, ...gameOverSteps({ ...state, combat: afterMonster })];
  if (outcome === "VICTORY")
    return [...steps, ...victorySteps({ ...state, combat: afterMonster })];

  const afterEffects = processStatusEffects(afterMonster);
  steps.push({
    type: "state",
    state: { ...state, combat: afterEffects } as AppState,
  });

  const endOutcome = checkCombatEnd(afterEffects);
  if (endOutcome === "GAME_OVER")
    return [...steps, ...gameOverSteps({ ...state, combat: afterEffects })];
  if (endOutcome === "VICTORY")
    return [...steps, ...victorySteps({ ...state, combat: afterEffects })];

  const afterMana = processManaPhase(afterEffects);
  steps.push(
    { type: "state", state: { ...state, combat: afterMana } as AppState },
    {
      type: "effect",
      effect: {
        type: "ANIMATE_MANA_GAIN",
        index: afterMana.player.manaPool.length - 1,
      },
    },
  );

  return steps;
}

function victorySteps(state: CombatAppState): Step[] {
  const player = applyExperience(
    state.combat.player,
    state.combat.monster.definition.experienceReward,
  );
  const leveledUp = player.level > state.combat.player.level;
  const xp = state.combat.monster.definition.experienceReward;
  const msg = leveledUp
    ? `Victory!\n+${xp} XP\nLevel Up! → ${player.level}`
    : `Victory!\n+${xp} XP`;

  const bossCleanup: Step[] = state.isBoss
    ? [
        { type: "effect", effect: { type: "STOP_BOSS_MUSIC" } },
        { type: "effect", effect: { type: "SET_BOSS_MODE", enabled: false } },
        { type: "effect", effect: { type: "START_BACKGROUND_MUSIC" } },
      ]
    : [];

  const next: ExploringState = {
    phase: "EXPLORING",
    player,
    dungeon: completeRoom(state.dungeon),
    encounter: onEncounterFinished("monster", state.encounter),
  };

  return [
    ...bossCleanup,
    { type: "effect", effect: { type: "PLAY_VICTORY_SOUND" } },
    {
      type: "effect",
      effect: { type: "SHOW_MESSAGE", text: msg, color: "#2b8" },
    },
    { type: "state", state: next },
    ...roomCompletionSteps(next),
  ];
}

function gameOverSteps(state: CombatAppState): Step[] {
  const bossCleanup: Step[] = state.isBoss
    ? [
        { type: "effect", effect: { type: "STOP_BOSS_MUSIC" } },
        { type: "effect", effect: { type: "SET_BOSS_MODE", enabled: false } },
      ]
    : [];

  const next: GameOverState = {
    phase: "GAME_OVER",
    player: state.combat.player,
    dungeon: state.dungeon,
    encounter: state.encounter,
  };

  return [
    ...bossCleanup,
    { type: "effect", effect: { type: "STOP_BACKGROUND_MUSIC" } },
    { type: "effect", effect: { type: "START_BACKGROUND_MUSIC" } },
    { type: "effect", effect: { type: "PLAY_GAME_OVER_SOUND" } },
    {
      type: "effect",
      effect: { type: "SHOW_MESSAGE", text: "GAME OVER", color: "#c00" },
    },
    { type: "state", state: next },
  ];
}
