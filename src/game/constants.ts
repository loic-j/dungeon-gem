export const PLAYER_START_HP = 20;
export const PLAYER_START_MAX_MANA = 3;
export const PLAYER_START_LEVEL = 1;

export const ELEMENTS = ["fire", "water", "nature", "lightning"] as const;

export const DAMAGE_MULTIPLIER = {
  weakness: 1.2,
  neutral: 1.0,
  resistance: 0.8,
} as const;
