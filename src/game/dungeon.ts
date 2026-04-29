import type { EncounterTypeConfig } from "./encounterSystem";

export interface DungeonGraphics {
  floor: string;
  ceiling: string;
  wall: string;
}

export interface StageConfig {
  roomCount: number;
  encounterConfigs: EncounterTypeConfig[];
  availableMonsters: string[];
}

export interface DungeonConfig {
  id: string;
  name: string;
  stages: StageConfig[];
  bossMonster: string;
  bossTitle: string;
  bossMusic?: () => void;
  graphics: DungeonGraphics;
  stageTransitionType?: string;
}

export interface DungeonProgress {
  dungeon: DungeonConfig;
  currentStageIndex: number;
  roomsCleared: number;
}

export function createDungeonProgress(dungeon: DungeonConfig): DungeonProgress {
  return { dungeon, currentStageIndex: 0, roomsCleared: 0 };
}

export function getCurrentStage(progress: DungeonProgress): StageConfig {
  return progress.dungeon.stages[progress.currentStageIndex]!;
}

export function isFinalStage(progress: DungeonProgress): boolean {
  return progress.currentStageIndex === progress.dungeon.stages.length - 1;
}

export function isBossRoom(progress: DungeonProgress): boolean {
  const stage = getCurrentStage(progress);
  return isFinalStage(progress) && progress.roomsCleared === stage.roomCount - 1;
}

export function isStageComplete(progress: DungeonProgress): boolean {
  return progress.roomsCleared >= getCurrentStage(progress).roomCount;
}

export function completeRoom(progress: DungeonProgress): DungeonProgress {
  return { ...progress, roomsCleared: progress.roomsCleared + 1 };
}

export function advanceToNextStage(progress: DungeonProgress): DungeonProgress {
  return {
    ...progress,
    currentStageIndex: progress.currentStageIndex + 1,
    roomsCleared: 0,
  };
}

export function resetDungeonProgress(progress: DungeonProgress): DungeonProgress {
  return { ...progress, currentStageIndex: 0, roomsCleared: 0 };
}
