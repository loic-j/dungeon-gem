import type { DungeonConfig } from "../dungeon";
import { ENCOUNTER_CONFIGS } from "../encounterSystem";
import { startBossMusic } from "../../audio/soundManager";

export const DUNGEON_1: DungeonConfig = {
  id: "dungeon_1",
  name: "Crypt of Bones",
  stages: [
    {
      roomCount: 10,
      encounterConfigs: ENCOUNTER_CONFIGS,
      availableMonsters: ["skeleton"],
    },
  ],
  bossMonster: "skeleton_king",
  bossTitle: "SKELETON KING",
  bossMusic: startBossMusic,
  graphics: {
    floor: "/sprites/floor.png",
    ceiling: "/sprites/ceiling.png",
    wall: "/sprites/wall-1.png",
  },
};
