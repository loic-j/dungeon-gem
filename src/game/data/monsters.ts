import type { MonsterType, ActiveMonster } from "../types";
import { playTone, playNoise } from "../../audio/soundManager";
import { MONSTER_SPELL_CATALOG } from "./monsterSpells";

export const SKELETON: MonsterType = {
  id: "skeleton",
  name: "Skeleton",
  level: 1,
  maxHp: 10,
  experienceReward: 15,
  threshold: 3,
  resistances: ["fire"],
  weaknesses: ["water"],
  attackSound: () => {
    playTone(80, "sawtooth", 0.6, 0.7, 55);
    playNoise(0.4, 0.35, 400);
  },
  appearSound: () => {
    // high bone clicks then eerie rising tone
    playNoise(0.06, 0.4, 3500);
    setTimeout(() => playNoise(0.06, 0.35, 2800), 80);
    setTimeout(() => playNoise(0.06, 0.3, 4200), 160);
    setTimeout(() => playNoise(0.06, 0.25, 3000), 240);
  },
  spells: [MONSTER_SPELL_CATALOG.basic_attack!, MONSTER_SPELL_CATALOG.bone_strike!],
  sprite: {
    path: "/sprites/monster-skeleton.svg",
    scale: [1.4, 1.8, 1],
    position: [0, 0.2, -3.5],
  },
};

export const MONSTER_LIBRARY: MonsterType[] = [SKELETON];

export function pickMonster(_playerLevel: number): MonsterType {
  return MONSTER_LIBRARY[Math.floor(Math.random() * MONSTER_LIBRARY.length)]!;
}

export function spawnMonster(type: MonsterType): ActiveMonster {
  const spellLastCastTurn: Record<string, number> = {};
  for (const spell of type.spells) {
    spellLastCastTurn[spell.id] = -1;
  }
  const nextSpell = type.spells[Math.floor(Math.random() * type.spells.length)]!;
  return { definition: type, hp: type.maxHp, actionPoints: 0, spellLastCastTurn, nextSpell };
}
