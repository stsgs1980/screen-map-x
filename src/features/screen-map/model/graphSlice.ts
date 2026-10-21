import { applyEdgeChanges, applyNodeChanges, type Connection, type NodeChange } from "@xyflow/react";
import { NODE_W } from "../data/constants";
import { EDGE_DEFS, nextEdgeId } from "../data/edges";
import { entityOfPort } from "../data/fields";
import { FIELD_OF, SCREENS, initialPositions, screenHeight } from "../data/screens";
import type { EdgeDef } from "../data/types";
import { defOf, toFlowEdges, type OrthEdge, type PosMap, type ScreenFlowNode } from "../flow/adapter";
import { animatePositions } from "../layout/animate";
import { elkLayout } from "../layout/elk";
import { getFlowInstance } from "./flowRef";
import { applySilently, pauseHistory, redoHistory, resumeHistory, undoHistory } from "./history";
import type { ActionResult, ConnectResult, GraphSlice, MapSliceCreator, MapState } from "./types";

/** Set and get of the composed store, handed to the slice helpers. */
interface SliceContext {
  set: (partial: Partial<MapState>) => void;
  get: () => MapState;
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

/**
 * Rebuild flow edges from semantic defs, keeping the selection state of the
 * edges that survive the rebuild.
 * @param defs - semantic edges
 * @param pos - positions by screen id
 * @param previous - edges before the rebuild
 * @returns rebuilt edges
 */
const rebuildEdges = (defs: EdgeDef[], pos: PosMap, previous: OrthEdge[]): OrthEdge[] => {
  const selected = new Set(previous.filter((e) => e.selected).map((e) => e.id));
  return toFlowEdges(defs, pos).map((e) => (selected.has(e.id) ? { ...e, selected: true } : e));
};

/**
 * Human-readable text of a thrown value.
 * @param error - thrown value
 * @returns the error message, or the value itself
 */
const errorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));

/** Plan of a manual connection: the edge to add, or the reason it is refused. */
type ConnectPlan = { ok: true; def: EdgeDef } | { ok: false; reason: string };

/**
 * Decide whether a dragged connection is a legal field-to-field hand-off.
 * A legal edge joins two fields of the *same* entity on two different screens;
 * anything else would break the entity-route model the whole map is built on.
 * @param conn - React Flow connection
 * @param defs - semantic edges that already exist
 * @returns the edge to add, or a human-readable refusal
 */
const planConnection = (conn: Connection, defs: EdgeDef[]): ConnectPlan => {
  const { source, target, sourceHandle, targetHandle } = conn;
  if (!source || !target || !sourceHandle || !targetHandle) {
    return { ok: false, reason: "Связь без портов не создаётся" };
  }
  const from = FIELD_OF(source, entityOfPort(sourceHandle));
  const to = FIELD_OF(target, entityOfPort(targetHandle));
  if (!from || !to) {
    return { ok: false, reason: "Поле-источник или поле-приёмник не найдено" };
  }
  if (from.entity !== to.entity) {
    return { ok: false, reason: `Связь должна вести поля одной сущности: ${from.entity} -> ${to.entity}` };
  }
  if (source === target) {
    return { ok: false, reason: "Экран нельзя связать с самим собой" };
  }
  return {
    ok: true,
    def: {
      id: nextEdgeId(defs, from.entity, source, target),
      entity: from.entity,
      from: { screen: source, entity: from.entity },
      to: { screen: target, entity: to.entity },
      note: "связь добавлена вручную",
    },
  };
};

/**
 * React Flow change handlers for nodes and edges.
 * @param ctx - store access
 * @returns the change handlers
 */
