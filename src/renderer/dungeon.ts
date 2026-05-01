import * as THREE from "three";
import type { DungeonGraphics } from "../game/dungeon";

function buildCorridor(group: THREE.Group, graphics: DungeonGraphics): void {
  const loader = new THREE.TextureLoader();

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
}

export function createStairsRoom(graphics: DungeonGraphics): THREE.Group {
  const group = new THREE.Group();
  buildCorridor(group, graphics);

  const stairsTex = new THREE.TextureLoader().load("/sprites/stairs.png");
  stairsTex.colorSpace = THREE.SRGBColorSpace;
  const stairsSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: stairsTex, transparent: true }),
  );
  stairsSprite.scale.set(5, 5, 1);
  stairsSprite.position.set(0, 0.3, -4);
  group.add(stairsSprite);

  return group;
}

export function createDungeon(graphics: DungeonGraphics): THREE.Group {
  const group = new THREE.Group();
  buildCorridor(group, graphics);
  return group;
}
