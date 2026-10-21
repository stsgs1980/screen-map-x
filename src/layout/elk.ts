/**
 * elkjs layout — `layered`, direction DOWN, orthogonal routing.
 * ELK computes node layering/positions; field->field handle sides are
 * then re-derived from the new geometry (see `toFlowEdges`), and while
 * the user drags cards the live SmoothStep router keeps lines glued
 * to the field ports.
 */
import { NODE_W, screenHeight, type EdgeDef, type ScreenDef } from '../data/schema';

/* elkjs is heavy — load it lazily, only when the user asks for a layout */
let elkPromise: Promise<InstanceType<(typeof import('elkjs/lib/elk.bundled.js'))['default']>> | null = null;
const getElk = () => (elkPromise ??= import('elkjs/lib/elk.bundled.js').then((m) => new m.default()));

export async function elkLayout(
  screens: ScreenDef[],
  defs: EdgeDef[],
): Promise<Record<string, { x: number; y: number }>> {
  const graph = {
    id: 'section-x',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.spacing.nodeNode': '64',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
      'elk.layered.spacing.edgeNodeBetweenLayers': '24',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    },
    children: screens.map((s) => ({ id: s.id, width: NODE_W, height: screenHeight(s) })),
    edges: defs.map((e) => ({ id: e.id, sources: [e.from.screen], targets: [e.to.screen] })),
  };

  const elk = await getElk();
  const result = await elk.layout(graph as never);
  const map: Record<string, { x: number; y: number }> = {};
  for (const child of result.children ?? []) {
    map[child.id] = { x: Math.round(child.x ?? 0), y: Math.round(child.y ?? 0) };
  }
  return map;
}