const createChangeHandlers = (ctx: SliceContext): Pick<GraphSlice, "onNodesChange" | "onEdgesChange"> => ({
  onNodesChange: (changes) => {
    const next = applyNodeChanges(changes, ctx.get().nodes);
    const previous = ctx.get().edges;
    // Port sides are derived from the geometry, so a moved card needs its
    // edges rebuilt: every connector must leave the field row on the side
    // facing its counterpart.
    const moved = changes.some((c) => c.type === "position");
    const edges = moved ? rebuildEdges(previous.map(defOf), posMapOf(next), previous) : previous;
    const update = (): void => ctx.set({ nodes: next, edges });
    if (isSilentNodeChanges(changes)) applySilently(update);
    else update();
  },
  onEdgesChange: (changes) => {
    const next = applyEdgeChanges(changes, ctx.get().edges);
    if (changes.every((c) => c.type === "select")) applySilently(() => ctx.set({ edges: next }));
    else ctx.set({ edges: next });
  },
});

/**
 * Manual connection command.
 * @param ctx - store access
 * @returns the connect handler
 */
const createConnectHandler =
  (ctx: SliceContext): ((conn: Connection) => ConnectResult) =>
  (conn) => {
    const defs = ctx.get().edges.map(defOf);
    const plan = planConnection(conn, defs);
    if (!plan.ok) return { ok: false, reason: plan.reason };
    ctx.set({ edges: toFlowEdges([...defs, plan.def], posMapOf(ctx.get().nodes)) });
    return { ok: true, id: plan.def.id };
  };

/**
 * Layout commands: animated application, ELK run and hub reset.
 * @param ctx - store access
 * @returns the layout handlers
 */
const createLayoutHandlers = (ctx: SliceContext): Pick<GraphSlice, "applyLayout" | "runElk" | "resetMap"> => {
  /**
   * Serial number of the running layout. A layout that is superseded by a
   * newer one must not write positions any more: the last request wins and
   * the map does not jump between two interpolation paths.
   */
  let layoutRun = 0;

  const applyLayout = (pos: PosMap, defs: EdgeDef[]): void => {
    const run = ++layoutRun;
    const start = posMapOf(ctx.get().nodes);
    const finish = (target: PosMap): void => {
      if (run !== layoutRun) return;
      ctx.set({
        nodes: ctx.get().nodes.map((n) => ({ ...n, position: target[n.id] ?? n.position })),
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
      (current) => {
        if (run !== layoutRun) return;
        ctx.set({ nodes: ctx.get().nodes.map((n) => ({ ...n, position: current[n.id] ?? n.position })) });
      },
      (target) => {
        resumeHistory();
        finish(target);
      },
    );
  };

  const runElk = async (): Promise<ActionResult> => {
    ctx.set({ elkBusy: true });
    try {
      const defs = ctx.get().edges.map(defOf);
      const pos = await elkLayout(SCREENS, defs);
      ctx.get().applyLayout(pos, defs);
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: `Раскладка ELK не удалась: ${errorText(error)}` };
    } finally {
      ctx.set({ elkBusy: false });
    }
  };

  return {
    applyLayout,
    runElk,
    resetMap: () => ctx.get().applyLayout(initialPositions(), EDGE_DEFS),
  };
};

/**
 * Create the graph slice: nodes/edges, React Flow change handlers,
 * layout commands and undo/redo entry points.
 * @returns graph slice state and actions
 */
export const createGraphSlice: MapSliceCreator<GraphSlice> = (set, get) => {
  const ctx: SliceContext = { set, get };

  const resyncSelection = (): void => {
    const { nodes, selectedId } = get();
    applySilently(() => set({ nodes: nodes.map((n) => ({ ...n, selected: n.id === selectedId })) }));
  };

  return {
    nodes: buildInitialNodes(),
    edges: toFlowEdges(EDGE_DEFS, initialPositions()),
    elkBusy: false,
    ...createChangeHandlers(ctx),
    onConnect: createConnectHandler(ctx),
    deleteEdge: (id) => set({ edges: get().edges.filter((e) => e.id !== id) }),
    ...createLayoutHandlers(ctx),
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
