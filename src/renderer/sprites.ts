import * as THREE from 'three'

const loader = new THREE.TextureLoader()

export function createMonsterSprite(): THREE.Sprite {
  const texture = loader.load('/sprites/monster-skeleton.svg')
  texture.colorSpace = THREE.SRGBColorSpace
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(1.4, 1.8, 1)
  sprite.position.set(0, 0.2, -3.5)
  return sprite
}
