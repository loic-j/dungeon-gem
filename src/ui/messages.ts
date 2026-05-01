const PLACEHOLDER_ITEMS = ["Health Potion", "Mana Crystal", "Ancient Scroll"];

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

export function showItemSelectionAsync(): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(0,0,0,0.75);z-index:20;pointer-events:auto;";

    const title = document.createElement("div");
    title.textContent = "Choose an item";
    title.style.cssText =
      "font-family:sans-serif;font-size:22px;font-weight:bold;color:#f0c040;text-shadow:0 2px 8px #000;letter-spacing:1px;";
    overlay.appendChild(title);

    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:12px;";
    overlay.appendChild(row);

    for (const name of PLACEHOLDER_ITEMS) {
      const card = document.createElement("button");
      card.style.cssText =
        "width:100px;padding:14px 8px;border-radius:8px;background:rgba(20,14,4,0.92);border:2px solid #b8901a;color:#f0c040;font-family:sans-serif;font-size:13px;font-weight:bold;cursor:pointer;pointer-events:auto;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:10px;transition:border-color 0.15s,background 0.15s;";
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
        "width:48px;height:48px;border-radius:6px;background:rgba(184,144,26,0.2);border:1px solid #b8901a;";
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

    root().appendChild(overlay);
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
