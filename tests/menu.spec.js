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

async function openMenu(page) {
  await page.locator(".menu-button").click();
  await expect(page.locator(".menu-button")).toHaveAttribute("aria-expanded", "true");
}

test("a wide screen keeps every header control in one row", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await prepare(page);
  await page.locator('[data-action="lang"][data-lang="zh-Hant"]').click();
  await expect(page.locator(".menu-button")).toBeHidden();
  const brand = await page.locator(".brand").boundingBox();
  const home = await page.getByRole("link", { name: "首頁", exact: true }).boundingBox();
  const alerts = await page.getByRole("link", { name: "接收提醒", exact: true }).boundingBox();
  const traditional = await page.getByRole("button", { name: "繁體", exact: true }).boundingBox();
  expect(Math.abs(home.y - brand.y)).toBeLessThan(24);
  expect(Math.abs(alerts.y - brand.y)).toBeLessThan(24);
  expect(Math.abs(traditional.y - brand.y)).toBeLessThan(24);
  expect(home.x).toBeLessThan(alerts.x);
  expect(alerts.x).toBeLessThan(traditional.x);
});

function menuLink(page, name) {
  return page.locator("#site-menu a").filter({ hasText: new RegExp(`^${name}$`) });
}

test("the menu is used until the header fits on one line", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 700 });
  await prepare(page);
  await expect(page.locator(".menu-button")).toBeVisible();
  await expect(menuLink(page, "Home")).toBeHidden();
  await expect(page.locator("a.nav-alert")).toBeVisible();
  await page.setViewportSize({ width: 1100, height: 700 });
  await expect(page.locator(".menu-button")).toBeHidden();
  await expect(menuLink(page, "Home")).toBeVisible();
  await expect(page.locator("a.nav-alert")).toBeVisible();
});

test("a phone hides the links and language switch in a menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page);

  await expect(menuLink(page, "Home")).toBeHidden();
  await expect(menuLink(page, "Events")).toBeHidden();
  await expect(menuLink(page, "Plan your race")).toBeHidden();
  await expect(menuLink(page, "About")).toBeHidden();
  await expect(page.locator("#site-menu .lang-button")).toHaveCount(2);
  await expect(page.locator("#site-menu .lang-button").first()).toBeHidden();
  await expect(page.locator("a.nav-alert")).toBeVisible();
  await expect(page.locator("a.nav-alert")).toHaveText("Get Alerts");
  await expect(page.locator(".menu-button")).toBeVisible();
  await expect(page.locator(".menu-button")).toHaveAttribute("aria-expanded", "false");

  const brand = await page.locator(".brand").boundingBox();
  const alerts = await page.locator("a.nav-alert").boundingBox();
  expect(Math.abs(alerts.y - brand.y)).toBeLessThan(20);
  expect(alerts.x).toBeGreaterThan(brand.x);

  await openMenu(page);
  await expect(menuLink(page, "Home")).toBeVisible();
  await expect(menuLink(page, "Events")).toBeVisible();
  await expect(menuLink(page, "Plan your race")).toBeVisible();
  await expect(menuLink(page, "About")).toBeVisible();
  await expect(page.locator("#site-menu .lang-button")).toHaveText(["EN", "繁體"]);
  const home = await menuLink(page, "Home").boundingBox();
  const alertsOpen = await page.locator("a.nav-alert").boundingBox();
  expect(home.y).toBeGreaterThan(alertsOpen.y + alertsOpen.height - 8);
  expect(Math.abs(alertsOpen.y - brand.y)).toBeLessThan(20);

  await page.locator('[data-action="lang"][data-lang="zh-Hant"]').click();
  await expect(page.locator(".menu-button")).toHaveAttribute("aria-expanded", "true");
  for (const name of ["首頁", "賽事", "規劃賽事", "關於"]) {
    await expect(menuLink(page, name)).toBeVisible();
  }
  await expect(page.locator("a.nav-alert")).toHaveText("接收提醒");
  await expect(page.locator("a.nav-alert")).toBeVisible();
  const chineseHome = await menuLink(page, "首頁").boundingBox();
  const chineseAlerts = await page.locator("a.nav-alert").boundingBox();
  expect(chineseHome.y).toBeGreaterThan(chineseAlerts.y + chineseAlerts.height - 8);

  await page.locator(".menu-button").click();
  await expect(page.locator(".menu-button")).toHaveAttribute("aria-expanded", "false");
  await expect(menuLink(page, "首頁")).toBeHidden();
  await expect(page.locator("a.nav-alert")).toBeVisible();

  await openMenu(page);
  await page.keyboard.press("Escape");
  await expect(menuLink(page, "首頁")).toBeHidden();
  await expect(page.locator(".menu-button")).toBeFocused();
});
