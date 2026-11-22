#!/usr/bin/env node
// Check per-job links after the daily push (1 Nov 2026, pages are behind Google sign-in).
// Usage: node check_links.mjs <date> [n=3]   reads jobs_feed/<date>.links.json, checks the first n /j/ links:
//   visitor view: HTTP 200 + x-fitwise-gate: 1 + the job title on the sign-in screen (what a LinkedIn reader sees first);
//   signed-in view (admin key): HTTP 200 + x-fitwise-gate: 0 + the Apply button.   exit 0 = all OK.
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const DIR = path.dirname(fileURLToPath(import.meta.url));
const KEY = fs.readFileSync(path.join(DIR, "ADMIN_SECRET.txt"), "utf8").trim();
const date = process.argv[2]; const n = +(process.argv[3] || 3);
if (!date) { console.error("usage: node check_links.mjs <YYYY-MM-DD> [n]"); process.exit(1); }
const links = JSON.parse(fs.readFileSync(path.join(DIR, "jobs_feed", date + ".links.json"), "utf8")).slice(0, n);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
let bad = 0;
for (const l of links) {
  const v = await fetch(l.short_url, { headers: { "user-agent": "Mozilla/5.0 (iPhone) FitwiseCheck" }, signal: AbortSignal.timeout(30000) }); const vh = await v.text();
  const vok = v.status === 200 && vh.includes(esc(l.title)) && /Apply on /.test(vh);
  const s = await fetch(l.short_url, { headers: { "x-admin-key": KEY }, signal: AbortSignal.timeout(30000) }); const sh = await s.text();
  const sok = s.status === 200 && s.headers.get("x-fitwise-gate") === "0" && /Apply on /.test(sh);
  console.log(`${l.short_url}  visitor: ${v.status} ${vok ? "public job + Apply OK" : "FAIL"}  signed-in: ${s.status} ${sok ? "Apply button OK" : "FAIL"}  (${l.title} – ${l.company})`);
  if (!vok || !sok) bad++;
}
process.exit(bad ? 2 : 0);
