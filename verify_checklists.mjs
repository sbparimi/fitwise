
import { Stagehand, browserbase } from "@browserbasehq/stagehand"; import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("/home/user/tab/.vendor-capability.json", "utf8"));
const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const browser = await browserbase.launch({ apiKey: V.token, baseUrl: `${V.base_url}/browserbase`, projectId: "f2ae15a0-a894-4419-977f-d52f52483f0c", keepAlive: false, browserSettings: { verified: false, viewport: { width: 390, height: 844 } }, userMetadata: { site: "fitwise", task: process.env.TAB_TASK_ID, knobs: "own_site_phone_viewport" } });
const sh = await Stagehand.create({ browser, model: { generate: async () => ({ role: "assistant", outputFormat: "text", content: "" }) }, logging: { level: "error" } });
const out = {};
try {
  const page = await browser.context.activePage();
  try { await page.setViewportSize(390, 844, { deviceScaleFactor: 2 }); } catch (e) { out.vp = String(e); }
  for (const [p, em] of [["/checklist", "zz-test-mobile-checklist@example.com"], ["/agent-checklist", "zz-test-mobile-agent@example.com"]]) {
    const name = p.slice(1);
    await page.goto("https://fitwise.sites.tab.bot" + p + "?v=" + Date.now(), { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(1200);
    const info = await page.evaluate(() => ({ title: document.title, h1: (document.querySelector("h1")||{}).innerText, items: document.querySelectorAll("ol.cks>li").length, sh: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, iw: window.innerWidth, vid: (document.cookie.match(/fw_vid=([^;]+)/)||[])[1] || null }));
    fs.writeFileSync(`${OUT}${name}_1_top.jpg`, await page.screenshot({ type: "jpeg", quality: 60 }));
    await page.evaluate(() => document.getElementById("nfyf").scrollIntoView({ block: "center" })); await page.waitForTimeout(400);
    fs.writeFileSync(`${OUT}${name}_2_box.jpg`, await page.screenshot({ type: "jpeg", quality: 60 }));
    await page.evaluate((em) => { const e = document.getElementById("nfye"); e.value = em; e.dispatchEvent(new Event("input", { bubbles: true })); document.getElementById("nfyb").click(); }, em);
    let msg = ""; for (let i = 0; i < 20; i++) { await page.waitForTimeout(500); msg = await page.evaluate(() => document.getElementById("nfym").innerText); if (/Done|already|wrong|valid|Network|Too many/.test(msg)) break; }
    fs.writeFileSync(`${OUT}${name}_3_submitted.jpg`, await page.screenshot({ type: "jpeg", quality: 60 }));
    out[p] = { ...info, submit_message: msg };
  }
} catch (e) { out.err = String(e).slice(0, 400); }
finally { try { await sh.close(); } catch {} try { await browser.close(); } catch {} }
console.log(JSON.stringify(out));
