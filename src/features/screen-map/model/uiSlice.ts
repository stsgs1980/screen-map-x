import { getFlowInstance } from "./flowRef";
import { applySilently } from "./history";
import type { MapSliceCreator, UiSlice } from "./types";

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
    hoverEntity: null,
    pinnedEntity: null,
    statusFilter: null,
    selectedId: null,
    paletteOpen: false,
    jsonDialogOpen: false,
    helpOpen: false,
    contextTarget: null,

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
