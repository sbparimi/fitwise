import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const api = read("../build1_api.js");
const core = read("../site/fw-core.js");
const atsUi = read("../site/fw-ats.js");
const builderPage = read("../front/builder.html");
const atsPage = read("../front/ats-checker.html");
const home = read("../front/index.html");
const terms = read("../build_pages.py");
const gate = read("../gate.js");
const fwJs = read("../site/fw.js");
const footer = read("../partials_footer.html");
const dashboard = read("../front/dashboard.html");
const signin = read("../front/signin.html");
const templates = read("../front/templates.html");

test("email OTP never exposes the code and requires successful delivery", () => {
  assert.ok(!api.includes("instant_code"));
  assert.ok(api.includes("email_delivery_unavailable"));
  assert.ok(api.includes("email_delivery_failed"));
  assert.ok(api.includes("emailed: true"));
  assert.ok(api.includes("rec.attempts >= 5"));
  assert.ok(api.includes("!/^\\d{6}$/.test(code)"));
});

test("ATS share reports do not persist or return resume text", () => {
  const start = api.indexOf('if (p === "/api/ats/scan")');
  const end = api.indexOf("// 4. Resumes CRUD", start);
  assert.ok(start >= 0 && end > start, "ATS route should exist");
  const route = api.slice(start, end);
  assert.ok(route.includes('reportJson, "", "", Date.now()'));
  assert.ok(!route.includes("resume_text: row.resume_text"));
  assert.ok(api.includes("UPDATE ats_scans SET resume_text = '', jd_text = ''"));
  assert.ok(api.includes("DELETE FROM ats_scans WHERE created_at < ?"));
  assert.ok(route.includes("scan_(?:[a-f0-9]{14}|[a-f0-9]{32})"));
  assert.ok(route.includes('crypto.randomUUID().replace(/-/g, "")'));
  assert.ok(route.includes("q:ats-share:"));
  assert.ok(api.includes("Number.isFinite(scoreValue)"));
  assert.ok(route.includes("safeScore"));
  assert.ok(route.includes('originalName.endsWith(".pdf")'));
  assert.ok(route.includes('originalName.endsWith(".docx")'));
  assert.ok(route.includes('originalName.endsWith(".txt")'));
});

test("resume importer enforces supported types, size and text limits", () => {
  assert.ok(core.includes("file.size > 10 * 1024 * 1024"));
  assert.ok(core.includes("Unsupported file type"));
  assert.ok(core.includes("if(/\\.txt$/.test(name))"));
  assert.ok(core.includes("else if(/\\.docx$/.test(name))"));
  assert.ok(core.includes("else if(/\\.pdf$/.test(name))"));
  assert.ok(core.includes("text.length > 50000"));
  assert.ok(builderPage.includes('accept=".pdf,.docx,.txt"'));
  assert.ok(atsPage.includes('accept=".pdf,.docx,.txt"'));
});

test("ATS report UI sends only the generated report to persistence", () => {
  assert.ok(atsUi.includes('FW.api("/api/ats/scan", {filename: state.filename, report: r})'));
  assert.ok(!atsUi.includes("resume_text: text"));
  assert.ok(!atsUi.includes("jd_text:"));
});

test("ATS share failures are not presented as valid links", () => {
  assert.ok(atsUi.includes("function setShareLink(url, message)"));
  assert.ok(atsUi.includes('setShareLink("", "Share link unavailable. Your scan results remain in this browser.")'));
  assert.ok(!atsUi.includes('value = location.origin + "/ats-checker";'));
  assert.ok(atsUi.includes("if(!state.text)"));
  assert.ok(atsUi.includes("if(!FW.store.save(rec))"));
});

test("resume saves do not report success when browser storage fails", () => {
  assert.ok(core.includes("if(!LS.set(RKEY, all.slice(0,40))) return null;"));
  assert.ok(core.includes("Resume saved in this browser, but cloud sync did not complete."));
  assert.ok(read("../site/fw-builder.js").includes("if(!stored)"));
  assert.ok(read("../site/fw-builder.js").includes('FW.toast("Saved in this browser")'));
  assert.ok(!read("../site/fw-builder.js").includes("and synced to your account"));
});

test("analytics tracking and visitor cookies require opt-in consent", () => {
  assert.ok(gate.includes('cookieOf(req, "fw_consent") === "analytics"'));
  assert.ok(gate.includes('cookieOf(req, "fw_consent") !== "analytics"'));
  assert.ok(gate.includes("clearVid: !consent && !!v"));
  assert.ok(gate.includes("Max-Age=0"));
  assert.ok(gate.includes("Max-Age=31536000"));
  assert.ok(fwJs.includes("if(!analyticsAllowed()) return;"));
  assert.ok(fwJs.includes("data-cookie-choice"));
  assert.ok(footer.includes("fwCookieNotice"));
  assert.ok(terms.includes("analytics are off by default"));
});

test("cloud sync and optional sign-in disclosures match the implementation", () => {
  assert.ok(core.includes("var local = FW.store.all(), byId = {}, cloudById = {}, needsPush = [];"));
  assert.ok(core.includes("needsPush.map(function(r){ return FW.cloud.push(r); })"));
  assert.ok(dashboard.includes("requests deletion of its cloud copy"));
  assert.ok(signin.includes("Sign-in is optional"));
  assert.ok(signin.includes("Email verification is available only when email delivery is configured"));
  assert.ok(!signin.includes("Email codes work everywhere"));
});

test("public marketing avoids ATS vendor certification claims", () => {
  assert.ok(!home.includes("Tested Against</span> Workday"));
  assert.ok(!templates.includes("ATS-Tested"));
  assert.ok(home.includes("not certification or a guarantee of acceptance"));
  assert.ok(terms.includes("not certified by, integrated with or endorsed by Workday"));
});
