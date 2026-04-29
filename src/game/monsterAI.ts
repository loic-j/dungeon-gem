import type { Monster, MonsterSpell } from "./types";

export function getAttackProbability(monster: Monster): number {
  return monster.actionPoints / monster.threshold;
}

export function rollMonsterAttack(monster: Monster): boolean {
  return Math.random() < getAttackProbability(monster);
}

export function chooseMonsterSpell(monster: Monster, currentTurn: number): MonsterSpell {
  const weights = monster.spells.map((spell) => {
    const lastCast = monster.spellLastCastTurn[spell.id] ?? -1;
    const staleness = lastCast === -1 ? currentTurn : currentTurn - lastCast;
    const weight = monster.spellWeightOverrides?.[spell.id] ?? spell.weight;
    return weight * (1 + staleness);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < monster.spells.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return monster.spells[i]!;
  }
  return monster.spells[monster.spells.length - 1]!;
}
