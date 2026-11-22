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

test("public marketing avoids ATS vendor certification claims", () => {
  assert.ok(!home.includes("Tested Against</span> Workday"));
  assert.ok(home.includes("not certification or a guarantee of acceptance"));
  assert.ok(terms.includes("not certified by, integrated with or endorsed by Workday"));
});
