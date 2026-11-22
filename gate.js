
// ---------- Sign-in gate on every app page, first-party analytics, stored CVs, /account and /admin — added 1 Nov 2026 ----------
// Suresh (WhatsApp 1:09 PM 1 Nov 2026, m:61f07e1b): every tab behind Google sign-in, full analytics, an admin page for users, CVs, billing.
// Public: / (asset), /privacy, /terms, /about, /contact, /robots.txt, /sitemap.xml, favicon and static files. Everything else that is an app page needs a session.
const ADMIN_EMAILS_DEFAULT = ["reachparimi@gmail.com"];
const VID_COOKIE = "fw_vid";
const CV_RETENTION_DAYS = 90, EV_RAW_DAYS = 90, CV_MAX_BYTES = 10 * 1024 * 1024, CV_CHUNK = 900000, CV_PER_USER = 20;
const HIT_TYPES = ["pageview", "signin_start", "signin_fail", "inapp_hint", "open_browser", "copy_link"];
const GATED_API = ["/api/credits", "/api/cover", "/api/download"];
const REQ = new WeakMap();
function rid(n) { const b = new Uint8Array(n); crypto.getRandomValues(b); return [...b].map(x => (x % 36).toString(36)).join(""); }
function reqCtx(req, env, ctx) {
  const v = cookieOf(req, VID_COOKIE); const consent = cookieOf(req, "fw_consent") === "analytics";
  const ok = consent && !!v && /^[a-z0-9-]{16,40}$/.test(v);
  const c = { env, ctx, vid: ok ? v : rid(20), newVid: consent && !ok, clearVid: !consent && !!v, sess: undefined }; REQ.set(req, c); return c;
}
function amsDay(ts) { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date(ts || Date.now())); } catch (e) { return new Date(ts || Date.now()).toISOString().slice(0, 10); } }
async function adminEmails(env) {
  try { const v = await store(env).get("cfg:admins"); if (v) { const a = JSON.parse(v); if (Array.isArray(a)) return [...new Set(ADMIN_EMAILS_DEFAULT.concat(a.map(x => String(x).toLowerCase())))]; } } catch (e) {}
  return ADMIN_EMAILS_DEFAULT;
}
// the signed-in user for this request (cached), or null. A valid x-admin-key header counts as an admin session (scripts, checks).
async function currentSession(req, env) {
  const c = REQ.get(req); if (c && c.sess !== undefined) return c.sess;
  let s = null;
  const k = req.headers.get("x-admin-key");
  if (k && (await sha(k)) === ADMIN_HASH) s = { sub: "adminkey", email: "admin-key@fitwise.invalid", name: "Admin key", test: true, admin: true, key: true, isAdmin: true };
  else {
    s = await sessionOf(req, env);
    if (s && !s.test) { const st = await store(env).get("ust:" + s.sub); if (st) s = null; }
    if (s) s.isAdmin = s.test ? !!s.admin : (await adminEmails(env)).includes(String(s.email || "").toLowerCase());
  }
  if (c) c.sess = s;
  return s;
}

// ---------- user agent ----------
function inAppName(ua) {
  if (/LinkedInApp/i.test(ua)) return "LinkedIn"; if (/FBAN|FBAV|FB_IAB|FBIOS/.test(ua)) return "Facebook"; if (/Instagram/.test(ua)) return "Instagram";
  if (/Twitter/i.test(ua)) return "X"; if (/\bLine\//.test(ua)) return "LINE"; if (/Snapchat/.test(ua)) return "Snapchat"; if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return "TikTok";
  if (/; wv\)/.test(ua)) return "an app"; return "";
}
function isBot(ua) { return !ua || /bot\b|bot\/|crawl|spider|slurp|preview|facebookexternalhit|WhatsApp|Slack|Discord|Telegram|curl|wget|python|node-fetch|undici|^node$|axios|Go-http|java\/|okhttp|HeadlessChrome|Lighthouse|PTST|monitor|libwww|httpclient|scrapy|Bytespider|Embedly|Pinterest|Applebot|bingpreview|Google-InspectionTool|GoogleOther|Chrome-Lighthouse|Headless|FitwiseCheck/i.test(ua); }
function uaInfo(ua) {
  ua = ua || "";
  const dev = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(ua) ? "mobile" : "desktop";
  const os = /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /CrOS/.test(ua) ? "ChromeOS" : /Mac OS X|Macintosh/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Other";
  const app = inAppName(ua);
  const br = app ? (app === "an app" ? "In-app browser" : app + " in-app") : /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /SamsungBrowser/.test(ua) ? "Samsung Internet" : /Firefox|FxiOS/.test(ua) ? "Firefox" : /CriOS|Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Other";
  return { dev, os, br, app };
}
function refHost(r, self) {
  if (r === null) return null; if (!r) return "(direct)";
  try { const x = new URL(r); if (x.host === self) return "(internal)"; if (x.protocol === "android-app:") return "app:" + x.host; return x.host.replace(/^www\./, "").slice(0, 80); } catch (e) { return "(other)"; }
}

