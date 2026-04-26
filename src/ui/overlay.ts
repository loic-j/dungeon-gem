import type { GameState, ManaToken } from "../game/types";
import { canCastSpell } from "../game/mana";

const ELEMENT_COLOR: Record<ManaToken, string> = {
  fire: "#e84a1a",
  water: "#1a7ae8",
  nature: "#2db84b",
  lightning: "#e8c01a",
};

export interface OverlayCallbacks {
  onSpell: (spellId: string) => void;
  onSkip: () => void;
}

export interface OverlayControls {
  render: (state: GameState, locked: boolean) => void;
  animatePlayerAttack: () => Promise<void>;
  animateManaGain: (index: number) => void;
}

export function createOverlay(
  container: HTMLElement,
  callbacks: OverlayCallbacks,
): OverlayControls {
  container.style.cssText =
    "pointer-events:none; display:flex; flex-direction:column; height:100%; font-family:sans-serif; color:#fff;";

  // ── Top: enemy info ────────────────────────────────────────────────────────
  const topBar = div(`position:absolute; top:0; left:0; right:0;
    padding:12px 14px; display:flex; flex-direction:column; gap:2px; pointer-events:none;`);

  const enemyHpWrapper = div(
    "display:flex; flex-direction:column; gap:3px; max-width:160px;",
  );
  const enemyHpLabel = span(
    "font-size:15px; font-weight:bold; text-shadow:0 1px 4px #000;",
  );
  enemyHpLabel.dataset["testid"] = "enemy-hp";
  const enemyHpBar = div(
    "width:100%; height:8px; background:#333; border-radius:4px; overflow:hidden;",
  );
  const enemyHpFill = div(
    "height:100%; border-radius:4px; transition:width .3s, background .3s; width:100%; background:#2db84b;",
  );
  enemyHpBar.appendChild(enemyHpFill);
  enemyHpWrapper.append(enemyHpLabel, enemyHpBar);

  const enemyLvlLabel = span(
    "font-size:13px; opacity:0.8; text-shadow:0 1px 4px #000;",
  );

  const dangerWrap = div(
    "margin-top:6px; display:flex; align-items:center; gap:6px;",
  );
  const dangerLabel = span("font-size:11px; opacity:0.7;");
  dangerLabel.textContent = "Danger";
  const dangerBar = div(
    "flex:1; max-width:100px; height:6px; background:#333; border-radius:3px; overflow:hidden;",
  );
  const dangerFill = div(
    "height:100%; background:#e84a1a; border-radius:3px; transition:width .3s; width:0%;",
  );
  dangerFill.dataset["testid"] = "danger-fill";
  dangerBar.appendChild(dangerFill);
  dangerWrap.append(dangerLabel, dangerBar);
  topBar.append(enemyHpWrapper, enemyLvlLabel, dangerWrap);
  container.appendChild(topBar);

  // ── Bottom: combat controls ────────────────────────────────────────────────
  const bottom = div(`position:absolute; bottom:0; left:0; right:0; height:48%;
    display:flex; pointer-events:none;
    background:linear-gradient(to top, rgba(0,0,0,0.88) 60%, transparent);`);

  // Left: character placeholder + skip
  const leftCol = div(`width:45%; display:flex; flex-direction:column;
    align-items:center; justify-content:flex-end; padding:0 8px 14px 10px;`);

  const charOval = document.createElement("img");
  charOval.src = "/sprites/player-mage2.png";
  charOval.style.cssText =
    "flex-shrink:0; height:400px; width:auto; filter:drop-shadow(0 2px 8px rgba(0,0,0,0.8));";

  const skipBtn = document.createElement("button");
  skipBtn.textContent = "Skip turn";
  skipBtn.style.cssText = `width:100%; padding:10px 0; background:#222; border:1px solid #555;
    border-radius:6px; color:#ccc; font-size:14px; cursor:pointer; pointer-events:auto;
    touch-action:manipulation;`;
  skipBtn.dataset["testid"] = "skip-btn";
  skipBtn.addEventListener("click", () => callbacks.onSkip());
  leftCol.append(charOval, skipBtn);

  // Right: HP / Level / Mana / Spells
  const rightCol = div(`width:55%; display:flex; flex-direction:column;
    padding:0 10px 14px 6px; gap:6px; justify-content:flex-end;`);
  const hpWrapper = div("display:flex; flex-direction:column; gap:3px;");
  const playerHpLabel = div("font-size:15px; font-weight:bold;");
  playerHpLabel.dataset["testid"] = "player-hp";
  const hpBar = div(
    "width:100%; height:8px; background:#333; border-radius:4px; overflow:hidden;",
  );
  const hpFill = div(
    "height:100%; border-radius:4px; transition:width .3s, background .3s; width:100%; background:#2db84b;",
  );
  hpBar.appendChild(hpFill);
  hpWrapper.append(playerHpLabel, hpBar);

  const playerLvlLabel = div("font-size:13px; opacity:0.7;");
  const manaRow = div("display:flex; gap:5px; flex-wrap:wrap;");
  manaRow.dataset["testid"] = "mana-row";
  const spellsCol = div("display:flex; flex-direction:column; gap:5px;");
  rightCol.append(hpWrapper, playerLvlLabel, manaRow, spellsCol);

  bottom.append(leftCol, rightCol);
  container.appendChild(bottom);

  // ── Render ─────────────────────────────────────────────────────────────────
  function render(state: GameState, locked: boolean) {
    const { player, monster } = state;

    enemyHpLabel.textContent = `Enemy HP: ${monster.hp} / ${monster.maxHp}`;
    const enemyHpRatio = Math.max(0, monster.hp / monster.maxHp);
    enemyHpFill.style.width = `${Math.round(enemyHpRatio * 100)}%`;
    enemyHpFill.style.background =
      enemyHpRatio > 0.5
        ? "#2db84b"
        : enemyHpRatio > 0.25
          ? "#e8c01a"
          : "#e84a1a";
    enemyLvlLabel.textContent = "Level 1";
    const prob = Math.min(1, monster.actionPoints / monster.threshold);
    dangerFill.style.width = `${Math.round(prob * 100)}%`;

    playerHpLabel.textContent = `HP: ${player.hp} / ${player.maxHp}`;
    const hpRatio = Math.max(0, player.hp / player.maxHp);
    hpFill.style.width = `${Math.round(hpRatio * 100)}%`;
    hpFill.style.background =
      hpRatio > 0.5 ? "#2db84b" : hpRatio > 0.25 ? "#e8c01a" : "#e84a1a";
    playerLvlLabel.textContent = `Level ${player.level}`;

    // Mana circles
    manaRow.replaceChildren();
    for (let i = 0; i < player.maxMana; i++) {
      const token = player.manaPool[i];
      const img = document.createElement("img");
      img.src = token
        ? `/sprites/mana-${token}.svg`
        : "/sprites/mana-empty.svg";
      img.style.cssText = "width:26px; height:26px;";
      manaRow.appendChild(img);
    }

    // Spell buttons
    spellsCol.replaceChildren();
    for (const spell of player.spells) {
      const castable = !locked && canCastSpell(player.manaPool, spell.manaCost);
      const color = ELEMENT_COLOR[spell.element];

      const btn = document.createElement("button");
      btn.style.cssText = `width:100%; padding:8px 10px; text-align:left;
        background:${castable ? "#1a2a3a" : "#111"};
        border:1px solid ${castable ? color : "#333"};
        border-radius:5px; color:${castable ? "#fff" : "#555"};
        font-size:13px; cursor:${castable ? "pointer" : "default"};
        pointer-events:${castable ? "auto" : "none"};
        touch-action:manipulation;
        display:flex; justify-content:space-between; align-items:center;`;

      const dot = div(`display:inline-block; width:10px; height:10px;
        border-radius:50%; background:${color}; margin-right:6px; flex-shrink:0;`);

      const nameSpan = span("");
      nameSpan.style.display = "flex";
      nameSpan.style.alignItems = "center";
      nameSpan.appendChild(dot);
      nameSpan.appendChild(document.createTextNode(spell.name));

      const dmgSpan = span("opacity:0.6; font-size:11px;");
      dmgSpan.textContent = `${spell.damage} dmg`;

      btn.dataset["testid"] = `spell-${spell.id}`;
      btn.append(nameSpan, dmgSpan);
      if (castable)
        btn.addEventListener("click", () => callbacks.onSpell(spell.id));
      spellsCol.appendChild(btn);
    }

    skipBtn.style.opacity = locked ? "0.4" : "1";
    skipBtn.style.pointerEvents = locked ? "none" : "auto";
  }

  function animateManaGain(index: number): void {
    const circle = manaRow.children[index] as HTMLElement | undefined;
    if (!circle) return;
    circle.animate(
      [
        { transform: "scale(1)", filter: "brightness(1)", offset: 0 },
        { transform: "scale(1.6)", filter: "brightness(2.2)", offset: 0.35 },
        { transform: "scale(1)", filter: "brightness(1)", offset: 1 },
      ],
      { duration: 420, easing: "ease-out" },
    );
  }

  async function animatePlayerAttack(): Promise<void> {
    const anim = charOval.animate(
      [
        { transform: "translate(0px, 0px)", offset: 0 },
        { transform: "translate(-14px, 10px)", offset: 0.28 },
        { transform: "translate(60px, -48px)", offset: 0.62 },
        { transform: "translate(0px, 0px)", offset: 1 },
      ],
      { duration: 340, fill: "none" },
    );
    await anim.finished;
  }

  return { render, animatePlayerAttack, animateManaGain };
}

function div(css: string): HTMLDivElement {
  const e = document.createElement("div");
  e.style.cssText = css.replace(/\s+/g, " ").trim();
  return e;
}

function span(css: string): HTMLSpanElement {
  const e = document.createElement("span");
  e.style.cssText = css.replace(/\s+/g, " ").trim();
  return e;
}
