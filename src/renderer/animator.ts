import * as THREE from "three";

function tween(
  from: number,
  to: number,
  durationMs: number,
  set: (v: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    function frame(now: number) {
      const t = Math.min((now - start) / durationMs, 1);
      set(from + (to - from) * t);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

export async function animateMonsterAttack(
  sprite: THREE.Sprite,
): Promise<void> {
  const oz = sprite.position.z;
  const oy = sprite.position.y;
  await Promise.all([
    tween(oz, oz - 0.4, 120, (v) => {
      sprite.position.z = v;
    }),
    tween(oy, oy + 0.1, 120, (v) => {
      sprite.position.y = v;
    }),
  ]);
  await Promise.all([
    tween(oz - 0.4, oz + 0.8, 90, (v) => {
      sprite.position.z = v;
    }),
    tween(oy + 0.1, oy - 0.25, 90, (v) => {
      sprite.position.y = v;
    }),
  ]);
  await Promise.all([
    tween(oz + 0.8, oz, 110, (v) => {
      sprite.position.z = v;
    }),
    tween(oy - 0.25, oy, 110, (v) => {
      sprite.position.y = v;
    }),
  ]);
}
