import type { PosMap } from "../flow";

/**
 * Whether the user asked the OS to minimise motion (or there is no window).
 * @returns true when position tweens must be skipped
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Tween node positions with requestAnimationFrame (ELK / reset transitions).
 * @param from - start positions by screen id
 * @param to - target positions by screen id
 * @param duration - milliseconds
 * @param onFrame - called with interpolated positions on every frame
 * @param onDone - called once with the exact target positions
 */
export function animatePositions(
  from: PosMap,
  to: PosMap,
  duration: number,
  onFrame: (pos: PosMap) => void,
  onDone: (pos: PosMap) => void,
): void {
  if (duration <= 0 || prefersReducedMotion()) {
    onDone(to);
    return;
  }
  const start = performance.now();
  const tick = (now: number): void => {
    const t = Math.min(1, (now - start) / duration);
    const k = easeInOutCubic(t);
    const current: PosMap = {};
    for (const id of Object.keys(to)) {
      const a = from[id] ?? to[id];
      const b = to[id];
      current[id] = { x: Math.round(a.x + (b.x - a.x) * k), y: Math.round(a.y + (b.y - a.y) * k) };
    }
    if (t < 1) {
      onFrame(current);
      requestAnimationFrame(tick);
    } else {
      onDone(to);
    }
  };
  requestAnimationFrame(tick);
}
