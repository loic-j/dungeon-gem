import { describe, it, expect } from 'vitest'
import { getElementModifier, calculateDamage, applyPlayerSpell, applyMonsterSpell } from './combat'
import { POC_MONSTER, PLAYER_SPELLS } from './constants'
import type { GameState, Monster } from './types'

function makeState(overrides?: { playerHp?: number; monsterHp?: number; mana?: GameState['player']['manaPool'] }): GameState {
  const monster: Monster = { ...POC_MONSTER }
  return {
    player: {
      hp: overrides?.playerHp ?? 20,
      maxHp: 20,
      manaPool: overrides?.mana ?? ['fire', 'water', 'lightning', 'nature'],
      maxMana: 3,
      spells: PLAYER_SPELLS,
      level: 1,
    },
    monster: { ...monster, hp: overrides?.monsterHp ?? monster.maxHp },
    phase: 'PLAYER_ACTION',
    turn: 1,
    log: [],
  }
}

const flame     = PLAYER_SPELLS.find(s => s.id === 'flame')!
const wave      = PLAYER_SPELLS.find(s => s.id === 'wave')!
const bolt      = PLAYER_SPELLS.find(s => s.id === 'bolt')!
const roots     = PLAYER_SPELLS.find(s => s.id === 'roots')!
const monsterSpell = POC_MONSTER.spells[0]!

describe('getElementModifier', () => {
  it('fire vs fire resistance → 0.8', () => {
    expect(getElementModifier('fire', POC_MONSTER)).toBe(0.8)
  })

  it('water vs water weakness → 1.2', () => {
    expect(getElementModifier('water', POC_MONSTER)).toBe(1.2)
  })

  it('lightning vs neutral → 1.0', () => {
    expect(getElementModifier('lightning', POC_MONSTER)).toBe(1.0)
  })

  it('nature vs neutral → 1.0', () => {
    expect(getElementModifier('nature', POC_MONSTER)).toBe(1.0)
  })
})

describe('calculateDamage', () => {
  it('fire 5 × 0.8 → ceil = 4', () => {
    expect(calculateDamage(5, 0.8)).toBe(4)
  })

  it('water 5 × 1.2 → ceil = 6', () => {
    expect(calculateDamage(5, 1.2)).toBe(6)
  })

  it('neutral 5 × 1.0 → 5', () => {
    expect(calculateDamage(5, 1.0)).toBe(5)
  })
})

describe('applyPlayerSpell', () => {
  it('fire deals 4 damage (resistance)', () => {
    const next = applyPlayerSpell(makeState(), flame)
    expect(next.monster.hp).toBe(10 - 4)
  })

  it('water deals 6 damage (weakness)', () => {
    const next = applyPlayerSpell(makeState(), wave)
    expect(next.monster.hp).toBe(10 - 6)
  })

  it('lightning deals 5 damage (neutral)', () => {
    const next = applyPlayerSpell(makeState(), bolt)
    expect(next.monster.hp).toBe(10 - 5)
  })

  it('nature deals 5 damage (neutral)', () => {
    const next = applyPlayerSpell(makeState(), roots)
    expect(next.monster.hp).toBe(10 - 5)
  })

  it('monster HP cannot go below 0', () => {
    const next = applyPlayerSpell(makeState({ monsterHp: 1 }), wave)
    expect(next.monster.hp).toBe(0)
  })

  it('consumes mana after cast', () => {
    const state = makeState({ mana: ['fire', 'water'] })
    const next = applyPlayerSpell(state, flame)
    expect(next.player.manaPool).not.toContain('fire')
    expect(next.player.manaPool).toContain('water')
  })
})

describe('applyMonsterSpell', () => {
  it('deals 3 damage to player', () => {
    const next = applyMonsterSpell(makeState(), monsterSpell)
    expect(next.player.hp).toBe(20 - 3)
  })

  it('player HP cannot go below 0', () => {
    const next = applyMonsterSpell(makeState({ playerHp: 1 }), monsterSpell)
    expect(next.player.hp).toBe(0)
  })
})
