import type { DungeonConfig } from "../dungeon";
import type { EncounterTypeConfig } from "../encounterSystem";
import { startBossMusic } from "../../audio/soundManager";

const STAGE_1_ENCOUNTER_CONFIGS: EncounterTypeConfig[] = [
  { id: "monster", baseChance: 0.4, chanceIncrement: 0.2 },
  { id: "chest", baseChance: 0.2, chanceIncrement: 0.1 },
];

const STAGE_2_ENCOUNTER_CONFIGS: EncounterTypeConfig[] = [
  { id: "monster", baseChance: 0.4, chanceIncrement: 0.2 },
  { id: "chest", baseChance: 0.2, chanceIncrement: 0.1 },
];

export const DUNGEON_1: DungeonConfig = {
  id: "dungeon_1",
  name: "Crypt of Bones",
  stages: [
    {
      roomCount: 10,
      encounterConfigs: STAGE_1_ENCOUNTER_CONFIGS,
      availableMonsters: ["skeleton"],
    },
    {
      roomCount: 12,
      encounterConfigs: STAGE_2_ENCOUNTER_CONFIGS,
      availableMonsters: ["skeleton", "crypt_spider", "putrid_ooze"],
    },
  ],
  bossMonster: "skeleton_king",
  bossTitle: "SKELETON KING",
  bossMusic: startBossMusic,
  stageTransitionType: "stairs",
  graphics: {
    floor: "/sprites/floor.png",
    ceiling: "/sprites/ceiling.png",
    wall: "/sprites/wall-1.png",
    stageTransition: "/sprites/dungeon1stagetransition.png",
  },
};

export const ALL_DUNGEONS: DungeonConfig[] = [DUNGEON_1];
