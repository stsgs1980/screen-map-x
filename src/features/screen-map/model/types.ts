import type { Connection, EdgeChange, NodeChange } from "@xyflow/react";
import type { StateCreator } from "zustand/vanilla";
import type { EdgeDef, StatusKey } from "../data/types";
import type { OrthEdge, PosMap, ScreenFlowNode } from "../flow/adapter";

/** History-tracked graph data: undo/redo snapshots contain only nodes and edges. */
export interface GraphHistory {
  nodes: ScreenFlowNode[];
  edges: OrthEdge[];
}

/** Right-click target on the canvas (screen coordinates for the menu anchor). */
export interface ContextTarget {
  kind: "node" | "edge";
  id: string;
  x: number;
  y: number;
}

/** Graph-owned state and actions: React Flow graph, layouts and history commands. */
export interface GraphSlice extends GraphHistory {
  elkBusy: boolean;
  onNodesChange: (changes: NodeChange<ScreenFlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<OrthEdge>[]) => void;
  onConnect: (conn: Connection) => void;
  deleteEdge: (id: string) => void;
  applyLayout: (pos: PosMap, defs: EdgeDef[]) => void;
  runElk: () => Promise<void>;
  resetMap: () => void;
  undo: () => void;
  redo: () => void;
}

/** UI-owned state and actions: selection, route highlighting, filters and overlays. */
export interface UiSlice {
  hoverEntity: string | null;
  pinnedEntity: string | null;
  statusFilter: StatusKey | null;
  selectedId: string | null;
  paletteOpen: boolean;
  jsonDialogOpen: boolean;
  helpOpen: boolean;
  contextTarget: ContextTarget | null;
  setHoverEntity: (entity: string | null) => void;
  togglePin: (entity: string) => void;
  setPinnedEntity: (entity: string | null) => void;
  setStatusFilter: (status: StatusKey | null) => void;
  setSelected: (id: string | null) => void;
  clearSelectionAndPin: () => void;
  focusScreen: (id: string) => void;
  setPaletteOpen: (open: boolean) => void;
  setJsonDialogOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  setContextTarget: (target: ContextTarget | null) => void;
}

/** Full screen-map store state composed from graph and UI slices. */
export type MapState = GraphSlice & UiSlice;

/** Zustand slice creator bound to the composed store and zundo temporal middleware. */
export type MapSliceCreator<TSlice> = StateCreator<MapState, [["temporal", unknown]], [], TSlice>;
