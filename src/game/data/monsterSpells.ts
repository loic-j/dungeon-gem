import type { MonsterSpell } from "../types";

export const MONSTER_SPELL_CATALOG: Record<string, MonsterSpell> = {
  basic_attack: {
    id: "basic_attack",
    name: "Basic Attack",
    element: "nature",
    damage: 3,
    weight: 0.7,
    level: 1,
  },
  bone_strike: {
    id: "bone_strike",
    name: "Bone Strike",
    element: "nature",
    damage: 5,
    weight: 0.3,
    level: 2,
  },
  royal_strike: {
    id: "royal_strike",
    name: "Royal Strike",
    element: "lightning",
    damage: 8,
    weight: 0.4,
    level: 3,
  },
  bone_crush: {
    id: "bone_crush",
    name: "Bone Crush",
    element: "nature",
    damage: 6,
    weight: 0.3,
    level: 2,
  },
};
