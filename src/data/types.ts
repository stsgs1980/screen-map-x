/**
 * Domain types of the screen map. Pure types only: this module has no
 * runtime imports, so Node tooling (the export script) can use it freely.
 */

/** Field status keys; colors live in `status.ts`. */
export type StatusKey = "new" | "sent" | "pending" | "failed" | "none";

/** Icon keys for entity glyphs; the components are mapped in the UI layer. */
export type IconName = "doc" | "user" | "money" | "calendar" | "card" | "swap" | "receipt" | "refund" | "code" | "text";

export interface FieldDef {
  /** entity key — unique within a screen, so it doubles as the field key */
  entity: string;
  label: string;
  /** API/DB field name + type, shown in the inspector spec */
  name: string;
  type: string;
  status: StatusKey;
}

export interface ScreenDef {
  id: string;
  /** signature like `// 02 / A` */
  code: string;
  title: string;
  route: string;
  description: string;
  api: { method: string; path: string }[];
  states: string[];
  skeleton?: boolean;
  hub?: boolean;
  /** initial position — hub in the centre, satellites on the edges */
  position: { x: number; y: number };
  fields: FieldDef[];
}

/** Port side of a field row. */
export type Side = "L" | "R";

/** A field -> field hand-off of one entity. Directions are data-flow, not buttons. */
export interface EdgeDef {
  id: string;
  entity: string;
  from: { screen: string; entity: string };
  to: { screen: string; entity: string };
  note: string;
}
