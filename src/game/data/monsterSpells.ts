import type { MonsterSpell } from "../types";

export const MONSTER_SPELL_CATALOG: Record<string, MonsterSpell> = {
  basic_attack: {
    id: "basic_attack",
    name: "Basic Attack",
    element: "nature",
    damage: 3,
    weight: 0.7,
  },
  bone_strike: {
    id: "bone_strike",
    name: "Bone Strike",
    element: "nature",
    damage: 5,
    weight: 0.3,
  },
};
