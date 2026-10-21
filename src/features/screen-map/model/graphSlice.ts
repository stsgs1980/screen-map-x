import { applyEdgeChanges, applyNodeChanges, type NodeChange } from "@xyflow/react";
import { NODE_W } from "../data/constants";
import { EDGE_DEFS } from "../data/edges";
import { FIELD_OF, SCREENS, initialPositions, screenHeight } from "../data/screens";
import type { EdgeDef } from "../data/types";
import { defOf, toFlowEdges, type PosMap, type ScreenFlowNode } from "../flow/adapter";
import { animatePositions } from "../layout/animate";
import { elkLayout } from "../layout/elk";
import { getFlowInstance } from "./flowRef";
import { applySilently, pauseHistory, redoHistory, resumeHistory, undoHistory } from "./history";
import type { GraphSlice, MapSliceCreator } from "./types";

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

/**
 * Create the graph slice: nodes/edges, React Flow change handlers,
 * layout commands and undo/redo entry points.
 * @returns graph slice state and actions
 */
export const createGraphSlice: MapSliceCreator<GraphSlice> = (set, get) => {
  const resyncSelection = (): void => {
    const { nodes, selectedId } = get();
    applySilently(() => set({ nodes: nodes.map((n) => ({ ...n, selected: n.id === selectedId })) }));
  };

  return {
    nodes: buildInitialNodes(),
    edges: toFlowEdges(EDGE_DEFS, initialPositions()),
    elkBusy: false,

    onNodesChange: (changes) => {
      const next = applyNodeChanges(changes, get().nodes);
      if (isSilentNodeChanges(changes)) applySilently(() => set({ nodes: next }));
      else set({ nodes: next });
    },
    onEdgesChange: (changes) => {
      const next = applyEdgeChanges(changes, get().edges);
      if (changes.every((c) => c.type === "select")) applySilently(() => set({ edges: next }));
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
      pauseHistory();
      animatePositions(
        start,
        pos,
        380,
        (current) => set({ nodes: get().nodes.map((n) => ({ ...n, position: current[n.id] ?? n.position })) }),
        (target) => {
          resumeHistory();
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
      undoHistory();
      resyncSelection();
    },
    redo: () => {
      redoHistory();
      resyncSelection();
    },
  };
};
