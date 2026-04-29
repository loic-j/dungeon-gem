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
import {
  initCombat,
  processManaPhase,
  processPlayerAction,
  processMonsterPhase,
  checkCombatEnd,
  resetCombat,
} from "./game/turnMachine";
import { applyExperience } from "./game/experience";
import {
  initEncounterState,
  enterRoom,
  onEncounterFinished,
} from "./game/encounterSystem";
import type { EncounterState } from "./game/encounterSystem";
import {
  createDungeonProgress,
  getCurrentStage,
  isBossRoom,
  isStageComplete,
  isFinalStage,
  completeRoom,
  advanceToNextStage,
  resetDungeonProgress,
} from "./game/dungeon";
import type { DungeonProgress } from "./game/dungeon";
import { DUNGEON_1 } from "./game/data/dungeons";
import { findMonster, pickMonsterFromIds } from "./game/data/monsters";
import type { CombatState } from "./game/types";

type AppPhase = "EXPLORING" | "COMBAT" | "CHEST" | "STAGE_TRANSITION";

interface AppState {
  phase: AppPhase;
  encounter: EncounterState;
  combat: CombatState;
  dungeon: DungeonProgress;
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const uiRoot = document.getElementById("ui") as HTMLDivElement;

const initialDungeon = createDungeonProgress(DUNGEON_1);

let appState: AppState = {
  phase: "EXPLORING",
  encounter: initEncounterState(getCurrentStage(initialDungeon).encounterConfigs),
  combat: initCombat(),
  dungeon: initialDungeon,
};

let chestAnimPhase: "closed" | "open" = "closed";
let isBossFight = false;

const { objects, animateWalk } = initScene(
  canvas,
  appState.combat.monster.definition,
  DUNGEON_1.graphics,
);
let locked = false;

const {
  render,
  animatePlayerAttack,
  animateManaGain,
  showMonsterAttack,
  updateStageProgress,
  setBossMode,
} = createOverlay(uiRoot, {
  onSpell: (spellId) => {
    if (!locked && appState.phase === "COMBAT") act(spellId);
  },
  onSkip: () => {
    if (!locked && appState.phase === "COMBAT") act(null);
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
document.getElementById("app")!.appendChild(moveBtn);

// ── Chest click overlay ────────────────────────────────────────────────────────
const chestClickOverlay = document.createElement("div");
chestClickOverlay.style.cssText =
  "position:absolute;inset:0;z-index:4;pointer-events:none;cursor:pointer;";
document.getElementById("app")!.appendChild(chestClickOverlay);

chestClickOverlay.addEventListener("click", async () => {
  if (appState.phase !== "CHEST" || chestAnimPhase !== "closed") return;
  chestAnimPhase = "open";
  chestClickOverlay.style.pointerEvents = "none";
  objects.chestClosedSprite.visible = false;
  objects.chestOpenSprite.visible = true;
  await delay(500);
  showItemSelection();
});

moveBtn.addEventListener("click", async () => {
  if (appState.phase !== "EXPLORING" || locked) return;
  locked = true;
  moveBtn.style.display = "none";
  playFootstepSound();

  await animateWalk();

  // Boss room: skip random roll, force boss encounter
  if (isBossRoom(appState.dungeon)) {
    const bossMonsterDef = findMonster(appState.dungeon.dungeon.bossMonster);
    if (bossMonsterDef) {
      isBossFight = true;
      const combat = resetCombat(appState.combat, bossMonsterDef);
      appState = { ...appState, phase: "COMBAT", combat };
      objects.monsterSprite.visible = true;
      bossMonsterDef.appearSound();
      setBossMode(true, appState.dungeon.dungeon.bossTitle);
      appState.dungeon.dungeon.bossMusic?.();
      locked = false;
      tick();
      return;
    }
  }

  const { encounter, nextState: nextEncounterState } = enterRoom(appState.encounter);
  appState = { ...appState, encounter: nextEncounterState };

  if (encounter === "empty") {
    appState = { ...appState, phase: "EXPLORING", dungeon: completeRoom(appState.dungeon) };
    onRoomCompleted();
    locked = false;
    tick();
  } else if (encounter === "chest") {
    appState = { ...appState, phase: "CHEST" };
    chestAnimPhase = "closed";
    objects.chestClosedSprite.visible = true;
    chestClickOverlay.style.pointerEvents = "auto";
    locked = false;
    tick();
  } else {
    const stage = getCurrentStage(appState.dungeon);
    const monster = pickMonsterFromIds(stage.availableMonsters, appState.combat.player.level);
    const combat = resetCombat(appState.combat, monster);
    appState = { ...appState, phase: "COMBAT", combat };
    objects.monsterSprite.visible = true;
    appState.combat.monster.definition.appearSound();
    locked = false;
    tick();
  }
});

function onRoomCompleted() {
  if (isStageComplete(appState.dungeon)) {
    if (isFinalStage(appState.dungeon)) {
      handleDungeonComplete();
    } else {
      appState = { ...appState, phase: "STAGE_TRANSITION" };
      showStageTransition();
    }
  } else {
    moveBtn.style.display = "";
  }
}

function tick() {
  const inCombat = appState.phase === "COMBAT";
  render(appState.combat, locked, inCombat);
  objects.monsterSprite.visible = inCombat && appState.combat.monster.hp > 0;

  const stage = getCurrentStage(appState.dungeon);
  updateStageProgress(
    appState.dungeon.roomsCleared,
    stage.roomCount,
    appState.dungeon.currentStageIndex,
  );
}

const PLACEHOLDER_ITEMS = ["Health Potion", "Mana Crystal", "Ancient Scroll"];

function showItemSelection() {
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
      finishChestEncounter();
    });
    row.appendChild(card);
  }

  document.getElementById("app")!.appendChild(overlay);
}

function finishChestEncounter() {
  appState = {
    ...appState,
    phase: "EXPLORING",
    encounter: onEncounterFinished("chest", appState.encounter),
    dungeon: completeRoom(appState.dungeon),
  };
  objects.chestClosedSprite.visible = false;
  objects.chestOpenSprite.visible = false;
  onRoomCompleted();
  tick();
}

async function act(spellId: string | null) {
  locked = true;

  if (spellId !== null) {
    const spell = appState.combat.player.spells.find((s) => s.id === spellId);
    if (spell) playSpellSound(spell.element);
    await animatePlayerAttack();
  }

  appState = { ...appState, combat: processPlayerAction(appState.combat, spellId) };
  tick();

  await delay(100);

  if (checkCombatEnd(appState.combat) === "VICTORY") {
    handleVictory();
    return;
  }

  const { state: afterMonster, attacked, spell } = processMonsterPhase(appState.combat);
  appState = { ...appState, combat: afterMonster };
  if (attacked && spell) {
    appState.combat.monster.definition.attackSound();
    await animateMonsterAttack(objects.monsterSprite);
    flashScreen();
    showMonsterAttack(spell.name, spell.damage);
  }
  tick();

  await delay(300);

  const outcome = checkCombatEnd(appState.combat);
  if (outcome === "GAME_OVER") {
    appState = { ...appState, encounter: onEncounterFinished("monster", appState.encounter) };
    stopBossMusic();
    stopBackgroundMusic();
    if (musicEnabled) startBackgroundMusic();
    setBossMode(false);
    isBossFight = false;
    playGameOverSound();
    showMessage("GAME OVER", "#c00");
    return;
  }
  if (outcome === "VICTORY") {
    handleVictory();
    return;
  }

  appState = { ...appState, combat: processManaPhase(appState.combat) };
  locked = false;
  tick();
  animateManaGain(appState.combat.player.manaPool.length - 1);
}

function handleVictory() {
  appState = { ...appState, encounter: onEncounterFinished("monster", appState.encounter) };
  const xp = appState.combat.monster.definition.experienceReward;
  const prevLevel = appState.combat.player.level;
  appState = {
    ...appState,
    combat: { ...appState.combat, player: applyExperience(appState.combat.player, xp) },
    dungeon: completeRoom(appState.dungeon),
  };
  const leveledUp = appState.combat.player.level > prevLevel;

  const wasBoss = isBossFight;
  if (isBossFight) {
    stopBossMusic();
    setBossMode(false);
    isBossFight = false;
    if (musicEnabled) startBackgroundMusic();
  }

  playVictorySound();
  const msg = leveledUp
    ? `Victory!\n+${xp} XP\nLevel Up! → ${appState.combat.player.level}`
    : `Victory!\n+${xp} XP`;

  showMessage(msg, "#2b8", () => {
    appState = { ...appState, phase: "EXPLORING" };
    objects.monsterSprite.visible = false;
    locked = false;
    tick();

    if (wasBoss && isStageComplete(appState.dungeon)) {
      if (isFinalStage(appState.dungeon)) {
        handleDungeonComplete();
      } else {
        appState = { ...appState, phase: "STAGE_TRANSITION" };
        showStageTransition();
      }
    } else {
      moveBtn.style.display = "";
    }
  });
}

function handleDungeonComplete() {
  showMessage(
    `${appState.dungeon.dungeon.name}\nCOMPLETE!`,
    "#e8c01a",
    () => {
      const resetDungeon = resetDungeonProgress(appState.dungeon);
      appState = {
        ...appState,
        phase: "EXPLORING",
        dungeon: resetDungeon,
        encounter: initEncounterState(getCurrentStage(resetDungeon).encounterConfigs),
      };
      moveBtn.style.display = "";
      tick();
    },
  );
}

function showStageTransition() {
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:absolute; inset:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:24px;
    background:rgba(0,0,0,0.88); z-index:20; pointer-events:auto;
  `;

  const title = document.createElement("div");
  title.textContent = "Stage Complete!";
  title.style.cssText =
    "font-family:sans-serif; font-size:26px; font-weight:bold; color:#e8c01a; text-shadow:0 2px 8px #000; letter-spacing:2px;";
  overlay.appendChild(title);

  overlay.appendChild(makeStairsSvg());

  const descBtn = document.createElement("button");
  descBtn.textContent = "↓ Descend";
  descBtn.style.cssText = `
    padding:14px 36px; border-radius:8px; font-size:20px; font-weight:bold;
    background:#1a1208; border:2px solid #b8901a; color:#f0c040;
    cursor:pointer; pointer-events:auto; touch-action:manipulation;
    transition:border-color 0.15s, background 0.15s;
  `;
  descBtn.addEventListener("mouseenter", () => {
    descBtn.style.borderColor = "#ffd700";
    descBtn.style.background = "#2a1e0a";
  });
  descBtn.addEventListener("mouseleave", () => {
    descBtn.style.borderColor = "#b8901a";
    descBtn.style.background = "#1a1208";
  });
  descBtn.addEventListener("click", () => {
    overlay.remove();
    const nextDungeon = advanceToNextStage(appState.dungeon);
    appState = {
      ...appState,
      phase: "EXPLORING",
      dungeon: nextDungeon,
      encounter: initEncounterState(getCurrentStage(nextDungeon).encounterConfigs),
    };
    moveBtn.style.display = "";
    tick();
  });
  overlay.appendChild(descBtn);

  document.getElementById("app")!.appendChild(overlay);
}

function makeStairsSvg(): SVGSVGElement {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "120");
  svg.setAttribute("height", "90");
  svg.setAttribute("viewBox", "0 0 120 90");
  const steps = 5;
  const stepW = 20;
  const stepH = 14;
  for (let i = 0; i < steps; i++) {
    const x = i * stepW;
    const y = i * stepH;
    const tread = document.createElementNS(ns, "rect");
    tread.setAttribute("x", String(x));
    tread.setAttribute("y", String(y));
    tread.setAttribute("width", String(120 - x));
    tread.setAttribute("height", "3");
    tread.setAttribute("fill", "#b8901a");
    const riser = document.createElementNS(ns, "rect");
    riser.setAttribute("x", String(x));
    riser.setAttribute("y", String(y));
    riser.setAttribute("width", "3");
    riser.setAttribute("height", String(90 - y));
    riser.setAttribute("fill", "#7a5e10");
    svg.append(tread, riser);
  }
  return svg;
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

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

tick();

// ── Music toggle ───────────────────────────────────────────────────────────────
let musicEnabled = true;

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
    if (isBossFight) appState.dungeon.dungeon.bossMusic?.();
    else startBackgroundMusic();
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
      locked = false;
      tick();
    },
    isLocked: () => locked,
  };
}
