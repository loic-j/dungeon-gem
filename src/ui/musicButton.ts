import { startBackgroundMusic } from "../audio/soundManager";

export function createMusicButton(options: {
  onEnable(): void;
  onDisable(): void;
}): {
  element: HTMLButtonElement;
  isEnabled(): boolean;
  startOnInteraction(): void;
} {
  let enabled = true;

  const btn = document.createElement("button");
  btn.style.cssText =
    "position:absolute;top:10px;right:10px;z-index:30;width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.25);color:#fff;font-size:16px;line-height:1;cursor:pointer;pointer-events:auto;touch-action:manipulation;display:flex;align-items:center;justify-content:center;overflow:hidden;";

  const cross = document.createElement("span");
  cross.style.cssText =
    "position:absolute;width:2px;height:130%;top:-15%;left:calc(50% - 1px);background:#ff6666;transform:rotate(45deg);border-radius:1px;pointer-events:none;";

  function syncUI() {
    btn.textContent = "♪";
    if (enabled) cross.remove();
    else btn.appendChild(cross);
    btn.style.opacity = enabled ? "1" : "0.7";
  }

  syncUI();
  btn.title = "Toggle music";
  btn.addEventListener("click", () => {
    enabled = !enabled;
    syncUI();
    if (enabled) options.onEnable();
    else options.onDisable();
  });

  function startOnInteraction() {
    const handler = () => {
      if (enabled) startBackgroundMusic();
      window.removeEventListener("click", handler);
      window.removeEventListener("touchstart", handler);
      window.removeEventListener("keydown", handler);
    };
    window.addEventListener("click", handler);
    window.addEventListener("touchstart", handler);
    window.addEventListener("keydown", handler);
  }

  return { element: btn, isEnabled: () => enabled, startOnInteraction };
}
