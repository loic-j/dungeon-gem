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
} from "./audio/soundManager";
import {
  initCombat,
  processManaPhase,
  processPlayerAction,
  processMonsterPhase,
  checkCombatEnd,
  resetCombat,
} from "./game/turnMachine";

import type { GameState } from "./game/types";

type AppPhase = "EXPLORING" | "COMBAT";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const uiRoot = document.getElementById("ui") as HTMLDivElement;

let state: GameState = initCombat();
let appPhase: AppPhase = "EXPLORING";

const { objects, animateWalk } = initScene(canvas, state.monster);
let locked = false;

const { render, animatePlayerAttack, animateManaGain } = createOverlay(uiRoot, {
  onSpell: (spellId) => {
    if (!locked && appPhase === "COMBAT") act(spellId);
  },
  onSkip: () => {
    if (!locked && appPhase === "COMBAT") act(null);
  },
});

// ── Move arrow (center screen, always in DOM, shown only when EXPLORING) ──────
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

moveBtn.addEventListener("click", async () => {
  if (appPhase !== "EXPLORING" || locked) return;
  locked = true;
  moveBtn.style.display = "none";
  playFootstepSound();

  await animateWalk();

  if (Math.random() < 0.5) {
    appPhase = "EXPLORING";
    locked = false;
    moveBtn.style.display = "";
    tick();
  } else {
    appPhase = "COMBAT";
    state = resetCombat(state);
    objects.monsterSprite.visible = true;
    state.monster.appearSound();
    locked = false;
    tick();
  }
});

function tick() {
  const inCombat = appPhase === "COMBAT";
  render(state, locked, inCombat);
  objects.monsterSprite.visible = inCombat && state.monster.hp > 0;
}

async function act(spellId: string | null) {
  locked = true;

  if (spellId !== null) {
    const spell = state.player.spells.find((s) => s.id === spellId);
    if (spell) playSpellSound(spell.element);
    await animatePlayerAttack();
  }

  state = processPlayerAction(state, spellId);
  tick();

  await delay(100);

  if (checkCombatEnd(state) === "VICTORY") {
    handleVictory();
    return;
  }

  const { state: afterMonster, attacked } = processMonsterPhase(state);
  state = afterMonster;
  if (attacked) {
    state.monster.attackSound();
    await animateMonsterAttack(objects.monsterSprite);
    flashScreen();
  }
  tick();

  await delay(300);

  const outcome = checkCombatEnd(state);
  if (outcome === "GAME_OVER") {
    stopBackgroundMusic();
    playGameOverSound();
    showMessage("GAME OVER", "#c00");
    return;
  }
  if (outcome === "VICTORY") {
    handleVictory();
    return;
  }

  state = processManaPhase(state);
  locked = false;
  tick();
  animateManaGain(state.player.manaPool.length - 1);
}

function handleVictory() {
  playVictorySound();
  showMessage("Victory!", "#2b8", () => {
    appPhase = "EXPLORING";
    objects.monsterSprite.visible = false;
    locked = false;
    moveBtn.style.display = "";
    tick();
  });
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
  if (musicEnabled) startBackgroundMusic();
  else stopBackgroundMusic();
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
    getState: () => state,
    setState: (s: GameState) => {
      state = s;
      locked = false;
      tick();
    },
    isLocked: () => locked,
  };
}
