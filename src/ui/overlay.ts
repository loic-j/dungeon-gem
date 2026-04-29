import type { CombatState, ManaToken, ActiveMonster, MonsterSpell } from "../game/types";
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
  render: (state: CombatState, locked: boolean, inCombat: boolean) => void;
  animatePlayerAttack: () => Promise<void>;
  animateManaGain: (index: number) => void;
  showMonsterAttack: (spellName: string, damage: number) => void;
  updateStageProgress: (roomsCleared: number, totalRooms: number, stageIndex: number) => void;
  setBossMode: (active: boolean, title?: string) => void;
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
    "font-size:19px; font-weight:bold; text-shadow:0 1px 4px #000;",
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
    "font-size:17px; opacity:0.8; text-shadow:0 1px 4px #000;",
  );

  const bossLabel = div(
    "display:none; font-size:18px; font-weight:bold; letter-spacing:2px; text-align:center; padding:4px 0 2px; text-shadow:0 0 12px #e84a1a, 0 2px 6px #000; color:#e8c01a;",
  );

  const monsterNameLabel = div(
    "font-size:16px; font-weight:bold; letter-spacing:1px; text-align:center; padding:4px 0 2px; text-shadow:0 1px 4px #000; color:#e0d0b0;",
  );

  const dangerWrap = div(
    "margin-top:6px; display:flex; align-items:center; gap:6px;",
  );
  const dangerLabel = span("font-size:15px; opacity:0.7;");
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
  const nextSpellWrap = div("margin-top:6px; display:flex; gap:6px; pointer-events:none;");
  topBar.append(bossLabel, monsterNameLabel, enemyHpWrapper, enemyLvlLabel, dangerWrap, nextSpellWrap);
  container.appendChild(topBar);

  // ── Bottom: combat controls ────────────────────────────────────────────────
  const bottom = div(`position:absolute; bottom:0; left:0; right:0; height:48%;
    display:flex; pointer-events:none;
    background:linear-gradient(to top, rgba(0,0,0,0.88) 60%, transparent);`);

  // Left: character placeholder + skip
  const leftCol = div(`width:45%; display:flex; flex-direction:column;
    align-items:center; justify-content:flex-end; padding:0 8px 14px 10px;`);

  const charOval = document.createElement("img");
  charOval.src = "/sprites/water-mage-3.png";
  charOval.style.cssText =
    "margin:20px 0; position:absolute; bottom:52px; left:22.5%; transform:translateX(-50%); height:300px; width:auto; filter:drop-shadow(0 2px 8px rgba(0,0,0,0.8));";

  const skipBtn = document.createElement("button");
  skipBtn.textContent = "Skip turn";
  skipBtn.style.cssText = `width:100%; padding:10px 0; background:#222; border:1px solid #555;
    border-radius:6px; color:#ccc; font-size:18px; cursor:pointer; pointer-events:auto;
    touch-action:manipulation;`;
  skipBtn.dataset["testid"] = "skip-btn";
  skipBtn.addEventListener("click", () => callbacks.onSkip());
  leftCol.append(skipBtn);

  // Right: HP / Level / Mana / Spells
  const rightCol = div(`width:55%; display:flex; flex-direction:column;
    padding:0 10px 14px 6px; gap:6px; justify-content:flex-end;`);
  const hpWrapper = div("display:flex; flex-direction:column; gap:3px;");
  const playerHpLabel = div("font-size:19px; font-weight:bold;");
  playerHpLabel.dataset["testid"] = "player-hp";
  const hpBar = div(
    "width:100%; height:8px; background:#333; border-radius:4px; overflow:hidden;",
  );
  const hpFill = div(
    "height:100%; border-radius:4px; transition:width .3s, background .3s; width:100%; background:#2db84b;",
  );
  hpBar.appendChild(hpFill);
  hpWrapper.append(playerHpLabel, hpBar);

  const playerLvlLabel = div("font-size:17px; opacity:0.7;");

  const xpWrapper = div("display:flex; flex-direction:column; gap:2px;");
  const xpLabel = div("font-size:15px; opacity:0.6;");
  const xpBar = div(
    "width:100%; height:5px; background:#333; border-radius:3px; overflow:hidden;",
  );
  const xpFill = div(
    "height:100%; border-radius:3px; transition:width .4s, background .3s; width:0%; background:#a064e8;",
  );
  xpBar.appendChild(xpFill);
  xpWrapper.append(xpLabel, xpBar);

  const stageWrapper = div("display:flex; flex-direction:column; gap:2px;");
  const stageLabel = div("font-size:15px; opacity:0.6;");
  const stageBar = div(
    "width:100%; height:5px; background:#333; border-radius:3px; overflow:hidden;",
  );
  const stageFill = div(
    "height:100%; border-radius:3px; transition:width .4s; width:0%; background:#e8c01a;",
  );
  stageBar.appendChild(stageFill);
  stageWrapper.append(stageLabel, stageBar);

  const manaRow = div("display:flex; gap:5px; flex-wrap:wrap;");
  manaRow.dataset["testid"] = "mana-row";
  const spellsCol = div("display:flex; flex-direction:column; gap:5px;");
  rightCol.append(hpWrapper, playerLvlLabel, xpWrapper, stageWrapper, manaRow, spellsCol);

  bottom.append(charOval, leftCol, rightCol);
  container.appendChild(bottom);

  // ── Next spell helpers ─────────────────────────────────────────────────────
  function getSwordCount(spell: MonsterSpell, monster: ActiveMonster): number {
    const levels = monster.definition.spells.map((s) => s.level);
    const maxLevel = Math.max(...levels);
    const minLevel = Math.min(...levels);
    if (maxLevel === minLevel) return 2;
    const normalized = (spell.level - minLevel) / (maxLevel - minLevel);
    return normalized < 0.4 ? 1 : normalized < 0.7 ? 2 : 3;
  }

  function makeSword(): SVGSVGElement {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "34");
    svg.setAttribute("viewBox", "0 0 8 17");
    const tip = document.createElementNS(ns, "polygon");
    tip.setAttribute("points", "4,0 2.5,4 5.5,4");
    tip.setAttribute("fill", "#cc2222");
    const blade = document.createElementNS(ns, "rect");
    blade.setAttribute("x", "3");
    blade.setAttribute("y", "3");
    blade.setAttribute("width", "2");
    blade.setAttribute("height", "6");
    blade.setAttribute("fill", "#cc2222");
    const guard = document.createElementNS(ns, "rect");
    guard.setAttribute("x", "0.5");
    guard.setAttribute("y", "8.5");
    guard.setAttribute("width", "7");
    guard.setAttribute("height", "1.5");
    guard.setAttribute("fill", "#991111");
    const grip = document.createElementNS(ns, "rect");
    grip.setAttribute("x", "3");
    grip.setAttribute("y", "10");
    grip.setAttribute("width", "2");
    grip.setAttribute("height", "4.5");
    grip.setAttribute("fill", "#771111");
    const pommel = document.createElementNS(ns, "circle");
    pommel.setAttribute("cx", "4");
    pommel.setAttribute("cy", "15.5");
    pommel.setAttribute("r", "1.5");
    pommel.setAttribute("fill", "#991111");
    svg.append(tip, blade, guard, grip, pommel);
    return svg;
  }

  function updateSwords(spell: MonsterSpell, monster: ActiveMonster): void {
    nextSpellWrap.replaceChildren();
    const count = getSwordCount(spell, monster);
    for (let i = 0; i < count; i++) {
      nextSpellWrap.appendChild(makeSword());
    }
  }

  function showMonsterAttack(spellName: string, damage: number): void {
    const el = div(
      "position:absolute; top:52%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.82); border:2px solid #cc2222; border-radius:8px; padding:10px 18px; text-align:center; pointer-events:none; z-index:15; animation:monsterAttackFade 2s ease-out forwards;",
    );
    const nameEl = div("font-size:16px; font-weight:bold; color:#e84a1a; margin-bottom:3px;");
    nameEl.textContent = spellName;
    const dmgEl = div("font-size:22px; font-weight:bold; color:#ff6666;");
    dmgEl.textContent = `-${damage} HP`;
    el.append(nameEl, dmgEl);
    const style = document.createElement("style");
    style.textContent =
      "@keyframes monsterAttackFade{0%{opacity:0;transform:translate(-50%,-50%) scale(0.85)}12%{opacity:1;transform:translate(-50%,-50%) scale(1)}70%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%)}}";
    document.head.appendChild(style);
    container.appendChild(el);
    setTimeout(() => {
      el.remove();
      style.remove();
    }, 2000);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function render(state: CombatState, locked: boolean, inCombat: boolean) {
    const { player, monster } = state;

    topBar.style.display = inCombat ? "" : "none";
    skipBtn.style.visibility = inCombat ? "visible" : "hidden";
    skipBtn.style.pointerEvents = inCombat ? "auto" : "none";

    if (inCombat) {
      enemyHpLabel.textContent = `Enemy HP: ${monster.hp} / ${monster.definition.maxHp}`;
      const enemyHpRatio = Math.max(0, monster.hp / monster.definition.maxHp);
      enemyHpFill.style.width = `${Math.round(enemyHpRatio * 100)}%`;
      enemyHpFill.style.background =
        enemyHpRatio > 0.5
          ? "#2db84b"
          : enemyHpRatio > 0.25
            ? "#e8c01a"
            : "#e84a1a";
      monsterNameLabel.textContent = monster.definition.name;
      enemyLvlLabel.textContent = `Level ${monster.definition.level}`;
      const prob = Math.max(
        0,
        Math.min(1, monster.actionPoints / monster.definition.threshold),
      );
      dangerFill.style.width = `${Math.round(prob * 100)}%`;
      updateSwords(monster.nextSpell, monster);
    } else {
      nextSpellWrap.replaceChildren();
    }

    playerHpLabel.textContent = `HP: ${player.hp} / ${player.maxHp}`;
    const hpRatio = Math.max(0, player.hp / player.maxHp);
    hpFill.style.width = `${Math.round(hpRatio * 100)}%`;
    hpFill.style.background =
      hpRatio > 0.5 ? "#2db84b" : hpRatio > 0.25 ? "#e8c01a" : "#e84a1a";
    playerLvlLabel.textContent = `Level ${player.level}`;

    xpLabel.textContent = `XP: ${player.experience} / ${player.experienceToNextLevel}`;
    const xpRatio = player.experience / player.experienceToNextLevel;
    xpFill.style.width = `${Math.round(Math.min(1, xpRatio) * 100)}%`;

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
      const castable =
        inCombat && !locked && canCastSpell(player.manaPool, spell.manaCost);
      const color = ELEMENT_COLOR[spell.element];

      const btn = document.createElement("button");
      btn.style.cssText = `width:100%; padding:8px 10px; text-align:left;
        background:${castable ? "#1a2a3a" : "#111"};
        border:1px solid ${castable ? color : "#333"};
        border-radius:5px; color:${castable ? "#fff" : "#555"};
        font-size:17px; cursor:${castable ? "pointer" : "default"};
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

      const dmgSpan = span("opacity:0.6; font-size:15px;");
      dmgSpan.textContent = `${spell.damage} dmg`;

      btn.dataset["testid"] = `spell-${spell.id}`;
      btn.append(nameSpan, dmgSpan);
      if (castable)
        btn.addEventListener("click", () => callbacks.onSpell(spell.id));
      spellsCol.appendChild(btn);
    }

    skipBtn.style.opacity = locked ? "0.4" : "1";
    if (inCombat) skipBtn.style.pointerEvents = locked ? "none" : "auto";
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
        { transform: "translateX(-50%) translate(0px, 0px)", offset: 0 },
        { transform: "translateX(-50%) translate(-14px, 10px)", offset: 0.28 },
        { transform: "translateX(-50%) translate(60px, -48px)", offset: 0.62 },
        { transform: "translateX(-50%) translate(0px, 0px)", offset: 1 },
      ],
      { duration: 340, fill: "none" },
    );
    await anim.finished;
  }

  function updateStageProgress(roomsCleared: number, totalRooms: number, stageIndex: number): void {
    stageLabel.textContent = `Stage ${stageIndex + 1} — ${roomsCleared}/${totalRooms} Rooms`;
    stageFill.style.width = `${Math.round((roomsCleared / totalRooms) * 100)}%`;
  }

  function setBossMode(active: boolean, title?: string): void {
    bossLabel.style.display = active ? "" : "none";
    bossLabel.textContent = active && title ? `★ ${title} ★` : "";
    monsterNameLabel.style.display = active ? "none" : "";
    enemyLvlLabel.style.display = active ? "none" : "";
  }

  return { render, animatePlayerAttack, animateManaGain, showMonsterAttack, updateStageProgress, setBossMode };
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
