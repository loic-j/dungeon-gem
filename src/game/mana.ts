import type { ManaToken, SpellManaCost, Element } from "./types";
import { ELEMENTS } from "./constants";

export function drawRandomMana(
  bias?: Partial<Record<Element, number>>,
): ManaToken {
  if (!bias || Object.keys(bias).length === 0) {
    return ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)]!;
  }
  const weights = (ELEMENTS as readonly Element[]).map(
    (e) => 1 + (bias[e] ?? 0) / 100,
  );
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < ELEMENTS.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return ELEMENTS[i]!;
  }
  return ELEMENTS[ELEMENTS.length - 1]!;
}

export function addManaToPool(
  pool: ManaToken[],
  max: number,
  bias?: Partial<Record<Element, number>>,
): ManaToken[] {
  const drawn = drawRandomMana(bias);
  if (pool.length < max) {
    return [...pool, drawn];
  }
  const removeIndex = Math.floor(Math.random() * pool.length);
  const next = [...pool];
  next.splice(removeIndex, 1);
  next.push(drawn);
  return next;
}

export function canCastSpell(
  pool: ManaToken[],
  cost: SpellManaCost[],
): boolean {
  const available = [...pool];
  for (const token of cost) {
    if (token === "any") continue;
    const idx = available.indexOf(token);
    if (idx === -1) return false;
    available.splice(idx, 1);
  }
  const anyCount = cost.filter((t) => t === "any").length;
  return available.length >= anyCount;
}

export function consumeMana(
  pool: ManaToken[],
  cost: SpellManaCost[],
): ManaToken[] {
  const next = [...pool];
  for (const token of cost) {
    if (token === "any") continue;
    const idx = next.indexOf(token);
    if (idx === -1) throw new Error(`Mana token "${token}" not found in pool`);
    next.splice(idx, 1);
  }
  for (const token of cost) {
    if (token !== "any") continue;
    if (next.length === 0)
      throw new Error("Not enough mana tokens for 'any' cost");
    next.splice(0, 1);
  }
  return next;
}

export function initManaPool(): ManaToken[] {
  return [];
}
