function root(): HTMLElement {
  return document.getElementById("app")!;
}

export function flashScreen(): void {
  const flash = document.createElement("div");
  flash.style.cssText =
    "position:absolute;inset:0;background:rgba(200,0,0,0.35);pointer-events:none;z-index:10;animation:flash 0.4s ease-out forwards;";
  const style = document.createElement("style");
  style.textContent = "@keyframes flash{from{opacity:1}to{opacity:0}}";
  document.head.appendChild(style);
  root().appendChild(flash);
  setTimeout(() => flash.remove(), 400);
}

export function showMessageAsync(text: string, color: string): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);z-index:20;pointer-events:auto;cursor:pointer;font-family:sans-serif;font-size:40px;font-weight:bold;color:${color};text-shadow:0 2px 12px #000;white-space:pre-line;text-align:center;`;
    overlay.textContent = text;
    root().appendChild(overlay);
    overlay.addEventListener("click", () => {
      overlay.remove();
      resolve();
    });
  });
}

let blackOverlay: HTMLElement | null = null;

export function fadeToBlack(ms = 300): Promise<void> {
  return new Promise((resolve) => {
    blackOverlay?.remove();
    blackOverlay = document.createElement("div");
    blackOverlay.style.cssText = `position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:30;transition:opacity ${ms}ms ease-in;`;
    root().appendChild(blackOverlay);
    requestAnimationFrame(() => {
      blackOverlay!.style.opacity = "1";
      setTimeout(resolve, ms);
    });
  });
}

export function fadeFromBlack(ms = 300): Promise<void> {
  return new Promise((resolve) => {
    if (!blackOverlay) {
      resolve();
      return;
    }
    blackOverlay.style.transition = `opacity ${ms}ms ease-out`;
    blackOverlay.style.opacity = "0";
    setTimeout(() => {
      blackOverlay?.remove();
      blackOverlay = null;
      resolve();
    }, ms);
  });
}

let activeTransition: HTMLElement | null = null;

export function showStageTransitionOverlay(): void {
  activeTransition?.remove();
  activeTransition = document.createElement("div");
  activeTransition.style.cssText =
    "position:absolute;top:0;left:0;right:0;padding:24px 16px 12px;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;z-index:4;";

  const title = document.createElement("div");
  title.textContent = "Stage Complete!";
  title.style.cssText =
    "font-family:sans-serif;font-size:26px;font-weight:bold;color:#e8c01a;text-shadow:0 2px 10px #000;letter-spacing:2px;";
  activeTransition.appendChild(title);

  const hint = document.createElement("div");
  hint.textContent = "Descend...";
  hint.style.cssText =
    "font-family:sans-serif;font-size:15px;color:rgba(255,255,255,0.5);letter-spacing:1px;text-shadow:0 1px 6px #000;";
  activeTransition.appendChild(hint);

  root().appendChild(activeTransition);
}

export function removeStageTransitionOverlay(): void {
  activeTransition?.remove();
  activeTransition = null;
}
