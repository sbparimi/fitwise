
// ---------- storage adapter: KV, D1 or R2, same tiny interface ----------
let _tableReady = false;
function store(env) {
  if (env.DATA) return env.DATA;
  if (env.DB) {
    const db = env.DB;
    const ready = async () => { if (!_tableReady) { await db.prepare("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT, exp INTEGER)").run(); _tableReady = true; } };
    return {
      async get(k) { await ready(); const r = await db.prepare("SELECT v, exp FROM kv WHERE k = ?").bind(k).first(); if (!r) return null; if (r.exp && r.exp < Date.now() / 1000) return null; return r.v; },
      async put(k, v, o) { await ready(); const exp = o && o.expirationTtl ? Math.floor(Date.now() / 1000) + o.expirationTtl : null; await db.prepare("INSERT INTO kv (k, v, exp) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, exp = excluded.exp").bind(k, v, exp).run(); },
      async delete(k) { await ready(); await db.prepare("DELETE FROM kv WHERE k = ?").bind(k).run(); },
      async list({ prefix }) { await ready(); const r = await db.prepare("SELECT k FROM kv WHERE k LIKE ? ORDER BY k LIMIT 1000").bind(prefix.replace(/[%_]/g, "") + "%").all(); return { keys: (r.results || []).map(x => ({ name: x.k })), list_complete: true }; }
    };
  }
  if (env.FILES) {
    const b = env.FILES;
    return {
      async get(k) { const o = await b.get(k); if (!o) return null; const e = o.customMetadata && o.customMetadata.exp; if (e && +e < Date.now() / 1000) return null; return o.text(); },
      async put(k, v, o) { await b.put(k, v, { customMetadata: o && o.expirationTtl ? { exp: String(Math.floor(Date.now() / 1000) + o.expirationTtl) } : {} }); },
      async delete(k) { await b.delete(k); },
      async list({ prefix, cursor }) { const r = await b.list({ prefix, cursor }); return { keys: r.objects.map(x => ({ name: x.key })), list_complete: !r.truncated, cursor: r.cursor }; }
    };
  }
  throw new Error("no storage bound");
}

// ---------- Fitwise Worker: API + static assets ----------
const FREE_LIMIT = 3;
const IP_DAILY_LIMIT = 8;
const ADMIN_HASH = "7a10a784b5b843d370c1d08192d0baac6470e6e855eae5612844f3cfecda519c";

const SYS_PROMPT = `You tailor CVs to a job ad. HARD RULES (truthfulness):
- Rephrase and reorder ONLY. Never invent employers, titles, dates, degrees, certifications, tools, skills, numbers or achievements.
- Every skill you list must already appear somewhere in the CV text.
- Every number in your output must already appear in the CV text.
- Keep each role's header lines exactly as given. Do not add or remove roles. Do not add bullets; you may merge or shorten them.
- Do not add qualities, scale or adjectives the CV does not state (e.g. 'high-availability', 'scalable', 'expert', 'millions').
- Use the job ad's exact wording for a skill only where the CV clearly shows that same skill.
- Plain ATS-friendly text: no tables, no emojis, no first-person in bullets, start bullets with strong verbs.
Return ONLY a JSON object: {"summary": string (2-3 sentences), "skills": [string], "experience": [{"bullets": [string]}] (same number and order of roles as the input), "cover_letter": string (3 short paragraphs + sign-off with the candidate's name, under 230 words, no invented facts)}.`;

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });
}
async function sha(s) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join(""); }
async function isAdmin(req) { const k = req.headers.get("x-admin-key") || ""; if (k && (await sha(k)) === ADMIN_HASH) return true; const c = REQ.get(req); if (!c) return false; const s = await currentSession(req, c.env); return !!(s && s.isAdmin); }
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
async function kvNum(env, k) { const v = await store(env).get(k); return v ? parseInt(v, 10) || 0 : 0; }
async function bump(env, k, ttl) { const n = (await kvNum(env, k)) + 1; await store(env).put(k, String(n), ttl ? { expirationTtl: ttl } : undefined); return n; }

function decodeEntities(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&rsquo;|&lsquo;/g, "'").replace(/&rdquo;|&ldquo;/g, '"').replace(/&ndash;/g, "–").replace(/&mdash;/g, "—").replace(/&bull;/g, "•").replace(/&euro;/g, "€");
}
function htmlToText(h) {
  h = h.replace(/<(script|style|noscript|svg|nav|footer|header|form|iframe)[\s\S]*?<\/\1>/gi, " ");
  h = h.replace(/<li[^>]*>/gi, "\n- ").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h[1-6]|ul|ol|section|tr)>/gi, "\n").replace(/<h[1-6][^>]*>/gi, "\n");
  h = decodeEntities(h.replace(/<[^>]+>/g, " "));
  return h.split("\n").map(l => l.replace(/[ \t\u00a0]+/g, " ").trim()).filter((l, i, a) => l || (a[i - 1] && a[i - 1].trim())).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
