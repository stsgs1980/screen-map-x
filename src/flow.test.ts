import { describe, expect, it } from "vitest";
import { EDGE_DEFS, initialPositions } from "./data/schema";
import { defOf, sidesFor, toFlowEdges } from "./flow";

describe("sidesFor", () => {
  const pos = initialPositions();

  it("faces right when the target is to the right", () => {
    expect(sidesFor("invoices", "create", pos)).toEqual(["R", "L"]);
  });

  it("faces left when the target is to the left", () => {
    expect(sidesFor("create", "hub", pos)).toEqual(["L", "R"]);
  });

  it("uses the centre channel inside one column", () => {
    expect(sidesFor("details", "receipts", pos)).toEqual(["R", "R"]);
    expect(sidesFor("create", "confirm", pos)).toEqual(["L", "L"]);
  });
});

describe("toFlowEdges", () => {
  const edges = toFlowEdges(EDGE_DEFS, initialPositions());

  it("keeps every semantic edge", () => {
    expect(edges).toHaveLength(EDGE_DEFS.length);
  });

  it("binds connectors to field ports, not cards", () => {
    for (const edge of edges) {
      expect(edge.sourceHandle).toMatch(/\|[LR]\|out$/);
      expect(edge.targetHandle).toMatch(/\|[LR]\|in$/);
      expect(edge.sourceHandle?.startsWith(`${edge.source}.`)).toBe(true);
      expect(edge.targetHandle?.startsWith(`${edge.target}.`)).toBe(true);
    }
  });

  it("spreads parallel spokes with increasing offsets", () => {
    const pair = edges.filter((e) => [e.source, e.target].sort().join("::") === "confirm::hub");
    const offsets = pair.map((e) => e.data?.offset ?? 0);
    expect(new Set(offsets).size).toBe(offsets.length);
  });

  it("round-trips back to semantic defs", () => {
    expect(edges.map(defOf)).toEqual(EDGE_DEFS);
  });
});
