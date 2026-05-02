import { describe, it, expect, vi, afterEach } from "vitest";
import {
  initPlayer,
  processManaPhase,
  processPlayerAction,
  processMonsterPhase,
  checkCombatEnd,
  resetCombat,
} from "./turnMachine";
import { SKELETON } from "./data/monsters";

afterEach(() => vi.restoreAllMocks());

const initCombat = () => resetCombat(initPlayer(), SKELETON);

describe("initPlayer", () => {
  it("player starts at 20/20 HP", () => {
    const player = initPlayer();
    expect(player.hp).toBe(20);
    expect(player.maxHp).toBe(20);
  });

  it("player starts with 0 mana tokens", () => {
    const player = initPlayer();
    expect(player.manaPool).toHaveLength(0);
  });
});

describe("resetCombat", () => {
  it("monster starts at 10/10 HP", () => {
    const state = resetCombat(initPlayer(), SKELETON);
    expect(state.monster.hp).toBe(10);
    expect(state.monster.definition.maxHp).toBe(10);
  });

  it("monster starts with 0 action points", () => {
    const state = resetCombat(initPlayer(), SKELETON);
    expect(state.monster.actionPoints).toBe(0);
  });

  it("mana pool reset to empty", () => {
    const player = {
      ...initPlayer(),
      manaPool: ["fire" as const, "water" as const, "nature" as const],
    };
    const next = resetCombat(player, SKELETON);
    expect(next.player.manaPool).toHaveLength(0);
  });
});

describe("processManaPhase", () => {
  it("adds 1 mana to player pool", () => {
    const state = initCombat();
    const before = state.player.manaPool.length;
    const next = processManaPhase(state);
    expect(next.player.manaPool.length).toBe(
      Math.min(before + 1, state.player.maxMana),
    );
  });

  it("increments monster action points by 1", () => {
    const state = initCombat();
    const next = processManaPhase(state);
    expect(next.monster.actionPoints).toBe(state.monster.actionPoints + 1);
  });

  it("sets phase to PLAYER_ACTION", () => {
    const next = processManaPhase(initCombat());
    expect(next.phase).toBe("PLAYER_ACTION");
  });
});

describe("processPlayerAction", () => {
  it("skip: mana unchanged, monster HP unchanged", () => {
    const state = processManaPhase(initCombat());
    const manaLen = state.player.manaPool.length;
    const monsterHp = state.monster.hp;
    const next = processPlayerAction(state, null);
    expect(next.player.manaPool).toHaveLength(manaLen);
    expect(next.monster.hp).toBe(monsterHp);
    expect(next.phase).toBe("MONSTER_ACTION");
  });

  it("valid spell: mana consumed, monster HP reduced", () => {
    const state = {
      ...processManaPhase(initCombat()),
      player: {
        ...processManaPhase(initCombat()).player,
        manaPool: ["fire" as const, "water" as const],
      },
    };
    const before = state.player.manaPool.length;
    const next = processPlayerAction(state, "flame");
    expect(next.player.manaPool).toHaveLength(before - 1);
    expect(next.monster.hp).toBeLessThan(state.monster.hp);
    expect(next.phase).toBe("MONSTER_ACTION");
  });
});

describe("processMonsterPhase", () => {
  it("attack occurred → AP reset to -1", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.01);
    const state = {
      ...initCombat(),
      monster: { ...initCombat().monster, actionPoints: 3 },
    };
    const { attacked, state: next } = processMonsterPhase(state);
    expect(attacked).toBe(true);
    expect(next.monster.actionPoints).toBe(-1);
  });

  it("no attack → AP unchanged", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const state = {
      ...initCombat(),
      monster: { ...initCombat().monster, actionPoints: 1 },
    };
    const { attacked, state: next } = processMonsterPhase(state);
    expect(attacked).toBe(false);
    expect(next.monster.actionPoints).toBe(1);
  });

  it("sets phase to CHECK_END", () => {
    const state = initCombat();
    const { state: next } = processMonsterPhase(state);
    expect(next.phase).toBe("CHECK_END");
  });
});

describe("checkCombatEnd", () => {
  it("GAME_OVER when player HP ≤ 0", () => {
    const state = {
      ...initCombat(),
      player: { ...initCombat().player, hp: 0 },
    };
    expect(checkCombatEnd(state)).toBe("GAME_OVER");
  });

  it("VICTORY when monster HP ≤ 0", () => {
    const state = {
      ...initCombat(),
      monster: { ...initCombat().monster, hp: 0 },
    };
    expect(checkCombatEnd(state)).toBe("VICTORY");
  });

  it("null when combat ongoing", () => {
    expect(checkCombatEnd(initCombat())).toBeNull();
  });
});
