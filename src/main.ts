import { initScene } from "./renderer/scene";
import { animateMonsterAttack } from "./renderer/animator";
import { createOverlay } from "./ui/overlay";
import {
  playSpellSound,
  playVictorySound,
  playGameOverSound,
  playFootstepSound,
  startBackgroundMusic,
  stopBackgroundMusic,
  stopBossMusic,
} from "./audio/soundManager";
import { initCombat } from "./game/turnMachine";
import { initEncounterState } from "./game/encounterSystem";
import { createDungeonProgress, getCurrentStage } from "./game/dungeon";
import type { DungeonConfig, DungeonProgress } from "./game/dungeon";
import { DUNGEON_1 } from "./game/data/dungeons";
import type { AppState, Effect, Step } from "./game/appState";
import { moveForward, descend, openChest, takeTurn } from "./game/transitions";
import type { CombatState } from "./game/types";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const uiRoot = document.getElementById("ui") as HTMLDivElement;

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
let musicEnabled = true;
let stageTransitionOverlay: HTMLElement | null = null;

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
    if (!isDispatching && appState.phase === "COMBAT") {
      void dispatch(takeTurn(appState, spellId));
    }
  },
  onSkip: () => {
    if (!isDispatching && appState.phase === "COMBAT") {
      void dispatch(takeTurn(appState, null));
    }
  },
});

// ── Move arrow ─────────────────────────────────────────────────────────────────
const moveBtn = document.createElement("button");
moveBtn.textContent = "↑";
moveBtn.style.cssText = `
  position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);
  width:64px; height:64px; border-radius:50%;
  background:rgba(255,255,255,0.08); border:2px solid rgba(255,255,255,0.25);
  color:#fff; font-size:36px; line-height:1; cursor:pointer;
  pointer-events:auto; touch-action:manipulation; z-index:5;
  display:flex; align-items:center; justify-content:center;
  transition:background 0.15s, border-color 0.15s;
`;
moveBtn.addEventListener("mouseenter", () => {
  moveBtn.style.background = "rgba(255,255,255,0.18)";
  moveBtn.style.borderColor = "rgba(255,255,255,0.5)";
});
moveBtn.addEventListener("mouseleave", () => {
  moveBtn.style.background = "rgba(255,255,255,0.08)";
  moveBtn.style.borderColor = "rgba(255,255,255,0.25)";
});
moveBtn.addEventListener("click", () => {
  if (isDispatching) return;
  if (appState.phase === "STAGE_TRANSITION") {
    void dispatch(descend(appState));
  } else if (appState.phase === "EXPLORING") {
    void dispatch(moveForward(appState));
  }
});
document.getElementById("app")!.appendChild(moveBtn);

// ── Chest click overlay ────────────────────────────────────────────────────────
const chestClickOverlay = document.createElement("div");
chestClickOverlay.style.cssText =
  "position:absolute;inset:0;z-index:4;pointer-events:none;cursor:pointer;";
chestClickOverlay.addEventListener("click", () => {
  if (appState.phase === "CHEST") {
    void dispatch(openChest(appState));
  }
});
document.getElementById("app")!.appendChild(chestClickOverlay);

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
        await executeEffect(step.effect);
      }
    }
  } catch (err) {
    console.error("Dispatch failed:", err);
  } finally {
    isDispatching = false;
    tick();
  }
}

