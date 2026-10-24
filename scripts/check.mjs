import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const logic = require("../assets/js/logic.js");

const data = JSON.parse(readFileSync(new URL("../data/events.json", import.meta.url), "utf8"));
const errors = logic.validate(data);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const now = Date.parse("2026-10-24T14:00:00Z");
const next = logic.boundaries(data.events, now)[0];
assert(next.event.id === "nyc-2026" && next.milestone.id === "expo" && next.phase === "start", "next boundary should be the NYC expo opening");

const duringExpo = logic.boundaries(data.events, Date.parse("2026-10-30T15:00:00Z"))[0];
assert(duringExpo.event.id === "nyc-2026" && duringExpo.phase === "end", "during the expo the clock should count to close");

const afterExpo = logic.boundaries(data.events, Date.parse("2026-10-31T22:00:00Z"))[0];
assert(afterExpo.event.id === "nyc-2026" && afterExpo.milestone.type === "race", "after the expo the next date is NYC race day");

const open = logic.openWindows(data.events, now).map((window) => `${window.event.id}:${window.open.id}`).sort();
assert(JSON.stringify(open) === JSON.stringify([
  "berlin-2027:ballot-open",
  "chicago-2027:ballot-open",
  "london-2027:good-for-age-open",
]), `unexpected open windows: ${open.join(", ")}`);

const plans = {
  "2027-04-25": "2027-01-04",
  "2027-04-19": "2026-12-28",
  "2027-03-07": "2026-11-16",
  "2027-05-23": "2027-02-01",
  "2027-08-29": "2027-05-10",
  "2027-09-26": "2027-06-07",
  "2027-10-10": "2027-06-21",
  "2027-11-07": "2027-07-19",
};
Object.entries(plans).forEach(([race, monday]) => {
  assert(logic.planStart(race) === monday, `${race} should plan from ${monday}, got ${logic.planStart(race)}`);
});
assert(logic.planStartFor(data.events.find((event) => event.id === "london-2027")) === "2027-01-04", "London plans from the Sunday");

for (let year = 2026; year <= 2027; year += 1) {
  for (let month = 1; month <= 12; month += 1) {
    logic.monthModel(data.events, year, month).forEach((week) => {
      week.bars.forEach((bar, index) => {
        assert(bar.startCol >= 1 && bar.endCol <= 7 && bar.startCol <= bar.endCol, "bar outside the week");
        week.bars.slice(index + 1).forEach((other) => {
          const sharesLane = bar.lane === other.lane && bar.startCol <= other.endCol && other.startCol <= bar.endCol;
          assert(!sharesLane, `overlapping bars in ${year}-${month}`);
        });
      });
    });
  }
}

const flat = logic.flatten(data);
assert(flat.milestones.length === data.events.reduce((sum, event) => sum + event.milestones.length, 0), "flat feed dropped a milestone");
const flatPath = new URL("../data/milestones.json", import.meta.url);
if (existsSync(flatPath)) {
  const committed = JSON.parse(readFileSync(flatPath, "utf8"));
  assert(JSON.stringify(committed) === JSON.stringify(flat), "data/milestones.json is stale. Run node scripts/build.mjs.");
}

const ics = logic.buildIcs(data);
assert(ics.includes("BEGIN:VCALENDAR") && ics.includes("chicago-2027-ballot-close@marathon-race"), "calendar feed missing Chicago close");
assert(ics.includes("DTSTART:20261029T190000Z"), "Chicago close should be 19:00 UTC on 29 Oct 2026");

console.log(`ok ${data.events.length} events, ${flat.milestones.length} milestones`);
