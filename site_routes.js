
// ---------- site pages: pretty URLs, robots, sitemap, 404, contact, housekeeping ----------
const SITE_PAGES = ["/ats-checker", "/templates", "/builder", "/cover-letter", "/cover-letter-checker", "/dashboard", "/signin", "/tailor", "/pricing", "/privacy", "/terms", "/about", "/contact", "/checklist", "/agent-checklist"];  // 4 Nov 2026: "/courses" removed (Suresh), pages parked in _parked_courses/
const COURSE_SLUGS = [];  // 4 Nov 2026: Courses removed on Suresh's order; old slugs in _parked_courses/README.txt
async function assetFetch(env, req, path) {
  let r = await env.ASSETS.fetch(new Request(new URL(path, req.url).toString(), { method: "GET", headers: req.headers }));
  if (r.status >= 300 && r.status < 400 && r.headers.get("location")) { const loc = new URL(r.headers.get("location"), req.url); r = await env.ASSETS.fetch(new Request(loc.toString(), { method: "GET", headers: req.headers })); }
  return r;
}
async function notFound(env, req) {
  const r = await assetFetch(env, req, "/notfound.html");
  return new Response(r.ok ? r.body : "Page not found", { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
}
async function sitePage(p, req, env) {
  if (p === "/" ) { const u0 = new URL(req.url); if (u0.searchParams.has("job") || u0.searchParams.has("paid")) return Response.redirect(new URL("/tailor" + u0.search, req.url).toString(), 302); }
  if (p === "/robots.txt") return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${JOBS_SITE}/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
  if (p === "/sitemap.xml") {
    let dates = []; try { dates = (await feedDates(env)).slice(0, 30); } catch {}
    const urls = [["/", "weekly", "1.0"], ["/builder", "weekly", "0.95"], ["/ats-checker", "weekly", "0.95"], ["/templates", "weekly", "0.9"], ["/cover-letter", "weekly", "0.9"], ["/cover-letter-checker", "weekly", "0.85"], ["/jobs", "daily", "0.95"], ["/tailor", "monthly", "0.85"], ["/pricing", "monthly", "0.8"], ["/events", "weekly", "0.75"], ["/checklist", "monthly", "0.75"], ["/agent-checklist", "monthly", "0.75"]].concat([ ["/about", "monthly", "0.5"], ["/contact", "yearly", "0.4"], ["/privacy", "yearly", "0.3"], ["/terms", "yearly", "0.3"]]).concat(dates.map(d => ["/jobs/" + d, "never", "0.5"]));
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` + urls.map(([u, f, pr]) => `<url><loc>${JOBS_SITE}${u}</loc><changefreq>${f}</changefreq><priority>${pr}</priority></url>`).join("\n") + `\n</urlset>\n`;
    return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
  }
  const k = p.length > 1 ? p.replace(/\/+$/, "") : p;
  if (SITE_PAGES.includes(k)) { const r = await assetFetch(env, req, k + ".html"); return r.ok ? new Response(r.body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } }) : notFound(env, req); }
  const cm = p.match(/^\/courses\/([a-z0-9-]{1,80})(\.html)?\/?$/);
  if (cm) { if (!COURSE_SLUGS.includes(cm[1])) return notFound(env, req); if (cm[2]) return Response.redirect(new URL("/courses/" + cm[1], req.url).toString(), 301);
    const r = await assetFetch(env, req, "/courses/" + cm[1] + ".html"); return r.ok ? new Response(r.body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } }) : notFound(env, req); }
  if (p.endsWith(".html") && SITE_PAGES.includes(p.slice(0, -5))) return Response.redirect(new URL(p.slice(0, -5), req.url).toString(), 301);
  if (p === "/notfound.html" || p === "/notfound") return notFound(env, req);
  return null;
}
let _lastSweep = 0;
async function sweepExpired(env) {
  if (Date.now() - _lastSweep < 3600e3) return; _lastSweep = Date.now();
  try { const last = +(await store(env).get("sweep:last") || 0); if (Date.now() - last < 3600e3) return;
    await env.DB.prepare("DELETE FROM kv WHERE exp IS NOT NULL AND exp < ?").bind(Math.floor(Date.now() / 1000)).run();
    await store(env).put("sweep:last", String(Date.now())); } catch {}
}
async function routeSite(p, req, env) {
  if (p === "/api/contact" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const email = String(b.email || "").trim().toLowerCase(), message = String(b.message || "").trim().slice(0, 4000);
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email so we can reply." }, 400);
    if (message.length < 5) return json({ error: "Write a short message." }, 400);
    const ip = req.headers.get("cf-connecting-ip") || "0", day = new Date().toISOString().slice(0, 10);
    const kI = "q:c:" + (await sha(ip)).slice(0, 24) + ":" + day;
    if ((await kvNum(env, kI)) >= 8) return json({ error: "Too many messages today. Please try again tomorrow." }, 429);
    await bump(env, kI, 172800);
    const key = "contact:" + new Date().toISOString() + ":" + crypto.randomUUID().slice(0, 8);
    await store(env).put(key, JSON.stringify({ name: String(b.name || "").slice(0, 80), email, topic: String(b.topic || "").slice(0, 60), message, at: new Date().toISOString() }));
    await bump(env, "stat:contact");
    return json({ ok: true });
  }
  // ---- course launch list (3 Nov 2026): public email capture on /checklist and /agent-checklist ----
  if (p === "/api/notify" && req.method === "POST") {
    return json({ ok: false, error: "This sign-up list is closed." }, 410); // 4 Nov 2026: no new launch-list sign-ups (courses parked); stored kv records untouched
    const b = await req.json().catch(() => ({}));
    if (b.website) return json({ ok: true }); // honeypot
    const email = String(b.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email address." }, 400);
    const src = ["checklist", "agent-checklist", "course"].includes(String(b.src)) ? String(b.src) : "other";
    const course = COURSE_SLUGS.includes(String(b.course || "")) ? String(b.course) : null; // Courses tab (3 Nov 2026): which course this sign-up is for
    const ip = req.headers.get("cf-connecting-ip") || "0", day = new Date().toISOString().slice(0, 10);
    const kI = "q:n:" + (await sha(ip)).slice(0, 24) + ":" + day;
    if ((await kvNum(env, kI)) >= 10) return json({ error: "Too many sign-ups from this network today. Please try again tomorrow." }, 429);
    await bump(env, kI, 172800);
    const key = "notify:course:" + (await sha(email)).slice(0, 32);
    const prevS = await store(env).get(key);
    if (prevS) {
      const prev = JSON.parse(prevS || "{}"); const cs = Array.isArray(prev.courses) ? prev.courses : (prev.course ? [prev.course] : []);
      if (!course || cs.includes(course)) return json({ ok: true, already: true });
      cs.push(course); prev.courses = cs; prev.course = prev.course || course; prev.updated = new Date().toISOString();
      await store(env).put(key, JSON.stringify(prev));
      try { if (typeof track === "function") track(req, "launch_notify", { obj: "course:" + course }); } catch (e) {}
      return json({ ok: true });
    }
    await store(env).put(key, JSON.stringify(course ? { email, src, course, courses: [course], at: new Date().toISOString() } : { email, src, at: new Date().toISOString() }));
    await bump(env, "stat:notify");
    try { if (typeof track === "function") track(req, "launch_notify", { obj: course ? "course:" + course : src }); } catch (e) {}
    return json({ ok: true });
  }
  if (p === "/api/admin/notify") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const em = String(b.delete_email || "").trim().toLowerCase();
      if (!em) return json({ error: "need delete_email" }, 400);
      const key = "notify:course:" + (await sha(em)).slice(0, 32);
      const had = !!(await store(env).get(key)); await store(env).delete(key);
      return json({ ok: true, deleted: had ? em : null });
    }
    const out = []; let cursor;
    do { const r = await store(env).list({ prefix: "notify:course:", cursor }); for (const k of r.keys) out.push(JSON.parse((await store(env).get(k.name)) || "{}")); cursor = r.list_complete === false ? r.cursor : undefined; } while (cursor);
    out.sort((a, b) => String(b.at).localeCompare(String(a.at)));
    if (new URL(req.url).searchParams.get("format") === "csv") return new Response("email,source,courses,joined\n" + out.map(x => [x.email, x.src, (x.courses || (x.course ? [x.course] : [])).join(" "), x.at].join(",")).join("\n") + "\n", { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=course-launch-list.csv" } });
    return json({ count: out.length, by_source: out.reduce((m, x) => (m[x.src] = (m[x.src] || 0) + 1, m), {}), by_course: out.reduce((m, x) => ((x.courses || (x.course ? [x.course] : [])).forEach(c => m[c] = (m[c] || 0) + 1), m), {}), list: out });
  }
  if (p === "/api/admin/contact") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    if (req.method === "POST") { const b = await req.json().catch(() => ({})); if (b.delete && String(b.delete).startsWith("contact:")) { await store(env).delete(String(b.delete)); return json({ ok: true, deleted: b.delete }); } return json({ error: "need delete key" }, 400); }
    const r = await store(env).list({ prefix: "contact:" }); const out = [];
    for (const k of r.keys.slice(-200)) out.push({ key: k.name, ...JSON.parse((await store(env).get(k.name)) || "{}") });
    return json({ count: out.length, messages: out.reverse() });
  }
  return null;
}