async function executeEffect(effect: Effect): Promise<void> {
  switch (effect.type) {
    case "PLAY_FOOTSTEP":
      playFootstepSound();
      break;
    case "ANIMATE_WALK":
      await animateWalk();
      break;
    case "ANIMATE_PLAYER_ATTACK":
      await animatePlayerAttack();
      break;
    case "ANIMATE_MONSTER_ATTACK":
      await animateMonsterAttack(objects.monsterSprite);
      break;
    case "FLASH_SCREEN":
      flashScreen();
      break;
    case "DELAY":
      await delay(effect.ms);
      break;
    case "PLAY_SPELL_SOUND":
      playSpellSound(effect.element);
      break;
    case "PLAY_VICTORY_SOUND":
      playVictorySound();
      break;
    case "PLAY_GAME_OVER_SOUND":
      playGameOverSound();
      break;
    case "PLAY_MONSTER_APPEAR_SOUND":
      appState.combat.monster.definition.appearSound();
      break;
    case "PLAY_MONSTER_ATTACK_SOUND":
      appState.combat.monster.definition.attackSound();
      break;
    case "START_BACKGROUND_MUSIC":
      if (musicEnabled) startBackgroundMusic();
      break;
    case "STOP_BACKGROUND_MUSIC":
      stopBackgroundMusic();
      break;
    case "STOP_BOSS_MUSIC":
      stopBossMusic();
      break;
    case "PLAY_BOSS_MUSIC":
      if (musicEnabled) appState.dungeon.dungeon.bossMusic?.();
      break;
    case "SET_MONSTER_TYPE":
      setMonsterType(effect.monster);
      break;
    case "SET_STAIRS_MODE":
      setStairsMode(effect.enabled);
      break;
    case "SET_BOSS_MODE":
      setBossMode(effect.enabled, effect.title);
      break;
    case "SHOW_MONSTER_ATTACK_POPUP":
      showMonsterAttack(effect.name, effect.damage);
      break;
    case "SHOW_MESSAGE":
      await showMessageAsync(effect.text, effect.color);
      break;
    case "SHOW_STAGE_TRANSITION_OVERLAY":
      showStageTransitionOverlay();
      break;
    case "REMOVE_STAGE_TRANSITION_OVERLAY":
      removeStageTransitionOverlay();
      break;
    case "SHOW_ITEM_SELECTION":
      await showItemSelectionAsync();
      break;
    case "ANIMATE_MANA_GAIN":
      animateManaGain(effect.index);
      break;
    case "SHOW_CHEST_CLOSED":
      objects.chestClosedSprite.visible = true;
      objects.chestOpenSprite.visible = false;
      break;
    case "ANIMATE_CHEST_OPEN":
      objects.chestClosedSprite.visible = false;
      objects.chestOpenSprite.visible = true;
      await delay(500);
      break;
    case "HIDE_CHEST":
      objects.chestClosedSprite.visible = false;
      objects.chestOpenSprite.visible = false;
      break;
  }
}

// ── UI derivation ──────────────────────────────────────────────────────────────
function tick() {
  const inCombat = appState.phase === "COMBAT";
  render(appState.combat, isDispatching, inCombat);
  objects.monsterSprite.visible = inCombat;

  const showMoveBtn =
    (appState.phase === "EXPLORING" || appState.phase === "STAGE_TRANSITION") &&
    !isDispatching;
  moveBtn.style.display = showMoveBtn ? "" : "none";
  moveBtn.textContent = "↑";

  chestClickOverlay.style.pointerEvents =
    appState.phase === "CHEST" && !isDispatching ? "auto" : "none";

  const stage = getCurrentStage(appState.dungeon);
  updateStageProgress(
    appState.dungeon.roomsCleared,
    stage.roomCount,
    appState.dungeon.currentStageIndex,
  );
}

// ── UI helpers ─────────────────────────────────────────────────────────────────
const PLACEHOLDER_ITEMS = ["Health Potion", "Mana Crystal", "Ancient Scroll"];

