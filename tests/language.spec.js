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

async function chooseTraditional(page) {
  await page.locator('[data-action="lang"][data-lang="zh-Hant"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant");
}

test("English is the default and event names stay in English", async ({ page }) => {
  await prepare(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".brand")).toHaveText("Marathon Race");
  await expect(page.locator("h1")).toHaveText("Every date between the ballot and the start.");
  await expect(page.locator(".cal-head h2")).toHaveText("October 2026");
  await expect(page.locator(".dow")).toHaveText("MonTueWedThuFriSatSun");
  await expect(page.locator("#countdown-live").locator("xpath=ancestor::section")).toContainText("TCS New York City Marathon");
  await expect(page.locator(".countdown .fine").first()).toContainText("New York");
  await expect(page.locator(".race-list")).toContainText("TCS London Marathon");
  await expect(page.locator(".race-list")).toContainText("TCS Sydney Marathon");
  const row = page.locator(".race-row").first();
  const rowBox = await row.boundingBox();
  const timeBox = await row.locator("time").boundingBox();
  expect(timeBox.x).toBeGreaterThan(rowBox.x + 10);
  await expect(page.locator('[data-action="lang"][data-lang="en"]')).toHaveAttribute("aria-pressed", "true");
});

test("Traditional Chinese translates the page and leaves event names alone", async ({ page }) => {
  await prepare(page);
  await chooseTraditional(page);

  await expect(page.locator(".brand")).toHaveText("馬拉松賽事");
  const menu = page.locator("nav.nav");
  await expect(menu).toContainText("首頁");
  await expect(menu).toContainText("賽事");
  await expect(menu).toContainText("規劃賽事");
  await expect(menu).toContainText("關於");
  await expect(menu).toContainText("接收提醒");
  await expect(page.locator("h1")).toHaveText("從抽籤到起跑之間的每一個日期。");
  await expect(page.locator(".cal-head h2")).toHaveText("2026年10月");
  await expect(page.locator(".dow")).toHaveText("一二三四五六日");
  await expect(page.locator(".legend")).toContainText("抽籤，最淺");
  await expect(page.locator(".legend")).toContainText("結果，只有框線");
  await expect(page.locator(".legend")).toContainText("比賽日，最深");
  await expect(page.locator("#race-filter-label")).toHaveText("賽事");
  await expect(page.locator("#milestone-filter-label")).toHaveText("節點");
  await expect(page.locator('[data-type="ballot_open"]')).toContainText("抽籤開始");
  await expect(page.locator('[data-type="race"]')).toContainText("比賽日");
  await expect(page.getByRole("button", { name: "全部節點" })).toBeVisible();

  await expect(page.locator('[data-id="nyc-2026"]')).toContainText("NYC 2026");
  await expect(page.locator('[data-id="sydney-2027"]')).toContainText("Sydney 2027");
  await expect(page.locator(".countdown h2")).toHaveText("TCS New York City Marathon");
  await expect(page.locator(".countdown")).toContainText("博覽會開始");
  await expect(page.locator(".countdown .fine").first()).toHaveText("2026 · 紐約");
  await expect(page.locator(".clock")).toContainText("天");
  await expect(page.locator(".clock")).toContainText("小時");

  const cities = (await page.locator(".race-list em").allTextContents()).join("\n");
  expect(cities).toContain("紐約");
  expect(cities).toContain("東京");
  expect(cities).toContain("波士頓");
  expect(cities).toContain("倫敦");
  expect(cities).toContain("開普敦");
  expect(cities).toContain("雪梨");
  expect(cities).toContain("柏林");
  expect(cities).toContain("芝加哥");
  expect(cities).toContain("上海");
  expect(cities).not.toMatch(/New York|Tokyo|Boston|Cape Town|Sydney|Berlin|Chicago|Shanghai/);
  await expect(page.locator(".race-list")).toContainText("TCS London Marathon");
  await expect(page.locator(".race-list")).toContainText("Bank of America Chicago Marathon");
  await expect(page.locator(".site-footer")).toContainText("查核日期");
  await expect(page.locator(".site-footer")).toContainText("2026年10月24日");
  await expect(page.locator(".site-footer")).toContainText("獨立行事曆");
});

