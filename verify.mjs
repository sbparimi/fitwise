
import { Stagehand, browserbase } from "@browserbasehq/stagehand"; import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("/home/user/tab/.vendor-capability.json", "utf8"));
const baseUrl = `${V.base_url}/browserbase`;
const OUT = "/home/user/tab/files/saas-cvtailor/shots/";
fs.mkdirSync(OUT, { recursive: true });
const browser = await browserbase.launch({ apiKey: V.token, baseUrl, projectId: "f2ae15a0-a894-4419-977f-d52f52483f0c", keepAlive: false, browserSettings: { verified: false, viewport: { width: 390, height: 844 } }, userMetadata: { site: "fitwise", task: process.env.TAB_TASK_ID, knobs: "verified_false_own_site_phone_viewport" } });
const sh = await Stagehand.create({ browser, model: { generate: async () => ({ role: "assistant", outputFormat: "text", content: "" }) }, logging: { level: "error" } });
const out = {};
try {
  const page = await browser.context.activePage();
  try { await page.setViewportSize(390, 844, { deviceScaleFactor: 2 }); } catch (e) { out.vpErr = String(e); }
  const res = await page.goto("https://fitwise.sites.tab.bot/", { waitUntil: "load", timeout: 60000 });
  out.status = res?.status(); out.title = await page.title();
  out.inner = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight, sw: document.documentElement.scrollWidth }));
  fs.writeFileSync(OUT + "1_hero_phone.png", await page.screenshot());
  const cv = fs.readFileSync("/home/user/tab/files/saas-cvtailor/test_cv.txt", "utf8");
  await page.evaluate(() => document.getElementById("try").scrollIntoView());
  await page.locator("#cv").fill(cv);
  await page.locator("#jurl").fill("https://job-boards.greenhouse.io/gitlab/jobs/8704363002");
  await page.locator("#fetch").click();
  for (let i = 0; i < 30; i++) { const h = await page.evaluate(() => document.getElementById("jdhint").textContent); if (/^Read |Couldn|Paste/.test(h)) { out.jdhint = h; break; } await page.waitForTimeout(500); }
  out.jtitle = await page.locator("#jtitle").inputValue(); out.jco = await page.locator("#jco").inputValue();
  await page.locator("#email").fill("lena.marsh.test@example.com");
  await page.evaluate(() => document.getElementById("email").scrollIntoView({ block: "center" }));
  fs.writeFileSync(OUT + "2_form_phone.png", await page.screenshot());
  await page.locator("#go").click();
  out.result = await page.waitForSelector("#out:not([hidden])", { state: "visible", timeout: 30000 });
  out.err = await page.evaluate(() => document.getElementById("err").textContent);
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.getElementById("out").scrollIntoView());
  fs.writeFileSync(OUT + "3_result_phone.png", await page.screenshot());
  out.summary = await page.evaluate(() => ({ score: document.getElementById("scoreN").textContent, job: document.getElementById("jobline").textContent, have: document.getElementById("have").innerText, miss: document.getElementById("miss").innerText, changes: document.getElementById("changes").innerText, mode: document.getElementById("mode").textContent, quota: document.getElementById("quota").textContent }));
  // capture the real download button's PDF
  await page.evaluate(() => { const orig = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { if (this.download) { window.__dlname = this.download; fetch(this.href).then(r => r.arrayBuffer()).then(b => { let s = ""; const u = new Uint8Array(b); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); window.__pdf = btoa(s); }); return; } return orig.call(this); }; });
  for (const [btn, fname] of [["#dlcv", "cv.pdf"], ["#dlcl", "cover.pdf"]]) {
    await page.evaluate(() => { window.__pdf = null; });
    await page.locator(btn).click();
    let b64 = null; for (let i = 0; i < 20 && !b64; i++) { await page.waitForTimeout(300); b64 = await page.evaluate(() => window.__pdf); }
    const name = await page.evaluate(() => window.__dlname);
    if (b64) { fs.writeFileSync(OUT + fname, Buffer.from(b64, "base64")); out[fname] = name; }
  }
  // pricing + early access on phone
  await page.evaluate(() => document.getElementById("pricing").scrollIntoView());
  await page.waitForTimeout(400);
  fs.writeFileSync(OUT + "4_pricing_phone.png", await page.screenshot());
} catch (e) { out.error = String(e && e.stack || e).slice(0, 600); }
finally { try { await sh.close(); } catch {} try { await browser.close(); } catch {} }
console.log(JSON.stringify(out, null, 1));
