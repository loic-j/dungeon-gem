import type {
  Player,
  ActiveReward,
  RewardDefinition,
  RewardTier,
  Element,
} from "./types";
import { ALL_REWARDS } from "./data/rewards";

export function pickRewards(rewardTiers: RewardTier[]): RewardDefinition[] {
  const result: RewardDefinition[] = [];
  const usedIds = new Set<string>();
  let attempts = 0;

  while (result.length < 3 && attempts < 100) {
    attempts++;
    const tier = rewardTiers[Math.floor(Math.random() * rewardTiers.length)]!;
    const pool = ALL_REWARDS.filter(
      (r) => r.tier === tier && !usedIds.has(r.id),
    );
    if (pool.length === 0) continue;
    const chosen = pool[Math.floor(Math.random() * pool.length)]!;
    usedIds.add(chosen.id);
    result.push(chosen);
  }

  return result;
}

export function applyRewardToPlayer(
  player: Player,
  def: RewardDefinition,
): Player {
  const effect = def.effect;

  switch (effect.type) {
    case "heal_hp":
      return {
        ...player,
        hp: Math.min(player.maxHp, player.hp + effect.amount),
      };
    case "add_max_hp":
      return { ...player, maxHp: player.maxHp + effect.amount };
    case "add_max_mana":
      return { ...player, maxMana: player.maxMana + effect.amount };
    default: {
      const combatsRemaining =
        "combats" in effect && effect.combats !== undefined
          ? effect.combats
          : -1;
      const activeReward: ActiveReward = {
        id: def.id,
        effect,
        combatsRemaining,
      };
      return {
        ...player,
        activeRewards: [...player.activeRewards, activeReward],
      };
    }
  }
}

export function tickActiveRewards(player: Player): Player {
  const updated = player.activeRewards
    .map((r) =>
      r.combatsRemaining > 0
        ? { ...r, combatsRemaining: r.combatsRemaining - 1 }
        : r,
    )
    .filter((r) => r.combatsRemaining !== 0);
  return { ...player, activeRewards: updated };
}

export function getManaDrawWeights(
  activeRewards: ActiveReward[],
): Partial<Record<Element, number>> {
  const bias: Partial<Record<Element, number>> = {};
  for (const r of activeRewards) {
    if (r.combatsRemaining === 0) continue;
    if (r.effect.type === "mana_bias") {
      const el = r.effect.element;
      bias[el] = (bias[el] ?? 0) + r.effect.percent;
    }
  }
  return bias;
}

export function getElementalDamageBonus(
  activeRewards: ActiveReward[],
  element: Element | null,
): number {
  let bonus = 0;
  for (const r of activeRewards) {
    if (r.combatsRemaining === 0) continue;
    if (
      r.effect.type === "elemental_damage" &&
      element !== null &&
      r.effect.element === element
    ) {
      bonus += r.effect.percent;
    }
    if (r.effect.type === "all_elements_damage") {
      bonus += r.effect.percent;
    }
  }
  return bonus;
}

export function getXpBonus(activeRewards: ActiveReward[]): number {
  let bonus = 0;
  for (const r of activeRewards) {
    if (r.combatsRemaining === 0) continue;
    if (r.effect.type === "xp_bonus") {
      bonus += r.effect.percent;
    }
  }
  return bonus;
}

export function getCritChance(activeRewards: ActiveReward[]): number {
  let chance = 0;
  for (const r of activeRewards) {
    if (r.combatsRemaining === 0) continue;
    if (r.effect.type === "critical_chance") {
      chance += r.effect.percent;
    }
  }
  return chance;
}

export function getLifestealPercent(activeRewards: ActiveReward[]): number {
  let percent = 0;
  for (const r of activeRewards) {
    if (r.combatsRemaining === 0) continue;
    if (r.effect.type === "lifesteal") {
      percent += r.effect.percent;
    }
  }
  return percent;
}

export function getDamageReflectPercent(activeRewards: ActiveReward[]): number {
  let percent = 0;
  for (const r of activeRewards) {
    if (r.combatsRemaining === 0) continue;
    if (r.effect.type === "damage_reflect") {
      percent += r.effect.percent;
    }
  }
  return percent;
}

export function getInitialManaBonus(
  activeRewards: ActiveReward[],
): Array<{ element: Element; amount: number }> {
  const bonuses: Array<{ element: Element; amount: number }> = [];
  for (const r of activeRewards) {
    if (r.combatsRemaining === 0) continue;
    if (r.effect.type === "initial_mana_bonus") {
      bonuses.push({ element: r.effect.element, amount: r.effect.amount });
    }
  }
  return bonuses;
}

export function getCombatShieldTotal(activeRewards: ActiveReward[]): number {
  let total = 0;
  for (const r of activeRewards) {
    if (r.combatsRemaining === 0) continue;
    if (r.effect.type === "combat_shield") {
      total += r.effect.amount;
    }
  }
  return total;
}
