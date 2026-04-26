import * as THREE from 'three'

export function createDungeon(): THREE.Group {
  const group = new THREE.Group()

  const floorMat   = new THREE.MeshBasicMaterial({ color: 0x2a2a2a })
  const ceilMat    = new THREE.MeshBasicMaterial({ color: 0x1a1a1a })
  const wallMat    = new THREE.MeshBasicMaterial({ color: 0x3a3530 })
  const backMat    = new THREE.MeshBasicMaterial({ color: 0x2e2925 })

  const floorGeo = new THREE.PlaneGeometry(6, 10)
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, -1.2, -2)
  group.add(floor)

  const ceilGeo = new THREE.PlaneGeometry(6, 10)
  const ceiling = new THREE.Mesh(ceilGeo, ceilMat)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.set(0, 1.8, -2)
  group.add(ceiling)

  const wallGeo = new THREE.PlaneGeometry(10, 3)

  const leftWall = new THREE.Mesh(wallGeo, wallMat)
  leftWall.rotation.y = Math.PI / 2
  leftWall.position.set(-2.5, 0.3, -2)
  group.add(leftWall)

  const rightWall = new THREE.Mesh(wallGeo, wallMat)
  rightWall.rotation.y = -Math.PI / 2
  rightWall.position.set(2.5, 0.3, -2)
  group.add(rightWall)

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), backMat)
  backWall.position.set(0, 0.3, -6)
  group.add(backWall)

  return group
}
