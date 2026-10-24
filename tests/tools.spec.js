const { test, expect } = require("@playwright/test");

const NOW = "2026-10-24T14:00:00Z";

async function prepare(page, path = "/") {
  await page.addInitScript((iso) => {
    const fixed = Date.parse(iso);
    const RealDate = Date;
    function PatchedDate(...args) {
      if (args.length === 0) return new RealDate(fixed);
      return new RealDate(...args);
    }
    PatchedDate.now = () => fixed;
    PatchedDate.parse = RealDate.parse;
    PatchedDate.UTC = RealDate.UTC;
    PatchedDate.prototype = RealDate.prototype;
    window.Date = PatchedDate;
  }, NOW);
  await page.goto(path);
  await expect(page.locator(".brand")).toBeVisible();
}

function toolLink(page, name) {
  return page.locator("#tool-menu a").filter({ hasText: new RegExp(`^${name}$`) });
}

test("the tool menu lists every calculator and closes on Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await prepare(page);
  await expect(toolLink(page, "Race Plan")).toBeHidden();
  await page.getByRole("button", { name: "Tool" }).click();
  await expect(toolLink(page, "Race Plan")).toBeVisible();
  await expect(toolLink(page, "Pace calculator")).toBeVisible();
  await expect(toolLink(page, "Heart rate")).toBeVisible();
  await expect(toolLink(page, "Pace chart")).toBeVisible();
  await expect(toolLink(page, "Gel and carbs")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toolLink(page, "Gel and carbs")).toBeHidden();
  await expect(page.locator(".nav-drop-button")).toBeFocused();
});

test("pace, chart, heart rate, and gels calculate from the form", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await prepare(page, "/tools/pace/");
  await page.locator('input[name="hours"]').fill("3");
  await page.locator('input[name="minutes"]').fill("0");
  await page.locator('input[name="seconds"]').fill("0");
  await page.getByRole("button", { name: "Calculate pace" }).click();
  await expect(page.locator(".tool-result")).toContainText("4:16");
  await expect(page.locator(".tool-result")).toContainText("6:52");

  await prepare(page, "/tools/pace-chart/");
  await page.locator('input[name="hours"]').fill("3");
  await page.locator('input[name="minutes"]').fill("0");
  await page.locator('input[name="seconds"]').fill("0");
  await page.getByRole("button", { name: "Show chart" }).click();
  const rows = page.locator(".tool-table tbody tr");
  await expect(rows.first()).toContainText("4:16");
  await expect(rows.last()).toContainText("3:00:00");

  await prepare(page, "/tools/heart-rate/");
  await page.locator('input[name="age"]').fill("40");
  await page.getByRole("button", { name: "Show zones" }).click();
  await expect(page.locator(".tool-result")).toContainText("180");
  await expect(page.locator(".tool-result")).toContainText("108");
  await expect(page.locator(".tool-result")).toContainText("126");

  await prepare(page, "/tools/gel/");
  await page.locator('input[name="hours"]').fill("3");
  await page.locator('input[name="gramsPerHour"]').fill("60");
  await page.locator('input[name="gramsPerGel"]').fill("20");
  await page.locator('input[name="drinkPerHour"]').fill("0");
  await page.getByRole("button", { name: "Calculate", exact: true }).click();
  await expect(page.locator(".tool-result")).toContainText("180");
  await expect(page.locator(".tool-result")).toContainText("9");
  await expect(page.locator(".tool-result")).toContainText("About every 20");
});

test("Race Plan explains PaceBest without a TestFlight link", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await prepare(page, "/tools/race-plan/");
  await expect(page.locator("h1")).toHaveText("PaceBest");
  await expect(page.locator("main")).toContainText("PB: Plan your Marathon");
  await expect(page.getByText("The public TestFlight link is not published yet.")).toBeVisible();
  await expect(page.locator("a[href*='testflight.apple.com']")).toHaveCount(0);
});

test("a language switch keeps the pace the runner just calculated", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await prepare(page, "/tools/pace/");
  await page.locator('input[name="hours"]').fill("3");
  await page.locator('input[name="minutes"]').fill("0");
  await page.locator('input[name="seconds"]').fill("0");
  await page.getByRole("button", { name: "Calculate pace" }).click();
  await page.locator('[data-action="lang"][data-lang="zh-Hant"]').click();
  await expect(page.locator("h1")).toHaveText("配速計算");
  await expect(page.locator(".tool-result")).toContainText("4:16");
  await expect(page.locator(".tool-result")).toContainText("6:52");
  await expect(page.locator('input[name="hours"]')).toHaveValue("3");
});

test("Traditional Chinese names the tools", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await prepare(page);
  await page.locator('[data-action="lang"][data-lang="zh-Hant"]').click();
  await page.getByRole("button", { name: "工具" }).click();
  await expect(page.locator("#tool-menu")).toContainText("賽事計劃");
  await expect(page.locator("#tool-menu")).toContainText("配速表");
  await expect(page.locator("#tool-menu")).toContainText("能量膠與碳水");
});

test("a phone keeps alerts outside the menu and tucks tools inside it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);
  await expect(page.locator(".nav-drop-button")).toBeHidden();
  await expect(page.locator("a.nav-alert")).toBeVisible();
  await expect(page.locator("a.nav-alert")).toHaveText("Get Alerts");
  await page.locator(".menu-button").click();
  await expect(page.locator(".nav-drop-button")).toBeVisible();
  await expect(toolLink(page, "Pace chart")).toBeHidden();
  await page.locator(".nav-drop-button").click();
  await expect(toolLink(page, "Pace chart")).toBeVisible();
  await expect(toolLink(page, "Gel and carbs")).toBeVisible();
  await expect(page.locator("a.nav-alert")).toBeVisible();
});
