import type { Player } from "./types";
import { xpToNextLevel } from "./constants";
import { getXpBonus } from "./rewards";

export function applyExperience(player: Player, xpGained: number): Player {
  const bonusPercent = getXpBonus(player.activeRewards);
  const totalXp = Math.ceil(xpGained * (1 + bonusPercent / 100));

  let { level, experience } = player;
  experience += totalXp;

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
