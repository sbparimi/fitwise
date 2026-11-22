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
  assert.doesNotMatch(api, /instant_code/);
  assert.match(api, /email_delivery_unavailable/);
  assert.match(api, /email_delivery_failed/);
  assert.match(api, /emailed: true/);
  assert.match(api, /rec\\.attempts >= 5/);
  assert.ok(api.includes('!/^\\d{6}$/.test(code)'));
});

test("ATS share reports do not persist or return resume text", () => {
  const start = api.indexOf('if (p === "/api/ats/scan")');
  const end = api.indexOf("// 4. Resumes CRUD", start);
  assert.ok(start >= 0 && end > start, "ATS route should exist");
  const route = api.slice(start, end);
  assert.match(route, /JSON\\.stringify\\(report\\)\\.slice\\(0, 60000\\), "", "", Date\\.now\\(\\)/);
  assert.doesNotMatch(route, /resume_text:\\s*row\\.resume_text/);
  assert.match(api, /UPDATE ats_scans SET resume_text = '', jd_text = ''/);
  assert.match(api, /DELETE FROM ats_scans WHERE created_at < \\?/);
  assert.match(route, /scan_\\[a-f0-9\\]\\{32\\}/);
});

test("resume importer enforces supported types, size and text limits", () => {
  assert.match(core, /file\\.size > 10 \\* 1024 \\* 1024/);
  assert.match(core, /Unsupported file type/);
  assert.ok(core.includes('if(/\\.txt$/.test(name))'));
  assert.ok(core.includes('else if(/\\.docx$/.test(name))'));
  assert.ok(core.includes('else if(/\\.pdf$/.test(name))'));
  assert.match(core, /text\\.length > 50000/);
  assert.ok(builderPage.includes('accept=".pdf,.docx,.txt"'));
  assert.ok(atsPage.includes('accept=".pdf,.docx,.txt"'));
});

test("ATS report UI sends only the generated report to persistence", () => {
  assert.ok(atsUi.includes('FW.api("/api/ats/scan", {filename: state.filename, report: r})'));
  assert.doesNotMatch(atsUi, /resume_text:\\s*text/);
  assert.doesNotMatch(atsUi, /jd_text:/);
});

test("public marketing avoids ATS vendor certification claims", () => {
  assert.doesNotMatch(home, /Tested Against<\\/span> Workday/);
  assert.match(home, /not certification or a guarantee of acceptance/);
  assert.match(terms, /not certified by, integrated with or endorsed by Workday/);
});
