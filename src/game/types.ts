export type Element = "fire" | "water" | "nature" | "lightning";
export type ManaToken = Element;

export interface Spell {
  id: string;
  name: string;
  element: Element;
  damage: number;
  manaCost: ManaToken[];
}

export interface Player {
  hp: number;
  maxHp: number;
  manaPool: ManaToken[];
  maxMana: number;
  spells: Spell[];
  level: number;
}

export interface MonsterType {
  id: string;
  name: string;
  maxHp: number;
  spells: Spell[];
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

export type Monster = MonsterType & {
  hp: number;
  actionPoints: number;
};

export type TurnPhase =
  | "GAIN_MANA"
  | "PLAYER_ACTION"
  | "MONSTER_ACTION"
  | "CHECK_END";

export interface GameState {
  player: Player;
  monster: Monster;
  phase: TurnPhase;
  turn: number;
  log: string[];
}
