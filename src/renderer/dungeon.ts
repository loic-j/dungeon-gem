import * as THREE from "three";
import type { DungeonGraphics } from "../game/dungeon";

function loadTex(loader: THREE.TextureLoader, src: string, u: number, v: number): THREE.Texture {
  const t = loader.load(src);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(u, v);
  return t;
}

export function createStairsRoom(graphics: DungeonGraphics): THREE.Group {
  const group = new THREE.Group();
  const loader = new THREE.TextureLoader();

  // Room: z from 3 (near camera) to -8 (into fog), center at -2.5
  const roomDepth = 11;
  const roomCenterZ = -2.5;

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(5, roomDepth),
    new THREE.MeshBasicMaterial({ map: loadTex(loader, graphics.ceiling, 2, 4) }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 1.8, roomCenterZ);
  group.add(ceiling);

  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(roomDepth, 3),
    new THREE.MeshBasicMaterial({ map: loadTex(loader, graphics.wall, 4, 1) }),
  );
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-2.5, 0.3, roomCenterZ);
  group.add(leftWall);

  const rightWallTex = loadTex(loader, graphics.wall, -4, 1);
  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(roomDepth, 3),
    new THREE.MeshBasicMaterial({ map: rightWallTex }),
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(2.5, 0.3, roomCenterZ);
  group.add(rightWall);

  // Flat floor before stairs (z: 3 → -1, center at 1)
  const flatFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 4),
    new THREE.MeshBasicMaterial({ map: loadTex(loader, graphics.floor, 2, 1) }),
  );
  flatFloor.rotation.x = -Math.PI / 2;
  flatFloor.position.set(0, -1.2, 1);
  group.add(flatFloor);

  // Stairs: 6 steps, each 1 unit deep, 0.35 unit drop, descending toward -z
  // Step i: riser at z=(-1-i), tread top at y=(-1.2 - (i+1)*0.35)
  const treadMat = new THREE.MeshBasicMaterial({
    map: loadTex(loader, graphics.floor, 1, 0.3),
    color: 0xddccaa,
  });
  const riserMat = new THREE.MeshBasicMaterial({ color: 0x251a0d });

  for (let i = 0; i < 6; i++) {
    const riserZ = -1 - i;
    const treadY = -1.2 - (i + 1) * 0.35;

    const tread = new THREE.Mesh(new THREE.PlaneGeometry(5, 1), treadMat);
    tread.rotation.x = -Math.PI / 2;
    tread.position.set(0, treadY, riserZ - 0.5);
    group.add(tread);

    const riser = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.35), riserMat);
    riser.position.set(0, treadY + 0.175, riserZ);
    group.add(riser);
  }

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
