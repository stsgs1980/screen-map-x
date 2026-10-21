import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CHROME_H, EDGE_STYLE, HEAD_H, PORT_SIZE, ROW_H, SKEL_H } from "../data/constants";
import { EDGE_DEFS } from "../data/edges";
import { buildExport, type SchemaExport } from "../data/export";
import { initialPositions } from "../data/screens";
import { STATUS } from "../data/status";

/**
 * Stylesheets that must not contain raw colours. The list grows as the sheets
 * are tokenised; `tokens.css` is the only place a literal colour may live.
 */
const TOKENIZED = [
  "tokens.css",
  "base.css",
  "canvas.css",
  "field.css",
  "react-flow.css",
  "inspector.css",
  "inspector-rows.css",
  "primitives/popovers.css",
  "primitives/dialogs.css",
  "primitives/palette.css",
  "primitives/feedback.css",
];

const HEX = /#[0-9a-f]{3,8}\b/gi;
const RGB = /rgba?\(/gi;
/** Named CSS colours are raw colours too, and a hex-only scan would miss them. */
const NAMED =
  /(?:^|[:\s])(white|black|red|green|blue|yellow|cyan|magenta|gray|grey|silver|maroon|olive|lime|aqua|teal|navy|fuchsia|purple|orange|pink|brown|gold|indigo|violet|crimson|salmon|coral|khaki|beige|ivory|plum|orchid|turquoise|azure|lavender)(?=[\s;,)!]|$)/i;
/** Geometry tokens that every sheet has to read instead of a literal. */
const GEOMETRY_TOKENS = ["--head-h", "--row-h", "--skel-h", "--chrome-h", "--port-size", "--icon-size"];

const readFile = (path: string): string => readFileSync(new URL(path, import.meta.url), "utf8");

const readTokens = (path = "./tokens.css"): Map<string, string> => {
  const tokens = new Map<string, string>();
  for (const match of readFile(path).matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(`--${match[1]}`, match[2].trim());
  }
  return tokens;
};

const token = (name: string): string => {
  const value = readTokens().get(name);
  if (value === undefined) throw new Error(`Token ${name} is missing`);
  return value;
};

const stripExportedAt = (payload: SchemaExport): SchemaExport => {
  const copy = structuredClone(payload);
  copy.meta.exportedAt = "";
  return copy;
};

const channel = (value: number): number => {
  const srgb = value / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string): number => {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? [...value].map((c) => c + c).join("") : value;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrast = (a: string, b: string): number => {
  const first = luminance(a);
  const second = luminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
};

describe("design tokens", () => {
  it("reads custom properties from a stylesheet", () => {
    expect(readTokens().get("--bg-canvas")).toBe("#0b0d12");
  });

  it("keeps geometry tokens equal to the locked constants", () => {
    expect(token("--head-h")).toBe(`${HEAD_H}px`);
    expect(token("--row-h")).toBe(`${ROW_H}px`);
    expect(token("--skel-h")).toBe(`${SKEL_H}px`);
    expect(token("--chrome-h")).toBe(`${CHROME_H}px`);
    expect(token("--port-size")).toBe(`${PORT_SIZE}px`);
  });

  it("keeps the icon size equal to the exported card/field icon", () => {
    const exported = buildExport(initialPositions(), EDGE_DEFS);
    expect(token("--icon-size")).toBe(`${exported.meta.components["card/field"].icon}px`);
  });

  it("keeps caption tokens equal to the exported caption", () => {
    const caption = buildExport(initialPositions(), EDGE_DEFS).meta.caption;
    expect(caption.font).toContain("10px");
    expect(token("--caption-size")).toBe("10px");
    expect(token("--caption-tracking")).toBe("0.11em");
    expect(Number.parseFloat(caption.letterSpacing)).toBeCloseTo(0.11, 5);
    expect(token("--caption-color").toLowerCase()).toBe(caption.color.toLowerCase());
  });

  it("keeps the canvas background equal to the exported canvas", () => {
    const canvas = buildExport(initialPositions(), EDGE_DEFS).meta.canvas;
    expect(token("--canvas-bg").toLowerCase()).toBe(canvas.bg.toLowerCase());
  });

  it("keeps edge tokens equal to EDGE_STYLE", () => {
    expect(token("--edge-dash")).toBe(EDGE_STYLE.dash);
    expect(token("--edge-color").toLowerCase()).toBe(EDGE_STYLE.color.toLowerCase());
    const radius = Number.parseFloat(token("--r-edge"));
    expect(radius).toBe(EDGE_STYLE.cornerRadius);
    expect(radius).toBeGreaterThanOrEqual(7);
    expect(radius).toBeLessThanOrEqual(9);
  });

  it("mirrors the status colours from STATUS", () => {
    for (const [key, meta] of Object.entries(STATUS)) {
      expect(token(`--status-${key}`).toLowerCase()).toBe(meta.color.toLowerCase());
    }
  });

  it("keeps the exported payload equal to the committed sample", () => {
    // The committed sample is a golden file: `npm run export:schema` rewrites it,
    // so this check catches a code change that was not mirrored into the artefact.
    // The primary defence stays the artefact diff after running the exporter.
    const committed = JSON.parse(readFile("../../../../artifacts/section-x-screen-map.schema.json")) as SchemaExport;
    expect(stripExportedAt(buildExport(initialPositions(), EDGE_DEFS))).toEqual(stripExportedAt(committed));
  });

  it("keeps the contrast of readable pairs high enough", () => {
    expect(contrast(token("--fg"), token("--bg-surface"))).toBeGreaterThanOrEqual(7);
    expect(contrast(token("--fg-muted"), token("--bg-surface"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token("--fg-subtle"), token("--bg-surface"))).toBeGreaterThanOrEqual(3);
  });

  it("keeps the accent readable under the label colour", () => {
    // The primary button, the hub badge and the edge chip are accent fills with
    // --fg-on-accent text, so the pair has to clear WCAG AA for normal text.
    expect(contrast(token("--fg-on-accent"), token("--bg-accent"))).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the status dot ring visible on every surface it sits on", () => {
    // The ring is what makes the `none` status (#3D3D3D, 1.5:1) readable.
    expect(contrast(token("--fg-subtle"), token("--bg-surface"))).toBeGreaterThanOrEqual(3);
    expect(contrast(token("--fg-subtle"), token("--bg-sunken"))).toBeGreaterThanOrEqual(3);
  });

  it("keeps raw colours out of every tokenised sheet", () => {
    for (const file of TOKENIZED.filter((sheet) => sheet !== "tokens.css")) {
      const css = readFile(file);
      const hexes = [...css.matchAll(HEX)]
        .map((match) => match[0])
        .filter((value) => [3, 4, 6, 8].includes(value.length - 1));
      expect(hexes, `${file} must not contain raw hex colours`).toEqual([]);
      expect(css.match(RGB), `${file} must not contain raw rgb() colours`).toBeNull();
      expect(css.match(NAMED), `${file} must not contain named colours`).toBeNull();
    }
  });

  it("makes every sheet read the geometry tokens", () => {
    const sheets = TOKENIZED.filter((sheet) => sheet !== "tokens.css")
      .map((sheet) => readFile(sheet))
      .join("\n");
    for (const name of GEOMETRY_TOKENS) {
      expect(sheets, `no sheet reads ${name}`).toContain(`var(${name})`);
    }
  });
});
