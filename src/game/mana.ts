import type { ManaToken } from './types'
import { ELEMENTS } from './constants'

export function drawRandomMana(): ManaToken {
  return ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)]
}

export function addManaToPool(pool: ManaToken[], max: number): ManaToken[] {
  const drawn = drawRandomMana()
  if (pool.length < max) {
    return [...pool, drawn]
  }
  const removeIndex = Math.floor(Math.random() * pool.length)
  const next = [...pool]
  next.splice(removeIndex, 1)
  next.push(drawn)
  return next
}

export function canCastSpell(pool: ManaToken[], cost: ManaToken[]): boolean {
  const available = [...pool]
  for (const token of cost) {
    const idx = available.indexOf(token)
    if (idx === -1) return false
    available.splice(idx, 1)
  }
  return true
}

export function consumeMana(pool: ManaToken[], cost: ManaToken[]): ManaToken[] {
  const next = [...pool]
  for (const token of cost) {
    const idx = next.indexOf(token)
    next.splice(idx, 1)
  }
  return next
}

export function initManaPool(): ManaToken[] {
  return [drawRandomMana()]
}
