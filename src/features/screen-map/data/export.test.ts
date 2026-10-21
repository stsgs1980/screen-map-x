import { check } from "prettier";
import { describe, expect, it } from "vitest";
import { JSON_OPTIONS, serializeExport } from "../../../../scripts/export-payload";
import { EDGE_DEFS } from "./edges";
import { buildExport } from "./export";
import { initialPositions } from "./screens";

describe("export serialisation", () => {
  it("produces an artefact that passes the format gate", async () => {
    const text = await serializeExport(buildExport(initialPositions(), EDGE_DEFS));

    expect(await check(text, { ...JSON_OPTIONS })).toBe(true);
  });
});
