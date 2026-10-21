import { describe, expect, it } from "vitest";
import {
  EDGE_DEFS,
  ENTITY_META,
  FIELD_OF,
  SCREENS,
  STATUS,
  buildExport,
  fieldId,
  initialPositions,
  screenHeight,
} from "./schema";

describe("screen map data", () => {
  it("has a hub and unique screen/field ids", () => {
    expect(SCREENS).toHaveLength(7);
    expect(SCREENS.filter((s) => s.hub)).toHaveLength(1);
    const ids = SCREENS.flatMap((s) => s.fields.map((f) => fieldId(s.id, f.entity)));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("locks card height to the spec parts (40 + 23*n + skeleton + 13)", () => {
    const hub = SCREENS.find((s) => s.id === "hub");
    expect(hub && screenHeight(hub)).toBe(40 + 6 * 23 + 13);
    const invoices = SCREENS.find((s) => s.id === "invoices");
    expect(invoices && screenHeight(invoices)).toBe(40 + 4 * 23 + 30 + 13);
  });

  it("only uses palette statuses and known entities", () => {
    for (const screen of SCREENS) {
      for (const field of screen.fields) {
        expect(STATUS[field.status]).toBeDefined();
        expect(ENTITY_META[field.entity]).toBeDefined();
      }
    }
  });

  it("connects existing fields with matching entities", () => {
    for (const edge of EDGE_DEFS) {
      expect(FIELD_OF(edge.from.screen, edge.from.entity)).toBeDefined();
      expect(FIELD_OF(edge.to.screen, edge.to.entity)).toBeDefined();
      expect(edge.from.entity).toBe(edge.entity);
      expect(edge.to.entity).toBe(edge.entity);
    }
  });
});

describe("buildExport", () => {
  it("exports counts, screens and field-to-field edges", () => {
    const payload = buildExport(initialPositions(), EDGE_DEFS);
    expect(payload.meta.counts).toEqual({ screens: 7, fields: 30, edges: 18, entities: 10 });
    expect(payload.screens).toHaveLength(7);
    expect(payload.edges).toHaveLength(18);
    expect(payload.edges[0].from.field).toBe("invoices.invoice");
  });
});
