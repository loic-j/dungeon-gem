import type { AppState } from "../game/appState";

export function createDebugPanel(root: HTMLElement): {
  update(state: AppState): void;
} {
  let currentState: AppState | null = null;

  const btn = document.createElement("button");
  btn.textContent = "{}";
  btn.title = "Debug: show app state";
  btn.style.cssText =
    "position:absolute;top:54px;right:10px;z-index:30;width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.5);border:1px solid rgba(255,200,0,0.5);color:#fc0;font-size:11px;font-family:monospace;font-weight:bold;cursor:pointer;pointer-events:auto;touch-action:manipulation;";

  const overlay = document.createElement("div");
  overlay.style.cssText =
    "display:none;position:absolute;inset:0;z-index:100;background:rgba(0,0,0,0.75);pointer-events:auto;";

  const panel = document.createElement("div");
  panel.style.cssText =
    "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-height:80%;background:#111;border:1px solid rgba(255,200,0,0.4);border-radius:6px;overflow:hidden;display:flex;flex-direction:column;";

  const header = document.createElement("div");
  header.style.cssText =
    "display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:#1a1a1a;border-bottom:1px solid rgba(255,200,0,0.2);flex-shrink:0;";

  const title = document.createElement("span");
  title.textContent = "App State";
  title.style.cssText = "color:#fc0;font-family:monospace;font-size:13px;";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.style.cssText =
    "background:none;border:none;color:#aaa;font-size:16px;cursor:pointer;padding:0 4px;line-height:1;";

  header.appendChild(title);
  header.appendChild(closeBtn);

  const pre = document.createElement("pre");
  pre.style.cssText =
    "margin:0;padding:12px;color:#0f0;font-family:monospace;font-size:11px;line-height:1.5;overflow:auto;flex:1;white-space:pre-wrap;word-break:break-all;";

  panel.appendChild(header);
  panel.appendChild(pre);
  overlay.appendChild(panel);
  root.appendChild(btn);
  root.appendChild(overlay);

  function open() {
    pre.textContent = JSON.stringify(currentState, null, 2);
    overlay.style.display = "block";
  }

  function close() {
    overlay.style.display = "none";
  }

  btn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  return {
    update(state: AppState) {
      currentState = state;
    },
  };
}
