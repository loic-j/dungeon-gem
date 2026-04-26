import * as THREE from 'three'

function makeSprite(color: number, width: number, height: number): THREE.Sprite {
  const mat = new THREE.SpriteMaterial({ color })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(width, height, 1)
  return sprite
}

export function createMonsterSprite(): THREE.Sprite {
  const sprite = makeSprite(0xcc2222, 1.4, 1.8)
  sprite.position.set(0, 0.2, -3.5)
  return sprite
}

export function createPlayerSprite(): THREE.Sprite {
  const sprite = makeSprite(0x2255cc, 0.8, 1.0)
  sprite.position.set(-1.4, -0.6, 0.5)
  return sprite
}
