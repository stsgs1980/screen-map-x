import { getFlowInstance } from "./flowRef";
import { applySilently } from "./history";
import type { MapSliceCreator, UiSlice } from "./types";

const HEADER_STORAGE_KEY = "screen-map-x:header-visible";

function readHeaderVisible(): boolean {
  try {
    return typeof localStorage === "undefined" || localStorage.getItem(HEADER_STORAGE_KEY) !== "hidden";
  } catch {
    return true;
  }
}

function writeHeaderVisible(visible: boolean): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(HEADER_STORAGE_KEY, visible ? "visible" : "hidden");
    }
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

/**
 * Create the UI slice: route highlighting, selection, filters,
 * dialogs, command palette and canvas context-menu state.
 * @returns UI slice state and actions
 */
export const createUiSlice: MapSliceCreator<UiSlice> = (set, get) => {
  const syncNodeSelection = (id: string | null): void => {
    applySilently(() => set({ nodes: get().nodes.map((n) => ({ ...n, selected: n.id === id })) }));
  };

  return {
    headerVisible: readHeaderVisible(),
    hoverEntity: null,
    pinnedEntity: null,
    statusFilter: null,
    selectedId: null,
    paletteOpen: false,
    jsonDialogOpen: false,
    helpOpen: false,
    contextTarget: null,

    setHeaderVisible: (headerVisible) => {
      writeHeaderVisible(headerVisible);
      set({ headerVisible });
    },
    toggleHeader: () => get().setHeaderVisible(!get().headerVisible),
    centerMap: () => {
      void getFlowInstance()?.fitView({ padding: 0.12, maxZoom: 1, duration: 350 });
    },
    setHoverEntity: (hoverEntity) => set({ hoverEntity }),
    togglePin: (entity) => set({ pinnedEntity: get().pinnedEntity === entity ? null : entity }),
    setPinnedEntity: (pinnedEntity) => set({ pinnedEntity }),
    setStatusFilter: (statusFilter) => set({ statusFilter }),
    setSelected: (id) => {
      syncNodeSelection(id);
      set({ selectedId: id });
    },
    clearSelectionAndPin: () => {
      syncNodeSelection(null);
      set({ selectedId: null, pinnedEntity: null });
    },
    focusScreen: (id) => {
      get().setSelected(id);
      getFlowInstance()?.fitView({ nodes: [{ id }], padding: 0.5, maxZoom: 1.1, duration: 450 });
    },

    setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
    setJsonDialogOpen: (jsonDialogOpen) => set({ jsonDialogOpen }),
    setHelpOpen: (helpOpen) => set({ helpOpen }),
    setContextTarget: (contextTarget) => set({ contextTarget }),
  };
};
