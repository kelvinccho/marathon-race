(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MRLogic = api;
})(globalThis, function () {
  const MILESTONE_TYPES = [
    "ballot_open",
    "ballot_close",
    "result",
    "payment",
    "expo",
    "race",
    "qualifier_open",
    "qualifier_close",
  ];

  const RACE_COLORS = {
    "nyc-2026": "#b7cff5",
    "tokyo-2027": "#f3c9c4",
    "boston-2027": "#f3e2b0",
    "london-2027": "#cfe3c8",
    "cape-town-2027": "#c6ebe4",
    "sydney-2027": "#c9e6f6",
    "berlin-2027": "#ddd4f3",
    "chicago-2027": "#f6d4bc",
    "nyc-2027": "#f0e6c8",
    "shanghai-2026": "#f6d0dc",
  };

  function raceColor(id) {
    return RACE_COLORS[id] || "#e7e1d6";
  }

  function importanceOf(type) {
    if (type === "result") return "result";
    if (type === "payment") return "payment";
    if (type === "expo") return "expo";
    if (type === "race") return "race";
    return "ballot";
  }

  const SWATCH = {
    ballot_open: "ballot",
    ballot_close: "close",
    qualifier_open: "qualifier",
    qualifier_close: "qualifier",
    result: "result",
    payment: "payment",
    expo: "expo",
    race: "race",
  };

  function swatchFor(type) {
    return SWATCH[type] || "ballot";
  }

  function ymdInZone(iso, timeZone) {
    if (!iso) return null;
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(iso));
    const pick = (type) => parts.find((part) => part.type === type).value;
    return `${pick("year")}-${pick("month")}-${pick("day")}`;
  }

  function parseYmd(ymd) {
    const [year, month, day] = ymd.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  function formatYmd(date) {
    return date.toISOString().slice(0, 10);
  }

  function addDays(ymd, days) {
    const date = parseYmd(ymd);
    date.setUTCDate(date.getUTCDate() + days);
    return formatYmd(date);
  }

  function diffDays(startYmd, endYmd) {
    return Math.round((parseYmd(endYmd) - parseYmd(startYmd)) / 86400000);
  }

  function monthWeeks(year, month) {
    const firstDow = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
    const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const cells = [];
    for (let index = 0; index < firstDow; index += 1) {
      const date = new Date(Date.UTC(year, month - 1, 1 - (firstDow - index)));
      cells.push({ ymd: formatYmd(date), inMonth: false });
    }
    for (let day = 1; day <= count; day += 1) {
      cells.push({ ymd: formatYmd(new Date(Date.UTC(year, month - 1, day))), inMonth: true });
    }
    while (cells.length % 7) {
      cells.push({ ymd: addDays(cells[cells.length - 1].ymd, 1), inMonth: false });
    }
    const weeks = [];
    for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
    return weeks;
  }

  function shiftMonth(year, month, delta) {
    const date = new Date(Date.UTC(year, month - 1 + delta, 1));
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
  }

  function closeFor(event, open) {
    const closeType = open.type === "ballot_open" ? "ballot_close" : "qualifier_close";
    return event.milestones.find((milestone) => (
      milestone.type === closeType && milestone.primary === open.primary && milestone.at
    ));
  }

  function filterEvents(events, options) {
    const ids = options && options.ids;
    const types = options && options.types;
    let list = events;
    if (ids && ids.length) {
      const wanted = new Set(ids);
      list = list.filter((event) => wanted.has(event.id));
    }
    if (types && types.length) {
      const allowed = new Set(types);
      list = list.map((event) => ({
        ...event,
        milestones: event.milestones.filter((milestone) => allowed.has(milestone.type)),
      })).filter((event) => event.milestones.length);
    }
    return list;
  }

  function calendarItems(events) {
    const items = [];
    events.forEach((event) => {
      const consumed = new Set();
      event.milestones.forEach((milestone) => {
        if ((milestone.type !== "ballot_open" && milestone.type !== "qualifier_open") || !milestone.at) return;
        const close = closeFor(event, milestone);
        if (!close) return;
        consumed.add(milestone.id);
        consumed.add(close.id);
        const word = milestone.type === "ballot_open"
          ? event.entryNoun
          : milestone.label.replace(/ opens$/i, "").replace(/開始$/, "");
        items.push({
          kind: "span",
          swatch: milestone.type === "ballot_open" ? "ballot" : "qualifier",
          event,
          milestone,
          close,
          start: milestone.at,
          end: close.at,
          startYmd: milestone.date,
          endYmd: close.date,
          label: `${event.shortName} · ${word}`,
        });
      });
      event.milestones.forEach((milestone) => {
        if (!milestone.at || consumed.has(milestone.id)) return;
        const endYmd = milestone.endDate || milestone.date;
        items.push({
          kind: endYmd !== milestone.date ? "span" : "chip",
          swatch: swatchFor(milestone.type),
          event,
          milestone,
          close: null,
          start: milestone.at,
          end: milestone.end || milestone.at,
          startYmd: milestone.date,
          endYmd,
          label: `${event.shortName} · ${shortType(milestone)}`,
        });
      });
    });
    return items;
  }

  let formatLocale = "en-GB";

  function setLocale(locale) {
    formatLocale = locale === "zh-Hant" ? "zh-Hant" : "en-GB";
  }

  function shortType(milestone) {
    const zh = formatLocale === "zh-Hant";
    if (milestone.type === "result") return zh ? "結果" : "result";
    if (milestone.type === "payment") return zh ? "繳費" : "pay";
    if (milestone.type === "expo") return zh ? "博覽會" : "expo";
    if (milestone.type === "race") return zh ? "比賽" : "race";
    if (milestone.type === "ballot_close" || milestone.type === "qualifier_close") return zh ? "截止" : "closes";
    if (milestone.type === "ballot_open" || milestone.type === "qualifier_open") return zh ? "開始" : "opens";
    return milestone.label;
  }

  function monthModel(events, year, month) {
    const items = calendarItems(events);
    return monthWeeks(year, month).map((days) => {
      const weekStart = days[0].ymd;
      const weekEnd = days[6].ymd;
      const overlapping = items
        .filter((item) => item.endYmd >= weekStart && item.startYmd <= weekEnd)
        .sort((a, b) => a.startYmd.localeCompare(b.startYmd) || b.endYmd.localeCompare(a.endYmd) || a.label.localeCompare(b.label));
      const laneEnds = [];
      const bars = overlapping.map((item) => {
        const startCol = item.startYmd < weekStart ? 1 : diffDays(weekStart, item.startYmd) + 1;
        const endCol = item.endYmd > weekEnd ? 7 : diffDays(weekStart, item.endYmd) + 1;
        let lane = 0;
        while (laneEnds[lane] != null && laneEnds[lane] >= startCol) lane += 1;
        laneEnds[lane] = endCol;
        return Object.assign({}, item, {
          startCol,
          endCol,
          lane,
          continuesBefore: item.startYmd < weekStart,
          continuesAfter: item.endYmd > weekEnd,
          endsHere: item.kind === "span" && item.endYmd >= weekStart && item.endYmd <= weekEnd,
        });
      });
      return { days, bars };
    });
  }

  function boundaries(events, nowMs) {
    const rows = [];
    events.forEach((event) => {
      event.milestones.forEach((milestone) => {
        if (milestone.at) {
          const time = Date.parse(milestone.at);
          if (time > nowMs) rows.push({ t: time, event, milestone, phase: "start" });
        }
        if (milestone.end) {
          const time = Date.parse(milestone.end);
          if (time > nowMs) rows.push({ t: time, event, milestone, phase: "end" });
        }
      });
    });
    rows.sort((a, b) => a.t - b.t || a.event.order - b.event.order || a.milestone.id.localeCompare(b.milestone.id));
    return rows;
  }

  function boundaryKey(boundary) {
    if (!boundary) return "";
    return `${boundary.event.id}:${boundary.milestone.id}:${boundary.phase}:${boundary.t}`;
  }

  function boundaryHeading(boundary) {
    const milestone = boundary.milestone;
    if (milestone.type === "race") {
      return boundary.phase === "end"
        ? { kicker: "In progress", title: "Race day" }
        : { kicker: "Next up", title: milestone.label || "Race day" };
    }
    if (boundary.phase === "end") {
      const openNow = milestone.type === "expo" || milestone.type === "payment";
      return { kicker: openNow ? "Open now" : "Next up", title: milestone.endLabel || milestone.label };
    }
    if (milestone.type === "expo") return { kicker: "Next up", title: "Expo opens" };
    return { kicker: "Next up", title: milestone.label };
  }

  function openWindows(events, nowMs) {
    const windows = [];
    events.forEach((event) => {
      event.milestones.forEach((milestone) => {
        if (milestone.type !== "ballot_open" && milestone.type !== "qualifier_open") return;
        if (!milestone.at) return;
        const close = closeFor(event, milestone);
        if (!close) return;
        const opens = Date.parse(milestone.at);
        const closes = Date.parse(close.at);
        if (opens <= nowMs && nowMs < closes) {
          windows.push({ event, open: milestone, close, closesAt: closes });
        }
      });
    });
    windows.sort((a, b) => a.closesAt - b.closesAt);
    return windows;
  }

  function statusOf(event, nowMs) {
    const race = event.milestones.find((milestone) => milestone.type === "race" && milestone.at);
    if (race && Date.parse(race.at) <= nowMs && (!race.end || nowMs <= Date.parse(race.end))) {
      return { key: "race-day", label: "Race day" };
    }
    const expo = event.milestones.find((milestone) => milestone.type === "expo" && milestone.at);
    if (expo && expo.end && Date.parse(expo.at) - nowMs < 10 * 86400000 && nowMs <= Date.parse(expo.end)) {
      return { key: "race-week", label: "Race week" };
    }
    if (openWindows([event], nowMs).length) return { key: "open", label: "Open" };
    if (event.seriesStatus === "candidate") return { key: "candidate", label: "Candidate" };
    if (event.entryState === "awaiting_result") return { key: "awaiting", label: "Awaiting result" };
    if (event.entryState === "decided") return { key: "decided", label: "Decided" };
    if (event.entryState === "upcoming") return { key: "upcoming", label: "Not announced" };
    return { key: "upcoming", label: "Upcoming" };
  }

  function planStart(raceYmd) {
    const date = parseYmd(raceYmd);
    const sundayOffset = date.getUTCDay();
    date.setUTCDate(date.getUTCDate() - sundayOffset - 111);
    return formatYmd(date);
  }

  function planStartFor(event) {
    const anchor = event.raceEndDate || event.raceDate;
    return anchor ? planStart(anchor) : null;
  }

  function stagesOf(event) {
    const primary = (type) => event.milestones.find((milestone) => milestone.type === type && milestone.primary)
      || event.milestones.find((milestone) => milestone.type === type);
    const payments = event.milestones.filter((milestone) => milestone.type === "payment");
    return [
      { key: "open", label: primary("ballot_open") ? primary("ballot_open").label : (primary("qualifier_open") ? primary("qualifier_open").label : "Entry opens"), milestone: primary("ballot_open") || primary("qualifier_open") },
      { key: "close", label: primary("ballot_close") ? primary("ballot_close").label : (primary("qualifier_close") ? primary("qualifier_close").label : "Entry closes"), milestone: primary("ballot_close") || primary("qualifier_close") },
      { key: "result", label: primary("result") ? primary("result").label : "Result", milestone: primary("result") },
      { key: "payment", label: "Payment", milestones: payments, milestone: payments.find((milestone) => milestone.primary) || payments[0] || null },
      { key: "expo", label: "Expo", milestone: primary("expo") },
      { key: "race", label: primary("race") ? primary("race").label : "Race day", milestone: primary("race") },
    ];
  }

  function flatten(data) {
    const milestones = [];
    data.events.forEach((event) => {
      event.milestones.forEach((milestone) => {
        milestones.push({
          eventId: event.id,
          eventName: event.name,
          shortName: event.shortName,
          edition: event.edition,
          series: event.series,
          seriesStatus: event.seriesStatus,
          order: event.order,
          entryState: event.entryState,
          entryNoun: event.entryNoun,
          hasPublicBallot: event.hasPublicBallot,
          city: event.city,
          region: event.region,
          country: event.country,
          countryCode: event.countryCode,
          timeZone: event.timeZone,
          raceDate: event.raceDate,
          raceEndDate: event.raceEndDate,
          officialUrl: event.officialUrl,
          entryUrl: event.entryUrl,
          path: `events/${event.id}/`,
          milestoneId: milestone.id,
          type: milestone.type,
          label: milestone.label,
          at: milestone.at,
          end: milestone.end,
          endLabel: milestone.endLabel,
          date: milestone.date,
          endDate: milestone.endDate,
          precision: milestone.precision,
          confidence: milestone.confidence,
          primary: milestone.primary,
          note: milestone.note,
          sourceUrl: milestone.sourceUrl,
        });
      });
    });
    milestones.sort((a, b) => {
      const at = a.at ? Date.parse(a.at) : Number.POSITIVE_INFINITY;
      const bt = b.at ? Date.parse(b.at) : Number.POSITIVE_INFINITY;
      return at - bt || a.eventId.localeCompare(b.eventId) || a.milestoneId.localeCompare(b.milestoneId);
    });
    return {
      $schema: "https://kelvinccho.github.io/marathon-race/data/milestones.schema.json",
      schemaVersion: data.schemaVersion,
      derivedFrom: "events.json",
      checked: data.checked,
      publisher: data.publisher,
      disclaimer: data.disclaimer,
      milestoneTypes: data.milestoneTypes,
      milestones,
    };
  }

  function splitRemaining(ms) {
    const total = Math.floor(Math.max(0, ms) / 1000);
    return {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    };
  }

  function formatDate(iso, timeZone) {
    return new Intl.DateTimeFormat(formatLocale, {
      timeZone,
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  }

  function formatDateTime(iso, timeZone) {
    return new Intl.DateTimeFormat(formatLocale, {
      timeZone,
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "short",
    }).format(new Date(iso));
  }

  function formatDayMonth(iso, timeZone) {
    return new Intl.DateTimeFormat(formatLocale, {
      timeZone,
      day: "numeric",
      month: "short",
    }).format(new Date(iso));
  }

  function formatMonth(year, month) {
    return new Intl.DateTimeFormat(formatLocale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, 1)));
  }

  function formatYmdLong(ymd) {
    return new Intl.DateTimeFormat(formatLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(parseYmd(ymd));
  }

  function formatWhen(iso, timeZone, precision) {
    if (!iso) return formatLocale === "zh-Hant" ? "尚未公布" : "Not announced";
    return precision === "instant" ? formatDateTime(iso, timeZone) : formatDate(iso, timeZone);
  }

  function icsText(value) {
    return String(value || "").replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function icsUtc(value) {
    const date = new Date(value);
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
  }

  function fold(line) {
    const chunks = [line.slice(0, 73)];
    let rest = line.slice(73);
    while (rest.length) {
      chunks.push(` ${rest.slice(0, 72)}`);
      rest = rest.slice(72);
    }
    return chunks.join("\r\n");
  }

  function buildIcs(data, options) {
    const settings = options || {};
    const eventIds = settings.eventIds ? new Set(settings.eventIds) : null;
    const types = settings.types ? new Set(settings.types) : null;
    const stamp = `${String(data.checked).replace(/-/g, "")}T000000Z`;
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Marathon Race//Majors Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      formatLocale === "zh-Hant" ? "X-WR-CALNAME:馬拉松賽事" : "X-WR-CALNAME:Marathon Race",
      formatLocale === "zh-Hant" ? "X-WR-CALDESC:抽籤、結果、繳費、博覽會與比賽日" : "X-WR-CALDESC:Ballot, result, payment, expo, and race day",
    ];
    data.events.forEach((event) => {
      if (eventIds && !eventIds.has(event.id)) return;
      event.milestones.forEach((milestone) => {
        if (!milestone.at) return;
        if (types && !types.has(milestone.type)) return;
        lines.push(...eventLines(event, milestone, stamp, false));
        if (milestone.end && milestone.type === "expo") lines.push(...eventLines(event, milestone, stamp, true));
      });
    });
    lines.push("END:VCALENDAR");
    return `${lines.map(fold).join("\r\n")}\r\n`;
  }

  function eventLines(event, milestone, stamp, closing) {
    const uid = `${event.id}-${milestone.id}${closing ? "-end" : ""}@marathon-race`;
    const summary = `${event.shortName} ${event.edition} · ${closing ? (milestone.endLabel || milestone.label) : milestone.label}`;
    const caution = formatLocale === "zh-Hant" ? "行動前請向官方網站確認。" : "Confirm on the official site before you act.";
    const description = `${milestone.note} ${event.entryUrl || event.officialUrl} ${caution}`;
    const rows = [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `SUMMARY:${icsText(summary)}`,
      `DESCRIPTION:${icsText(description)}`,
      `LOCATION:${icsText(`${event.city}, ${event.country}`)}`,
      `URL:${event.officialUrl}`,
      `CATEGORIES:${milestone.type}`,
    ];
    if (closing) {
      rows.push(`DTSTART:${icsUtc(milestone.end)}`);
      rows.push(`DTEND:${icsUtc(Date.parse(milestone.end) + 15 * 60 * 1000)}`);
    } else if (milestone.precision === "day" || milestone.type === "race") {
      rows.push(`DTSTART;VALUE=DATE:${milestone.date.replace(/-/g, "")}`);
      rows.push(`DTEND;VALUE=DATE:${addDays(milestone.endDate || milestone.date, 1).replace(/-/g, "")}`);
    } else if (milestone.end) {
      rows.push(`DTSTART:${icsUtc(milestone.at)}`);
      rows.push(`DTEND:${icsUtc(milestone.end)}`);
    } else {
      rows.push(`DTSTART:${icsUtc(milestone.at)}`);
      rows.push(`DTEND:${icsUtc(Date.parse(milestone.at) + 15 * 60 * 1000)}`);
    }
    rows.push("BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-P1D", `DESCRIPTION:${icsText(summary)}`, "END:VALARM", "END:VEVENT");
    return rows;
  }

  function validate(data) {
    const errors = [];
    if (!data || data.schemaVersion !== 1) errors.push("schemaVersion must be 1");
    if (!data || !Array.isArray(data.events)) return ["events must be an array"];
    const ids = new Set();
    data.events.forEach((event) => {
      if (ids.has(event.id)) errors.push(`duplicate event ${event.id}`);
      ids.add(event.id);
      try {
        Intl.DateTimeFormat("en-GB", { timeZone: event.timeZone }).format(new Date());
      } catch (error) {
        errors.push(`${event.id} has an invalid timeZone`);
      }
      const milestoneIds = new Set();
      let previous = null;
      event.milestones.forEach((milestone) => {
        if (milestoneIds.has(milestone.id)) errors.push(`${event.id} duplicate milestone ${milestone.id}`);
        milestoneIds.add(milestone.id);
        if (!MILESTONE_TYPES.includes(milestone.type)) errors.push(`${event.id} ${milestone.id} bad type`);
        if (!["instant", "day", "tbc"].includes(milestone.precision)) errors.push(`${event.id} ${milestone.id} bad precision`);
        if (!["official", "reported", "expected"].includes(milestone.confidence)) errors.push(`${event.id} ${milestone.id} bad confidence`);
        if (milestone.precision === "tbc") {
          if (milestone.at || milestone.end || milestone.date || milestone.endDate) {
            errors.push(`${event.id} ${milestone.id} tbc rows must use null instants`);
          }
        } else if (!milestone.at || !milestone.date) {
          errors.push(`${event.id} ${milestone.id} needs at and date`);
        }
        if (Boolean(milestone.end) !== Boolean(milestone.endDate)) {
          errors.push(`${event.id} ${milestone.id} end and endDate must both be set or both be null`);
        }
        if (milestone.at && milestone.end && Date.parse(milestone.end) < Date.parse(milestone.at)) {
          errors.push(`${event.id} ${milestone.id} ends before it starts`);
        }
        if (milestone.at && event.timeZone && ymdInZone(milestone.at, event.timeZone) !== milestone.date) {
          errors.push(`${event.id} ${milestone.id} date ${milestone.date} does not match ${milestone.at} in ${event.timeZone}`);
        }
        if (milestone.end && event.timeZone && ymdInZone(milestone.end, event.timeZone) !== milestone.endDate) {
          errors.push(`${event.id} ${milestone.id} endDate does not match end`);
        }
        if (milestone.at) {
          const time = Date.parse(milestone.at);
          if (previous != null && time < previous) errors.push(`${event.id} milestones are not in time order at ${milestone.id}`);
          previous = time;
        }
      });
      ["result", "payment", "expo", "race"].forEach((type) => {
        if (!event.milestones.some((milestone) => milestone.type === type)) errors.push(`${event.id} missing ${type}`);
      });
      const hasOpen = event.milestones.some((milestone) => milestone.type === "ballot_open" || milestone.type === "qualifier_open");
      const hasClose = event.milestones.some((milestone) => milestone.type === "ballot_close" || milestone.type === "qualifier_close");
      if (!hasOpen || !hasClose) errors.push(`${event.id} missing an entry open/close pair`);
      const race = event.milestones.find((milestone) => milestone.type === "race");
      if (race && race.date && race.date !== event.raceDate) errors.push(`${event.id} raceDate does not match the race milestone`);
    });
    return errors;
  }

  const DISTANCES = { "5k": 5, "10k": 10, half: 21.0975, marathon: 42.195 };
  const MILE_KM = 1.609344;

  function distanceKm(id, customKm) {
    if (id === "custom") {
      const km = Number(customKm);
      return km > 0 && Number.isFinite(km) ? km : null;
    }
    return DISTANCES[id] || null;
  }

  function pacePlan(km, totalSeconds) {
    if (!(km > 0) || !(totalSeconds > 0) || !Number.isFinite(km) || !Number.isFinite(totalSeconds)) return null;
    const secPerKm = totalSeconds / km;
    return { distanceKm: km, totalSeconds, secPerKm, secPerMile: secPerKm * MILE_KM };
  }

  function paceChart(km, totalSeconds, unit) {
    const plan = pacePlan(km, totalSeconds);
    if (!plan) return null;
    const step = unit === "mi" ? MILE_KM : 1;
    const rows = [];
    for (let distance = step; distance < km - 1e-6 && rows.length < 500; distance += step) {
      rows.push({ distanceKm: distance, seconds: plan.secPerKm * distance });
    }
    rows.push({ distanceKm: km, seconds: totalSeconds, finish: true });
    return Object.assign({ unit: unit === "mi" ? "mi" : "km", rows }, plan);
  }

  function heartZones(age) {
    const years = Number(age);
    if (!Number.isInteger(years) || years < 10 || years > 100) return null;
    const max = 220 - years;
    const bands = [[1, 0.5, 0.6], [2, 0.6, 0.7], [3, 0.7, 0.8], [4, 0.8, 0.9], [5, 0.9, 1]];
    return {
      age: years,
      max,
      zones: bands.map(([zone, low, high]) => ({
        zone,
        low: Math.round(max * low),
        high: Math.round(max * high),
      })),
    };
  }

  function gelPlan(input) {
    const minutes = Number(input.minutes);
    const gramsPerHour = Number(input.gramsPerHour);
    const gramsPerGel = Number(input.gramsPerGel);
    const drinkPerHour = Number(input.drinkPerHour || 0);
    if (!(minutes > 0) || !(gramsPerHour > 0) || !(gramsPerGel > 0) || !(drinkPerHour >= 0)) return null;
    if (![minutes, gramsPerHour, gramsPerGel, drinkPerHour].every(Number.isFinite)) return null;
    const hours = minutes / 60;
    const totalCarbs = gramsPerHour * hours;
    const drinkCarbs = drinkPerHour * hours;
    const gelCarbs = Math.max(0, totalCarbs - drinkCarbs);
    const gels = gelCarbs === 0 ? 0 : Math.ceil(gelCarbs / gramsPerGel - 1e-9);
    return {
      minutes,
      totalCarbs,
      drinkCarbs,
      gelCarbs,
      gramsPerGel,
      gels,
      intervalMinutes: gels > 0 ? minutes / gels : null,
    };
  }

  return {
    MILESTONE_TYPES,
    DISTANCES,
    distanceKm,
    pacePlan,
    paceChart,
    heartZones,
    gelPlan,
    setLocale,
    swatchFor,
    ymdInZone,
    addDays,
    diffDays,
    monthWeeks,
    shiftMonth,
    raceColor,
    importanceOf,
    filterEvents,
    calendarItems,
    monthModel,
    boundaries,
    boundaryKey,
    boundaryHeading,
    openWindows,
    statusOf,
    planStart,
    planStartFor,
    stagesOf,
    flatten,
    splitRemaining,
    formatDate,
    formatDateTime,
    formatDayMonth,
    formatMonth,
    formatYmdLong,
    formatWhen,
    buildIcs,
    validate,
  };
});
