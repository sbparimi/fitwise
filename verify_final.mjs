
import { Stagehand, browserbase } from "@browserbasehq/stagehand"; import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("/home/user/tab/.vendor-capability.json", "utf8"));
const OUT = "/home/user/tab/files/saas-cvtailor/shots/v2/";
const browser = await browserbase.launch({ apiKey: V.token, baseUrl: `${V.base_url}/browserbase`, projectId: "f2ae15a0-a894-4419-977f-d52f52483f0c", keepAlive: false, browserSettings: { verified: false, viewport: { width: 390, height: 844 } }, userMetadata: { site: "fitwise", task: process.env.TAB_TASK_ID } });
const sh = await Stagehand.create({ browser, model: { generate: async () => ({ role: "assistant", outputFormat: "text", content: "" }) }, logging: { level: "error" } });
const out = {}; const shot = async (page, n) => fs.writeFileSync(OUT + n + ".png", await page.screenshot());
try {
  const page = await browser.context.activePage();
  try { await page.setViewportSize(390, 844, { deviceScaleFactor: 2 }); } catch {}
  await page.goto("https://fitwise.sites.tab.bot/?v=" + Date.now(), { waitUntil: "load", timeout: 60000 });
  out.sw = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]);
  await page.evaluate(() => document.getElementById("pricing").scrollIntoView()); await page.waitForTimeout(500); await shot(page, "final_pricing1");
  await page.evaluate(() => window.scrollBy(0, 760)); await page.waitForTimeout(400); await shot(page, "final_pricing2");
  out.pricingText = await page.evaluate(() => document.getElementById("pricing").innerText.replace(/\s+/g, " ").slice(0, 900));
  out.monthly = await page.evaluate(() => /month|\/mo\b|€12|€29/i.test(document.body.innerText));
  await page.locator("#pricing [data-buy]").click(); await page.waitForTimeout(600); await shot(page, "final_buy");
  await page.locator("#buyclose").click();
  await page.evaluate(() => document.getElementById("demos").scrollIntoView()); await page.waitForTimeout(800); await shot(page, "final_demos");
  out.beforeClick = await page.evaluate(() => { const b = document.querySelector('.demo[data-demo="owncv"]'); const r = b.getBoundingClientRect(); return [r.x, r.y, r.width, r.height, typeof openDemo, document.getElementById("buy").open]; });
  await page.locator('.demo[data-demo="owncv"]').click(); await page.waitForTimeout(1500);
  out.openAfterLocator = await page.evaluate(() => document.getElementById("dv").open);
  out.direct = await page.evaluate(() => { try { openDemo("owncv"); return ["ok", document.getElementById("dv").open]; } catch (e) { return ["err", String(e), e.stack && e.stack.slice(0, 300)]; } });
  out.handler = await page.evaluate(() => String(document.querySelector('.demo[data-demo="owncv"]').onclick).slice(0, 200));
  await page.waitForTimeout(3000);
  out.video = await page.evaluate(() => { const v = document.querySelector("#dv video"); return v ? { rs: v.readyState, t: v.currentTime, w: v.videoWidth, h: v.videoHeight, paused: v.paused } : null; });
  await shot(page, "final_demo_modal");
  await page.evaluate(() => document.getElementById("dvclose").click());
  await page.evaluate(() => document.querySelector('a.see[data-demo="autopilot"]').click()); await page.waitForTimeout(2500);
  out.video2 = await page.evaluate(() => { const v = document.querySelector("#dv video"); return v ? { rs: v.readyState, t: v.currentTime, note: document.getElementById("dvnote").textContent } : null; });
} catch (e) { out.error = String(e).slice(0, 500); }
finally { try { await sh.close(); } catch {} try { await browser.close(); } catch {} }
console.log("RESULT " + JSON.stringify(out));
