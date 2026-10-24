(function () {
  const MR = window.MRLogic;
  const FLAGS = { US: "🇺🇸", JP: "🇯🇵", GB: "🇬🇧", ZA: "🇿🇦", AU: "🇦🇺", DE: "🇩🇪", CN: "🇨🇳" };
  const CHECKS = [
    ["entered", "Application submitted"],
    ["result", "Result checked"],
    ["paid", "Fee paid"],
    ["travel", "Travel booked"],
    ["expo", "Expo visit planned"],
    ["training", "Training block started"],
  ];
  const state = {
    data: null,
    now: Date.now(),
    year: 2026,
    month: 10,
    selected: "",
    filter: "all",
    races: [],
    types: [],
    plan: { ids: [], checks: {} },
    alerts: { email: "", eventIds: [], types: MR.MILESTONE_TYPES.slice() },
    alertSaved: false,
    alertError: "",
    boundaryKey: "",
    eventKey: "",
  };

  document.addEventListener("DOMContentLoaded", boot);

  async function boot() {
    const app = document.getElementById("app");
    app.addEventListener("click", onClick);
    app.addEventListener("change", onChange);
    app.addEventListener("submit", onSubmit);
    try {
      const response = await fetch(`${root()}/data/events.json`);
      if (!response.ok) throw new Error(String(response.status));
      state.data = await response.json();
      state.plan = loadJson("marathon-race-plan-v1", state.plan);
      state.alerts = loadJson("marathon-race-alerts-v1", defaultAlerts());
      loadView();
      initMonth();
      render();
      setInterval(tick, 1000);
    } catch (error) {
      app.innerHTML = `<p class="loading">The calendar could not load <a href="${esc(url("data/events.json"))}">events.json</a>.</p>`;
    }
  }

  function defaultAlerts() {
    return { email: "", eventIds: [], types: MR.MILESTONE_TYPES.slice(), allEvents: true };
  }

  function initMonth() {
    const today = viewerYmd(state.now);
    const hash = location.hash.replace("#", "");
    if (/^\d{4}-\d{2}$/.test(hash)) {
      state.year = Number(hash.slice(0, 4));
      state.month = Number(hash.slice(5, 7));
    } else {
      state.year = Number(today.slice(0, 4));
      state.month = Number(today.slice(5, 7));
    }
    state.selected = today.startsWith(`${state.year}-${pad(state.month)}`) ? today : `${state.year}-${pad(state.month)}-01`;
  }

  function render() {
    const page = document.documentElement.dataset.page;
    const titles = {
      home: "Marathon Race",
      events: "Events — Marathon Race",
      event: "Event — Marathon Race",
      plan: "Plan your race — Marathon Race",
      about: "About — Marathon Race",
      alerts: "Get alerts — Marathon Race",
    };
    document.title = titles[page] || titles.home;
    rememberBoundary();
    const body = {
      home: renderHome,
      events: renderEvents,
      event: renderEvent,
      plan: renderPlan,
      about: renderAbout,
      alerts: renderAlerts,
    }[page] || renderHome;
    document.getElementById("app").innerHTML = `${header(page)}<main id="content" class="page">${body()}</main>${footer()}`;
    paintClock();
  }

  function header(page) {
    const link = (id, label, path) => `<a href="${esc(url(path))}"${page === id ? ' aria-current="page"' : ""}>${label}</a>`;
    return `<a class="skip" href="#content">Skip to content</a>
      <header class="site-header"><div class="wrap header-row">
        <a class="brand" href="${esc(url(""))}"><span class="mark" aria-hidden="true"></span>Marathon Race</a>
        <nav class="nav" aria-label="Primary">
          ${link("home", "Home", "")}
          ${link("events", "Events", "events/")}
          ${link("plan", "Plan your race", "plan/")}
          ${link("about", "About", "about/")}
          <a class="nav-alert" href="${esc(url("alerts/"))}"${page === "alerts" ? ' aria-current="page"' : ""}>Get Alerts</a>
        </nav>
      </div></header>`;
  }

  function footer() {
    return `<footer class="site-footer"><div class="wrap footer-row">
      <p>Checked ${esc(checkedLabel())}. Independent calendar. Not affiliated with Abbott World Marathon Majors or any race organiser. ${esc(state.data.disclaimer)}</p>
      <nav aria-label="Data">
        <a href="${esc(url("data/events.json"))}">events.json</a>
        <a href="${esc(url("data/milestones.json"))}">milestones.json</a>
        <a href="${esc(url("calendar.ics"))}">calendar.ics</a>
      </nav>
    </div></footer>`;
  }

  function renderHome() {
    const today = viewerYmd(state.now);
    const events = scopedEvents();
    const weeks = MR.monthModel(events, state.year, state.month);
    const ahead = MR.boundaries(events, state.now);
    const boundary = ahead[0];
    const after = ahead[1];
    const opens = MR.openWindows(events, state.now);
    const scopeNote = state.races.length || state.types.length
      ? "Matching the races and milestones selected above."
      : "In order of the next date on each race.";
    return `<div class="wrap">
      <p class="eyebrow">World Marathon Majors</p>
      <h1>Every date between the ballot and the start.</h1>
      <p class="lede">Ballot open, ballot close, result, payment, expo, and race day. The clock is the next real instant. The bars sit on the race city's own date. Each race keeps one pale colour, and a darker mark means a more important date.</p>
      <div class="filter-groups">${raceFilters()}${milestoneFilters()}</div>
      <div class="home-grid">
        <section class="card calendar" aria-label="Month calendar">
          <div class="cal-head">
            <h2>${esc(MR.formatMonth(state.year, state.month))}</h2>
            <div class="month-nav">
              <button class="icon-button" type="button" data-action="month" data-delta="-1" aria-label="Previous month">Prev</button>
              <button class="text-button" type="button" data-action="today">Today</button>
              <button class="icon-button" type="button" data-action="month" data-delta="1" aria-label="Next month">Next</button>
            </div>
          </div>
          <div class="cal-scroll"><div class="cal-grid">
            <div class="dow">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => `<span>${day}</span>`).join("")}</div>
            ${weeks.map((week) => weekHtml(week, boundary)).join("")}
          </div></div>
          <ul class="legend">
            ${legendItem("ballot", "Ballot, lightest")}
            ${legendItem("result", "Result, border only")}
            ${legendItem("payment", "Payment")}
            ${legendItem("expo", "Expo, dark")}
            ${legendItem("race", "Race day, darkest")}
          </ul>
          <p class="cal-note">A darker cap is the day that window closes. Today's date is the filled circle.</p>
          ${dayPanel(state.selected || today, events)}
        </section>
        <div class="countdown-wrap">${countdownCard(boundary, after, opens)}</div>
      </div>
      <section class="section">
        <div class="section-head"><h2>Upcoming</h2></div>
        <p class="fine">${esc(scopeNote)}</p>
        <ol class="race-list">${upcomingEvents(events).map(raceRow).join("") || "<li class=\"empty-filter\">Nothing matches this filter.</li>"}</ol>
      </section>
    </div>`;
  }

  function weekHtml(week, boundary) {
    const nums = week.days.map((day) => {
      const selected = day.ymd === state.selected ? " is-selected" : "";
      const today = day.ymd === viewerYmd(state.now) ? " is-today" : "";
      const outside = day.inMonth ? "" : " out";
      return `<button class="day${selected}${today}${outside}" type="button" data-action="select-day" data-date="${day.ymd}"><span class="num">${Number(day.ymd.slice(8))}</span></button>`;
    }).join("");
    const bars = week.bars.map((bar) => {
      const next = boundary && (boundary.milestone.id === bar.milestone.id || (bar.close && boundary.milestone.id === bar.close.id)) && boundary.event.id === bar.event.id;
      const importance = MR.importanceOf(bar.milestone.type);
      const classes = [
        "bar",
        `importance-${importance}`,
        `kind-${bar.kind}`,
        bar.continuesBefore ? "continues-before" : "",
        bar.continuesAfter ? "continues-after" : "",
        bar.endsHere ? "ends-here" : "",
        next ? "is-next" : "",
      ].filter(Boolean).join(" ");
      return `<a class="${classes}" style="--col:${bar.startCol};--span:${bar.endCol - bar.startCol + 1};--lane:${bar.lane + 1};--race-color:${esc(MR.raceColor(bar.event.id))}" href="${esc(url(`events/${bar.event.id}/`))}" title="${esc(bar.label)}"><span class="bar-label">${esc(bar.label)}</span></a>`;
    }).join("");
    return `<div class="week"><div class="nums">${nums}</div>${bars ? `<div class="lanes">${bars}</div>` : ""}</div>`;
  }

  function dayPanel(ymd, events) {
    const items = MR.calendarItems(events).filter((item) => item.startYmd <= ymd && item.endYmd >= ymd);
    const rows = items.length ? items.map((item) => {
      let detail = item.label;
      if (item.kind === "span" && ymd === item.endYmd) detail = `${item.event.shortName} · closes`;
      else if (item.kind === "span" && ymd === item.startYmd) detail = `${item.event.shortName} · opens`;
      else if (item.kind === "span") detail = `${item.label} · open`;
      const importance = MR.importanceOf(item.milestone.type);
      return `<li><a href="${esc(url(`events/${item.event.id}/`))}"><i class="dot importance-${importance}" style="--race-color:${esc(MR.raceColor(item.event.id))}"></i>${esc(detail)}</a><span class="fine">${esc(item.event.city)}</span></li>`;
    }).join("") : "<li>Nothing scheduled on this date. Open ballots still show as bars across their window.</li>";
    return `<div class="day-panel"><h3>${esc(MR.formatYmdLong(ymd))}</h3><ul>${rows}</ul></div>`;
  }

  function countdownCard(boundary, after, opens) {
    if (!boundary) {
      const filtered = state.races.length || state.types.length;
      return filtered
        ? `<section class="countdown"><h2>Nothing in this filter.</h2><p>Choose another race or milestone, or show all of them.</p></section>`
        : `<section class="countdown"><h2>Nothing dated ahead.</h2><p>New windows land in the JSON when an organiser publishes them.</p></section>`;
    }
    const heading = MR.boundaryHeading(boundary);
    const iso = boundary.phase === "end" ? boundary.milestone.end : boundary.milestone.at;
    const openRows = opens.map((window) => `<li><a href="${esc(url(`events/${window.event.id}/`))}"><span>${esc(window.event.shortName)} ${esc(window.open.label)}</span><small>closes ${esc(MR.formatDayMonth(window.close.at, window.event.timeZone))}</small></a></li>`).join("");
    return `<section class="countdown" aria-labelledby="next-heading">
      <p class="viewer-now" data-viewer-now></p>
      <p class="kicker">${esc(heading.kicker)}</p>
      <p class="milestone-line"><i class="dot importance-${esc(MR.importanceOf(boundary.milestone.type))}" style="--race-color:${esc(MR.raceColor(boundary.event.id))}"></i>${esc(heading.title)}</p>
      <h2 id="next-heading">${esc(boundary.event.name)}</h2>
      <p class="fine">${esc(String(boundary.event.edition))} · ${esc(boundary.event.city)}</p>
      <div class="clock" data-clock-at="${boundary.t}" role="timer" aria-describedby="countdown-live">
        <div><b data-dd>00</b><span>Days</span></div>
        <div><b data-hh>00</b><span>Hours</span></div>
        <div><b data-mm>00</b><span>Minutes</span></div>
        <div><b data-ss>00</b><span>Seconds</span></div>
      </div>
      <p class="when">${esc(whenLine(boundary))}</p>
      ${clockNote(boundary) ? `<p class="fine">${esc(clockNote(boundary))}</p>` : ""}
      ${after ? `<p class="fine">After that · ${esc(after.event.shortName)} · ${esc(MR.boundaryHeading(after).title)} · ${esc(MR.formatDayMonth(after.phase === "end" ? after.milestone.end : after.milestone.at, after.event.timeZone))}</p>` : ""}
      <div class="countdown-actions">
        <a class="button" href="${esc(url(`events/${boundary.event.id}/`))}">Event page</a>
        <button class="button-ghost" type="button" data-action="show-boundary" data-date="${esc(boundary.phase === "end" ? (boundary.milestone.endDate || boundary.milestone.date) : boundary.milestone.date)}">Show on calendar</button>
      </div>
      ${openRows ? `<p class="kicker">Open now</p><ul class="open-now">${openRows}</ul>` : ""}
      <p class="sr" id="countdown-live"></p>
    </section>`;
  }

  function raceRow(event) {
    const source = state.data.events.find((item) => item.id === event.id) || event;
    const next = MR.boundaries([event], state.now)[0];
    const status = MR.statusOf(source, state.now);
    const when = next ? MR.formatDayMonth(next.phase === "end" ? next.milestone.end : next.milestone.at, event.timeZone) : "—";
    const importance = next ? MR.importanceOf(next.milestone.type) : "ballot";
    const label = next ? pillLabel(next) : "Date";
    const detail = next ? `${MR.boundaryHeading(next).title} · ${whenLine(next)}` : "Dates not announced";
    return `<li><a class="race-row" style="--race-color:${esc(MR.raceColor(event.id))}" href="${esc(url(`events/${event.id}/`))}">
      <span class="race-when"><time>${esc(when)}</time><span class="pill importance-${importance}">${esc(label)}</span></span>
      <span><strong>${esc(flag(event))} ${esc(event.name)} <span>${esc(String(event.edition))}</span></strong><em>${esc(event.city)} · ${esc(detail)}</em></span>
      <span class="status status-${esc(status.key)}">${esc(status.label)}</span>
    </a></li>`;
  }

  function renderEvents() {
    const filters = [
      ["all", "All"],
      ["open", "Open"],
      ["awaiting", "Awaiting result"],
      ["decided", "Decided"],
      ["upcoming", "Not announced"],
      ["candidate", "Candidate"],
    ];
    const events = state.data.events.slice().sort((a, b) => a.order - b.order).filter((event) => {
      if (state.races.length && !state.races.includes(event.id)) return false;
      if (state.types.length && !event.milestones.some((milestone) => state.types.includes(milestone.type))) return false;
      if (state.filter === "all") return true;
      return MR.statusOf(event, state.now).key === state.filter;
    });
    const statusButtons = filters.map(([id, label]) => `<button class="text-button" type="button" data-action="filter" data-filter="${id}" aria-pressed="${state.filter === id}">${label}</button>`).join("");
    return `<div class="wrap">
      <p class="eyebrow">Events</p>
      <h1>The majors, and the candidate.</h1>
      <p class="lede">Eight World Marathon Majors, the New York race still in race week, and Shanghai while it is being assessed. Open a race for the full date list and the official page.</p>
      <div class="filter-groups">
        <div class="filter-group"><p class="filter-label" id="status-filter-label">Status</p><div class="filters" role="group" aria-labelledby="status-filter-label">${statusButtons}</div></div>
        ${raceFilters()}
        ${milestoneFilters()}
      </div>
      <div class="event-cards">${events.map(eventCard).join("") || "<p>Nothing in this filter.</p>"}</div>
    </div>`;
  }

  function eventCard(event) {
    const status = MR.statusOf(event, state.now);
    const stages = visibleStages(event).map((stage) => `<div><span>${esc(stage.label)}</span><b>${esc(stageText(event, stage))}</b></div>`).join("");
    return `<a class="event-card" style="--race-color:${esc(MR.raceColor(event.id))}" href="${esc(url(`events/${event.id}/`))}">
      <p class="meta">${esc(flag(event))} ${esc(event.city)} · ${esc(event.seriesStatus === "candidate" ? "Candidate" : "Major")}</p>
      <h2>${esc(event.shortName)} ${esc(String(event.edition))}</h2>
      <span class="status status-${esc(status.key)}">${esc(status.label)}</span>
      <div class="mini-stages">${stages}</div>
    </a>`;
  }

  function renderEvent() {
    const event = state.data.events.find((item) => item.id === document.documentElement.dataset.event);
    if (!event) return `<div class="wrap"><h1>Event not found.</h1></div>`;
    document.title = `${event.name} ${event.edition} — Marathon Race`;
    const next = MR.boundaries([event], state.now)[0];
    const status = MR.statusOf(event, state.now);
    const planned = state.plan.ids.includes(event.id);
    const stages = MR.stagesOf(event).map((stage) => {
      const type = stage.milestone ? stage.milestone.type : "ballot";
      return `<div class="stage importance-${esc(MR.importanceOf(type))}"><span>${esc(stage.label)}</span><b>${esc(stageText(event, stage))}</b></div>`;
    }).join("");
    const rows = timeline(event);
    const monday = MR.planStartFor(event);
    return `<div class="wrap" style="--race-color:${esc(MR.raceColor(event.id))}">
      <p class="eyebrow"><a href="${esc(url("events/"))}">Events</a> · ${esc(event.seriesStatus === "candidate" ? "Candidate" : "World Marathon Major")}</p>
      <div class="hero-row">
        <div>
          <h1>${esc(flag(event))} ${esc(event.name)}</h1>
          <p class="lede">${esc(event.city)}, ${esc(event.country)} · ${esc(raceRange(event))} · <span class="status status-${esc(status.key)}">${esc(status.label)}</span></p>
        </div>
        <div class="actions">
          <a class="button" href="${esc(event.entryUrl)}" target="_blank" rel="noopener noreferrer">Entry page</a>
          <a class="button-ghost" href="${esc(event.officialUrl)}" target="_blank" rel="noopener noreferrer">Official site</a>
        </div>
      </div>
      <div class="stages">${stages}</div>
      ${next ? `<section class="countdown" style="margin-bottom:22px">${miniClock(next)}</section>` : ""}
      <div class="layout">
        <section>
          <h2>Dates</h2>
          <ol class="timeline">${rows}</ol>
        </section>
        <aside class="facts">
          <h2>Entry</h2>
          <p>${esc(event.summary)}</p>
          <dl>
            <dt>Fee</dt><dd>${esc(event.fee.summary)}</dd>
            <dt>Odds</dt><dd>${esc(event.odds.summary)}</dd>
            ${event.fieldNote ? `<dt>Field</dt><dd>${esc(event.fieldNote)}</dd>` : ""}
            <dt>Watch</dt><dd>${esc(event.watchOut)}</dd>
            <dt>16-week block</dt><dd>${monday ? `Starts ${esc(MR.formatYmdLong(monday))}.` : "Not enough of a race date to count."} This is a planning anchor, not a workout plan.</dd>
          </dl>
          <div class="actions">
            <button class="button" type="button" data-action="plan-add" data-id="${esc(event.id)}">${planned ? "In your plan" : "Add to your plan"}</button>
            <button class="button-ghost" type="button" data-action="download-event" data-id="${esc(event.id)}">Download dates</button>
          </div>
          <h3>Sources</h3>
          <ul>${event.sources.map((source) => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a></li>`).join("")}</ul>
        </aside>
      </div>
    </div>`;
  }

  function miniClock(boundary) {
    const heading = MR.boundaryHeading(boundary);
    return `<p class="kicker">This race</p>
      <p class="milestone-line"><i class="dot importance-${esc(MR.importanceOf(boundary.milestone.type))}" style="--race-color:${esc(MR.raceColor(boundary.event.id))}"></i>${esc(heading.title)}</p>
      <div class="clock" data-clock-at="${boundary.t}"><div><b data-dd>00</b><span>Days</span></div><div><b data-hh>00</b><span>Hours</span></div><div><b data-mm>00</b><span>Minutes</span></div><div><b data-ss>00</b><span>Seconds</span></div></div>
      <p>${esc(whenLine(boundary))}</p>`;
  }

  function timeline(event) {
    const next = MR.boundaries([event], state.now)[0];
    return event.milestones.map((milestone) => {
      const past = milestone.end ? Date.parse(milestone.end) < state.now : (milestone.at && Date.parse(milestone.at) < state.now);
      const current = next && next.milestone.id === milestone.id;
      const when = milestoneWhen(event, milestone);
      return `<li class="${past ? "is-past" : ""}">
        <span class="mark-dot importance-${esc(MR.importanceOf(milestone.type))}${milestone.precision === "tbc" ? " is-tbc" : ""}"></span>
        <div>
          <h3>${esc(milestone.label)}${current ? ' <span class="badge">Next</span>' : ""} <span class="badge">${esc(milestone.confidence)}</span></h3>
          <p>${esc(when)}</p>
          ${milestone.note ? `<p class="fine">${esc(milestone.note)}</p>` : ""}
          ${milestone.sourceUrl ? `<p class="fine"><a href="${esc(milestone.sourceUrl)}" target="_blank" rel="noopener noreferrer">Source</a></p>` : ""}
        </div>
      </li>`;
    }).join("");
  }

  function renderPlan() {
    const selected = state.data.events.filter((event) => state.plan.ids.includes(event.id));
    const merged = MR.boundaries(selected, state.now).filter((boundary) => !(boundary.phase === "end" && boundary.milestone.type === "race")).slice(0, 12);
    const choices = state.data.events.slice().sort((a, b) => a.order - b.order).map((event) => {
      const on = state.plan.ids.includes(event.id);
      return `<label class="choice"><input type="checkbox" data-action="plan-toggle" data-id="${esc(event.id)}"${on ? " checked" : ""}> <span><strong>${esc(flag(event))} ${esc(event.shortName)} ${esc(String(event.edition))}</strong><br><span class="fine">${esc(event.city)} · ${esc(MR.statusOf(event, state.now).label)}</span></span></label>`;
    }).join("");
    const cards = selected.map((event) => {
      const checks = state.plan.checks[event.id] || {};
      const monday = MR.planStartFor(event);
      const boxes = CHECKS.map(([key, label]) => `<li><label><input type="checkbox" data-action="plan-check" data-id="${esc(event.id)}" data-key="${key}"${checks[key] ? " checked" : ""}> ${label}</label></li>`).join("");
      return `<article class="check-card"><h3>${esc(event.shortName)} ${esc(String(event.edition))}</h3><p>${monday ? `A 16-week block starts ${esc(MR.formatYmdLong(monday))}.` : "Race date not fixed."}</p><ul class="checks">${boxes}</ul><p><a href="${esc(url(`events/${event.id}/`))}">Open the event page</a></p></article>`;
    }).join("");
    return `<div class="wrap">
      <p class="eyebrow">Plan your race</p>
      <h1>Your own deadline list.</h1>
      <p class="lede">Choose the races you are actually chasing. The list stays in this browser. A 16-week block is counted back to the Monday 111 days before race Sunday, or the Sunday before a Monday race.</p>
      <div class="plan-grid">
        <section class="card" style="padding:8px 16px 16px">
          <h2>Races</h2>
          ${choices}
          <button class="button" type="button" data-action="plan-open">Add races that are open</button>
        </section>
        <section class="stack">
          ${selected.length ? `<article class="check-card"><h2>Coming up</h2><ol class="race-list">${merged.map((boundary) => `<li class="race-row"><span class="race-when"><time>${esc(dayYear(boundary.phase === "end" ? boundary.milestone.end : boundary.milestone.at, boundary.event.timeZone))}</time></span><span><strong>${esc(boundary.event.shortName)} ${esc(String(boundary.event.edition))}</strong><em>${esc(MR.boundaryHeading(boundary).title)}</em></span></li>`).join("") || "<li>No dated milestones left.</li>"}</ol></article>${cards}` : `<article class="check-card"><h2>Nothing selected</h2><p>Add a race, or start with the ballots that are open today.</p></article>`}
        </section>
      </div>
    </div>`;
  }

  function renderAbout() {
    return `<div class="wrap prose">
      <p class="eyebrow">About</p>
      <h1>A calendar you can keep, and a feed other apps can read.</h1>
      <p>Marathon Race tracks the dates that decide whether you are on the start line: ballot open, ballot close, result, payment, expo, and race day. It began as a personal deadline list for the World Marathon Majors. The pages are the public view. The JSON is the product underneath.</p>
      <h2>Use the data</h2>
      <p>Two files, both generated from the same source. <a href="${esc(url("data/events.json"))}">events.json</a> is nested by race. <a href="${esc(url("data/milestones.json"))}">milestones.json</a> is one row per date, already sorted, which is the file to filter. Schema version ${esc(String(state.data.schemaVersion))}. Fields are not renamed or removed without a version bump.</p>
      <ul>
        <li><code>at</code> is an ISO-8601 instant with a numeric offset. Sort and count down with <code>Date.parse</code>. Do not sort the strings.</li>
        <li><code>date</code> is the civil date of that instant in the race city's time zone. Use it for an all-day cell.</li>
        <li><code>precision</code> is <code>instant</code>, <code>day</code>, or <code>tbc</code>. Hide the clock when it is not <code>instant</code>.</li>
        <li><code>confidence</code> is <code>official</code>, <code>reported</code>, or <code>expected</code>. Expected rows have null dates on purpose.</li>
        <li>Ballot close is its own milestone. It is not the <code>end</code> of ballot open. <code>end</code> is only for a range that belongs to one milestone, such as an expo.</li>
      </ul>
      <p>GitHub Pages does not add CORS headers. A server can fetch the Pages URL. A browser app on another site should use jsDelivr, which does:</p>
      <pre>const url = "https://cdn.jsdelivr.net/gh/kelvinccho/marathon-race@main/data/milestones.json";
const data = await fetch(url).then((response) => response.json());
const next = data.milestones
  .filter((row) => row.at && Date.parse(row.at) > Date.now())
  .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];</pre>
      <p>The same dates are also in <a href="${esc(url("calendar.ics"))}">calendar.ics</a>.</p>
      <h2>How a date is labelled</h2>
      <p>Official means the organiser's own page states it. Reported means a published account of that page, kept because the organiser's wording was not captured directly. Expected means it is not published: the file stores null, and the note says why. Nothing here is a guess dressed up as a clock time.</p>
      <p>On the calendar, each race has one pale colour. The mark gets darker as the date matters more: a ballot is the lightest fill, a result is a dark circle with only a border, an expo is dark, and race day is the darkest. The hex values in <code>milestoneTypes</code> stay the feed's type key.</p>
      <h2>What this is not</h2>
      <p>Not an entry agent, not a charity broker, and not affiliated with Abbott World Marathon Majors, NYRR, the B.A.A., London Marathon Events, or any other organiser. Confirm the live entry page before you pay or book flights.</p>
      <h2>What comes next</h2>
      <p>Email alerts, once the site has its own domain. Until then, subscribe to the calendar file or poll the JSON. The plan page is the personal layer: it stays on this device.</p>
    </div>`;
  }

  function renderAlerts() {
    const events = state.data.events.slice().sort((a, b) => a.order - b.order);
    const eventBoxes = events.map((event) => {
      const on = state.alerts.allEvents || state.alerts.eventIds.includes(event.id);
      return `<label class="choice"><input type="checkbox" name="event" value="${esc(event.id)}"${on ? " checked" : ""}> <span>${esc(event.shortName)} ${esc(String(event.edition))}</span></label>`;
    }).join("");
    const typeBoxes = state.data.milestoneTypes.map((type) => {
      const on = state.alerts.types.includes(type.id);
      return `<label class="choice"><input type="checkbox" name="type" value="${esc(type.id)}"${on ? " checked" : ""}> <span>${esc(type.label)}</span></label>`;
    }).join("");
    const pagesIcs = "https://kelvinccho.github.io/marathon-race/calendar.ics";
    return `<div class="wrap">
      <p class="eyebrow">Get alerts</p>
      <h1>A calendar you can subscribe to today.</h1>
      <p class="lede">Email delivery waits for the site's own domain. The dates already work in Google Calendar and Apple Calendar, and any app that can read the JSON.</p>
      ${state.alertSaved ? `<p class="saved">Saved in this browser. Nothing was emailed.</p>` : ""}
      ${state.alertError ? `<p class="saved">${esc(state.alertError)}</p>` : ""}
      <form class="alert-grid" data-alert-form>
        <section class="card" style="padding:8px 16px 16px">
          <h2>Races</h2>
          ${eventBoxes}
          <h2>Dates</h2>
          ${typeBoxes}
        </section>
        <section class="stack">
          <article class="check-card">
            <h2>Save a reminder list</h2>
            <label class="field">Email <input type="email" name="email" value="${esc(state.alerts.email || "")}" placeholder="you@example.com" autocomplete="email"></label>
            <p class="fine">Stored only in this browser. It is not sent anywhere.</p>
            <div class="actions">
              <button class="button" type="submit">Save in this browser</button>
              <button class="button-ghost" type="button" data-action="alert-download">Download .ics</button>
              <button class="button-ghost" type="button" data-action="alert-plan">Use my plan</button>
            </div>
          </article>
          <article class="check-card">
            <h2>Subscribe</h2>
            <p>In Google Calendar: Add calendar → From URL. Paste the feed. Apple Calendar can open the same file.</p>
            <p><code>${pagesIcs}</code></p>
            <button class="button-ghost" type="button" data-action="copy" data-copy="${pagesIcs}">Copy feed URL</button>
            <p class="fine">The feed is rebuilt from <a href="${esc(url("data/events.json"))}">events.json</a>. Poll <a href="${esc(url("data/milestones.json"))}">milestones.json</a> if you would rather send your own alerts.</p>
          </article>
        </section>
      </form>
    </div>`;
  }

  function onClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "month") {
      const next = MR.shiftMonth(state.year, state.month, Number(target.dataset.delta));
      state.year = next.year;
      state.month = next.month;
      syncHash();
      render();
    } else if (action === "today") {
      initToday();
      syncHash();
      render();
    } else if (action === "select-day") {
      state.selected = target.dataset.date;
      render();
    } else if (action === "show-boundary") {
      state.year = Number(target.dataset.date.slice(0, 4));
      state.month = Number(target.dataset.date.slice(5, 7));
      state.selected = target.dataset.date;
      syncHash();
      render();
      const calendar = document.querySelector(".calendar");
      if (calendar) calendar.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (action === "filter") {
      state.filter = target.dataset.filter;
      keepScroll(render);
    } else if (action === "race-filter") {
      const id = target.dataset.id;
      if (id === "all") state.races = [];
      else if (state.races.includes(id)) state.races = state.races.filter((item) => item !== id);
      else state.races.push(id);
      saveView();
      keepScroll(render);
    } else if (action === "type-filter") {
      const type = target.dataset.type;
      if (type === "all") state.types = [];
      else if (state.types.includes(type)) state.types = state.types.filter((item) => item !== type);
      else state.types.push(type);
      saveView();
      keepScroll(render);
    } else if (action === "plan-add") {
      togglePlan(target.dataset.id);
      keepScroll(render);
    } else if (action === "plan-open") {
      state.data.events.forEach((event) => {
        if (MR.statusOf(event, state.now).key === "open" && !state.plan.ids.includes(event.id)) state.plan.ids.push(event.id);
      });
      savePlan();
      keepScroll(render);
    } else if (action === "download-event") {
      download(`${target.dataset.id}.ics`, MR.buildIcs(state.data, { eventIds: [target.dataset.id] }));
    } else if (action === "alert-download") {
      downloadAlerts();
    } else if (action === "alert-plan") {
      state.alerts.allEvents = false;
      state.alerts.eventIds = state.plan.ids.slice();
      state.alertSaved = false;
      keepScroll(render);
    } else if (action === "copy") {
      navigator.clipboard.writeText(target.dataset.copy).then(() => {
        target.textContent = "Copied";
      }).catch(() => {
        target.textContent = "Copy failed";
      });
    }
  }

  function onChange(event) {
    const target = event.target;
    if (target.dataset.action === "plan-toggle") {
      if (target.checked && !state.plan.ids.includes(target.dataset.id)) state.plan.ids.push(target.dataset.id);
      if (!target.checked) state.plan.ids = state.plan.ids.filter((id) => id !== target.dataset.id);
      savePlan();
      keepScroll(render);
    } else if (target.dataset.action === "plan-check") {
      state.plan.checks[target.dataset.id] = state.plan.checks[target.dataset.id] || {};
      state.plan.checks[target.dataset.id][target.dataset.key] = target.checked;
      savePlan();
    }
  }

  function onSubmit(event) {
    if (!event.target.matches("[data-alert-form]")) return;
    event.preventDefault();
    state.alerts = readAlertForm();
    state.alertSaved = true;
    state.alertError = "";
    localStorage.setItem("marathon-race-alerts-v1", JSON.stringify(state.alerts));
    keepScroll(render);
  }

  function readAlertForm() {
    const form = document.querySelector("[data-alert-form]");
    const eventIds = [...form.querySelectorAll('input[name="event"]:checked')].map((input) => input.value);
    const types = [...form.querySelectorAll('input[name="type"]:checked')].map((input) => input.value);
    return {
      email: form.email.value.trim(),
      eventIds,
      types,
      allEvents: eventIds.length === state.data.events.length,
    };
  }

  function downloadAlerts() {
    const alerts = readAlertForm();
    if (!alerts.eventIds.length || !alerts.types.length) {
      state.alertError = "Pick at least one race and one date type.";
      state.alertSaved = false;
      keepScroll(render);
      return;
    }
    download("marathon-race.ics", MR.buildIcs(state.data, { eventIds: alerts.eventIds, types: alerts.types }));
  }

  function tick() {
    state.now = Date.now();
    const nextKey = MR.boundaryKey(MR.boundaries(clockEvents(), state.now)[0]);
    const event = currentEvent();
    const eventKey = event ? MR.boundaryKey(MR.boundaries([event], state.now)[0]) : "";
    if (nextKey !== state.boundaryKey || eventKey !== state.eventKey) {
      keepScroll(render);
      return;
    }
    paintClock();
  }

  function paintClock() {
    const viewer = new Intl.DateTimeFormat("en-GB", {
      weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZoneName: "short",
    }).format(state.now);
    document.querySelectorAll("[data-viewer-now]").forEach((node) => {
      node.textContent = `Your time · ${viewer}`;
    });
    document.querySelectorAll("[data-clock-at]").forEach((clock) => {
      const left = MR.splitRemaining(Number(clock.dataset.clockAt) - state.now);
      clock.querySelector("[data-dd]").textContent = pad(left.days);
      clock.querySelector("[data-hh]").textContent = pad(left.hours);
      clock.querySelector("[data-mm]").textContent = pad(left.minutes);
      clock.querySelector("[data-ss]").textContent = pad(left.seconds);
    });
    const live = document.getElementById("countdown-live");
    const clock = document.querySelector("[data-clock-at]");
    if (live && clock) {
      const left = MR.splitRemaining(Number(clock.dataset.clockAt) - state.now);
      const text = `${left.days} days, ${left.hours} hours, ${left.minutes} minutes`;
      if (live.dataset.text !== text) {
        live.dataset.text = text;
        live.textContent = text;
      }
    }
  }

  function rememberBoundary() {
    state.boundaryKey = MR.boundaryKey(MR.boundaries(clockEvents(), state.now)[0]);
    const event = currentEvent();
    state.eventKey = event ? MR.boundaryKey(MR.boundaries([event], state.now)[0]) : "";
  }

  function upcomingEvents(events) {
    return events.slice().sort((a, b) => {
      const aNext = MR.boundaries([a], state.now)[0];
      const bNext = MR.boundaries([b], state.now)[0];
      if (aNext && bNext) return aNext.t - bNext.t || a.order - b.order;
      if (aNext) return -1;
      if (bNext) return 1;
      return a.order - b.order;
    });
  }

  function stageText(event, stage) {
    const milestones = stage.milestones && stage.milestones.length ? stage.milestones : [stage.milestone].filter(Boolean);
    const dated = milestones.filter((milestone) => milestone.at);
    if (!dated.length) return "Not announced";
    return dated.map((milestone) => {
      if (milestone.end && milestone.endDate && milestone.endDate !== milestone.date) return compactRange(milestone.at, milestone.end, event.timeZone);
      return dayYear(milestone.at, event.timeZone);
    }).join(" · ");
  }

  function dateParts(iso, timeZone) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone, day: "numeric", month: "short", year: "numeric",
    }).formatToParts(new Date(iso));
    const pick = (type) => parts.find((part) => part.type === type).value;
    return { day: pick("day"), month: pick("month"), year: pick("year") };
  }

  function dayYear(iso, timeZone) {
    const part = dateParts(iso, timeZone);
    return `${part.day} ${part.month} ${part.year}`;
  }

  function compactRange(startIso, endIso, timeZone) {
    const start = dateParts(startIso, timeZone);
    const end = dateParts(endIso, timeZone);
    if (start.year === end.year && start.month === end.month) return `${start.day}–${end.day} ${start.month} ${start.year}`;
    if (start.year === end.year) return `${start.day} ${start.month}–${end.day} ${end.month} ${start.year}`;
    return `${dayYear(startIso, timeZone)}–${dayYear(endIso, timeZone)}`;
  }

  function pillLabel(boundary) {
    const type = boundary.milestone.type;
    if (type === "race") return "Race";
    if (type === "expo") return "Expo";
    if (type === "result") return "Result";
    if (type === "payment") return "Payment";
    if (boundary.phase === "end" || type === "ballot_close" || type === "qualifier_close") return "Closes";
    if (type === "ballot_open" || type === "qualifier_open") return "Opens";
    return "Date";
  }

  function milestoneWhen(event, milestone) {
    if (!milestone.at) return "Not announced";
    const start = MR.formatWhen(milestone.at, event.timeZone, milestone.precision);
    if (!milestone.end) return start;
    const endPrecision = milestone.precision === "day" ? "day" : "instant";
    return `${start} – ${MR.formatWhen(milestone.end, event.timeZone, endPrecision)}`;
  }

  function whenLine(boundary) {
    const iso = boundary.phase === "end" ? boundary.milestone.end : boundary.milestone.at;
    const precision = boundary.phase === "end" && boundary.milestone.precision === "instant" ? "instant" : boundary.milestone.precision;
    const main = MR.formatWhen(iso, boundary.event.timeZone, precision === "day" && boundary.phase === "end" ? "instant" : boundary.milestone.precision);
    return main;
  }

  function clockNote(boundary) {
    if (boundary.milestone.precision !== "day") return "";
    return boundary.phase === "end"
      ? "Counted to the end of that day in the race city."
      : "Counted to the start of that date in the race city. No clock time is published.";
  }

  function raceRange(event) {
    if (event.raceEndDate && event.raceEndDate !== event.raceDate) return `${event.raceDate} to ${event.raceEndDate}`;
    return event.raceDate;
  }

  function currentEvent() {
    const id = document.documentElement.dataset.event;
    return id ? state.data.events.find((event) => event.id === id) : null;
  }

  function togglePlan(id) {
    if (state.plan.ids.includes(id)) state.plan.ids = state.plan.ids.filter((item) => item !== id);
    else state.plan.ids.push(id);
    savePlan();
  }

  function savePlan() {
    localStorage.setItem("marathon-race-plan-v1", JSON.stringify(state.plan));
  }

  function scopedEvents() {
    return MR.filterEvents(state.data.events, { ids: state.races, types: state.types });
  }

  function visibleStages(event) {
    return MR.stagesOf(event).filter((stage) => {
      if (!state.types.length) return true;
      const milestones = stage.milestones && stage.milestones.length ? stage.milestones : [stage.milestone].filter(Boolean);
      return milestones.some((milestone) => state.types.includes(milestone.type));
    });
  }

  function clockEvents() {
    return document.documentElement.dataset.page === "home" ? scopedEvents() : state.data.events;
  }

  function loadView() {
    const saved = loadJson("marathon-race-view-v1", { races: [], dates: "all" });
    const known = new Set(state.data.events.map((event) => event.id));
    const knownTypes = new Set(MR.MILESTONE_TYPES);
    state.races = Array.isArray(saved.races) ? saved.races.filter((id) => known.has(id)) : [];
    state.types = Array.isArray(saved.types) ? saved.types.filter((id) => knownTypes.has(id)) : [];
  }

  function saveView() {
    localStorage.setItem("marathon-race-view-v1", JSON.stringify({ races: state.races, types: state.types }));
  }

  function raceFilters() {
    const events = state.data.events.slice().sort((a, b) => a.order - b.order);
    const buttons = [`<button class="text-button" type="button" data-action="race-filter" data-id="all" aria-pressed="${state.races.length === 0}">All races</button>`]
      .concat(events.map((event) => `<button class="text-button" type="button" data-action="race-filter" data-id="${esc(event.id)}" aria-pressed="${state.races.includes(event.id)}"><i style="--swatch:${esc(MR.raceColor(event.id))}" aria-hidden="true"></i>${esc(flag(event))} ${esc(event.shortName)} ${esc(String(event.edition))}</button>`))
      .join("");
    return `<div class="filter-group"><p class="filter-label" id="race-filter-label">Races</p><div class="filters" role="group" aria-labelledby="race-filter-label">${buttons}</div></div>`;
  }

  function milestoneFilters() {
    const buttons = [`<button class="text-button" type="button" data-action="type-filter" data-type="all" aria-pressed="${state.types.length === 0}">All milestones</button>`]
      .concat(state.data.milestoneTypes.map((type) => `<button class="text-button" type="button" data-action="type-filter" data-type="${esc(type.id)}" aria-pressed="${state.types.includes(type.id)}"><i class="sample importance-${esc(MR.importanceOf(type.id))}" aria-hidden="true"></i>${esc(type.label)}</button>`))
      .join("");
    return `<div class="filter-group"><p class="filter-label" id="milestone-filter-label">Milestones</p><div class="filters" role="group" aria-labelledby="milestone-filter-label">${buttons}</div></div>`;
  }

  function legendItem(importance, label) {
    const active = !state.types.length || state.types.some((type) => MR.importanceOf(type) === importance);
    return `<li class="${active ? "" : "is-off"}"><i class="importance-${importance}"></i>${esc(label)}</li>`;
  }

  function initToday() {
    const today = viewerYmd(Date.now());
    state.year = Number(today.slice(0, 4));
    state.month = Number(today.slice(5, 7));
    state.selected = today;
  }

  function syncHash() {
    if (document.documentElement.dataset.page === "home") {
      history.replaceState(null, "", `#${state.year}-${pad(state.month)}`);
    }
  }

  function viewerYmd(ms) {
    return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(ms);
  }

  function checkedLabel() {
    return MR.formatYmdLong(state.data.checked).replace(/^[^,]+, /, "");
  }

  function flag(event) {
    return FLAGS[event.countryCode] || "";
  }

  function download(filename, text) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([text], { type: "text/calendar" }));
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function loadJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "");
      return parsed && typeof parsed === "object" ? Object.assign({}, fallback, parsed) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function keepScroll(fn) {
    const y = window.scrollY;
    fn();
    window.scrollTo(0, y);
  }

  function root() {
    return document.documentElement.dataset.root || ".";
  }

  function url(path) {
    return `${root()}/${String(path || "")}`.replace(/([^:]\/)\/+/g, "$1");
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  }
})();
