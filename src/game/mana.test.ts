import { describe, it, expect } from "vitest";
import { addManaToPool, canCastSpell, consumeMana, initManaPool } from "./mana";
import { ELEMENTS } from "./constants";

describe("addManaToPool", () => {
  it("adds mana when pool not full", () => {
    const pool = addManaToPool(["fire"], 3);
    expect(pool).toHaveLength(2);
  });

  it("keeps size at max when pool full", () => {
    const pool = addManaToPool(["fire", "water", "nature"], 3);
    expect(pool).toHaveLength(3);
  });

  it("added token is a valid element", () => {
    const pool = addManaToPool([], 3);
    expect(ELEMENTS).toContain(pool[0]);
  });
});

describe("canCastSpell", () => {
  it("returns true when pool has required tokens", () => {
    expect(canCastSpell(["fire", "water"], ["fire"])).toBe(true);
  });

  it("returns false when pool missing required token", () => {
    expect(canCastSpell(["fire", "water"], ["lightning"])).toBe(false);
  });

  it("returns false when pool has element but not enough quantity", () => {
    expect(canCastSpell(["fire", "water"], ["fire", "fire"])).toBe(false);
  });

  it("consumes tokens independently for multi-cost spells", () => {
    expect(canCastSpell(["fire", "fire"], ["fire", "fire"])).toBe(true);
  });
});

describe("consumeMana", () => {
  it("removes exactly the cost tokens", () => {
    const result = consumeMana(["fire", "water", "nature"], ["water"]);
    expect(result).toHaveLength(2);
    expect(result).not.toContain("water");
    expect(result).toContain("fire");
    expect(result).toContain("nature");
  });

  it("removes only one token when duplicates exist", () => {
    const result = consumeMana(["fire", "fire", "water"], ["fire"]);
    expect(result).toHaveLength(2);
    expect(result.filter((t) => t === "fire")).toHaveLength(1);
  });
});

describe("initManaPool", () => {
  it("returns exactly 1 mana", () => {
    expect(initManaPool()).toHaveLength(1);
  });

  it("returned token is a valid element", () => {
    const pool = initManaPool();
    expect(ELEMENTS).toContain(pool[0]);
  });
});
