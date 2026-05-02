import {
  playSpellSound,
  playVictorySound,
  playGameOverSound,
  playFootstepSound,
  startBackgroundMusic,
  stopBackgroundMusic,
  stopBossMusic,
} from "./audio/soundManager";
import { animateMonsterAttack } from "./renderer/animator";
import {
  flashScreen,
  showMessageAsync,
  showItemSelectionAsync,
} from "./ui/messages";
import type { Effect, AppState } from "./game/appState";
import type { SceneObjects } from "./renderer/scene";
import type { MonsterType } from "./game/types";

export interface EffectDeps {
  objects: SceneObjects;
  animateWalk(): Promise<void>;
  animatePlayerAttack(): Promise<void>;
  animateManaGain(index: number): Promise<void>;
  showMonsterAttack(name: string, damage: number): void;
  setBossMode(enabled: boolean, title?: string): void;
  setMonsterType(monster: MonsterType): void;
  isMusicEnabled(): boolean;
  getState(): AppState;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function executeEffect(
  effect: Effect,
  deps: EffectDeps,
): Promise<void> {
  switch (effect.type) {
    case "PLAY_FOOTSTEP":
      playFootstepSound();
      break;
    case "ANIMATE_WALK":
      await deps.animateWalk();
      break;
    case "ANIMATE_PLAYER_ATTACK":
      await deps.animatePlayerAttack();
      break;
    case "ANIMATE_MONSTER_ATTACK":
      await animateMonsterAttack(deps.objects.monsterSprite);
      break;
    case "FLASH_SCREEN":
      flashScreen();
      break;
    case "DELAY":
      await delay(effect.ms);
      break;
    case "PLAY_SPELL_SOUND":
      playSpellSound(effect.element);
      break;
    case "PLAY_VICTORY_SOUND":
      playVictorySound();
      break;
    case "PLAY_GAME_OVER_SOUND":
      playGameOverSound();
      break;
    case "PLAY_MONSTER_APPEAR_SOUND":
      deps.getState().combat.monster.definition.appearSound();
      break;
    case "PLAY_MONSTER_ATTACK_SOUND":
      deps.getState().combat.monster.definition.attackSound();
      break;
    case "START_BACKGROUND_MUSIC":
      if (deps.isMusicEnabled()) startBackgroundMusic();
      break;
    case "STOP_BACKGROUND_MUSIC":
      stopBackgroundMusic();
      break;
    case "STOP_BOSS_MUSIC":
      stopBossMusic();
      break;
    case "PLAY_BOSS_MUSIC":
      if (deps.isMusicEnabled()) deps.getState().dungeon.dungeon.bossMusic?.();
      break;
    case "SET_MONSTER_TYPE":
      deps.setMonsterType(effect.monster);
      break;
    case "SET_BOSS_MODE":
      deps.setBossMode(effect.enabled, effect.title);
      break;
    case "SHOW_MONSTER_ATTACK_POPUP":
      deps.showMonsterAttack(effect.name, effect.damage);
      break;
    case "SHOW_MESSAGE":
      await showMessageAsync(effect.text, effect.color);
      break;
    case "SHOW_ITEM_SELECTION":
      await showItemSelectionAsync();
      break;
    case "ANIMATE_MANA_GAIN":
      await deps.animateManaGain(effect.index);
      break;
    case "SHOW_CHEST_CLOSED":
      deps.objects.chestClosedSprite.visible = true;
      deps.objects.chestOpenSprite.visible = false;
      break;
    case "ANIMATE_CHEST_OPEN":
      deps.objects.chestClosedSprite.visible = false;
      deps.objects.chestOpenSprite.visible = true;
      await delay(500);
      break;
    case "HIDE_CHEST":
      deps.objects.chestClosedSprite.visible = false;
      deps.objects.chestOpenSprite.visible = false;
      break;
  }
}
