import type { TemporalState } from "zundo";
import type { GraphHistory } from "./types";

interface TemporalStoreApi {
  getState: () => TemporalState<GraphHistory>;
}

let temporalStore: TemporalStoreApi | null = null;

/**
 * Nesting depth of history pauses. The history records only at depth 0, so a
 * silent update or a layout animation that runs inside another pause cannot
 * re-enable tracking and leak intermediate frames into the undo stack.
 */
let pauseDepth = 0;

/**
 * Register the zundo temporal store created by the composed map store.
 * Slice modules use this bridge instead of importing the composed store,
 * which would create an import cycle.
 * @param store - temporal store API exposed as `useMapStore.temporal`
 */
export function registerTemporalStore(store: TemporalStoreApi): void {
  temporalStore = store;
}

/**
 * Run a state update without recording it in graph history.
 * @param update - state update to apply while history tracking is paused
 */
export function applySilently(update: () => void): void {
  pauseHistory();
  try {
    update();
  } finally {
    resumeHistory();
  }
}

/** Pause graph history tracking, for example during a layout animation. */
export function pauseHistory(): void {
  pauseDepth += 1;
  temporalStore?.getState().pause();
}

/** Resume graph history tracking after a paused update sequence. */
export function resumeHistory(): void {
  pauseDepth = Math.max(0, pauseDepth - 1);
  if (pauseDepth === 0) temporalStore?.getState().resume();
}

/** Undo the latest recorded graph change. */
export function undoHistory(): void {
  temporalStore?.getState().undo();
}

/** Redo the latest undone graph change. */
export function redoHistory(): void {
  temporalStore?.getState().redo();
}
