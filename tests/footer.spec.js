const { test, expect } = require("@playwright/test");

const links = [
  ["Home", "/"],
  ["Events", "/events/"],
  ["Plan your race", "/plan/"],
  ["About", "/about/"],
  ["Get Alerts", "/alerts/"],
  ["Race Plan", "/tools/race-plan/"],
  ["Pace calculator", "/tools/pace/"],
  ["Heart rate", "/tools/heart-rate/"],
  ["Pace chart", "/tools/pace-chart/"],
  ["Gel and carbs", "/tools/gel/"],
];

test("the footer contains navigation links to every site page", async ({ page }) => {
  for (const [name, path] of links) {
    await page.goto("/");
    const footer = page.locator(".site-footer");
    await expect(footer.getByRole("link", { name, exact: true })).toHaveAttribute("href", path);
    await footer.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
  }
});
