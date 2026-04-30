import * as THREE from "three";
import type { DungeonGraphics } from "../game/dungeon";


export function createStairsRoom(graphics: DungeonGraphics): THREE.Group {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();

  // Full corridor identical to normal dungeon
  const wallTex = loader.load(graphics.wall);
  wallTex.wrapS = THREE.RepeatWrapping;
  wallTex.wrapT = THREE.RepeatWrapping;
  wallTex.repeat.set(20, 1);
  const wallTexRight = wallTex.clone();
  wallTexRight.repeat.set(-20, 1);

  const floorTex = loader.load(graphics.floor);
  floorTex.wrapS = THREE.RepeatWrapping;
  floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(2, 20);

  const ceilTex = loader.load(graphics.ceiling);
  ceilTex.wrapS = THREE.RepeatWrapping;
  ceilTex.wrapT = THREE.RepeatWrapping;
  ceilTex.repeat.set(2, 20);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 60),
    new THREE.MeshBasicMaterial({ map: floorTex }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -1.2, -27);
  group.add(floor);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 60),
    new THREE.MeshBasicMaterial({ map: ceilTex }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 1.8, -27);
  group.add(ceiling);

  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 3),
    new THREE.MeshBasicMaterial({ map: wallTex }),
  );
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-2.5, 0.3, -27);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 3),
    new THREE.MeshBasicMaterial({ map: wallTexRight }),
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(2.5, 0.3, -27);
  group.add(rightWall);

  // Stairs panel: replaces floor section directly ahead (z: 1.5 → -2.5)
  const stairsTex = loader.load("/sprites/stairs.png");
  const stairsPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 4),
    new THREE.MeshBasicMaterial({ map: stairsTex }),
  );
  stairsPanel.rotation.x = -Math.PI / 2;
  stairsPanel.position.set(0, -1.19, -5);
  group.add(stairsPanel);

  return group;
}

export function createDungeon(graphics: DungeonGraphics): THREE.Group {
  const group = new THREE.Group();

  const loader = new THREE.TextureLoader();
  const wallTex = loader.load(graphics.wall);
  wallTex.wrapS = THREE.RepeatWrapping;
  wallTex.wrapT = THREE.RepeatWrapping;
  // Wall plane is 60 units deep × 3 units tall; tile every 3 units along depth
  wallTex.repeat.set(20, 1);

  const wallTexRight = wallTex.clone();
  wallTexRight.repeat.set(-20, 1); // mirror horizontally for right wall

  const floorTex = loader.load(graphics.floor);
  floorTex.wrapS = THREE.RepeatWrapping;
  floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(2, 20);
  const floorMat = new THREE.MeshBasicMaterial({ map: floorTex });

  const ceilTex = loader.load(graphics.ceiling);
  ceilTex.wrapS = THREE.RepeatWrapping;
  ceilTex.wrapT = THREE.RepeatWrapping;
  ceilTex.repeat.set(2, 20);
  const ceilMat = new THREE.MeshBasicMaterial({ map: ceilTex });
  const leftWallMat = new THREE.MeshBasicMaterial({ map: wallTex });
  const rightWallMat = new THREE.MeshBasicMaterial({ map: wallTexRight });

  // Extends from near camera (z≈3) to deep background (z≈-57), center at z=-27
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 60), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -1.2, -27);
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(6, 60), ceilMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 1.8, -27);
  group.add(ceiling);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 3), leftWallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-2.5, 0.3, -27);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 3),
    rightWallMat,
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(2.5, 0.3, -27);
  group.add(rightWall);

  return group;
}
