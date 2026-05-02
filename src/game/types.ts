export type Element = "fire" | "water" | "nature" | "lightning";
export type ManaToken = Element;
export type SpellManaCost = Element | "any";

export type SpellEffectDef =
  | { type: "burn"; damage: number }
  | { type: "shield"; amount: number }
  | { type: "amplify"; bonus: number }
  | { type: "heal"; amount: number }
  | { type: "poison"; damage: number; turns: number }
  | { type: "regen"; amount: number; turns: number }
  | { type: "stun" }
  | { type: "slow"; turns: number };

export type StatusEffect =
  | { type: "burn"; damage: number }
  | { type: "shield"; amount: number }
  | { type: "amplify"; bonus: number }
  | { type: "poison"; damage: number; turnsLeft: number }
  | { type: "regen"; amount: number; turnsLeft: number }
  | { type: "slow"; turnsLeft: number };

export interface Spell {
  id: string;
  name: string;
  element: Element | null;
  damage: number;
  manaCost: SpellManaCost[];
  weight: number;
  effect?: SpellEffectDef;
}

export interface MonsterSpell {
  id: string;
  name: string;
  element: Element;
  damage: number;
  weight: number;
  level: number;
}

export interface PlayerProfile {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  maxHp: number;
  maxMana: number;
  spells: Spell[];
}

export interface Player extends PlayerProfile {
  hp: number;
  manaPool: ManaToken[];
  activeRewards: ActiveReward[];
}

export interface MonsterType {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  experienceReward: number;
  spells: MonsterSpell[];
  spellWeightOverrides?: Record<string, number>;
  threshold: number;
  resistances: Element[];
  weaknesses: Element[];
  attackSound: () => void;
  appearSound: () => void;
  sprite: {
    path: string;
    scale: [number, number, number];
    position: [number, number, number];
  };
}

export type RewardTier = 1 | 2 | 3;

export type RewardEffect =
  | { type: "heal_hp"; amount: number }
  | { type: "add_max_hp"; amount: number }
  | { type: "add_max_mana"; amount: number }
  | { type: "mana_bias"; element: Element; percent: number }
  | {
      type: "elemental_damage";
      element: Element;
      percent: number;
      combats?: number;
    }
  | { type: "all_elements_damage"; percent: number; combats?: number }
  | { type: "xp_bonus"; percent: number; combats?: number }
  | {
      type: "initial_mana_bonus";
      element: Element;
      amount: number;
      combats: number;
    }
  | { type: "combat_shield"; amount: number; combats: number }
  | { type: "lifesteal"; percent: number; combats: number }
  | { type: "damage_reflect"; percent: number; combats: number }
  | { type: "critical_chance"; percent: number; combats?: number };

export interface ActiveReward {
  id: string;
  effect: RewardEffect;
  combatsRemaining: number;
}

export interface RewardDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: RewardTier;
  effect: RewardEffect;
}

export interface ActiveMonster {
  definition: MonsterType;
  hp: number;
  actionPoints: number;
  spellLastCastTurn: Record<string, number>;
  nextSpell: MonsterSpell;
}

export type TurnPhase =
  | "GAIN_MANA"
  | "PLAYER_ACTION"
  | "MONSTER_ACTION"
  | "CHECK_END";

export interface CombatState {
  player: Player;
  monster: ActiveMonster;
  phase: TurnPhase;
  turn: number;
  playerEffects: StatusEffect[];
  monsterEffects: StatusEffect[];
}
