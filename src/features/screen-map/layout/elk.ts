/**
 * elkjs layout — `layered`, direction DOWN, orthogonal routing.
 * ELK computes node layering/positions; field->field handle sides are
 * then re-derived from the new geometry (see `toFlowEdges`), and while
 * the user drags cards the live SmoothStep router keeps lines glued
 * to the field ports.
 */
import type { ElkNode } from "elkjs/lib/elk-api";
import { CANVAS, ELK_OPTIONS, NODE_W } from "../data/constants";
import { screenHeight } from "../data/screens";
import { type EdgeDef, type ScreenDef } from "../data/types";

/* elkjs is heavy — load it lazily, only when the user asks for a layout */
type ElkInstance = InstanceType<(typeof import("elkjs/lib/elk.bundled.js"))["default"]>;

let elkPromise: Promise<ElkInstance> | null = null;
const getElk = (): Promise<ElkInstance> =>
  (elkPromise ??= import("elkjs/lib/elk.bundled.js").then((m) => new m.default()));

/**
 * Snap a coordinate onto the canvas grid, so a laid-out map keeps the 10 px
 * rhythm of the hand-placed hub-and-satellites layout.
 * @param value - coordinate in pixels
 * @returns the nearest grid coordinate
 */
const snapToGrid = (value: number): number => Math.round(value / CANVAS.grid) * CANVAS.grid;

/**
 * Run the layered DOWN layout over the screens and return node positions.
 * @param screens - screen definitions (sizes are derived from the spec)
 * @param defs - current field-to-field edges
 * @returns positions by screen id
 */
export async function elkLayout(
  screens: ScreenDef[],
  defs: EdgeDef[],
): Promise<Record<string, { x: number; y: number }>> {
  const graph: ElkNode = {
    id: "section-x",
    layoutOptions: {
      "elk.algorithm": ELK_OPTIONS.algorithm,
      "elk.direction": ELK_OPTIONS.direction,
      "elk.edgeRouting": ELK_OPTIONS.edgeRouting,
      "elk.spacing.nodeNode": "64",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.layered.spacing.edgeNodeBetweenLayers": "24",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
    },
    children: screens.map((s) => ({ id: s.id, width: NODE_W, height: screenHeight(s) })),
    edges: defs.map((e) => ({ id: e.id, sources: [e.from.screen], targets: [e.to.screen] })),
  };

  const elk = await getElk();
  const result = await elk.layout(graph);
  const map: Record<string, { x: number; y: number }> = {};
  for (const child of result.children ?? []) {
    map[child.id] = { x: snapToGrid(child.x ?? 0), y: snapToGrid(child.y ?? 0) };
  }
  return map;
}
