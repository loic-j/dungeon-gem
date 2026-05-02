import type { RewardDefinition, RewardTier } from "../game/types";
import type { RewardSelectionState } from "../game/appState";

const TIER_COLOR: Record<RewardTier, string> = {
  1: "#888",
  2: "#4a9eff",
  3: "#e8c01a",
};

const TIER_LABEL: Record<RewardTier, string> = {
  1: "Common",
  2: "Uncommon",
  3: "Rare",
};

export interface RewardSelectionCallbacks {
  onSelect: (rewardId: string) => void;
  onSkip: () => void;
}

export interface RewardSelectionControls {
  show: (state: RewardSelectionState) => void;
  hide: () => void;
}

export function createRewardSelectionUI(
  container: HTMLElement,
  callbacks: RewardSelectionCallbacks,
): RewardSelectionControls {
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(0,0,0,0.88);z-index:25;pointer-events:auto;font-family:sans-serif;padding:16px;box-sizing:border-box;";
  container.appendChild(overlay);

  function show(state: RewardSelectionState): void {
    overlay.style.display = "flex";
    overlay.replaceChildren();
    renderChoices(state);
  }

  function hide(): void {
    overlay.style.display = "none";
    overlay.replaceChildren();
  }

  function renderChoices(state: RewardSelectionState): void {
    const title = document.createElement("div");
    title.textContent = "🎁 Choose a Reward";
    title.style.cssText =
      "font-size:20px;font-weight:bold;color:#e8c01a;text-shadow:0 2px 10px #000;letter-spacing:1px;text-align:center;";
    overlay.appendChild(title);

    const cardsRow = document.createElement("div");
    cardsRow.style.cssText =
      "display:flex;gap:10px;justify-content:center;flex-wrap:wrap;width:100%;max-width:440px;";
    overlay.appendChild(cardsRow);

    for (const reward of state.rewards) {
      cardsRow.appendChild(
        makeRewardCard(reward, () => callbacks.onSelect(reward.id)),
      );
    }

    const skipBtn = document.createElement("button");
    skipBtn.textContent = "Skip";
    skipBtn.style.cssText =
      "margin-top:4px;padding:10px 28px;background:transparent;border:1px solid #444;border-radius:6px;color:#888;font-size:15px;cursor:pointer;pointer-events:auto;touch-action:manipulation;";
    skipBtn.addEventListener("mouseenter", () => {
      skipBtn.style.borderColor = "#888";
      skipBtn.style.color = "#bbb";
    });
    skipBtn.addEventListener("mouseleave", () => {
      skipBtn.style.borderColor = "#444";
      skipBtn.style.color = "#888";
    });
    skipBtn.addEventListener("click", () => confirmSkip(state));
    overlay.appendChild(skipBtn);
  }

  function confirmSkip(state: RewardSelectionState): void {
    overlay.replaceChildren();

    const msg = document.createElement("div");
    msg.textContent = "Skip this reward?";
    msg.style.cssText =
      "font-size:19px;font-weight:bold;color:#eee;text-align:center;";
    overlay.appendChild(msg);

    const sub = document.createElement("div");
    sub.textContent = "The offer will be lost.";
    sub.style.cssText =
      "font-size:14px;color:#888;text-align:center;margin-top:4px;";
    overlay.appendChild(sub);

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:12px;margin-top:16px;";
    overlay.appendChild(btnRow);

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Yes, skip";
    confirmBtn.style.cssText =
      "padding:12px 24px;background:rgba(180,50,50,0.2);border:1px solid #c44;border-radius:6px;color:#e88;font-size:16px;cursor:pointer;pointer-events:auto;touch-action:manipulation;";
    confirmBtn.addEventListener("click", () => callbacks.onSkip());
    btnRow.appendChild(confirmBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Go back";
    cancelBtn.style.cssText =
      "padding:12px 24px;background:transparent;border:1px solid #555;border-radius:6px;color:#aaa;font-size:16px;cursor:pointer;pointer-events:auto;touch-action:manipulation;";
    cancelBtn.addEventListener("click", () => {
      overlay.replaceChildren();
      renderChoices(state);
    });
    btnRow.appendChild(cancelBtn);
  }

  return { show, hide };
}

function makeRewardCard(
  reward: RewardDefinition,
  onClick: () => void,
): HTMLElement {
  const color = TIER_COLOR[reward.tier];

  const card = document.createElement("button");
  card.style.cssText = `
    flex:1; min-width:110px; max-width:140px;
    padding:14px 10px; border-radius:8px;
    background:rgba(10,8,4,0.92); border:1px solid ${color};
    color:#eee; cursor:pointer; pointer-events:auto;
    touch-action:manipulation; text-align:center;
    display:flex; flex-direction:column; align-items:center; gap:8px;
    transition:background 0.15s, border-color 0.15s;
  `;
  card.addEventListener("mouseenter", () => {
    card.style.background = "rgba(30,22,8,0.95)";
    card.style.borderColor = color === TIER_COLOR[3] ? "#ffd700" : color;
  });
  card.addEventListener("mouseleave", () => {
    card.style.background = "rgba(10,8,4,0.92)";
    card.style.borderColor = color;
  });
  card.addEventListener("click", onClick);

  const iconEl = document.createElement("div");
  iconEl.textContent = reward.icon;
  iconEl.style.cssText = "font-size:32px;line-height:1;";
  card.appendChild(iconEl);

  const nameEl = document.createElement("div");
  nameEl.textContent = reward.name;
  nameEl.style.cssText = `font-size:13px;font-weight:bold;color:${color};line-height:1.2;`;
  card.appendChild(nameEl);

  const descEl = document.createElement("div");
  descEl.textContent = reward.description;
  descEl.style.cssText =
    "font-size:11px;color:#aaa;line-height:1.3;text-align:center;";
  card.appendChild(descEl);

  const tierEl = document.createElement("div");
  tierEl.textContent = TIER_LABEL[reward.tier];
  tierEl.style.cssText = `font-size:10px;color:${color};opacity:0.7;letter-spacing:1px;text-transform:uppercase;margin-top:2px;`;
  card.appendChild(tierEl);

  return card;
}
