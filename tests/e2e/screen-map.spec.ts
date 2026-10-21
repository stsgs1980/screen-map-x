import { expect, test, type Locator, type Page } from "@playwright/test";

test.use({ permissions: ["clipboard-read", "clipboard-write"] });

/**
 * Open the map and wait until React Flow has rendered the full graph.
 * @param page - Playwright page
 */
async function openMap(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.locator(".react-flow__node")).toHaveCount(7);
  await expect(page.locator(".react-flow__edge")).toHaveCount(18);
}

test.describe("screen-map-x", () => {
  test.beforeEach(async ({ page }) => {
    await openMap(page);
  });

  test("renders the hub layout with seven screens and eighteen links", async ({ page }) => {
    await expect(page.locator(".app-title")).toContainText("Screen-map-x");
    await expect(page.locator('.react-flow__node[data-id="hub"]')).toBeVisible();
    await expect(page.locator(".counter")).toContainText("7 screens · 30 fields · 18 links");
  });

  test("hovering a field lights its whole entity route and opens the tooltip", async ({ page }) => {
    const invoiceRow = page.locator('.react-flow__node[data-id="hub"] .fld', { hasText: "Счёт" }).first();
    await invoiceRow.hover();

    await expect(page.locator(".tip")).toContainText("invoice_id: uuid");
    await expect(page.locator(".fld.on")).toHaveCount(5);
    await expect(page.locator(".scr.dim")).toHaveCount(2);
    await expect(page.locator(".ent-row.on")).toContainText("invoice");
  });

  test("command palette finds and focuses a screen", async ({ page }) => {
    await page.keyboard.press("Control+K");
    await expect(page.locator(".pal-popup")).toBeVisible();
    await page.locator(".cmdk-input").fill("возврат");
    await page.locator(".cmdk-item", { hasText: "Возвраты" }).first().click();

    await expect(page.locator('.react-flow__node[data-id="refunds"] .scr.sel')).toBeVisible();
    await expect(page.locator(".inspector .insp-h")).toHaveText("Возвраты");
  });

  test("export menu copies JSON and reports it with a toast", async ({ page }) => {
    await page.getByRole("button", { name: /Экспорт/ }).click();
    await page.getByRole("menuitem", { name: "Копировать JSON" }).click();
    await expect(page.locator(".toast")).toContainText("JSON скопирован");
  });

  test("status legend filters fields through the toggle group", async ({ page }) => {
    const failedToggle = page.locator(".leg-chip", { hasText: "failed" });
    await failedToggle.click();
    await expect(failedToggle).toHaveAttribute("data-pressed", "");

    const refundRow = page.locator('.react-flow__node[data-id="refunds"] .fld', { hasText: "Возврат" }).first();
    const sentRow = page.locator('.react-flow__node[data-id="hub"] .fld', { hasText: "Счёт" }).first();
    await expect(refundRow).toHaveCSS("opacity", "1");
    await expect(sentRow).toHaveCSS("opacity", "0.2");
  });

  test("edge context menu deletes a link and undo restores it", async ({ page }) => {
    const invoiceRow = page.locator('.react-flow__node[data-id="hub"] .fld', { hasText: "Счёт" }).first();
    await invoiceRow.hover();
    const chip = page.locator(".edge-chip").first();
    await expect(chip).toBeVisible();
    const box = await chip.boundingBox();
    if (!box) throw new Error("Highlighted edge chip has no bounding box");

    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: "right" });
    await expect(page.locator(".ctx-popup")).toBeVisible();
    await page.getByRole("menuitem", { name: "Удалить связь" }).click();
    await expect(page.locator(".react-flow__edge")).toHaveCount(17);

    await page.keyboard.press("Control+Z");
    await expect(page.locator(".react-flow__edge")).toHaveCount(18);
  });

  test("toolbar button shows a focus ring on keyboard navigation", async ({ page }) => {
    const toolbarBtn = page.locator(".toolbar .btn").first();
    const resting = await toolbarBtn.evaluate((el) => getComputedStyle(el).boxShadow);
    for (let i = 0; i < 12; i += 1) {
      if (await toolbarBtn.evaluate((el) => el === el.ownerDocument.activeElement)) break;
      await page.keyboard.press("Tab");
    }
    await expect(toolbarBtn).toBeFocused();
    const focused = await toolbarBtn.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(focused).not.toBe(resting);
    await expect(toolbarBtn).toHaveCSS("box-shadow", /0px 0px 0px 2px/);
  });

  test("the active menu item is visibly different from the rest", async ({ page }) => {
    await page.getByRole("button", { name: /Экспорт/ }).click();
    await page.keyboard.press("ArrowDown");
    const highlighted = page.locator(".menu-item[data-highlighted]").first();
    const plain = page.locator(".menu-item:not([data-highlighted])").first();
    await expect(highlighted).toBeVisible();

    const luminance = async (locator: Locator): Promise<number> => {
      const rgb = await locator.evaluate((el) => getComputedStyle(el).color);
      const [r, g, b] = rgb.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    expect(await luminance(highlighted)).toBeGreaterThan(await luminance(plain));
  });

  test("inactive field port keeps the token colours", async ({ page }) => {
    const port = page.locator(".react-flow__handle.port").first();
    await expect(port).toHaveCSS("background-color", "rgb(16, 19, 26)");
    await expect(port).toHaveCSS("border-color", "rgb(58, 66, 86)");
  });

  test("canvas grid paints with the grid token", async ({ page }) => {
    await expect(page.locator(".react-flow__background-pattern").first()).toHaveCSS("stroke", "rgb(20, 24, 33)");
  });

  test("card parts add up to the height locked by the spec", async ({ page }) => {
    const deltas = await page.evaluate(() =>
      [...document.querySelectorAll(".scr")].map((card) => {
        const height = (element: Element | null): number => (element ? element.getBoundingClientRect().height : 0);
        const parts =
          height(card.querySelector(".scr-head")) +
          [...card.querySelectorAll(".fld")].reduce((sum, row) => sum + height(row), 0) +
          height(card.querySelector(".skel")) +
          height(card.querySelector(".chrome"));
        return parts - height(card);
      }),
    );
    expect(deltas.length).toBe(7);
    for (const delta of deltas) expect(Math.abs(delta)).toBeLessThanOrEqual(1);
  });

  test("right inspector can be hidden and restored while the canvas stays centred", async ({ page }) => {
    await expect(page.locator(".app-title")).toContainText("Screen-map-x");
    await expect(page.locator(".inspector .insp-h")).toHaveText("Screen-map-x");

    await page.locator(".inspector-collapse").click();
    await expect(page.locator(".inspector")).toHaveCount(0);
    await expect(page.locator(".app-title")).toBeVisible();

    const centreDelta = await page.evaluate(() => {
      const scroll = document.querySelector(".canvas-scroll");
      const frame = document.querySelector(".canvas-frame");
      if (!scroll || !frame) return Number.POSITIVE_INFINITY;
      const scrollRect = scroll.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      const dx = Math.abs(frameRect.left + frameRect.width / 2 - (scrollRect.left + scrollRect.width / 2));
      const dy = Math.abs(frameRect.top + frameRect.height / 2 - (scrollRect.top + scrollRect.height / 2));
      return Math.max(dx, dy);
    });
    expect(centreDelta).toBeLessThan(24);

    await page.locator(".inspector-toggle").click();
    await expect(page.locator(".inspector .insp-h")).toHaveText("Screen-map-x");
  });
});
