
// ---------- Conferences & Workshops (/events) behind Google sign-in — added 1 Nov 2026 ----------
// Data: kv "events:data" (pushed by events_push.mjs from files/job-hunt/workshops/events.json). Readable only with a valid session.
// Sign-in: Google Identity Services ID token -> verified here (RS256 against Google's JWKS, aud = client id) -> users table + session cookie.
const GOOGLE_CLIENT_ID_DEFAULT = "1024830327613-9fgve3b6lhtmbpl9ac13dn6uumaflj16.apps.googleusercontent.com";
const SESS_COOKIE = "fw_sess";
const SESS_TTL = 30 * 86400;
async function googleClientId(env) { try { return (await store(env).get("cfg:google_client_id")) || GOOGLE_CLIENT_ID_DEFAULT; } catch (e) { return GOOGLE_CLIENT_ID_DEFAULT; } }
function b64uBytes(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function b64uJSON(s) { return JSON.parse(new TextDecoder().decode(b64uBytes(s))); }
let _jwks = null, _jwksAt = 0;
async function googleJwks(force) {
  if (!force && _jwks && Date.now() - _jwksAt < 3600e3) return _jwks;
  const r = await fetch("https://www.googleapis.com/oauth2/v3/certs", force ? {} : { cf: { cacheTtl: 3600 } });
  if (!r.ok) throw new Error("jwks " + r.status);
  _jwks = await r.json(); _jwksAt = Date.now(); return _jwks;
}
async function verifyGoogleIdToken(tok, aud) {
  const parts = String(tok || "").split("."); if (parts.length !== 3) throw new Error("malformed token");
  const hdr = b64uJSON(parts[0]), pl = b64uJSON(parts[1]);
  if (hdr.alg !== "RS256" || !hdr.kid) throw new Error("bad alg");
  let jwk = (await googleJwks(false)).keys.find(k => k.kid === hdr.kid);
  if (!jwk) jwk = (await googleJwks(true)).keys.find(k => k.kid === hdr.kid);
  if (!jwk) throw new Error("unknown key");
  const key = await crypto.subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64uBytes(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
  if (!ok) throw new Error("bad signature");
  const now = Math.floor(Date.now() / 1000);
  if (pl.iss !== "accounts.google.com" && pl.iss !== "https://accounts.google.com") throw new Error("bad issuer");
  if (pl.aud !== aud) throw new Error("bad audience");
  if (!pl.exp || pl.exp < now - 60) throw new Error("expired");
  if (pl.iat && pl.iat > now + 300) throw new Error("issued in the future");
  if (!pl.sub || !pl.email || !(pl.email_verified === true || pl.email_verified === "true")) throw new Error("email not verified");
  return pl;
}
let _usersReady = false;
async function usersDb(env) {
  const db = env.DB;
  if (!_usersReady) { await db.prepare("CREATE TABLE IF NOT EXISTS users (sub TEXT PRIMARY KEY, email TEXT, name TEXT, picture TEXT, provider TEXT, source TEXT, created INTEGER, last_login INTEGER, logins INTEGER DEFAULT 1)").run(); _usersReady = true; }
  return db;
}
function cookieOf(req, name) { const c = req.headers.get("cookie") || ""; const m = c.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)")); return m ? decodeURIComponent(m[1]) : null; }
async function sessionOf(req, env) {
  const t = cookieOf(req, SESS_COOKIE); if (!t || !/^[a-f0-9]{64}$/.test(t)) return null;
  const v = await store(env).get("sess:" + (await sha(t))); if (!v) return null;
  try { return JSON.parse(v); } catch (e) { return null; }
}
async function newSession(env, user, ttl) {
  const b = new Uint8Array(32); crypto.getRandomValues(b); const t = [...b].map(x => x.toString(16).padStart(2, "0")).join("");
  await store(env).put("sess:" + (await sha(t)), JSON.stringify({ sub: user.sub, email: user.email, name: user.name || "", at: new Date().toISOString(), test: !!user.test, admin: !!(user.test && user.admin) }), { expirationTtl: ttl || SESS_TTL });
  return t;
}
const sessCookie = (t, maxAge) => `${SESS_COOKIE}=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
async function eventsData(env) { const v = await store(env).get("events:data"); return v ? JSON.parse(v) : null; }
function evToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function evUpcoming(d) { const t = evToday(); return ((d && d.events) || []).filter(e => (e.end || e.start) >= t); }
function evCfpOpen(e) { const c = e.cfp || {}; return c.status === "Open" && !(c.deadline && c.deadline < evToday()); }
const EV_TOPICS = ["Testing/QA", "Test automation", "AI/ML", "DevOps/Cloud", "SRE/Observability", "Security", "Data", "Software engineering", "Java/JVM", "Agile/Product", "Accessibility", "General tech"];

async function routeEvents(p, req, env, url) {
  if (p === "/api/auth/config" && req.method === "GET") return json({ client_id: await googleClientId(env) });
  if (p === "/api/auth/google" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const ip = req.headers.get("cf-connecting-ip") || "0", day = new Date().toISOString().slice(0, 10);
    const kI = "q:g:" + (await sha(ip)).slice(0, 24) + ":" + day;
    if ((await kvNum(env, kI)) >= 60) return json({ error: "Too many sign-in attempts from this network today." }, 429);
    await bump(env, kI, 172800);
    let pl; try { pl = await verifyGoogleIdToken(b.credential, await googleClientId(env)); } catch (e) { track(req, "signin_fail", { meta: String(e.message || e).slice(0, 60), path: String(b.source || "").split("?")[0].slice(0, 160) || null, ref: null }); return json({ error: "Google sign-in could not be verified. Please try again.", detail: String(e.message || e).slice(0, 60) }, 401); }
    const email = String(pl.email).toLowerCase(), name = String(pl.name || "").slice(0, 120), now = Date.now();
    const ust = await store(env).get("ust:" + pl.sub);
    if (ust === "blocked") { track(req, "signin_fail", { meta: "blocked", ref: null }); return json({ error: "This account can't sign in. If you think this is a mistake, write to us from the contact page." }, 403); }
    if (ust) await store(env).delete("ust:" + pl.sub);
    const db = await usersDb(env);
    const had = await db.prepare("SELECT sub FROM users WHERE sub = ?").bind(pl.sub).first();
    if (had) await db.prepare("UPDATE users SET email = ?, name = ?, picture = ?, last_login = ?, logins = COALESCE(logins, 0) + 1 WHERE sub = ?").bind(email, name, String(pl.picture || "").slice(0, 300), now, pl.sub).run();
    else { await db.prepare("INSERT INTO users (sub, email, name, picture, provider, source, created, last_login, logins) VALUES (?, ?, ?, ?, 'google', ?, ?, ?, 1)").bind(pl.sub, email, name, String(pl.picture || "").slice(0, 300), String(b.source || "events").split("?")[0].slice(0, 60), now, now).run(); await bump(env, "stat:signups"); }
    await afterSignin(req, env, pl, email, !had, b.source);
    const t = await newSession(env, { sub: pl.sub, email, name });
    return json({ ok: true, new_user: !had, user: { email, name } }, 200, { "set-cookie": sessCookie(t, SESS_TTL) });
  }
  if (p === "/api/auth/logout" && req.method === "POST") {
    const t = cookieOf(req, SESS_COOKIE); if (t && /^[a-f0-9]{64}$/.test(t)) await store(env).delete("sess:" + (await sha(t)));
    return json({ ok: true }, 200, { "set-cookie": sessCookie("", 0) });
  }
  if (p === "/api/me" && req.method === "GET") { const s = await currentSession(req, env); return s ? json({ signed_in: true, user: { email: s.email, name: s.name } }) : json({ signed_in: false }, 401); }
  if (p === "/api/events" && req.method === "GET") {
    const s = await currentSession(req, env); if (!s) return json({ error: "Sign in with Google to see the events." }, 401);
    const d = await eventsData(env); if (!d) return json({ error: "The events list is being refreshed. Please check back soon." }, 503);
    return json({ generated_at: d.generated_at, events: evUpcoming(d) }, 200, { "cache-control": "private, no-store" });
  }
  if (p.startsWith("/api/admin/events") || p === "/api/admin/signups" || p === "/api/admin/google" || p === "/api/admin/test-session") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    if (p === "/api/admin/events") {
      if (req.method === "POST") {
        const b = await req.json().catch(() => null); if (!b || !Array.isArray(b.events)) return json({ error: "need {events:[...]}" }, 400);
        const ev = b.events.filter(e => e && e.name && e.start && /^https?:\/\//.test(e.url || "") && /^\d{4}-\d{2}-\d{2}$/.test(e.start));
        await store(env).put("events:data", JSON.stringify({ generated_at: b.generated_at || new Date().toISOString(), pushed_at: new Date().toISOString(), events: ev }));
        const d = await eventsData(env); const up = evUpcoming(d);
        return json({ ok: true, stored: ev.length, upcoming: up.length, cfp_open: up.filter(evCfpOpen).length });
      }
      const d = await eventsData(env); const up = evUpcoming(d);
      return json({ generated_at: d && d.generated_at, pushed_at: d && d.pushed_at, stored: d ? d.events.length : 0, upcoming: up.length, cfp_open: up.filter(evCfpOpen).length });
    }
    if (p === "/api/admin/signups") {
      const db = await usersDb(env);
      if (req.method === "POST") { const b = await req.json().catch(() => ({})); if (b.delete_email) { const r = await db.prepare("DELETE FROM users WHERE email = ?").bind(String(b.delete_email).toLowerCase()).run(); return json({ ok: true, deleted: r.meta.changes }); } return json({ error: "need delete_email" }, 400); }
      const n = await db.prepare("SELECT COUNT(*) AS n FROM users").first();
      const r = await db.prepare("SELECT email, name, provider, source, created, last_login, logins FROM users ORDER BY created DESC LIMIT 200").all();
      return json({ count: n ? n.n : 0, users: (r.results || []).map(u => ({ ...u, created: new Date(u.created).toISOString(), last_login: new Date(u.last_login).toISOString() })) });
    }
    if (p === "/api/admin/google" && req.method === "POST") { const b = await req.json().catch(() => ({})); if (b.clear) { await store(env).delete("cfg:google_client_id"); return json({ ok: true, client_id: GOOGLE_CLIENT_ID_DEFAULT }); } if (!/^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(String(b.client_id || ""))) return json({ error: "need client_id" }, 400); await store(env).put("cfg:google_client_id", b.client_id); return json({ ok: true, client_id: b.client_id }); }
    if (p === "/api/admin/test-session" && req.method === "POST") { const tb = await req.json().catch(() => ({})); const t = await newSession(env, { sub: "test:" + crypto.randomUUID(), email: "test-session@fitwise.invalid", name: "Test session", test: true, admin: tb.admin === true }, 3600); const lk = rid(24); await store(env).put("tlogin:" + lk, t, { expirationTtl: 300 }); return json({ ok: true, cookie: SESS_COOKIE + "=" + t, expires_in: 3600, login_path: "/api/auth/test-login?k=" + lk }); }
  }
  return null;
}

const EV_CSS = `<style>
.evw{max-width:1040px;margin:0 auto;padding:26px 16px 50px}
.evh h1{font-size:1.75rem;margin:.2em 0 .25em}.evh p{color:var(--mut);margin:0 0 .4em;max-width:760px}
.evh .src{font-size:.85rem}
.evk{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:18px 0}
.evk button,.evk div{all:unset;box-sizing:border-box;cursor:pointer;background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column}
.evk div{cursor:default}.evk button:hover{border-color:var(--g)}
.evk small{color:var(--mut);font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;font-weight:700}.evk b{font-size:1.6rem;line-height:1.15;color:var(--ink)}.evk span{color:var(--mut);font-size:.78rem}
.evk .hot b{color:var(--g)}
.evc{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin:0 0 16px}
.evc h2{text-align:left;font-size:1.1rem;margin:0 0 10px;display:flex;justify-content:space-between;gap:8px;align-items:baseline;flex-wrap:wrap}.evc h2 small{color:var(--mut);font-weight:500;font-size:.82rem}
.evs{display:flex;align-items:flex-start;gap:10px;overflow-x:auto;padding-bottom:6px;scroll-snap-type:x mandatory}
.evcf{flex:0 0 250px;scroll-snap-align:start;background:#f2faf7;border:1px solid #bfe3d7;border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:4px;text-decoration:none;color:var(--ink)}
.evcf .dl{font-size:.8rem;font-weight:800;color:var(--g)}.evcf .dl.soon{color:var(--warn)}.evcf b{font-size:.95rem;line-height:1.25}.evcf span{font-size:.8rem;color:var(--mut)}
.evf{display:flex;flex-direction:column;gap:10px}.evr{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.evf input[type=search],.evf select{padding:10px 11px;border-radius:10px;border:1px solid var(--line);background:#fff;color:var(--ink);font:inherit;font-size:.92rem;min-height:42px}
.evf input[type=search]{flex:1 1 230px;min-width:0}.evf select{flex:0 1 auto;max-width:100%}
.chip{border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:999px;padding:8px 13px;font:inherit;font-size:.86rem;font-weight:600;cursor:pointer;white-space:nowrap;min-height:38px}
.chip.on{background:var(--g);border-color:var(--g);color:#fff}.chip .mu{opacity:.65;font-weight:500}
.evt{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}
.evm{font-size:.85rem;color:var(--mut)}.evm button{all:unset;cursor:pointer;color:var(--g);font-weight:600;margin-left:8px}
.evmon{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin:18px 0 4px;padding-bottom:5px;border-bottom:1px solid var(--line)}.evmon:first-child{margin-top:4px}
.eve{display:grid;grid-template-columns:58px 1fr;gap:12px;padding:12px 0;border-bottom:1px dashed var(--line)}.eve:last-child{border-bottom:0}
.evd{background:#f2faf7;border:1px solid #d5ebe3;border-radius:12px;text-align:center;padding:6px 0;height:max-content}
.evd small{display:block;font-size:.68rem;font-weight:800;color:var(--g);text-transform:uppercase}.evd b{display:block;font-size:1.35rem;line-height:1.1}.evd em{display:block;font-style:normal;font-size:.68rem;color:var(--mut)}
.evb{min-width:0}.evb a.t{font-weight:700;font-size:1rem;color:var(--ink);text-decoration:none;line-height:1.3;word-break:break-word}.evb a.t:hover{color:var(--g);text-decoration:underline}
.evl{font-size:.85rem;color:var(--mut);margin-top:2px}
.evp{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.pill{font-size:.74rem;font-weight:650;border-radius:7px;padding:2px 8px;background:#f4f2ec;border:1px solid var(--line);color:#3b404a;white-space:nowrap}
.pill.inp{color:#1d5fb8;background:#eef4fc;border-color:#d3e2f6}.pill.vir{color:#6a3fb5;background:#f4effc;border-color:#e0d4f5}.pill.hyb{color:#0b7a8a;background:#ecf8f9;border-color:#cbe9ec}
.pill.free{color:var(--g);background:#eaf6f1;border-color:#c9e7dc}.pill.nl{color:#b4531a;background:#fdf3ea;border-color:#f3dcc6}.pill.tp{background:transparent}
.evcp{margin-top:8px;font-size:.85rem;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.cfp{font-weight:700;border-radius:8px;padding:3px 9px;font-size:.8rem}
.cfp.open{background:#e3f4ed;color:var(--g);border:1px solid #9fd3c0}.cfp.closed{color:#8a3b3b;background:#fbf1f1;border:1px solid #efd3d3;font-weight:600}.cfp.ns{color:var(--mut);border:1px solid var(--line);font-weight:500}
.evcp a.ap{color:var(--g);font-weight:800;text-decoration:none}.evn{font-size:.8rem;color:var(--mut);margin-top:4px}
.evempty{color:var(--mut);padding:22px 0;text-align:center}
.evmore{display:block;margin:14px auto 0}
.evu{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:.86rem;color:var(--mut);margin:8px 0 0}.evu button{all:unset;cursor:pointer;color:var(--g);font-weight:700}
/* gate */
.gate{position:relative;margin-top:6px}
.gate .ghost{filter:blur(5px);opacity:.75;pointer-events:none;user-select:none}
.bar{display:inline-block;height:.85em;border-radius:5px;background:#d9d5ca;vertical-align:middle}
.gatebox{position:absolute;left:50%;top:44px;transform:translateX(-50%);width:min(440px,92%);background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 18px 50px rgba(20,30,25,.16);padding:22px 20px;text-align:center}
.gatebox h2{font-size:1.25rem;margin:0 0 6px;text-align:center}.gatebox p{color:var(--mut);margin:0 0 14px;font-size:.93rem}
.gatebox .gbtn{display:flex;justify-content:center;min-height:44px}.gatebox .fine{font-size:.76rem;color:var(--mut);margin:12px 0 0}
.gatebox .err{color:#a33;font-size:.85rem;margin:10px 0 0;min-height:1em}
body.signed .gate{display:none}body:not(.signed) #evApp{display:none}
.xl2{display:inline}@media(max-width:760px){.evk{grid-template-columns:repeat(3,1fr);gap:8px}.evk b{font-size:1.3rem}.evk span{display:none}.evk>:nth-child(n+4){grid-column:span 1}
.evw{padding-top:18px}.evh h1{font-size:1.45rem}.evc{padding:12px}.eve{grid-template-columns:48px 1fr;gap:10px}.evd b{font-size:1.15rem}.evf select{flex:1 1 45%}.gatebox{top:24px}}
</style>`;

function evEsc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function eventsHTML(d, signed, clientId) {
  const up = evUpcoming(d); const n = up.length, open = up.filter(evCfpOpen).length;
  const cnt = r => up.filter(e => e.region === r).length;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const tc = {}; up.forEach(e => (e.topics || []).forEach(t => tc[t] = (tc[t] || 0) + 1));
  const topicsLine = EV_TOPICS.filter(t => tc[t]).slice(0, 8).map(t => `<span class="pill">${evEsc(t)} · ${tc[t]}</span>`).join(" ");
  // teaser cards: date, format and region only; names are not sent to signed-out visitors
  const ghost = up.slice(0, 5).map((e, i) => { const [y, m, dd] = e.start.split("-").map(Number); const fc = e.format === "Virtual" ? "vir" : e.format === "Hybrid" ? "hyb" : "inp";
    return `<div class="eve"><div class="evd"><small>${MON[m - 1]}</small><b>${dd}</b><em>&nbsp;</em></div><div class="evb"><span class="bar" style="width:${55 + (i * 13) % 35}%"></span><div class="evl"><span class="bar" style="width:${30 + (i * 17) % 25}%;height:.7em"></span></div><div class="evp"><span class="pill ${fc}">${evEsc(e.format)}</span><span class="pill">${evEsc(e.kind || "Event")}</span>${e.region === "NL" ? '<span class="pill nl">NL</span>' : ""}${evCfpOpen(e) ? '<span class="pill free">🎤 Speaker call open</span>' : ""}</div></div></div>`; }).join("");
  const kpi = (l, v, s, act, cls) => `<${signed ? "button type=\"button\"" : "div"} class="${cls || ""}" data-act="${act}"><small>${l}</small><b>${v}</b><span>${s}</span></${signed ? "button" : "div"}>`;
  const kpis = kpi("Upcoming", n, "from today", "all") + kpi("Netherlands", cnt("NL"), "in NL", "NL") + kpi("Europe", cnt("Europe"), "rest of Europe", "Europe") + kpi("Online", cnt("Online"), "virtual", "Online") + kpi("🎤 Speaker calls", open, "open now", "mic", "hot");
  const desc = `${n} upcoming IT conferences, workshops and meetups in the Netherlands, Europe and online, with ${open} open speaker calls. Free with Google sign-in.`;
  const body = `<div class="evw">
<div class="evh"><span class="eyebrow">Conferences &amp; Workshops</span><h1>IT conferences, workshops and meetups: NL, Europe and online</h1>
<p>Upcoming events for testing/QA, test automation, AI/ML, DevOps and cloud, observability, security, data and software engineering. Nearest date first; past events drop off automatically. Open calls for speakers are listed with their deadlines.</p>
<p class="src muted">Speaker-call status comes only from the event's own call-for-papers page or its public listing; when no source says, it shows "not stated". Looking for a job? See <a href="/jobs">today's jobs in Europe</a>.</p></div>
<div class="evk" id="evKpi">${kpis}</div>
<div class="gate" id="evGate">
  <div class="evc ghost" aria-hidden="true"><h2>Upcoming events <small>${n} events</small></h2>${ghost}</div>
  <div class="gatebox" role="region" aria-label="Sign in to see all events"><h2>Sign in to see all ${n} events</h2>
    <p>Free. Sign in with Google to see every event, the ${open} open speaker calls with deadlines, and the filters (in person / virtual, NL / Europe / online, topic).</p>
    <div class="gbtn" id="gBtn"><noscript>Turn on JavaScript to sign in with Google.</noscript></div>
    <div class="err" id="gErr" role="alert"></div>
    <p class="fine">We store your Google email and name to create your free Fitwise account. No password, no posting. <a href="/privacy">Privacy</a></p>
    <div style="margin-top:10px">${topicsLine}</div></div>
</div>
<div id="evApp">
  <div class="evc"><h2>🎤 Open speaker calls <small id="evCfpN"></small></h2><div class="evs" id="evStrip"></div></div>
  <div class="evc" id="evListCard">
    <div class="evf">
      <div class="evr"><input type="search" id="evQ" placeholder="Search event, city, topic…" aria-label="Search events">
        <button type="button" class="chip" id="evMic">🎤 Speaker call open</button>
        <span class="evr" id="evFmt"><button type="button" class="chip" data-f="inperson">In person</button><button type="button" class="chip" data-f="virtual">Virtual</button></span></div>
      <div class="evr">
        <select id="evRegion" aria-label="Where"><option value="all">NL + Europe + Online</option><option value="NL">NL only</option><option value="NLEU">NL + Europe (in person)</option><option value="Europe">Rest of Europe</option><option value="Online">Online only</option></select>
        <select id="evKind" aria-label="Type"><option value="all">All types</option><option value="Conference">Conferences</option><option value="Meetup">Meetups &amp; workshops</option></select>
        <select id="evSort" aria-label="Sort"><option value="date">Nearest date first</option><option value="cfp">Speaker deadline first</option></select></div>
      <div class="evt" id="evTopics"></div>
      <div class="evm"><span id="evCount"></span><button type="button" id="evReset">Reset filters</button></div>
    </div>
    <div id="evList" style="margin-top:8px"><div class="evempty">Loading events…</div></div>
  </div>
  <div class="evu"><span id="evUpd"></span><span id="evWho"></span></div>
</div>
</div>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>IT Conferences &amp; Workshops in NL, Europe and online · Fitwise</title>
<meta name="description" content="${evEsc(desc)}">
<link rel="canonical" href="${JOBS_SITE}/events">
<meta property="og:type" content="website"><meta property="og:site_name" content="Fitwise"><meta property="og:title" content="IT Conferences &amp; Workshops · Fitwise"><meta property="og:description" content="${evEsc(desc)}"><meta property="og:url" content="${JOBS_SITE}/events"><meta property="og:image" content="${JOBS_SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css"><meta name="theme-color" content="#0b6b58">
${EV_CSS}
</head><body class="events${signed ? " signed" : ""}">
<a class="skip" href="#main">Skip to content</a>
${SITE_HEADER}
<main id="main">${body}</main>
${SITE_FOOTER}
<script>window.FW_GCID=${JSON.stringify(clientId)};</script>
<script src="/events.js?v=3" defer></script>
<script src="https://accounts.google.com/gsi/client" async defer onload="window.fwGsiReady&&window.fwGsiReady()"></script>
</body></html>`;
  return html;
}
async function eventsPage(p, req, env) {
  if (p !== "/events" && p !== "/events/") return null;
  const d = await eventsData(env);
  const s = await currentSession(req, env);
  if (!s) track(req, "gate_shown", { meta: { page: "events" } });
  const app = s ? "" : inAppName(req.headers.get("user-agent") || "");
  if (app) track(req, "inapp_hint", { meta: { app } });
  return new Response(eventsHTML(d, !!s, await googleClientId(env)).replace('<div class="gatebox" role="region" aria-label="Sign in to see all events">', '<div class="gatebox" role="region" aria-label="Sign in to see all events">' + (app ? inAppBox(app, req) : "")), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store" } });
}
