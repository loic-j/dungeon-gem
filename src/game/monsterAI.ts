import type { ActiveMonster, MonsterSpell } from "./types";
import { SPELL_STALENESS_BASE } from "./constants";

export function getAttackProbability(monster: ActiveMonster): number {
  return monster.actionPoints / monster.definition.threshold;
}

export function rollMonsterAttack(monster: ActiveMonster): boolean {
  return Math.random() < getAttackProbability(monster);
}

export function chooseMonsterSpell(monster: ActiveMonster, currentTurn: number): MonsterSpell {
  const spells = monster.definition.spells;
  if (spells.length === 0) throw new Error(`Monster "${monster.definition.id}" has no spells`);
  const weights = spells.map((spell) => {
    const lastCast = monster.spellLastCastTurn[spell.id] ?? -1;
    const staleness = lastCast === -1 ? currentTurn : currentTurn - lastCast;
    const weight = monster.definition.spellWeightOverrides?.[spell.id] ?? spell.weight;
    return weight * (SPELL_STALENESS_BASE + staleness);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let cumulative = 0;
  const r = Math.random() * total;
  for (let i = 0; i < spells.length; i++) {
    cumulative += weights[i]!;
    if (r < cumulative) return spells[i]!;
  }
  return spells[spells.length - 1]!;
}