async function getJSON(u) { const r = await fetch(u, { headers: { "user-agent": "Mozilla/5.0 (compatible; FitwiseBot/1.0)", accept: "application/json" }, cf: { cacheTtl: 300 } }); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }

async function fetchJob(url) {
  let u; try { u = new URL(url); } catch { throw new Error("That doesn't look like a link."); }
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) links work.");
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)) throw new Error("That link isn't public.");
  let m;
  if ((m = u.href.match(/greenhouse\.io\/([\w-]+)\/jobs\/(\d+)/)) || ((m = [null, u.searchParams.get("for"), u.searchParams.get("token")]) && m[1] && m[2] && /greenhouse/.test(u.hostname))) {
    const j = await getJSON(`https://boards-api.greenhouse.io/v1/boards/${m[1]}/jobs/${m[2]}`);
    let co = m[1]; try { const b = await getJSON(`https://boards-api.greenhouse.io/v1/boards/${m[1]}`); co = b.name || co; } catch {}
    return { title: j.title, company: co, text: htmlToText(decodeEntities(j.content || "")), source: "greenhouse" };
  }
  if ((m = u.href.match(/jobs\.(?:eu\.)?lever\.co\/([\w.-]+)\/([0-9a-f-]{36})/))) {
    const host = /\.eu\./.test(u.hostname) ? "api.eu.lever.co" : "api.lever.co";
    const j = await getJSON(`https://${host}/v0/postings/${m[1]}/${m[2]}`);
    const lists = (j.lists || []).map(l => l.text + "\n" + htmlToText(l.content)).join("\n\n");
    return { title: j.text, company: m[1], text: [j.descriptionPlain || htmlToText(j.description || ""), lists, j.additionalPlain || ""].join("\n\n").trim(), source: "lever" };
  }
  if ((m = u.href.match(/jobs\.ashbyhq\.com\/([\w.%-]+)\/([0-9a-f-]{36})/))) {
    const b = await getJSON(`https://api.ashbyhq.com/posting-api/job-board/${m[1]}`);
    const j = (b.jobs || []).find(x => x.id === m[2]);
    if (j) return { title: j.title, company: decodeURIComponent(m[1]), text: j.descriptionPlain || htmlToText(j.descriptionHtml || ""), source: "ashby" };
  }
  const r = await fetch(u.href, { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", accept: "text/html,*/*", "accept-language": "en" }, redirect: "follow" });
  if (!r.ok) throw new Error("The job site answered " + r.status + ". Paste the job text instead.");
  const html = (await r.text()).slice(0, 1500000);
  for (const blk of html.match(/<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi) || []) {
    try {
      let d = JSON.parse(blk.replace(/^<script[^>]*>|<\/script>$/gi, ""));
      const arr = Array.isArray(d) ? d : (d["@graph"] || [d]);
      const jp = arr.find(x => x && (x["@type"] === "JobPosting" || (Array.isArray(x["@type"]) && x["@type"].includes("JobPosting"))));
      if (jp && jp.description) return { title: jp.title || "", company: (jp.hiringOrganization && (jp.hiringOrganization.name || jp.hiringOrganization)) || "", text: htmlToText(decodeEntities(jp.description)), source: "jsonld" };
    } catch {}
  }
  const tm = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const body = (html.match(/<main[\s\S]*?<\/main>/i) || html.match(/<body[\s\S]*<\/body>/i) || [html])[0];
  const text = htmlToText(body).slice(0, 15000);
  if (text.length < 300) throw new Error("This site loads the job with scripts we can't read. Paste the job text instead.");
  return { title: tm ? decodeEntities(tm[1]).trim().slice(0, 100) : "", company: "", text, source: "html" };
}

function numbersIn(s) { return (s.match(/\d[\d,.]*/g) || []).map(x => x.replace(/[,.]$/, "").replace(/,/g, "")); }
function allNumbersKnown(s, cvNums) { return numbersIn(s).every(n => cvNums.has(n)); }

async function callAI(cfg, system, user) {
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 55000);
  try {
    if (cfg.provider === "anthropic") {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal: ctl.signal, headers: { "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: cfg.model, max_tokens: 3000, temperature: 0.2, system, messages: [{ role: "user", content: user }] }) });
      const j = await r.json(); if (!r.ok) throw new Error("ai " + r.status + " " + JSON.stringify(j).slice(0, 200));
      return { text: (j.content || []).map(c => c.text || "").join(""), usage: { in: j.usage?.input_tokens, out: j.usage?.output_tokens } };
    }
    const base = (cfg.base_url || "https://api.openai.com/v1").replace(/\/$/, "");
    const r = await fetch(base + "/chat/completions", { method: "POST", signal: ctl.signal, headers: { authorization: "Bearer " + cfg.key, "content-type": "application/json" }, body: JSON.stringify({ model: cfg.model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }) });
    const j = await r.json(); if (!r.ok) throw new Error("ai " + r.status + " " + JSON.stringify(j).slice(0, 200));
    return { text: j.choices?.[0]?.message?.content || "", usage: { in: j.usage?.prompt_tokens, out: j.usage?.completion_tokens } };
  } finally { clearTimeout(to); }
}

