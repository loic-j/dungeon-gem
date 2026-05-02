import type { StatusEffect, SpellEffectDef, CombatState } from "./types";

export function applySpellEffect(
  effects: StatusEffect[],
  def: SpellEffectDef,
): StatusEffect[] {
  switch (def.type) {
    case "stun":
    case "heal":
      return effects;
    case "burn": {
      const existing = effects.findIndex((e) => e.type === "burn");
      if (existing !== -1) {
        const next = [...effects];
        (next[existing] as { type: "burn"; damage: number }).damage = Math.max(
          (next[existing] as { type: "burn"; damage: number }).damage,
          def.damage,
        );
        return next;
      }
      return [...effects, { type: "burn", damage: def.damage }];
    }
    case "poison": {
      const existing = effects.findIndex((e) => e.type === "poison");
      if (existing !== -1) {
        const next = [...effects];
        next[existing] = {
          type: "poison",
          damage: def.damage,
          turnsLeft: def.turns,
        };
        return next;
      }
      return [
        ...effects,
        { type: "poison", damage: def.damage, turnsLeft: def.turns },
      ];
    }
    case "shield": {
      const existing = effects.findIndex((e) => e.type === "shield");
      if (existing !== -1) {
        const next = [...effects];
        (next[existing] as { type: "shield"; amount: number }).amount +=
          def.amount;
        return next;
      }
      return [...effects, { type: "shield", amount: def.amount }];
    }
    case "amplify": {
      const existing = effects.findIndex((e) => e.type === "amplify");
      if (existing !== -1) {
        const next = [...effects];
        (next[existing] as { type: "amplify"; bonus: number }).bonus +=
          def.bonus;
        return next;
      }
      return [...effects, { type: "amplify", bonus: def.bonus }];
    }
    case "regen": {
      const existing = effects.findIndex((e) => e.type === "regen");
      if (existing !== -1) {
        const next = [...effects];
        next[existing] = {
          type: "regen",
          amount: def.amount,
          turnsLeft: def.turns,
        };
        return next;
      }
      return [
        ...effects,
        { type: "regen", amount: def.amount, turnsLeft: def.turns },
      ];
    }
    case "slow": {
      const existing = effects.findIndex((e) => e.type === "slow");
      if (existing !== -1) {
        const next = [...effects];
        next[existing] = { type: "slow", turnsLeft: def.turns };
        return next;
      }
      return [...effects, { type: "slow", turnsLeft: def.turns }];
    }
  }
}

export function getAmplifyBonus(effects: StatusEffect[]): number {
  const e = effects.find((e) => e.type === "amplify");
  return e ? (e as { type: "amplify"; bonus: number }).bonus : 0;
}

export function consumeAmplify(effects: StatusEffect[]): StatusEffect[] {
  return effects.filter((e) => e.type !== "amplify");
}

export function getShieldAmount(effects: StatusEffect[]): number {
  const e = effects.find((e) => e.type === "shield");
  return e ? (e as { type: "shield"; amount: number }).amount : 0;
}

export function consumeShield(
  effects: StatusEffect[],
  damageAbsorbed: number,
): StatusEffect[] {
  return effects
    .map((e) => {
      if (e.type !== "shield") return e;
      const remaining =
        (e as { type: "shield"; amount: number }).amount - damageAbsorbed;
      return remaining > 0 ? { ...e, amount: remaining } : null;
    })
    .filter((e): e is StatusEffect => e !== null);
}

export function hasSlowEffect(effects: StatusEffect[]): boolean {
  return effects.some((e) => e.type === "slow");
}

export function tickEffects(state: CombatState): CombatState {
  let { playerEffects, monsterEffects, player, monster } = state;

  // Burn ticks on monster
  const burnEffect = monsterEffects.find((e) => e.type === "burn") as
    | { type: "burn"; damage: number }
    | undefined;
  if (burnEffect) {
    monster = { ...monster, hp: Math.max(0, monster.hp - burnEffect.damage) };
    monsterEffects = monsterEffects
      .map((e) => {
        if (e.type !== "burn") return e;
        const next = (e as { type: "burn"; damage: number }).damage - 1;
        return next > 0 ? { ...e, damage: next } : null;
      })
      .filter((e): e is StatusEffect => e !== null);
  }

  // Poison ticks on monster
  const poisonEffect = monsterEffects.find((e) => e.type === "poison") as
    | { type: "poison"; damage: number; turnsLeft: number }
    | undefined;
  if (poisonEffect) {
    monster = {
      ...monster,
      hp: Math.max(0, monster.hp - poisonEffect.damage),
    };
    monsterEffects = monsterEffects
      .map((e) => {
        if (e.type !== "poison") return e;
        const left =
          (e as { type: "poison"; damage: number; turnsLeft: number })
            .turnsLeft - 1;
        return left > 0 ? { ...e, turnsLeft: left } : null;
      })
      .filter((e): e is StatusEffect => e !== null);
  }

  // Regen ticks on player
  const regenEffect = playerEffects.find((e) => e.type === "regen") as
    | { type: "regen"; amount: number; turnsLeft: number }
    | undefined;
  if (regenEffect) {
    player = {
      ...player,
      hp: Math.min(player.maxHp, player.hp + regenEffect.amount),
    };
    playerEffects = playerEffects
      .map((e) => {
        if (e.type !== "regen") return e;
        const left =
          (e as { type: "regen"; amount: number; turnsLeft: number })
            .turnsLeft - 1;
        return left > 0 ? { ...e, turnsLeft: left } : null;
      })
      .filter((e): e is StatusEffect => e !== null);
  }

  // Slow ticks down
  monsterEffects = monsterEffects
    .map((e) => {
      if (e.type !== "slow") return e;
      const left = (e as { type: "slow"; turnsLeft: number }).turnsLeft - 1;
      return left > 0 ? { ...e, turnsLeft: left } : null;
    })
    .filter((e): e is StatusEffect => e !== null);

  return { ...state, player, monster, playerEffects, monsterEffects };
}

export type EffectIconInfo = {
  emoji: string;
  label: string;
  description: string;
  color: string;
};

export function getEffectIconInfo(effect: StatusEffect): EffectIconInfo {
  switch (effect.type) {
    case "burn":
      return {
        emoji: "🔥",
        label: "Burn",
        description: `Burn: ${effect.damage} damage/turn, decreasing by 1 each turn`,
        color: "#e84a1a",
      };
    case "poison":
      return {
        emoji: "☠",
        label: "Poison",
        description: `Poison: ${effect.damage} damage/turn for ${effect.turnsLeft} more turns`,
        color: "#7ec840",
      };
    case "shield":
      return {
        emoji: "🛡",
        label: "Shield",
        description: `Shield: blocks ${effect.amount} damage from the next attack`,
        color: "#1a7ae8",
      };
    case "amplify":
      return {
        emoji: "⚡",
        label: "Amplify",
        description: `Amplify: next spell deals +${effect.bonus} extra damage`,
        color: "#e8c01a",
      };
    case "regen":
      return {
        emoji: "💚",
        label: "Regen",
        description: `Regen: +${effect.amount} HP/turn for ${effect.turnsLeft} more turns`,
        color: "#2db84b",
      };
    case "slow":
      return {
        emoji: "🐢",
        label: "Slow",
        description: `Slow: monster skips AP gain for ${effect.turnsLeft} more turns`,
        color: "#9070d0",
      };
  }
}