test("the language choice survives navigation and can switch back", async ({ page }) => {
  await prepare(page);
  await chooseTraditional(page);
  await page.locator('a[href="./about/"]').click();
  await expect(page.locator("h1")).toContainText("一份你可以留著的行事曆");
  await expect(page.locator("main")).toContainText("賽事名稱維持主辦單位公布的原文");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant");
  await expect(page.locator("h1")).toContainText("一份你可以留著的行事曆");
  await page.locator('[data-action="lang"][data-lang="en"]').click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toHaveText("A calendar you can keep, and a feed other apps can read.");
  expect(await page.evaluate(() => localStorage.getItem("marathon-race-lang"))).toBe("en");
});

test("filters apply to the calendar and the list in both languages", async ({ page }) => {
  await prepare(page);
  await chooseTraditional(page);
  await page.locator('[data-action="race-filter"][data-id="london-2027"]').click();

  await expect(page.locator(".race-list .race-row")).toHaveCount(1);
  await expect(page.locator(".race-list")).toContainText("TCS London Marathon");
  await expect(page.locator(".race-list em")).toContainText("倫敦");
  const chineseBars = await page.locator(".bar-label").allTextContents();
  expect(chineseBars.length).toBeGreaterThan(0);
  expect(chineseBars.every((label) => label.startsWith("London"))).toBe(true);
  expect(chineseBars.some((label) => label.includes("年齡達標"))).toBe(true);
  expect(chineseBars.some((label) => label.includes("抽籤"))).toBe(false);
  await expect(page.locator(".day-panel")).toContainText("倫敦");
  await expect(page.locator(".day-panel")).toContainText("年齡達標");

  await page.locator('[data-action="type-filter"][data-type="race"]').click();
  await expect(page.locator(".bar-label")).toHaveCount(0);
  await expect(page.locator(".race-list em")).toContainText("比賽週末");

  await page.locator('[data-action="lang"][data-lang="en"]').click();
  await expect(page.locator(".race-list .race-row")).toHaveCount(1);
  await expect(page.locator(".race-list")).toContainText("TCS London Marathon");
  await expect(page.locator(".race-list em")).toContainText("Race weekend");
  await expect(page.locator("#milestone-filter-label")).toHaveText("Milestones");
  await expect(page.locator('[data-action="race-filter"][data-id="london-2027"]')).toHaveAttribute("aria-pressed", "true");

  for (let step = 0; step < 6; step += 1) {
    await page.locator('[data-action="month"][data-delta="1"]').click();
  }
  await expect(page.locator(".cal-head h2")).toHaveText("April 2027");
  await expect(page.locator(".bar-label")).toHaveText(["London · race"]);

  await chooseTraditional(page);
  await expect(page.locator(".cal-head h2")).toHaveText("2027年4月");
  await expect(page.locator(".bar-label")).toHaveText(["London · 比賽"]);
  await expect(page.locator(".race-list")).toContainText("TCS London Marathon");
});

test("the events page translates status filters and keeps short names", async ({ page }) => {
  await prepare(page, "/events/");
  await chooseTraditional(page);
  await expect(page.locator("h1")).toHaveText("大滿貫，以及候選賽事。");
  await expect(page.getByRole("button", { name: "等待結果" })).toBeVisible();
  await expect(page.getByRole("button", { name: "尚未公布" })).toBeVisible();
  await page.locator('[data-action="filter"][data-filter="candidate"]').click();
  await expect(page.locator(".event-card h2")).toHaveText("Shanghai 2026");
  await expect(page.locator(".event-card .meta")).toContainText("上海");
  await expect(page.locator(".event-card .meta")).toContainText("候選");
  await expect(page.locator(".event-card .meta")).not.toContainText("Shanghai,");
});

test("an event page translates the city, milestones, and status", async ({ page }) => {
  await prepare(page, "/events/london-2027/");
  await expect(page.locator("h1")).toContainText("TCS London Marathon");
  await expect(page.locator(".lede").first()).toContainText("London, United Kingdom");
  await expect(page.locator(".lede").first()).toContainText("Open");

  await chooseTraditional(page);
  await expect(page.locator("h1")).toContainText("TCS London Marathon");
  await expect(page.locator("h1")).not.toContainText("倫敦馬拉松");
  await expect(page).toHaveTitle(/TCS London Marathon 2027 — 馬拉松賽事/);
  const lede = page.locator(".lede").first();
  await expect(lede).toContainText("倫敦");
  await expect(lede).toContainText("英國");
  await expect(lede).toContainText("開放中");
  await expect(lede).not.toContainText("United Kingdom");
  await expect(page.locator(".timeline")).toContainText("抽籤開始");
  await expect(page.locator(".timeline")).toContainText("年齡達標開始");
  await expect(page.locator(".timeline")).toContainText("官方");
  await expect(page.locator(".facts")).toContainText("年齡達標（Good for Age）");
  await expect(page.locator(".facts")).toContainText("英鎊");
  await expect(page.locator(".facts")).toContainText("TCS London Marathon 官方頁");
  await expect(page.getByRole("link", { name: "報名頁" })).toBeVisible();
  await expect(page.getByRole("button", { name: "下載日期" })).toBeVisible();
});

