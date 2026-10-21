import { format } from "prettier";
import type { SchemaExport } from "../src/features/screen-map/data/export.ts";

/** Prettier options for the generated JSON artefact (mirrors .prettierrc). */
export const JSON_OPTIONS = { parser: "json", printWidth: 120, tabWidth: 2 } as const;

/**
 * Serialise an export payload with the repository's JSON formatting, so the
 * generated artefact passes `npm run format:check` right after generation.
 * @param payload - export payload
 * @returns formatted JSON text
 */
export const serializeExport = async (payload: SchemaExport): Promise<string> =>
  format(`${JSON.stringify(payload, null, 2)}\n`, { ...JSON_OPTIONS });
