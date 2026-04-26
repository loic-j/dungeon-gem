import type { MonsterType, Monster } from "../types";
import { playTone, playNoise } from "../../audio/soundManager";

export const SKELETON: MonsterType = {
  id: "skeleton",
  name: "Skeleton",
  maxHp: 10,
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
  spells: [
    {
      id: "basic_attack",
      name: "Basic Attack",
      element: "nature",
      damage: 3,
      manaCost: [],
    },
  ],
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

export function spawnMonster(type: MonsterType): Monster {
  return { ...type, hp: type.maxHp, actionPoints: 0 };
}
