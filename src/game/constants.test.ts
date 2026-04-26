import { describe, it, expect } from 'vitest'
import { PLAYER_SPELLS, POC_MONSTER } from './constants'

describe('PLAYER_SPELLS', () => {
  it('has exactly 4 spells', () => {
    expect(PLAYER_SPELLS).toHaveLength(4)
  })

  it('each spell costs exactly 1 mana of its own element', () => {
    for (const spell of PLAYER_SPELLS) {
      expect(spell.manaCost).toHaveLength(1)
      expect(spell.manaCost[0]).toBe(spell.element)
    }
  })

  it('each spell deals 5 damage', () => {
    for (const spell of PLAYER_SPELLS) {
      expect(spell.damage).toBe(5)
    }
  })

  it('covers all 4 elements', () => {
    const elements = PLAYER_SPELLS.map(s => s.element).sort()
    expect(elements).toEqual(['fire', 'lightning', 'nature', 'water'])
  })
})

describe('POC_MONSTER', () => {
  it('starts with 10/10 HP', () => {
    expect(POC_MONSTER.hp).toBe(10)
    expect(POC_MONSTER.maxHp).toBe(10)
  })

  it('has threshold 3', () => {
    expect(POC_MONSTER.threshold).toBe(3)
  })

  it('resists fire', () => {
    expect(POC_MONSTER.resistances).toContain('fire')
  })

  it('is weak to water', () => {
    expect(POC_MONSTER.weaknesses).toContain('water')
  })

  it('starts with 0 action points', () => {
    expect(POC_MONSTER.actionPoints).toBe(0)
  })
})
