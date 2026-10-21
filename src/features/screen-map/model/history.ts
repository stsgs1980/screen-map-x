import type { TemporalState } from "zundo";
import type { GraphHistory } from "./types";

interface TemporalStoreApi {
  getState: () => TemporalState<GraphHistory>;
}

let temporalStore: TemporalStoreApi | null = null;

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
  if (!temporalStore) {
    update();
    return;
  }

  const temporalState = temporalStore.getState();
  temporalState.pause();
  try {
    update();
  } finally {
    temporalState.resume();
  }
}

/** Pause graph history tracking, for example during a layout animation. */
export function pauseHistory(): void {
  temporalStore?.getState().pause();
}

/** Resume graph history tracking after a paused update sequence. */
export function resumeHistory(): void {
  temporalStore?.getState().resume();
}

/** Undo the latest recorded graph change. */
export function undoHistory(): void {
  temporalStore?.getState().undo();
}

/** Redo the latest undone graph change. */
export function redoHistory(): void {
  temporalStore?.getState().redo();
}
