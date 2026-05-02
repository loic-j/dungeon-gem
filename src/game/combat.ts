import type {
  Element,
  ActiveMonster,
  Spell,
  MonsterSpell,
  CombatState,
} from "./types";
import { DAMAGE_MULTIPLIER } from "./constants";
import { consumeMana } from "./mana";
import {
  applySpellEffect,
  getAmplifyBonus,
  consumeAmplify,
  getShieldAmount,
  consumeShield,
} from "./statusEffects";

export function getElementModifier(
  spellElement: Element | null,
  monster: ActiveMonster,
): number {
  if (spellElement === null) return DAMAGE_MULTIPLIER.neutral;
  if (monster.definition.weaknesses.includes(spellElement))
    return DAMAGE_MULTIPLIER.weakness;
  if (monster.definition.resistances.includes(spellElement))
    return DAMAGE_MULTIPLIER.resistance;
  return DAMAGE_MULTIPLIER.neutral;
}

export function calculateDamage(baseDamage: number, modifier: number): number {
  return Math.ceil(baseDamage * modifier);
}

export function applyPlayerSpell(
  state: CombatState,
  spell: Spell,
): CombatState {
  const modifier = getElementModifier(spell.element, state.monster);
  const amplifyBonus = getAmplifyBonus(state.playerEffects);
  const damage = calculateDamage(spell.damage + amplifyBonus, modifier);

  let playerEffects = consumeAmplify(state.playerEffects);
  let monsterEffects = state.monsterEffects;
  let monster = {
    ...state.monster,
    hp: Math.max(0, state.monster.hp - damage),
  };

  if (spell.effect) {
    switch (spell.effect.type) {
      case "heal":
        // Heal is applied to player immediately
        break;
      case "stun":
        // Reset monster AP immediately
        monster = { ...monster, actionPoints: 0 };
        break;
      default:
        // burn, poison, slow → monster effects
        // shield, amplify, regen → player effects
        if (
          spell.effect.type === "burn" ||
          spell.effect.type === "poison" ||
          spell.effect.type === "slow"
        ) {
          monsterEffects = applySpellEffect(monsterEffects, spell.effect);
        } else {
          playerEffects = applySpellEffect(playerEffects, spell.effect);
        }
    }
  }

  const healAmount = spell.effect?.type === "heal" ? spell.effect.amount : 0;

  return {
    ...state,
    player: {
      ...state.player,
      manaPool: consumeMana(state.player.manaPool, spell.manaCost),
      hp: Math.min(state.player.maxHp, state.player.hp + healAmount),
    },
    monster,
    playerEffects,
    monsterEffects,
  };
}

export function applyMonsterSpell(
  state: CombatState,
  spell: MonsterSpell,
): CombatState {
  const shield = getShieldAmount(state.playerEffects);
  const absorbed = Math.min(shield, spell.damage);
  const actualDamage = spell.damage - absorbed;
  const playerEffects =
    absorbed > 0
      ? consumeShield(state.playerEffects, absorbed)
      : state.playerEffects;

  return {
    ...state,
    playerEffects,
    player: {
      ...state.player,
      hp: Math.max(0, state.player.hp - actualDamage),
    },
  };
}
