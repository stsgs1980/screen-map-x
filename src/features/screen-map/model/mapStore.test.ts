import { beforeEach, describe, expect, it } from "vitest";
import type { TemporalState } from "zundo";
import { useMapStore, type GraphHistory, type MapState } from "./mapStore";

const state = (): MapState => useMapStore.getState();
const temporal = (): TemporalState<GraphHistory> => useMapStore.temporal.getState();

beforeEach(() => {
  state().resetMap();
  temporal().clear();
});

describe("map store", () => {
  it("starts with the hub layout: 7 screens and 18 field links", () => {
    expect(state().nodes).toHaveLength(7);
    expect(state().edges).toHaveLength(18);
  });

  it("connects a new field-to-field edge from port handles", () => {
    state().onConnect({
      source: "invoices",
      target: "refunds",
      sourceHandle: "invoices.amount|R|out",
      targetHandle: "refunds.amount|L|in",
    });
    expect(state().edges).toHaveLength(19);
    const added = state().edges.at(-1);
    expect(added?.data?.entity).toBe("amount");
  });

  it("undoes and redoes graph changes", () => {
    const first = state().edges[0];
    state().deleteEdge(first.id);
    expect(state().edges).toHaveLength(17);
    state().undo();
    expect(state().edges).toHaveLength(18);
    state().redo();
    expect(state().edges).toHaveLength(17);
  });

  it("does not record selection-only changes in history", () => {
    state().setSelected("hub");
    expect(state().selectedId).toBe("hub");
    expect(temporal().pastStates).toHaveLength(0);
  });

  it("toggles the top bar visibility", () => {
    expect(state().headerVisible).toBe(true);
    state().toggleHeader();
    expect(state().headerVisible).toBe(false);
    state().toggleHeader();
    expect(state().headerVisible).toBe(true);
  });

  it("tracks hover over pin as the active entity inputs", () => {
    state().togglePin("invoice");
    expect(state().pinnedEntity).toBe("invoice");
    state().setHoverEntity("amount");
    expect(state().hoverEntity).toBe("amount");
    state().togglePin("invoice");
    expect(state().pinnedEntity).toBeNull();
  });
});
