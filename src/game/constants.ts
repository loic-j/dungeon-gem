export const PLAYER_START_HP = 20;
export const PLAYER_START_MAX_MANA = 3;
export const PLAYER_START_LEVEL = 1;
export const PLAYER_START_EXPERIENCE = 0;

// XP required to level up: floor(20 * 1.2^(level-1))
// lv1→2: 20, lv2→3: 24, lv3→4: 28, lv4→5: 34, lv5→6: 41
export function xpToNextLevel(level: number): number {
  return Math.floor(20 * Math.pow(1.2, level - 1));
}

export const ELEMENTS = ["fire", "water", "nature", "lightning"] as const;

export const DAMAGE_MULTIPLIER = {
  weakness: 1.2,
  neutral: 1.0,
  resistance: 0.8,
} as const;
