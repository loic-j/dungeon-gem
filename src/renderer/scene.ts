import * as THREE from "three";
import type { MonsterType } from "../game/types";
import type { DungeonGraphics } from "../game/dungeon";
import { createDungeon } from "./dungeon";
import { createChestClosedSprite, createChestOpenSprite } from "./sprites";

export interface SceneObjects {
  monsterSprite: THREE.Sprite;
  chestClosedSprite: THREE.Sprite;
  chestOpenSprite: THREE.Sprite;
}

export function initScene(
  canvas: HTMLCanvasElement,
  dungeonGraphics: DungeonGraphics,
): {
  renderer: THREE.WebGLRenderer;
  objects: SceneObjects;
  animateWalk: () => Promise<void>;
  animateStageTransition: () => Promise<void>;
  hideStageTransition: () => void;
  setMonsterType: (monster: MonsterType) => void;
  dispose: () => void;
} {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0b09);
  scene.fog = new THREE.Fog(0x0d0b09, 8, 22);

  const camera = new THREE.PerspectiveCamera(75, 9 / 16, 0.1, 100);
  camera.position.set(0, 0, 2);
  camera.lookAt(0, 0, -1);

  const dungeonGroup = createDungeon(dungeonGraphics);
  scene.add(dungeonGroup);

  function setMonsterType(monster: MonsterType) {
    const { path, scale, position } = monster.sprite;
    const material = monsterSprite.material as THREE.SpriteMaterial;
    material.map?.dispose();
    const texture = new THREE.TextureLoader().load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    material.map = texture;
    material.needsUpdate = true;
    monsterSprite.scale.set(...scale);
    monsterSprite.position.set(...position);
  }

  const monsterSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ transparent: true }),
  );
  scene.add(monsterSprite);

  const chestClosedSprite = createChestClosedSprite();
  chestClosedSprite.visible = false;
  scene.add(chestClosedSprite);

  const chestOpenSprite = createChestOpenSprite();
  chestOpenSprite.visible = false;
  scene.add(chestOpenSprite);

  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement ?? canvas);
  resize();

  let animId: number;

  function animate() {
    animId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  let stairsPlane: THREE.Mesh | null = null;
  if (dungeonGraphics.stageTransition) {
    const tex = new THREE.TextureLoader().load(dungeonGraphics.stageTransition);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
    });
    stairsPlane = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), mat);
    stairsPlane.position.set(0, 0.3, -5);
    stairsPlane.visible = false;
    scene.add(stairsPlane);
  }

  function animateStageTransition(): Promise<void> {
    return new Promise((resolve) => {
      if (!stairsPlane) {
        resolve();
        return;
      }
      const mat = stairsPlane.material as THREE.MeshBasicMaterial;
      // Camera travels Z=2→-4 (delta -6). To keep apparent staircase size constant
      // across the final snap, stairs must also shift -6: restZ=-5 → animEndZ=-11.
      // At snap: camera -4→2 (+6) and stairs -11→-5 (+6) simultaneously → distance
      // stays 7 before and after → no visible resize.
      const stairsStartZ = -20;
      const stairsAnimEndZ = -11;
      const stairsRestZ = -5;
      const camStartZ = camera.position.z;
      const camEndZ = -4;
      const duration = 900;
      const start = performance.now();
      stairsPlane.position.z = stairsStartZ;
      mat.opacity = 0;
      stairsPlane.visible = true;

      function step(now: number) {
        const t = Math.min(1, (now - start) / duration);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        stairsPlane!.position.z =
          stairsStartZ + (stairsAnimEndZ - stairsStartZ) * eased;
        mat.opacity = eased;
        camera.position.z = camStartZ + (camEndZ - camStartZ) * eased;
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          // Simultaneous snap: both shift +6 units — apparent distance unchanged.
          stairsPlane!.position.z = stairsRestZ;
          mat.opacity = 1;
          camera.position.z = camStartZ;
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  function hideStageTransition(): void {
    if (!stairsPlane) return;
    stairsPlane.visible = false;
    (stairsPlane.material as THREE.MeshBasicMaterial).opacity = 0;
    camera.position.z = 2;
  }

  function animateWalk(): Promise<void> {
    return new Promise((resolve) => {
      const homeZ = 2;
      const startZ = camera.position.z;
      const endZ = startZ - 6;
      const duration = 550;
      const start = performance.now();

      function step(now: number) {
        const t = Math.min(1, (now - start) / duration);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        camera.position.z = startZ + (endZ - startZ) * eased;
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          camera.position.z = homeZ;
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  function dispose() {
    ro.disconnect();
    cancelAnimationFrame(animId);
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Sprite) {
        if (obj instanceof THREE.Mesh) obj.geometry.dispose();
        const mats = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        for (const mat of mats) {
          if (
            mat instanceof THREE.SpriteMaterial ||
            mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshBasicMaterial
          ) {
            mat.map?.dispose();
          }
          mat.dispose();
        }
      }
    });
    renderer.dispose();
  }

  return {
    renderer,
    objects: { monsterSprite, chestClosedSprite, chestOpenSprite },
    animateWalk,
    animateStageTransition,
    hideStageTransition,
    setMonsterType,
    dispose,
  };
}
