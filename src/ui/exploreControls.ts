import type { AppState } from "../game/appState";

export function createExploreControls(options: {
  getPhase(): AppState["phase"];
  onMoveForward(): void;
  onOpenChest(): void;
}): {
  moveButton: HTMLButtonElement;
  chestOverlay: HTMLDivElement;
  sync(phase: AppState["phase"], isDispatching: boolean): void;
} {
  const moveBtn = document.createElement("button");
  moveBtn.textContent = "↑";
  moveBtn.style.cssText =
    "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.25);color:#fff;font-size:36px;line-height:1;cursor:pointer;pointer-events:auto;touch-action:manipulation;z-index:5;display:flex;align-items:center;justify-content:center;transition:background 0.15s,border-color 0.15s;";
  moveBtn.addEventListener("mouseenter", () => {
    moveBtn.style.background = "rgba(255,255,255,0.18)";
    moveBtn.style.borderColor = "rgba(255,255,255,0.5)";
  });
  moveBtn.addEventListener("mouseleave", () => {
    moveBtn.style.background = "rgba(255,255,255,0.08)";
    moveBtn.style.borderColor = "rgba(255,255,255,0.25)";
  });
  moveBtn.addEventListener("click", () => {
    const phase = options.getPhase();
    if (phase === "EXPLORING" || phase === "STAGE_TRANSITION")
      options.onMoveForward();
  });

  const chestOverlay = document.createElement("div");
  chestOverlay.style.cssText =
    "position:absolute;inset:0;z-index:4;pointer-events:none;cursor:pointer;";
  chestOverlay.addEventListener("click", () => {
    if (options.getPhase() === "CHEST") options.onOpenChest();
  });

  function sync(phase: AppState["phase"], isDispatching: boolean) {
    moveBtn.style.display =
      (phase === "EXPLORING" || phase === "STAGE_TRANSITION") && !isDispatching
        ? ""
        : "none";
    chestOverlay.style.pointerEvents =
      phase === "CHEST" && !isDispatching ? "auto" : "none";
  }

  return { moveButton: moveBtn, chestOverlay, sync };
}
