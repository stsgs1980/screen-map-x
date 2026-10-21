import { writeFileSync } from "node:fs";
import { EDGE_DEFS } from "../src/features/screen-map/data/edges.ts";
import { buildExport } from "../src/features/screen-map/data/export.ts";
import { initialPositions } from "../src/features/screen-map/data/screens.ts";

const payload = buildExport(initialPositions(), EDGE_DEFS);
const out = new URL("../section-x-screen-map.schema.json", import.meta.url);
writeFileSync(out, JSON.stringify(payload, null, 2) + "\n");
process.stdout.write(`wrote ${out.pathname}\n`);
