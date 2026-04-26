import type { Element, Monster, Spell, GameState } from './types'
import { DAMAGE_MULTIPLIER } from './constants'
import { consumeMana } from './mana'

export function getElementModifier(spellElement: Element, monster: Monster): number {
  if (monster.weaknesses.includes(spellElement)) return DAMAGE_MULTIPLIER.weakness
  if (monster.resistances.includes(spellElement)) return DAMAGE_MULTIPLIER.resistance
  return DAMAGE_MULTIPLIER.neutral
}

export function calculateDamage(baseDamage: number, modifier: number): number {
  return Math.ceil(baseDamage * modifier)
}

export function applyPlayerSpell(state: GameState, spell: Spell): GameState {
  const modifier = getElementModifier(spell.element, state.monster)
  const damage = calculateDamage(spell.damage, modifier)
  return {
    ...state,
    player: {
      ...state.player,
      manaPool: consumeMana(state.player.manaPool, spell.manaCost),
    },
    monster: {
      ...state.monster,
      hp: Math.max(0, state.monster.hp - damage),
    },
  }
}

export function applyMonsterSpell(state: GameState, spell: Spell): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      hp: Math.max(0, state.player.hp - spell.damage),
    },
  }
}
