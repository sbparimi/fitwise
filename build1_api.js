// ---------- Build 1 API: Multi-Provider Free/Open-Source LLM Cascade, Email OTP, ATS Scans, Resumes, Cover Letters, Tracker ----------
const FREE_LLM_CATALOG = [
  { id: "groq", name: "Groq Free Tier (Fastest)", endpoint: "https://api.groq.com/openai/v1/chat/completions", default_models: ["llama-3.3-70b-versatile", "qwen-qwq-32b"], signup: "https://console.groq.com/keys", kind: "openai" },
  { id: "cerebras", name: "Cerebras Free Tier (Ultra-Fast)", endpoint: "https://api.cerebras.ai/v1/chat/completions", default_models: ["llama-3.3-70b", "qwen-3-32b"], signup: "https://cloud.cerebras.ai/", kind: "openai" },
  { id: "gemini", name: "Google AI Studio (Gemini Free)", endpoint: "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent", default_models: ["gemini-2.5-flash", "gemini-2.0-flash"], signup: "https://aistudio.google.com/apikey", kind: "gemini" },
  { id: "mistral", name: "Mistral Free (La Plateforme)", endpoint: "https://api.mistral.ai/v1/chat/completions", default_models: ["mistral-small-latest", "open-mistral-nemo"], signup: "https://console.mistral.ai/api-keys", kind: "openai" },
  { id: "openrouter", name: "OpenRouter (:free Open-Source)", endpoint: "https://openrouter.ai/api/v1/chat/completions", default_models: ["meta-llama/llama-3.3-70b-instruct:free", "qwen/qwen3-32b:free", "deepseek/deepseek-r1:free", "mistralai/mistral-small-3.1-24b-instruct:free"], signup: "https://openrouter.ai/keys", kind: "openai" },
  { id: "github", name: "GitHub Models Free", endpoint: "https://models.inference.ai.azure.com/chat/completions", default_models: ["Llama-3.3-70B-Instruct", "gpt-4o-mini"], signup: "https://github.com/settings/tokens", kind: "openai" },
  { id: "openai", name: "OpenAI / Custom Compatible", endpoint: "https://api.openai.com/v1/chat/completions", default_models: ["gpt-4o-mini"], signup: "https://platform.openai.com/api-keys", kind: "openai" },
  { id: "anthropic", name: "Anthropic Claude", endpoint: "https://api.anthropic.com/v1/messages", default_models: ["claude-3-5-haiku-latest"], signup: "https://console.anthropic.com/", kind: "anthropic" }
];
const DEFAULT_CASCADE_ORDER = ["groq", "cerebras", "gemini", "mistral", "openrouter", "github"];
const _llmCooldown = new Map();
function cleanLLMOutput(t) {
  return String(t || "").replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/^```(?:json|markdown)?\s*/i, "").replace(/\s*```$/i, "").trim();
}
const FREE_LLM_BY_ID = Object.fromEntries(FREE_LLM_CATALOG.map(p => [p.id, p]));

let _b1Ready = false;
let _atsScanCleanupAt = 0;
async function cleanupAtsScans(db) {
  const now = Date.now();
  if (now - _atsScanCleanupAt < 3600000) return;
  await db.prepare("UPDATE ats_scans SET resume_text = '', jd_text = '' WHERE resume_text <> '' OR jd_text <> ''").run();
  await db.prepare("DELETE FROM ats_scans WHERE created_at < ?").bind(now - 30 * 86400000).run();
  _atsScanCleanupAt = now;
}
async function build1Db(env) {
  const db = env.DB;
  if (!_b1Ready) {
    await db.batch([
      db.prepare("CREATE TABLE IF NOT EXISTS app_config (k TEXT PRIMARY KEY, v TEXT, updated_at INTEGER)"),
      db.prepare("CREATE TABLE IF NOT EXISTS resumes (id TEXT PRIMARY KEY, sub TEXT, title TEXT, target_role TEXT, doc_json TEXT, theme_json TEXT, ats_score INTEGER, updated_at INTEGER, created_at INTEGER)"),
      db.prepare("CREATE INDEX IF NOT EXISTS resumes_sub ON resumes (sub, updated_at)"),
      db.prepare("CREATE TABLE IF NOT EXISTS ats_scans (id TEXT PRIMARY KEY, sub TEXT, filename TEXT, score INTEGER, report_json TEXT, resume_text TEXT, jd_text TEXT, created_at INTEGER)"),
      db.prepare("CREATE TABLE IF NOT EXISTS cover_letters (id TEXT PRIMARY KEY, sub TEXT, title TEXT, company TEXT, role TEXT, tone TEXT, content TEXT, theme_json TEXT, score INTEGER, updated_at INTEGER)"),
      db.prepare("CREATE INDEX IF NOT EXISTS cl_sub ON cover_letters (sub, updated_at)"),
      db.prepare("CREATE TABLE IF NOT EXISTS tracker_jobs (id TEXT PRIMARY KEY, sub TEXT, job_id TEXT, title TEXT, company TEXT, url TEXT, location TEXT, status TEXT, notes TEXT, match_score INTEGER, created_at INTEGER, updated_at INTEGER)"),
      db.prepare("CREATE INDEX IF NOT EXISTS trk_sub ON tracker_jobs (sub, updated_at)")
    ]);
    _b1Ready = true;
  }
  return db;
}

async function getAppCfg(env, key) {
  const db = await build1Db(env);
  const row = await db.prepare("SELECT v FROM app_config WHERE k = ?").bind(key).first();
  if (!row || !row.v) return null;
  try { return JSON.parse(row.v); } catch { return row.v; }
}
async function setAppCfg(env, key, val) {
  const db = await build1Db(env);
  if (val == null) { await db.prepare("DELETE FROM app_config WHERE k = ?").bind(key).run(); return; }
  await db.prepare("INSERT INTO app_config (k, v, updated_at) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v=excluded.v, updated_at=excluded.updated_at").bind(key, JSON.stringify(val), Date.now()).run();
}

