#!/usr/bin/env node
// Conferences & Workshops update for https://fitwise.sites.tab.bot/events (no rebuild/republish needed: the list lives in D1).
// Usage:  node events_push.mjs                 -> pushes /home/user/tab/files/job-hunt/workshops/events.json
//         node events_push.mjs path/to.json    -> pushes another file in the same shape ({generated_at, events:[...]})
//         node events_push.mjs --status        -> what is stored now
// Run it right after workshops_fetch.py (see files/job-hunt/workshops/README.md).
// Only public event fields go to Fitwise; internal notes (e.g. "CFP watch") are stripped.
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const DIR = path.dirname(fileURLToPath(import.meta.url));
const SITE = process.env.FITWISE_SITE || "https://fitwise.sites.tab.bot";
const KEY = fs.readFileSync(path.join(DIR, "ADMIN_SECRET.txt"), "utf8").trim();
const H = { "content-type": "application/json", "x-admin-key": KEY };
const call = async (method, body) => { const r = await fetch(SITE + "/api/admin/events", { method, headers: H, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(60000) }); const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = { raw: t.slice(0, 300) }; } return [r.status, j]; };
const args = process.argv.slice(2);
if (args.includes("--status")) { const [s, j] = await call("GET"); console.log(s, JSON.stringify(j)); process.exit(s === 200 ? 0 : 1); }
const src = args.find(a => !a.startsWith("--")) || "/home/user/tab/files/job-hunt/workshops/events.json";
const raw = JSON.parse(fs.readFileSync(src, "utf8"));
const KEEP = ["id", "name", "start", "end", "time", "city", "country", "region", "format", "kind", "topics", "price", "url", "organiser", "language", "date_checked"];
const cleanNote = n => String(n || "").split(/(?<=\.)\s+/).filter(s => !/\bwatch\b|\bTab\b|\bSuresh\b|\bPostNL\b/i.test(s)).join(" ").trim();
const events = (raw.events || []).map(e => {
  const o = {}; for (const k of KEEP) if (e[k] !== undefined && e[k] !== null && e[k] !== "") o[k] = e[k];
  const c = e.cfp || {}; o.cfp = { status: c.status || "Not stated" };
  if (c.deadline) o.cfp.deadline = c.deadline; if (c.url) o.cfp.url = c.url;
  const n = cleanNote(c.note); if (n) o.cfp.note = n;
  return o;
});
const blob = JSON.stringify(events);
if (/suresh|parimi|postnl/i.test(blob)) { console.error("refusing: personal identifier found in event data"); process.exit(2); }
const [st, res] = await call("POST", { generated_at: raw.generated_at, events });
console.log(`push ${src} -> ${SITE}/events: HTTP ${st}`, JSON.stringify(res));
if (st !== 200) process.exit(1);
// the public page must answer and show the count in its teaser; the API must refuse without a session
const pg = await fetch(SITE + "/events", { signal: AbortSignal.timeout(30000) }); const html = await pg.text();
const m = html.match(/Sign in to see all (\d+) events/);
const api = await fetch(SITE + "/api/events", { signal: AbortSignal.timeout(30000) });
console.log(`check: /events HTTP ${pg.status}, teaser count ${m ? m[1] : "?"}; /api/events without sign-in HTTP ${api.status} (expect 401)`);
if (pg.status !== 200 || api.status !== 401) process.exit(1);
