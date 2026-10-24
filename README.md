# Marathon Race

A public calendar for the World Marathon Majors: ballot open, ballot close, result, payment, expo, and race day.

Preview: https://kelvinccho.github.io/marathon-race/

The pages are a view. The dates live in JSON so another app can read them without scraping.

## Feeds

| File | What it is |
| --- | --- |
| [data/events.json](data/events.json) | Canonical file. One object per race, milestones nested inside. Edit this. |
| [data/milestones.json](data/milestones.json) | Flat rows, one per date, sorted by instant. Generated. Do not edit. |
| [calendar.ics](calendar.ics) | The same dates as a calendar. Generated. |
| [data/events.schema.json](data/events.schema.json) | JSON Schema for `events.json`. |
| [data/milestones.schema.json](data/milestones.schema.json) | JSON Schema for the flat file. |

`schemaVersion` is `1`. Names and types will not be removed or renamed without a bump. New fields can be added.

GitHub Pages does not send CORS headers. Server-side apps can fetch the Pages URL. A browser app on another site should use jsDelivr:

```text
https://cdn.jsdelivr.net/gh/kelvinccho/marathon-race@main/data/milestones.json
```

```js
const data = await fetch(
  "https://cdn.jsdelivr.net/gh/kelvinccho/marathon-race@main/data/milestones.json",
).then((response) => response.json());

const next = data.milestones
  .filter((row) => row.at && Date.parse(row.at) > Date.now())
  .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];
```

### Fields that matter

- `at` — ISO-8601 instant with a numeric offset, or `null` when the date is not published. Sort with `Date.parse`, not string order.
- `date` — civil date of `at` in the race's `timeZone` (`YYYY-MM-DD`). Use this for an all-day cell.
- `precision` — `instant` (show the clock), `day` (date only; `at` is local midnight), or `tbc` (`at` and `date` are null).
- `confidence` — `official` (on the organiser's site), `reported` (a published account of that site), or `expected` (not published).
- `type` — `ballot_open`, `ballot_close`, `result`, `payment`, `expo`, `race`, `qualifier_open`, `qualifier_close`.
- `end` / `endDate` — only when one milestone is itself a range (expo hours, race weekend, a payment window). Ballot close is a separate row.

Colours for each type are in `milestoneTypes`.

## Update a date

1. Edit `data/events.json`. Keep `date` equal to the civil date of `at` in that event's time zone.
2. Run `node scripts/build.mjs`. That refreshes `data/milestones.json`, `calendar.ics`, and the HTML shells.
3. Run `node scripts/check.mjs`.

The check fails if a civil date does not match its instant, if bars overlap on the month grid, or if the flat file is stale.

## Local preview

```bash
node scripts/build.mjs
python3 -m http.server 4173
```

Open http://127.0.0.1:4173/

## Tests

The language switch is exercised in Chromium with Playwright. The page clock is pinned to 24 October 2026, so the calendar does not depend on the day the test runs.

```bash
npm install
npx playwright install chromium
npm test
```

## Pages

Home is a month calendar and a `DD:HH:MM:SS` countdown to the next instant. Events, Plan your race, About, and Get Alerts are linked from the header. Plan choices stay in the browser. Email alerts are not sent yet.
