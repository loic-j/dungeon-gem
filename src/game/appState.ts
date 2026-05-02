import type { CombatState, Player, MonsterType, Element } from "./types";
import type { DungeonProgress } from "./dungeon";
import type { EncounterState } from "./encounterSystem";

interface BaseState {
  dungeon: DungeonProgress;
  encounter: EncounterState;
}

export interface ExploringState extends BaseState {
  phase: "EXPLORING";
  player: Player;
}

export interface CombatAppState extends BaseState {
  phase: "COMBAT";
  combat: CombatState;
  isBoss: boolean;
}

export interface ChestState extends BaseState {
  phase: "CHEST";
  player: Player;
}

export interface GameOverState extends BaseState {
  phase: "GAME_OVER";
  player: Player;
}

export type AppState =
  | ExploringState
  | CombatAppState
  | ChestState
  | GameOverState;

export type Effect =
  | { type: "PLAY_FOOTSTEP" }
  | { type: "ANIMATE_WALK" }
  | { type: "ANIMATE_PLAYER_ATTACK" }
  | { type: "ANIMATE_MONSTER_ATTACK" }
  | { type: "FLASH_SCREEN" }
  | { type: "DELAY"; ms: number }
  | { type: "PLAY_SPELL_SOUND"; element: Element }
  | { type: "PLAY_VICTORY_SOUND" }
  | { type: "PLAY_GAME_OVER_SOUND" }
  | { type: "PLAY_MONSTER_APPEAR_SOUND" }
  | { type: "PLAY_MONSTER_ATTACK_SOUND" }
  | { type: "START_BACKGROUND_MUSIC" }
  | { type: "STOP_BACKGROUND_MUSIC" }
  | { type: "STOP_BOSS_MUSIC" }
  | { type: "PLAY_BOSS_MUSIC" }
  | { type: "SET_MONSTER_TYPE"; monster: MonsterType }
  | { type: "SET_BOSS_MODE"; enabled: boolean; title?: string }
  | { type: "SHOW_MONSTER_ATTACK_POPUP"; name: string; damage: number }
  | { type: "SHOW_MESSAGE"; text: string; color: string }
  | { type: "SHOW_ITEM_SELECTION" }
  | { type: "ANIMATE_MANA_GAIN"; index: number }
  | { type: "SHOW_CHEST_CLOSED" }
  | { type: "ANIMATE_CHEST_OPEN" }
  | { type: "HIDE_CHEST" };

export type Step =
  | { type: "state"; state: AppState }
  | { type: "effect"; effect: Effect };
