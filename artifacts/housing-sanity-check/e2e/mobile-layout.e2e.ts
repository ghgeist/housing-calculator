import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const MOBILE_WIDTHS = [430, 393, 390, 375, 320];
const MOBILE_HEIGHT = 932;

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const docOverflow = doc.scrollWidth - doc.clientWidth;
    const bodyOverflow = body.scrollWidth - body.clientWidth;
    return Math.max(docOverflow, bodyOverflow);
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("mobile layout guardrails", () => {
  for (const width of MOBILE_WIDTHS) {
    test(`no horizontal clipping at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: MOBILE_HEIGHT });
      await page.goto("/");

      await expect(page.locator("#inputs-start")).toBeVisible();
      await expect(page.locator("#results")).toBeVisible();
      await expect(page.getByRole("button", { name: "Reset to defaults" })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }

  test("mobile quick-jump anchors navigate correctly", async ({ page }) => {
    await page.setViewportSize({ width: 430, height: MOBILE_HEIGHT });
    await page.goto("/");

    const quickNav = page.getByRole("navigation", { name: "Mobile section navigation" });
    await expect(quickNav).toBeVisible();

    await quickNav.getByRole("link", { name: "Results" }).click();
    await expect(page).toHaveURL(/#results$/);

    const resultsTop = await page.locator("#results").evaluate((el) => el.getBoundingClientRect().top);
    expect(resultsTop).toBeGreaterThanOrEqual(0);
    expect(resultsTop).toBeLessThan(160);

    await quickNav.getByRole("link", { name: "Inputs" }).click();
    await expect(page).toHaveURL(/#inputs-start$/);

    const inputsTop = await page.locator("#inputs-start").evaluate((el) => el.getBoundingClientRect().top);
    expect(inputsTop).toBeGreaterThanOrEqual(0);
    expect(inputsTop).toBeLessThan(160);
    await expectNoHorizontalOverflow(page);
  });

  test("breakpoint contract keeps desktop split at 861 and stacks at 860", async ({ page }) => {
    await page.setViewportSize({ width: 861, height: 900 });
    await page.goto("/");

    const desktopLayout = await page.evaluate(() => {
      const inputs = document.querySelector(".layout-inputs");
      const results = document.querySelector(".layout-results");
      if (!(inputs instanceof HTMLElement) || !(results instanceof HTMLElement)) {
        throw new Error("Expected .layout-inputs and .layout-results to exist");
      }
      const a = inputs.getBoundingClientRect();
      const b = results.getBoundingClientRect();
      return { topDiff: Math.abs(a.top - b.top), leftDiff: Math.abs(a.left - b.left) };
    });

    expect(desktopLayout.topDiff).toBeLessThan(40);
    expect(desktopLayout.leftDiff).toBeGreaterThan(120);

    await page.setViewportSize({ width: 860, height: 900 });
    await page.reload();

    const mobileLayout = await page.evaluate(() => {
      const inputs = document.querySelector(".layout-inputs");
      const results = document.querySelector(".layout-results");
      if (!(inputs instanceof HTMLElement) || !(results instanceof HTMLElement)) {
        throw new Error("Expected .layout-inputs and .layout-results to exist");
      }
      const a = inputs.getBoundingClientRect();
      const b = results.getBoundingClientRect();
      return { topDiff: Math.abs(a.top - b.top), leftDiff: Math.abs(a.left - b.left) };
    });

    expect(mobileLayout.topDiff).toBeGreaterThan(120);
    expect(mobileLayout.leftDiff).toBeLessThan(40);
    await expectNoHorizontalOverflow(page);
  });
});