async function getCascadeConfig(env) {
  let cfg = await getAppCfg(env, "llm_cascade");
  if (!cfg || typeof cfg !== "object") cfg = { order: DEFAULT_CASCADE_ORDER, providers: {} };
  if (!Array.isArray(cfg.order) || !cfg.order.length) cfg.order = DEFAULT_CASCADE_ORDER;
  if (!cfg.providers || typeof cfg.providers !== "object") cfg.providers = {};
  // Also bridge legacy cfg:ai if present
  try {
    const legRaw = await store(env).get("cfg:ai");
    if (legRaw) {
      const leg = JSON.parse(legRaw);
      const pid = leg.provider === "anthropic" ? "anthropic" : leg.provider === "gemini" ? "gemini" : "openai";
      if (leg.key && !cfg.providers[pid]?.key) {
        cfg.providers[pid] = { enabled: true, key: leg.key, model: leg.model || FREE_LLM_BY_ID[pid].default_models[0], base_url: leg.base_url || "" };
        if (!cfg.order.includes(pid)) cfg.order.push(pid);
      }
    }
  } catch {}
  return cfg;
}

function publicCascadeStatus(cfg) {
  const active = [];
  const order = cfg.order.filter(id => FREE_LLM_BY_ID[id]);
  for (const id of order) {
    const p = cfg.providers[id];
    if (p && p.key && p.enabled !== false) {
      active.push({ id, name: FREE_LLM_BY_ID[id].name, model: p.model || FREE_LLM_BY_ID[id].default_models[0] });
    }
  }
  return {
    ai_providers_configured: active.map(x => x.id),
    ai_active_models: active,
    ai_cascade_order: order.concat(["built-in-engine"]),
    fallback: "built-in-engine"
  };
}

