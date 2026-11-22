
import { Stagehand, browserbase } from "@browserbasehq/stagehand"; import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("/home/user/tab/.vendor-capability.json", "utf8"));
const S = "https://fitwise.sites.tab.bot", D = "/home/user/tab/files/saas-cvtailor/";
const OUT = D + "shots/gate/"; fs.mkdirSync(OUT, { recursive: true });
const KEY = fs.readFileSync(D + "ADMIN_SECRET.txt", "utf8").trim();
const mint = async admin => (await (await fetch(S + "/api/admin/test-session", { method: "POST", headers: { "content-type": "application/json", "x-admin-key": KEY }, body: JSON.stringify({ admin }) })).json()).login_path;
const out = {};
const browser = await browserbase.launch({ apiKey: V.token, baseUrl: `${V.base_url}/browserbase`, projectId: "f2ae15a0-a894-4419-977f-d52f52483f0c", keepAlive: false, browserSettings: { verified: false, viewport: { width: 390, height: 844 } }, userMetadata: { site: "fitwise", task: process.env.TAB_TASK_ID } });
const sh = await Stagehand.create({ browser, model: { generate: async () => ({ role: "assistant", outputFormat: "text", content: "" }) }, logging: { level: "error" } });
const shot = async (page, n, full) => fs.writeFileSync(OUT + n + ".png", await page.screenshot({ fullPage: !!full }));
const ev = (page, f) => page.evaluate(f);
try {
  const page = await browser.context.activePage();
  try { await page.setViewportSize(390, 844, { deviceScaleFactor: 2 }); } catch (e) {}
  // 1. visitor from LinkedIn post, normal phone browser
  await page.goto(S + "/j/q3w8em?utm_source=linkedin&utm_medium=social&utm_campaign=zz_browsercheck", { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(3500);
  out.gate = await ev(page, () => ({ h1: document.querySelector("h1") && document.querySelector("h1").textContent, gbtn: !!document.querySelector("#gBtn iframe, #gBtn div[role=button], #gBtn [aria-labelledby]"), gbtnHTML: (document.getElementById("gBtn") || {}).innerHTML ? document.getElementById("gBtn").innerHTML.length : 0, err: (document.getElementById("gErr") || {}).textContent, ua: navigator.userAgent, applyLink: !!document.querySelector('a[href*="/go"]') }));
  await shot(page, "1_gate_job");
  // 2. same page as LinkedIn's in-app browser (server sees the LinkedIn user agent)
  await page.setExtraHTTPHeaders({ "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]/9.30.1" });
  await page.goto(S + "/j/q3w8em?utm_source=linkedin", { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(2000);
  out.inapp = await ev(page, () => ({ box: !!document.getElementById("fwIab"), text: (document.getElementById("fwIab") || {}).innerText }));
  await shot(page, "2_gate_linkedin_inapp");
  await page.setExtraHTTPHeaders({});
  // 3. signed in (test session) -> lands back on the exact page incl. query
  const lp = await mint(false);
  await page.goto(S + lp + "&next=" + encodeURIComponent("/j/q3w8em?utm_source=linkedin"), { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(1500);
  out.after = await ev(page, () => ({ url: location.pathname + location.search, h1: document.querySelector("h1").textContent, apply: (document.querySelector('a[href$="/go"]') || {}).textContent, acct: (document.querySelector(".fwacct") || {}).innerText }));
  await shot(page, "3_job_signed_in");
  // 4. jobs list + filters
  await page.goto(S + "/jobs", { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(1500);
  out.jobs = await ev(page, () => ({ cards: document.querySelectorAll("a[href^='/j/']").length, text: (document.querySelector("main").innerText || "").slice(0, 160) }));
  // 5. events
  await page.goto(S + "/events", { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(3000);
  out.events = await ev(page, () => ({ signed: document.body.classList.contains("signed"), count: (document.getElementById("evCount") || {}).textContent, items: document.querySelectorAll("#evList .eve").length }));
  // 6. pricing
  await page.goto(S + "/pricing", { waitUntil: "load", timeout: 60000 }); out.pricing = await ev(page, () => document.querySelector("h1").textContent);
  // 7. tailoring end-to-end
  await page.goto(S + "/tailor", { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(1500);
  await ev(page, () => { window.__errs = []; window.addEventListener("error", e => window.__errs.push(String(e.message))); });
  out.email = await ev(page, () => ({ v: document.getElementById("email").value, ro: document.getElementById("email").readOnly, hint: (document.getElementById("email").parentElement.nextElementSibling || {}).textContent }));
  const b64 = fs.readFileSync(D + "testdata/Marta_Kowalczyk_CV.docx").toString("base64");
  await page.evaluate(([b64]) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const f = new File([u], "Marta_Kowalczyk_CV.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }); const dt = new DataTransfer(); dt.items.add(f); const inp = document.getElementById("cvfile"); inp.files = dt.files; inp.dispatchEvent(new Event("change", { bubbles: true })); }, [b64]);
  for (let i = 0; i < 40; i++) { const h = await ev(page, () => document.getElementById("cvhint").textContent); if (/^Read |Couldn/.test(h)) { out.cvhint = h.slice(0, 80); break; } await page.waitForTimeout(500); }
  const jd = fs.readFileSync(D + "testdata/job_celonis.txt", "utf8");
  await page.evaluate(([jd]) => { const s = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); }; s("jd", jd); s("jtitle", "Senior Data Analyst"); s("jco", "Celonis"); }, [jd]);
  await page.locator("#go").click();
  const okRes = await page.waitForSelector("#out:not([hidden])", { state: "visible", timeout: 45000 });
  await page.waitForTimeout(2500);
  out.tailor = await ev(page, () => ({ shown: !document.getElementById("out").hidden, err: document.getElementById("err").textContent, score: (document.getElementById("scoreN") || {}).textContent, credits: (document.querySelector(".credbal") || {}).textContent, errs: window.__errs }));
  out.tailor.ok = okRes;
  await ev(page, () => document.getElementById("out").scrollIntoView()); await page.waitForTimeout(800);
  await shot(page, "4_tailor_result");
  // original-format download (free)
  out.dl = await ev(page, async () => { const r = await fetch("/api/my/cvs", { credentials: "same-origin" }); return r.json(); });
  // second tailoring must be refused (1 free per account, pre-launch)
  out.second = await ev(page, async () => { const r = await fetch("/api/tailor", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ cv: document.getElementById("cv").value, jd: document.getElementById("jd").value, email: "someone.else@example.com", device: "zztest-dev-2" }) }); return [r.status, (await r.json()).code]; });
  // cover letter without credits -> 402, credits endpoint answers
  out.credits = await ev(page, async () => { const r = await fetch("/api/credits", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "x@example.com" }) }); return [r.status, (await r.json()).credits]; });
  // 8. account page
  await page.goto(S + "/account", { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(2000);
  out.account = await ev(page, () => document.getElementById("cvl").innerText.slice(0, 200));
  // 9. non-admin /admin -> 404
  const r404 = await page.goto(S + "/admin", { waitUntil: "load", timeout: 60000 }); out.admin_nonadmin = r404 && r404.status ? r404.status() : null;
  // 10. admin test session
  await ev(page, async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }); });
  const alp = await mint(true);
  await page.setViewportSize(1280, 900, { deviceScaleFactor: 1 });
  const ra = await page.goto(S + alp + "&next=/admin", { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(4000);
  out.admin = await ev(page, () => ({ url: location.pathname, tabs: [...document.querySelectorAll("#tabs button")].map(b => b.textContent), kpis: [...document.querySelectorAll("#ovb .k div")].map(d => d.innerText.replace(/\n/g, " ")), cards: [...document.querySelectorAll("#ovb .c h2")].map(h => h.textContent) }));
  await shot(page, "5_admin_overview", true);
  for (const [t, n] of [["us", "6_admin_users"], ["cv", "7_admin_resumes"], ["bi", "8_admin_billing"], ["co", "9_admin_content"]]) {
    await ev(page, t => document.querySelector(`#tabs button[data-t="${t}"]`).click(), t); await page.waitForTimeout(2500);
    out["admin_" + t] = await ev(page, t => document.getElementById(t).innerText.slice(0, 300), t);
    await shot(page, n);
  }
  await ev(page, async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }); });
} catch (e) { out.error = String(e && e.stack || e).slice(0, 800); }
finally { try { await sh.close(); } catch (e) {} try { await browser.close(); } catch (e) {} }
fs.writeFileSync(OUT + "result.json", JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