function showItemSelectionAsync(): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:absolute; inset:0; display:flex; flex-direction:column;
      align-items:center; justify-content:center; gap:16px;
      background:rgba(0,0,0,0.75); z-index:20; pointer-events:auto;
    `;

    const title = document.createElement("div");
    title.textContent = "Choose an item";
    title.style.cssText =
      "font-family:sans-serif; font-size:22px; font-weight:bold; color:#f0c040; text-shadow:0 2px 8px #000; letter-spacing:1px;";
    overlay.appendChild(title);

    const row = document.createElement("div");
    row.style.cssText = "display:flex; gap:12px;";
    overlay.appendChild(row);

    for (const name of PLACEHOLDER_ITEMS) {
      const card = document.createElement("button");
      card.style.cssText = `
        width:100px; padding:14px 8px; border-radius:8px;
        background:rgba(20,14,4,0.92); border:2px solid #b8901a;
        color:#f0c040; font-family:sans-serif; font-size:13px; font-weight:bold;
        cursor:pointer; pointer-events:auto; touch-action:manipulation;
        display:flex; flex-direction:column; align-items:center; gap:10px;
        transition:border-color 0.15s, background 0.15s;
      `;
      card.addEventListener("mouseenter", () => {
        card.style.borderColor = "#ffd700";
        card.style.background = "rgba(40,28,4,0.95)";
      });
      card.addEventListener("mouseleave", () => {
        card.style.borderColor = "#b8901a";
        card.style.background = "rgba(20,14,4,0.92)";
      });

      const icon = document.createElement("div");
      icon.style.cssText =
        "width:48px; height:48px; border-radius:6px; background:rgba(184,144,26,0.2); border:1px solid #b8901a;";
      card.appendChild(icon);

      const label = document.createElement("div");
      label.textContent = name;
      card.appendChild(label);

      card.addEventListener("click", () => {
        overlay.remove();
        resolve();
      });
      row.appendChild(card);
    }

    document.getElementById("app")!.appendChild(overlay);
  });
}

function showStageTransitionOverlay() {
  stageTransitionOverlay = document.createElement("div");
  stageTransitionOverlay.style.cssText = `
    position:absolute; top:0; left:0; right:0; padding:24px 16px 12px;
    display:flex; flex-direction:column; align-items:center; gap:6px;
    pointer-events:none; z-index:4;
  `;

  const title = document.createElement("div");
  title.textContent = "Stage Complete!";
  title.style.cssText =
    "font-family:sans-serif; font-size:26px; font-weight:bold; color:#e8c01a; text-shadow:0 2px 10px #000; letter-spacing:2px;";
  stageTransitionOverlay.appendChild(title);

  const hint = document.createElement("div");
  hint.textContent = "Descend...";
  hint.style.cssText =
    "font-family:sans-serif; font-size:15px; color:rgba(255,255,255,0.5); letter-spacing:1px; text-shadow:0 1px 6px #000;";
  stageTransitionOverlay.appendChild(hint);

  document.getElementById("app")!.appendChild(stageTransitionOverlay);
}

function removeStageTransitionOverlay() {
  stageTransitionOverlay?.remove();
  stageTransitionOverlay = null;
}

function flashScreen() {
  const flash = document.createElement("div");
  flash.style.cssText = `
    position:absolute; inset:0; background:rgba(200,0,0,0.35);
    pointer-events:none; z-index:10;
    animation:flash 0.4s ease-out forwards;
  `;
  const style = document.createElement("style");
  style.textContent = "@keyframes flash { from{opacity:1} to{opacity:0} }";
  document.head.appendChild(style);
  document.getElementById("app")!.appendChild(flash);
  setTimeout(() => flash.remove(), 400);
}

function showMessage(text: string, color: string, onDone?: () => void) {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    background:rgba(0,0,0,0.7); z-index:20; pointer-events:auto; cursor:pointer;
    font-family:sans-serif; font-size:40px; font-weight:bold; color:${color};
    text-shadow:0 2px 12px #000; white-space:pre-line; text-align:center;
  `;
  overlay.textContent = text;
  document.getElementById("app")!.appendChild(overlay);
  overlay.addEventListener("click", () => {
    overlay.remove();
    onDone?.();
  });
}

function showMessageAsync(text: string, color: string): Promise<void> {
  return new Promise((resolve) => showMessage(text, color, resolve));
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

tick();

if (debugStairs) {
  setStairsMode(true);
  showStageTransitionOverlay();
}

// ── Music toggle ───────────────────────────────────────────────────────────────
const musicBtn = document.createElement("button");
musicBtn.style.cssText = `
  position:absolute; top:10px; right:10px; z-index:30;
  width:36px; height:36px; border-radius:50%;
  background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.25);
  color:#fff; font-size:16px; line-height:1; cursor:pointer;
  pointer-events:auto; touch-action:manipulation;
  display:flex; align-items:center; justify-content:center;
  overflow:hidden;
`;

const musicBtnCross = document.createElement("span");
musicBtnCross.style.cssText =
  "position:absolute;width:2px;height:130%;top:-15%;left:calc(50% - 1px);background:#ff6666;transform:rotate(45deg);border-radius:1px;pointer-events:none;";

function updateMusicBtn() {
  musicBtn.textContent = "♪";
  if (musicEnabled) {
    musicBtnCross.remove();
  } else {
    musicBtn.appendChild(musicBtnCross);
  }
  musicBtn.style.opacity = musicEnabled ? "1" : "0.7";
}
updateMusicBtn();
musicBtn.title = "Toggle music";
musicBtn.addEventListener("click", () => {
  musicEnabled = !musicEnabled;
  updateMusicBtn();
  if (musicEnabled) {
    if (appState.phase === "COMBAT" && appState.isBoss) {
      appState.dungeon.dungeon.bossMusic?.();
    } else {
      startBackgroundMusic();
    }
  } else {
    stopBossMusic();
    stopBackgroundMusic();
  }
});
document.getElementById("app")!.appendChild(musicBtn);

const startMusicOnce = () => {
  if (musicEnabled) startBackgroundMusic();
  window.removeEventListener("click", startMusicOnce);
  window.removeEventListener("touchstart", startMusicOnce);
  window.removeEventListener("keydown", startMusicOnce);
};
window.addEventListener("click", startMusicOnce);
window.addEventListener("touchstart", startMusicOnce);
window.addEventListener("keydown", startMusicOnce);

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
