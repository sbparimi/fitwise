
import w from "./site/worker.mjs";
import fs from "fs";
const store = new Map();
const env = { DATA: { get: async k => store.has(k) ? store.get(k) : null, put: async (k, v) => store.set(k, v), delete: async k => store.delete(k), list: async ({prefix}) => ({ keys: [...store.keys()].filter(k => k.startsWith(prefix)).map(name => ({name})), list_complete: true }) }, ASSETS: { fetch: async () => new Response("asset") } };
const post = (p, b, h={}) => w.fetch(new Request("https://x.test" + p, { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": "1.2.3.4", ...h }, body: JSON.stringify(b) }), env);
const cv = fs.readFileSync("test_cv.txt", "utf8"), jd = fs.readFileSync("test_jd.txt", "utf8");
let r = await post("/api/fetch-job", { url: "https://job-boards.greenhouse.io/gitlab/jobs/8704363002" }); let j = await r.json(); console.log("fetch", r.status, j.title, j.company, (j.text||j.error||"").length);
for (let i = 0; i < 4; i++) { r = await post("/api/tailor", { cv, jd: j.text, title: j.title, company: j.company, email: "test@example.com", device: "dev1" }); const o = await r.json(); console.log("tailor", r.status, o.score, o.used, o.error || "", o.mode, o.job && o.job.company); if (i==0) fs.writeFileSync("/tmp/fw_result.json", JSON.stringify(o)); }
r = await post("/api/early-access", { email: "a@b.co", plan: "pro" }); console.log("ea", r.status);
r = await w.fetch(new Request("https://x.test/api/admin/stats", { headers: { "x-admin-key": "nope" } }), env); console.log("admin bad", r.status);
r = await w.fetch(new Request("https://x.test/api/admin/stats", { headers: { "x-admin-key": fs.readFileSync("ADMIN_SECRET.txt","utf8").trim() } }), env); console.log("admin ok", r.status, (await r.text()).slice(0,200));
r = await post("/api/fetch-job", { url: "https://jobs.lever.co/palantir" }); console.log("lever-bad", r.status, (await r.json()).error);
