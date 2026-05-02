import type { MonsterType, ActiveMonster } from "../types";
import { playTone, playNoise } from "../../audio/soundManager";
import { getMonsterSpell } from "./monsterSpells";

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
  spells: [getMonsterSpell("basic_attack"), getMonsterSpell("bone_strike")],
  sprite: {
    path: "/sprites/monster-skeleton.svg",
    scale: [1.4, 1.8, 1],
    position: [0, 0.2, -3.5],
  },
};

export const SKELETON_KING: MonsterType = {
  id: "skeleton_king",
  name: "Skeleton King",
  level: 3,
  maxHp: 25,
  experienceReward: 50,
  threshold: 4,
  resistances: ["fire", "nature"],
  weaknesses: ["water", "lightning"],
  attackSound: () => {
    playTone(50, "sawtooth", 0.8, 0.8, 35);
    playNoise(0.5, 0.4, 200);
    setTimeout(() => playNoise(0.3, 0.3, 500), 200);
  },
  appearSound: () => {
    playTone(55, "sawtooth", 1.2, 0.5, 40);
    playNoise(0.12, 0.5, 2000);
    setTimeout(() => playNoise(0.12, 0.4, 1500), 120);
    setTimeout(() => playNoise(0.12, 0.3, 1000), 240);
    setTimeout(() => playTone(110, "square", 0.8, 0.3, 80), 500);
  },
  spells: [
    getMonsterSpell("bone_crush"),
    getMonsterSpell("royal_strike"),
    getMonsterSpell("bone_strike"),
  ],
  sprite: {
    path: "/sprites/monster-skeleton.svg",
    scale: [1.8, 2.3, 1],
    position: [0, 0.4, -3.5],
  },
};

export const CRYPT_SPIDER: MonsterType = {
  id: "crypt_spider",
  name: "Crypt Spider",
  level: 2,
  maxHp: 11,
  experienceReward: 20,
  threshold: 2,
  resistances: ["nature"],
  weaknesses: ["fire"],
  attackSound: () => {
    playNoise(0.08, 0.5, 5000);
    setTimeout(() => playTone(300, "square", 0.15, 0.6, 200), 60);
    setTimeout(() => playNoise(0.1, 0.4, 4000), 120);
  },
  appearSound: () => {
    playNoise(0.05, 0.3, 6000);
    setTimeout(() => playNoise(0.05, 0.25, 5500), 80);
    setTimeout(() => playNoise(0.05, 0.3, 7000), 160);
    setTimeout(() => playNoise(0.05, 0.25, 6500), 240);
    setTimeout(() => playTone(350, "square", 0.3, 0.4, 280), 320);
  },
  spells: [getMonsterSpell("fang_strike"), getMonsterSpell("toxic_spit")],
  sprite: {
    path: "/sprites/monster-spider.svg",
    scale: [1.3, 1.1, 1],
    position: [0, -0.2, -3.5],
  },
};

export const PUTRID_OOZE: MonsterType = {
  id: "putrid_ooze",
  name: "Putrid Ooze",
  level: 2,
  maxHp: 17,
  experienceReward: 25,
  threshold: 4,
  resistances: ["water", "nature"],
  weaknesses: ["lightning", "fire"],
  attackSound: () => {
    playNoise(0.5, 0.6, 250);
    setTimeout(() => playNoise(0.3, 0.4, 400), 150);
    playTone(60, "sine", 0.5, 0.3, 40);
  },
  appearSound: () => {
    playNoise(0.3, 0.4, 200);
    setTimeout(() => playNoise(0.2, 0.35, 350), 200);
    setTimeout(() => playNoise(0.15, 0.3, 280), 400);
    setTimeout(() => playTone(50, "sine", 0.6, 0.5, 35), 600);
  },
  spells: [getMonsterSpell("corrosive_glob"), getMonsterSpell("acid_surge")],
  sprite: {
    path: "/sprites/monster-ooze.svg",
    scale: [1.7, 1.2, 1],
    position: [0, -0.3, -3.5],
  },
};

const ALL_MONSTERS: MonsterType[] = [
  SKELETON,
  SKELETON_KING,
  CRYPT_SPIDER,
  PUTRID_OOZE,
];

export function findMonster(id: string): MonsterType | undefined {
  return ALL_MONSTERS.find((m) => m.id === id);
}

export function pickMonsterFromIds(ids: string[]): MonsterType {
  const candidates = ids
    .map((id) => findMonster(id))
    .filter((m): m is MonsterType => m !== undefined);
  if (candidates.length === 0)
    throw new Error(`No valid monsters for ids: ${ids.join(", ")}`);
  return candidates[Math.floor(Math.random() * candidates.length)]!;
}

export function spawnMonster(type: MonsterType): ActiveMonster {
  if (type.spells.length === 0)
    throw new Error(`Monster "${type.id}" has no spells`);
  const spellLastCastTurn: Record<string, number> = {};
  for (const spell of type.spells) {
    spellLastCastTurn[spell.id] = -1;
  }
  const nextSpell =
    type.spells[Math.floor(Math.random() * type.spells.length)]!;
  return {
    definition: type,
    hp: type.maxHp,
    actionPoints: 0,
    spellLastCastTurn,
    nextSpell,
  };
}
