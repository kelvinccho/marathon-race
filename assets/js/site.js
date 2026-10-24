(function () {
  const TESTFLIGHT_URL = "";
  const MR = window.MRLogic;
  const I18N = window.MRI18n;
  const TOOLS = [
    ["race-plan", "Race Plan", "tools/race-plan/"],
    ["pace", "Pace calculator", "tools/pace/"],
    ["heart-rate", "Heart rate", "tools/heart-rate/"],
    ["pace-chart", "Pace chart", "tools/pace-chart/"],
    ["gel", "Gel and carbs", "tools/gel/"],
  ];
  const ZONE_NAMES = ["Recovery", "Easy", "Steady", "Threshold", "Hard"];
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
    lang: "en",
    menuOpen: false,
    toolsOpen: false,
    pace: blankPace(),
    chart: blankChart(),
    heart: { age: "", error: "", result: null },
    gel: { hours: "", minutes: "", gramsPerHour: "60", gramsPerGel: "22", drinkPerHour: "0", error: "", result: null },
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
    document.addEventListener("keydown", onKey);
    try {
      const response = await fetch(`${root()}/data/events.json`);
      if (!response.ok) throw new Error(String(response.status));
      state.data = await response.json();
      state.lang = I18N.initialLang();
      MR.setLocale(langTag());
      state.plan = loadJson("marathon-race-plan-v1", state.plan);
      state.alerts = loadJson("marathon-race-alerts-v1", defaultAlerts());
      loadView();
      initMonth();
      render();
      setInterval(tick, 1000);
    } catch (error) {
      app.innerHTML = `<p class="loading">${esc(t("The calendar could not load"))} <a href="${esc(url("data/events.json"))}">events.json</a>.</p>`;
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

  function t(value) {
    return I18N.text(state.lang, value);
  }

  function langTag() {
    return state.lang === "zh-Hant" ? "zh-Hant" : "en-GB";
  }

  function view() {
    return I18N.localize(state.data, state.lang);
  }

  function blankPace() {
    return { distance: "marathon", customKm: "", hours: "", minutes: "", seconds: "", paceMin: "", paceSec: "", error: "", result: null };
  }

  function blankChart() {
    return { distance: "marathon", customKm: "", unit: "km", hours: "", minutes: "", seconds: "", paceMin: "", paceSec: "", error: "", result: null };
  }

  function render() {
    captureTools();
    const page = document.documentElement.dataset.page;
    MR.setLocale(langTag());
    document.documentElement.lang = state.lang === "zh-Hant" ? "zh-Hant" : "en";
    ensureCjkFont();
    const brand = t("Marathon Race");
    const titles = {
      home: brand,
      events: `${t("Events")} — ${brand}`,
      event: `${t("Event")} — ${brand}`,
      plan: `${t("Plan your race")} — ${brand}`,
      about: `${t("About")} — ${brand}`,
      alerts: `${t("Get alerts")} — ${brand}`,
      "race-plan": `${t("Race Plan")} — ${brand}`,
      pace: `${t("Pace calculator")} — ${brand}`,
      "heart-rate": `${t("Heart rate zones")} — ${brand}`,
      "pace-chart": `${t("Pace chart")} — ${brand}`,
      gel: `${t("Gel and carbs")} — ${brand}`,
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
      "race-plan": renderRacePlan,
      pace: renderPace,
      "heart-rate": renderHeart,
      "pace-chart": renderPaceChart,
      gel: renderGel,
    }[page] || renderHome;
    document.getElementById("app").innerHTML = `${header(page)}<main id="content" class="page">${body()}</main>${footer()}`;
    paintClock();
  }

  function header(page) {
    const link = (id, label, path) => `<a href="${esc(url(path))}"${page === id ? ' aria-current="page"' : ""}>${label}</a>`;
    const langButton = (id, label) => `<button class="text-button lang-button" type="button" data-action="lang" data-lang="${id}" aria-pressed="${state.lang === id}" lang="${id === "zh-Hant" ? "zh-Hant" : "en"}">${label}</button>`;
    const menuLabel = t(state.menuOpen ? "Close menu" : "Menu");
    return `<a class="skip" href="#content">${esc(t("Skip to content"))}</a>
      <header class="site-header"><div class="wrap header-row${state.menuOpen ? " is-open" : ""}">
        <a class="brand" href="${esc(url(""))}"><span class="mark" aria-hidden="true"></span>${esc(t("Marathon Race"))}</a>
        <nav class="nav" aria-label="${esc(t("Primary"))}">
          <div class="nav-main" id="site-menu">
            ${link("home", esc(t("Home")), "")}
            ${link("events", esc(t("Events")), "events/")}
            ${link("plan", esc(t("Plan your race")), "plan/")}
            ${link("about", esc(t("About")), "about/")}
            ${toolMenu(page)}
            <div class="lang-switch" role="group" aria-label="${esc(t("Language"))}">${langButton("en", "EN")}${langButton("zh-Hant", "繁體")}</div>
          </div>
          <a class="nav-alert" href="${esc(url("alerts/"))}"${page === "alerts" ? ' aria-current="page"' : ""}>${esc(t("Get Alerts"))}</a>
        </nav>
        <button class="menu-button" type="button" data-action="menu" aria-expanded="${state.menuOpen ? "true" : "false"}" aria-controls="site-menu">
          <span class="sr">${esc(menuLabel)}</span>
          <span class="menu-icon" aria-hidden="true"></span>
        </button>
      </div></header>`;
  }

  function toolMenu(page) {
    const open = state.toolsOpen;
    const current = TOOLS.some(([id]) => id === page);
    const links = TOOLS.map(([id, label, path]) => `<a href="${esc(url(path))}"${page === id ? ' aria-current="page"' : ""}>${esc(t(label))}</a>`).join("");
    return `<div class="nav-drop${open ? " is-open" : ""}${current ? " is-current" : ""}">
      <button class="nav-drop-button" type="button" data-action="tools" aria-expanded="${open ? "true" : "false"}" aria-controls="tool-menu" aria-haspopup="true">${esc(t("Tool"))}<span class="caret" aria-hidden="true"></span></button>
      <div class="nav-drop-panel" id="tool-menu">${links}</div>
    </div>`;
  }

  function footer() {
    return `<footer class="site-footer"><div class="wrap footer-row">
      <p>${esc(t("Checked"))} ${esc(checkedLabel())}. ${esc(t("Independent calendar. Not affiliated with Abbott World Marathon Majors or any race organiser."))} ${esc(view().disclaimer)}</p>
      <nav aria-label="${esc(t("Data"))}">
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
      ? t("Matching the races and milestones selected above.")
      : t("In order of the next date on each race.");
    return `<div class="wrap">
      <p class="eyebrow">${esc(t("World Marathon Majors"))}</p>
      <h1>${esc(t("Every date between the ballot and the start."))}</h1>
      <p class="lede">${esc(t("Ballot open, ballot close, result, payment, expo, and race day. The clock is the next real instant. The bars sit on the race city's own date. Each race keeps one pale colour, and a darker mark means a more important date."))}</p>
      <div class="filter-groups">${raceFilters()}${milestoneFilters()}</div>
      <div class="home-grid">
        <section class="card calendar" aria-label="${esc(t("Month calendar"))}">
          <div class="cal-head">
            <h2>${esc(MR.formatMonth(state.year, state.month))}</h2>
            <div class="month-nav">
              <button class="icon-button" type="button" data-action="month" data-delta="-1" aria-label="${esc(t("Previous month"))}">${esc(t("Prev"))}</button>
              <button class="text-button" type="button" data-action="today">${esc(t("Today"))}</button>
              <button class="icon-button" type="button" data-action="month" data-delta="1" aria-label="${esc(t("Next"))}">${esc(t("Next"))}</button>
            </div>
          </div>
          <div class="cal-scroll"><div class="cal-grid">
            <div class="dow">${(state.lang === "zh-Hant" ? ["一", "二", "三", "四", "五", "六", "日"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((day) => `<span>${day}</span>`).join("")}</div>
            ${weeks.map((week) => weekHtml(week, boundary)).join("")}
          </div></div>
          <ul class="legend">
            ${legendItem("ballot", t("Ballot, lightest"))}
            ${legendItem("result", t("Result, border only"))}
            ${legendItem("payment", t("Payment"))}
            ${legendItem("expo", t("Expo, dark"))}
            ${legendItem("race", t("Race day, darkest"))}
          </ul>
          <p class="cal-note">${esc(t("A darker cap is the day that window closes. Today's date is the filled circle."))}</p>
          ${dayPanel(state.selected || today, events)}
        </section>
        <div class="countdown-wrap">${countdownCard(boundary, after, opens)}</div>
      </div>
      <section class="section">
        <div class="section-head"><h2>${esc(t("Upcoming"))}</h2></div>
        <p class="fine">${esc(scopeNote)}</p>
        <ol class="race-list">${upcomingEvents(events).map(raceRow).join("") || `<li class="empty-filter">${esc(t("Nothing matches this filter."))}</li>`}</ol>
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
      if (item.kind === "span" && ymd === item.endYmd) detail = `${item.event.shortName} · ${t("closes")}`;
      else if (item.kind === "span" && ymd === item.startYmd) detail = `${item.event.shortName} · ${t("opens")}`;
      else if (item.kind === "span") detail = `${item.label} · ${t("open")}`;
      const importance = MR.importanceOf(item.milestone.type);
      return `<li><a href="${esc(url(`events/${item.event.id}/`))}"><i class="dot importance-${importance}" style="--race-color:${esc(MR.raceColor(item.event.id))}"></i>${esc(detail)}</a><span class="fine">${esc(item.event.city)}</span></li>`;
    }).join("") : `<li>${esc(t("Nothing scheduled on this date. Open ballots still show as bars across their window."))}</li>`;
    return `<div class="day-panel"><h3>${esc(MR.formatYmdLong(ymd))}</h3><ul>${rows}</ul></div>`;
  }

  function countdownCard(boundary, after, opens) {
    if (!boundary) {
      const filtered = state.races.length || state.types.length;
      return filtered
        ? `<section class="countdown"><h2>${esc(t("Nothing in this filter."))}</h2><p>${esc(t("Choose another race or milestone, or show all of them."))}</p></section>`
        : `<section class="countdown"><h2>${esc(t("Nothing dated ahead."))}</h2><p>${esc(t("New windows land in the JSON when an organiser publishes them."))}</p></section>`;
    }
    const heading = MR.boundaryHeading(boundary);
    const iso = boundary.phase === "end" ? boundary.milestone.end : boundary.milestone.at;
    const units = clockUnits();
    const openRows = opens.map((window) => `<li><a href="${esc(url(`events/${window.event.id}/`))}"><span>${esc(window.event.shortName)} ${esc(window.open.label)}</span><small>${esc(t("closes"))} ${esc(MR.formatDayMonth(window.close.at, window.event.timeZone))}</small></a></li>`).join("");
    return `<section class="countdown" aria-labelledby="next-heading">
      <p class="viewer-now" data-viewer-now></p>
      <p class="kicker">${esc(t(heading.kicker))}</p>
      <p class="milestone-line"><i class="dot importance-${esc(MR.importanceOf(boundary.milestone.type))}" style="--race-color:${esc(MR.raceColor(boundary.event.id))}"></i>${esc(t(heading.title))}</p>
      <h2 id="next-heading">${esc(boundary.event.name)}</h2>
      <p class="fine">${esc(String(boundary.event.edition))} · ${esc(boundary.event.city)}</p>
      <div class="clock" data-clock-at="${boundary.t}" role="timer" aria-describedby="countdown-live">
        <div><b data-dd>00</b><span>${esc(units[0])}</span></div>
        <div><b data-hh>00</b><span>${esc(units[1])}</span></div>
        <div><b data-mm>00</b><span>${esc(units[2])}</span></div>
        <div><b data-ss>00</b><span>${esc(units[3])}</span></div>
      </div>
      <p class="when">${esc(whenLine(boundary))}</p>
      ${clockNote(boundary) ? `<p class="fine">${esc(t(clockNote(boundary)))}</p>` : ""}
      ${after ? `<p class="fine">${esc(t("After that"))} · ${esc(after.event.shortName)} · ${esc(t(MR.boundaryHeading(after).title))} · ${esc(MR.formatDayMonth(after.phase === "end" ? after.milestone.end : after.milestone.at, after.event.timeZone))}</p>` : ""}
      <div class="countdown-actions">
        <a class="button" href="${esc(url(`events/${boundary.event.id}/`))}">${esc(t("Event page"))}</a>
        <button class="button-ghost" type="button" data-action="show-boundary" data-date="${esc(boundary.phase === "end" ? (boundary.milestone.endDate || boundary.milestone.date) : boundary.milestone.date)}">${esc(t("Show on calendar"))}</button>
      </div>
      ${openRows ? `<p class="kicker">${esc(t("Open now"))}</p><ul class="open-now">${openRows}</ul>` : ""}
      <p class="sr" id="countdown-live"></p>
    </section>`;
  }

  function raceRow(event) {
    const source = state.data.events.find((item) => item.id === event.id) || event;
    const next = MR.boundaries([event], state.now)[0];
    const status = MR.statusOf(source, state.now);
    const when = next ? MR.formatDayMonth(next.phase === "end" ? next.milestone.end : next.milestone.at, event.timeZone) : "—";
    const importance = next ? MR.importanceOf(next.milestone.type) : "ballot";
    const label = next ? t(pillLabel(next)) : t("Date");
    const detail = next ? `${t(MR.boundaryHeading(next).title)} · ${whenLine(next)}` : t("Dates not announced");
    return `<li><a class="race-row" style="--race-color:${esc(MR.raceColor(event.id))}" href="${esc(url(`events/${event.id}/`))}">
      <span class="race-when"><time>${esc(when)}</time><span class="pill importance-${importance}">${esc(label)}</span></span>
      <span><strong>${esc(flag(event))} ${esc(event.name)} <span>${esc(String(event.edition))}</span></strong><em>${esc(event.city)} · ${esc(detail)}</em></span>
      <span class="status status-${esc(status.key)}">${esc(t(status.label))}</span>
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
    const events = view().events.slice().sort((a, b) => a.order - b.order).filter((event) => {
      if (state.races.length && !state.races.includes(event.id)) return false;
      if (state.types.length && !event.milestones.some((milestone) => state.types.includes(milestone.type))) return false;
      if (state.filter === "all") return true;
      return MR.statusOf(event, state.now).key === state.filter;
    });
    const statusButtons = filters.map(([id, label]) => `<button class="text-button" type="button" data-action="filter" data-filter="${id}" aria-pressed="${state.filter === id}">${esc(t(label))}</button>`).join("");
    return `<div class="wrap">
      <p class="eyebrow">${esc(t("Events"))}</p>
      <h1>${esc(t("The majors, and the candidate."))}</h1>
      <p class="lede">${esc(t("Eight World Marathon Majors, the New York race still in race week, and Shanghai while it is being assessed. Open a race for the full date list and the official page."))}</p>
      <div class="filter-groups">
        <div class="filter-group"><p class="filter-label" id="status-filter-label">${esc(t("Status"))}</p><div class="filters" role="group" aria-labelledby="status-filter-label">${statusButtons}</div></div>
        ${raceFilters()}
        ${milestoneFilters()}
      </div>
      <div class="event-cards">${events.map(eventCard).join("") || `<p>${esc(t("Nothing in this filter."))}</p>`}</div>
    </div>`;
  }

  function eventCard(event) {
    const status = MR.statusOf(event, state.now);
    const stages = visibleStages(event).map((stage) => `<div><span>${esc(t(stage.label))}</span><b>${esc(stageText(event, stage))}</b></div>`).join("");
    return `<a class="event-card" style="--race-color:${esc(MR.raceColor(event.id))}" href="${esc(url(`events/${event.id}/`))}">
      <p class="meta">${esc(flag(event))} ${esc(event.city)} · ${esc(event.seriesStatus === "candidate" ? t("Candidate") : t("Major"))}</p>
      <h2>${esc(event.shortName)} ${esc(String(event.edition))}</h2>
      <span class="status status-${esc(status.key)}">${esc(t(status.label))}</span>
      <div class="mini-stages">${stages}</div>
    </a>`;
  }

  function renderEvent() {
    const event = view().events.find((item) => item.id === document.documentElement.dataset.event);
    if (!event) return `<div class="wrap"><h1>${esc(t("Event not found."))}</h1></div>`;
    document.title = `${event.name} ${event.edition} — ${t("Marathon Race")}`;
    const next = MR.boundaries([event], state.now)[0];
    const status = MR.statusOf(event, state.now);
    const planned = state.plan.ids.includes(event.id);
    const stages = MR.stagesOf(event).map((stage) => {
      const type = stage.milestone ? stage.milestone.type : "ballot";
      return `<div class="stage importance-${esc(MR.importanceOf(type))}"><span>${esc(t(stage.label))}</span><b>${esc(stageText(event, stage))}</b></div>`;
    }).join("");
    const rows = timeline(event);
    const monday = MR.planStartFor(event);
    return `<div class="wrap" style="--race-color:${esc(MR.raceColor(event.id))}">
      <p class="eyebrow"><a href="${esc(url("events/"))}">${esc(t("Events"))}</a> · ${esc(event.seriesStatus === "candidate" ? t("Candidate") : t("World Marathon Major"))}</p>
      <div class="hero-row">
        <div>
          <h1>${esc(flag(event))} ${esc(event.name)}</h1>
          <p class="lede">${esc(event.city)}, ${esc(event.country)} · ${esc(raceRange(event))} · <span class="status status-${esc(status.key)}">${esc(t(status.label))}</span></p>
        </div>
        <div class="actions">
          <a class="button" href="${esc(event.entryUrl)}" target="_blank" rel="noopener noreferrer">${esc(t("Entry page"))}</a>
          <a class="button-ghost" href="${esc(event.officialUrl)}" target="_blank" rel="noopener noreferrer">${esc(t("Official site"))}</a>
        </div>
      </div>
      <div class="stages">${stages}</div>
      ${next ? `<section class="countdown" style="margin-bottom:22px">${miniClock(next)}</section>` : ""}
      <div class="layout">
        <section>
          <h2>${esc(t("Dates"))}</h2>
          <ol class="timeline">${rows}</ol>
        </section>
        <aside class="facts">
          <h2>${esc(t("Entry"))}</h2>
          <p>${esc(event.summary)}</p>
          <dl>
            <dt>${esc(t("Fee"))}</dt><dd>${esc(event.fee.summary)}</dd>
            <dt>${esc(t("Odds"))}</dt><dd>${esc(event.odds.summary)}</dd>
            ${event.fieldNote ? `<dt>${esc(t("Field"))}</dt><dd>${esc(event.fieldNote)}</dd>` : ""}
            <dt>${esc(t("Watch"))}</dt><dd>${esc(event.watchOut)}</dd>
            <dt>${esc(t("16-week block"))}</dt><dd>${monday ? `${esc(blockStarts(monday))} ` : esc(t("Not enough of a race date to count."))}${esc(t("This is a planning anchor, not a workout plan."))}</dd>
          </dl>
          <div class="actions">
            <button class="button" type="button" data-action="plan-add" data-id="${esc(event.id)}">${esc(planned ? t("In your plan") : t("Add to your plan"))}</button>
            <button class="button-ghost" type="button" data-action="download-event" data-id="${esc(event.id)}">${esc(t("Download dates"))}</button>
          </div>
          <h3>${esc(t("Sources"))}</h3>
          <ul>${event.sources.map((source) => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a></li>`).join("")}</ul>
        </aside>
      </div>
    </div>`;
  }

  function miniClock(boundary) {
    const heading = MR.boundaryHeading(boundary);
    const units = clockUnits();
    return `<p class="kicker">${esc(t("This race"))}</p>
      <p class="milestone-line"><i class="dot importance-${esc(MR.importanceOf(boundary.milestone.type))}" style="--race-color:${esc(MR.raceColor(boundary.event.id))}"></i>${esc(t(heading.title))}</p>
      <div class="clock" data-clock-at="${boundary.t}"><div><b data-dd>00</b><span>${esc(units[0])}</span></div><div><b data-hh>00</b><span>${esc(units[1])}</span></div><div><b data-mm>00</b><span>${esc(units[2])}</span></div><div><b data-ss>00</b><span>${esc(units[3])}</span></div></div>
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
          <h3>${esc(milestone.label)}${current ? ` <span class="badge">${esc(t("Up next"))}</span>` : ""} <span class="badge">${esc(t(milestone.confidence))}</span></h3>
          <p>${esc(when)}</p>
          ${milestone.note ? `<p class="fine">${esc(milestone.note)}</p>` : ""}
          ${milestone.sourceUrl ? `<p class="fine"><a href="${esc(milestone.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(t("Source"))}</a></p>` : ""}
        </div>
      </li>`;
    }).join("");
  }

  function renderPlan() {
    const selected = view().events.filter((event) => state.plan.ids.includes(event.id));
    const merged = MR.boundaries(selected, state.now).filter((boundary) => !(boundary.phase === "end" && boundary.milestone.type === "race")).slice(0, 12);
    const choices = view().events.slice().sort((a, b) => a.order - b.order).map((event) => {
      const on = state.plan.ids.includes(event.id);
      return `<label class="choice"><input type="checkbox" data-action="plan-toggle" data-id="${esc(event.id)}"${on ? " checked" : ""}> <span><strong>${esc(flag(event))} ${esc(event.shortName)} ${esc(String(event.edition))}</strong><br><span class="fine">${esc(event.city)} · ${esc(t(MR.statusOf(event, state.now).label))}</span></span></label>`;
    }).join("");
    const cards = selected.map((event) => {
      const checks = state.plan.checks[event.id] || {};
      const monday = MR.planStartFor(event);
      const boxes = CHECKS.map(([key, label]) => `<li><label><input type="checkbox" data-action="plan-check" data-id="${esc(event.id)}" data-key="${key}"${checks[key] ? " checked" : ""}> ${esc(t(label))}</label></li>`).join("");
      return `<article class="check-card"><h3>${esc(event.shortName)} ${esc(String(event.edition))}</h3><p>${monday ? esc(blockStarts(monday)) : esc(t("Race date not fixed."))}</p><ul class="checks">${boxes}</ul><p><a href="${esc(url(`events/${event.id}/`))}">${esc(t("Open the event page"))}</a></p></article>`;
    }).join("");
    return `<div class="wrap">
      <p class="eyebrow">${esc(t("Plan your race"))}</p>
      <h1>${esc(t("Your own deadline list."))}</h1>
      <p class="lede">${esc(t("Choose the races you are actually chasing. The list stays in this browser. A 16-week block is counted back to the Monday 111 days before race Sunday, or the Sunday before a Monday race."))}</p>
      <div class="plan-grid">
        <section class="card" style="padding:8px 16px 16px">
          <h2>${esc(t("Races"))}</h2>
          ${choices}
          <button class="button" type="button" data-action="plan-open">${esc(t("Add races that are open"))}</button>
        </section>
        <section class="stack">
          ${selected.length ? `<article class="check-card"><h2>${esc(t("Coming up"))}</h2><ol class="race-list">${merged.map((boundary) => `<li class="race-row"><span class="race-when"><time>${esc(dayYear(boundary.phase === "end" ? boundary.milestone.end : boundary.milestone.at, boundary.event.timeZone))}</time></span><span><strong>${esc(boundary.event.shortName)} ${esc(String(boundary.event.edition))}</strong><em>${esc(t(MR.boundaryHeading(boundary).title))}</em></span></li>`).join("") || `<li>${esc(t("No dated milestones left."))}</li>`}</ol></article>${cards}` : `<article class="check-card"><h2>${esc(t("Nothing selected"))}</h2><p>${esc(t("Add a race, or start with the ballots that are open today."))}</p></article>`}
        </section>
      </div>
    </div>`;
  }

  function renderAbout() {
    return `<div class="wrap prose">
      <p class="eyebrow">${esc(t("About"))}</p>
      <h1>${esc(t("A calendar you can keep, and a feed other apps can read."))}</h1>
      <p>${esc(t("Marathon Race tracks the dates that decide whether you are on the start line: ballot open, ballot close, result, payment, expo, and race day. It began as a personal deadline list for the World Marathon Majors. The pages are the public view. The JSON is the product underneath."))}</p>
      <h2>${esc(t("Use the data"))}</h2>
      <p>${esc(t("Two files, both generated from the same source."))} <a href="${esc(url("data/events.json"))}">events.json</a> ${esc(t("is nested by race."))} <a href="${esc(url("data/milestones.json"))}">milestones.json</a> ${esc(t("is one row per date, already sorted, which is the file to filter. Schema version"))} ${esc(String(state.data.schemaVersion))}. ${esc(t("Fields are not renamed or removed without a version bump."))}</p>
      <ul>
        <li><code>at</code> ${esc(t("is an ISO-8601 instant with a numeric offset. Sort and count down with"))} <code>Date.parse</code>. ${esc(t("Do not sort the strings."))}</li>
        <li><code>date</code> ${esc(t("is the civil date of that instant in the race city's time zone. Use it for an all-day cell."))}</li>
        <li><code>precision</code> ${esc(t("is"))} <code>instant</code>, <code>day</code>, ${esc(t("or"))} <code>tbc</code>. ${state.lang === "zh-Hant" ? `${esc(t("Hide the clock when it is not"))} <code>instant</code> ${esc(t("instant."))}` : "Hide the clock when it is not <code>instant</code>."}</li>
        <li><code>confidence</code> ${esc(t("is"))} <code>official</code>, <code>reported</code>, ${esc(t("or"))} <code>expected</code>. ${esc(t("Expected rows have null dates on purpose."))}</li>
        <li>${esc(t("Ballot close is its own milestone. It is not the"))} <code>end</code> ${esc(t("of ballot open."))} <code>end</code> ${esc(t("is only for a range that belongs to one milestone, such as an expo."))}</li>
      </ul>
      <p>${esc(t("GitHub Pages does not add CORS headers. A server can fetch the Pages URL. A browser app on another site should use jsDelivr, which does:"))}</p>
      <pre>const url = "https://cdn.jsdelivr.net/gh/kelvinccho/marathon-race@main/data/milestones.json";
const data = await fetch(url).then((response) => response.json());
const next = data.milestones
  .filter((row) => row.at && Date.parse(row.at) > Date.now())
  .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))[0];</pre>
      <p>${esc(t("The same dates are also in"))} <a href="${esc(url("calendar.ics"))}">calendar.ics</a>.</p>
      <h2>${esc(t("How a date is labelled"))}</h2>
      <p>${esc(t("Official means the organiser's own page states it. Reported means a published account of that page, kept because the organiser's wording was not captured directly. Expected means it is not published: the file stores null, and the note says why. Nothing here is a guess dressed up as a clock time."))}</p>
      <p>${esc(t("On the calendar, each race has one pale colour. The mark gets darker as the date matters more: a ballot is the lightest fill, a result is a dark circle with only a border, an expo is dark, and race day is the darkest. The hex values in"))} <code>milestoneTypes</code> ${esc(t("stay the feed's type key."))}</p>
      <p>${esc(t("The pages can be read in English or Traditional Chinese. Event names stay as the organiser publishes them. The JSON file stays in English."))}</p>
      <h2>${esc(t("What this is not"))}</h2>
      <p>${esc(t("Not an entry agent, not a charity broker, and not affiliated with Abbott World Marathon Majors, NYRR, the B.A.A., London Marathon Events, or any other organiser. Confirm the live entry page before you pay or book flights."))}</p>
      <h2>${esc(t("What comes next"))}</h2>
      <p>${esc(t("Email alerts, once the site has its own domain. Until then, subscribe to the calendar file or poll the JSON. The plan page is the personal layer: it stays on this device."))}</p>
    </div>`;
  }

  function renderAlerts() {
    const events = view().events.slice().sort((a, b) => a.order - b.order);
    const eventBoxes = events.map((event) => {
      const on = state.alerts.allEvents || state.alerts.eventIds.includes(event.id);
      return `<label class="choice"><input type="checkbox" name="event" value="${esc(event.id)}"${on ? " checked" : ""}> <span>${esc(event.shortName)} ${esc(String(event.edition))}</span></label>`;
    }).join("");
    const typeBoxes = view().milestoneTypes.map((type) => {
      const on = state.alerts.types.includes(type.id);
      return `<label class="choice"><input type="checkbox" name="type" value="${esc(type.id)}"${on ? " checked" : ""}> <span>${esc(type.label)}</span></label>`;
    }).join("");
    const pagesIcs = "https://kelvinccho.github.io/marathon-race/calendar.ics";
    return `<div class="wrap">
      <p class="eyebrow">${esc(t("Get alerts"))}</p>
      <h1>${esc(t("A calendar you can subscribe to today."))}</h1>
      <p class="lede">${esc(t("Email delivery waits for the site's own domain. The dates already work in Google Calendar and Apple Calendar, and any app that can read the JSON."))}</p>
      ${state.alertSaved ? `<p class="saved">${esc(t("Saved in this browser. Nothing was emailed."))}</p>` : ""}
      ${state.alertError ? `<p class="saved">${esc(t(state.alertError))}</p>` : ""}
      <form class="alert-grid" data-alert-form>
        <section class="card" style="padding:8px 16px 16px">
          <h2>${esc(t("Races"))}</h2>
          ${eventBoxes}
          <h2>${esc(t("Dates"))}</h2>
          ${typeBoxes}
        </section>
        <section class="stack">
          <article class="check-card">
            <h2>${esc(t("Save a reminder list"))}</h2>
            <label class="field">${esc(t("Email"))} <input type="email" name="email" value="${esc(state.alerts.email || "")}" placeholder="you@example.com" autocomplete="email"></label>
            <p class="fine">${esc(t("Stored only in this browser. It is not sent anywhere."))}</p>
            <div class="actions">
              <button class="button" type="submit">${esc(t("Save in this browser"))}</button>
              <button class="button-ghost" type="button" data-action="alert-download">${esc(t("Download .ics"))}</button>
              <button class="button-ghost" type="button" data-action="alert-plan">${esc(t("Use my plan"))}</button>
            </div>
          </article>
          <article class="check-card">
            <h2>${esc(t("Subscribe"))}</h2>
            <p>${esc(t("In Google Calendar: Add calendar → From URL. Paste the feed. Apple Calendar can open the same file."))}</p>
            <p><code>${pagesIcs}</code></p>
            <button class="button-ghost" type="button" data-action="copy" data-copy="${pagesIcs}">${esc(t("Copy feed URL"))}</button>
            <p class="fine">${esc(t("The feed is rebuilt from"))} <a href="${esc(url("data/events.json"))}">events.json</a>. ${esc(t("Poll"))} <a href="${esc(url("data/milestones.json"))}">milestones.json</a> ${esc(t("if you would rather send your own alerts."))}</p>
          </article>
        </section>
      </form>
    </div>`;
  }

  function renderRacePlan() {
    return `<div class="wrap prose">
      <p class="eyebrow">${esc(t("Tool"))}</p>
      <h1>PaceBest</h1>
      <p class="lede">${esc(t("PaceBest plans a race you can follow on the day."))}</p>
      <p>${esc(t("The tagline is PB: Plan your Marathon. It runs on iPhone, and on Apple Watch when you want the plan on your wrist."))}</p>
      <ul>
        <li>${esc(t("A race is split into distance segments. Each segment has a target pace and an optional heart-rate range. Gel and water reminders can sit on the timeline by time or distance."))}</li>
        <li>${esc(t("Marathon, half marathon, 10K, and a custom distance."))}</li>
        <li>${esc(t("Kilometres or miles."))}</li>
        <li>${esc(t("Apple Watch guidance, with the same plan mirrored on iPhone."))}</li>
        <li>${esc(t("Plans stay on the device. No account."))}</li>
        <li>${esc(t("One saved plan is free. More plans are a one-time purchase in the app."))}</li>
        <li>${esc(t("It needs iOS 26 or later, and watchOS 26 or later for the watch."))}</li>
      </ul>
      ${testFlightLink()}
      <p class="fine">${esc(t("A planning tool, not medical or coaching advice."))}</p>
    </div>`;
  }

  function testFlightLink() {
    if (/^https:\/\/testflight\.apple\.com\/join\/[A-Za-z0-9]+$/.test(TESTFLIGHT_URL)) {
      return `<p><a class="button" href="${esc(TESTFLIGHT_URL)}">${esc(t("Install with TestFlight"))}</a></p>`;
    }
    return `<p>${esc(t("The public TestFlight link is not published yet."))}</p>`;
  }

  function renderPace() {
    const pace = state.pace;
    return `<div class="wrap">
      <p class="eyebrow">${esc(t("Tool"))}</p>
      <h1>${esc(t("Pace calculator"))}</h1>
      <form class="tool-form" data-pace-form>
        <div class="tool-fields">${distanceFields(pace)}</div>
        ${clockFields(t("Finish time"), pace)}
        ${paceFields(pace)}
        <div class="tool-actions">
          <button class="button" type="submit" data-calc="pace">${esc(t("Calculate pace"))}</button>
          <button class="button-ghost" type="submit" data-calc="finish">${esc(t("Calculate finish time"))}</button>
        </div>
      </form>
      <div class="tool-result">${toolMessage(pace.error, pace.result ? paceReadout(pace.result) : "")}</div>
      <p class="fine">${esc(t("A planning tool, not medical or coaching advice."))}</p>
    </div>`;
  }

  function renderPaceChart() {
    const chart = state.chart;
    return `<div class="wrap">
      <p class="eyebrow">${esc(t("Tool"))}</p>
      <h1>${esc(t("Pace chart"))}</h1>
      <form class="tool-form" data-chart-form>
        <div class="tool-fields">
          ${distanceFields(chart)}
          <label>${esc(t("Unit"))}<select name="unit" data-action="tool-unit"><option value="km"${chart.unit === "km" ? " selected" : ""}>${esc(t("Kilometres"))}</option><option value="mi"${chart.unit === "mi" ? " selected" : ""}>${esc(t("Miles"))}</option></select></label>
        </div>
        ${clockFields(t("Finish time"), chart)}
        ${paceFields(chart)}
        <div class="tool-actions"><button class="button" type="submit">${esc(t("Show chart"))}</button></div>
      </form>
      <div class="tool-result">${toolMessage(chart.error, chart.result ? chartTable(chart.result) : "")}</div>
      <p class="fine">${esc(t("Even pace. The last row is the exact distance."))}</p>
    </div>`;
  }

  function renderHeart() {
    const heart = state.heart;
    const table = heart.result ? `<p>${esc(t("Estimated maximum"))} <strong>${esc(String(heart.result.max))} ${esc(t("bpm"))}</strong></p>
      <div class="chart-scroll"><table class="tool-table"><thead><tr><th>${esc(t("Zone"))}</th><th>${esc(t("Range"))}</th></tr></thead><tbody>
      ${heart.result.zones.map((zone) => `<tr><td>${esc(String(zone.zone))} · ${esc(t(ZONE_NAMES[zone.zone - 1]))}</td><td>${esc(String(zone.low))}–${esc(String(zone.high))}</td></tr>`).join("")}
      </tbody></table></div>` : "";
    return `<div class="wrap">
      <p class="eyebrow">${esc(t("Tool"))}</p>
      <h1>${esc(t("Heart rate zones"))}</h1>
      <form class="tool-form" data-hr-form>
        <div class="tool-fields"><label>${esc(t("Age"))}<input name="age" type="number" min="10" max="100" step="1" inputmode="numeric" value="${esc(heart.age)}"></label></div>
        <div class="tool-actions"><button class="button" type="submit">${esc(t("Show zones"))}</button></div>
      </form>
      <div class="tool-result">${toolMessage(heart.error, table)}</div>
      <p class="fine">${esc(t("220 minus age is a rough estimate, not a test."))} ${esc(t("A planning tool, not medical or coaching advice."))}</p>
    </div>`;
  }

  function renderGel() {
    const gel = state.gel;
    return `<div class="wrap">
      <p class="eyebrow">${esc(t("Tool"))}</p>
      <h1>${esc(t("Gel and carbs"))}</h1>
      <form class="tool-form" data-gel-form>
        <div class="tool-fields">
          <label>${esc(t("Hours"))}<input name="hours" type="number" min="0" step="1" inputmode="numeric" value="${esc(gel.hours)}"></label>
          <label>${esc(t("Minutes"))}<input name="minutes" type="number" min="0" step="1" inputmode="numeric" value="${esc(gel.minutes)}"></label>
          <label>${esc(t("Carbs per hour"))}<input name="gramsPerHour" type="number" min="0" step="1" inputmode="decimal" value="${esc(gel.gramsPerHour)}"></label>
          <label>${esc(t("Carbs per gel"))}<input name="gramsPerGel" type="number" min="0" step="1" inputmode="decimal" value="${esc(gel.gramsPerGel)}"></label>
          <label>${esc(t("Drink carbs per hour"))}<input name="drinkPerHour" type="number" min="0" step="1" inputmode="decimal" value="${esc(gel.drinkPerHour)}"></label>
        </div>
        <div class="tool-actions"><button class="button" type="submit">${esc(t("Calculate"))}</button></div>
      </form>
      <div class="tool-result">${toolMessage(gel.error, gel.result ? gelReadout(gel.result) : "")}</div>
      <p class="fine">${esc(t("Common planning ranges are 30–90 g of carbohydrate per hour. Many gels are 20–25 g. This is not a nutrition prescription."))}</p>
    </div>`;
  }

  function distanceFields(values) {
    const options = [["5k", "5K"], ["10k", "10K"], ["half", t("Half marathon")], ["marathon", t("Marathon")], ["custom", t("Custom")]];
    const select = options.map(([id, label]) => `<option value="${id}"${values.distance === id ? " selected" : ""}>${esc(label)}</option>`).join("");
    const custom = values.distance === "custom"
      ? `<label>${esc(t("Custom kilometres"))}<input name="customKm" type="number" min="0" step="0.001" inputmode="decimal" value="${esc(values.customKm)}"></label>`
      : "";
    return `<label>${esc(t("Distance"))}<select name="distance" data-action="tool-distance">${select}</select></label>${custom}`;
  }

  function clockFields(legend, values) {
    return `<fieldset class="tool-clock"><legend>${esc(legend)}</legend>
      <label>${esc(t("Hours"))}<input name="hours" type="number" min="0" step="1" inputmode="numeric" value="${esc(values.hours)}"></label>
      <label>${esc(t("Minutes"))}<input name="minutes" type="number" min="0" step="1" inputmode="numeric" value="${esc(values.minutes)}"></label>
      <label>${esc(t("Seconds"))}<input name="seconds" type="number" min="0" step="1" inputmode="numeric" value="${esc(values.seconds)}"></label>
    </fieldset>`;
  }

  function paceFields(values) {
    return `<fieldset class="tool-clock"><legend>${esc(t("Pace per kilometre"))}</legend>
      <label>${esc(t("Minutes"))}<input name="paceMin" type="number" min="0" step="1" inputmode="numeric" value="${esc(values.paceMin)}"></label>
      <label>${esc(t("Seconds"))}<input name="paceSec" type="number" min="0" step="1" inputmode="numeric" value="${esc(values.paceSec)}"></label>
    </fieldset>`;
  }

  function toolMessage(error, body) {
    if (error) return `<p class="tool-error">${esc(t(error))}</p>`;
    return body || "";
  }

  function paceReadout(plan) {
    return `<div class="pace-readout">
      <article><span>${esc(t("Finish time"))}</span><strong>${esc(formatClock(plan.totalSeconds))}</strong></article>
      <article><span>${esc(t("Pace per kilometre"))}</span><strong>${esc(formatPace(plan.secPerKm))}</strong></article>
      <article><span>${esc(t("Pace per mile"))}</span><strong>${esc(formatPace(plan.secPerMile))}</strong></article>
    </div>`;
  }

  function chartTable(plan) {
    const rows = plan.rows.map((row) => {
      const mark = row.finish || splitMark(row, plan.unit);
      return `<tr${mark ? ' class="is-mark"' : ""}><td>${esc(formatSplit(row, plan.unit))}</td><td>${esc(formatClock(row.seconds))}</td></tr>`;
    }).join("");
    const unit = plan.unit === "mi" ? "mi" : "km";
    return `<div class="chart-scroll"><table class="tool-table"><thead><tr><th>${esc(t("Split"))} (${unit})</th><th>${esc(t("Cumulative"))}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function gelReadout(plan) {
    const line = plan.gels === 0
      ? `<p>${esc(t("The drink already covers this target."))}</p>`
      : `<p>${esc(t("About every"))} ${esc(formatAmount(plan.intervalMinutes))} ${esc(t("minutes."))}</p>`;
    return `<div class="pace-readout">
      <article><span>${esc(t("Carb target"))}</span><strong>${esc(formatAmount(plan.totalCarbs))} g</strong></article>
      <article><span>${esc(t("From drink"))}</span><strong>${esc(formatAmount(plan.drinkCarbs))} g</strong></article>
      <article><span>${esc(t("From gels"))}</span><strong>${esc(formatAmount(plan.gelCarbs))} g</strong></article>
      <article><span>${esc(t("Gels"))}</span><strong>${esc(String(plan.gels))}</strong></article>
    </div>${line}`;
  }

  function splitMark(row, unit) {
    const step = unit === "mi" ? row.distanceKm / 1.609344 : row.distanceKm;
    const nearest = Math.round(step);
    return Math.abs(step - nearest) < 1e-4 && nearest % 5 === 0;
  }

  function formatSplit(row, unit) {
    const step = unit === "mi" ? row.distanceKm / 1.609344 : row.distanceKm;
    if (row.finish) {
      const rounded = Math.round(step * 1000) / 1000;
      return Number.isInteger(rounded) ? String(rounded) : String(rounded);
    }
    return String(Math.round(step));
  }

  function formatPace(seconds) {
    const rounded = Math.round(seconds);
    return `${Math.floor(rounded / 60)}:${pad(rounded % 60)}`;
  }

  function formatClock(seconds) {
    const rounded = Math.max(0, Math.round(seconds));
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const secs = rounded % 60;
    if (hours) return `${hours}:${pad(minutes)}:${pad(secs)}`;
    return `${minutes}:${pad(secs)}`;
  }

  function formatAmount(value) {
    const rounded = Math.round(Number(value) * 10) / 10;
    if (!Number.isFinite(rounded)) return "";
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }

  function clockSeconds(hours, minutes, seconds) {
    const h = Number(hours || 0);
    const m = Number(minutes || 0);
    const s = Number(seconds || 0);
    if (![h, m, s].every((part) => Number.isFinite(part) && part >= 0)) return null;
    const total = h * 3600 + m * 60 + s;
    return total > 0 ? total : null;
  }

  function paceSeconds(minutes, seconds) {
    const m = Number(minutes);
    const s = Number(seconds);
    if (!Number.isFinite(m) || !Number.isFinite(s) || m < 0 || s < 0) return null;
    const total = m * 60 + s;
    return total > 0 ? total : null;
  }

  function readNamed(form) {
    const data = {};
    new FormData(form).forEach((value, key) => {
      data[key] = String(value);
    });
    return data;
  }

  function captureTools() {
    const pace = document.querySelector("[data-pace-form]");
    if (pace) Object.assign(state.pace, readNamed(pace));
    const chart = document.querySelector("[data-chart-form]");
    if (chart) Object.assign(state.chart, readNamed(chart));
    const heart = document.querySelector("[data-hr-form]");
    if (heart) Object.assign(state.heart, readNamed(heart));
    const gel = document.querySelector("[data-gel-form]");
    if (gel) Object.assign(state.gel, readNamed(gel));
  }

  function applyPace(mode) {
    const form = document.querySelector("[data-pace-form]");
    if (!form) return;
    const fields = readNamed(form);
    Object.assign(state.pace, fields);
    const km = MR.distanceKm(fields.distance, fields.customKm);
    if (!km) {
      state.pace.error = "Enter a distance.";
      state.pace.result = null;
      keepScroll(render);
      return;
    }
    const total = mode === "finish"
      ? (() => {
        const pace = paceSeconds(fields.paceMin, fields.paceSec);
        return pace == null ? null : pace * km;
      })()
      : clockSeconds(fields.hours, fields.minutes, fields.seconds);
    if (total == null) {
      state.pace.error = mode === "finish" ? "Enter a pace." : "Enter a finish time.";
      state.pace.result = null;
      keepScroll(render);
      return;
    }
    state.pace.error = "";
    state.pace.result = MR.pacePlan(km, total);
    keepScroll(render);
  }

  function applyChart() {
    const form = document.querySelector("[data-chart-form]");
    if (!form) return;
    const fields = readNamed(form);
    Object.assign(state.chart, fields);
    const km = MR.distanceKm(fields.distance, fields.customKm);
    if (!km) {
      state.chart.error = "Enter a distance.";
      state.chart.result = null;
      keepScroll(render);
      return;
    }
    let total = clockSeconds(fields.hours, fields.minutes, fields.seconds);
    if (total == null) {
      const pace = paceSeconds(fields.paceMin, fields.paceSec);
      total = pace == null ? null : pace * km;
    }
    if (total == null) {
      state.chart.error = "Enter a finish time.";
      state.chart.result = null;
      keepScroll(render);
      return;
    }
    state.chart.error = "";
    state.chart.result = MR.paceChart(km, total, fields.unit === "mi" ? "mi" : "km");
    keepScroll(render);
  }

  function applyHeart() {
    const form = document.querySelector("[data-hr-form]");
    if (!form) return;
    const fields = readNamed(form);
    Object.assign(state.heart, fields);
    const zones = MR.heartZones(Number(fields.age));
    state.heart.error = zones ? "" : "Enter an age from 10 to 100.";
    state.heart.result = zones;
    keepScroll(render);
  }

  function applyGel() {
    const form = document.querySelector("[data-gel-form]");
    if (!form) return;
    const fields = readNamed(form);
    Object.assign(state.gel, fields);
    const hours = Number(fields.hours || 0);
    const minutes = Number(fields.minutes || 0);
    const plan = MR.gelPlan({
      minutes: hours * 60 + minutes,
      gramsPerHour: fields.gramsPerHour,
      gramsPerGel: fields.gramsPerGel,
      drinkPerHour: fields.drinkPerHour,
    });
    state.gel.error = plan ? "" : "Enter a duration, a carb target, and the carbs in one gel.";
    state.gel.result = plan;
    keepScroll(render);
  }

  function onKey(event) {
    if (event.key !== "Escape") return;
    if (state.toolsOpen) {
      state.toolsOpen = false;
      keepScroll(render);
      const button = document.querySelector(".nav-drop-button");
      if (button) button.focus();
      return;
    }
    if (!state.menuOpen) return;
    state.menuOpen = false;
    keepScroll(render);
    const button = document.querySelector(".menu-button");
    if (button) button.focus();
  }

  function onClick(event) {
    const insideDrop = event.target.closest(".nav-drop");
    const closedTools = state.toolsOpen && !insideDrop;
    if (closedTools) state.toolsOpen = false;
    const target = event.target.closest("[data-action]");
    if (!target) {
      if (closedTools && !event.target.closest("a[href], button")) keepScroll(render);
      return;
    }
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
    } else if (action === "tools") {
      state.toolsOpen = !state.toolsOpen;
      keepScroll(render);
    } else if (action === "menu") {
      state.menuOpen = !state.menuOpen;
      keepScroll(render);
      const focusTarget = state.menuOpen ? document.querySelector("#site-menu a") : document.querySelector(".menu-button");
      if (focusTarget) focusTarget.focus();
    } else if (action === "lang") {
      state.lang = target.dataset.lang === "zh-Hant" ? "zh-Hant" : "en";
      state.toolsOpen = false;
      localStorage.setItem("marathon-race-lang", state.lang);
      MR.setLocale(langTag());
      render();
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
      download(`${target.dataset.id}.ics`, MR.buildIcs(view(), { eventIds: [target.dataset.id] }));
    } else if (action === "alert-download") {
      downloadAlerts();
    } else if (action === "alert-plan") {
      state.alerts.allEvents = false;
      state.alerts.eventIds = state.plan.ids.slice();
      state.alertSaved = false;
      keepScroll(render);
    } else if (action === "copy") {
      navigator.clipboard.writeText(target.dataset.copy).then(() => {
        target.textContent = t("Copied");
      }).catch(() => {
        target.textContent = t("Copy failed");
      });
    }
  }

  function onChange(event) {
    const target = event.target;
    if (target.dataset.action === "tool-distance" || target.dataset.action === "tool-unit") {
      keepScroll(render);
    } else if (target.dataset.action === "plan-toggle") {
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
    const form = event.target;
    if (form.matches("[data-pace-form]")) {
      event.preventDefault();
      applyPace(event.submitter && event.submitter.dataset.calc === "finish" ? "finish" : "pace");
      return;
    }
    if (form.matches("[data-chart-form]")) {
      event.preventDefault();
      applyChart();
      return;
    }
    if (form.matches("[data-hr-form]")) {
      event.preventDefault();
      applyHeart();
      return;
    }
    if (form.matches("[data-gel-form]")) {
      event.preventDefault();
      applyGel();
      return;
    }
    if (!form.matches("[data-alert-form]")) return;
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
    download("marathon-race.ics", MR.buildIcs(view(), { eventIds: alerts.eventIds, types: alerts.types }));
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
    const viewer = new Intl.DateTimeFormat(langTag(), {
      weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZoneName: "short",
    }).format(state.now);
    document.querySelectorAll("[data-viewer-now]").forEach((node) => {
      node.textContent = `${t("Your time")} · ${viewer}`;
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
      const units = clockUnits();
      const text = state.lang === "zh-Hant"
        ? `${left.days} ${units[0]} ${left.hours} ${units[1]} ${left.minutes} ${units[2]}`
        : `${left.days} days, ${left.hours} hours, ${left.minutes} minutes`;
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
    if (!dated.length) return t("Not announced");
    return dated.map((milestone) => {
      if (milestone.end && milestone.endDate && milestone.endDate !== milestone.date) return compactRange(milestone.at, milestone.end, event.timeZone);
      return dayYear(milestone.at, event.timeZone);
    }).join(" · ");
  }

  function dateParts(iso, timeZone) {
    const parts = new Intl.DateTimeFormat(langTag(), {
      timeZone, day: "numeric", month: "short", year: "numeric",
    }).formatToParts(new Date(iso));
    const pick = (type) => parts.find((part) => part.type === type).value;
    return { day: pick("day"), month: pick("month"), year: pick("year") };
  }

  function dayYear(iso, timeZone) {
    if (state.lang === "zh-Hant") {
      return new Intl.DateTimeFormat("zh-Hant", {
        timeZone, day: "numeric", month: "long", year: "numeric",
      }).format(new Date(iso));
    }
    const part = dateParts(iso, timeZone);
    return `${part.day} ${part.month} ${part.year}`;
  }

  function compactRange(startIso, endIso, timeZone) {
    if (state.lang === "zh-Hant") {
      return new Intl.DateTimeFormat("zh-Hant", {
        timeZone, day: "numeric", month: "long", year: "numeric",
      }).formatRange(new Date(startIso), new Date(endIso));
    }
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
    if (!milestone.at) return t("Not announced");
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
    if (event.raceEndDate && event.raceEndDate !== event.raceDate) {
      return state.lang === "zh-Hant" ? `${event.raceDate} 至 ${event.raceEndDate}` : `${event.raceDate} to ${event.raceEndDate}`;
    }
    return event.raceDate;
  }

  function currentEvent() {
    const id = document.documentElement.dataset.event;
    return id ? view().events.find((event) => event.id === id) : null;
  }

  function blockStarts(ymd) {
    const date = MR.formatYmdLong(ymd);
    return state.lang === "zh-Hant" ? `自${date}開始。` : `Starts ${date}.`;
  }

  function clockUnits() {
    return [t("Days"), t("Hours"), t("Minutes"), t("Seconds")];
  }

  function ensureCjkFont() {
    if (state.lang !== "zh-Hant" || document.getElementById("cjk-font")) return;
    const link = document.createElement("link");
    link.id = "cjk-font";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600&display=swap";
    document.head.appendChild(link);
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
    return MR.filterEvents(view().events, { ids: state.races, types: state.types });
  }

  function visibleStages(event) {
    return MR.stagesOf(event).filter((stage) => {
      if (!state.types.length) return true;
      const milestones = stage.milestones && stage.milestones.length ? stage.milestones : [stage.milestone].filter(Boolean);
      return milestones.some((milestone) => state.types.includes(milestone.type));
    });
  }

  function clockEvents() {
    return document.documentElement.dataset.page === "home" ? scopedEvents() : view().events;
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
    const events = view().events.slice().sort((a, b) => a.order - b.order);
    const buttons = [`<button class="text-button" type="button" data-action="race-filter" data-id="all" aria-pressed="${state.races.length === 0}">${esc(t("All races"))}</button>`]
      .concat(events.map((event) => `<button class="text-button" type="button" data-action="race-filter" data-id="${esc(event.id)}" aria-pressed="${state.races.includes(event.id)}"><i style="--swatch:${esc(MR.raceColor(event.id))}" aria-hidden="true"></i>${esc(flag(event))} ${esc(event.shortName)} ${esc(String(event.edition))}</button>`))
      .join("");
    return `<div class="filter-group"><p class="filter-label" id="race-filter-label">${esc(t("Races"))}</p><div class="filters" role="group" aria-labelledby="race-filter-label">${buttons}</div></div>`;
  }

  function milestoneFilters() {
    const buttons = [`<button class="text-button" type="button" data-action="type-filter" data-type="all" aria-pressed="${state.types.length === 0}">${esc(t("All milestones"))}</button>`]
      .concat(view().milestoneTypes.map((type) => `<button class="text-button" type="button" data-action="type-filter" data-type="${esc(type.id)}" aria-pressed="${state.types.includes(type.id)}"><i class="sample importance-${esc(MR.importanceOf(type.id))}" aria-hidden="true"></i>${esc(type.label)}</button>`))
      .join("");
    return `<div class="filter-group"><p class="filter-label" id="milestone-filter-label">${esc(t("Milestones"))}</p><div class="filters" role="group" aria-labelledby="milestone-filter-label">${buttons}</div></div>`;
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
    const formatted = MR.formatYmdLong(state.data.checked);
    return state.lang === "zh-Hant" ? formatted : formatted.replace(/^[^,]+, /, "");
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
