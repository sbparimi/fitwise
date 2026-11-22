#!/usr/bin/env node
// Daily jobs update for https://fitwise.sites.tab.bot/jobs  (no rebuild/republish needed: the list lives in D1)
// Usage:  node jobs_push.mjs                       -> pushes jobs_feed/latest.json
//         node jobs_push.mjs 2026-11-02            -> pushes jobs_feed/2026-11-02.json
//         node jobs_push.mjs path/to/file.json [--date 2026-11-02] [--window "posted in the last 5 days"] [--no-latest]
//         node jobs_push.mjs --list                -> feeds stored + subscriber count
//         node jobs_push.mjs --delete 2026-11-02   -> remove one day
// Feed file: an array of jobs, or {date, window, jobs:[...]}. Job fields: company, title, city, country (code or name),
// remote ("Remote"/"Hybrid"/"On-site" or true/false), posted (YYYY-MM-DD), url, visa_sponsored (bool), visa_evidence, category.
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const DIR = path.dirname(fileURLToPath(import.meta.url));
const SITE = process.env.FITWISE_SITE || "https://fitwise.sites.tab.bot";
const KEY = fs.readFileSync(path.join(DIR, "ADMIN_SECRET.txt"), "utf8").trim();
const args = process.argv.slice(2); const flag = n => { const i = args.indexOf(n); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const H = { "content-type": "application/json", "x-admin-key": KEY };
const call = async (method, body) => { const r = await fetch(SITE + "/api/admin/jobs", { method, headers: H, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(60000) }); const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = { raw: t.slice(0, 300) }; } return [r.status, j]; };
// --check <date>: only verify the live pages (signed-in view via the admin key, and the sign-in gate for visitors)
const chk = flag("--check"); if (chk) { const ok = await verifyPages(chk, null); process.exit(ok ? 0 : 2); }
if (args.includes("--list")) { console.log(JSON.stringify((await call("GET"))[1], null, 1)); process.exit(0); }
const del = flag("--delete"); if (del) { console.log(JSON.stringify(await call("POST", { date: del, delete: true }))); process.exit(0); }
let dateArg = flag("--date"); const windowArg = flag("--window"); const noLatest = args.includes("--no-latest");
let src = args.find(a => !a.startsWith("--")) || "latest";
if (/^\d{4}-\d{2}-\d{2}$/.test(src)) { dateArg = dateArg || src; src = path.join(DIR, "jobs_feed", src + ".json"); }
else if (src === "latest") src = path.join(DIR, "jobs_feed", "latest.json");
const raw = JSON.parse(fs.readFileSync(src, "utf8"));
const jobs = Array.isArray(raw) ? raw : (raw.jobs || raw.items || []);
const fromName = (path.basename(fs.realpathSync(src)).match(/(\d{4}-\d{2}-\d{2})/) || [])[1];
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date());
const date = dateArg || (!Array.isArray(raw) && raw.date) || fromName || today;
const window = windowArg || (!Array.isArray(raw) && (raw.window || raw.posted_window)) || "";
const [st, res] = await call("POST", { date, window, jobs, latest: !noLatest });
console.log(`push ${src} -> ${date}: HTTP ${st}`, JSON.stringify(Object.assign({}, res, { links: res.links ? res.links.length + " links" : undefined })));
if (st !== 200) process.exit(1);
// per-job short links (/j/<id>) for the LinkedIn post: jobs_feed/<date>.links.json
if (Array.isArray(res.links)) {
  const lf = path.join(DIR, "jobs_feed", date + ".links.json");
  fs.writeFileSync(lf, JSON.stringify(res.links, null, 1));
  console.log(`links: ${res.links.length} -> ${lf}`);
  delete res.links;
}
// verify the live pages show the count. Since 1 Nov 2026 /jobs is behind Google sign-in: the admin key header gives the signed-in view.
if (!(await verifyPages(date, res))) process.exit(2);

async function verifyPages(date, res) {
  let count = res && res.count, visa = res && res.visa, latest = res ? res.latest : null;
  if (count == null) { const l = (await call("GET"))[1]; const f = (l.feeds || []).find(x => x.date === date); if (!f) { console.log("check: no feed stored for " + date); return false; } count = f.count; visa = f.visa; latest = l.latest; }
  for (const p of ["/jobs/" + date, ...(latest === date ? ["/jobs"] : [])]) {
    const r = await fetch(SITE + p + "?v=" + Date.now(), { headers: { "x-admin-key": KEY }, signal: AbortSignal.timeout(60000) }); const html = await r.text();
    const ok = r.status === 200 && html.includes(`<b>${count}</b> jobs`);
    console.log(`check ${p} (signed-in view): HTTP ${r.status} ${ok ? "OK, shows " + count + " jobs (" + visa + " visa)" : "MISMATCH"}`);
    if (!ok) return false;
    const g = await fetch(SITE + p + "?v=" + Date.now(), { headers: { "user-agent": "Mozilla/5.0 FitwiseCheck" }, signal: AbortSignal.timeout(60000) }); const gh = await g.text();
    const gok = g.status === 200 && gh.includes(`<b>${count}</b> jobs`);
    console.log(`check ${p} (public visitor): HTTP ${g.status} ${gok ? "OK, public jobs board live (" + count + " jobs)" : "MISMATCH"}`);
    if (!gok) return false;
  }
  return true;
}
