import type { ManaToken, SpellManaCost } from "./types";
import { ELEMENTS } from "./constants";

export function drawRandomMana(): ManaToken {
  return ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
}

export function addManaToPool(pool: ManaToken[], max: number): ManaToken[] {
  const drawn = drawRandomMana();
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
  // Specific elements first
  for (const token of cost) {
    if (token === "any") continue;
    const idx = available.indexOf(token);
    if (idx === -1) return false;
    available.splice(idx, 1);
  }
  // Then "any" tokens consume whatever remains
  const anyCount = cost.filter((t) => t === "any").length;
  return available.length >= anyCount;
}

export function consumeMana(
  pool: ManaToken[],
  cost: SpellManaCost[],
): ManaToken[] {
  const next = [...pool];
  // Specific elements first
  for (const token of cost) {
    if (token === "any") continue;
    const idx = next.indexOf(token);
    if (idx === -1) throw new Error(`Mana token "${token}" not found in pool`);
    next.splice(idx, 1);
  }
  // Then "any" tokens consume first available
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
