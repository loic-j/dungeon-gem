import { describe, it, expect } from "vitest";
import { SPELL_LIBRARY } from "./data/spells";
import { SKELETON, spawnMonster } from "./data/monsters";

describe("SPELL_LIBRARY", () => {
  it("has at least 4 spells", () => {
    expect(SPELL_LIBRARY.length).toBeGreaterThanOrEqual(4);
  });

  it("each spell has a unique id", () => {
    const ids = SPELL_LIBRARY.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each spell has a non-empty name", () => {
    for (const spell of SPELL_LIBRARY) {
      expect(spell.name.length).toBeGreaterThan(0);
    }
  });

  it("each spell has at least 1 mana cost", () => {
    for (const spell of SPELL_LIBRARY) {
      expect(spell.manaCost.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("covers all 4 elements", () => {
    const elements = new Set(
      SPELL_LIBRARY.map((s) => s.element).filter((e) => e !== null),
    );
    expect(elements).toContain("fire");
    expect(elements).toContain("water");
    expect(elements).toContain("nature");
    expect(elements).toContain("lightning");
  });
});

describe("SKELETON", () => {
  it("has 10 max HP", () => {
    expect(SKELETON.maxHp).toBe(10);
  });

  it("has threshold 3", () => {
    expect(SKELETON.threshold).toBe(3);
  });

  it("resists fire", () => {
    expect(SKELETON.resistances).toContain("fire");
  });

  it("is weak to water", () => {
    expect(SKELETON.weaknesses).toContain("water");
  });
});

describe("spawnMonster", () => {
  it("spawns with full HP", () => {
    const m = spawnMonster(SKELETON);
    expect(m.hp).toBe(SKELETON.maxHp);
  });

  it("spawns with 0 action points", () => {
    const m = spawnMonster(SKELETON);
    expect(m.actionPoints).toBe(0);
  });
});
