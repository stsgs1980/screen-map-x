import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Where the frames are written. The folder holds the current state of the
 * interface and is the input for the manual visual check in docs/testing.md.
 */
const OUT_DIR = fileURLToPath(new URL("../docs/assets/screenshots/", import.meta.url));

/** Dev server that serves the current state of the interface. */
const BASE_URL = process.env.SCREENSHOTS_URL ?? "http://127.0.0.1:5173";

/** Frame size used by the manual visual check in docs/testing.md. */
const VIEWPORT = { width: 1600, height: 1000 };

type Page = import("@playwright/test").Page;

const openMap = async (page: Page): Promise<void> => {
  await page.goto(BASE_URL);
  await page.locator(".react-flow__node").first().waitFor();
  await page.waitForTimeout(400);
};

const shoot = async (page: Page, name: string): Promise<void> => {
  await page.screenshot({ path: `${OUT_DIR}${name}.png` });
  process.stdout.write(`captured ${name}.png\n`);
};

const main = async (): Promise<void> => {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();

  await openMap(page);
  await shoot(page, "01-main");

  const invoiceRow = page.locator('.react-flow__node[data-id="hub"] .fld', { hasText: "Счёт" }).first();
  await invoiceRow.hover();
  await page.locator(".tip").waitFor();
  await shoot(page, "02-tooltip");

  const chip = page.locator(".edge-chip").first();
  const box = await chip.boundingBox();
  if (!box) throw new Error("The highlighted edge chip has no bounding box");
  // The edge interaction path covers the chip, so the click goes through raw
  // mouse coordinates instead of the locator.
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" });
  await page.locator(".ctx-popup").waitFor();
  await shoot(page, "03-context-menu");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: /Экспорт/ }).click();
  await page.locator(".menu-popup").waitFor();
  await shoot(page, "04-export-menu");

  await page.getByRole("menuitem", { name: "Посмотреть JSON…" }).click();
  await page.locator(".dlg-popup").waitFor();
  await shoot(page, "05-json-dialog");
  await page.keyboard.press("Escape");

  await page.keyboard.press("Control+K");
  await page.locator(".pal-popup").waitFor();
  await shoot(page, "06-palette");
  await page.keyboard.press("Escape");

  await page.locator(".ent-row").first().hover();
  await page.locator(".preview-card").waitFor();
  await shoot(page, "07-preview");
  await page.mouse.move(0, 0);

  await page.getByRole("button", { name: /Экспорт/ }).click();
  await page.getByRole("menuitem", { name: "Копировать JSON" }).click();
  await page.locator(".toast").waitFor();
  await page.locator(".leg-chip", { hasText: "failed" }).click();
  await shoot(page, "08-toast-filter");

  await page.locator(".inspector-collapse").click();
  await page.waitForTimeout(300);
  await shoot(page, "09-inspector-hidden");

  await browser.close();
};

await main();
