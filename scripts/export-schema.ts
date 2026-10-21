import { writeFileSync } from "node:fs";
import { EDGE_DEFS } from "../src/features/screen-map/data/edges.ts";
import { buildExport } from "../src/features/screen-map/data/export.ts";
import { initialPositions } from "../src/features/screen-map/data/screens.ts";
import { serializeExport } from "./export-payload.ts";

const payload = buildExport(initialPositions(), EDGE_DEFS);
const out = new URL("../artifacts/section-x-screen-map.schema.json", import.meta.url);
writeFileSync(out, await serializeExport(payload));
process.stdout.write(`wrote ${out.pathname}\n`);
