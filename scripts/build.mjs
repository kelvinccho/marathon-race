import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const logic = require("../assets/js/logic.js");
const root = join(import.meta.dirname, "..");
const SITE = "https://kelvinccho.github.io/marathon-race";
const data = JSON.parse(readFileSync(join(root, "data/events.json"), "utf8"));
const errors = logic.validate(data);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const flat = logic.flatten(data);
writeFileSync(join(root, "data/milestones.json"), `${JSON.stringify(flat, null, 2)}\n`);
writeFileSync(join(root, "calendar.ics"), logic.buildIcs(data));

const pages = [
  { path: "index.html", depth: 0, page: "home", title: "Marathon Race — major marathon dates", description: "Ballot open, ballot close, result, payment, expo, and race day for the World Marathon Majors, with a live countdown." },
  { path: "events/index.html", depth: 1, page: "events", title: "Events — Marathon Race", description: "Every World Marathon Major on one list, with the dates that get you to the start line." },
  { path: "plan/index.html", depth: 1, page: "plan", title: "Plan your race — Marathon Race", description: "Pick the majors you are chasing and see every remaining deadline, plus the Monday a 16-week block starts." },
  { path: "about/index.html", depth: 1, page: "about", title: "About — Marathon Race", description: "An independent majors calendar, published as JSON so you can use the dates in your own app." },
  { path: "alerts/index.html", depth: 1, page: "alerts", title: "Get alerts — Marathon Race", description: "Subscribe to the calendar, or read the JSON feed from your own app." },
];

data.events.forEach((event) => {
  pages.push({
    path: `events/${event.id}/index.html`,
    depth: 2,
    page: "event",
    eventId: event.id,
    title: `${event.name} ${event.edition} — Marathon Race`,
    description: event.summary,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${event.name} ${event.edition}`,
      startDate: event.raceDate,
      endDate: event.raceEndDate || event.raceDate,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: event.city,
        address: {
          "@type": "PostalAddress",
          addressLocality: event.city,
          addressCountry: event.countryCode,
        },
      },
      url: event.officialUrl,
      description: event.summary,
    },
  });
});

pages.forEach((page) => writePage(page));
writeFileSync(join(root, "404.html"), notFound());
writeFileSync(join(root, "sitemap.xml"), sitemap(pages));
writeFileSync(join(root, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`built ${pages.length} pages, ${flat.milestones.length} milestones`);

function writePage(page) {
  const prefix = page.depth === 0 ? "" : "../".repeat(page.depth);
  const dataRoot = page.depth === 0 ? "." : "../".repeat(page.depth).replace(/\/$/, "");
  const canonicalPath = page.path === "index.html" ? "" : page.path.replace(/index\.html$/, "");
  const html = `<!DOCTYPE html>
<html lang="en" data-root="${dataRoot}" data-page="${page.page}"${page.eventId ? ` data-event="${page.eventId}"` : ""}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${SITE}/${canonicalPath}">
  <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml">
  <link rel="alternate" type="application/json" title="Events JSON" href="${prefix}data/events.json">
  <link rel="alternate" type="application/json" title="Milestones JSON" href="${prefix}data/milestones.json">
  <link rel="stylesheet" href="${prefix}assets/css/site.css">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE}/${canonicalPath}">
  ${page.jsonLd ? `<script type="application/ld+json">${JSON.stringify(page.jsonLd)}</script>` : ""}
</head>
<body>
  <div id="app"><p class="loading">Loading the calendar…</p></div>
  ${noscript(page, prefix)}
  <script src="${prefix}assets/js/logic.js"></script>
  <script src="${prefix}assets/js/site.js"></script>
</body>
</html>
`;
  const destination = join(root, page.path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, html);
}

function noscript(page, prefix) {
  if (page.page === "event") {
    const event = data.events.find((item) => item.id === page.eventId);
    const rows = event.milestones.map((milestone) => {
      const when = milestone.date ? `${milestone.date}${milestone.endDate && milestone.endDate !== milestone.date ? ` to ${milestone.endDate}` : ""}` : "Not announced";
      return `<li><strong>${escapeHtml(milestone.label)}</strong> — ${escapeHtml(when)}</li>`;
    }).join("");
    return `<noscript><article><h1>${escapeHtml(event.name)} ${event.edition}</h1><p>${escapeHtml(event.summary)}</p><ul>${rows}</ul><p><a href="${event.officialUrl}">Official site</a></p></article></noscript>`;
  }
  const items = data.events.map((event) => `<li><a href="${prefix}events/${event.id}/">${escapeHtml(event.shortName)} ${event.edition}</a> — ${event.raceDate}</li>`).join("");
  return `<noscript><p>The live countdown needs JavaScript. The same dates are in <a href="${prefix}data/events.json">events.json</a> and <a href="${prefix}data/milestones.json">milestones.json</a>.</p><ul>${items}</ul></noscript>`;
}

function sitemap(list) {
  const urls = list.map((page) => {
    const path = page.path === "index.html" ? "" : page.path.replace(/index\.html$/, "");
    return `  <url><loc>${SITE}/${path}</loc></url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function notFound() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page not found — Marathon Race</title>
  <script>
    var path = location.pathname;
    var marker = "/marathon-race/";
    var at = path.indexOf(marker);
    window.MR_BASE = at >= 0 ? path.slice(0, at + marker.length - 1) : "";
  </script>
  <link rel="stylesheet" href="" id="css">
  <script>document.getElementById("css").href = window.MR_BASE + "/assets/css/site.css";</script>
</head>
<body>
  <main class="wrap page-miss">
    <p class="eyebrow">404</p>
    <h1>That page is not on the calendar.</h1>
    <p><a id="home" href="/">Back to the calendar</a></p>
  </main>
  <script>document.getElementById("home").href = window.MR_BASE + "/";</script>
</body>
</html>
`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}