test("plan and alerts translate their own controls", async ({ page }) => {
  await prepare(page, "/plan/");
  await chooseTraditional(page);
  await expect(page.locator("h1")).toHaveText("你自己的截止日期。");
  await page.locator('[data-action="plan-toggle"][data-id="london-2027"]').check();
  await expect(page.locator(".check-card h3")).toHaveText("London 2027");
  await expect(page.locator(".checks")).toContainText("已送出申請");
  await expect(page.locator(".checks")).toContainText("已開始訓練週期");
  await expect(page.locator(".check-card p").first()).toContainText("開始");

  await page.locator('a[href="../alerts/"]').click();
  await expect(page.locator("h1")).toHaveText("今天就能訂閱的行事曆。");
  await expect(page.locator('input[name="type"][value="ballot_open"]').locator("xpath=..")).toContainText("抽籤開始");
  await expect(page.locator('input[name="event"][value="london-2027"]').locator("xpath=..")).toContainText("London 2027");
  const events = page.locator('input[name="event"]');
  const count = await events.count();
  for (let index = 0; index < count; index += 1) await events.nth(index).uncheck();
  await page.getByRole("button", { name: "下載 .ics" }).click();
  await expect(page.locator(".saved")).toHaveText("至少選一場賽事和一種日期。");
});

test("a Traditional Chinese browser is automatic, and Simplified Chinese stays English", async ({ browser }) => {
  const traditional = await browser.newContext({ locale: "zh-TW" });
  const traditionalPage = await traditional.newPage();
  await traditionalPage.goto("/");
  await expect(traditionalPage.locator(".brand")).toHaveText("馬拉松賽事");
  await traditional.close();

  const simplified = await browser.newContext({ locale: "zh-CN" });
  const simplifiedPage = await simplified.newPage();
  await simplifiedPage.goto("/");
  await expect(simplifiedPage.locator(".brand")).toHaveText("Marathon Race");
  await simplified.close();

  const saved = await browser.newContext({ locale: "zh-HK" });
  const savedPage = await saved.newPage();
  await savedPage.addInitScript(() => localStorage.setItem("marathon-race-lang", "en"));
  await savedPage.goto("/");
  await expect(savedPage.locator(".brand")).toHaveText("Marathon Race");
  await saved.close();
});

test("the missing page follows the saved language", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("marathon-race-lang", "zh-Hant"));
  await page.goto("/404.html");
  await expect(page.locator("#miss")).toHaveText("行事曆上沒有這一頁。");
  await expect(page.locator("#home")).toHaveText("回到行事曆");
});

test("the download uses Traditional Chinese while the published files stay English", async ({ page, request }) => {
  const events = await (await request.get("/data/events.json")).json();
  const london = events.events.find((event) => event.id === "london-2027");
  expect(london.name).toBe("TCS London Marathon");
  expect(london.city).toBe("London");
  expect(london.country).toBe("United Kingdom");

  const published = await (await request.get("/calendar.ics")).text();
  expect(published).toContain("X-WR-CALNAME:Marathon Race");
  expect(published).toContain("London\\, United Kingdom");
  expect(published).not.toContain("馬拉松賽事");

  const shell = await (await request.get("/events/london-2027/")).text();
  expect(shell).toContain("<h1>TCS London Marathon 2027</h1>");
  expect(shell).toContain('lang="zh-Hant"');
  expect(shell).toContain("年齡達標（Good for Age）");
  expect(shell).toContain('lang="en"');

  await prepare(page, "/events/london-2027/");
  await chooseTraditional(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "下載日期" }).click();
  const download = await downloadPromise;
  const text = await (await import("node:fs/promises")).readFile(await download.path(), "utf8");
  expect(text).toContain("X-WR-CALNAME:馬拉松賽事");
  expect(text).toContain("London 2027 · 抽籤開始");
  expect(text).toContain("倫敦\\, 英國");
  expect(text).not.toContain("United Kingdom");
  expect(text).not.toContain("TCS London Marathon");
});