// ---------- analytics store (D1) ----------
let _anaReady = false;
async function anaDb(env) {
  const db = env.DB;
  if (!_anaReady) {
    await usersDb(env);
    await db.batch([
      db.prepare("CREATE TABLE IF NOT EXISTS ev (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, day TEXT, vid TEXT, uid TEXT, type TEXT, path TEXT, ref TEXT, us TEXT, um TEXT, uc TEXT, dev TEXT, os TEXT, br TEXT, cc TEXT, obj TEXT, meta TEXT)"),
      db.prepare("CREATE INDEX IF NOT EXISTS ev_day_type ON ev (day, type)"),
      db.prepare("CREATE INDEX IF NOT EXISTS ev_uid ON ev (uid, ts)"),
      db.prepare("CREATE INDEX IF NOT EXISTS ev_vid ON ev (vid)"),
      db.prepare("CREATE TABLE IF NOT EXISTS ev_agg (day TEXT, type TEXT, dim TEXT, k TEXT, n INTEGER, PRIMARY KEY (day, type, dim, k))"),
      db.prepare("CREATE TABLE IF NOT EXISTS cvs (id TEXT PRIMARY KEY, sub TEXT, email TEXT, filename TEXT, mime TEXT, size INTEGER, source TEXT, job TEXT, chunks INTEGER, created INTEGER)"),
      db.prepare("CREATE INDEX IF NOT EXISTS cvs_sub ON cvs (sub, created)"),
      db.prepare("CREATE TABLE IF NOT EXISTS cv_chunks (cv_id TEXT, idx INTEGER, data BLOB, PRIMARY KEY (cv_id, idx))")
    ]);
    let have = [];
    try { have = ((await db.prepare("SELECT name FROM pragma_table_info('users')").all()).results || []).map(r => r.name); } catch (e) {}
    for (const col of ["first_src TEXT", "first_ref TEXT", "signup_path TEXT", "status TEXT"]) if (!have.includes(col.split(" ")[0])) { try { await db.prepare("ALTER TABLE users ADD COLUMN " + col).run(); } catch (e) {} }
    _anaReady = true;
  }
  return db;
}
function track(req, type, o) {
  const c = REQ.get(req); if (!c || cookieOf(req, "fw_consent") !== "analytics") return null;
  const p = recordEv(req, c, type, o || {}).catch(() => {});
  if (c.ctx && c.ctx.waitUntil) c.ctx.waitUntil(p);
  return p;
}
async function recordEv(req, c, type, o) {
  const env = c.env; const ua = req.headers.get("user-agent") || "";
  if (isBot(ua)) return;
  const s = o.sess !== undefined ? o.sess : await currentSession(req, env);
  if (s && (s.key || (s.isAdmin && !s.test))) return; // the admin key and the owner's own visits are not counted
  let u; try { u = new URL(o.url || req.url); } catch (e) { u = new URL(req.url); }
  const sp = u.searchParams, cut = (x, n) => (x == null || x === "") ? null : String(x).slice(0, n);
  const ref = refHost(o.ref !== undefined ? o.ref : (req.headers.get("referer") || ""), new URL(req.url).host);
  const ui = uaInfo(ua), now = Date.now();
  let cc = (req.cf && req.cf.country) || req.headers.get("cf-ipcountry") || null; if (cc === "XX" || cc === "T1") cc = null;
  await (await anaDb(env)).prepare("INSERT INTO ev (ts, day, vid, uid, type, path, ref, us, um, uc, dev, os, br, cc, obj, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(now, amsDay(now), c.vid, s ? s.sub : null, type, cut(o.path || u.pathname, 160), ref, cut(sp.get("utm_source"), 60), cut(sp.get("utm_medium"), 60), cut(sp.get("utm_campaign"), 80), ui.dev, ui.os, ui.br, cc, cut(o.obj, 60), o.meta ? cut(typeof o.meta === "string" ? o.meta : JSON.stringify(o.meta), 300) : null).run();
}
const NOTEST = "(uid IS NULL OR uid NOT LIKE 'test:%') AND vid NOT LIKE 'zztest%'";

// ---------- housekeeping: roll raw events older than 90 days into daily counts, drop old CVs ----------
async function gateSweep(env) {
  try {
    const last = +(await store(env).get("sweep:gate") || 0); if (Date.now() - last < 3600e3) return;
    await store(env).put("sweep:gate", String(Date.now()));
    const db = await anaDb(env); const cut = amsDay(Date.now() - EV_RAW_DAYS * 864e5);
    const old = await db.prepare("SELECT COUNT(*) AS n FROM ev WHERE day < ?").bind(cut).first();
    if (old && old.n) {
      const ins = "INSERT INTO ev_agg (day, type, dim, k, n) ";
      const up = " ON CONFLICT(day, type, dim, k) DO UPDATE SET n = n + excluded.n";
      await db.batch([
        db.prepare(ins + "SELECT day, type, 'all', '', COUNT(*) FROM ev WHERE day < ? GROUP BY day, type" + up).bind(cut),
        db.prepare(ins + "SELECT day, 'visitors', 'all', '', COUNT(DISTINCT vid) FROM ev WHERE day < ? AND type = 'pageview' GROUP BY day" + up).bind(cut),
        ...["path", "ref", "us", "uc", "dev", "os", "br", "cc"].map(d => db.prepare(ins + `SELECT day, 'pageview', '${d}', COALESCE(${d}, ''), COUNT(*) FROM ev WHERE day < ? AND type = 'pageview' GROUP BY day, ${d}` + up).bind(cut)),
        db.prepare(ins + "SELECT day, 'apply_click', 'obj', COALESCE(obj, ''), COUNT(*) FROM ev WHERE day < ? AND type = 'apply_click' GROUP BY day, obj" + up).bind(cut),
        db.prepare("DELETE FROM ev WHERE day < ?").bind(cut)
      ]);
    }
    const cvCut = Date.now() - CV_RETENTION_DAYS * 864e5;
    const olds = (await db.prepare("SELECT id FROM cvs WHERE created < ? LIMIT 500").bind(cvCut).all()).results || [];
    for (const r of olds) await deleteCv(env, r.id);
    const appDb = await build1Db(env);
    await cleanupResumes(appDb);
    await cleanupAtsScans(appDb);
  } catch (e) {}
}

// ---------- stored CVs ----------
async function deleteCv(env, id) { const db = await anaDb(env); await db.batch([db.prepare("DELETE FROM cv_chunks WHERE cv_id = ?").bind(id), db.prepare("DELETE FROM cvs WHERE id = ?").bind(id)]); }
async function deleteCvsOf(env, sub) { const db = await anaDb(env); const r = (await db.prepare("SELECT id FROM cvs WHERE sub = ?").bind(sub).all()).results || []; for (const x of r) await deleteCv(env, x.id); return r.length; }
async function storeCv(req, env, s) {
  const db = await anaDb(env);
  const buf = new Uint8Array(await req.arrayBuffer());
  if (!buf.length) return json({ error: "empty file" }, 400);
  if (buf.length > CV_MAX_BYTES) return json({ error: "file too large" }, 413);
  let name = "cv"; try { name = decodeURIComponent(req.headers.get("x-filename") || "cv"); } catch (e) {}
  name = name.replace(/[\\/\r\n"]+/g, "_").slice(0, 120) || "cv";
  const mime = String(req.headers.get("content-type") || "application/octet-stream").split(";")[0].slice(0, 100);
  let job = ""; try { job = decodeURIComponent(req.headers.get("x-job") || "").slice(0, 160); } catch (e) {}
  const id = crypto.randomUUID(); const n = Math.ceil(buf.length / CV_CHUNK);
  const st = [db.prepare("INSERT INTO cvs (id, sub, email, filename, mime, size, source, job, chunks, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, s.sub, s.email, name, mime, buf.length, String(req.headers.get("x-source") || "file").slice(0, 20), job, n, Date.now())];
  for (let i = 0; i < n; i++) st.push(db.prepare("INSERT INTO cv_chunks (cv_id, idx, data) VALUES (?, ?, ?)").bind(id, i, buf.slice(i * CV_CHUNK, (i + 1) * CV_CHUNK).buffer));
  await db.batch(st);
  const extra = (await db.prepare("SELECT id FROM cvs WHERE sub = ? ORDER BY created DESC LIMIT 100 OFFSET ?").bind(s.sub, CV_PER_USER).all()).results || [];
  for (const x of extra) await deleteCv(env, x.id);
  track(req, "cv_upload", { obj: id, meta: { size: buf.length, mime } });
  return json({ ok: true, id, retention_days: CV_RETENTION_DAYS });
}
async function cvResponse(env, id, download) {
  const db = await anaDb(env);
  const m = await db.prepare("SELECT * FROM cvs WHERE id = ?").bind(id).first(); if (!m) return null;
  const rows = (await db.prepare("SELECT data FROM cv_chunks WHERE cv_id = ? ORDER BY idx").bind(id).all()).results || [];
  const parts = rows.map(r => r.data instanceof ArrayBuffer ? new Uint8Array(r.data) : new Uint8Array(r.data || []));
  const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
  const safe = String(m.filename || "cv").replace(/[^\w.\- ]+/g, "_");
  const inlineOk = !download && /^(application\/pdf|text\/plain)$/.test(m.mime);
  return new Response(out, { headers: { "content-type": inlineOk ? m.mime + (m.mime === "text/plain" ? "; charset=utf-8" : "") : (m.mime || "application/octet-stream"), "content-disposition": `${inlineOk ? "inline" : "attachment"}; filename="${safe}"`, "cache-control": "private, no-store", "x-content-type-options": "nosniff", "content-security-policy": "sandbox" } });
}

// ---------- deleting a person ----------
async function purgeEmailData(env, email) {
  const eh = await sha(email); const db = await sql(env); const out = {};
  for (const [t, q] of [["credits", "DELETE FROM credits WHERE email_hash = ?"], ["ledger", "DELETE FROM credit_ledger WHERE email_hash = ?"], ["jobs", "DELETE FROM jobs WHERE email_hash = ?"]]) out[t] = (await db.prepare(q).bind(eh).run()).meta.changes;
  let kv = 0; for (const pre of ["lead:" + eh, "ea:pro:" + eh, "ea:plus:" + eh, "ea:autopilot:" + eh, "ea:credits:" + eh, "q:e:" + eh, "sub:jobs:" + eh, "pl:e:" + eh]) { if (await store(env).get(pre)) { await store(env).delete(pre); kv++; } }
  const pre = "d:e:" + eh + ":"; out.daily = (await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, ?) = ?").bind(pre.length, pre).run()).meta.changes;
  out.covers = (await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, 6) = 'cover:' AND instr(v, ?) > 0").bind('"eh":"' + eh + '"').run()).meta.changes;
  out.contact = (await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, 8) = 'contact:' AND instr(v, ?) > 0").bind('"email":"' + email + '"').run()).meta.changes;
  out.kv = kv; return out;
}
async function resetFree(env, sub, email) {
  let n = 0; const ks = ["pl:u:" + sub]; if (email) ks.push("pl:e:" + (await sha(email)));
  try { const d = JSON.parse((await store(env).get("udev:" + sub)) || "[]"); for (const x of d) ks.push("pl:d:" + x); } catch (e) {}
  for (const k of ks) if (await store(env).get(k)) { await store(env).delete(k); n++; }
  return n;
}
async function deleteUser(env, sub, why) {
  const db = await anaDb(env);
  const u = await db.prepare("SELECT email FROM users WHERE sub = ?").bind(sub).first();
  const out = { cvs: await deleteCvsOf(env, sub), free_reset: await resetFree(env, sub, u && u.email) };
  if (u && u.email) out.email_data = await purgeEmailData(env, u.email);
  const vids = ((await db.prepare("SELECT DISTINCT vid FROM ev WHERE uid = ?").bind(sub).all()).results || []).map(r => r.vid);
  let evn = (await db.prepare("DELETE FROM ev WHERE uid = ?").bind(sub).run()).meta.changes;
  for (const v of vids) evn += (await db.prepare("DELETE FROM ev WHERE vid = ?").bind(v).run()).meta.changes;
  out.events = evn;
  out.user = (await db.prepare("DELETE FROM users WHERE sub = ?").bind(sub).run()).meta.changes;
  await store(env).delete("udev:" + sub);
  await store(env).put("ust:" + sub, why || "deleted", { expirationTtl: 31 * 86400 }); // ends their open sessions
  return out;
}

// ---------- shared page bits ----------
function gEsc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
const NOSTORE = { "cache-control": "private, no-store", "vary": "Cookie" };
async function privateResp(res, s, extraHead) {
  const ct = res.headers.get("content-type") || "";
  if (!/text\/html/.test(ct)) { const r = new Response(res.body, res); for (const [k, v] of Object.entries(NOSTORE)) r.headers.set(k, v); r.headers.set("x-fitwise-gate", "0"); return r; }
  let html = await res.text();
  if (s) html = html.replace("</header>", "</header>" + acctStrip(s));
  if (extraHead) html = html.replace("</head>", extraHead + "</head>");
  const h = new Headers(res.headers); for (const [k, v] of Object.entries(NOSTORE)) h.set(k, v); h.set("x-fitwise-gate", s ? "0" : "1"); h.delete("content-length");
  return new Response(html, { status: res.status, headers: h });
}
function acctStrip(s) {
  const who = s.key ? "Admin key" : (s.email || "");
  return `<div class="fwacct"><style>.fwacct{display:flex;justify-content:flex-end;align-items:center;gap:12px;flex-wrap:wrap;max-width:1100px;margin:0 auto;padding:6px 16px 0;font-size:.8rem;color:var(--mut,#5c6370)}.fwacct a,.fwacct button{all:unset;cursor:pointer;color:var(--g,#0b6b58);font-weight:650}.fwacct a:hover,.fwacct button:hover{text-decoration:underline}.fwacct .em{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60vw}</style><span class="em">Signed in as ${gEsc(who)}</span>${s.isAdmin && !s.key ? '<a href="/admin">Admin</a>' : ""}<a href="/account">Your data</a><button type="button" data-signout>Sign out</button></div>`;
}
const GATE_CSS = `<style>
.gw{max-width:980px;margin:0 auto;padding:30px 16px 56px;display:grid;grid-template-columns:1.1fr .9fr;gap:22px;align-items:start}
.gw .tz,.gw .sg{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px}
.gw .tz .co{color:var(--g);font-weight:700;margin:0 0 4px;font-size:.95rem}.gw .tz h1{font-size:1.6rem;line-height:1.2;margin:.1em 0 .4em}
.gw .tz p{color:var(--mut);margin:.3em 0}.gw .tz ul{margin:.8em 0 0;padding-left:1.1em}.gw .tz li{margin:.35em 0}
.gw .meta{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.gw .meta span{font-size:.8rem;font-weight:650;border-radius:8px;padding:3px 9px;background:#f4f2ec;border:1px solid var(--line)}
.gw .meta .vz{background:#e3f4ed;color:var(--g);border-color:#9fd3c0}
.gw .lock{margin-top:14px;border:1px dashed var(--line);border-radius:12px;padding:12px;color:var(--mut);font-size:.9rem;display:flex;gap:8px;align-items:center}
.gw .sg{text-align:center;position:sticky;top:16px}.gw .sg h2{font-size:1.2rem;margin:0 0 6px;text-align:center}.gw .sg p{color:var(--mut);font-size:.92rem;margin:0 0 14px}
.gw .gbtn{display:flex;justify-content:center;min-height:44px}.gw .err{color:#a33;font-size:.85rem;margin:10px 0 0;min-height:1em}
.gw .fine{font-size:.76rem;color:var(--mut);margin:14px 0 0}.gw .fine a{color:inherit}
@media(max-width:760px){.gw{grid-template-columns:1fr;padding-top:14px;gap:12px}.gw .sg{position:static}.gw .tz{padding:16px 18px}.gw .tz ul,.gw .tz .lock{display:none}.gw .tz h1{font-size:1.35rem;margin-bottom:.2em}.gw .tz p{font-size:.9rem}}
</style>`;
function inAppBox(app, req) {
  const u = new URL(req.url); const ua = req.headers.get("user-agent") || "";
  const android = /Android/i.test(ua);
  const intent = `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;end`;
  return `<style>.iab{background:#fff8e6;border:1px solid #f0d9a0;border-radius:14px;padding:14px;margin:0 0 16px;text-align:left;font-size:.9rem}.iab b{display:block;margin-bottom:4px}.iab ol{margin:6px 0 10px;padding-left:1.2em}.iab .row{display:flex;gap:8px;flex-wrap:wrap}.iab .btn{font-size:.85rem;padding:9px 13px}</style><div class="iab" id="fwIab" data-app="${gEsc(app)}"><b>Open this page in your browser to sign in</b>
Google doesn't allow sign-in inside ${app === "an app" ? "in-app browsers" : "the " + gEsc(app) + " app's browser"}. ${android ? "Tap the button below, or tap ⋮ (top right) and choose <i>Open in browser</i>." : "Tap ⋯ (top right) and choose <i>Open in browser</i> (or <i>Open in Safari</i>)."}
<div class="row" style="margin-top:10px">${android ? `<a class="btn" href="${gEsc(intent)}" data-ev="open_browser">Open in Chrome</a>` : ""}<button type="button" class="btn ghost" data-copylink>Copy link</button></div></div>`;
}
// the sign-in screen shown instead of a gated page
function gateResp(req, env, clientId, o) {
  const ua = req.headers.get("user-agent") || ""; const app = inAppName(ua);
  const og = o.og || {};
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${gEsc(og.title || o.h1)}</title>
<meta name="description" content="${gEsc(og.desc || o.lead || "")}">
${og.canon ? `<link rel="canonical" href="${gEsc(og.canon)}"><meta property="og:url" content="${gEsc(og.canon)}">` : ""}
<meta property="og:type" content="website"><meta property="og:site_name" content="Fitwise"><meta property="og:title" content="${gEsc(og.title || o.h1)}"><meta property="og:description" content="${gEsc(og.desc || o.lead || "")}"><meta property="og:image" content="${JOBS_SITE}/${og.image || "og.png"}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${gEsc(og.title || o.h1)}"><meta name="twitter:image" content="${JOBS_SITE}/${og.image || "og.png"}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css"><meta name="theme-color" content="#0b6b58">
${GATE_CSS}
</head><body class="gated" data-gate="1">
<a class="skip" href="#main">Skip to content</a>
${SITE_HEADER}
<main id="main"><div class="gw">
<section class="tz">${o.eyebrow ? `<p class="co">${gEsc(o.eyebrow)}</p>` : ""}<h1>${gEsc(o.h1)}</h1>${o.teaser || ""}${o.lead ? `<p>${gEsc(o.lead)}</p>` : ""}
${o.bullets && o.bullets.length ? `<ul>${o.bullets.map(b => `<li>${gEsc(b)}</li>`).join("")}</ul>` : ""}
<div class="lock">🔒 <span>${gEsc(o.lock || "Free with Google sign-in. Takes a few seconds.")}</span></div></section>
<aside class="sg" aria-label="Sign in">
${app ? inAppBox(app, req) : ""}
<h2>${gEsc(o.cta || "Sign in with Google to continue")}</h2>
<p>Free. One tap with your Google account. You'll come straight back to this page.</p>
<div class="gbtn" id="gBtn"><noscript>Turn on JavaScript to sign in with Google.</noscript></div>
<div class="err" id="gErr" role="alert"></div>
<p class="fine">We store your Google email and name to create your free Fitwise account, and keep first-party usage statistics (pages visited, how you arrived). No password, nothing is posted. <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>
</aside></div></main>
${SITE_FOOTER}
<script>window.FW_GCID=${JSON.stringify(clientId)};</script>
<script src="https://accounts.google.com/gsi/client" async defer onload="window.fwGsiReady&&window.fwGsiReady()"></script>
</body></html>`;
  track(req, "gate_shown", { obj: o.obj || null, meta: o.kind ? { page: o.kind } : null });
  if (app) track(req, "inapp_hint", { meta: { app } });
  return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8", ...NOSTORE, "x-fitwise-gate": "1", "x-robots-tag": "noindex" } });
}
const CC_NAMES = { NL: "Netherlands", DE: "Germany", BE: "Belgium", PT: "Portugal", FR: "France", ES: "Spain", IE: "Ireland", AT: "Austria", CH: "Switzerland", DK: "Denmark", SE: "Sweden", PL: "Poland", LU: "Luxembourg", IT: "Italy", FI: "Finland", NO: "Norway", CZ: "Czechia", GB: "United Kingdom", UK: "United Kingdom" };
async function gateFor(p, req, env) {
  const cid = await googleClientId(env); const u = new URL(req.url);
  const m = p.match(/^\/j\/([A-Za-z0-9]{1,16})\/?$/);
  if (m) {
    const j = await getJobById(env, m[1].toLowerCase());
    if (!j) return jobNotFoundHTML();
    const { city, country } = jobPlaceParts(j); const place = [city, country].filter(Boolean).join(", ");
    return gateResp(req, env, cid, { kind: "job", obj: j.id, eyebrow: j.company, h1: j.title, cta: "Sign in with Google to see the job and apply",
      teaser: `<div class="meta">${place ? `<span>📍 ${gEsc(place)}</span>` : ""}${j.remote ? `<span>${gEsc(j.remote)}</span>` : ""}${j.visa ? '<span class="vz">Visa sponsorship: Yes ✅</span>' : ""}</div>`,
      bullets: ["The full job details and the Apply button", "Tailor your CV to this exact job in about 30 seconds", "Today's full list of English-speaking tech jobs in Europe"],
      lock: "The Apply link and job details open after you sign in. Free.",
      og: { title: `${j.title} at ${j.company}${city || country ? " · " + (city || country) : ""}`, desc: `${j.title} at ${j.company}${place ? " in " + place : ""}. Visa sponsorship: ${j.visa ? "Yes ✅" : "not stated"}. See the job and apply on Fitwise.`, canon: `${JOBS_SITE}/j/${j.id}`, image: "og-jobs.png" } });
  }
  if (p === "/jobs" || p.startsWith("/jobs/")) {
    let f = null; try { const dm = p.match(/^\/jobs\/(\d{4}-\d{2}-\d{2})/); f = await getFeed(env, dm ? dm[1] : null); } catch (e) {}
    const n = f ? f.jobs.length : 0, v = f ? f.jobs.filter(x => x.visa).length : 0;
    return gateResp(req, env, cid, { kind: "jobs", eyebrow: "Daily jobs in Europe", h1: n ? `${n} English-speaking tech jobs in Europe${f.date ? " · " + prettyDate(f.date) : ""}` : "English-speaking tech jobs in Europe, every morning",
      teaser: n ? `<div class="meta"><span class="vz">${v} with visa sponsorship ✅</span><span>Updated every morning</span></div>` : "",
      bullets: ["Every job with its location, work mode and visa-sponsorship evidence", "Filters by country, remote/hybrid and field", "One tap to apply, or tailor your CV to the job first"],
      cta: "Sign in with Google to see today's jobs", og: { title: "Daily English-speaking tech jobs in Europe · Fitwise", desc: "A fresh list every morning, visa-sponsored roles first. Free with Google sign-in.", canon: JOBS_SITE + "/jobs", image: "og-jobs.png" } });
  }
  if (p === "/tailor") {
    const t = (u.searchParams.get("title") || "").slice(0, 100), c = (u.searchParams.get("company") || "").slice(0, 80);
    return gateResp(req, env, cid, { kind: "tailor", eyebrow: t ? "Tailor your CV for" : "Tailor your CV", h1: t ? `${t}${c ? " at " + c : ""}` : "Tailor your CV to a job in about 30 seconds",
      bullets: ["Your CV back in its own format, most relevant experience first", "A match score and the keywords you're missing", "Nothing invented: only facts already in your CV"],
      lead: "Pre-launch: 1 free tailoring per person.", cta: "Sign in with Google to tailor your CV", og: { title: "Tailor your CV to a job · Fitwise", desc: "Upload your CV and a job ad. Get your CV back in its own format, a match score and missing keywords.", canon: JOBS_SITE + "/tailor" } });
  }
  if (p === "/pricing") return gateResp(req, env, cid, { kind: "pricing", eyebrow: "Pricing", h1: "Free to try. Prepaid credits for extras.", bullets: ["See what's free and what credits unlock", "No subscription"], cta: "Sign in with Google to see pricing", og: { title: "Pricing · Fitwise", desc: "Free to try. Prepaid credits for extra formats and cover letters.", canon: JOBS_SITE + "/pricing" } });
  if (p === "/account") return gateResp(req, env, cid, { kind: "account", h1: "Your Fitwise account", bullets: ["See and delete the CVs you uploaded", "Delete your account and data"], cta: "Sign in with Google to see your data" });
  return null;
}

// ---------- /account ----------
function accountHTML(s) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Your data · Fitwise</title><meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css"><style>.acw{max-width:760px;margin:0 auto;padding:26px 16px 56px}.acw .c{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;margin:0 0 14px}.acw h1{font-size:1.5rem}.acw h2{font-size:1.1rem;text-align:left;margin:0 0 8px}.acw table{width:100%;border-collapse:collapse;font-size:.88rem}.acw td{padding:7px 4px;border-bottom:1px solid var(--line)}.acw td:last-child{text-align:right;white-space:nowrap}.acw button.l{all:unset;cursor:pointer;color:var(--g);font-weight:650;margin-left:10px}.acw .danger{background:#a33}.acw .muted{color:var(--mut);font-size:.88rem}</style></head><body>
${SITE_HEADER}<main id="main"><div class="acw"><h1>Your data</h1>
<div class="c"><h2>Account</h2><p>Signed in with Google as <b>${gEsc(s.email)}</b>${s.name ? " (" + gEsc(s.name) + ")" : ""}.</p></div>
<div class="c"><h2>CVs you uploaded</h2><p class="muted">Fitwise keeps the CV you tailor for ${CV_RETENTION_DAYS} days, then deletes it automatically. You can delete it now.</p><div id="cvl">Loading…</div><p><button class="btn ghost" id="cvall" type="button">Delete all my stored CVs</button></p></div>
<div class="c"><h2>Delete my account</h2><p class="muted">Deletes your Fitwise account, stored CVs, credits and history, tailoring records and usage records, and signs you out. This can't be undone.</p><button class="btn danger" id="del" type="button">Delete my account and data</button><p class="err" id="derr"></p></div>
<p class="muted">Questions or a data request: <a href="/contact">contact us</a>. <a href="/privacy">Privacy policy</a></p>
</div></main>${SITE_FOOTER}
<script>(function(){var $=function(i){return document.getElementById(i)};var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
function load(){fetch("/api/my/cvs",{credentials:"same-origin"}).then(function(r){return r.json()}).then(function(j){var l=j.cvs||[];$("cvl").innerHTML=l.length?"<table>"+l.map(function(c){return "<tr><td>"+esc(c.filename)+"<br><span class=muted>"+new Date(c.created).toLocaleString()+" · "+Math.max(1,Math.round(c.size/1024))+" KB"+(c.job?" · "+esc(c.job):"")+"</span></td><td><a href=\\"/api/my/cv?id="+c.id+"\\">Download</a><button class=l data-d=\\""+c.id+"\\">Delete</button></td></tr>"}).join("")+"</table>":"<p class=muted>No CVs stored.</p>";document.querySelectorAll("[data-d]").forEach(function(b){b.onclick=function(){fetch("/api/my/cv",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({delete:b.getAttribute("data-d")})}).then(load)}})}).catch(function(){$("cvl").textContent="Could not load."})}
load();$("cvall").onclick=function(){if(!confirm("Delete all your stored CVs?"))return;fetch("/api/my/cv",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({delete:"all"})}).then(load)};
$("del").onclick=function(){if(!confirm("Delete your Fitwise account and all its data? This can't be undone."))return;fetch("/api/my/delete-account",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({confirm:true})}).then(function(r){return r.json()}).then(function(j){if(j.ok){try{google.accounts.id.disableAutoSelect()}catch(e){}location.href="/"}else $("derr").textContent=j.error||"Try again."})};})();</script>
</body></html>`;
}

// ---------- admin APIs (admin Google session or x-admin-key; anyone else gets 404) ----------
function csvResp(rows, cols, name) {
  const q = v => { const s = v == null ? "" : String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const body = [cols.join(",")].concat(rows.map(r => cols.map(c => q(r[c])).join(","))).join("\n") + "\n";
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}"`, "cache-control": "private, no-store" } });
}
async function adminOverview(env, days) {
  const db = await anaDb(env); await sql(env);
  const since = amsDay(Date.now() - (days - 1) * 864e5); const sinceTs = Date.now() - days * 864e5;
  const W = `day >= ? AND ${NOTEST}`;
  const all = async (q, ...b) => ((await db.prepare(q).bind(...b).all()).results || []);
  const one = async (q, ...b) => (await db.prepare(q).bind(...b).first()) || {};
  const daily = await all(`SELECT day, COUNT(*) AS pv, COUNT(DISTINCT vid) AS v FROM ev WHERE type = 'pageview' AND ${W} GROUP BY day ORDER BY day`, since);
  const sud = await all("SELECT created FROM users WHERE created >= ?", sinceTs);
  const su = {}; sud.forEach(r => { const d = amsDay(r.created); su[d] = (su[d] || 0) + 1; });
  const fsteps = [["Visited", "pageview"], ["Saw the sign-in screen", "gate_shown"], ["Started Google sign-in", "signin_start"], ["Signed in", "signin_ok"], ["Viewed a job", "job_view"], ["Clicked Apply", "apply_click"], ["Started a tailoring", "tailor_start"], ["Finished a tailoring", "tailor_done"]];
  const fr = await all(`SELECT type, COUNT(DISTINCT vid) AS n FROM ev WHERE ${W} GROUP BY type`, since); const fm = {}; fr.forEach(r => fm[r.type] = r.n);
  const tot = await one(`SELECT COUNT(*) AS pv, COUNT(DISTINCT vid) AS v FROM ev WHERE type = 'pageview' AND ${W}`, since);
  const act = await one(`SELECT COUNT(DISTINCT uid) AS n FROM ev WHERE uid IS NOT NULL AND ${W}`, since);
  const users = await one("SELECT COUNT(*) AS n FROM users");
  const grp = (dim, type, lim, extra) => all(`SELECT COALESCE(${dim}, '(unknown)') AS k, COUNT(*) AS n, COUNT(DISTINCT vid) AS v FROM ev WHERE type = '${type}' AND ${W} ${extra || ""} GROUP BY ${dim} ORDER BY v DESC, n DESC LIMIT ${lim}`, since);
  return {
    days, since, generated: new Date().toISOString(),
    totals: { pageviews: tot.pv || 0, visitors: tot.v || 0, signups: sud.length, users_total: users.n || 0, active_users: act.n || 0 },
    daily: daily.map(r => ({ ...r, signups: su[r.day] || 0 })).concat(Object.keys(su).filter(d => !daily.some(r => r.day === d)).map(d => ({ day: d, pv: 0, v: 0, signups: su[d] }))).sort((a, b) => a.day < b.day ? -1 : 1),
    funnel: fsteps.map(([l, t]) => ({ step: l, type: t, visitors: fm[t] || 0 })),
    events: (await all(`SELECT type, COUNT(*) AS n FROM ev WHERE ${W} GROUP BY type ORDER BY n DESC`, since)),
    referrers: await grp("ref", "pageview", 15, "AND ref NOT IN ('(internal)')"),
    campaigns: await all(`SELECT COALESCE(us, '') AS source, COALESCE(um, '') AS medium, COALESCE(uc, '') AS campaign, COUNT(*) AS n, COUNT(DISTINCT vid) AS v FROM ev WHERE type = 'pageview' AND us IS NOT NULL AND ${W} GROUP BY us, um, uc ORDER BY v DESC LIMIT 20`, since),
    pages: await grp("path", "pageview", 20),
    jobs: await all(`SELECT obj AS id, MAX(meta) AS job, COUNT(*) AS clicks, COUNT(DISTINCT vid) AS v FROM ev WHERE type = 'apply_click' AND ${W} GROUP BY obj ORDER BY clicks DESC LIMIT 20`, since),
    job_views: await all(`SELECT obj AS id, MAX(meta) AS job, COUNT(*) AS views FROM ev WHERE type = 'job_view' AND ${W} GROUP BY obj ORDER BY views DESC LIMIT 20`, since),
    devices: await grp("dev", "pageview", 5), os: await grp("os", "pageview", 8), browsers: await grp("br", "pageview", 10), countries: await grp("cc", "pageview", 20),
    apply_clicks_all_time: await jobClickStats(env).then(x => x.total).catch(() => null)
  };
}
async function adminUsers(env, q) {
  const db = await anaDb(env); await sql(env);
  const like = "%" + String(q || "").toLowerCase() + "%";
  const r = (await db.prepare(`SELECT u.sub, u.email, u.name, u.source, u.signup_path, u.first_src, u.first_ref, u.created, u.last_login, u.logins, u.status,
    (SELECT MAX(ts) FROM ev WHERE uid = u.sub) AS last_seen, (SELECT COUNT(*) FROM ev WHERE uid = u.sub AND type = 'tailor_done') AS tailor_events,
    (SELECT COUNT(*) FROM cvs WHERE sub = u.sub) AS cvs, (SELECT balance FROM credits c WHERE c.email = u.email) AS credits
    FROM users u WHERE (? = '%%' OR lower(u.email) LIKE ? OR lower(u.name) LIKE ?) ORDER BY u.created DESC LIMIT 1000`).bind(like, like, like).all()).results || [];
  const tj = {}; ((await db.prepare("SELECT email_hash, COUNT(*) AS n FROM jobs GROUP BY email_hash").all()).results || []).forEach(x => tj[x.email_hash] = x.n);
  const admins = await adminEmails(env);
  for (const u of r) { u.tailorings = tj[await sha(String(u.email || "").toLowerCase())] || 0; u.admin = admins.includes(String(u.email).toLowerCase()); u.free_used = await kvNum(env, "pl:u:" + u.sub); }
  return r;
}
async function routeAdmin(p, req, env, url) {
  const body = async () => req.json().catch(() => ({}));
  if (p === "/api/admin/overview") { const d = Math.min(365, Math.max(1, parseInt(url.searchParams.get("days") || "30", 10) || 30)); return json(await adminOverview(env, d)); }
  if (p === "/api/admin/users") return json({ users: await adminUsers(env, url.searchParams.get("q")) });
  if (p === "/api/admin/user" && req.method === "GET") {
    const sub = String(url.searchParams.get("sub") || ""); const db = await anaDb(env); await sql(env);
    const u = await db.prepare("SELECT * FROM users WHERE sub = ?").bind(sub).first(); if (!u) return json({ error: "no such user" }, 404);
    const eh = await sha(String(u.email).toLowerCase());
    const tl = (await db.prepare(`SELECT ts, type, path, ref, us, um, uc, dev, os, br, cc, obj, meta, uid IS NOT NULL AS signed FROM ev WHERE uid = ? OR vid IN (SELECT DISTINCT vid FROM ev WHERE uid = ?) ORDER BY ts DESC LIMIT 300`).bind(sub, sub).all()).results || [];
    const led = (await db.prepare("SELECT delta, reason, ref, created FROM credit_ledger WHERE email_hash = ? ORDER BY created DESC LIMIT 100").bind(eh).all()).results || [];
    const cv = (await db.prepare("SELECT id, filename, mime, size, source, job, created FROM cvs WHERE sub = ? ORDER BY created DESC").bind(sub).all()).results || [];
    const tj = (await db.prepare("SELECT title, created FROM jobs WHERE email_hash = ? ORDER BY created DESC LIMIT 50").bind(eh).all()).results || [];
    return json({ user: u, credits: await balanceOf(env, eh), ledger: led, cvs: cv, tailorings: tj, free_used: await kvNum(env, "pl:u:" + sub), timeline: tl });
  }
  if (p === "/api/admin/user" && req.method === "POST") {
    const b = await body(); const sub = String(b.sub || ""); const db = await anaDb(env);
    const u = await db.prepare("SELECT sub, email FROM users WHERE sub = ?").bind(sub).first(); if (!u) return json({ error: "no such user" }, 404);
    if (b.action === "grant") { const n = parseInt(b.delta, 10); if (!n || Math.abs(n) > 1000) return json({ error: "delta 1..1000 (negative to remove)" }, 400); return json({ ok: true, balance: await grantCredits(env, u.email, n, "admin", String(b.note || "admin page").slice(0, 80)) }); }
    if (b.action === "reset_free") return json({ ok: true, cleared: await resetFree(env, sub, u.email) });
    if (b.action === "block") { await db.prepare("UPDATE users SET status = 'blocked' WHERE sub = ?").bind(sub).run(); await store(env).put("ust:" + sub, "blocked"); return json({ ok: true, status: "blocked" }); }
    if (b.action === "unblock") { await db.prepare("UPDATE users SET status = NULL WHERE sub = ?").bind(sub).run(); await store(env).delete("ust:" + sub); return json({ ok: true, status: "active" }); }
    if (b.action === "delete") { if (b.confirm !== u.email) return json({ error: "confirm with the user's email" }, 400); return json({ ok: true, deleted: await deleteUser(env, sub, "deleted") }); }
    return json({ error: "unknown action" }, 400);
  }
  if (p === "/api/admin/cvs" && req.method === "GET") {
    const db = await anaDb(env); const like = "%" + String(url.searchParams.get("q") || "").toLowerCase() + "%";
    const r = (await db.prepare("SELECT c.id, c.sub, c.email, u.name, c.filename, c.mime, c.size, c.source, c.job, c.created FROM cvs c LEFT JOIN users u ON u.sub = c.sub WHERE (? = '%%' OR lower(c.email) LIKE ? OR lower(c.filename) LIKE ?) ORDER BY c.created DESC LIMIT 1000").bind(like, like, like).all()).results || [];
    const t = await db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(size), 0) AS bytes FROM cvs").first();
    return json({ count: t.n, bytes: t.bytes, retention_days: CV_RETENTION_DAYS, cvs: r });
  }
  if (p === "/api/admin/cv" && req.method === "GET") { const r = await cvResponse(env, String(url.searchParams.get("id") || ""), url.searchParams.get("dl") === "1"); return r || json({ error: "not found" }, 404); }
  if (p === "/api/admin/cv" && req.method === "POST") { const b = await body(); if (!b.delete) return json({ error: "need delete" }, 400); await deleteCv(env, String(b.delete)); return json({ ok: true }); }
  if (p === "/api/admin/billing") {
    const db = await sql(env); const all = async q => ((await db.prepare(q).all()).results || []);
    const bal = await all("SELECT email, balance, updated FROM credits ORDER BY balance DESC LIMIT 500");
    const led = await all("SELECT l.delta, l.reason, l.ref, l.created, c.email FROM credit_ledger l LEFT JOIN credits c ON c.email_hash = l.email_hash ORDER BY l.created DESC LIMIT 300");
    const byReason = await all("SELECT reason, COUNT(*) AS rows, SUM(delta) AS credits FROM credit_ledger GROUP BY reason ORDER BY rows DESC");
    const ea = []; for (const pre of ["ea:credits:", "ea:autopilot:"]) { const r = await store(env).list({ prefix: pre }); for (const k of r.keys) { try { const v = JSON.parse((await store(env).get(k.name)) || "{}"); ea.push({ list: pre.slice(3, -1), email: v.email, pack: v.pack || v.bundle || "", at: v.at }); } catch (e) {} } }
    return json({ payments_live: PAYMENTS.live, provider: null, balances: bal, credits_outstanding: bal.reduce((a, r) => a + (r.balance || 0), 0), ledger: led, by_reason: byReason, interest: ea, packs: CREDIT_PACKS, per_format: CREDITS_PER_FORMAT, per_cover: CREDITS_PER_COVER });
  }
  if (p === "/api/admin/content") {
    const d = await eventsData(env); const up = d ? evUpcoming(d) : [];
    const dates = await feedDates(env).catch(() => []); const feeds = [];
    for (const dt of dates.slice(0, 7)) { try { const raw = await store(env).get("jobs:feed:" + dt); const f = raw ? JSON.parse(raw) : null; feeds.push({ date: dt, count: f ? f.jobs.length : 0, visa: f ? f.jobs.filter(j => j.visa).length : 0, pushed: f && f.updated || null, window: f && f.window || "" }); } catch (e) {} }
    const subs = (await store(env).list({ prefix: "sub:jobs:" })).keys.length; const contact = (await store(env).list({ prefix: "contact:" })).keys.length;
    return json({ events: { stored: d ? d.events.length : 0, upcoming: up.length, cfp_open: up.filter(evCfpOpen).length, generated_at: d && d.generated_at || null, pushed_at: d && d.pushed_at || null }, jobs: { latest: await store(env).get("jobs:latest"), feeds, subscribers: subs }, contact_messages: contact, ai_mode: !!(await store(env).get("cfg:ai")) });
  }
  if (p === "/api/admin/export/users.csv") return csvResp((await adminUsers(env, "")).map(u => ({ ...u, created: u.created && new Date(u.created).toISOString(), last_login: u.last_login && new Date(u.last_login).toISOString(), last_seen: u.last_seen && new Date(u.last_seen).toISOString() })), ["email", "name", "created", "last_login", "last_seen", "logins", "tailorings", "free_used", "credits", "cvs", "status", "signup_path", "first_src", "first_ref", "admin"], "fitwise-users-" + amsDay() + ".csv");
  if (p === "/api/admin/export/events.csv") {
    const d = Math.min(365, Math.max(1, parseInt(url.searchParams.get("days") || "30", 10) || 30)); const db = await anaDb(env);
    const r = (await db.prepare(`SELECT e.ts, e.day, e.type, e.path, e.ref, e.us, e.um, e.uc, e.dev, e.os, e.br, e.cc, e.obj, e.meta, e.vid, e.uid, u.email FROM ev e LEFT JOIN users u ON u.sub = e.uid WHERE e.day >= ? AND (? = 1 OR ((e.uid IS NULL OR e.uid NOT LIKE 'test:%') AND e.vid NOT LIKE 'zztest%')) ORDER BY e.ts DESC LIMIT 50000`).bind(amsDay(Date.now() - (d - 1) * 864e5), url.searchParams.get("include_test") === "1" ? 1 : 0).all()).results || [];
    return csvResp(r.map(x => ({ ...x, time: new Date(x.ts).toISOString() })), ["time", "day", "type", "path", "ref", "us", "um", "uc", "dev", "os", "br", "cc", "obj", "meta", "vid", "email", "uid"], "fitwise-events-" + amsDay() + ".csv");
  }
  if (p === "/api/admin/admins") {
    if (req.method === "POST") { const b = await body(); let a = []; try { a = JSON.parse((await store(env).get("cfg:admins")) || "[]"); } catch (e) {} const e = String(b.add || b.remove || "").toLowerCase(); if (!EMAIL_RE.test(e)) return json({ error: "need add or remove email" }, 400); a = b.add ? [...new Set(a.concat(e))] : a.filter(x => x !== e); await store(env).put("cfg:admins", JSON.stringify(a)); }
    return json({ admins: await adminEmails(env), fixed: ADMIN_EMAILS_DEFAULT });
  }
  if (p === "/api/admin/purge-test" && req.method === "POST") {
    const db = await anaDb(env); const out = {};
    const subs = ((await db.prepare("SELECT DISTINCT sub FROM cvs WHERE sub LIKE 'test:%'").all()).results || []).map(r => r.sub);
    out.cvs = 0; for (const s of subs) out.cvs += await deleteCvsOf(env, s);
    out.events = (await db.prepare("DELETE FROM ev WHERE uid LIKE 'test:%' OR vid LIKE 'zztest%' OR vid IN (SELECT DISTINCT vid FROM ev WHERE uid LIKE 'test:%')").run()).meta.changes;
    const pb = await req.json().catch(() => ({})); if (Array.isArray(pb.vids)) for (const v of pb.vids.slice(0, 200)) out.events += (await db.prepare("DELETE FROM ev WHERE vid = ?").bind(String(v)).run()).meta.changes;
    out.email_data = await purgeEmailData(env, "test-session@fitwise.invalid");
    out.kv = (await env.DB.prepare("DELETE FROM kv WHERE k LIKE 'pl:u:test:%' OR k LIKE 'pl:d:zztest%' OR k LIKE 'udev:test:%' OR k LIKE 'd:d:zztest%'").run()).meta.changes;
    return json({ ok: true, deleted: out });
  }
  return null;
}

// ---------- /admin page (rendered only for an admin; data comes from /api/admin/*) ----------
function ADMIN_HTML(s) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Admin · Fitwise</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css">
<style>
body{background:#f6f5f1}.aw{max-width:1180px;margin:0 auto;padding:14px 14px 60px}
.atop{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}.atop h1{font-size:1.3rem;margin:0}.atop small{color:var(--mut)}
.tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px}.tabs button{all:unset;cursor:pointer;padding:8px 14px;border-radius:999px;background:#fff;border:1px solid var(--line);font-weight:650;font-size:.88rem;white-space:nowrap}.tabs button.on{background:var(--g);color:#fff;border-color:var(--g)}
.c{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin:0 0 12px;overflow-x:auto}.c h2{font-size:1rem;text-align:left;margin:0 0 10px}
.k{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:12px}.k div{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px}.k small{display:block;color:var(--mut);font-size:.72rem;text-transform:uppercase;font-weight:700;letter-spacing:.04em}.k b{font-size:1.6rem}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
table{width:100%;border-collapse:collapse;font-size:.84rem}th{text-align:left;color:var(--mut);font-weight:650;font-size:.75rem;text-transform:uppercase;padding:6px 6px;border-bottom:1px solid var(--line)}td{padding:6px;border-bottom:1px solid #eee;vertical-align:top}td.n{text-align:right;font-variant-numeric:tabular-nums}
.bar{height:8px;background:var(--g);border-radius:4px;display:block;min-width:2px}.fun td:first-child{white-space:nowrap}
.muted{color:var(--mut)}.pill{font-size:.72rem;border-radius:6px;padding:1px 6px;background:#f0eee8;border:1px solid var(--line)}.pill.r{background:#fbeaea;color:#a33}.pill.g{background:#e3f4ed;color:var(--g)}
#days{width:auto;min-width:160px}input[type=search],input[type=number],input[type=text],select{padding:8px 10px;border:1px solid var(--line);border-radius:9px;font:inherit;font-size:.9rem}
button.a{all:unset;cursor:pointer;color:var(--g);font-weight:650;margin-right:10px;font-size:.84rem}button.a.r{color:#a33}
.soon{border:1px dashed #d8c58a;background:#fffbea;border-radius:12px;padding:12px;color:#6b5a1f}
.chart{display:flex;align-items:flex-end;gap:2px;height:150px;padding-top:6px;border-bottom:1px solid var(--line)}.chart span{flex:1;background:var(--g);border-radius:3px 3px 0 0;position:relative;min-height:1px}.chart span i{position:absolute;bottom:0;left:0;right:0;background:#9fd3c0;border-radius:3px 3px 0 0}
.cx{display:flex;justify-content:space-between;font-size:.72rem;color:var(--mut);margin-top:4px}
.tl td{font-size:.8rem}.hide{display:none}
@media(max-width:800px){.k{grid-template-columns:repeat(2,1fr)}.g2,.g3{grid-template-columns:1fr}}
</style></head><body>
<div class="aw">
<div class="atop"><h1>Fitwise admin</h1><small>Signed in as ${gEsc(s.key ? "admin key" : s.email)} · <a href="/">Site</a> · <a href="#" id="out">Sign out</a></small></div>
<div class="tabs" id="tabs"><button data-t="ov" class="on">Overview</button><button data-t="ai">AI Models &amp; Keys</button><button data-t="us">Users</button><button data-t="cv">Resumes</button><button data-t="bi">Payments &amp; billing</button><button data-t="co">Content</button><button data-t="ex">Export</button></div>
<section id="ov"><div class="atop"><span class="muted" id="ovnote"></span><select id="days"><option value="7">Last 7 days</option><option value="30" selected>Last 30 days</option><option value="90">Last 90 days</option></select></div><div id="ovb">Loading…</div></section>
<section id="us" class="hide"><div class="c"><input type="search" id="uq" placeholder="Search email or name" style="width:min(340px,100%)"> <span class="muted" id="un"></span><div id="ul" style="margin-top:10px"></div></div><div id="ud"></div></section>
<section id="cv" class="hide"><div class="c"><h2>Uploaded CVs</h2><p class="muted" id="cvn"></p><input type="search" id="cq" placeholder="Search email or file name" style="width:min(340px,100%)"><div id="cvl" style="margin-top:10px"></div></div></section>
<section id="bi" class="hide"><div id="bib">Loading…</div></section>
<section id="co" class="hide"><div id="cob">Loading…</div></section>
<section id="ai" class="hide"><div id="aib">Loading AI cascade configuration…</div></section>
<section id="ex" class="hide"><div class="c"><h2>Export CSV</h2><p><a class="btn" href="/api/admin/export/users.csv">Users (CSV)</a></p><p><a class="btn ghost" href="/api/admin/export/events.csv?days=30">Events, last 30 days (CSV)</a> <a class="btn ghost" href="/api/admin/export/events.csv?days=90">Events, last 90 days (CSV)</a></p><p class="muted">Test sessions and your own admin visits are not counted. Raw events are kept ${EV_RAW_DAYS} days, then rolled up into daily totals.</p></div></section>
</div>
<script>
(function(){
var $=function(i){return document.getElementById(i)};var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var nf=function(n){return (n||0).toLocaleString()};var dt=function(t){return t?new Date(t).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):""};
var get=function(u){return fetch(u,{credentials:"same-origin",cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json()})};
var post=function(u,b){return fetch(u,{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(b)}).then(function(r){return r.json()})};
var loaded={};
document.querySelectorAll("#tabs button").forEach(function(b){b.onclick=function(){document.querySelectorAll("#tabs button").forEach(function(x){x.classList.toggle("on",x===b)});["ov","ai","us","cv","bi","co","ex"].forEach(function(t){$(t).classList.toggle("hide",t!==b.dataset.t)});if(!loaded[b.dataset.t]){loaded[b.dataset.t]=1;({ai:aiPanel,us:users,cv:cvs,bi:billing,co:content}[b.dataset.t]||function(){})()}}});
$("out").onclick=function(e){e.preventDefault();post("/api/auth/logout",{}).then(function(){location.href="/"})};
function tbl(rows,cols,empty){if(!rows||!rows.length)return '<p class="muted">'+(empty||"No data yet.")+'</p>';var mx=0;cols.forEach(function(c){if(c.bar)rows.forEach(function(r){mx=Math.max(mx,r[c.k]||0)})});
return "<table><tr>"+cols.map(function(c){return "<th>"+c.h+"</th>"}).join("")+"</tr>"+rows.map(function(r){return "<tr>"+cols.map(function(c){var v=c.f?c.f(r):esc(r[c.k]);if(c.bar)v='<span style="display:flex;gap:6px;align-items:center;justify-content:flex-end">'+nf(r[c.k])+'<span class="bar" style="width:'+Math.round(60*(r[c.k]||0)/(mx||1))+'px"></span></span>';return "<td"+(c.n?' class="n"':"")+">"+v+"</td>"}).join("")+"</tr>"}).join("")+"</table>"}
function card(t,h){return '<div class="c"><h2>'+t+"</h2>"+h+"</div>"}
function chart(d){if(!d.length)return '<p class="muted">No page views yet in this period.</p>';var mx=Math.max.apply(null,d.map(function(x){return x.pv}))||1;
return '<div class="chart">'+d.map(function(x){return '<span title="'+x.day+": "+x.pv+" page views, "+x.v+" visitors, "+x.signups+' sign-ups" style="height:'+Math.max(1,Math.round(100*x.pv/mx))+'%"><i style="height:'+Math.round(100*x.v/Math.max(1,x.pv))+'%"></i></span>'}).join("")+'</div><div class="cx"><span>'+d[0].day+"</span><span>dark = page views · light = visitors (hover for sign-ups)</span><span>"+d[d.length-1].day+"</span></div>"}
function overview(){$("ovb").innerHTML="Loading…";get("/api/admin/overview?days="+$("days").value).then(function(o){var t=o.totals;
$("ovnote").textContent="Since "+o.since+" (Amsterdam days). First-party data only; recording started 1 Nov 2026.";
var f=o.funnel,top=f[0].visitors||0;
$("ovb").innerHTML='<div class="k"><div><small>Visitors</small><b>'+nf(t.visitors)+'</b></div><div><small>Page views</small><b>'+nf(t.pageviews)+'</b></div><div><small>Sign-ups</small><b>'+nf(t.signups)+'</b></div><div><small>Active users</small><b>'+nf(t.active_users)+'</b></div><div><small>All users</small><b>'+nf(t.users_total)+"</b></div></div>"+
card("Page views per day",chart(o.daily))+
card("Conversion funnel (unique visitors)",'<table class="fun">'+f.map(function(s){return "<tr><td>"+esc(s.step)+'</td><td class="n">'+nf(s.visitors)+'</td><td style="width:45%"><span class="bar" style="width:'+(top?Math.round(100*s.visitors/top):0)+'%"></span></td><td class="n muted">'+(top?Math.round(100*s.visitors/top):0)+"%</td></tr>"}).join("")+"</table>")+
'<div class="g2">'+card("Top referrers",tbl(o.referrers,[{h:"Source",k:"k"},{h:"Visitors",k:"v",n:1,bar:1},{h:"Views",k:"n",n:1}]))+card("UTM campaigns",tbl(o.campaigns,[{h:"Source / medium",f:function(r){return esc(r.source)+(r.medium?" / "+esc(r.medium):"")}},{h:"Campaign",k:"campaign"},{h:"Visitors",k:"v",n:1,bar:1}],"No UTM-tagged visits yet."))+"</div>"+
'<div class="g2">'+card("Top pages",tbl(o.pages,[{h:"Page",k:"k"},{h:"Views",k:"n",n:1,bar:1},{h:"Visitors",k:"v",n:1}]))+card("Top jobs by Apply clicks",tbl(o.jobs,[{h:"Job",f:function(r){return esc(r.job||r.id)+' <a class="muted" href="/j/'+esc(r.id)+'" target="_blank">/j/'+esc(r.id)+"</a>"}},{h:"Clicks",k:"clicks",n:1,bar:1},{h:"People",k:"v",n:1}],"No Apply clicks in this period.")+'<p class="muted">All-time Apply clicks (counter since 1 Nov): '+nf(o.apply_clicks_all_time)+"</p>")+"</div>"+
'<div class="g3">'+card("Devices",tbl(o.devices,[{h:"Device",k:"k"},{h:"Visitors",k:"v",n:1,bar:1}]))+card("Operating systems",tbl(o.os,[{h:"OS",k:"k"},{h:"Visitors",k:"v",n:1,bar:1}]))+card("Browsers",tbl(o.browsers,[{h:"Browser",k:"k"},{h:"Visitors",k:"v",n:1,bar:1}]))+"</div>"+
'<div class="g2">'+card("Countries",tbl(o.countries,[{h:"Country",k:"k"},{h:"Visitors",k:"v",n:1,bar:1}]))+card("Most viewed jobs",tbl(o.job_views,[{h:"Job",f:function(r){return esc(r.job||r.id)}},{h:"Views",k:"views",n:1,bar:1}],"No job views in this period."))+"</div>"+
card("All events",tbl(o.events,[{h:"Event",k:"type"},{h:"Count",k:"n",n:1,bar:1}]));
}).catch(function(e){$("ovb").textContent="Could not load: "+e.message})}
$("days").onchange=overview;overview();
var uT;$("uq").oninput=function(){clearTimeout(uT);uT=setTimeout(users,300)};
function users(){get("/api/admin/users?q="+encodeURIComponent($("uq").value)).then(function(j){$("un").textContent=j.users.length+" users";
$("ul").innerHTML=tbl(j.users,[{h:"User",f:function(u){return '<a href="#" data-u="'+esc(u.sub)+'"><b>'+esc(u.email)+"</b></a><br><span class=muted>"+esc(u.name)+"</span> "+(u.admin?'<span class="pill g">admin</span>':"")+(u.status?'<span class="pill r">'+esc(u.status)+"</span>":"")}},{h:"Signed up",f:function(u){return dt(u.created)+"<br><span class=muted>"+esc(u.signup_path||u.source||"")+"</span>"}},{h:"Came from",f:function(u){return esc(u.first_src||u.first_ref||"")}},{h:"Last seen",f:function(u){return dt(u.last_seen||u.last_login)}},{h:"Sign-ins",k:"logins",n:1},{h:"Tailorings",k:"tailorings",n:1},{h:"Credits",f:function(u){return nf(u.credits)},n:1},{h:"CVs",k:"cvs",n:1}],"No users yet.");
document.querySelectorAll("[data-u]").forEach(function(a){a.onclick=function(e){e.preventDefault();user(a.dataset.u)}})}).catch(function(e){$("ul").textContent="Could not load: "+e.message})}
function user(sub){$("ud").innerHTML='<div class="c">Loading…</div>';get("/api/admin/user?sub="+encodeURIComponent(sub)).then(function(j){var u=j.user;
$("ud").innerHTML='<div class="c"><h2>'+esc(u.email)+" "+(u.status?'<span class="pill r">'+esc(u.status)+"</span>":"")+'</h2><p class="muted">'+esc(u.name)+" · signed up "+dt(u.created)+" · last sign-in "+dt(u.last_login)+" · "+nf(u.logins)+" sign-ins · first came from "+esc(u.first_src||u.first_ref||"unknown")+'</p><p>Credits: <b>'+nf(j.credits)+'</b> · pre-launch free tailoring used: <b>'+j.free_used+'</b> · tailorings: <b>'+j.tailorings.length+'</b></p>'+
'<p><input type="number" id="gd" value="10" style="width:90px"> <button class="a" id="gG">Grant credits</button><button class="a" id="gR">Reset free tailoring</button><button class="a" id="gB">'+(u.status==="blocked"?"Unblock":"Block")+'</button><button class="a r" id="gD">Delete user and data</button> <span id="gm" class="muted"></span></p></div>'+
'<div class="g2">'+card("Stored CVs",cvTable(j.cvs))+card("Credits ledger",tbl(j.ledger,[{h:"When",f:function(r){return dt(r.created)}},{h:"Change",k:"delta",n:1},{h:"Why",f:function(r){return esc(r.reason)+" <span class=muted>"+esc(r.ref)+"</span>"}}],"No credit movements."))+"</div>"+
card("Activity timeline (newest first; includes visits before sign-in from the same browser)",'<div class="tl">'+tbl(j.timeline,[{h:"When",f:function(r){return dt(r.ts)}},{h:"Event",k:"type"},{h:"Page",k:"path"},{h:"Detail",f:function(r){return esc([r.obj,r.meta].filter(Boolean).join(" · "))}},{h:"From",f:function(r){return esc([r.ref,r.us,r.uc].filter(Boolean).join(" · "))}},{h:"Device",f:function(r){return esc([r.dev,r.os,r.br,r.cc].filter(Boolean).join(" · "))}}],"No activity recorded.")+"</div>");
var act=function(b){post("/api/admin/user",Object.assign({sub:sub},b)).then(function(r){$("gm").textContent=r.ok?"Done.":(r.error||"Failed");if(r.ok)setTimeout(function(){user(sub);users()},400)})};
$("gG").onclick=function(){act({action:"grant",delta:$("gd").value,note:"admin page"})};$("gR").onclick=function(){act({action:"reset_free"})};
$("gB").onclick=function(){act({action:u.status==="blocked"?"unblock":"block"})};
$("gD").onclick=function(){var e=prompt("Type the user's email to delete the account and all its data:");if(e)act({action:"delete",confirm:e.trim().toLowerCase()})};bindCv();
$("ud").scrollIntoView({behavior:"smooth"})}).catch(function(e){$("ud").innerHTML='<div class="c">Could not load: '+esc(e.message)+"</div>"})}
function cvTable(l){return tbl(l,[{h:"File",f:function(c){return esc(c.filename)+"<br><span class=muted>"+(c.email?esc(c.email)+" · ":"")+esc(c.job||"")+"</span>"}},{h:"Uploaded",f:function(c){return dt(c.created)}},{h:"Size",f:function(c){return Math.max(1,Math.round(c.size/1024))+" KB"},n:1},{h:"",f:function(c){return '<a class="a" target="_blank" href="/api/admin/cv?id='+c.id+'">View</a> <a class="a" href="/api/admin/cv?dl=1&id='+c.id+'">Download</a> <button class="a r" data-dc="'+c.id+'">Delete</button>'}}],"No CVs stored.")}
function bindCv(){document.querySelectorAll("[data-dc]").forEach(function(b){b.onclick=function(){if(!confirm("Delete this CV?"))return;post("/api/admin/cv",{delete:b.dataset.dc}).then(function(){b.closest("tr").remove()})}})}
var cT;$("cq").oninput=function(){clearTimeout(cT);cT=setTimeout(cvs,300)};
function cvs(){get("/api/admin/cvs?q="+encodeURIComponent($("cq").value)).then(function(j){$("cvn").textContent=j.count+" CVs stored ("+Math.round(j.bytes/1024)+" KB). Each is deleted automatically "+j.retention_days+" days after upload; users can delete theirs on their Your data page.";$("cvl").innerHTML=cvTable(j.cvs);bindCv()}).catch(function(e){$("cvl").textContent="Could not load: "+e.message})}
function billing(){get("/api/admin/billing").then(function(b){
$("bib").innerHTML='<div class="c"><h2>Card payments</h2><div class="soon"><b>Coming soon.</b> No payment provider is connected and nothing is charged. Credit packs on the site ('+Object.keys(b.packs).map(function(k){return b.packs[k].credits+" for $"+b.packs[k].usd}).join(", ")+') collect interest only. Revenue, invoices and refunds will show here once payments are live.</div></div>'+
'<div class="k"><div><small>Credits outstanding</small><b>'+nf(b.credits_outstanding)+'</b></div><div><small>Accounts with credits</small><b>'+nf(b.balances.length)+'</b></div><div><small>Ledger rows</small><b>'+nf(b.ledger.length)+'</b></div><div><small>Purchase interest</small><b>'+nf(b.interest.filter(function(x){return x.list==="credits"}).length)+'</b></div><div><small>Autopilot waitlist</small><b>'+nf(b.interest.filter(function(x){return x.list==="autopilot"}).length)+"</b></div></div>"+
'<div class="g2">'+card("Credit balances",tbl(b.balances,[{h:"Email",k:"email"},{h:"Balance",k:"balance",n:1},{h:"Updated",f:function(r){return dt(r.updated)}}],"No credit balances."))+card("Credits by reason",tbl(b.by_reason,[{h:"Reason",k:"reason"},{h:"Rows",k:"rows",n:1},{h:"Credits",k:"credits",n:1}],"No credit movements yet."))+"</div>"+
card("Credit ledger (latest 300)",tbl(b.ledger,[{h:"When",f:function(r){return dt(r.created)}},{h:"Email",k:"email"},{h:"Change",k:"delta",n:1},{h:"Why",f:function(r){return esc(r.reason)+" <span class=muted>"+esc(r.ref)+"</span>"}}],"No credit movements yet."))+
card("Purchase interest and waitlists (no payment taken)",tbl(b.interest,[{h:"List",k:"list"},{h:"Email",k:"email"},{h:"Pack / bundle",k:"pack"},{h:"When",f:function(r){return dt(r.at)}}],"Nobody yet."))+
'<div class="c"><h2>Wallet top-ups, invoices, refunds</h2><div class="soon">Coming soon. Not built yet.</div></div>'}).catch(function(e){$("bib").textContent="Could not load: "+e.message})}
function aiPanel(){
  $("aib").innerHTML='<div class="c">Loading multi-provider free LLM cascade…</div>';
  get("/api/admin/llm").then(function(d){
    var st=d.status||{};
    var act=(st.ai_active_models||[]).map(function(x){return '<span class="pill g">'+esc(x.name)+' ('+esc(x.model)+')</span>'}).join(" ");
    var html='<div class="c"><h2>Free &amp; Open-Source Multi-Provider LLM Cascade</h2>'+
      '<p class="muted">Requests route automatically in speed+quality order (8s per-provider timeout + automatic cooldown skip on 429/exhaustion). Built-in deterministic engine runs as zero-cost final fallback so Fitwise never errors.</p>'+
      '<p><b>Active Cascade:</b> '+(act||'<span class="pill">No external keys yet — using built-in smart engine</span>')+' → <span class="pill">Built-in Engine</span></p></div>';
    html += '<div class="g2">' + (d.catalog||[]).map(function(spec){
      var cur=(d.providers||{})[spec.id]||{};
      var badge=cur.has_key?'<span class="pill g">Key Saved ('+esc(cur.key_hint)+')</span>':'<span class="pill">Not configured</span>';
      return '<div class="c" data-pid="'+esc(spec.id)+'">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px"><b>'+esc(spec.name)+'</b>'+badge+'</div>'+
        '<div style="display:grid;gap:8px">'+
          '<input type="password" class="aik" placeholder="'+(cur.has_key?'Leave blank to keep saved key, or paste new key':'Paste '+esc(spec.name)+' API key')+'" autocomplete="off">'+
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+
            '<input type="text" class="aim" value="'+esc(cur.model||spec.default_models[0]||"")+'" placeholder="Primary model">'+
            '<input type="text" class="aif" value="'+esc(cur.fallback_model||spec.default_models[1]||"")+'" placeholder="Secondary model (optional)">'+
          '</div>'+
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'+
            '<button class="btn sm aisave" type="button">Save Key</button>'+
            '<button class="btn sm ghost aitest" type="button">Test Connection</button>'+
            (cur.has_key?'<button class="a r aiclr" type="button">Remove</button>':'')+
            '<a class="muted" style="margin-left:auto;font-size:.8rem" href="'+esc(spec.signup)+'" target="_blank" rel="noopener">Get free key ↗</a>'+
          '</div>'+
          '<small class="aimsg muted"></small>'+
        '</div></div>';
    }).join("") + '</div>';
    html += '<div class="c"><h2>Email OTP Delivery (Optional Resend Key)</h2>'+
      '<p class="muted">Optional: add a free Resend API key to send 6-digit login codes via email. Without it, Email OTP shows an instant on-screen verification code.</p>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'+
        '<input type="password" id="rsk" placeholder="'+(d.mail&&d.mail.has_resend_key?'Resend key saved — enter new to replace':'re_...')+'" style="flex:1;min-width:200px">'+
        '<input type="text" id="rsf" value="'+esc((d.mail&&d.mail.from)||"Fitwise <noreply@fitwise.sites.tab.bot>")+'" style="flex:1;min-width:200px">'+
        '<button class="btn sm" id="rssave" type="button">Save Email Key</button>'+
      '</div><small id="rsmsg" class="muted"></small></div>';
    $("aib").innerHTML=html;
    document.querySelectorAll("#aib [data-pid]").forEach(function(box){
      var pid=box.getAttribute("data-pid"), msg=box.querySelector(".aimsg");
      box.querySelector(".aisave").onclick=function(){
        msg.textContent="Saving…";
        post("/api/admin/llm",{provider:pid,key:box.querySelector(".aik").value.trim(),model:box.querySelector(".aim").value.trim(),fallback_model:box.querySelector(".aif").value.trim(),enabled:true}).then(function(r){
          msg.textContent=r.ok?"Saved! Refreshing…":(r.error||"Failed"); if(r.ok)setTimeout(aiPanel,350);
        });
      };
      box.querySelector(".aitest").onclick=function(){
        msg.textContent="Testing live connection…";
        var kv=box.querySelector(".aik").value.trim()||"__KEEP__";
        post("/api/admin/llm",{action:"test",provider:pid,key:kv,model:box.querySelector(".aim").value.trim()}).then(function(r){
          msg.textContent=r.ok?("Connected! "+r.model+" replied: "+r.reply):("Error: "+(r.error||"failed"));
        });
      };
      var clr=box.querySelector(".aiclr");
      if(clr) clr.onclick=function(){ if(!confirm("Remove key for "+pid+"?"))return; post("/api/admin/llm",{provider:pid,clear:true}).then(aiPanel); };
    });
    $("rssave").onclick=function(){
      $("rsmsg").textContent="Saving…";
      post("/api/admin/llm",{action:"save_mail",resend_key:$("rsk").value.trim(),from:$("rsf").value.trim()}).then(function(r){$("rsmsg").textContent=r.ok?"Saved email provider!":(r.error||"Error")});
    };
  }).catch(function(e){$("aib").textContent="Could not load: "+e.message});
}
function content(){get("/api/admin/content").then(function(c){var e=c.events,jb=c.jobs;
$("cob").innerHTML='<div class="g2">'+card("Conferences &amp; Workshops (/events)","<p>Stored: <b>"+nf(e.stored)+"</b> · upcoming now: <b>"+nf(e.upcoming)+"</b> · open speaker calls: <b>"+nf(e.cfp_open)+"</b></p><p class=muted>List built: "+dt(e.generated_at)+" · pushed to Fitwise: "+dt(e.pushed_at)+"</p><p class=muted>Refresh: workshops_fetch.py, then node events_push.mjs</p>")+
card("Daily jobs feed (/jobs)","<p>Latest list: <b>"+esc(jb.latest||"none")+"</b> · email subscribers: <b>"+nf(jb.subscribers)+"</b> (sending: coming soon)</p>"+tbl(jb.feeds,[{h:"Date",k:"date"},{h:"Jobs",k:"count",n:1},{h:"Visa ✅",k:"visa",n:1},{h:"Pushed",f:function(r){return dt(r.pushed)}}]))+"</div>"+
card("Other","<p>Contact-form messages waiting: <b>"+nf(c.contact_messages)+"</b> · AI tailoring mode: <b>"+(c.ai_mode?"on":"off")+"</b></p>")}).catch(function(e){$("cob").textContent="Could not load: "+e.message})}
})();
</script></body></html>`;
}

// ---------- routing: gate first, then the existing app (FW_MAIN) ----------
async function afterSignin(req, env, pl, email, isNew, source) {
  try {
    const db = await anaDb(env); const c = REQ.get(req);
    const admin = (await adminEmails(env)).includes(email);
    if (isNew && c) {
      const ft = await db.prepare("SELECT us, um, uc, ref FROM ev WHERE vid = ? AND (us IS NOT NULL OR ref NOT IN ('(direct)', '(internal)')) ORDER BY ts LIMIT 1").bind(c.vid).first();
      const src = ft && ft.us ? [ft.us, ft.um, ft.uc].filter(Boolean).join(" / ") : null;
      await db.prepare("UPDATE users SET signup_path = ?, first_src = ?, first_ref = ? WHERE sub = ?").bind(String(source || "").slice(0, 160), src, ft ? ft.ref : null, pl.sub).run();
    }
    await track(req, "signin_ok", { sess: { sub: pl.sub, email, isAdmin: admin }, meta: { new_user: !!isNew }, path: String(source || "").split("?")[0].slice(0, 160) || null, ref: null });
  } catch (e) {}
}
async function gatedApi(p, req, env, ctx, s, url) {
  if (p === "/api/cv" && req.method === "POST") { if (s.key || (s.isAdmin && !s.test)) return json({ ok: true, stored: false, reason: "not stored for the owner's own account" }); return storeCv(req, env, s); }
  if (p === "/api/my/cvs") { const r = (await (await anaDb(env)).prepare("SELECT id, filename, mime, size, job, created FROM cvs WHERE sub = ? ORDER BY created DESC").bind(s.sub).all()).results || []; return json({ cvs: r, retention_days: CV_RETENTION_DAYS }); }
  if (p === "/api/my/cv" && req.method === "GET") { const id = String(url.searchParams.get("id") || ""); const m = await (await anaDb(env)).prepare("SELECT sub FROM cvs WHERE id = ?").bind(id).first(); if (!m || m.sub !== s.sub) return json({ error: "not found" }, 404); return cvResponse(env, id, true); }
  if (p === "/api/my/cv" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    if (b.delete === "all") return json({ ok: true, deleted: await deleteCvsOf(env, s.sub) });
    const m = await (await anaDb(env)).prepare("SELECT sub FROM cvs WHERE id = ?").bind(String(b.delete || "")).first(); if (!m || m.sub !== s.sub) return json({ error: "not found" }, 404);
    await deleteCv(env, String(b.delete)); track(req, "cv_delete"); return json({ ok: true });
  }
  if (p === "/api/my/delete-account" && req.method === "POST") {
    const b = await req.json().catch(() => ({})); if (b.confirm !== true) return json({ error: "need confirm" }, 400);
    if (s.key) return json({ error: "not for the admin key" }, 400);
    const out = s.test ? { cvs: await deleteCvsOf(env, s.sub) } : await deleteUser(env, s.sub, "deleted");
    const t = cookieOf(req, SESS_COOKIE); if (t && /^[a-f0-9]{64}$/.test(t)) await store(env).delete("sess:" + (await sha(t)));
    return json({ ok: true, deleted: out }, 200, { "set-cookie": sessCookie("", 0) });
  }
  if (["/api/tailor", "/api/credits", "/api/cover", "/api/download", "/api/usage"].includes(p) && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    b.email = String(s.email || "").toLowerCase(); // the signed-in Google account is the account
    if (p === "/api/tailor") {
      track(req, "tailor_start", { meta: [b.title, b.company].filter(Boolean).join(" @ ").slice(0, 160) || null });
      if (PRELAUNCH_FREE > 0 && (await kvNum(env, "pl:u:" + s.sub)) >= PRELAUNCH_FREE) { track(req, "tailor_blocked", { meta: "prelaunch: account already used its free tailoring" }); return json({ error: PRELAUNCH_MSG, code: "prelaunch_used", limit: PRELAUNCH_FREE }, 429); }
    }
    const h = new Headers(req.headers); h.delete("content-length");
    const r2 = new Request(req.url, { method: "POST", headers: h, body: JSON.stringify(b) }); REQ.set(r2, REQ.get(req));
    const res = await FW_MAIN.fetch(r2, env, ctx);
    if (p === "/api/tailor") {
      if (res.status === 200) {
        let j = {}; try { j = await res.clone().json(); } catch (e) {}
        if (PRELAUNCH_FREE > 0) await bump(env, "pl:u:" + s.sub);
        const dev = String(b.device || "").slice(0, 64);
        if (dev) { let d = []; try { d = JSON.parse((await store(env).get("udev:" + s.sub)) || "[]"); } catch (e) {} if (!d.includes(dev)) { d = d.concat(dev).slice(-10); await store(env).put("udev:" + s.sub, JSON.stringify(d)); } }
        track(req, "tailor_done", { obj: j.jobId || null, meta: [b.title, b.company].filter(Boolean).join(" @ ").slice(0, 160) || null });
      } else if (res.status === 429) track(req, "tailor_blocked", { meta: "limit" });
      else track(req, "tailor_error", { meta: "HTTP " + res.status });
    }
    if (p === "/api/download" && res.status === 200) track(req, "download", { obj: b.jobId || null, meta: b.format || null });
    if (p === "/api/cover" && res.status === 200) track(req, "cover_letter", { obj: b.jobId || null });
    return res;
  }
  if ((p === "/api/early-access" || p === "/api/credits/buy") && req.method === "POST") {
    const res = await FW_MAIN.fetch(req, env, ctx);
    if (res.status === 200) track(req, p === "/api/early-access" ? "waitlist_join" : "buy_interest");
    return res;
  }
  if (p === "/api/jobs/subscribe" && req.method === "POST") { const res = await FW_MAIN.fetch(req, env, ctx); if (res.status === 200) track(req, "jobs_subscribe"); return res; }
  return FW_MAIN.fetch(req, env, ctx);
}
async function fwRoute(req, env, ctx) {
  const url = new URL(req.url); const p = url.pathname;
  if (ctx && ctx.waitUntil) ctx.waitUntil(gateSweep(env));
  if (p === "/admin" || p === "/admin/") {
    const s = await currentSession(req, env);
    if (!s || !s.isAdmin) return notFound(env, req);
    return new Response(ADMIN_HTML(s), { headers: { "content-type": "text/html; charset=utf-8", ...NOSTORE, "x-robots-tag": "noindex", "x-frame-options": "DENY" } });
  }
  if (p.startsWith("/api/admin/")) {
    if (!(await isAdmin(req))) return json({ error: "not found" }, 404);
    const r = await routeAdmin(p, req, env, url); if (r) return r;
    return FW_MAIN.fetch(req, env, ctx);
  }
  if (p === "/api/hit" && req.method === "POST") {
    const t = await req.text(); let b = null;
    if (t.length < 3000) { try { b = JSON.parse(t); } catch (e) {} }
    if (b && HIT_TYPES.includes(b.t)) { let u = null; try { u = new URL(String(b.u || "")); if (u.host !== url.host) u = null; } catch (e) {} if (u) await track(req, b.t, { url: u.toString(), ref: b.t === "pageview" ? String(b.r || "") : null, obj: b.o || null, meta: b.m || null }); }
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  }
  if (p === "/api/jobs/teaser" && req.method === "GET") {
    const f = await getFeed(env, null); if (!f) return json({ error: "no list" }, 404);
    const top = f.jobs.filter(x => x.visa).concat(f.jobs.filter(x => !x.visa)).slice(0, 3).map(x => ({ id: x.id || null, title: x.title, company: x.company, city: x.city, country: x.country, visa: !!x.visa }));
    return json({ date: f.date, count: f.jobs.length, visa: f.jobs.filter(x => x.visa).length, top });
  }
  if (p === "/api/auth/test-login" && req.method === "GET") { // one-time link minted by /api/admin/test-session (admin key), for checking the signed-in view in a browser
    const lk = String(url.searchParams.get("k") || ""); const t = /^[a-z0-9]{24}$/.test(lk) ? await store(env).get("tlogin:" + lk) : null;
    if (!t) return notFound(env, req);
    await store(env).delete("tlogin:" + lk);
    const next = /^\/[A-Za-z0-9/_\-?=&%.]*$/.test(url.searchParams.get("next") || "") ? url.searchParams.get("next") : "/jobs";
    return new Response(null, { status: 302, headers: { location: next, "set-cookie": sessCookie(t, 3600), ...NOSTORE } });
  }
  if (p === "/api/auth/logout" && req.method === "POST") { const s = await currentSession(req, env); if (s) await track(req, "signout", { sess: s }); return FW_MAIN.fetch(req, env, ctx); }
  const k = p.length > 1 ? p.replace(/\/+$/, "") : p;
  if (k === "/tailor.html" || k === "/pricing.html") return Response.redirect(new URL(k.slice(0, -5) + url.search, req.url).toString(), 301);
  if (k === "/conferences") return Response.redirect(new URL("/events", req.url).toString(), 301);
  const jm = p.match(/^\/j\/([A-Za-z0-9]{1,16})(\/go)?\/?$/);
  if (jm && req.method === "GET") {
    const j = await getJobById(env, jm[1].toLowerCase());
    if (j) track(req, jm[2] ? "apply_click" : "job_view", { obj: j.id, meta: (j.title + " – " + j.company).slice(0, 200) });
    const r = await FW_MAIN.fetch(req, env, ctx);
    if (jm[2]) return r;
    const h = new Headers(r.headers); h.set("x-fitwise-gate", "0");
    return new Response(r.body, { status: r.status, headers: h });
  }
  if ((k === "/jobs" || k.startsWith("/jobs/")) && req.method === "GET") {
    const r = await FW_MAIN.fetch(req, env, ctx);
    const h = new Headers(r.headers); h.set("x-fitwise-gate", "0");
    return new Response(r.body, { status: r.status, headers: h });
  }
  if (k === "/events" && req.method === "GET") {
    const s = await currentSession(req, env);
    const r = await FW_MAIN.fetch(req, env, ctx);
    if (s) track(req, "events_view");
    return privateResp(r, s);
  }
  if (k === "/account" && req.method === "GET") {
    const s = await currentSession(req, env);
    if (!s) { const g = await gateFor(k, req, env); if (g) return g; return notFound(env, req); }
    return privateResp(new Response(accountHTML(s), { headers: { "content-type": "text/html; charset=utf-8" } }), s);
  }
  if (p.startsWith("/api/") && (GATED_API.includes(p) || p === "/api/cv" || p.startsWith("/api/my/"))) {
    const s = await currentSession(req, env);
    if (!s) return json({ error: "Sign in with Google to continue.", code: "signin_required" }, 401);
    return gatedApi(p, req, env, ctx, s, url);
  }
  return FW_MAIN.fetch(req, env, ctx);
}
export default {
  async fetch(req, env, ctx) {
    const c = reqCtx(req, env, ctx);
    let res;
    try { res = await fwRoute(req, env, ctx); } catch (e) { res = new Response("Something went wrong on our side. Please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }); }
    if (c.newVid && res && !isBot(req.headers.get("user-agent") || "")) { try { res = new Response(res.body, res); res.headers.append("set-cookie", `${VID_COOKIE}=${c.vid}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`); } catch (e) {} }
    if (c.clearVid && res) { try { res = new Response(res.body, res); res.headers.append("set-cookie", `${VID_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Lax`); } catch (e) {} }
    return res;
  }
};
