
import { Stagehand, browserbase } from "@browserbasehq/stagehand"; import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("/home/user/tab/.vendor-capability.json", "utf8"));
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const SITE = "https://fitwise.sites.tab.bot";
const SLUGS = ["playwright-codex-agentic-test-automation", "ai-quality-engineering-llm-evals-agent-testing", "autonomous-software-factory-engineering"];
const browser = await browserbase.launch({ apiKey: V.token, baseUrl: `${V.base_url}/browserbase`, projectId: "f2ae15a0-a894-4419-977f-d52f52483f0c", keepAlive: false, browserSettings: { verified: false, viewport: { width: 1366, height: 900 } }, userMetadata: { site: "fitwise", task: process.env.TAB_TASK_ID, knobs: "own_site_courses" } });
const sh = await Stagehand.create({ browser, model: { generate: async () => ({ role: "assistant", outputFormat: "text", content: "" }) }, logging: { level: "error" } });
const out = { desktop: {}, phone: {} };
const info = (page) => page.evaluate(() => ({ title: document.title, h1: (document.querySelector("h1")||{}).innerText, cards: document.querySelectorAll(".cr-card").length,
  cols: (() => { const c = [...document.querySelectorAll(".cr-card")]; return c.length ? new Set(c.map(x => Math.round(x.getBoundingClientRect().top))).size + " rows / first-row " + c.filter(x => Math.round(x.getBoundingClientRect().top) === Math.round(c[0].getBoundingClientRect().top)).length : null })(),
  secs: document.querySelectorAll(".cr-acc details").length, price: (document.querySelector(".cr-price")||document.querySelector(".cr-pv")||{}).innerText, cd: (document.querySelector(".cr-cd")||{}).innerText,
  sw: document.documentElement.scrollWidth, iw: window.innerWidth, sh: document.documentElement.scrollHeight, navCourses: !!document.querySelector('header a[href="/courses"]') }));
try {
  const page = await browser.context.activePage();
  for (const [mode, w, h] of [["desktop", 1366, 900], ["phone", 390, 844]]) {
    try { await page.setViewportSize(w, h, { deviceScaleFactor: mode === "phone" ? 2 : 1 }); } catch (e) { out[mode].vp = String(e); }
    await page.goto(SITE + "/courses?v=" + Date.now(), { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(1200);
    out[mode].grid = await info(page);
    fs.writeFileSync(`${OUT}${mode}_grid.jpg`, await page.screenshot({ type: "jpeg", quality: 62, fullPage: mode === "desktop" }));
    for (const s of SLUGS) {
      await page.goto(SITE + "/courses/" + s + "?v=" + Date.now(), { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(900);
      out[mode][s] = await info(page);
      fs.writeFileSync(`${OUT}${mode}_${s.slice(0, 12)}_top.jpg`, await page.screenshot({ type: "jpeg", quality: 62 }));
      if (s === SLUGS[0]) {
        const hasX = await page.evaluate(() => { const b = document.getElementById("cr-xall"); if (b) b.click(); return !!b; }); if (hasX) { await page.waitForTimeout(300); out[mode][s].openAfterExpand = await page.evaluate(() => [...document.querySelectorAll(".cr-acc details")].filter(d => d.open).length); }
        fs.writeFileSync(`${OUT}${mode}_${s.slice(0, 12)}_full.jpg`, await page.screenshot({ type: "jpeg", quality: 55, fullPage: true }));
      }
    }
  }
  // phone: submit a dummy notify on course 1
  await page.goto(SITE + "/courses/" + SLUGS[0] + "?v=" + Date.now(), { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector("form[data-course] input[type=email]").scrollIntoView({ block: "center" })); await page.waitForTimeout(300);
  await page.evaluate(() => { const e = document.querySelector("form[data-course] input[type=email]"); e.value = "zz-test-courses@example.com"; document.querySelector("form[data-course] button").click(); });
  let msg = ""; for (let i = 0; i < 20; i++) { await page.waitForTimeout(500); msg = await page.evaluate(() => document.querySelector(".cr-nf .msg").innerText); if (/Done|already|wrong|valid|Network|Too many/.test(msg)) break; }
  out.submit = msg; fs.writeFileSync(`${OUT}phone_notify_submitted.jpg`, await page.screenshot({ type: "jpeg", quality: 62 }));
} catch (e) { out.err = String(e).slice(0, 400); }
finally { try { await sh.close(); } catch {} try { await browser.close(); } catch {} }
console.log(JSON.stringify(out));
