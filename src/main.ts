import { initScene } from "./renderer/scene";
import { createOverlay } from "./ui/overlay";
import { createMusicButton } from "./ui/musicButton";
import { createExploreControls } from "./ui/exploreControls";
import { createStartScreen } from "./ui/startScreen";
import {
  startBackgroundMusic,
  stopBackgroundMusic,
  stopBossMusic,
} from "./audio/soundManager";
import { initPlayer } from "./game/turnMachine";
import { initEncounterState } from "./game/encounterSystem";
import { createDungeonProgress, getCurrentStage } from "./game/dungeon";
import type { DungeonProgress } from "./game/dungeon";
import { DUNGEON_1 } from "./game/data/dungeons";
import type { AppState, Step } from "./game/appState";
import {
  moveForward,
  moveForwardFromTransition,
  openChest,
  takeTurn,
  castSpell,
  learnSpell,
  skipSpellLearn,
} from "./game/transitions";
import { createSpellLearnUI } from "./ui/spellLearn";
import { executeEffect } from "./effects";
import { saveGame, clearSave, loadGame, setDevState } from "./game/persistence";
import { createDebugPanel } from "./ui/debugPanel";

if (import.meta.env.DEV && import.meta.env.VITE_DEV_STATE) {
  const states = import.meta.glob("/dev/states/*.json", {
    eager: true,
    import: "default",
  });
  const state = states[`/dev/states/${import.meta.env.VITE_DEV_STATE}.json`];
  if (state) setDevState(state);
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const uiRoot = document.getElementById("ui") as HTMLDivElement;
const appRoot = document.getElementById("app") as HTMLDivElement;

function createFreshState(): AppState {
  const dungeon: DungeonProgress = createDungeonProgress(DUNGEON_1);
  const encounter = initEncounterState(
    getCurrentStage(dungeon).encounterConfigs,
  );
  const player = initPlayer();
  return { phase: "EXPLORING", player, encounter, dungeon };
}

// ── Initial state ──────────────────────────────────────────────────────────────
const savedState = loadGame();
let appState: AppState = savedState ?? createFreshState();

let isDispatching = false;

// ── Renderer ───────────────────────────────────────────────────────────────────
const {
  objects,
  animateWalk,
  animateStageTransition,
  hideStageTransition,
  setMonsterType,
} = initScene(canvas, appState.dungeon.dungeon.graphics);
if (appState.phase === "COMBAT")
  setMonsterType(appState.combat.monster.definition);

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
      void dispatch(castSpell(appState, spellId));
  },
  onSkip: () => {
    if (!isDispatching && appState.phase === "COMBAT")
      void dispatch(takeTurn(appState, null));
  },
});

const spellLearnUI = createSpellLearnUI(appRoot, {
  onLearn: (spellId, replaceId) => {
    if (!isDispatching && appState.phase === "SPELL_LEARN")
      void dispatch(learnSpell(appState, spellId, replaceId));
  },
  onSkip: () => {
    if (!isDispatching && appState.phase === "SPELL_LEARN")
      void dispatch(skipSpellLearn(appState));
  },
});

// ── UI widgets ─────────────────────────────────────────────────────────────────
const controls = createExploreControls({
  getPhase: () => appState.phase,
  onMoveForward: () => {
    if (isDispatching) return;
    if (appState.phase === "EXPLORING") void dispatch(moveForward(appState));
    else if (appState.phase === "STAGE_TRANSITION")
      void dispatch(moveForwardFromTransition(appState));
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

// ── Debug panel (VITE_DEBUG env var) ──────────────────────────────────────────
const debugPanel = import.meta.env.VITE_DEBUG
  ? createDebugPanel(appRoot)
  : null;

// ── New Game button (shown after Game Over) ────────────────────────────────────
const newGameBtn = document.createElement("button");
newGameBtn.textContent = "NEW GAME";
newGameBtn.style.cssText =
  "position:absolute;bottom:30%;left:50%;transform:translateX(-50%);padding:14px 28px;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.35);color:#fff;font-size:16px;letter-spacing:2px;cursor:pointer;border-radius:4px;font-family:monospace;z-index:20;display:none;pointer-events:auto;";
newGameBtn.addEventListener("click", () => {
  clearSave();
  appState = createFreshState();
  isDispatching = false;
  setBossMode(false);
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
          animateStageTransition,
          hideStageTransition,
          animatePlayerAttack,
          animateManaGain,
          showMonsterAttack,
          setBossMode,
          setMonsterType,
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
  const player =
    appState.phase === "COMBAT" ? appState.combat.player : appState.player;
  const combat = appState.phase === "COMBAT" ? appState.combat : null;
  render(player, combat, isDispatching);
  objects.monsterSprite.visible = inCombat;
  controls.sync(appState.phase, isDispatching);

  if (appState.phase === "SPELL_LEARN" && !isDispatching) {
    spellLearnUI.show(appState);
  } else {
    spellLearnUI.hide();
  }
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

  debugPanel?.update(appState);
}

// ── Boot ───────────────────────────────────────────────────────────────────────
if (savedState !== null) {
  const startScreen = createStartScreen({
    hasContinue: true,
    onNewGame() {
      clearSave();
      appState = createFreshState();
      setBossMode(false);
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
}
