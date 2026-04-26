import { describe, it, expect } from 'vitest'
import { SPELL_LIBRARY } from './data/spells'
import { GOBLIN, spawnMonster } from './data/monsters'

describe('SPELL_LIBRARY', () => {
  it('has exactly 4 spells', () => {
    expect(SPELL_LIBRARY).toHaveLength(4)
  })

  it('each spell costs exactly 1 mana of its own element', () => {
    for (const spell of SPELL_LIBRARY) {
      expect(spell.manaCost).toHaveLength(1)
      expect(spell.manaCost[0]).toBe(spell.element)
    }
  })

  it('each spell deals 5 damage', () => {
    for (const spell of SPELL_LIBRARY) {
      expect(spell.damage).toBe(5)
    }
  })

  it('covers all 4 elements', () => {
    const elements = SPELL_LIBRARY.map(s => s.element).sort()
    expect(elements).toEqual(['fire', 'lightning', 'nature', 'water'])
  })
})

describe('GOBLIN', () => {
  it('has 10 max HP', () => {
    expect(GOBLIN.maxHp).toBe(10)
  })

  it('has threshold 3', () => {
    expect(GOBLIN.threshold).toBe(3)
  })

  it('resists fire', () => {
    expect(GOBLIN.resistances).toContain('fire')
  })

  it('is weak to water', () => {
    expect(GOBLIN.weaknesses).toContain('water')
  })
})

describe('spawnMonster', () => {
  it('spawns with full HP', () => {
    const m = spawnMonster(GOBLIN)
    expect(m.hp).toBe(GOBLIN.maxHp)
  })

  it('spawns with 0 action points', () => {
    const m = spawnMonster(GOBLIN)
    expect(m.actionPoints).toBe(0)
  })
})