async function callSingleProvider(id, pcfg, system, user, opts) {
  const spec = FREE_LLM_BY_ID[id];
  if (!spec || !pcfg || !pcfg.key) throw new Error("not configured");
  const model = (pcfg.model || spec.default_models[0]).trim();
  const ctl = new AbortController();
  const to = setTimeout(() => ctl.abort(), (opts && opts.timeoutMs) || 8000);
  try {
    if (spec.kind === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(pcfg.key)}`;
      const payload = {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature: opts?.temperature ?? 0.3, maxOutputTokens: opts?.maxTokens || 1800 }
      };
      if (opts?.json) payload.generationConfig.responseMimeType = "application/json";
      const r = await fetch(url, { method: "POST", signal: ctl.signal, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(`${id} ${r.status}: ${JSON.stringify(j).slice(0, 180)}`);
      const text = (j.candidates?.[0]?.content?.parts || []).map(x => x.text || "").join("");
      if (!text) throw new Error(`${id} empty response`);
      return { text, provider: id, model };
    }
    if (spec.kind === "anthropic") {
      const r = await fetch(spec.endpoint, {
        method: "POST", signal: ctl.signal,
        headers: { "x-api-key": pcfg.key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model, max_tokens: opts?.maxTokens || 1800, temperature: opts?.temperature ?? 0.3, system, messages: [{ role: "user", content: user }] })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(`${id} ${r.status}: ${JSON.stringify(j).slice(0, 180)}`);
      const text = (j.content || []).map(c => c.text || "").join("");
      if (!text) throw new Error(`${id} empty response`);
      return { text, provider: id, model };
    }
    // OpenAI-compatible (Groq, OpenRouter, Cerebras, Mistral, GitHub Models, OpenAI)
    const endpoint = pcfg.base_url ? pcfg.base_url.replace(/\/$/, "") + "/chat/completions" : spec.endpoint;
    const headers = { authorization: "Bearer " + pcfg.key, "content-type": "application/json" };
    if (id === "openrouter") { headers["HTTP-Referer"] = JOBS_SITE; headers["X-Title"] = "Fitwise"; }
    const body = {
      model,
      temperature: opts?.temperature ?? 0.3,
      max_tokens: opts?.maxTokens || 1800,
      messages: [{ role: "system", content: system }, { role: "user", content: user }]
    };
    if (opts?.json && id !== "openrouter" && id !== "github") body.response_format = { type: "json_object" };
    const r = await fetch(endpoint, { method: "POST", signal: ctl.signal, headers, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`${id} ${r.status}: ${JSON.stringify(j).slice(0, 180)}`);
    const text = j.choices?.[0]?.message?.content || "";
    if (!text) throw new Error(`${id} empty response`);
    return { text, provider: id, model };
  } finally { clearTimeout(to); }
}

async function isProviderCooling(env, id) {
  const now = Date.now();
  const mem = _llmCooldown.get(id);
  if (mem && mem > now) return Math.ceil((mem - now) / 1000);
  try {
    const raw = await store(env).get("llm:cd:" + id);
    if (raw) {
      const until = Number(raw);
      if (until > now) { _llmCooldown.set(id, until); return Math.ceil((until - now) / 1000); }
    }
  } catch {}
  return 0;
}
async function markProviderCooling(env, id, errMsg) {
  const isQuota = /\b(429|quota|rate.?limit|exhausted|too many requests|402)\b/i.test(errMsg);
  const sec = isQuota ? 240 : 60;
  const until = Date.now() + sec * 1000;
  _llmCooldown.set(id, until);
  try { await store(env).put("llm:cd:" + id, String(until), { expirationTtl: sec }); } catch {}
}
async function runLLMCascade(env, system, user, opts) {
  const cfg = await getCascadeConfig(env);
  const attempts = [];
  for (const id of cfg.order) {
    const p = cfg.providers[id];
    if (!p || !p.key || p.enabled === false) continue;
    const cdSec = await isProviderCooling(env, id);
    if (cdSec > 0) {
      attempts.push({ provider: id, skipped: true, cooldown_s: cdSec });
      continue;
    }
    const spec = FREE_LLM_BY_ID[id];
    const models = [p.model || spec?.default_models?.[0]].filter(Boolean);
    if (p.fallback_model && !models.includes(p.fallback_model)) models.push(p.fallback_model);
    let providerFailedAll = true;
    let lastErr = "";
    for (const m of models) {
      try {
        const res = await callSingleProvider(id, { ...p, model: m }, system, user, opts);
        res.text = cleanLLMOutput(res.text);
        providerFailedAll = false;
        return { ok: true, ...res, attempts };
      } catch (e) {
        lastErr = String(e.message || e).slice(0, 140);
        attempts.push({ provider: id, model: m, error: lastErr });
      }
    }
    if (providerFailedAll && lastErr) await markProviderCooling(env, id, lastErr);
  }
  return { ok: false, provider: "built-in-engine", model: "fitwise-deterministic-v1", attempts };
}

// ---------- Built-in Smart Deterministic Engine (Zero-Cost Final Fallback) ----------
const WEAK_STARTS = [
  [/^(responsible for|duties included|tasked with|helped with|worked on|assisted with|involved in|handled|dealt with)\s+/i, ""],
  [/^(managed to|was able to|tried to)\s+/i, ""]
];
const VERB_UPGRADES = {
  made: "Engineered", did: "Executed", helped: "Enabled", worked: "Collaborated to deliver",
  used: "Leveraged", fixed: "Resolved", checked: "Validated", tested: "Verified",
  wrote: "Authored", built: "Architected", ran: "Orchestrated", led: "Spearheaded",
  improved: "Accelerated", created: "Designed and launched", changed: "Transformed",
  maintained: "Sustained", supported: "Empowered", organized: "Streamlined"
};
function smartEnhanceBullet(bullet, role, jd) {
  let s = String(bullet || "").replace(/^[-•*▪]\s*/, "").trim();
  if (!s) return { improved: "Spearheaded end-to-end delivery of core platform initiatives, cutting release cycle time by [X%] across cross-functional squads.", note: "Added strong action verb and measurable outcome prompt." };
  for (const [re, rep] of WEAK_STARTS) s = s.replace(re, rep);
  const words = s.split(/\s+/);
  const firstLow = (words[0] || "").toLowerCase().replace(/[^a-z]/g, "");
  if (VERB_UPGRADES[firstLow]) {
    words[0] = VERB_UPGRADES[firstLow];
    s = words.join(" ");
  } else if (/^[a-z]/.test(s)) {
    s = s[0].toUpperCase() + s.slice(1);
  }
  if (/^(designing|building|testing|leading|managing|creating|developing|running|automating)\b/i.test(s)) {
    s = s.replace(/^(\w+)ing\b/i, (_, root) => root[0].toUpperCase() + root.slice(1) + (root.endsWith("e") ? "d" : "ed"));
  }
  const hasMetric = /\d+%|\$\d|€\d|\d+x|\d+\+?\s*(users|engineers|teams|tests|hours|days|ms|seconds|clients|projects|releases)/i.test(s);
  const jdTerms = jd ? [...countTerms(jd).keys()].filter(k => !norm(s).includes(k)).slice(0, 2) : [];
  let note = "Strengthened opening verb and recruiter clarity.";
  if (!hasMetric) {
    s = s.replace(/\.$/, "") + ", delivering measurable improvements in throughput and reliability ([add exact % or metric]).";
    note = "Upgraded verb and added a placeholder to quantify real impact without fabricating numbers.";
  } else if (jdTerms.length) {
    note = `Strengthened phrasing. Consider weaving in relevant role terms you have experience with: ${jdTerms.join(", ")}.`;
  }
  if (!/[.!?]$/.test(s)) s += ".";
  return { improved: s, note };
}

function smartCopilot(message, doc, jd) {
  const q = String(message || "").trim();
  const ql = q.toLowerCase();
  const name = doc?.name || doc?.personal?.name || "Candidate";
  const role = doc?.role || doc?.personal?.headline || (doc?.experience?.[0]?.title) || "Senior Specialist";
  const allSkills = (doc?.skills || []).flatMap(g => typeof g === "string" ? [g] : (g.items || []));
  const topSkills = allSkills.slice(0, 6);
  const jdMap = jd ? countTerms(jd) : new Map();
  const cvPlain = JSON.stringify(doc || {});
  const cvMap = countTerms(cvPlain);
  const matched = [...jdMap.keys()].filter(k => cvMap.has(k));
  const missing = [...jdMap.keys()].filter(k => !cvMap.has(k)).slice(0, 10);

  if (/keyword|ats|missing|gap|score/.test(ql)) {
    const reply = jd
      ? `Matched ${matched.length} JD keywords (${matched.slice(0, 8).join(", ") || "none yet"}). Top missing keywords from the job description: ${missing.length ? missing.join(", ") : "none — strong coverage!"}. Only add keywords you can genuinely defend in an interview.`
      : `Your resume currently highlights ${topSkills.length ? topSkills.join(", ") : "no structured skills yet"}. Paste a target Job Description in the Tailor tab so I can run an exact keyword gap scan and align your bullets.`;
    return { reply, patch: null };
  }
  if (/summary|headline|profile|intro|rewrite.*summary/.test(ql)) {
    const years = (doc?.experience?.length || 1) >= 3 ? "Experienced" : "Hands-on";  // never "results-driven": Fitwise's own letter checker flags it as a cliche
    const targetMatch = q.match(/for\s+(?:a\s+|an\s+)?([A-Za-z0-9 &/+.-]{3,50})/i);
    const tgt = (targetMatch ? targetMatch[1].trim() : role).replace(/\s+(role|position|job|vacancy)s?\.?$/i, "").trim() || role;
    const focus = (matched.length ? matched.slice(0, 4) : topSkills.slice(0, 4)).join(", ") || "scalable systems, cross-functional delivery, and continuous improvement";
    const newSummary = `${years} ${tgt} specializing in ${focus}. Known for turning complex requirements into reliable, high-impact releases with measurable gains in quality, speed, and team alignment.`;
    return {
      reply: `Here is a tighter, ATS-aligned summary tailored for ${tgt}. Click "Apply to Resume" to update your summary immediately.`,
      patch: { type: "summary", summary: newSummary, headline: tgt }
    };
  }
  if (/quantif|metric|bullet|impact|experience|role/.test(ql)) {
    const exp0 = doc?.experience?.[0];
    if (!exp0 || !(exp0.bullets || []).length) {
      return { reply: "Add at least one experience role with bullet points first, and I will sharpen every bullet with stronger action verbs and impact prompts.", patch: null };
    }
    const upgraded = exp0.bullets.map(b => smartEnhanceBullet(b, exp0.title, jd).improved);
    return {
      reply: `I upgraded ${upgraded.length} bullets in your latest role (${exp0.title || "Experience #1"}) with stronger action verbs and measurable-impact prompts (never inventing fake numbers). Review and apply below.`,
      patch: { type: "experience_bullets", index: 0, bullets: upgraded }
    };
  }
  if (/tailor|jd|job description|align/.test(ql)) {
    const exp0 = doc?.experience?.[0];
    const focus = (matched.length ? matched.slice(0, 5) : topSkills.slice(0, 5)).join(", ") || "end-to-end delivery";
    const summary = `${role} bringing hands-on depth in ${focus}. Focused on measurable product outcomes, clean execution, and close engineering-business collaboration.`;
    const bullets = exp0 && exp0.bullets ? [...exp0.bullets].sort((a, b) => {
      const sa = [...jdMap.keys()].filter(k => norm(a).includes(k)).length;
      const sb = [...jdMap.keys()].filter(k => norm(b).includes(k)).length;
      return sb - sa;
    }) : null;
    return {
      reply: jd
        ? `Tailored your summary and prioritized your most JD-relevant bullets (${matched.length} matching keywords found${missing.length ? "; missing: " + missing.slice(0, 5).join(", ") : ""}). Click Apply to update live.`
        : `Refined your summary to spotlight your strongest skills (${focus}). Paste a Job Description in the Tailor tab for role-specific keyword alignment.`,
      patch: { type: "tailor", summary, bullets: bullets ? { index: 0, items: bullets } : null }
    };
  }
  return {
    reply: `I reviewed ${name}'s resume (${doc?.experience?.length || 0} roles, ${allSkills.length} skills). Try asking me to: "Rewrite my summary for Senior QA Lead", "Quantify my latest role bullets", "Tailor to this JD", or "Check missing ATS keywords".`,
    patch: null
  };
}

