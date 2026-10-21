import { expect, test, type Page } from "@playwright/test";

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

test.describe("section X screen map", () => {
  test.beforeEach(async ({ page }) => {
    await openMap(page);
  });

  test("renders the hub layout with seven screens and eighteen links", async ({ page }) => {
    await expect(page.locator(".app-title")).toContainText("Карта экранов");
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
});
