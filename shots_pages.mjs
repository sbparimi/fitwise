import { Stagehand, browserbase } from "@browserbasehq/stagehand"; import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("/home/user/tab/.vendor-capability.json", "utf8"));
const baseUrl = `${V.base_url}/browserbase`;
const OUT = "/home/user/tab/files/saas-cvtailor/shots/v3/"; fs.mkdirSync(OUT, { recursive: true });
const TAG = process.argv[2] || "s"; const PAGES = process.argv[3].split(","); const MAXS = +(process.argv[4] || 5); const SIZES = (process.argv[5] || "phone,desk").split(",");
const browser = await browserbase.launch({ apiKey: V.token, baseUrl, projectId: "f2ae15a0-a894-4419-977f-d52f52483f0c", keepAlive: false, browserSettings: { verified: false, viewport: { width: 390, height: 844 } }, userMetadata: { site: "fitwise", task: process.env.TAB_TASK_ID, knobs: "verified_false_own_site_phone_viewport" } });
const sh = await Stagehand.create({ browser, model: { generate: async () => ({ role: "assistant", outputFormat: "text", content: "" }) }, logging: { level: "error" } });

const out = {};
try {
  const page = await browser.context.activePage();
  for (const sz of SIZES) {
    const [w, h] = sz === "phone" ? [390, 844] : [1366, 900];
    try { await page.setViewportSize(w, h, { deviceScaleFactor: sz === "phone" ? 2 : 1 }); } catch (e) { out.vp = String(e); }
    for (const p of PAGES) {
      const name = (p.replace(/^\//, "").replace(/[^\w]+/g, "_") || "home");
      await page.goto("https://fitwise.sites.tab.bot" + p + (p.includes("?") ? "&" : "?") + "v=" + Date.now(), { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(900);
      const info = await page.evaluate(() => ({ title: document.title, sh: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, iw: window.innerWidth, ih: window.innerHeight }));
      out[sz + ":" + p] = info;
      const n = Math.min(MAXS, Math.ceil(info.sh / info.ih));
      for (let i = 0; i < n; i++) {
        await page.evaluate(y => window.scrollTo(0, y), Math.round(i * info.ih * 0.92)); await page.waitForTimeout(350);
        fs.writeFileSync(`${OUT}${TAG}_${sz}_${name}_${i + 1}.png`, await page.screenshot());
      }
    }
  }
} catch (e) { out.err = String(e).slice(0, 400); }
finally { try { await sh.close(); } catch {} try { await browser.close(); } catch {} }
console.log(JSON.stringify(out));
