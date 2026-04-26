import type { MonsterType, Monster } from '../types'

export const GOBLIN: MonsterType = {
  id: 'goblin',
  name: 'Goblin',
  maxHp: 10,
  threshold: 3,
  resistances: ['fire'],
  weaknesses: ['water'],
  attackSound: 'monster_growl',
  spells: [
    { id: 'basic_attack', name: 'Basic Attack', element: 'nature', damage: 3, manaCost: [] },
  ],
}

export const MONSTER_LIBRARY: MonsterType[] = [GOBLIN]

export function pickMonster(_playerLevel: number): MonsterType {
  return MONSTER_LIBRARY[Math.floor(Math.random() * MONSTER_LIBRARY.length)]!
}

export function spawnMonster(type: MonsterType): Monster {
  return { ...type, hp: type.maxHp, actionPoints: 0 }
}
