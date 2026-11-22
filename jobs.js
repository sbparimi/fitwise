
// ---------- Daily jobs page (/jobs, /jobs/YYYY-MM-DD) ----------
const JOBS_SITE = "https://fitwise.sites.tab.bot";
const JOB_COUNTRIES = { NL: "Netherlands", CH: "Switzerland", DE: "Germany", LU: "Luxembourg", BE: "Belgium", SE: "Sweden", PT: "Portugal", PL: "Poland", DK: "Denmark", FI: "Finland", AT: "Austria", IE: "Ireland", ES: "Spain", FR: "France", CZ: "Czechia", NO: "Norway", IT: "Italy", EE: "Estonia", RO: "Romania", GR: "Greece", HU: "Hungary", LT: "Lithuania", LV: "Latvia", HR: "Croatia", SK: "Slovakia", SI: "Slovenia", BG: "Bulgaria", MT: "Malta", CY: "Cyprus", IS: "Iceland" };
const JOB_NAME2CODE = Object.fromEntries(Object.entries(JOB_COUNTRIES).map(([c, n]) => [n.toLowerCase(), c]));
Object.assign(JOB_NAME2CODE, { "the netherlands": "NL", holland: "NL", "czech republic": "CZ", deutschland: "DE", schweiz: "CH", suisse: "CH" });
const flagOf = c => /^[A-Z]{2}$/.test(c || "") ? String.fromCodePoint(...[...c].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65)) : "";
const jesc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const prettyDate = d => { if (!DATE_RE.test(d || "")) return ""; const [y, m, dd] = d.split("-").map(Number); const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(Date.UTC(y, m - 1, dd)).getUTCDay()]; return `${wd} ${dd} ${MONTHS[m - 1]} ${y}`; };
const shortDate = d => { const m = String(d || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${+m[3]} ${MONTHS[+m[2] - 1]}` : String(d || "").slice(0, 12); };
function amsToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch { return new Date().toISOString().slice(0, 10); } }


function fmtEvidence(raw) {
  let t = String(raw || "").replace(/<[^>]+>/g, " ").replace(/([a-z\.\)])([A-Z][a-z])/g, "$1 $2").replace(/\s+/g, " ").replace(/^["'“”\s]+|["'“”\s]+$/g, "").trim();
  const ind = t.match(/^IND recogni[sz]ed[- ]sponsor(?:\s+register)?:?\s*(.*)$/i);
  if (ind) return ("IND recognised sponsor" + (ind[1] ? " (" + ind[1].trim() + ")" : "")).slice(0, 120);
  const m = t.search(/visa|sponsor|relocat|work permit|blue card|kennismigrant|highly skilled migrant/i);
  if (t.length > 130) {
    let a = m < 0 ? 0 : Math.max(0, m - 45), b = Math.min(t.length, a + 130);
    let cut = t.slice(a, b); if (a > 0) cut = "…" + cut.replace(/^\S*\s/, ""); if (b < t.length) cut = cut.replace(/\s\S*$/, "") + "…";
    t = cut;
  }
  return "Ad: “" + t + "”";
}
function cleanJob(j) {
  j = Object.assign({}, j);
  if (j.country == null && j.country_code == null && j.cc) j.country = j.cc;
  if (j.remote == null) j.remote = j.work_mode || j.workplace || j.wp;
  if (j.category == null) j.category = j.family || j.role_family;
  if (j.visa_sponsored == null && j.sponsored != null) j.visa_sponsored = j.sponsored;
  if (!j.visa_evidence) j.visa_evidence = j.sponsor_label || j.sponsor_evidence || j.sponsor_basis || "";
  if (j.city == null && j.location == null && j.loc) j.city = j.loc;
  const s = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
  let url = s(j.url || j.link || j.apply_url, 600); try { const u = new URL(url); if (!/^https?:$/.test(u.protocol)) url = ""; } catch { url = ""; }
  let cc = s(j.country_code || j.country, 40); const up = cc.toUpperCase();
  cc = /^[A-Z]{2}$/.test(up) ? (up === "UK" ? "GB" : up) : (JOB_NAME2CODE[cc.toLowerCase()] || cc);
  let remote = j.remote; if (remote === true) remote = "Remote"; else if (remote === false || remote == null) remote = ""; remote = s(remote, 30);
  const rl = remote.toLowerCase(); const mode = /hybrid/.test(rl) ? "hybrid" : /remote|anywhere/.test(rl) ? "remote" : /on.?site|office/.test(rl) ? "onsite" : (rl ? "other" : "na");
  let visa = j.visa_sponsored === true || j.visa_sponsored === "true" || j.visa_sponsored === 1 || j.visa_sponsored === "yes";
  const evRaw = String(j.visa_evidence || "");
  // safety: never show the green check when the quoted evidence itself says there is no support
  if (visa && /\b(not|no|unable|cannot|can't|cant|won't|don't|do not|doesn't|without)\b[^.]{0,40}\b(visa|sponsor\w*|relocat\w*|work permit)|\b(visa|sponsor\w*|relocat\w*|work permit)\b[^.]{0,40}\b(is not|are not|isn't|aren't|not (?:be )?(?:provided|offered|available|possible|supported)|unavailable|not able)/i.test(evRaw)) visa = false;
  return { company: s(j.company, 90), title: s(j.title, 140), city: s(j.city || j.location, 80), country: cc, remote, mode, posted: s(j.posted || j.date_posted, 25), url, visa, evidence: visa ? fmtEvidence(evRaw) : "", category: s(j.category, 40) };
}
function feedFromBody(b) {
  const jobs = Array.isArray(b) ? b : (b.jobs || b.items || []);
  const out = jobs.map(cleanJob).filter(j => j.title && j.company && j.url);
  const visa = out.filter(j => j.visa), rest = out.filter(j => !j.visa);
  return { jobs: visa.concat(rest), window: String((b && b.window) || "").slice(0, 60) };
}
async function getFeed(env, date) {
  const st = store(env);
  if (!date) date = await st.get("jobs:latest");
  if (!date) return null;
  const raw = await st.get("jobs:feed:" + date); if (!raw) return null;
  try { const f = JSON.parse(raw); f.date = date; return f; } catch { return null; }
}
async function feedDates(env) { const r = await store(env).list({ prefix: "jobs:feed:" }); return r.keys.map(k => k.name.slice(10)).filter(d => DATE_RE.test(d)).sort().reverse(); }

const catLabel = c => { const t = String(c || "").replace(/[_-]+/g, " ").trim(); if (!t) return "Other"; return t.split(" ").map(w => /^(qa|ai|ml|sre|sdet|aiops|llm|it)$/i.test(w) ? w.toUpperCase().replace("AIOPS", "AIOps") : w[0].toUpperCase() + w.slice(1)).join(" "); };
const modeLabel = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site", other: "", na: "" };

function jobCard(j, i) {
  const cn = JOB_COUNTRIES[j.country] || j.country || ""; const low = cn.toLowerCase();
  const segs = String(j.city || "").split(/\s*[|,·]\s*/).map(x => x.trim()).filter(Boolean)
    .map(x => low ? x.replace(new RegExp("[\\s-]*\\b(the\\s+)?" + low.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$", "i"), "").trim() : x)
    .filter(x => x && x.toLowerCase() !== low && x.toUpperCase() !== j.country);
  const city = segs.filter((x, k) => segs.findIndex(y => y.toLowerCase() === x.toLowerCase()) === k).join(", ");
  const place = [city, cn].filter(Boolean).join(", ");
  const ml = j.mode === "other" ? j.remote : modeLabel[j.mode];
  const tq = new URLSearchParams({ job: j.id || j.url, url: j.url, title: j.title, company: j.company, location: place, from: "jobs" }).toString();
  const hay = (j.title + " " + j.company + " " + j.city + " " + (JOB_COUNTRIES[j.country] || j.country) + " " + j.category).toLowerCase();
  return `<article class="jc${j.visa ? " v" : ""}" data-id="${jesc(j.id || ("row_" + i))}" data-title="${jesc(j.title)}" data-company="${jesc(j.company)}" data-place="${jesc(place)}" data-url="${jesc(j.id ? "/j/" + j.id : j.url)}" data-c="${jesc(j.country)}" data-k="${jesc(catLabel(j.category))}" data-m="${j.mode}" data-v="${j.visa ? 1 : 0}" data-q="${jesc(hay)}">
<div class="jh"><span class="co">${jesc(j.company)}</span><span class="jh-r"><span class="jmatch" hidden></span>${j.posted ? `<span class="pd">Posted ${jesc(shortDate(j.posted))}</span>` : ""}</span></div>
<h3>${j.id ? `<a class="jt" href="/j/${jesc(j.id)}">${jesc(j.title)}</a>` : jesc(j.title)}</h3>
<p class="mt"><span>${flagOf(j.country)} ${jesc(place)}</span>${ml ? `<span class="pill m-${j.mode}">${jesc(ml)}</span>` : ""}${j.category ? `<span class="pill">${jesc(catLabel(j.category))}</span>` : ""}</p>
${j.visa ? `<p class="vz"><span class="vb">✅ Visa sponsorship</span>${j.evidence ? `<span class="ev" title="${jesc(j.evidence)}">${jesc(j.evidence)}</span>` : ""}</p>` : ""}
<div class="ja"><a class="btn tl" href="/builder?${jesc(tq)}" data-i="${i}">Tailor CV in Builder</a><button type="button" class="btn ghost sm jsave" data-save-job>Save</button><a class="btn ghost ap" href="${j.id ? "/j/" + jesc(j.id) + "/go" : jesc(j.url)}" target="_blank" rel="noopener nofollow">Apply ↗</a></div>
</article>`;
}

function opts(vals, label) { return `<option value="">${label}</option>` + vals.map(([v, t]) => `<option value="${jesc(v)}">${jesc(t)}</option>`).join(""); }

function jobsHTML(feed, dates, isLatest) {
  const date = feed ? feed.date : amsToday();
  const jobs = feed ? feed.jobs : [];
  const n = jobs.length, nv = jobs.filter(j => j.visa).length;
  const pd = prettyDate(date);
  const path = isLatest ? "/jobs" : "/jobs/" + date;
  const title = n ? `${n} English-speaking tech jobs in Europe · ${pd} · Visa sponsorship ✅ first` : `English-speaking tech jobs in Europe · Fitwise`;
  const desc = n ? `${n} jobs today${nv ? `, ${nv} with visa sponsorship ✅` : ""}: QA, AI QA, AIOps, platform, ML and data engineering roles in the Netherlands, Switzerland, Germany and more. Tap Apply, or tailor your CV to the job in 30 seconds.` : "A daily list of English-speaking tech jobs in Europe, visa sponsorship first.";
  const countries = [...new Set(jobs.map(j => j.country).filter(Boolean))].sort((a, b) => (JOB_COUNTRIES[a] || a).localeCompare(JOB_COUNTRIES[b] || b));
  const cats = [...new Set(jobs.map(j => catLabel(j.category)))].sort();
  const cCount = c => jobs.filter(j => j.country === c).length;
  const visa = jobs.map((j, i) => [j, i]).filter(([j]) => j.visa), rest = jobs.map((j, i) => [j, i]).filter(([j]) => !j.visa);
  const promo = `<aside class="promo"><b>Found one that fits?</b> Fitwise tailors your own CV to that exact job in about 30 seconds: match score, the keywords you have and lack, same layout you already use. Free to start — switch across 20 ATS-tested templates, score your CV on 28 checks, and export clean PDF or DOCX.</aside>`;
  const past = dates.filter(d => d !== date).slice(0, 7);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${jesc(title)}</title>
<meta name="description" content="${jesc(desc)}">
<link rel="canonical" href="${JOBS_SITE}${path}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Fitwise">
<meta property="og:title" content="${jesc(title)}"><meta property="og:description" content="${jesc(desc)}">
<meta property="og:url" content="${JOBS_SITE}${path}"><meta property="og:image" content="${JOBS_SITE}/og-jobs.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${jesc(title)}"><meta name="twitter:description" content="${jesc(desc)}"><meta name="twitter:image" content="${JOBS_SITE}/og-jobs.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css"><link rel="stylesheet" href="/jobs.css"><meta name="theme-color" content="#5b2bf5">
</head><body class="jobs">
<a class="skip" href="#main">Skip to content</a>
${SITE_HEADER}
<main id="main">
<section class="jhero"><div class="wrap">
<p class="eyebrow">Daily list · ${jesc(pd)}</p>
<h1>Today's English-speaking tech jobs in Europe</h1>
<p class="stats"><span><b>${n}</b> jobs</span>${nv ? `<span><b>${nv}</b> with visa sponsorship ✅</span>` : ""}<span>Visa sponsorship ✅ first</span></p>
<p class="lead">QA, AI QA, AIOps, platform, test and engineering managers, ML and data engineers. ${feed && feed.window ? jesc(String(feed.window).charAt(0).toUpperCase() + String(feed.window).slice(1)) + ". " : ""}Every job links to the employer's own page.</p>
<div class="fwstrip"><div><b>Apply with a CV that fits.</b> Tap <i>Tailor my CV for this job</i> on any card: match score, keywords, and your CV back in its own format. Free to try, nothing invented. <a href="#fitwise">How it works</a></div></div>
</div></section>
<section class="jlist"><div class="wrap">
${n ? `<form class="filters" onsubmit="return false">
<input id="q" type="search" placeholder="Search title, company or city" aria-label="Search" enterkeyhint="search">
<select id="fc" aria-label="Country">${opts(countries.map(c => [c, `${flagOf(c)} ${JOB_COUNTRIES[c] || c} (${cCount(c)})`]), "All countries")}</select>
<select id="fk" aria-label="Role">${opts(cats.map(c => [c, c]), "All roles")}</select>
<select id="fm" aria-label="Work mode">${opts([["remote", "Remote"], ["hybrid", "Hybrid"], ["onsite", "On-site"]], "Any work mode")}</select>
<label class="vonly"><input type="checkbox" id="fv"> Visa ✅ only</label><label class="vonly" id="sortMatchWrap" hidden><input type="checkbox" id="fsm"> Sort by Best Match</label>
<p class="shown" id="shown" aria-live="polite">Showing all ${n} jobs</p>
</form>
<h2 class="sec" id="visa">Visa sponsorship ✅ <span class="cnt" data-sec="visa">${visa.length}</span></h2>
<p class="secnote">The ad mentions visa or relocation support, or (Netherlands) the employer is on the IND public register of recognised sponsors. Always confirm with the employer.</p>
<div class="cards" id="cv">${visa.map(([j, i]) => jobCard(j, i)).join("") || `<p class="empty">No sponsored roles in today's list.</p>`}</div>
${promo}
<h2 class="sec" id="more">More English-speaking roles <span class="cnt" data-sec="more">${rest.length}</span></h2>
<p class="secnote">No visa sponsorship stated in the ad.</p>
<div class="cards" id="cm">${rest.map(([j, i]) => jobCard(j, i)).join("") || `<p class="empty">None today.</p>`}</div>
<p class="empty" id="none" hidden>No jobs match these filters. <a href="#" id="clr">Clear filters</a></p>`
: `<p class="empty big">Today's list is being put together. Check back later today${past.length ? ", or open an earlier day below" : ""}.</p>`}
${past.length ? `<p class="past">Earlier lists: ${past.map(d => `<a href="/jobs/${d}">${jesc(prettyDate(d))}</a>`).join(" · ")}</p>` : ""}
</div></section>
<section id="fitwise" class="fwsell"><div class="wrap">
<h2>Tailor your CV to the job in 30 seconds</h2>
<ul class="fwf">
<li><b>Match score + keywords</b><span>See how well your CV fits the ad, the keywords you already have, and the ones you're missing.</span></li>
<li><b>Your CV, your own format</b><span>Upload Word or PDF. Your Word file is edited in place; a PDF is rebuilt in your layout. Download free.</span></li>
<li><b>Nothing made up</b><span>Fitwise only reorders and rewords what is already in your CV. Missing keywords are shown to you, never slipped in.</span></li>
<li><b>US, UK or Europass version</b><span>Preview free. Download for 1 credit; a full cover letter is 1 credit too.</span></li>
</ul>
<div class="fwprice"><p><b>Pre-launch: 1 free tailoring per person</b>. No card, no subscription. Credits are prepaid: 10 for $5, 30 for $12, 70 for $25. <span class="muted">Credit payments open soon; early access sign-up on the main page.</span></p>
<p><b>Autopilot</b> (finds matches and tailors a CV per job): <span class="soon">coming soon</span> · <a href="/#pricing">join the waitlist</a></p></div>
<p class="center"><a class="btn" href="/builder">Open AI Resume Builder</a> <a class="btn ghost" href="/ats-checker">Run Free ATS Scan</a></p>
</div></section>
<section class="sub"><div class="wrap">
<h2>Get tomorrow's list in your inbox</h2>
<p class="muted center">The daily email is starting soon. Leave your email and you'll get it from the first send. Unsubscribe any time.</p>
<form id="subf" class="subf"><input id="sube" type="email" placeholder="you@example.com" required autocomplete="email"><button class="btn" id="subb">Keep me posted</button></form>
<p class="center small" id="subm" aria-live="polite"></p>
</div></section>
<p class="wrap small muted disc">Jobs are collected from public company career pages and job boards. Fitwise is not affiliated with these employers. Details can change; the employer's page is the source of truth.</p>
</main>
${SITE_FOOTER}
<script src="/fw-jobs-match.js" defer></script>
<script>
(function(){var $=function(i){return document.getElementById(i)};var cards=[].slice.call(document.querySelectorAll(".jc"));var total=cards.length;
function run(){if(!total)return;var q=($("q").value||"").toLowerCase().trim(),c=$("fc").value,k=$("fk").value,m=$("fm").value,v=$("fv").checked,n=0,cnt={visa:0,more:0};
cards.forEach(function(e){var ok=(!c||e.dataset.c===c)&&(!k||e.dataset.k===k)&&(!m||e.dataset.m===m)&&(!v||e.dataset.v==="1")&&(!q||q.split(/\s+/).every(function(w){return e.dataset.q.indexOf(w)>=0}));e.hidden=!ok;if(ok){n++;cnt[e.dataset.v==="1"?"visa":"more"]++}});
document.querySelectorAll(".cnt").forEach(function(s){s.textContent=cnt[s.dataset.sec]});
["visa","more"].forEach(function(s){var show=cnt[s]>0||(!q&&!c&&!k&&!m&&!v);var h=$(s);h.hidden=!show;h.nextElementSibling.hidden=!show;h.nextElementSibling.nextElementSibling.hidden=!show});
$("more").hidden=$("more").hidden||v;$("more").nextElementSibling.hidden=$("more").hidden;$("cm").hidden=$("more").hidden;
$("none").hidden=n>0;$("shown").textContent=n===total?"Showing all "+total+" jobs":"Showing "+n+" of "+total+" jobs"}
if(total){["q","fc","fk","fm","fv"].forEach(function(i){$(i).addEventListener("input",run);$(i).addEventListener("change",run)});$("clr").onclick=function(ev){ev.preventDefault();$("q").value="";$("fc").value="";$("fk").value="";$("fm").value="";$("fv").checked=false;run()}}
$("subf").onsubmit=function(ev){ev.preventDefault();var b=$("subb");b.disabled=true;fetch("/api/jobs/subscribe",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:$("sube").value.trim(),country:$("fc")?$("fc").value:""})}).then(function(r){return r.json().then(function(j){return[r.ok,j]})}).then(function(a){b.disabled=false;$("subm").textContent=a[0]?"You're on the list. You'll get the first daily email at "+$("sube").value.trim()+".":(a[1].error||"Try again.")}).catch(function(){b.disabled=false;$("subm").textContent="Network error, try again."})};
})();
document.querySelectorAll(".menu .menupanel a").forEach(function(a){a.addEventListener("click",function(){var m=a.closest("details");if(m)m.open=false})});
</script></body></html>`;
}

async function jobsPage(p, env) {
  const m = p.match(/^\/jobs\/?(\d{4}-\d{2}-\d{2})?\/?$/);
  if (!m) return new Response("Not found", { status: 404 });
  const date = m[1] || null;
  const feed = await getFeed(env, date);
  if (date && !feed) {
    const html = jobsHTML(null, await feedDates(env), false).replace("Today's list is being put together. Check back later today", "There is no list for " + prettyDate(date));
    return new Response(html, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
  }
  return new Response(jobsHTML(feed, await feedDates(env), !date), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=120" } });
}

async function routeJobs(p, req, env, url) {
  if (p === "/api/jobs" && req.method === "GET") {
    const d = url.searchParams.get("date"); const f = await getFeed(env, d && DATE_RE.test(d) ? d : null);
    return f ? json({ date: f.date, count: f.jobs.length, visa: f.jobs.filter(j => j.visa).length, jobs: f.jobs }) : json({ error: "no list" }, 404);
  }
  if (p === "/api/jobs/subscribe" && req.method === "POST") {
    const b = await req.json().catch(() => ({})); const email = String(b.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email." }, 400);
    const k = "sub:jobs:" + (await sha(email)); const had = await store(env).get(k);
    await store(env).put(k, JSON.stringify({ email, country: String(b.country || "").slice(0, 4), at: had ? JSON.parse(had).at : new Date().toISOString() }));
    if (!had) await bump(env, "stat:jobsubs");
    return json({ ok: true });
  }
  if (p === "/api/admin/jobclicks") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({})); const r = String(b.reset || "");
      const keys = r === "all" ? (await store(env).list({ prefix: "stat:jgo:" })).keys.map(k => k.name) : (JID_RE.test(r) ? ["stat:jgo:" + r] : []);
      for (const k of keys) await store(env).delete(k);
      return json({ ok: true, reset: keys.length });
    }
    return json(await jobClickStats(env));
  }
  if (p === "/api/admin/jobs") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    if (req.method === "GET") {
      const dates = await feedDates(env); const out = [];
      for (const d of dates.slice(0, 14)) { const f = await getFeed(env, d); out.push({ date: d, count: f ? f.jobs.length : 0, visa: f ? f.jobs.filter(j => j.visa).length : 0 }); }
      const subs = (await store(env).list({ prefix: "sub:jobs:" })).keys.length;
      return json({ latest: await store(env).get("jobs:latest"), feeds: out, subscribers: subs });
    }
    if (req.method === "POST") {
      const b = await req.json().catch(() => null); if (!b) return json({ error: "bad json" }, 400);
      const date = String(b.date || ""); if (!DATE_RE.test(date)) return json({ error: "need date YYYY-MM-DD" }, 400);
      if (b.delete) { await store(env).delete("jobs:feed:" + date); return json({ ok: true, deleted: date }); }
      const f = feedFromBody(b); if (!f.jobs.length) return json({ error: "no valid jobs (need title, company, url)" }, 400);
      await assignJobIds(env, f.jobs, date);
      await store(env).put("jobs:feed:" + date, JSON.stringify({ jobs: f.jobs, window: f.window, updated: new Date().toISOString() }));
      const cur = await store(env).get("jobs:latest");
      if (b.latest !== false && (!cur || date >= cur)) await store(env).put("jobs:latest", date);
      return json({ ok: true, date, links: f.jobs.map(j => ({ id: j.id, short_url: JOBS_SITE + "/j/" + j.id, title: j.title, company: j.company, city: j.city, country: JOB_COUNTRIES[j.country] || j.country, visa_sponsored: j.visa })), count: f.jobs.length, visa: f.jobs.filter(j => j.visa).length, dropped: (Array.isArray(b.jobs) ? b.jobs.length : 0) - f.jobs.length, latest: await store(env).get("jobs:latest") });
    }
  }
  return null;
}


// ---------- Per-job pages (/j/<id>, /j/<id>/go) — added 1 Nov 2026 ----------
// id = 6 chars (base36) of sha256(job url); the same url keeps its id on later days (index row jobs:id:<id>).
const JID_RE = /^[a-z0-9]{5,8}$/;
async function jobIdCands(u) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(u).trim())));
  let n = 0n; for (const b of d) n = (n << 8n) | BigInt(b);
  const s = n.toString(36).padStart(50, "0").slice(-48);
  const out = []; for (let k = 0; k + 6 <= s.length; k += 6) out.push(s.slice(k, k + 6)); return out;
}
async function assignJobIds(env, jobs, date) {
  const used = new Set(); const st = store(env);
  for (const j of jobs) {
    const cands = await jobIdCands(j.url); let pick = null;
    for (const c of cands) {
      if (used.has(c)) continue;
      const row = await st.get("jobs:id:" + c);
      if (row) { try { if (JSON.parse(row).url !== j.url) continue; } catch {} }
      pick = c; break;
    }
    if (!pick) pick = cands[0] + String(used.size % 10);
    used.add(pick); j.id = pick;
    await st.put("jobs:id:" + pick, JSON.stringify({ url: j.url, date, job: j }));
  }
}
async function getJobById(env, id) {
  if (!JID_RE.test(id || "")) return null;
  const row = await store(env).get("jobs:id:" + id); if (!row) return null;
  try { const r = JSON.parse(row); return r && r.job ? Object.assign({}, r.job, { id, listDate: r.date }) : null; } catch { return null; }
}
function jobPlaceParts(j) {
  const cn = JOB_COUNTRIES[j.country] || j.country || ""; const low = cn.toLowerCase();
  const segs = String(j.city || "").split(/\s*[|,·]\s*/).map(x => x.trim()).filter(Boolean)
    .map(x => low ? x.replace(new RegExp("[\\s-]*\\b(the\\s+)?" + low.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$", "i"), "").trim() : x)
    .filter(x => x && x.toLowerCase() !== low && x.toUpperCase() !== j.country);
  const city = segs.filter((x, k) => segs.findIndex(y => y.toLowerCase() === x.toLowerCase()) === k).join(", ");
  return { city, country: cn };
}
const JD_CSS = `<style>
.jd{max-width:640px;margin:0 auto;padding:22px 18px 40px}
.jd .crumb{font-size:.92rem;margin:0 0 14px}.jd .crumb a{color:var(--g);font-weight:600;text-decoration:none}
.jd .card2{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:22px 20px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.jd .co{font-weight:700;color:var(--mut);font-size:.98rem;margin:0 0 4px}
.jd h1{font-size:1.55rem;line-height:1.25;margin:0 0 14px;letter-spacing:-.01em}
.jd dl{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;margin:0 0 18px;font-size:.98rem}
.jd dt{color:var(--mut)}.jd dd{margin:0;font-weight:600}
.jd .vz{border-radius:12px;padding:12px 14px;margin:0 0 20px;font-size:.98rem;background:#f3f1ea;border:1px solid var(--line)}
.jd .vz.y{background:#e8f5ef;border-color:#bfe3d3}.jd .vz b{display:block}.jd .vz small{display:block;color:var(--mut);margin-top:4px;font-size:.88rem}
.jd .acts{display:flex;flex-direction:column;gap:10px}.jd .acts .btn{width:100%;box-sizing:border-box}
.jd .hint{color:var(--mut);font-size:.88rem;margin:10px 0 0;text-align:center}
.jd .pl{margin:18px 0 0;font-size:.92rem;color:var(--mut);background:#fff8ee;border:1px solid #f0dcc0;border-radius:12px;padding:10px 12px}
.jd .all{display:block;text-align:center;margin:22px 0 0;font-weight:700;color:var(--g)}
@media(min-width:720px){.jd{padding-top:40px}.jd h1{font-size:1.9rem}.jd .acts{flex-direction:row}.jd .acts .btn{width:auto;flex:1}}
</style>`;
function jobPageShell(title, desc, canon, body, status, robots) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${jesc(title)}</title>
<meta name="description" content="${jesc(desc)}">${robots ? `<meta name="robots" content="${robots}">` : ""}
${canon ? `<link rel="canonical" href="${canon}">` : ""}
<meta property="og:type" content="website"><meta property="og:site_name" content="Fitwise">
<meta property="og:title" content="${jesc(title)}"><meta property="og:description" content="${jesc(desc)}">
${canon ? `<meta property="og:url" content="${canon}">` : ""}<meta property="og:image" content="${JOBS_SITE}/og-jobs.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${jesc(title)}"><meta name="twitter:description" content="${jesc(desc)}"><meta name="twitter:image" content="${JOBS_SITE}/og-jobs.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css"><link rel="stylesheet" href="/jobs.css"><meta name="theme-color" content="#5b2bf5">
${JD_CSS}
</head><body class="jobs jobdetail">
<a class="skip" href="#main">Skip to content</a>
${SITE_HEADER}
<main id="main">${body}</main>
${SITE_FOOTER}
<script src="/fw-jobs-match.js" defer></script>
</body></html>`, { status: status || 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": status && status !== 200 ? "no-store" : "public, max-age=300" } });
}
function applyLabel(u) {
  let h = ""; try { h = new URL(u).hostname.toLowerCase(); } catch (e) {}
  const boards = { "linkedin.com": "LinkedIn", "indeed.com": "Indeed", "indeed.nl": "Indeed", "glassdoor.com": "Glassdoor", "glassdoor.nl": "Glassdoor" };
  for (const [d, n] of Object.entries(boards)) if (h === d || h.endsWith("." + d)) return "Apply on " + n;
  return "Apply on company site";
}
function jobDetailHTML(j) {
  const { city, country } = jobPlaceParts(j);
  const place = [city, country].filter(Boolean).join(", ");
  const ml = j.mode === "other" ? j.remote : modeLabel[j.mode];
  const ogTitle = `${j.title} at ${j.company}${city || country ? " · " + (city || country) : ""}`;
  const desc = `${j.title} at ${j.company}${place ? " in " + place : ""}${ml ? " (" + ml + ")" : ""}. Visa sponsorship: ${j.visa ? "Yes ✅" : "not stated"}. Apply now, or tailor your CV to this job with Fitwise first.`;
  const tq = new URLSearchParams({ job: j.id || j.url, url: j.url, title: j.title, company: j.company, location: place, from: "jobs" }).toString();
  const posted = DATE_RE.test(j.posted || "") ? prettyDate(j.posted) : (j.posted || "");
  const rows = [["Location", place ? `${flagOf(j.country)} ${jesc(place)}` : ""], ["Work mode", ml ? jesc(ml) : ""], ["Posted", posted ? jesc(posted) : ""], ["Field", j.category ? jesc(catLabel(j.category)) : ""]].filter(r => r[1]);
  const body = `<div class="jd">
<p class="crumb"><a href="/jobs">← All of today's jobs</a></p>
<article class="card2" id="jdCard" data-id="${jesc(j.id)}" data-title="${jesc(j.title)}" data-company="${jesc(j.company)}" data-place="${jesc(place)}" data-url="/j/${jesc(j.id)}" data-cat="${jesc(catLabel(j.category))}">
<p class="co">${jesc(j.company)}</p>
<h1>${jesc(j.title)}</h1>
${rows.length ? `<dl>${rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("")}</dl>` : ""}
${j.visa ? `<p class="vz y"><b>Visa sponsorship: Yes ✅</b>${j.evidence ? `<small>${jesc(j.evidence)}</small>` : ""}</p>` : `<p class="vz"><b>Visa sponsorship: Not stated</b><small>The ad does not mention visa sponsorship. Ask the employer if you need it.</small></p>`}
<div id="jdMatchBox" class="jd-match"></div>
<div class="acts">
<a class="btn big" href="/j/${jesc(j.id)}/go" target="_blank" rel="noopener nofollow">${applyLabel(j.url)} ↗</a>
<a class="btn big ghost" href="/builder?${jesc(tq)}">Tailor CV for this Role</a>
<button type="button" class="btn big ghost" id="jdSaveBtn">Save to Tracker</button>
</div>
<p class="hint">Opens the original job ad in a new tab · Or <a href="/tailor?${jesc(tq)}">edit your own DOCX/PDF in place</a>.</p>
</article>
<a class="all" href="/jobs">See all today's jobs →</a>
</div>`;
  return jobPageShell(ogTitle, desc, `${JOBS_SITE}/j/${j.id}`, body, 200);
}
function jobNotFoundHTML() {
  const body = `<div class="jd"><article class="card2">
<p class="co">Job not found</p><h1>This job link has expired or doesn't exist</h1>
<p>The job may have been taken down, or the link was mistyped. Today's full list is one tap away.</p>
<div class="acts"><a class="btn big" href="/jobs">See all today's jobs</a></div>
</article></div>`;
  return jobPageShell("Job not found · Fitwise", "This job link has expired. See today's English-speaking tech jobs in Europe on Fitwise.", "", body, 404, "noindex");
}
async function jobDetailPage(p, req, env) {
  const m = p.match(/^\/j\/([A-Za-z0-9]{1,16})(\/go)?\/?$/);
  if (!m) return jobNotFoundHTML();
  const id = m[1].toLowerCase(); const j = await getJobById(env, id);
  if (!j) return jobNotFoundHTML();
  if (m[2]) {
    if (req.method === "GET") { try { await bump(env, "stat:jgo:" + id); } catch (e) {} }
    return new Response(null, { status: 302, headers: { location: j.url, "cache-control": "no-store", "referrer-policy": "no-referrer-when-downgrade" } });
  }
  return jobDetailHTML(j);
}
async function jobClickStats(env) {
  const r = await store(env).list({ prefix: "stat:jgo:" }); const out = []; let total = 0;
  for (const k of r.keys) { const id = k.name.slice(9); const n = await kvNum(env, k.name); if (!n) continue; total += n; let t = ""; try { const g = await getJobById(env, id); if (g) t = g.title + " – " + g.company; } catch (e) {} out.push({ id, clicks: n, job: t }); }
  out.sort((a, b) => b.clicks - a.clicks);
  return { total, by_job: out.slice(0, 200) };
}
