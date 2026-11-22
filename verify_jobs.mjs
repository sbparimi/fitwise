import { Stagehand, browserbase } from "@browserbasehq/stagehand"; import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("/home/user/tab/.vendor-capability.json", "utf8"));
const baseUrl = `${V.base_url}/browserbase`;
const OUT = "/home/user/tab/files/saas-cvtailor/shots/jobs/"; fs.mkdirSync(OUT, { recursive: true });
const W = 390, H = 844; const TAG = process.argv[2] || "s";
const browser = await browserbase.launch({ apiKey: V.token, baseUrl, projectId: "f2ae15a0-a894-4419-977f-d52f52483f0c", keepAlive: false, browserSettings: { verified: false, viewport: { width: W, height: H } }, userMetadata: { site: "fitwise", task: process.env.TAB_TASK_ID, knobs: "verified_false_own_site_phone_viewport" } });
const sh = await Stagehand.create({ browser, model: { generate: async () => ({ role: "assistant", outputFormat: "text", content: "" }) }, logging: { level: "error" } });
const out = {};
const shot = async (page, n) => fs.writeFileSync(OUT + TAG + "_" + n + ".png", await page.screenshot());
try {
  const page = await browser.context.activePage();
  try { await page.setViewportSize(W, H, { deviceScaleFactor: 2 }); } catch (e) { out.vpErr = String(e); }
  await page.goto("https://fitwise.sites.tab.bot/jobs?v=" + Date.now(), { waitUntil: "load", timeout: 60000 });
  out.inner = await page.evaluate(() => ({ w: window.innerWidth, sw: document.documentElement.scrollWidth, cards: document.querySelectorAll(".jc").length, title: document.title, og: document.querySelector('meta[property="og:title"]').content }));
  await shot(page, "1_top");
  await page.evaluate(() => document.querySelector(".filters").scrollIntoView()); await page.waitForTimeout(300); await shot(page, "2_filters");
  await page.evaluate(() => { const c = document.querySelectorAll(".jc"); (c[Math.min(2, c.length - 1)]).scrollIntoView(); }); await page.waitForTimeout(300); await shot(page, "3_cards");
  // filters
  out.f = {};
  await page.locator("#q").fill("test"); await page.waitForTimeout(900); out.f.q_test = await page.evaluate(() => document.getElementById("shown").textContent);
  await page.locator("#q").fill(""); await page.evaluate(() => { const s = document.getElementById("fc"); s.value = s.options[1].value; s.dispatchEvent(new Event("change")); }); out.f.country1 = await page.evaluate(() => [document.getElementById("fc").value, document.getElementById("shown").textContent]);
  await page.evaluate(() => { const s = document.getElementById("fc"); s.value = ""; s.dispatchEvent(new Event("change")); const v = document.getElementById("fv"); v.checked = true; v.dispatchEvent(new Event("change")); }); out.f.visaOnly = await page.evaluate(() => [document.getElementById("shown").textContent, document.getElementById("more").hidden]);
  await page.evaluate(() => { const v = document.getElementById("fv"); v.checked = false; v.dispatchEvent(new Event("change")); const s = document.getElementById("fm"); s.value = "remote"; s.dispatchEvent(new Event("change")); }); out.f.remote = await page.evaluate(() => document.getElementById("shown").textContent);
  await page.evaluate(() => { const s = document.getElementById("fm"); s.value = ""; s.dispatchEvent(new Event("change")); });
  await page.evaluate(() => document.getElementById("fitwise").scrollIntoView()); await page.waitForTimeout(300); await shot(page, "4_sell");
  await page.evaluate(() => document.querySelector(".sub").scrollIntoView()); await page.waitForTimeout(300); await shot(page, "5_sub");
  // overflow check per card
  out.overflow = await page.evaluate(() => [...document.querySelectorAll(".jc, .filters, .fwstrip, .ja a")].filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).length);
  // tailor click: pick the first card
  const first = await page.evaluate(() => { const all = [...document.querySelectorAll(".jc")]; const c = all.find(x => /greenhouse|lever\.co|ashbyhq/.test(x.querySelector(".ap").href)) || all[0]; c.id = "pickme"; return { co: c.querySelector(".co").textContent, t: c.querySelector("h3").textContent, href: c.querySelector(".tl").getAttribute("href"), apply: c.querySelector(".ap").getAttribute("href"), target: c.querySelector(".ap").target }; });
  out.first = first;
  await page.evaluate(() => document.getElementById("pickme").scrollIntoView()); await page.locator("#pickme .tl").click();
  await page.waitForLoadState("load"); await page.waitForTimeout(1500);
  for (let i = 0; i < 30; i++) { const h = await page.evaluate(() => document.getElementById("jdhint").textContent); if (/^Read |Couldn|Paste|answered/.test(h)) break; await page.waitForTimeout(700); }
  out.tool = await page.evaluate(() => ({ url: location.pathname + location.search.slice(0, 60) + location.hash, jurl: document.getElementById("jurl").value, jtitle: document.getElementById("jtitle").value, jco: document.getElementById("jco").value, jdLen: document.getElementById("jd").value.length, hint: document.getElementById("jdhint").textContent, pick: document.getElementById("jobpick").innerText, tryTop: Math.round(document.getElementById("try").getBoundingClientRect().top), errs: window.__errs || [] }));
  await shot(page, "6_tailor_landing");
  await page.evaluate(() => document.getElementById("jd").scrollIntoView({ block: "center" })); await page.waitForTimeout(300); await shot(page, "7_tailor_job_filled");
  // subscribe test with an example address, then purge
  await page.goto("https://fitwise.sites.tab.bot/jobs?v=" + Date.now(), { waitUntil: "load", timeout: 60000 });
  await page.locator("#sube").fill("fitwise.jobs.sub.test@example.com"); await page.locator("#subb").click(); await page.waitForTimeout(2500);
  out.sub = await page.evaluate(() => document.getElementById("subm").textContent);
  // home nav
  await page.goto("https://fitwise.sites.tab.bot/?v=" + Date.now(), { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(500); await shot(page, "8_home_nav");
  out.homeJobsLink = await page.evaluate(() => { const a = document.querySelector(".navjobs"); const r = a.getBoundingClientRect(); return { vis: r.width > 0 && r.right <= window.innerWidth, sw: document.documentElement.scrollWidth }; });
  out.purge = await (await fetch("https://fitwise.sites.tab.bot/api/admin/purge", { method: "POST", headers: { "content-type": "application/json", "x-admin-key": fs.readFileSync("/home/user/tab/files/saas-cvtailor/ADMIN_SECRET.txt", "utf8").trim() }, body: JSON.stringify({ email: "fitwise.jobs.sub.test@example.com" }) })).json();
} catch (e) { out.err = String(e).slice(0, 500); }
finally { try { await sh.close(); } catch {} try { await browser.close(); } catch {} }
console.log(JSON.stringify(out, null, 1));
