import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getAttackProbability,
  rollMonsterAttack,
  chooseMonsterSpell,
} from "./monsterAI";
import { SKELETON, spawnMonster } from "./data/monsters";

function makeMonster(actionPoints: number) {
  return { ...spawnMonster(SKELETON), actionPoints };
}

afterEach(() => vi.restoreAllMocks());

describe("getAttackProbability", () => {
  it("AP=0, threshold=3 → 0", () => {
    expect(getAttackProbability(makeMonster(0))).toBe(0);
  });

  it("AP=1, threshold=3 → ~0.333", () => {
    expect(getAttackProbability(makeMonster(1))).toBeCloseTo(1 / 3);
  });

  it("AP=3, threshold=3 → 1.0", () => {
    expect(getAttackProbability(makeMonster(3))).toBe(1.0);
  });
});

describe("rollMonsterAttack", () => {
  it("random=0.5, AP=1, threshold=3 → false (0.5 > 0.333)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(rollMonsterAttack(makeMonster(1))).toBe(false);
  });

  it("random=0.1, AP=1, threshold=3 → true (0.1 < 0.333)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    expect(rollMonsterAttack(makeMonster(1))).toBe(true);
  });

  it("random=0.1, AP=3, threshold=3 → true (0.1 < 1.0)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    expect(rollMonsterAttack(makeMonster(3))).toBe(true);
  });
});

describe("chooseMonsterSpell", () => {
  it("returns a spell from the monster set", () => {
    const monster = spawnMonster(SKELETON);
    const spell = chooseMonsterSpell(monster, 1);
    expect(SKELETON.spells).toContainEqual(spell);
  });

  it("favors stale spells over recently cast spells", () => {
    // bone_strike cast last turn (turn 5), basic_attack never cast
    // basic_attack weight: ratio 1 × (1 + 6) = 7
    // bone_strike weight:  ratio 2 × (1 + 1) = 4  → basic_attack should win majority
    const monster = {
      ...spawnMonster(SKELETON),
      spellLastCastTurn: { basic_attack: -1, bone_strike: 5 },
    };
    let basicCount = 0;
    for (let i = 0; i < 200; i++) {
      const spell = chooseMonsterSpell(monster, 6);
      if (spell.id === "basic_attack") basicCount++;
    }
    // basic_attack has 7/(7+4) ≈ 63.6% weight — expect well above 50%
    expect(basicCount).toBeGreaterThan(100);
  });
});
