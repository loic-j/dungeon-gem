import type { Spell, SpellManaCost, Element } from "../game/types";
import type { SpellLearnState } from "../game/appState";

const ELEMENT_COLOR: Record<Element, string> = {
  fire: "#e84a1a",
  water: "#1a7ae8",
  nature: "#2db84b",
  lightning: "#e8c01a",
};

const ELEMENT_BG: Record<Element, string> = {
  fire: "rgba(232,74,26,0.15)",
  water: "rgba(26,122,232,0.15)",
  nature: "rgba(45,184,75,0.15)",
  lightning: "rgba(232,192,26,0.15)",
};

export interface SpellLearnCallbacks {
  onLearn: (spellId: string, replaceId?: string) => void;
  onSkip: () => void;
}

export interface SpellLearnControls {
  show: (state: SpellLearnState) => void;
  hide: () => void;
}

export function createSpellLearnUI(
  container: HTMLElement,
  callbacks: SpellLearnCallbacks,
): SpellLearnControls {
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(0,0,0,0.88);z-index:25;pointer-events:auto;font-family:sans-serif;padding:16px;box-sizing:border-box;";
  container.appendChild(overlay);

  function show(state: SpellLearnState): void {
    overlay.style.display = "flex";
    overlay.replaceChildren();
    renderChoices(state);
  }

  function hide(): void {
    overlay.style.display = "none";
    overlay.replaceChildren();
  }

  function renderChoices(state: SpellLearnState): void {
    const title = document.createElement("div");
    title.textContent = "✨ Level Up — Choose a Spell";
    title.style.cssText =
      "font-size:20px;font-weight:bold;color:#e8c01a;text-shadow:0 2px 10px #000;letter-spacing:1px;text-align:center;";
    overlay.appendChild(title);

    const cardsRow = document.createElement("div");
    cardsRow.style.cssText =
      "display:flex;gap:10px;justify-content:center;flex-wrap:wrap;width:100%;max-width:440px;";
    overlay.appendChild(cardsRow);

    for (const spell of state.choices) {
      cardsRow.appendChild(
        makeSpellCard(spell, () => onSpellChosen(spell, state)),
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

  function onSpellChosen(spell: Spell, state: SpellLearnState): void {
    if (state.player.spells.length < 4) {
      callbacks.onLearn(spell.id);
    } else {
      renderReplaceView(spell, state);
    }
  }

  function renderReplaceView(newSpell: Spell, state: SpellLearnState): void {
    overlay.replaceChildren();

    const title = document.createElement("div");
    title.style.cssText =
      "font-size:18px;font-weight:bold;color:#e8c01a;text-align:center;margin-bottom:4px;";
    title.textContent = "Spell book full — replace which spell?";
    overlay.appendChild(title);

    const sub = document.createElement("div");
    sub.style.cssText =
      "font-size:13px;color:#888;text-align:center;margin-bottom:8px;";
    sub.textContent = `Learning: ${newSpell.name}`;
    overlay.appendChild(sub);

    const list = document.createElement("div");
    list.style.cssText =
      "display:flex;flex-direction:column;gap:8px;width:100%;max-width:300px;";
    overlay.appendChild(list);

    for (const existing of state.player.spells) {
      const btn = makeSpellCard(existing, () =>
        callbacks.onLearn(newSpell.id, existing.id),
      );
      list.appendChild(btn);
    }

    const backBtn = document.createElement("button");
    backBtn.textContent = "← Back";
    backBtn.style.cssText =
      "margin-top:4px;padding:10px 24px;background:transparent;border:1px solid #444;border-radius:6px;color:#888;font-size:15px;cursor:pointer;pointer-events:auto;touch-action:manipulation;";
    backBtn.addEventListener("mouseenter", () => {
      backBtn.style.borderColor = "#888";
      backBtn.style.color = "#bbb";
    });
    backBtn.addEventListener("mouseleave", () => {
      backBtn.style.borderColor = "#444";
      backBtn.style.color = "#888";
    });
    backBtn.addEventListener("click", () => {
      overlay.replaceChildren();
      renderChoices(state);
    });
    overlay.appendChild(backBtn);
  }

  function confirmSkip(state: SpellLearnState): void {
    overlay.replaceChildren();

    const msg = document.createElement("div");
    msg.textContent = "Skip this spell offer?";
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

function makeSpellCard(spell: Spell, onClick: () => void): HTMLElement {
  const color = spell.element ? ELEMENT_COLOR[spell.element] : "#aaa";
  const bg = spell.element
    ? ELEMENT_BG[spell.element]
    : "rgba(100,100,100,0.1)";

  const card = document.createElement("button");
  card.style.cssText = `
    flex:1; min-width:110px; max-width:140px;
    padding:12px 10px; border-radius:8px;
    background:${bg}; border:1px solid ${color};
    color:#eee; cursor:pointer; pointer-events:auto;
    touch-action:manipulation; text-align:left;
    display:flex; flex-direction:column; gap:6px;
    transition:background 0.15s, border-color 0.15s;
  `;
  card.addEventListener("mouseenter", () => {
    card.style.background = spell.element
      ? ELEMENT_BG[spell.element].replace("0.15", "0.3")
      : "rgba(100,100,100,0.22)";
    card.style.borderColor = spell.element ? color : "#ccc";
  });
  card.addEventListener("mouseleave", () => {
    card.style.background = bg;
    card.style.borderColor = color;
  });
  card.addEventListener("click", onClick);

  // Header: icon + name
  const header = document.createElement("div");
  header.style.cssText = "display:flex;align-items:center;gap:6px;";
  if (spell.element) {
    const icon = document.createElement("img");
    icon.src = `/sprites/mana-${spell.element}.svg`;
    icon.style.cssText = "width:18px;height:18px;flex-shrink:0;";
    header.appendChild(icon);
  }
  const name = document.createElement("span");
  name.textContent = spell.name;
  name.style.cssText = `font-size:15px;font-weight:bold;color:${color};`;
  header.appendChild(name);
  card.appendChild(header);

  // Damage
  if (spell.damage > 0) {
    const dmg = document.createElement("div");
    dmg.textContent = `${spell.damage} dmg`;
    dmg.style.cssText = "font-size:13px;opacity:0.7;";
    card.appendChild(dmg);
  }

  // Mana cost
  const costRow = document.createElement("div");
  costRow.style.cssText =
    "display:flex;gap:3px;align-items:center;flex-wrap:wrap;";
  for (const token of spell.manaCost) {
    costRow.appendChild(makeManaIcon(token));
  }
  card.appendChild(costRow);

  // Effect
  if (spell.effect) {
    const eff = document.createElement("div");
    eff.textContent = formatEffect(spell.effect);
    eff.style.cssText = `font-size:12px;opacity:0.8;color:${color};`;
    card.appendChild(eff);
  }

  return card;
}

function makeManaIcon(token: SpellManaCost): HTMLElement {
  if (token === "any") {
    const el = document.createElement("span");
    el.style.cssText =
      "display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;border:1px solid #888;font-size:10px;color:#aaa;flex-shrink:0;";
    el.textContent = "?";
    return el;
  }
  const img = document.createElement("img");
  img.src = `/sprites/mana-${token}.svg`;
  img.style.cssText = "width:16px;height:16px;flex-shrink:0;";
  return img;
}

function formatEffect(effect: NonNullable<Spell["effect"]>): string {
  switch (effect.type) {
    case "burn":
      return `🔥 Burn ${effect.damage}/turn`;
    case "shield":
      return `🛡 Shield ${effect.amount}`;
    case "amplify":
      return `⚡ Amplify +${effect.bonus}`;
    case "heal":
      return `💚 Heal +${effect.amount}`;
    case "poison":
      return `☠ Poison ${effect.damage}×${effect.turns}`;
    case "regen":
      return `💚 Regen +${effect.amount}×${effect.turns}`;
    case "stun":
      return `💫 Stun`;
    case "slow":
      return `🐢 Slow ×${effect.turns}`;
  }
}