async function tailorAI(cfg, cvText, jdText, base) {
  const t = base.tailored;
  const user = JSON.stringify({
    job_title: base.job.title, company: base.job.company, job_ad: jdText.slice(0, 12000),
    job_keywords_cv_already_has: base.matched, job_keywords_cv_lacks_DO_NOT_ADD: base.missing,
    cv: { name: t.name, headline: t.headline, summary: t.summary, skills: t.skills, roles: t.experience.map(e => ({ header: e.header, bullets: e.bullets })) },
    full_cv_text: cvText.slice(0, 12000)
  });
  const res = await callAI(cfg, SYS_PROMPT, user);
  const m = res.text.match(/\{[\s\S]*\}/); if (!m) throw new Error("no json");
  const out = JSON.parse(m[0]);
  const cvNums = new Set(numbersIn(cvText)); const cvN = norm(cvText);
  const guard = [];
  const next = JSON.parse(JSON.stringify(t));
  if (typeof out.summary === "string" && out.summary.length > 20) { if (allNumbersKnown(out.summary, cvNums)) next.summary = out.summary.trim(); else guard.push("summary"); }
  if (Array.isArray(out.skills)) {
    const ok = out.skills.filter(s => typeof s === "string" && s.trim() && (cvN.includes(" " + s.toLowerCase().trim() + " ") || cvN.includes(s.toLowerCase().trim()) || [...countTerms(s).keys()].some(k => countTerms(cvText).has(k))));
    const dropped = out.skills.length - ok.length; if (dropped) guard.push(dropped + " skill(s)");
    const seen = new Set(ok.map(s => s.toLowerCase()));
    next.skills = [...ok, ...t.skills.filter(s => !seen.has(s.toLowerCase()))];
  }
  if (Array.isArray(out.experience) && out.experience.length === t.experience.length) {
    out.experience.forEach((e, i) => {
      const b = (e && Array.isArray(e.bullets) ? e.bullets : []).filter(x => typeof x === "string" && x.trim()).slice(0, Math.max(t.experience[i].bullets.length, 1));
      if (b.length && b.every(x => allNumbersKnown(x, cvNums))) next.experience[i].bullets = b.map(x => x.replace(/^[-•*]\s*/, "").trim());
      else if (b.length) guard.push("role " + (i + 1));
    });
  } else guard.push("roles");
  let cover = base.cover;
  if (typeof out.cover_letter === "string" && out.cover_letter.length > 200) { if (allNumbersKnown(out.cover_letter, cvNums)) cover = out.cover_letter.trim(); else guard.push("cover letter"); }
  const changes = ["Rewrote your summary and bullets around this job's priorities, using only facts already in your CV.", ...base.changes.filter(c => /Listed skills|Matched the job/.test(c))];
  if (guard.length) changes.push("Truth check: kept your original wording for " + guard.join(", ") + " because the AI draft contained something not in your CV.");
  return { ...base, mode: "ai", tailored: next, cover, changes, usage: res.usage };
}

