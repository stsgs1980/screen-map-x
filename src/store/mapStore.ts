/**
 * Single zustand store for the map: graph (nodes/edges), UI state and
 * layout actions. zundo `temporal` tracks only nodes/edges, so undo/redo
 * cover drags, connects, deletions and layouts — not hover or selection.
 */
import { applyEdgeChanges, applyNodeChanges, type Connection, type EdgeChange, type NodeChange } from "@xyflow/react";
import { temporal, type TemporalState } from "zundo";
import { create, useStore } from "zustand";
import { NODE_W } from "../data/constants";
import { EDGE_DEFS } from "../data/edges";
import { FIELD_OF, SCREENS, initialPositions, screenHeight } from "../data/screens";
import type { EdgeDef, StatusKey } from "../data/types";
import { defOf, toFlowEdges, type OrthEdge, type PosMap, type ScreenFlowNode } from "../flow";
import { animatePositions } from "../layout/animate";
import { elkLayout } from "../layout/elk";
import { getFlowInstance } from "./flowRef";

/** History-tracked slice: undo/redo snapshots contain only the graph. */
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

/** Full store state: graph, UI fields and actions. */
export interface MapState extends GraphHistory {
  hoverEntity: string | null;
  pinnedEntity: string | null;
  statusFilter: StatusKey | null;
  selectedId: string | null;
  elkBusy: boolean;
  paletteOpen: boolean;
  jsonDialogOpen: boolean;
  helpOpen: boolean;
  contextTarget: ContextTarget | null;
  onNodesChange: (changes: NodeChange<ScreenFlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<OrthEdge>[]) => void;
  onConnect: (conn: Connection) => void;
  setHoverEntity: (entity: string | null) => void;
  togglePin: (entity: string) => void;
  setPinnedEntity: (entity: string | null) => void;
  setStatusFilter: (status: StatusKey | null) => void;
  setSelected: (id: string | null) => void;
  clearSelectionAndPin: () => void;
  focusScreen: (id: string) => void;
  deleteEdge: (id: string) => void;
  applyLayout: (pos: PosMap, defs: EdgeDef[]) => void;
  runElk: () => Promise<void>;
  resetMap: () => void;
  undo: () => void;
  redo: () => void;
  setPaletteOpen: (open: boolean) => void;
  setJsonDialogOpen: (open: boolean) => void;
  setHelpOpen: (open: boolean) => void;
  setContextTarget: (target: ContextTarget | null) => void;
}

const buildInitialNodes = (): ScreenFlowNode[] =>
  SCREENS.map((s) => ({
    id: s.id,
    type: "screen",
    position: { ...s.position },
    data: { screen: s },
    width: NODE_W,
    height: screenHeight(s),
    deletable: false,
  }));

const posMapOf = (nodes: ScreenFlowNode[]): PosMap => Object.fromEntries(nodes.map((n) => [n.id, n.position]));

const isSilentNodeChanges = (changes: NodeChange<ScreenFlowNode>[]): boolean =>
  changes.every((c) => c.type === "select" || c.type === "dimensions" || (c.type === "position" && c.dragging));

