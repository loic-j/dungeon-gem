import { initScene } from "./renderer/scene";
import { createOverlay } from "./ui/overlay";
import { createMusicButton } from "./ui/musicButton";
import { createExploreControls } from "./ui/exploreControls";
import { showStageTransitionOverlay } from "./ui/messages";
import {
  startBackgroundMusic,
  stopBackgroundMusic,
  stopBossMusic,
} from "./audio/soundManager";
import { initCombat } from "./game/turnMachine";
import { initEncounterState } from "./game/encounterSystem";
import { createDungeonProgress, getCurrentStage } from "./game/dungeon";
import type { DungeonConfig, DungeonProgress } from "./game/dungeon";
import { DUNGEON_1 } from "./game/data/dungeons";
import type { AppState, Step } from "./game/appState";
import { moveForward, descend, openChest, takeTurn } from "./game/transitions";
import type { CombatState } from "./game/types";
import { executeEffect } from "./effects";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const uiRoot = document.getElementById("ui") as HTMLDivElement;
const appRoot = document.getElementById("app") as HTMLDivElement;

// ── Initial state ──────────────────────────────────────────────────────────────
const DUNGEONS: Record<string, DungeonConfig> = { [DUNGEON_1.id]: DUNGEON_1 };
const startDungeonConfig =
  DUNGEONS[import.meta.env.VITE_START_DUNGEON ?? ""] ?? DUNGEON_1;
const startStageIndex = Math.max(
  0,
  Math.min(
    Number(import.meta.env.VITE_START_STAGE ?? 0) || 0,
    startDungeonConfig.stages.length - 1,
  ),
);
const startRoomIndex = Math.max(
  0,
  Math.min(
    Number(import.meta.env.VITE_START_ROOM ?? 0) || 0,
    startDungeonConfig.stages[startStageIndex]!.roomCount - 1,
  ),
);
const initialDungeon: DungeonProgress = {
  ...createDungeonProgress(startDungeonConfig),
  currentStageIndex: startStageIndex,
  roomsCleared: startRoomIndex,
};

const debugStairs =
  import.meta.env.DEV && import.meta.env.VITE_DEBUG_STAIRS === "true";

const initialEncounter = initEncounterState(
  getCurrentStage(initialDungeon).encounterConfigs,
);
const initialCombat = initCombat();

let appState: AppState = debugStairs
  ? {
      phase: "STAGE_TRANSITION",
      encounter: initialEncounter,
      combat: initialCombat,
      dungeon: initialDungeon,
    }
  : {
      phase: "EXPLORING",
      encounter: initialEncounter,
      combat: initialCombat,
      dungeon: initialDungeon,
    };

let isDispatching = false;

// ── Renderer + overlay ─────────────────────────────────────────────────────────
const { objects, animateWalk, setMonsterType, setStairsMode } = initScene(
  canvas,
  appState.combat.monster.definition,
  startDungeonConfig.graphics,
);

const {
  render,
  animatePlayerAttack,
  animateManaGain,
  showMonsterAttack,
  updateStageProgress,
  setBossMode,
} = createOverlay(uiRoot, {
  onSpell: (spellId) => {
    if (!isDispatching && appState.phase === "COMBAT")
      void dispatch(takeTurn(appState, spellId));
  },
  onSkip: () => {
    if (!isDispatching && appState.phase === "COMBAT")
      void dispatch(takeTurn(appState, null));
  },
});

// ── UI widgets ─────────────────────────────────────────────────────────────────
const controls = createExploreControls({
  getPhase: () => appState.phase,
  onMoveForward: () => {
    if (!isDispatching && appState.phase === "EXPLORING")
      void dispatch(moveForward(appState));
  },
  onDescend: () => {
    if (!isDispatching && appState.phase === "STAGE_TRANSITION")
      void dispatch(descend(appState));
  },
  onOpenChest: () => {
    if (!isDispatching && appState.phase === "CHEST")
      void dispatch(openChest(appState));
  },
});
appRoot.appendChild(controls.moveButton);
appRoot.appendChild(controls.chestOverlay);

const musicButton = createMusicButton({
  onEnable: () => {
    if (appState.phase === "COMBAT" && appState.isBoss) {
      appState.dungeon.dungeon.bossMusic?.();
    } else {
      startBackgroundMusic();
    }
  },
  onDisable: () => {
    stopBossMusic();
    stopBackgroundMusic();
  },
});
appRoot.appendChild(musicButton.element);

// ── Core dispatch loop ─────────────────────────────────────────────────────────
async function dispatch(steps: Step[]): Promise<void> {
  if (isDispatching) return;
  isDispatching = true;
  tick();
  try {
    for (const step of steps) {
      if (step.type === "state") {
        appState = step.state;
        tick();
      } else {
        await executeEffect(step.effect, {
          objects,
          animateWalk,
          animatePlayerAttack,
          animateManaGain,
          showMonsterAttack,
          setBossMode,
          setMonsterType,
          setStairsMode,
          isMusicEnabled: () => musicButton.isEnabled(),
          getState: () => appState,
        });
      }
    }
  } catch (err) {
    console.error("Dispatch failed:", err);
  } finally {
    isDispatching = false;
    tick();
  }
}

// ── UI sync ────────────────────────────────────────────────────────────────────
function tick() {
  const inCombat = appState.phase === "COMBAT";
  render(appState.combat, isDispatching, inCombat);
  objects.monsterSprite.visible = inCombat;
  controls.sync(appState.phase, isDispatching);
  const stage = getCurrentStage(appState.dungeon);
  updateStageProgress(
    appState.dungeon.roomsCleared,
    stage.roomCount,
    appState.dungeon.currentStageIndex,
  );
}

// ── Boot ───────────────────────────────────────────────────────────────────────
tick();
musicButton.startOnInteraction();

if (debugStairs) {
  setStairsMode(true);
  showStageTransitionOverlay();
}

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>)["__game"] = {
    getState: () => appState.combat,
    setState: (s: CombatState) => {
      appState = { ...appState, combat: s };
      isDispatching = false;
      tick();
    },
    isLocked: () => isDispatching,
  };
}
