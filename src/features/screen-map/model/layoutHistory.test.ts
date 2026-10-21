import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TemporalState } from "zundo";
import { EDGE_DEFS } from "../data/edges";
import type { PosMap } from "../flow/adapter";
import { useMapStore, type GraphHistory, type MapState } from "./mapStore";

interface LayoutRun {
  to: PosMap;
  onFrame: (pos: PosMap) => void;
  onDone: (pos: PosMap) => void;
}

const { runs } = vi.hoisted(() => ({ runs: [] as LayoutRun[] }));

vi.mock("../layout/animate", () => ({
  animatePositions: (
    _from: unknown,
    to: unknown,
    _duration: number,
    onFrame: (pos: PosMap) => void,
    onDone: (pos: PosMap) => void,
  ) => {
    runs.push({ to: to as PosMap, onFrame, onDone });
  },
  prefersReducedMotion: () => false,
}));

const state = (): MapState => useMapStore.getState();
const temporal = (): TemporalState<GraphHistory> => useMapStore.temporal.getState();

/** Finish every pending layout so the store and the history stay consistent. */
const flushRuns = (): void => {
  while (runs.length > 0) {
    const run = runs.shift();
    run?.onDone(run.to);
  }
};

beforeEach(() => {
  state().resetMap();
  flushRuns();
  temporal().clear();
  runs.length = 0;
});

describe("layout history", () => {
  it("records only the final position of a layout", () => {
    state().applyLayout({ hub: { x: 100, y: 100 } }, EDGE_DEFS);
    const run = runs[0];

    run.onFrame({ hub: { x: 400, y: 400 } });
    run.onFrame({ hub: { x: 200, y: 200 } });
    expect(temporal().pastStates).toHaveLength(0);

    run.onDone(run.to);
    expect(temporal().pastStates).toHaveLength(1);
  });

  it("does not record intermediate frames when two layouts overlap", () => {
    state().applyLayout({ hub: { x: 100, y: 100 } }, EDGE_DEFS);
    state().applyLayout({ hub: { x: 200, y: 200 } }, EDGE_DEFS);
    const [first, second] = runs;

    first.onDone(first.to);
    second.onFrame({ hub: { x: 150, y: 150 } });
    second.onDone(second.to);

    expect(temporal().pastStates).toHaveLength(1);
  });

  it("keeps the history paused while a silent update runs inside a layout", () => {
    state().applyLayout({ hub: { x: 100, y: 100 } }, EDGE_DEFS);
    const run = runs[0];

    state().setSelected("hub");
    run.onFrame({ hub: { x: 300, y: 300 } });
    expect(temporal().pastStates).toHaveLength(0);

    run.onDone(run.to);
    expect(temporal().pastStates).toHaveLength(1);
  });
});
