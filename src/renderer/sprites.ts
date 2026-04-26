import * as THREE from "three";
import type { MonsterType } from "../game/types";

const loader = new THREE.TextureLoader();

export function createMonsterSprite(monsterType: MonsterType): THREE.Sprite {
  const { path, scale, position } = monsterType.sprite;
  const texture = loader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(...scale);
  sprite.position.set(...position);
  return sprite;
}
