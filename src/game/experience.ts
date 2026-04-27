import type { Player } from "./types";
import { xpToNextLevel } from "./constants";

export function applyExperience(player: Player, xpGained: number): Player {
  let { level, experience } = player;
  experience += xpGained;

  while (experience >= xpToNextLevel(level)) {
    experience -= xpToNextLevel(level);
    level++;
  }

  return {
    ...player,
    level,
    experience,
    experienceToNextLevel: xpToNextLevel(level),
  };
}
