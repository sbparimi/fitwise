
import { Stagehand, browserbase } from "@browserbasehq/stagehand"; import fs from "node:fs";
const V = JSON.parse(fs.readFileSync("/home/user/tab/.vendor-capability.json", "utf8"));
const baseUrl = `${V.base_url}/browserbase`;
const OUT = "/home/user/tab/files/saas-cvtailor/shots/v2/"; fs.mkdirSync(OUT, { recursive: true });
const MODE = process.argv[2] || "pdf"; const W = +(process.argv[3] || 390), H = +(process.argv[4] || 844);
const FILE = "/home/user/tab/files/saas-cvtailor/testdata/Marta_Kowalczyk_CV." + MODE;
const browser = await browserbase.launch({ apiKey: V.token, baseUrl, projectId: "f2ae15a0-a894-4419-977f-d52f52483f0c", keepAlive: false, browserSettings: { verified: false, viewport: { width: W, height: H } }, userMetadata: { site: "fitwise", task: process.env.TAB_TASK_ID, knobs: "verified_false_own_site_phone_viewport" } });
const sh = await Stagehand.create({ browser, model: { generate: async () => ({ role: "assistant", outputFormat: "text", content: "" }) }, logging: { level: "error" } });
const out = { mode: MODE };
const shot = async (page, n) => fs.writeFileSync(OUT + MODE + "_" + n + ".png", await page.screenshot());
const ADM0 = fs.readFileSync("/home/user/tab/files/saas-cvtailor/ADMIN_SECRET.txt", "utf8").trim();
out.purge0 = await (await fetch("https://fitwise.sites.tab.bot/api/admin/purge", { method: "POST", headers: { "content-type": "application/json", "x-admin-key": ADM0 }, body: JSON.stringify({ email: "fitwise.v2.ui@example.com" }) })).json();
try {
  const page = await browser.context.activePage();
  try { await page.setViewportSize(W, H, { deviceScaleFactor: 2 }); } catch (e) { out.vpErr = String(e); }
  await page.goto("https://fitwise.sites.tab.bot/tailor?v=" + Date.now(), { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() => { window.__errs = []; window.addEventListener("error", e => window.__errs.push(String(e.message))); window.addEventListener("unhandledrejection", e => window.__errs.push(String(e.reason))); });
  out.inner = await page.evaluate(() => ({ w: window.innerWidth, sw: document.documentElement.scrollWidth }));
  const b64 = fs.readFileSync(FILE).toString("base64");
  await page.evaluate(([b64, name, type]) => { const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); const f = new File([u], name, { type }); const dt = new DataTransfer(); dt.items.add(f); const inp = document.getElementById("cvfile"); inp.files = dt.files; inp.dispatchEvent(new Event("change", { bubbles: true })); }, [b64, "Marta_Kowalczyk_CV." + MODE, MODE === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
  for (let i = 0; i < 40; i++) { const h = await page.evaluate(() => document.getElementById("cvhint").textContent); if (/^Read |Couldn/.test(h)) { out.cvhint = h; break; } await page.waitForTimeout(500); }
  out.cvStart = await page.evaluate(() => document.getElementById("cv").value.slice(0, 400));
  await page.locator("#jurl").fill("https://job-boards.greenhouse.io/celonis/jobs/7885808003");
  await page.locator("#fetch").click();
  for (let i = 0; i < 30; i++) { const h = await page.evaluate(() => document.getElementById("jdhint").textContent); if (/^Read |Couldn|Paste/.test(h)) { out.jdhint = h; break; } await page.waitForTimeout(500); }
  out.jtitle = await page.locator("#jtitle").inputValue(); out.jco = await page.locator("#jco").inputValue();
  await page.locator("#email").fill("fitwise.v2.ui@example.com");
  await page.evaluate(() => document.getElementById("try").scrollIntoView());
  await shot(page, "1_form");
  await page.locator("#go").click();
  await page.waitForTimeout(250); await shot(page, "1b_tailoring");
  await page.waitForSelector("#out:not([hidden])", { state: "visible", timeout: 40000 });
  out.err = await page.evaluate(() => document.getElementById("err").textContent);
  for (let i = 0; i < 40; i++) { const n = await page.evaluate(() => [document.querySelectorAll("#origpv img").length, document.querySelectorAll(".thumb img").length]); if (n[0] && n[1] >= 2) { out.imgs = n; break; } await page.waitForTimeout(500); }
  await page.evaluate(() => document.getElementById("out").scrollIntoView());
  await page.waitForTimeout(500); await shot(page, "2_result_top");
  out.summary = await page.evaluate(() => ({ score: document.getElementById("scoreN").textContent, job: document.getElementById("jobline").textContent, changes: document.getElementById("changes").innerText, note: document.getElementById("orignote").innerText, docxBtn: !document.getElementById("dldocx").hidden, region: document.getElementById("region").value, why: document.getElementById("regionwhy").textContent, fmts: [...document.querySelectorAll(".fmt h4")].map(e => e.textContent), credits: document.querySelector(".credbal").textContent }));
  await page.evaluate(() => document.getElementById("origpv").scrollIntoView({ block: "start" }));
  await page.waitForTimeout(400); await shot(page, "3_original");
  // capture downloads
  await page.evaluate(() => { const orig = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { if (this.download) { window.__dlname = this.download; fetch(this.href).then(r => r.arrayBuffer()).then(b => { let s = ""; const u = new Uint8Array(b); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); window.__dl = btoa(s); }); return; } return orig.call(this); }; });
  const grab = async (sel, fname) => { await page.evaluate(() => { window.__dl = null; }); await page.locator(sel).click(); let b = null; for (let i = 0; i < 30 && !b; i++) { await page.waitForTimeout(300); b = await page.evaluate(() => window.__dl); } if (b) { fs.writeFileSync(OUT + MODE + "_" + fname, Buffer.from(b, "base64")); out[fname] = await page.evaluate(() => window.__dlname); } };
  await grab("#dlorig", "original.pdf");
  if (MODE === "docx") await grab("#dldocx", "tailored.docx");
  await page.evaluate(() => document.getElementById("clwrap").scrollIntoView({ block: "center" })); await page.waitForTimeout(300);
  out.coverLocked = await page.evaluate(() => ({ locked: document.getElementById("clwrap").classList.contains("locked"), len: document.getElementById("cl").value.length, unlockVisible: !document.getElementById("clunlock").hidden }));
  await shot(page, "3b_cover_locked");
  await page.locator("#clunlock").click();
  for (let i = 0; i < 20; i++) { if (await page.evaluate(() => document.getElementById("buy").open)) break; await page.waitForTimeout(400); }
  out.coverBuy = await page.evaluate(() => ({ open: document.getElementById("buy").open, need: document.getElementById("buyneed").textContent }));
  await page.locator("#buyclose").click();
  await page.evaluate(() => document.getElementById("fmts").scrollIntoView({ block: "start" }));
  await page.waitForTimeout(400); await shot(page, "4_formats");
  // view preview modal
  await page.locator(".fmt [data-view]").first().click();
  for (let i = 0; i < 20; i++) { if (await page.evaluate(() => document.querySelectorAll("#pvbody img").length)) break; await page.waitForTimeout(400); }
  out.modalImgs = await page.evaluate(() => document.querySelectorAll("#pvbody img").length);
  await page.waitForTimeout(300); await shot(page, "5_preview_modal");
  await page.evaluate(() => document.getElementById("pvbody").scrollTop = 99999); await page.waitForTimeout(300); await shot(page, "5b_preview_modal_p2");
  // download from the modal -> no credits -> buy credits sheet
  await page.locator("#pvdl").click();
  for (let i = 0; i < 20; i++) { if (await page.evaluate(() => document.getElementById("buy").open)) break; await page.waitForTimeout(400); }
  out.buyOpen = await page.evaluate(() => ({ open: document.getElementById("buy").open, need: document.getElementById("buyneed").textContent }));
  await shot(page, "6_buy_credits");
  await page.locator("#buygo").click(); await page.waitForTimeout(1500);
  out.buyDone = await page.evaluate(() => document.getElementById("buyok").innerText);
  await shot(page, "7_buy_done");
  await page.locator("#buyclose2").click();
  // grant 3 test credits (admin), then a paid download + cover unlock
  const ADM = fs.readFileSync("/home/user/tab/files/saas-cvtailor/ADMIN_SECRET.txt", "utf8").trim();
  out.grant = await (await fetch("https://fitwise.sites.tab.bot/api/admin/credits", { method: "POST", headers: { "content-type": "application/json", "x-admin-key": ADM }, body: JSON.stringify({ email: "fitwise.v2.ui@example.com", delta: 3, note: "ui test" }) })).json();
  await page.evaluate(() => document.getElementById("fmts").scrollIntoView({ block: "start" }));
  await grab(".fmt [data-dl]", "format1.pdf");
  out.creditsAfterDl = await page.evaluate(() => document.querySelector(".credbal").textContent);
  await page.locator("#clunlock").click();
  for (let i = 0; i < 20; i++) { if (await page.evaluate(() => document.getElementById("clunlock").hidden)) break; await page.waitForTimeout(400); }
  out.coverUnlocked = await page.evaluate(() => ({ locked: document.getElementById("clwrap").classList.contains("locked"), len: document.getElementById("cl").value.length, credits: document.querySelector(".credbal").textContent }));
  await page.evaluate(() => document.getElementById("clwrap").scrollIntoView({ block: "center" })); await page.waitForTimeout(300); await shot(page, "3c_cover_unlocked");
  await grab("#dlcl", "cover.pdf");
  await page.evaluate(() => document.getElementById("pricing").scrollIntoView()); await page.waitForTimeout(400); await shot(page, "8_pricing");
  await page.evaluate(() => window.scrollBy(0, 700)); await page.waitForTimeout(300); await shot(page, "8b_pricing");
  out.errs = await page.evaluate(() => window.__errs);
  await page.evaluate(() => document.getElementById("demos").scrollIntoView()); await page.waitForTimeout(500); await shot(page, "9_demos");
  for (const n of [1, 2, 3]) { await page.goto("https://fitwise.sites.tab.bot/autopilot-preview.html?v=" + Date.now() + "#" + n, { waitUntil: "load", timeout: 60000 }); await page.waitForTimeout(500); await shot(page, "ap" + n); }
} catch (e) { out.error = String(e && e.stack || e).slice(0, 800); }
finally { try { await sh.close(); } catch {} try { await browser.close(); } catch {} }
console.log(JSON.stringify(out, null, 1));
