export function createStartScreen(options: {
  hasContinue: boolean;
  onNewGame(): void;
  onContinue(): void;
}): { element: HTMLDivElement; hide(): void } {
  const el = document.createElement("div");
  el.style.cssText =
    "position:absolute;inset:0;background:rgba(0,0,0,0.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:100;color:#fff;font-family:monospace;";

  const title = document.createElement("div");
  title.textContent = "ELEMENTAL DUNGEON";
  title.style.cssText =
    "font-size:22px;letter-spacing:3px;color:#e8c01a;margin-bottom:32px;font-weight:bold;text-align:center;";
  el.appendChild(title);

  function makeBtn(text: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement("button");
    b.textContent = text;
    b.style.cssText =
      "width:200px;padding:14px;background:rgba(255,255,255,0.1);border:2px solid rgba(255,255,255,0.35);color:#fff;font-size:15px;letter-spacing:2px;cursor:pointer;border-radius:4px;font-family:monospace;";
    b.addEventListener("mouseenter", () => {
      b.style.background = "rgba(255,255,255,0.2)";
      b.style.borderColor = "rgba(255,255,255,0.6)";
    });
    b.addEventListener("mouseleave", () => {
      b.style.background = "rgba(255,255,255,0.1)";
      b.style.borderColor = "rgba(255,255,255,0.35)";
    });
    b.addEventListener("click", onClick);
    return b;
  }

  if (options.hasContinue) {
    el.appendChild(makeBtn("CONTINUE", options.onContinue));
  }
  el.appendChild(makeBtn("NEW GAME", options.onNewGame));

  return {
    element: el,
    hide() {
      el.remove();
    },
  };
}
