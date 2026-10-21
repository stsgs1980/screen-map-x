/**
 * Canvas and card geometry constants, locked to the product spec:
 * canvas 1200x900 on #111 with a 10 px grid, card/screen parts 40/23/30/13.
 */
export const CANVAS = { width: 1200, height: 900, bg: "#111", grid: 10 } as const;
export const SECTION_PATH = "РАЗДЕЛ X / ПЛАТЕЖИ";

/** card/screen geometry — locked to the spec */
export const NODE_W = 232;
export const HEAD_H = 40; // header
export const ROW_H = 23; // each field row
export const SKEL_H = 30; // optional skeleton block
export const CHROME_H = 13; // chrome strip
export const PORT_SIZE = 5; // port dots
export const EDGE_STYLE = {
  routing: "orthogonal",
  dash: "3 4",
  color: "#7C7C7C",
  cornerRadius: 8, // 7–9 px
} as const;
export const ELK_OPTIONS = { algorithm: "layered", direction: "DOWN", edgeRouting: "ORTHOGONAL" } as const;