/** Main store hook. History lives in `useMapStore.temporal` (see zundo). */
export const useMapStore = create<MapState>()(
  temporal(
    (set, get) => ({
      nodes: buildInitialNodes(),
      edges: toFlowEdges(EDGE_DEFS, initialPositions()),
      hoverEntity: null,
      pinnedEntity: null,
      statusFilter: null,
      selectedId: null,
      elkBusy: false,
      paletteOpen: false,
      jsonDialogOpen: false,
      helpOpen: false,
      contextTarget: null,

      onNodesChange: (changes) => {
        const next = applyNodeChanges(changes, get().nodes);
        if (isSilentNodeChanges(changes)) applySilent(() => set({ nodes: next }));
        else set({ nodes: next });
      },
      onEdgesChange: (changes) => {
        const next = applyEdgeChanges(changes, get().edges);
        if (changes.every((c) => c.type === "select")) applySilent(() => set({ edges: next }));
        else set({ edges: next });
      },
      onConnect: (conn) => {
        if (!conn.source || !conn.target || !conn.sourceHandle || !conn.targetHandle) return;
        const fromEntity = conn.sourceHandle.split("|")[0].split(".").pop() ?? "";
        const toEntity = conn.targetHandle.split("|")[0].split(".").pop() ?? "";
        if (conn.source === conn.target && fromEntity === toEntity) return;
        const entity = FIELD_OF(conn.source, fromEntity)?.entity ?? fromEntity;
        const defs = get().edges.map(defOf);
        const def: EdgeDef = {
          id: `e-${entity}-${conn.source}-${conn.target}-${defs.length}`,
          entity,
          from: { screen: conn.source, entity: fromEntity },
          to: { screen: conn.target, entity: toEntity },
          note: "связь добавлена вручную",
        };
        if (defs.some((d) => d.id === def.id)) return;
        set({ edges: toFlowEdges([...defs, def], posMapOf(get().nodes)) });
      },

      setHoverEntity: (hoverEntity) => set({ hoverEntity }),
      togglePin: (entity) => set({ pinnedEntity: get().pinnedEntity === entity ? null : entity }),
      setPinnedEntity: (pinnedEntity) => set({ pinnedEntity }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setSelected: (id) => {
        applySilent(() => set({ nodes: get().nodes.map((n) => ({ ...n, selected: n.id === id })) }));
        set({ selectedId: id });
      },
      clearSelectionAndPin: () => {
        applySilent(() => set({ nodes: get().nodes.map((n) => ({ ...n, selected: false })) }));
        set({ selectedId: null, pinnedEntity: null });
      },
      focusScreen: (id) => {
        get().setSelected(id);
        getFlowInstance()?.fitView({ nodes: [{ id }], padding: 0.5, maxZoom: 1.1, duration: 450 });
      },
      deleteEdge: (id) => set({ edges: get().edges.filter((e) => e.id !== id) }),

      applyLayout: (pos, defs) => {
        const start = posMapOf(get().nodes);
        const finish = (target: PosMap): void => {
          set({
            nodes: get().nodes.map((n) => ({ ...n, position: target[n.id] ?? n.position })),
            edges: toFlowEdges(defs, target),
          });
          const fit = (): void => void getFlowInstance()?.fitView({ padding: 0.12, maxZoom: 1, duration: 450 });
          if (typeof requestAnimationFrame === "function") requestAnimationFrame(fit);
          else fit();
        };
        const temporalState = useMapStore.temporal.getState();
        temporalState.pause();
        animatePositions(
          start,
          pos,
          380,
          (current) => set({ nodes: get().nodes.map((n) => ({ ...n, position: current[n.id] ?? n.position })) }),
          (target) => {
            temporalState.resume();
            finish(target);
          },
        );
      },
      runElk: async () => {
        set({ elkBusy: true });
        try {
          const defs = get().edges.map(defOf);
          const pos = await elkLayout(SCREENS, defs);
          get().applyLayout(pos, defs);
        } finally {
          set({ elkBusy: false });
        }
      },
      resetMap: () => get().applyLayout(initialPositions(), EDGE_DEFS),
      undo: () => {
        useMapStore.temporal.getState().undo();
        resyncSelection();
      },
      redo: () => {
        useMapStore.temporal.getState().redo();
        resyncSelection();
      },

      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
      setJsonDialogOpen: (jsonDialogOpen) => set({ jsonDialogOpen }),
      setHelpOpen: (helpOpen) => set({ helpOpen }),
      setContextTarget: (contextTarget) => set({ contextTarget }),
    }),
    {
      partialize: (state): GraphHistory => ({ nodes: state.nodes, edges: state.edges }),
      limit: 50,
      equality: (a, b) => a.nodes === b.nodes && a.edges === b.edges,
    },
  ),
);

function applySilent(fn: () => void): void {
  const temporalState = useMapStore.temporal.getState();
  temporalState.pause();
  fn();
  temporalState.resume();
}

function resyncSelection(): void {
  const { nodes, selectedId } = useMapStore.getState();
  applySilent(() => useMapStore.setState({ nodes: nodes.map((n) => ({ ...n, selected: n.id === selectedId })) }));
}

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
