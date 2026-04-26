import * as THREE from "three";
import type { MonsterType } from "../game/types";
import { createDungeon } from "./dungeon";
import { createMonsterSprite } from "./sprites";

export interface SceneObjects {
  monsterSprite: THREE.Sprite;
}

export function initScene(
  canvas: HTMLCanvasElement,
  monsterType: MonsterType,
): {
  renderer: THREE.WebGLRenderer;
  objects: SceneObjects;
  animateWalk: () => Promise<void>;
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

  scene.add(createDungeon());

  const monsterSprite = createMonsterSprite(monsterType);
  scene.add(monsterSprite);

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

  function animateWalk(): Promise<void> {
    return new Promise((resolve) => {
      const startZ = camera.position.z;
      const endZ = -4;
      const duration = 550;
      const start = performance.now();

      function step(now: number) {
        const t = Math.min(1, (now - start) / duration);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        camera.position.z = startZ + (endZ - startZ) * eased;
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          camera.position.z = startZ;
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  function dispose() {
    ro.disconnect();
    cancelAnimationFrame(animId);
    renderer.dispose();
  }

  return { renderer, objects: { monsterSprite }, animateWalk, dispose };
}
