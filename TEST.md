# Testing

Two kinds of check run on this repo: a data check in Node, and browser tests in Playwright.

## Data check

```bash
node scripts/check.mjs
```

It fails if a civil date does not match its instant, if bars overlap on the month grid, or if `data/milestones.json` is stale. Run `node scripts/build.mjs` first after editing `data/events.json`.

## Browser tests

```bash
npm install
npx playwright install chromium
npm test
```

Playwright starts `python3 -m http.server 4173` itself and reuses one that is already running. Tests run in Desktop Chrome against `http://127.0.0.1:4173`. The page clock is pinned to 24 October 2026, so results do not depend on the day the tests run.

| Spec | Covers |
| --- | --- |
| [tests/language.spec.js](tests/language.spec.js) | English default, Traditional Chinese, saved choice, filters, events and event pages, plan and alerts, 404 page, downloads |
| [tests/menu.spec.js](tests/menu.spec.js) | Header layout on wide, narrow and phone screens |
| [tests/tools.spec.js](tests/tools.spec.js) | Tool menu, pace, chart, heart-rate and gel calculators, Race Plan page |

Run one spec or one test:

```bash
npx playwright test tests/tools.spec.js
npx playwright test -g "tool menu"
```

## CI

[.github/workflows/check.yml](.github/workflows/check.yml) runs on every push and pull request: `check.mjs`, `build.mjs`, `git diff --exit-code` (generated files must be committed), then `npm test`.

Before opening a pull request, run the same sequence locally:

```bash
node scripts/check.mjs && node scripts/build.mjs && git diff --exit-code && npm test
```
