
import { Stagehand, browserbase } from "@browserbasehq/stagehand"; import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("/home/user/tab/.vendor-capability.json", "utf8"));
const S = "https://fitwise.sites.tab.bot", D = "/home/user/tab/files/saas-cvtailor/", OUT = D + "shots/gate/";
const KEY = fs.readFileSync(D + "ADMIN_SECRET.txt", "utf8").trim();
const lp = (await (await fetch(S + "/api/admin/test-session", { method: "POST", headers: { "content-type": "application/json", "x-admin-key": KEY }, body: JSON.stringify({ admin: true }) })).json()).login_path;
const out = {};
const browser = await browserbase.launch({ apiKey: V.token, baseUrl: `${V.base_url}/browserbase`, projectId: "f2ae15a0-a894-4419-977f-d52f52483f0c", keepAlive: false, browserSettings: { verified: false, viewport: { width: 1280, height: 900 } }, userMetadata: { site: "fitwise", task: process.env.TAB_TASK_ID } });
const sh = await Stagehand.create({ browser, model: { generate: async () => ({ role: "assistant", outputFormat: "text", content: "" }) }, logging: { level: "error" } });
try {
  const page = await browser.context.activePage();
  await page.goto(S + lp + "&next=/admin", { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => { window.__errs = []; window.addEventListener("error", e => window.__errs.push(String(e.message))); });
  for (let i = 0; i < 20; i++) { await page.waitForTimeout(1000); const n = await page.evaluate(() => document.querySelectorAll("#ovb .k div").length); if (n) break; }
  out.ov = await page.evaluate(() => ({ url: location.pathname, kpis: [...document.querySelectorAll("#ovb .k div")].map(d => d.innerText.replace(/\n/g, " ")), cards: [...document.querySelectorAll("#ovb .c h2")].map(h => h.textContent), txt: document.getElementById("ovb").innerText.slice(0, 200) }));
  fs.writeFileSync(OUT + "5_admin_overview.png", await page.screenshot({ fullPage: true }));
  for (const t of ["us", "cv", "bi", "co", "ex"]) {
    await page.evaluate(`document.querySelector('#tabs button[data-t="${t}"]').click()`); await page.waitForTimeout(3000);
    out[t] = await page.evaluate(`document.getElementById("${t}").innerText.slice(0, 600)`);
    if (t === "us") { const has = await page.evaluate(`!!document.querySelector("[data-u]")`); if (has) { await page.evaluate(`document.querySelector("[data-u]").click()`); await page.waitForTimeout(3000); out.user_detail = await page.evaluate(`(document.getElementById("ud").innerText||"").slice(0,500)`); } }
    fs.writeFileSync(OUT + "6_admin_" + t + ".png", await page.screenshot({ fullPage: false }));
  }
  out.errs = await page.evaluate(() => window.__errs);
  await page.evaluate(async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }); });
} catch (e) { out.error = String(e && e.stack || e).slice(0, 600); }
finally { try { await sh.close(); } catch (e) {} try { await browser.close(); } catch (e) {} }
console.log(JSON.stringify(out, null, 1));
