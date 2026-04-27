import type { Player } from "./types";
import { xpToNextLevel } from "./constants";

export function applyExperience(player: Player, xpGained: number): Player {
  let { level, experience, hp, maxHp } = player;
  experience += xpGained;

  while (experience >= xpToNextLevel(level)) {
    experience -= xpToNextLevel(level);
    level++;
    hp = maxHp;
  }

  return {
    ...player,
    level,
    experience,
    hp,
    experienceToNextLevel: xpToNextLevel(level),
  };
}
