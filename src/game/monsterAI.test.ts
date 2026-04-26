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
    const spell = chooseMonsterSpell(monster);
    expect(SKELETON.spells).toContainEqual(spell);
  });
});
