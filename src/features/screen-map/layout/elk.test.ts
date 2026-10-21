import { describe, expect, it } from "vitest";
import { EDGE_DEFS } from "../data/edges";
import { SCREENS } from "../data/screens";
import { elkLayout } from "./elk";

describe("elk layout", () => {
  it("places every screen onto the 10 px grid", async () => {
    const pos = await elkLayout(SCREENS, EDGE_DEFS);

    expect(Object.keys(pos)).toHaveLength(SCREENS.length);
    for (const screen of Object.values(pos)) {
      expect(screen.x % 10).toBe(0);
      expect(screen.y % 10).toBe(0);
    }
  });
});
