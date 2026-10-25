# Testing

How to check this repository before you push. CI runs the same steps in [.github/workflows/check.yml](.github/workflows/check.yml).

## Requirements

- Node.js 22
- Python 3 (serves the site for the browser tests)

## Data checks

```bash
node scripts/check.mjs
```

Fails if a civil date does not match its instant, if bars overlap on the month grid, or if `data/milestones.json` is stale.

## Build is up to date

```bash
node scripts/build.mjs
git diff --exit-code
```

The build regenerates `data/milestones.json`, `calendar.ics`, and the HTML shells. CI fails if the build changes any tracked file, so commit the output.

## Browser tests

Playwright runs the specs in `tests/` in Chromium. The page clock is pinned to 24 October 2026, so results do not depend on the day.

```bash
npm install
npx playwright install chromium
npm test
```

`playwright.config.js` starts `python3 -m http.server 4173` itself and reuses one that is already running.

| Spec | Covers |
| --- | --- |
| `tests/language.spec.js` | English default, Traditional Chinese, saved choice, filters, events and event pages, plan and alerts, browser language detection, 404 page, calendar download |
| `tests/tools.spec.js` | Tool menu, pace, pace chart, heart-rate and gel calculators, Race Plan page, language switch keeping form values, phone menu |
| `tests/menu.spec.js` | Header layout on wide, narrow, and phone screens |

Run one spec, or one test by name:

```bash
npx playwright test tests/menu.spec.js
npx playwright test -g "Escape"
```

## Before a pull request

```bash
node scripts/check.mjs && node scripts/build.mjs && git diff --exit-code && npm test
```
