import type { Spell, Monster } from './types'

export const PLAYER_SPELLS: Spell[] = [
  { id: 'flame',   name: 'Flame', element: 'fire',      damage: 5, manaCost: ['fire'] },
  { id: 'wave',    name: 'Wave',  element: 'water',     damage: 5, manaCost: ['water'] },
  { id: 'bolt',    name: 'Bolt',  element: 'lightning', damage: 5, manaCost: ['lightning'] },
  { id: 'roots',   name: 'Roots', element: 'nature',    damage: 5, manaCost: ['nature'] },
]

export const POC_MONSTER: Monster = {
  hp: 10,
  maxHp: 10,
  actionPoints: 0,
  threshold: 3,
  resistances: ['fire'],
  weaknesses: ['water'],
  attackSound: 'monster_growl',
  spells: [
    { id: 'basic_attack', name: 'Basic Attack', element: 'nature', damage: 3, manaCost: [] },
  ],
}

export const PLAYER_START_HP = 20
export const PLAYER_START_MAX_MANA = 3
export const PLAYER_START_LEVEL = 1

export const ELEMENTS = ['fire', 'water', 'nature', 'lightning'] as const

export const DAMAGE_MULTIPLIER = {
  weakness: 1.2,
  neutral: 1.0,
  resistance: 0.8,
} as const
