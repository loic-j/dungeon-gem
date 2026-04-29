import type { ActiveMonster, MonsterSpell } from "./types";

export function getAttackProbability(monster: ActiveMonster): number {
  return monster.actionPoints / monster.definition.threshold;
}

export function rollMonsterAttack(monster: ActiveMonster): boolean {
  return Math.random() < getAttackProbability(monster);
}

export function chooseMonsterSpell(monster: ActiveMonster, currentTurn: number): MonsterSpell {
  const weights = monster.definition.spells.map((spell) => {
    const lastCast = monster.spellLastCastTurn[spell.id] ?? -1;
    const staleness = lastCast === -1 ? currentTurn : currentTurn - lastCast;
    const weight = monster.definition.spellWeightOverrides?.[spell.id] ?? spell.weight;
    return weight * (1 + staleness);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < monster.definition.spells.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return monster.definition.spells[i]!;
  }
  return monster.definition.spells[monster.definition.spells.length - 1]!;
}