function smartCoverLetter(doc, role, company, jd, tone, hiringManager) {
  const name = doc?.name || doc?.personal?.name || "Your Name";
  const headline = doc?.role || doc?.personal?.headline || role || "Specialist";
  const exp0 = doc?.experience?.[0] || {};
  const exp1 = doc?.experience?.[1] || {};
  const b0 = (exp0.bullets || [])[0] || "delivered high-impact technical and product initiatives across cross-functional teams";
  const b1 = (exp0.bullets || [])[1] || (exp1.bullets || [])[0] || "improved reliability, delivery velocity, and stakeholder visibility";
  const allSkills = (doc?.skills || []).flatMap(g => typeof g === "string" ? [g] : (g.items || []));
  const jdKeys = jd ? [...countTerms(jd).keys()] : [];
  const cvKeys = countTerms(JSON.stringify(doc || {}));
  const matched = jdKeys.filter(k => cvKeys.has(k)).slice(0, 5);
  const highlightSkills = (matched.length ? matched : allSkills.slice(0, 5)).join(", ") || "modern engineering and delivery practices";
  const greeting = hiringManager ? `Dear ${hiringManager},` : `Dear ${company || "Hiring"} Team,`;
  const rTitle = role || headline || "this role";
  const co = company || "your team";

  const openers = {
    Confident: `${exp0.title || headline}${exp0.company ? " at " + exp0.company : ""} is where I learned to do exactly what the ${rTitle} role at ${co} is asking for — ${highlightSkills}. I would like to bring that to your team.`,
    Concise: `${rTitle} at ${co} lines up closely with what I do now: ${highlightSkills}, with results I can show rather than describe.`,
    Executive: `${co} is building something the ${rTitle} brief takes seriously, and it maps onto the work I have led most recently as ${exp0.title || headline}${exp0.company ? " at " + exp0.company : ""} — scaling systems and the teams behind them.`,
    Professional: `Reading the ${rTitle} brief at ${co}, the overlap with my current work in ${highlightSkills} was immediate — which is why I am putting myself forward for it.`
  };
  const body1 = `In my recent role${exp0.company ? " at " + exp0.company : ""}, I ${b0.replace(/^[A-Z]/, c => c.toLowerCase()).replace(/\.$/, "")}. Alongside that, I ${b1.replace(/^[A-Z]/, c => c.toLowerCase()).replace(/\.$/, "")}.`;
  const body2 = matched.length
    ? `Reviewing the job description, the overlap with my day-to-day work in ${matched.join(", ")} stood out immediately. I value crisp communication, structured problem solving, and work that holds up under real production scale.`
    : `I thrive in collaborative environments where clarity, ownership, and measurable user outcomes matter. I would bring both hands-on craft and calm execution to ${co} from day one.`;
  const close = tone === "Concise"
    ? `I would welcome a brief conversation on how my experience can support ${co}'s roadmap. Thank you for your time.`
    : `I would welcome the opportunity to discuss how my background can contribute to ${co}'s upcoming goals. Thank you for your time and consideration.`;

  return `${greeting}\n\n${openers[tone] || openers.Professional}\n\n${body1}\n\n${body2}\n\n${close}\n\nSincerely,\n${name}`;
}

