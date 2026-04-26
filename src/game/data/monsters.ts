import type { MonsterType, Monster } from "../types";
import { playTone, playNoise } from "../../audio/soundManager";

export const GOBLIN: MonsterType = {
  id: "goblin",
  name: "Goblin",
  maxHp: 10,
  threshold: 3,
  resistances: ["fire"],
  weaknesses: ["water"],
  attackSound: () => {
    playTone(80, "sawtooth", 0.6, 0.7, 55);
    playNoise(0.4, 0.35, 400);
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

export const MONSTER_LIBRARY: MonsterType[] = [GOBLIN];

export function pickMonster(_playerLevel: number): MonsterType {
  return MONSTER_LIBRARY[Math.floor(Math.random() * MONSTER_LIBRARY.length)]!;
}

export function spawnMonster(type: MonsterType): Monster {
  return { ...type, hp: type.maxHp, actionPoints: 0 };
}
