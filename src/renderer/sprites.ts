import * as THREE from "three";

const loader = new THREE.TextureLoader();

export function createChestClosedSprite(): THREE.Sprite {
  const texture = loader.load("/sprites/chest.svg");
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.8, 1.35, 1);
  sprite.position.set(0, -0.45, -3.5);
  return sprite;
}

export function createChestOpenSprite(): THREE.Sprite {
  const texture = loader.load("/sprites/chest-open.svg");
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.8, 1.35, 1);
  sprite.position.set(0, -0.45, -3.5);
  return sprite;
}
