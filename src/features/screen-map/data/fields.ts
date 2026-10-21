import type { Side } from "./types";

/**
 * Global field id, e.g. `hub.invoice`.
 * @param screen - screen id
 * @param entity - entity key of the field
 * @returns dotted field id
 */
export const fieldId = (screen: string, entity: string): string => `${screen}.${entity}`;

/**
 * Port (Handle) id of a field row side. Ports are separate child elements
 * of the row, so connectors stay glued to fields when cards move.
 * @param fId - global field id
 * @param side - row edge
 * @param kind - direction
 * @returns port id like `hub.invoice|R|out`
 */
export const portId = (fId: string, side: Side, kind: "in" | "out"): string => `${fId}|${side}|${kind}`;
