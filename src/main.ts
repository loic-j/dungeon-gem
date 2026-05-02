import { initScene } from "./renderer/scene";
import { createOverlay } from "./ui/overlay";
import { createMusicButton } from "./ui/musicButton";
import { createExploreControls } from "./ui/exploreControls";
import { createStartScreen } from "./ui/startScreen";
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
import { saveGame, clearSave, loadGame } from "./game/persistence";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const uiRoot = document.getElementById("ui") as HTMLDivElement;
const appRoot = document.getElementById("app") as HTMLDivElement;

// ── Config ─────────────────────────────────────────────────────────────────────
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
const debugStairs =
  import.meta.env.DEV && import.meta.env.VITE_DEBUG_STAIRS === "true";

function createFreshState(): AppState {
  const dungeon: DungeonProgress = {
    ...createDungeonProgress(startDungeonConfig),
    currentStageIndex: startStageIndex,
    roomsCleared: startRoomIndex,
  };
  const encounter = initEncounterState(
    getCurrentStage(dungeon).encounterConfigs,
  );
  const combat = initCombat();
  if (debugStairs) {
    return { phase: "STAGE_TRANSITION", encounter, combat, dungeon };
  }
  return { phase: "EXPLORING", encounter, combat, dungeon };
}

// ── Initial state ──────────────────────────────────────────────────────────────
const savedState = loadGame();
let appState: AppState = savedState ?? createFreshState();

let isDispatching = false;

// ── Renderer ───────────────────────────────────────────────────────────────────
const {
  objects,
  animateWalk,
  animateWalkToStairs,
  setMonsterType,
  setStairsMode,
} = initScene(
  canvas,
  appState.combat.monster.definition,
  appState.dungeon.dungeon.graphics,
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

// ── New Game button (shown after Game Over) ────────────────────────────────────
const newGameBtn = document.createElement("button");
newGameBtn.textContent = "NEW GAME";
newGameBtn.style.cssText =
  "position:absolute;bottom:30%;left:50%;transform:translateX(-50%);padding:14px 28px;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.35);color:#fff;font-size:16px;letter-spacing:2px;cursor:pointer;border-radius:4px;font-family:monospace;z-index:20;display:none;pointer-events:auto;";
newGameBtn.addEventListener("click", () => {
  clearSave();
  appState = createFreshState();
  isDispatching = false;
  setMonsterType(appState.combat.monster.definition);
  setBossMode(false);
  setStairsMode(false);
  tick();
});
appRoot.appendChild(newGameBtn);

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
          animateWalkToStairs,
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

  const isGameOver = appState.phase === "GAME_OVER";
  newGameBtn.style.display = isGameOver && !isDispatching ? "block" : "none";

  if (isGameOver) {
    clearSave();
  } else {
    saveGame(appState);
  }
}

// ── Boot ───────────────────────────────────────────────────────────────────────
if (savedState !== null) {
  const startScreen = createStartScreen({
    hasContinue: true,
    onNewGame() {
      clearSave();
      appState = createFreshState();
      setMonsterType(appState.combat.monster.definition);
      setBossMode(false);
      setStairsMode(false);
      startScreen.hide();
      tick();
      musicButton.startOnInteraction();
    },
    onContinue() {
      startScreen.hide();
      if (appState.phase === "COMBAT") {
        setMonsterType(appState.combat.monster.definition);
        if (appState.isBoss) {
          setBossMode(true, appState.dungeon.dungeon.bossTitle);
        }
      } else if (appState.phase === "STAGE_TRANSITION") {
        setStairsMode(true);
        showStageTransitionOverlay();
      }
      tick();
      musicButton.startOnInteraction();
    },
  });
  appRoot.appendChild(startScreen.element);
  tick();
} else {
  tick();
  musicButton.startOnInteraction();

  if (debugStairs) {
    setStairsMode(true);
    showStageTransitionOverlay();
  }
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
