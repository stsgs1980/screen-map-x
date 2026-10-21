import {
  CANVAS,
  CHROME_H,
  EDGE_STYLE,
  ELK_OPTIONS,
  HEAD_H,
  NODE_W,
  PORT_SIZE,
  ROW_H,
  SECTION_PATH,
  SKEL_H,
} from "./constants";
import { ENTITY_META } from "./entities";
import { fieldId, portId } from "./fields";
import { SCREENS, screenHeight } from "./screens";
import { STATUS, STATUS_KEYS } from "./status";
import type { EdgeDef, IconName, ScreenDef, Side, StatusKey } from "./types";

/** JSON schema export shape: meta, screens with ports, entity routes, edges. */
export interface SchemaExport {
  meta: {
    section: string;
    path: string;
    title: string;
    exportedAt: string;
    stack: {
      graph: string;
      layout: { engine: string; algorithm: string; direction: string; edgeRouting: string };
    };
    canvas: { width: number; height: number; bg: string; grid: number };
    components: Record<string, Record<string, number>>;
    edgeStyle: Record<string, string | number>;
    statusPalette: Record<string, string>;
    caption: Record<string, string>;
    counts: { screens: number; fields: number; edges: number; entities: number };
  };
  screens: {
    id: string;
    code: string;
    title: string;
    route: string;
    hub: boolean;
    skeleton: boolean;
    position: { x: number; y: number };
    size: { width: number; height: number };
    description: string;
    api: ScreenDef["api"];
    states: string[];
    fields: {
      id: string;
      entity: string;
      label: string;
      name: string;
      type: string;
      status: StatusKey;
      statusColor: string;
      icon: IconName | undefined;
      ports: { id: string; side: string; kind: "in" | "out" }[];
    }[];
  }[];
  entities: {
    key: string;
    label: string;
    icon: IconName;
    fields: { ref: string; screen: string; name: string; type: string; status: StatusKey }[];
    route: string[];
  }[];
  edges: {
    id: string;
    entity: string;
    note: string;
    from: { screen: string; field: string };
    to: { screen: string; field: string };
  }[];
}

/**
 * Build the entity index: every entity with the fields that carry it and the
 * ids of the edges that hand it over.
 * @param screens - screen definitions
 * @param defs - current field-to-field edges
 * @returns entity index
 */
const buildEntities = (screens: ScreenDef[], defs: EdgeDef[]): SchemaExport["entities"] =>
  Object.entries(ENTITY_META).map(([key, meta]) => ({
    key,
    label: meta.label,
    icon: meta.icon,
    fields: screens.flatMap((s) =>
      s.fields
        .filter((f) => f.entity === key)
        .map((f) => ({ ref: fieldId(s.id, key), screen: s.id, name: f.name, type: f.type, status: f.status })),
    ),
    route: defs.filter((e) => e.entity === key).map((e) => e.id),
  }));

/**
 * Build the export header: stack, canvas geometry, palettes and counters.
 * @param screens - screen definitions
 * @param defs - current field-to-field edges
 * @param entities - entity index
 * @returns export metadata
 */
const buildMeta = (
  screens: ScreenDef[],
  defs: EdgeDef[],
  entities: SchemaExport["entities"],
): SchemaExport["meta"] => ({
  section: "X",
  path: SECTION_PATH,
  title: "Screen-map-x",
  exportedAt: new Date().toISOString(),
  stack: { graph: "React Flow (@xyflow/react)", layout: { engine: "elkjs", ...ELK_OPTIONS } },
  canvas: { ...CANVAS },
  components: {
    "card/screen": { width: NODE_W, header: HEAD_H, row: ROW_H, skeleton: SKEL_H, chrome: CHROME_H },
    "card/field": { icon: 12, port: PORT_SIZE },
  },
  edgeStyle: { ...EDGE_STYLE, binding: "field->field" },
  statusPalette: Object.fromEntries(STATUS_KEYS.map((k) => [k, STATUS[k].color])),
  caption: { font: "mono 10px", letterSpacing: ".11em", color: "#5A5A5A" },
  counts: {
    screens: screens.length,
    fields: screens.reduce((n, s) => n + s.fields.length, 0),
    edges: defs.length,
    entities: entities.length,
  },
});

/**
 * Build the screen list with their fields and ports.
 * @param screens - screen definitions
 * @param positions - current node positions by screen id
 * @returns screen list
 */
const buildScreens = (
  screens: ScreenDef[],
  positions: Record<string, { x: number; y: number }>,
): SchemaExport["screens"] =>
  screens.map((s) => ({
    id: s.id,
    code: s.code,
    title: s.title,
    route: s.route,
    hub: !!s.hub,
    skeleton: !!s.skeleton,
    position: positions[s.id] ?? s.position,
    size: { width: NODE_W, height: screenHeight(s) },
    description: s.description,
    api: s.api,
    states: s.states,
    fields: s.fields.map((f) => ({
      id: fieldId(s.id, f.entity),
      entity: f.entity,
      label: f.label,
      name: f.name,
      type: f.type,
      status: f.status,
      statusColor: STATUS[f.status].color,
      icon: ENTITY_META[f.entity]?.icon,
      ports: ["L", "R"].flatMap((side) =>
        (["in", "out"] as const).map((kind) => ({
          id: portId(fieldId(s.id, f.entity), side as Side, kind),
          side,
          kind,
        })),
      ),
    })),
  }));

/**
 * Build the edge list with resolved field references.
 * @param defs - current field-to-field edges
 * @returns edge list
 */
const buildEdges = (defs: EdgeDef[]): SchemaExport["edges"] =>
  defs.map((e) => ({
    id: e.id,
    entity: e.entity,
    note: e.note,
    from: { screen: e.from.screen, field: fieldId(e.from.screen, e.from.entity) },
    to: { screen: e.to.screen, field: fieldId(e.to.screen, e.to.entity) },
  }));

/**
 * Build the downloadable JSON schema of the current map.
 * @param positions - current node positions by screen id
 * @param defs - current field-to-field edges
 * @param screens - screen definitions (defaults to the section data)
 * @returns serialisable export payload
 */
export function buildExport(
  positions: Record<string, { x: number; y: number }>,
  defs: EdgeDef[],
  screens: ScreenDef[] = SCREENS,
): SchemaExport {
  const entities = buildEntities(screens, defs);
  return {
    meta: buildMeta(screens, defs, entities),
    screens: buildScreens(screens, positions),
    entities,
    edges: buildEdges(defs),
  };
}
