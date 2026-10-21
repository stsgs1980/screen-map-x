/**
 * Composed screen-map store. Graph and UI state live in separate slices;
 * zundo `temporal` tracks only nodes/edges, so undo/redo cover drags,
 * connects, deletions and layouts — not hover or selection.
 */
import { temporal, type TemporalState } from "zundo";
import { create, useStore } from "zustand";
import { createGraphSlice } from "./graphSlice";
import { registerTemporalStore } from "./history";
import type { GraphHistory, MapState } from "./types";
import { createUiSlice } from "./uiSlice";

export type { ContextTarget, GraphHistory, GraphSlice, MapState, UiSlice } from "./types";

/** Main store hook. History lives in `useMapStore.temporal` (see zundo). */
export const useMapStore = create<MapState>()(
  temporal(
    (set, get, api) => ({
      ...createGraphSlice(set, get, api),
      ...createUiSlice(set, get, api),
    }),
    {
      partialize: (state): GraphHistory => ({ nodes: state.nodes, edges: state.edges }),
      limit: 50,
      equality: (a, b) => a.nodes === b.nodes && a.edges === b.edges,
    },
  ),
);

registerTemporalStore(useMapStore.temporal);

/**
 * Reactive access to the temporal (undo/redo) store.
 * @param selector - temporal state selector
 * @returns selected temporal state slice
 */
export const useTemporalStore = <T>(selector: (state: TemporalState<GraphHistory>) => T): T =>
  useStore(useMapStore.temporal, selector);

/**
 * Entity whose route is currently lit: hover wins over the pinned one.
 * @param state - store state
 * @returns active entity key or null
 */
export const selectActiveEntity = (state: MapState): string | null => state.hoverEntity ?? state.pinnedEntity;
