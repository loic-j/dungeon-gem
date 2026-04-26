import * as THREE from 'three'

export function createDungeon(): THREE.Group {
  const group = new THREE.Group()

  const floorMat = new THREE.MeshBasicMaterial({ color: 0x2a2a2a })
  const ceilMat  = new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
  const wallMat  = new THREE.MeshBasicMaterial({ color: 0x3a3530 })

  // Extends from near camera (z≈3) to deep background (z≈-57), center at z=-27
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 60), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, -1.2, -27)
  group.add(floor)

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(6, 60), ceilMat)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.set(0, 1.8, -27)
  group.add(ceiling)

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 3), wallMat)
  leftWall.rotation.y = Math.PI / 2
  leftWall.position.set(-2.5, 0.3, -27)
  group.add(leftWall)

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 3), wallMat)
  rightWall.rotation.y = -Math.PI / 2
  rightWall.position.set(2.5, 0.3, -27)
  group.add(rightWall)

  return group
}