// ---------- Build 1 API Router ----------
async function routeBuild1(p, req, env, url) {
  // 1. Auth session status (/api/auth/me)
  if (p === "/api/auth/me" && req.method === "GET") {
    const s = await currentSession(req, env);
    if (!s) return json({ signed_in: false });
    return json({ signed_in: true, email: s.key ? "admin" : s.email, name: s.name || "", isAdmin: !!s.isAdmin });
  }

  // 2. Email OTP Passwordless Sign-In. Never return verification codes to the browser.
  if (p === "/api/auth/email/request" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const email = String(b.email || "").trim().toLowerCase();
    const name = String(b.name || "").trim().slice(0, 80);
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email address." }, 400);

    const ip = req.headers.get("cf-connecting-ip") || "0", day = amsDay();
    const eh = await sha(email);
    const kI = "q:otp:" + (await sha(ip)).slice(0, 20) + ":" + day;
    if ((await kvNum(env, kI)) >= 20) {
      return json({ error: "Too many sign-in code requests from this network. Try again later.", code: "otp_rate_limited" }, 429);
    }
    await bump(env, kI, 86400);

    const mailCfg = await getAppCfg(env, "mail_provider");
    if (!mailCfg || !mailCfg.resend_key) {
      return json({ error: "Email sign-in is temporarily unavailable. You can still use the resume builder and ATS checker without an account.", code: "email_delivery_unavailable" }, 503);
    }
    const kE = "q:otp:email:" + eh + ":" + day;
    if ((await kvNum(env, kE)) >= 5) {
      return json({ error: "Too many sign-in code requests for this email. Try again later.", code: "otp_rate_limited" }, 429);
    }
    await bump(env, kE, 86400);

    const code = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
    const expiresAt = Date.now() + 600000;
    await store(env).put("otp:" + eh, JSON.stringify({ code, email, name, at: Date.now(), expires_at: expiresAt, attempts: 0 }), { expirationTtl: 600 });

    let sent = false;
    try {
      const mr = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: "Bearer " + mailCfg.resend_key, "content-type": "application/json" },
        body: JSON.stringify({
          from: mailCfg.from || "Fitwise <noreply@fitwise.sites.tab.bot>",
          to: [email],
          subject: `Your Fitwise sign-in code: ${code}`,
          text: `Your 6-digit Fitwise sign-in code is ${code}. It expires in 10 minutes.`
        })
      });
      sent = mr.ok;
    } catch {}
    if (!sent) {
      await store(env).delete("otp:" + eh);
      return json({ error: "We could not deliver your sign-in code. Try again later or continue without an account.", code: "email_delivery_failed" }, 502);
    }
    return json({ ok: true, emailed: true, message: `We sent a 6-digit code to ${email}. It expires in 10 minutes.` });
  }

  if (p === "/api/auth/email/verify" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const email = String(b.email || "").trim().toLowerCase();
    const code = String(b.code || "").trim();
    if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(code)) return json({ error: "Enter a valid email and 6-digit code." }, 400);
    const eh = await sha(email);
    const raw = await store(env).get("otp:" + eh);
    if (!raw) return json({ error: "Code expired or not found. Request a new code." }, 401);
    let rec;
    try { rec = JSON.parse(raw); } catch { await store(env).delete("otp:" + eh); return json({ error: "Code expired or not found. Request a new code." }, 401); }
    const expiresAt = Number(rec.expires_at) || (Number(rec.at) + 600000);
    if (!expiresAt || Date.now() > expiresAt) {
      await store(env).delete("otp:" + eh);
      return json({ error: "Code expired. Request a new code." }, 401);
    }
    if (Number(rec.attempts || 0) >= 5) {
      await store(env).delete("otp:" + eh);
      return json({ error: "Too many incorrect attempts. Request a new code." }, 429);
    }
    if (rec.code !== code) {
      rec.attempts = Number(rec.attempts || 0) + 1;
      if (rec.attempts >= 5) {
        await store(env).delete("otp:" + eh);
        return json({ error: "Too many incorrect attempts. Request a new code." }, 429);
      }
      await store(env).put("otp:" + eh, JSON.stringify(rec), { expirationTtl: Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000)) });
      return json({ error: "Incorrect code. Please double-check and try again." }, 401);
    }
    await store(env).delete("otp:" + eh);
    const sub = "email:" + eh.slice(0, 28);
    const db = await usersDb(env);
    const now = Date.now();
    const existing = await db.prepare("SELECT sub, name FROM users WHERE sub = ?").bind(sub).first();
    const displayName = rec.name || (existing && existing.name) || email.split("@")[0];
    if (existing) {
      await db.prepare("UPDATE users SET last_login = ?, logins = logins + 1 WHERE sub = ?").bind(now, sub).run();
    } else {
      await db.prepare("INSERT INTO users (sub, email, name, picture, provider, source, created, last_login, logins) VALUES (?, ?, ?, '', 'email_otp', ?, ?, ?, 1)").bind(sub, email, displayName, String(b.source || "/signin").slice(0, 120), now, now).run();
    }
    const tok = await newSession(env, { sub, email, name: displayName });
    try { await afterSignin(req, env, { sub }, email, !existing, b.source || "/signin"); } catch {}
    return json({ ok: true, user: { email, name: displayName } }, 200, { "set-cookie": sessCookie(tok, SESS_TTL) });
  }

  // 3. Ungated ATS Scan persistence (?scan_id=...)
  if (p === "/api/ats/scan") {
    const db = await build1Db(env);
    await cleanupAtsScans(db);
    if (req.method === "GET") {
      const id = String(url.searchParams.get("id") || "").trim();
      if (!/^scan_(?:[a-f0-9]{14}|[a-f0-9]{32})$/i.test(id)) return json({ error: "scan not found" }, 404);
      const row = await db.prepare("SELECT id, filename, score, report_json, created_at FROM ats_scans WHERE id = ?").bind(id).first();
      if (!row) return json({ error: "scan not found" }, 404);
      if (Number(row.created_at || 0) < Date.now() - 30 * 86400000) {
        await db.prepare("DELETE FROM ats_scans WHERE id = ?").bind(id).run();
        return json({ error: "scan not found" }, 404);
      }
      return json({ id: row.id, filename: row.filename, score: row.score, report: JSON.parse(row.report_json || "{}"), created_at: row.created_at });
    }
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const report = b.report;
      if (!report || typeof report !== "object" || !Array.isArray(report.groups)) return json({ error: "Invalid ATS report." }, 400);
      const originalName = String(b.filename || "").toLowerCase();
      const extension = originalName.endsWith(".pdf") ? ".pdf" : originalName.endsWith(".docx") ? ".docx" : originalName.endsWith(".txt") ? ".txt" : "";
      const safeFilename = "Resume" + extension;
      const scoreValue = Number(report.score);
      const safeScore = Number.isFinite(scoreValue) ? Math.max(0, Math.min(100, scoreValue)) : 0;
      const safeNumber = value => { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(10000, Math.round(n))) : 0; };
      const safePct = value => { const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0; };
      const safeReport = {
        score: safeScore,
        format_score: safePct(report.format_score),
        content_score: safePct(report.content_score),
        keyword_score: report.keyword_score == null ? null : safePct(report.keyword_score),
        groups: report.groups.slice(0, 10).map(group => ({
          name: String(group && group.name || "").slice(0, 80),
          checks: (Array.isArray(group && group.checks) ? group.checks : []).slice(0, 40).map(check => ({
            id: String(check && check.id || "").slice(0, 64),
            title: String(check && check.title || "").slice(0, 120),
            status: ["pass", "warn", "fail"].includes(check && check.status) ? check.status : "warn",
            detail: String(check && check.detail || "").slice(0, 600)
          }))
        })),
        total_checks: safeNumber(report.total_checks),
        passed: safeNumber(report.passed),
        warnings: safeNumber(report.warnings),
        failed: safeNumber(report.failed),
        keywords: report.keywords && typeof report.keywords === "object" ? {
          have: (Array.isArray(report.keywords.have) ? report.keywords.have : []).slice(0, 30).map(value => String(value).slice(0, 80)),
          missing: (Array.isArray(report.keywords.missing) ? report.keywords.missing : []).slice(0, 30).map(value => String(value).slice(0, 80)),
          pct: safePct(report.keywords.pct),
          total: safeNumber(report.keywords.total)
        } : null,
        meta: {
          filename: safeFilename,
          words: safeNumber(report.meta && report.meta.words),
          bullets: safeNumber(report.meta && report.meta.bullets),
          pages: safeNumber(report.meta && report.meta.pages),
          scanned_at: String(report.meta && report.meta.scanned_at || "").slice(0, 40)
        }
      };
      const reportJson = JSON.stringify(safeReport);
      if (reportJson.length > 60000) return json({ error: "ATS report is too large." }, 413);
      const ip = req.headers.get("cf-connecting-ip") || "0";
      const rateKey = "q:ats-share:" + (await sha(ip)).slice(0, 20) + ":" + amsDay();
      if ((await kvNum(env, rateKey)) >= 50) return json({ error: "Share report limit reached. You can still review your scan in this browser." }, 429);
      await bump(env, rateKey, 86400);
      const s = await currentSession(req, env);
      const id = "scan_" + crypto.randomUUID().replace(/-/g, "");
      await db.prepare("INSERT INTO ats_scans (id, sub, filename, score, report_json, resume_text, jd_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(
        id, s ? s.sub : null, safeFilename, safeScore,
        reportJson, "", "", Date.now()
      ).run();
      try { track(req, "ats_scan", { obj: id, meta: String(report.score || 0) }); } catch {}
      return json({ ok: true, scan_id: id });
    }
  }

  // 4. Resumes CRUD (Cloud Sync when signed in)
  if (p === "/api/resumes") {
    const s = await currentSession(req, env);
    if (!s) return json({ error: "Sign in to sync resumes to cloud.", code: "signin_required" }, 401);
    const db = await build1Db(env);
    if (req.method === "GET") {
      const rows = (await db.prepare("SELECT id, title, target_role, doc_json, theme_json, ats_score, updated_at, created_at FROM resumes WHERE sub = ? ORDER BY updated_at DESC LIMIT 50").bind(s.sub).all()).results || [];
      return json({ resumes: rows.map(r => ({ id: r.id, title: r.title, target_role: r.target_role, doc: JSON.parse(r.doc_json || "{}"), theme: JSON.parse(r.theme_json || "{}"), ats_score: r.ats_score || 0, updated_at: r.updated_at, created_at: r.created_at })) });
    }
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const id = String(b.id || "res_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12)).slice(0, 64);
      const now = Date.now();
      await db.prepare("INSERT INTO resumes (id, sub, title, target_role, doc_json, theme_json, ats_score, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, target_role=excluded.target_role, doc_json=excluded.doc_json, theme_json=excluded.theme_json, ats_score=excluded.ats_score, updated_at=excluded.updated_at WHERE resumes.sub=excluded.sub")
        .bind(id, s.sub, String(b.title || "Untitled Resume").slice(0, 120), String(b.target_role || "").slice(0, 120), JSON.stringify(b.doc || {}).slice(0, 120000), JSON.stringify(b.theme || {}).slice(0, 8000), Number(b.ats_score || 0), now, Number(b.created_at || now)).run();
      return json({ ok: true, id, updated_at: now });
    }
    if (req.method === "DELETE") {
      const id = String(url.searchParams.get("id") || "");
      if (!id) return json({ error: "missing id" }, 400);
      await db.prepare("DELETE FROM resumes WHERE id = ? AND sub = ?").bind(id, s.sub).run();
      return json({ ok: true });
    }
  }

  // 5. Cover Letters CRUD
  if (p === "/api/cover-letters") {
    const s = await currentSession(req, env);
    if (!s) return json({ error: "Sign in to sync cover letters.", code: "signin_required" }, 401);
    const db = await build1Db(env);
    if (req.method === "GET") {
      const rows = (await db.prepare("SELECT id, title, company, role, tone, content, theme_json, score, updated_at FROM cover_letters WHERE sub = ? ORDER BY updated_at DESC LIMIT 40").bind(s.sub).all()).results || [];
      return json({ letters: rows.map(r => ({ ...r, theme: JSON.parse(r.theme_json || "{}") })) });
    }
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const id = String(b.id || "cl_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12)).slice(0, 64);
      const now = Date.now();
      await db.prepare("INSERT INTO cover_letters (id, sub, title, company, role, tone, content, theme_json, score, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, company=excluded.company, role=excluded.role, tone=excluded.tone, content=excluded.content, theme_json=excluded.theme_json, score=excluded.score, updated_at=excluded.updated_at WHERE cover_letters.sub=excluded.sub")
        .bind(id, s.sub, String(b.title || "Cover Letter").slice(0, 120), String(b.company || "").slice(0, 100), String(b.role || "").slice(0, 120), String(b.tone || "Professional").slice(0, 30), String(b.content || "").slice(0, 20000), JSON.stringify(b.theme || {}).slice(0, 4000), Number(b.score || 0), now).run();
      return json({ ok: true, id, updated_at: now });
    }
    if (req.method === "DELETE") {
      const id = String(url.searchParams.get("id") || "");
      await db.prepare("DELETE FROM cover_letters WHERE id = ? AND sub = ?").bind(id, s.sub).run();
      return json({ ok: true });
    }
  }

  // 6. Saved Jobs / Tracker CRUD
  if (p === "/api/tracker") {
    const s = await currentSession(req, env);
    if (!s) return json({ error: "Sign in to sync tracker.", code: "signin_required" }, 401);
    const db = await build1Db(env);
    if (req.method === "GET") {
      const rows = (await db.prepare("SELECT * FROM tracker_jobs WHERE sub = ? ORDER BY updated_at DESC LIMIT 200").bind(s.sub).all()).results || [];
      return json({ items: rows });
    }
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const id = String(b.id || "trk_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12)).slice(0, 64);
      const now = Date.now();
      await db.prepare("INSERT INTO tracker_jobs (id, sub, job_id, title, company, url, location, status, notes, match_score, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET status=excluded.status, notes=excluded.notes, match_score=excluded.match_score, updated_at=excluded.updated_at WHERE tracker_jobs.sub=excluded.sub")
        .bind(id, s.sub, String(b.job_id || "").slice(0, 32), String(b.title || "").slice(0, 160), String(b.company || "").slice(0, 120), String(b.url || "").slice(0, 500), String(b.location || "").slice(0, 120), String(b.status || "Saved").slice(0, 30), String(b.notes || "").slice(0, 4000), Number(b.match_score || 0), Number(b.created_at || now), now).run();
      return json({ ok: true, id, updated_at: now });
    }
    if (req.method === "DELETE") {
      const id = String(url.searchParams.get("id") || "");
      await db.prepare("DELETE FROM tracker_jobs WHERE id = ? AND sub = ?").bind(id, s.sub).run();
      return json({ ok: true });
    }
  }

  // 7. Public AI Endpoints (Multi-provider free/open-source cascade -> built-in engine fallback)
  if (p === "/api/ai/enhance-bullet" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const bullet = String(b.bullet || "").trim().slice(0, 800);
    const role = String(b.role || "").trim().slice(0, 120);
    const jd = String(b.jd || "").trim().slice(0, 4000);
    const sys = "You are Fitwise's truth-first resume editor. Rewrite the single resume bullet to be sharper, ATS-friendly, and impact-focused with a strong action verb. NEVER fabricate numbers, employers, or skills not in the bullet; use [X%] only if suggesting where to quantify. Return strict JSON: {\"improved\":\"...\",\"note\":\"...\"}.";
    const usr = JSON.stringify({ bullet, role, job_description_excerpt: jd.slice(0, 1500) });
    const llm = await runLLMCascade(env, sys, usr, { json: true, maxTokens: 320 });
    if (llm.ok) {
      try {
        const m = llm.text.match(/\{[\s\S]*\}/);
        const j = JSON.parse(m ? m[0] : llm.text);
        if (j.improved) return json({ ok: true, improved: String(j.improved).trim(), note: String(j.note || "Enhanced with AI"), engine: llm.provider, model: llm.model });
      } catch {}
    }
    const fb = smartEnhanceBullet(bullet, role, jd);
    return json({ ok: true, ...fb, engine: "built-in-engine", model: "fitwise-deterministic-v1" });
  }

  if (p === "/api/ai/copilot" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const message = String(b.message || "").trim().slice(0, 1500);
    const doc = b.doc || {};
    const jd = String(b.jd || "").trim().slice(0, 5000);
    const sys = "You are Fitwise Copilot, a concise truth-first career coach and resume editor. Never invent fake employers, dates, or fake numbers. Answer the user's request and optionally provide a structured patch to apply directly to their resume. Return strict JSON: {\"reply\":\"...\",\"patch\":null | {\"type\":\"summary\",\"summary\":\"...\",\"headline\":\"...\"} | {\"type\":\"experience_bullets\",\"index\":0,\"bullets\":[\"...\"]}}.";
    const usr = JSON.stringify({ user_request: message, resume: doc, job_description: jd.slice(0, 2500) });
    const llm = await runLLMCascade(env, sys, usr, { json: true, maxTokens: 1100 });
    if (llm.ok) {
      try {
        const m = llm.text.match(/\{[\s\S]*\}/);
        const j = JSON.parse(m ? m[0] : llm.text);
        if (j.reply) return json({ ok: true, reply: String(j.reply), patch: j.patch || null, engine: llm.provider, model: llm.model });
      } catch {}
    }
    const fb = smartCopilot(message, doc, jd);
    return json({ ok: true, ...fb, engine: "built-in-engine", model: "fitwise-deterministic-v1" });
  }

  if (p === "/api/ai/cover-letter" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const doc = b.doc || {};
    const role = String(b.role || "").trim().slice(0, 140);
    const company = String(b.company || "").trim().slice(0, 120);
    const jd = String(b.jd || "").trim().slice(0, 6000);
    const tone = String(b.tone || "Professional").slice(0, 30);
    const hiringManager = String(b.hiringManager || "").trim().slice(0, 80);
    const sys = "You are Fitwise Cover Letter Studio. Write a tailored, authentic, non-cliche 3-4 paragraph cover letter grounded strictly in the candidate's actual resume experience and aligned to the target role and job description. Never invent fake credentials or numbers. Return plain text only (no markdown headings).";
    const usr = JSON.stringify({ candidate_resume: doc, target_role: role, company, hiring_manager: hiringManager, tone, job_description: jd.slice(0, 3500) });
    const llm = await runLLMCascade(env, sys, usr, { json: false, maxTokens: 900 });
    if (llm.ok && llm.text.trim().length > 120) {
      return json({ ok: true, letter: llm.text.trim(), engine: llm.provider, model: llm.model });
    }
    return json({ ok: true, letter: smartCoverLetter(doc, role, company, jd, tone, hiringManager), engine: "built-in-engine", model: "fitwise-deterministic-v1" });
  }

  // 8. Admin Multi-Provider LLM Cascade Configuration & Connection Tester
  if (p === "/api/admin/llm" && req.method === "GET") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    const cfg = await getCascadeConfig(env);
    const mailCfg = await getAppCfg(env, "mail_provider");
    const masked = {};
    for (const spec of FREE_LLM_CATALOG) {
      const cur = cfg.providers[spec.id] || {};
      masked[spec.id] = {
        enabled: cur.enabled !== false && !!cur.key,
        has_key: !!cur.key,
        key_hint: cur.key ? (cur.key.slice(0, 4) + "…" + cur.key.slice(-4)) : "",
        model: cur.model || spec.default_models[0],
        fallback_model: cur.fallback_model || (spec.default_models[1] || ""),
        base_url: cur.base_url || ""
      };
    }
    return json({
      catalog: FREE_LLM_CATALOG,
      order: cfg.order,
      providers: masked,
      status: publicCascadeStatus(cfg),
      mail: { has_resend_key: !!(mailCfg && mailCfg.resend_key), from: (mailCfg && mailCfg.from) || "" }
    });
  }

  if (p === "/api/admin/llm" && req.method === "POST") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    const b = await req.json().catch(() => ({}));
    const cfg = await getCascadeConfig(env);
    if (b.action === "test" && b.provider) {
      const pid = String(b.provider);
      const existing = cfg.providers[pid] || {};
      const key = (b.key && b.key !== "__KEEP__") ? String(b.key).trim() : existing.key;
      if (!key) return json({ ok: false, error: "Enter or save an API key first." }, 400);
      try {
        const res = await callSingleProvider(pid, { ...existing, key, model: b.model || existing.model, base_url: b.base_url || existing.base_url }, "Reply with exactly: OK", "Ping", { maxTokens: 16, timeoutMs: 12000 });
        return json({ ok: true, provider: pid, model: res.model, reply: res.text.slice(0, 60) });
      } catch (e) {
        return json({ ok: false, provider: pid, error: String(e.message || e) }, 502);
      }
    }
    if (b.action === "save_mail") {
      const cur = (await getAppCfg(env, "mail_provider")) || {};
      if (b.clear) { await setAppCfg(env, "mail_provider", null); return json({ ok: true, cleared: true }); }
      const next = { resend_key: b.resend_key ? String(b.resend_key).trim() : (cur.resend_key || ""), from: String(b.from || cur.from || "").trim() };
      await setAppCfg(env, "mail_provider", next);
      return json({ ok: true, has_resend_key: !!next.resend_key });
    }
    if (Array.isArray(b.order)) cfg.order = b.order.filter(id => FREE_LLM_BY_ID[id]);
    if (b.provider && FREE_LLM_BY_ID[b.provider]) {
      const pid = b.provider;
      if (b.clear) {
        delete cfg.providers[pid];
      } else {
        const prev = cfg.providers[pid] || {};
        cfg.providers[pid] = {
          enabled: b.enabled !== false,
          key: (b.key && String(b.key).trim()) ? String(b.key).trim() : (prev.key || ""),
          model: String(b.model || prev.model || FREE_LLM_BY_ID[pid].default_models[0]).trim(),
          fallback_model: String(b.fallback_model != null ? b.fallback_model : (prev.fallback_model || "")).trim(),
          base_url: String(b.base_url != null ? b.base_url : (prev.base_url || "")).trim()
        };
        if (!cfg.order.includes(pid)) cfg.order.push(pid);
      }
    }
    await setAppCfg(env, "llm_cascade", cfg);
    return json({ ok: true, status: publicCascadeStatus(cfg) });
  }

  return null;
}
