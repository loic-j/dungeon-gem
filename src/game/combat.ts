import type {
  Element,
  ActiveMonster,
  Spell,
  MonsterSpell,
  CombatState,
} from "./types";
import { DAMAGE_MULTIPLIER } from "./constants";
import { consumeMana } from "./mana";
export function getElementModifier(
  spellElement: Element,
  monster: ActiveMonster,
): number {
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
  const damage = calculateDamage(spell.damage, modifier);
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
  };
}

export function applyMonsterSpell(
  state: CombatState,
  spell: MonsterSpell,
): CombatState {
  return {
    ...state,
    player: {
      ...state.player,
      hp: Math.max(0, state.player.hp - spell.damage),
    },
  };
}
