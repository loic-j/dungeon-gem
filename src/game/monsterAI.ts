import type { Monster, Spell } from './types'

export function getAttackProbability(monster: Monster): number {
  return monster.actionPoints / monster.threshold
}

export function rollMonsterAttack(monster: Monster): boolean {
  return Math.random() < getAttackProbability(monster)
}

export function chooseMonsterSpell(monster: Monster): Spell {
  const idx = Math.floor(Math.random() * monster.spells.length)
  return monster.spells[idx]!
}
