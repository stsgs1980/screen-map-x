import { describe, expect, it, vi } from "vitest";
import { useMapStore, type MapState } from "./mapStore";

vi.mock("../layout/elk", () => ({
  elkLayout: vi.fn(async () => {
    throw new Error("elk exploded");
  }),
}));

const state = (): MapState => useMapStore.getState();

describe("elk layout command", () => {
  it("reports a failed layout instead of rejecting", async () => {
    const result = await state()
      .runElk()
      .catch((error: unknown) => error);

    expect(result).toEqual({ ok: false, reason: expect.stringContaining("elk exploded") });
    expect(state().elkBusy).toBe(false);
  });
});
