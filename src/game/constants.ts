import type { Spell, Monster } from './types'

export const PLAYER_SPELLS: Spell[] = [
  { id: 'flame',   name: 'Flamme', element: 'fire',      damage: 5, manaCost: ['fire'] },
  { id: 'wave',    name: 'Vague',  element: 'water',     damage: 5, manaCost: ['water'] },
  { id: 'bolt',    name: 'Éclair', element: 'lightning', damage: 5, manaCost: ['lightning'] },
  { id: 'roots',   name: 'Racines', element: 'nature',   damage: 5, manaCost: ['nature'] },
]

export const POC_MONSTER: Monster = {
  hp: 10,
  maxHp: 10,
  actionPoints: 0,
  threshold: 3,
  resistances: ['fire'],
  weaknesses: ['water'],
  spells: [
    { id: 'basic_attack', name: 'Attaque basique', element: 'nature', damage: 3, manaCost: [] },
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
