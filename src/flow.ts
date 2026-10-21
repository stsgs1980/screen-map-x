/**
 * EdgeDef -> React Flow edge conversion.
 * Handle sides (L/R) are derived from current geometry, so after an ELK
 * re-layout or a reset we simply rebuild the edges and every connector
 * exits the field row on the side facing its counterpart.
 */
import { MarkerType, type Edge } from '@xyflow/react';
import {
  EDGE_STYLE,
  NODE_W,
  fieldId,
  portId,
  type EdgeDef,
  type OrthData,
  type Side,
} from './data/schema';

export type OrthEdge = Edge<OrthData, 'orth'>;
export type PosMap = Record<string, { x: number; y: number }>;

const centerX = (pos: PosMap, screen: string) => (pos[screen]?.x ?? 0) + NODE_W / 2;

/** Pick port sides so the line leaves each card facing the other card. */
export function sidesFor(fromScreen: string, toScreen: string, pos: PosMap): [Side, Side] {
  const dx = centerX(pos, toScreen) - centerX(pos, fromScreen);
  if (dx > 8) return ['R', 'L'];
  if (dx < -8) return ['L', 'R'];
  // Same column: route through the channel that faces the canvas centre.
  return centerX(pos, fromScreen) <= 600 ? ['R', 'R'] : ['L', 'L'];
}

export function toFlowEdges(defs: EdgeDef[], pos: PosMap): OrthEdge[] {
  const pairCount = new Map<string, number>();
  return defs.map((def) => {
    const pair = [def.from.screen, def.to.screen].sort().join('::');
    const idx = pairCount.get(pair) ?? 0;
    pairCount.set(pair, idx + 1);
    const [srcSide, tgtSide] = sidesFor(def.from.screen, def.to.screen, pos);
    return {
      id: def.id,
      type: 'orth',
      source: def.from.screen,
      target: def.to.screen,
      sourceHandle: portId(fieldId(def.from.screen, def.from.entity), srcSide, 'out'),
      targetHandle: portId(fieldId(def.to.screen, def.to.entity), tgtSide, 'in'),
      // parallel spokes between the same pair get increasing step offsets
      data: { entity: def.entity, note: def.note, offset: 14 + idx * 12, from: def.from, to: def.to },
      markerEnd: { type: MarkerType.ArrowClosed, width: 9, height: 9, color: EDGE_STYLE.color },
      deletable: true,
    };
  });
}

/** Recover the semantic EdgeDef from a live flow edge (for export / ELK). */
export function defOf(e: OrthEdge): EdgeDef {
  const data = e.data as OrthData;
  return { id: e.id, entity: data.entity, note: data.note, from: data.from, to: data.to };
}
