import { writeFileSync } from 'node:fs';
import { EDGE_DEFS, buildExport, initialPositions } from '../src/data/schema.ts';

const payload = buildExport(initialPositions(), EDGE_DEFS);
const out = new URL('../section-x-screen-map.schema.json', import.meta.url);
writeFileSync(out, JSON.stringify(payload, null, 2) + '\n');
console.log(`wrote ${out.pathname}`);
