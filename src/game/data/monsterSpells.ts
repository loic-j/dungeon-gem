import type { MonsterSpell } from "../types";

export const MONSTER_SPELL_CATALOG: Readonly<Record<string, MonsterSpell>> = {
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
  fang_strike: {
    id: "fang_strike",
    name: "Fang Strike",
    element: "nature",
    damage: 4,
    weight: 0.6,
    level: 1,
  },
  toxic_spit: {
    id: "toxic_spit",
    name: "Toxic Spit",
    element: "nature",
    damage: 6,
    weight: 0.4,
    level: 2,
  },
  corrosive_glob: {
    id: "corrosive_glob",
    name: "Corrosive Glob",
    element: "water",
    damage: 4,
    weight: 0.65,
    level: 1,
  },
  acid_surge: {
    id: "acid_surge",
    name: "Acid Surge",
    element: "water",
    damage: 8,
    weight: 0.35,
    level: 2,
  },
};

export function getMonsterSpell(id: string): MonsterSpell {
  const spell = MONSTER_SPELL_CATALOG[id];
  if (!spell) throw new Error(`Unknown monster spell: "${id}"`);
  return spell;
}