async function handleTailor(req, env) {
  let b; try { b = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  const cv = String(b.cv || "").slice(0, 25000), jd = String(b.jd || "").slice(0, 25000);
  const email = String(b.email || "").trim().toLowerCase(), device = String(b.device || "").slice(0, 64);
  if (cv.trim().length < 150) return json({ error: "Your CV looks too short. Paste the full text (or upload the file)." }, 400);
  if (jd.trim().length < 100) return json({ error: "Add the job description (paste it, or fetch it from the link)." }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email so we can count your free tailorings." }, 400);
  const eh = await sha(email), ip = req.headers.get("cf-connecting-ip") || "0", day = new Date().toISOString().slice(0, 10);
  const kE = "q:e:" + eh, kD = device ? "q:d:" + device : null, kI = "q:i:" + (await sha(ip)).slice(0, 24) + ":" + day;
  const used = Math.max(await kvNum(env, kE), kD ? await kvNum(env, kD) : 0);
  if (used >= FREE_LIMIT) return json({ error: "limit", used, limit: FREE_LIMIT }, 402);
  if ((await kvNum(env, kI)) >= IP_DAILY_LIMIT) return json({ error: "Too many tailorings from this network today. Try again tomorrow." }, 429);
  const t0 = Date.now();
  let result = tailorRules(cv, jd, { title: String(b.title || "").slice(0, 100), company: String(b.company || "").slice(0, 80) });
  let aiNote = null;
  const cfgRaw = await store(env).get("cfg:ai");
  if (cfgRaw) {
    try { result = await tailorAI(JSON.parse(cfgRaw), cv, jd, result); }
    catch (e) { aiNote = "AI unavailable, used instant mode"; await store(env).put("log:aierr", String(e).slice(0, 300) + " @" + new Date().toISOString()); }
  }
  const n = await bump(env, kE); if (kD) await store(env).put(kD, String(Math.max(n, (await kvNum(env, kD)) + 1)));
  await bump(env, kI, 172800);
  if (n === 1) await store(env).put("lead:" + eh, JSON.stringify({ email, first: new Date().toISOString() }));
  await bump(env, "stat:tailorings");
  if (result.usage) { await store(env).put("stat:lastusage", JSON.stringify({ ...result.usage, at: new Date().toISOString() })); delete result.usage; }
  return json({ ...result, aiNote, ms: Date.now() - t0, used: n, limit: FREE_LIMIT });
}


// ---------- v2: structured tailoring, location formats, credits ----------
const DAILY_FAIR = 25;            // free tailorings per email/device per day (fair use; applies after launch)
const PRELAUNCH_FREE = 1;         // pre-launch: free tailorings per person in total (email AND browser). Set 0 at launch.
const PRELAUNCH_MSG = "Pre-launch: 1 free tailoring per person, and you've already used yours. Thanks for trying Fitwise! More tailorings open at launch.";
const IP_DAILY_FAIR = 60;
const CREDIT_PACKS = { starter: { credits: 10, usd: 5 }, plus: { credits: 30, usd: 12 }, power: { credits: 70, usd: 25 } };
const CREDITS_PER_COVER = 1;      // a cover letter for one job = 1 credit (preview free)
// Autopilot (coming soon): prepaid job bundles in EUR, each with a daily cap and a validity window
const AUTOPILOT_BUNDLES = { a10: { jobs: 10, eur: 1.5 }, a100: { jobs: 100, eur: 9.5 }, a1000: { jobs: 1000, eur: 65 } };
const AUTOPILOT_DAILY_CAP = 50, AUTOPILOT_VALID_DAYS = 90;
const CREDITS_PER_FORMAT = 1;     // $0.50 each; both formats for a job = 2 credits ($1)
let _sqlReady = false;
async function sql(env) {
  const db = env.DB;
  if (!_sqlReady) {
    await db.batch([
      db.prepare("CREATE TABLE IF NOT EXISTS credits (email_hash TEXT PRIMARY KEY, email TEXT, balance INTEGER NOT NULL DEFAULT 0, updated INTEGER)"),
      db.prepare("CREATE TABLE IF NOT EXISTS credit_ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, email_hash TEXT, delta INTEGER, reason TEXT, ref TEXT, created INTEGER)"),
      db.prepare("CREATE INDEX IF NOT EXISTS credit_ledger_ref ON credit_ledger (email_hash, ref)"),
      db.prepare("CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, email_hash TEXT, doc_hash TEXT, title TEXT, created INTEGER)")
    ]);
    _sqlReady = true;
  }
  return db;
}
async function balanceOf(env, eh) { const r = await (await sql(env)).prepare("SELECT balance FROM credits WHERE email_hash = ?").bind(eh).first(); return r ? r.balance : 0; }
// the one place credits are added: Stripe webhook (later) and admin grants call this
async function grantCredits(env, email, n, reason, ref) {
  const db = await sql(env); const eh = await sha(email); const now = Date.now();
  await db.batch([
    db.prepare("INSERT INTO credits (email_hash, email, balance, updated) VALUES (?, ?, ?, ?) ON CONFLICT(email_hash) DO UPDATE SET balance = balance + excluded.balance, updated = excluded.updated").bind(eh, email, n, now),
    db.prepare("INSERT INTO credit_ledger (email_hash, delta, reason, ref, created) VALUES (?, ?, ?, ?, ?)").bind(eh, n, reason, ref || "", now)
  ]);
  return balanceOf(env, eh);
}
// payment provider hook. Today: no payments (early access list). Later: Stripe Checkout for credit packs.
const PAYMENTS = {
  live: false,
  async checkout(env, email, packId, origin) {
    // LATER (Stripe): const s = await stripe.checkout.sessions.create({ mode: "payment", customer_email: email,
    //   line_items: [{ price: env.STRIPE_PRICE_<PACK>, quantity: 1 }], metadata: { email, pack: packId },
    //   success_url: origin + "/?paid=1#try", cancel_url: origin + "/#pricing" }); return { url: s.url };
    // and a webhook route (/api/stripe/webhook) that verifies the signature and calls
    //   grantCredits(env, metadata.email, CREDIT_PACKS[pack].credits, "purchase", session.id)  (idempotent on session.id)
    return null;
  }
};
const fontGet = env => async p => { const r = await env.ASSETS.fetch(new Request("https://assets.local" + p)); if (!r.ok) throw new Error("asset " + p + " " + r.status); return r.arrayBuffer(); };
function pdfResp(bytes, name) { return new Response(bytes, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${name}"`, "cache-control": "no-store" } }); }

async function handleTailor2(req, env) {
  let b; try { b = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  const jd = String(b.jd || "").slice(0, 30000);
  const email = String(b.email || "").trim().toLowerCase(), device = String(b.device || "").slice(0, 64);
  let lines = Array.isArray(b.lines) ? b.lines.slice(0, 900) : null;
  const cvText = lines ? lines.map(l => String(l && l.t || "") + (l && l.right ? " " + l.right : "")).join("\n") : String(b.cv || "").slice(0, 30000);
  if (cvText.trim().length < 150) return json({ error: "Your CV looks too short. Paste the full text (or upload the file)." }, 400);
  if (jd.trim().length < 100) return json({ error: "Add the job description (paste it, or fetch it from the link)." }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email so we can save your results and credits." }, 400);
  const eh = await sha(email), ip = req.headers.get("cf-connecting-ip") || "0", day = new Date().toISOString().slice(0, 10);
  const kE = "d:e:" + eh + ":" + day, kD = device ? "d:d:" + device + ":" + day : null, kI = "q:i:" + (await sha(ip)).slice(0, 24) + ":" + day;
  // PRE-LAUNCH (Suresh, WhatsApp 7:45 AM 1 Nov 2026): 1 free tailoring per person, counted per email AND per browser, never resets until launch
  const kPE = "pl:e:" + eh, kPD = device ? "pl:d:" + device : null;
  if (PRELAUNCH_FREE > 0) {
    const usedPL = Math.max(await kvNum(env, kPE), kPD ? await kvNum(env, kPD) : 0);
    if (usedPL >= PRELAUNCH_FREE) return json({ error: PRELAUNCH_MSG, code: "prelaunch_used", limit: PRELAUNCH_FREE }, 429);
  }
  const usedToday = Math.max(await kvNum(env, kE), kD ? await kvNum(env, kD) : 0);
  if (usedToday >= DAILY_FAIR) return json({ error: `That's ${DAILY_FAIR} tailorings today. The free daily limit resets tomorrow.` }, 429);
  if ((await kvNum(env, kI)) >= IP_DAILY_FAIR) return json({ error: "Too many tailorings from this network today. Try again tomorrow." }, 429);
  const t0 = Date.now();
  if (!lines) lines = textToLines(cvText);
  const meta = b.meta && typeof b.meta === "object" ? b.meta : {};
  const orig = parseDoc(lines, { source: ["pdf", "docx", "text"].includes(meta.source) ? meta.source : "text" });
  let res = tailorDoc(orig, jd, { title: String(b.title || "").slice(0, 100), company: String(b.company || "").slice(0, 80) });
  let aiNote = null;
  const cfgRaw = await store(env).get("cfg:ai");
  if (cfgRaw) {
    try { res = await tailorAIDoc(JSON.parse(cfgRaw), cvText, jd, res); }
    catch (e) { aiNote = "AI unavailable, used instant mode"; await store(env).put("log:aierr", String(e).slice(0, 300) + " @" + new Date().toISOString()); }
  }
  const style = docStyle(orig, meta.style && typeof meta.style === "object" ? meta.style : {});
  if (meta.source === "pdf" && meta.style && meta.style.colors) Object.assign(style, meta.style.colors);
  let region = REGION_FORMATS[b.region] ? b.region : orig.meta.region || "intl";
  const n1 = await bump(env, kE, 172800); if (kD) await bump(env, kD, 172800);
  if (PRELAUNCH_FREE > 0) { await bump(env, kPE); if (kPD) await bump(env, kPD); }
  await bump(env, kI, 172800);
  if (!(await store(env).get("lead:" + eh))) await store(env).put("lead:" + eh, JSON.stringify({ email, first: new Date().toISOString() }));
  await bump(env, "stat:tailorings");
  if (res.usage) { await store(env).put("stat:lastusage", JSON.stringify({ ...res.usage, at: new Date().toISOString() })); delete res.usage; }
  const jobId = crypto.randomUUID();
  const docHash = await sha(JSON.stringify(res.doc));
  await (await sql(env)).prepare("INSERT INTO jobs (id, email_hash, doc_hash, title, created) VALUES (?, ?, ?, ?, ?)").bind(jobId, eh, docHash, [res.job.title, res.job.company].filter(Boolean).join(" @ ").slice(0, 120), Date.now()).run();
  const coverFull = String(res.cover || "");
  await store(env).put("cover:" + jobId, JSON.stringify({ eh, t: coverFull }), { expirationTtl: 1209600 });
  const coverPaid = false;
  res.cover = coverPreview(coverFull);
  return json({ ...res, coverLocked: true, coverCost: CREDITS_PER_COVER, coverPaid, orig, style, jobId, region, country: orig.meta.country, regions: REGION_LABEL, regionFormats: REGION_FORMATS,
    formats: Object.fromEntries(Object.values(FORMATS).map(f => [f.id, { id: f.id, label: f.label, blurb: f.blurb }])),
    credits: await balanceOf(env, eh), aiNote, ms: Date.now() - t0, usedToday: n1, dailyFair: DAILY_FAIR, prelaunchFree: PRELAUNCH_FREE });
}
function coverPreview(t) { const paras = String(t).split(/\n\s*\n/); const head = paras.slice(0, 2).join("\n\n"); return head.length > 420 ? head.slice(0, 420).replace(/\s+\S*$/, "") + "…" : head + (paras.length > 2 ? "\n\n…" : ""); }
async function renderFormat(env, doc, fmt, preview) {
  await FitPDF.load(fontGet(env));
  const d = FitRender.render(doc, FORMATS[fmt].T, { preview });
  return d.bytes(fontGet(env));
}
function fileName(doc, fmt) { const n = String(doc && doc.name && doc.name.t || "CV").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40); return `${n || "CV"}_CV_${fmt}.pdf`; }

async function tailorAIDoc(cfg, cvText, jd, res) {
  // reuse the v1 AI writer, then map its bullets back into the structure (same count per role, or keep ours)
  const ex = res.doc.sections.find(s => s.kind === "experience");
  const entries = ex ? ex.blocks.filter(b => b.type === "entry") : [];
  const sum = res.doc.sections.find(s => s.kind === "summary");
  const sk = res.doc.sections.find(s => s.kind === "skills");
  const base = { job: res.job, matched: res.matched, missing: res.missing, cover: res.cover, changes: res.changes,
    tailored: { name: res.doc.name ? res.doc.name.t : "", headline: "", summary: sum ? sum.blocks.filter(b => b.type === "para").map(b => b.t).join(" ") : "", skills: sk ? sk.blocks.map(b => b.t) : [], experience: entries.map(e => ({ header: e.head.map(h => h.t), bullets: e.items.filter(i => i.type === "bullet").map(i => i.t) })) } };
  const out = await tailorAI(cfg, cvText, jd, base);
  entries.forEach((e, k) => { const nb = out.tailored.experience[k] && out.tailored.experience[k].bullets; const items = e.items.filter(i => i.type === "bullet"); if (nb && nb.length === items.length) items.forEach((it, j) => { if (nb[j] !== it.t) { it.o = it.o || it.t; it.t = nb[j]; it.changed = true; } }); });
  if (sum) { const paras = sum.blocks.filter(b => b.type === "para"); if (paras.length === 1 && out.tailored.summary && out.tailored.summary !== paras[0].t) { paras[0].o = paras[0].o || paras[0].t; paras[0].t = out.tailored.summary; paras[0].changed = true; } }
  return { ...res, mode: "ai", cover: out.cover, changes: out.changes, usage: out.usage };
}

async function routeV2(p, req, env) {
  const body = async () => req.json().catch(() => ({}));
  if (p === "/api/tailor" && req.method === "POST") return handleTailor2(req, env);
  if (p === "/api/preview" && req.method === "POST") {
    // watermarked, text-layer-free PDF; the page turns it into images, it is never offered as a download
    const b = await body(); const fmt = String(b.format || "");
    if (!FORMATS[fmt] || !b.doc || !b.doc.sections) return json({ error: "bad request" }, 400);
    const bytes = await renderFormat(env, b.doc, fmt, true);
    return new Response(bytes, { headers: { "content-type": "application/octet-stream", "cache-control": "no-store", "x-robots-tag": "noindex" } });
  }
  if (p === "/api/credits" && req.method === "POST") {
    const b = await body(); const email = String(b.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return json({ credits: 0 });
    return json({ credits: await balanceOf(env, await sha(email)), packs: CREDIT_PACKS, perFormat: CREDITS_PER_FORMAT, perCover: CREDITS_PER_COVER, autopilot: { bundles: AUTOPILOT_BUNDLES, dailyCap: AUTOPILOT_DAILY_CAP, validDays: AUTOPILOT_VALID_DAYS, live: false }, payments: PAYMENTS.live });
  }
  if (p === "/api/credits/buy" && req.method === "POST") {
    const b = await body(); const email = String(b.email || "").trim().toLowerCase(); const pack = CREDIT_PACKS[b.pack] ? b.pack : "starter";
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email." }, 400);
    const co = PAYMENTS.live ? await PAYMENTS.checkout(env, email, pack, new URL(req.url).origin) : null;
    if (co && co.url) return json({ ok: true, url: co.url });
    await store(env).put("ea:credits:" + (await sha(email)), JSON.stringify({ email, plan: "credits", pack, want: b.want || null, at: new Date().toISOString() }));
    await bump(env, "stat:ea");
    return json({ ok: true, live: false });
  }
  if (p === "/api/cover" && req.method === "POST") {
    const b = await body(); const email = String(b.email || "").trim().toLowerCase(); const jobId = String(b.jobId || "");
    if (!EMAIL_RE.test(email) || !jobId) return json({ error: "bad request" }, 400);
    const eh = await sha(email); const db = await sql(env);
    const raw = await store(env).get("cover:" + jobId); const c = raw ? JSON.parse(raw) : null;
    if (!c || c.eh !== eh) return json({ error: "This result has expired. Tailor again to get the cover letter." }, 409);
    const ref = "cover:" + jobId;
    const paid = await db.prepare("SELECT id FROM credit_ledger WHERE email_hash = ? AND ref = ? AND delta < 0").bind(eh, ref).first();
    if (!paid) {
      const r = await db.prepare("UPDATE credits SET balance = balance - ?, updated = ? WHERE email_hash = ? AND balance >= ?").bind(CREDITS_PER_COVER, Date.now(), eh, CREDITS_PER_COVER).run();
      if (!r.meta || !r.meta.changes) return json({ error: "no_credits", credits: await balanceOf(env, eh), need: CREDITS_PER_COVER }, 402);
      await db.prepare("INSERT INTO credit_ledger (email_hash, delta, reason, ref, created) VALUES (?, ?, 'cover', ?, ?)").bind(eh, -CREDITS_PER_COVER, ref, Date.now()).run();
    }
    return json({ cover: c.t, credits: await balanceOf(env, eh), charged: paid ? 0 : CREDITS_PER_COVER });
  }
  if (p === "/api/download" && req.method === "POST") {
    const b = await body(); const email = String(b.email || "").trim().toLowerCase(); const fmt = String(b.format || ""); const jobId = String(b.jobId || "");
    if (!EMAIL_RE.test(email) || !FORMATS[fmt] || !b.doc || !jobId) return json({ error: "bad request" }, 400);
    const eh = await sha(email); const db = await sql(env);
    const job = await db.prepare("SELECT doc_hash, email_hash FROM jobs WHERE id = ?").bind(jobId).first();
    if (!job || job.email_hash !== eh || job.doc_hash !== (await sha(JSON.stringify(b.doc)))) return json({ error: "This result has expired. Tailor again to download." }, 409);
    const ref = jobId + ":" + fmt;
    const paid = await db.prepare("SELECT id FROM credit_ledger WHERE email_hash = ? AND ref = ? AND delta < 0").bind(eh, ref).first();
    if (!paid) {
      const r = await db.prepare("UPDATE credits SET balance = balance - ?, updated = ? WHERE email_hash = ? AND balance >= ?").bind(CREDITS_PER_FORMAT, Date.now(), eh, CREDITS_PER_FORMAT).run();
      if (!r.meta || !r.meta.changes) return json({ error: "no_credits", credits: await balanceOf(env, eh), need: CREDITS_PER_FORMAT }, 402);
      await db.prepare("INSERT INTO credit_ledger (email_hash, delta, reason, ref, created) VALUES (?, ?, 'download', ?, ?)").bind(eh, -CREDITS_PER_FORMAT, ref, Date.now()).run();
    }
    const bytes = await renderFormat(env, b.doc, fmt, false);
    const left = await balanceOf(env, eh);
    const resp = pdfResp(bytes, fileName(b.doc, fmt)); resp.headers.set("x-credits-left", String(left)); resp.headers.set("x-charged", paid ? "0" : String(CREDITS_PER_FORMAT));
    return resp;
  }
  if (p === "/api/admin/credits" && req.method === "POST") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    const b = await body(); const email = String(b.email || "").trim().toLowerCase(); const n = parseInt(b.delta, 10);
    if (!EMAIL_RE.test(email) || !n) return json({ error: "need email and delta" }, 400);
    return json({ ok: true, balance: await grantCredits(env, email, n, "admin", String(b.note || "").slice(0, 80)) });
  }
  if (p === "/api/admin/purge" && req.method === "POST") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    const b = await body(); const email = String(b.email || "").trim().toLowerCase(); const eh = await sha(email); const db = await sql(env);
    const out = {};
    for (const [t, q] of [["credits", "DELETE FROM credits WHERE email_hash = ?"], ["ledger", "DELETE FROM credit_ledger WHERE email_hash = ?"], ["jobs", "DELETE FROM jobs WHERE email_hash = ?"]]) out[t] = (await db.prepare(q).bind(eh).run()).meta.changes;
    let kv = 0; for (const pre of ["lead:" + eh, "ea:pro:" + eh, "ea:plus:" + eh, "ea:autopilot:" + eh, "ea:credits:" + eh, "q:e:" + eh, "sub:jobs:" + eh, "pl:e:" + eh]) { if (await store(env).get(pre)) { await store(env).delete(pre); kv++; } }
    const pre = "d:e:" + eh + ":"; const r = await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, ?) = ?").bind(pre.length, pre).run(); out.daily = r.meta.changes;
    out.covers = (await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, 6) = 'cover:' AND instr(v, ?) > 0").bind('"eh":"' + eh + '"').run()).meta.changes;
    out.contact = (await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, 8) = 'contact:' AND instr(v, ?) > 0").bind('"email":"' + email + '"').run()).meta.changes;
    out.kv = kv; return json({ ok: true, deleted: out });
  }
  return null;
}

// the app before the sign-in gate; gate.js routes every request here after its checks
const FW_MAIN = {
  async fetch(req, env, ctx) {
    const url = new URL(req.url); const p = url.pathname;
    if (p.startsWith("/j/")) { try { return await jobDetailPage(p, req, env); } catch (e) { return new Response("Something went wrong loading this job. Please refresh.", { status: 500 }); } }
    if (p === "/events" || p === "/events/" || p === "/conferences") { if (p === "/conferences") return Response.redirect(new URL("/events", req.url).toString(), 301); try { return await eventsPage("/events", req, env); } catch (e) { return new Response("Something went wrong loading this page. Please refresh.", { status: 500 }); } }
    if (p === "/jobs" || p.startsWith("/jobs/")) { try { return await jobsPage(p, env); } catch (e) { return new Response("Something went wrong loading the jobs list. Please refresh.", { status: 500 }); } }
    if (!p.startsWith("/api/")) {
      try { const sp = await sitePage(p, req, env); if (sp) return sp; } catch (e) {}
      const r = await env.ASSETS.fetch(req);
      if (r.status === 404 && req.method === "GET") return notFound(env, req);
      return r;
    }
    if (ctx && ctx.waitUntil) ctx.waitUntil(sweepExpired(env));
    try {
      const jr = await routeJobs(p, req, env, url); if (jr) return jr;
      const evr = await routeEvents(p, req, env, url); if (evr) return evr;
      const b1 = await routeBuild1(p, req, env, url); if (b1) return b1;
      const sr = await routeSite(p, req, env); if (sr) return sr;
      const v2 = await routeV2(p, req, env); if (v2) return v2;
      if (p === "/api/status") { const ccfg = await getCascadeConfig(env); const cs = publicCascadeStatus(ccfg); return json({ ok: true, ai: cs.ai_providers_configured.length > 0, ...cs, daily_fair: DAILY_FAIR, prelaunch_free: PRELAUNCH_FREE, version: 4 }); }
      if (p === "/api/usage" && req.method === "POST") {
        const b = await req.json().catch(() => ({})); const email = String(b.email || "").trim().toLowerCase();
        const u = Math.max(EMAIL_RE.test(email) ? await kvNum(env, "q:e:" + (await sha(email))) : 0, b.device ? await kvNum(env, "q:d:" + String(b.device).slice(0, 64)) : 0);
        return json({ used: u, limit: FREE_LIMIT });
      }
      if (p === "/api/tailor" && req.method === "POST") return await handleTailor(req, env);
      if (p === "/api/fetch-job" && req.method === "POST") {
        const b = await req.json().catch(() => ({}));
        try { const r = await fetchJob(String(b.url || "")); return json({ ...r, text: r.text.slice(0, 20000) }); }
        catch (e) { return json({ error: String(e.message || e) }, 422); }
      }
      if (p === "/api/early-access" && req.method === "POST") {
        const b = await req.json().catch(() => ({})); const email = String(b.email || "").trim().toLowerCase();
        if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email." }, 400);
        const plan = ["autopilot", "credits"].includes(b.plan) ? b.plan : "autopilot";
        const bundle = AUTOPILOT_BUNDLES[b.bundle] ? b.bundle : null;
        await store(env).put("ea:" + plan + ":" + (await sha(email)), JSON.stringify({ email, plan, bundle, at: new Date().toISOString() }));
        await bump(env, "stat:ea");
        return json({ ok: true });
      }
      if (p.startsWith("/api/admin/")) {
        if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
        if (p === "/api/admin/ai" && req.method === "POST") {
          const b = await req.json();
          if (b.clear) { await store(env).delete("cfg:ai"); return json({ ok: true, ai: false }); }
          if (!b.key || !b.model) return json({ error: "need key and model" }, 400);
          await store(env).put("cfg:ai", JSON.stringify({ provider: b.provider === "anthropic" ? "anthropic" : "openai", base_url: b.base_url || "", model: b.model, key: b.key }));
          return json({ ok: true, ai: true, provider: b.provider || "openai", model: b.model });
        }
        if (p === "/api/admin/stats") {
          const list = async pre => { const out = []; let cur; do { const r = await store(env).list({ prefix: pre, cursor: cur }); for (const k of r.keys) out.push(JSON.parse((await store(env).get(k.name)) || "{}")); cur = r.list_complete ? null : r.cursor; } while (cur && out.length < 1000); return out; };
          return json({ apply_clicks: await jobClickStats(env), google_signups: await (async () => { try { const r = await (await usersDb(env)).prepare("SELECT COUNT(*) AS n FROM users").first(); return r ? r.n : 0; } catch (e) { return null; } })(), tailorings: await kvNum(env, "stat:tailorings"), early_access: await list("ea:"), users: await list("lead:"), last_ai_usage: JSON.parse((await store(env).get("stat:lastusage")) || "null"), last_ai_error: await store(env).get("log:aierr") });
        }
      }
      return json({ error: "not found" }, 404);
    } catch (e) { return json({ error: "Something went wrong on our side. Please try again." , detail: String(e).slice(0, 120) }, 500); }
  }
};
