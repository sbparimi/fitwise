
// ---------- Fitwise tailoring engine (shared logic, server side) ----------
const STOP = new Set(("a an the and or of to in for on with at by from as is are be been being this that these those it its we you your our us they them their he she his her will would can could should may might must not no yes if then than so such into over under about across per via within without also more most other some any all each every both few many much very just only own same too here there when where who whom which what why how do does did doing have has had having i me my mine myself am was were up down out off again further once job role team work working company candidate candidates position opportunity opportunities experience experienced years year strong excellent good great ability able skills skill knowledge understanding including include includes etc e.g ie well new plus using use used make sure help like want looking join apply please within based day days week weeks month months time full part remote hybrid office location salary benefits offer offers package bonus equal employer environment culture people world best responsibilities requirements qualifications preferred required nice have about who what you'll you're we're we'll it's").split(/\s+/));

// canonical term -> aliases (lowercase). The canonical spelling is what we show.
const TERMS = {
 "JavaScript":["javascript","js","ecmascript"],"TypeScript":["typescript","ts"],"Python":["python"],"Java":["java"],"C#":["c#","csharp",".net c#"],".NET":[".net","dotnet"],"C++":["c++","cpp"],"Go":["golang"],"Rust":["rust"],"Ruby":["ruby"],"PHP":["php"],"Kotlin":["kotlin"],"Swift":["swift"],"Scala":["scala"],"R":[],
 "SQL":["sql"],"PostgreSQL":["postgresql","postgres"],"MySQL":["mysql"],"MongoDB":["mongodb","mongo"],"Redis":["redis"],"NoSQL":["nosql"],"Snowflake":["snowflake"],"BigQuery":["bigquery"],"Databricks":["databricks"],"Spark":["apache spark","spark","pyspark"],"Kafka":["kafka"],"Airflow":["airflow"],"dbt":["dbt"],"ETL":["etl","elt"],
 "React":["react","react.js","reactjs"],"Angular":["angular"],"Vue":["vue","vue.js","vuejs"],"Node.js":["node.js","nodejs","node"],"Next.js":["next.js","nextjs"],"HTML":["html","html5"],"CSS":["css","css3"],"GraphQL":["graphql"],"REST APIs":["rest api","rest apis","restful","rest"],"Microservices":["microservices","micro-services"],
 "AWS":["aws","amazon web services"],"Azure":["azure","microsoft azure"],"GCP":["gcp","google cloud"],"Docker":["docker"],"Kubernetes":["kubernetes","k8s"],"Terraform":["terraform"],"CI/CD":["ci/cd","cicd","ci cd","continuous integration","continuous delivery","continuous deployment"],"Jenkins":["jenkins"],"GitHub Actions":["github actions"],"GitLab CI":["gitlab ci"],"Git":["git"],"Linux":["linux","unix"],"DevOps":["devops"],"SRE":["sre","site reliability"],"Observability":["observability","monitoring"],"Grafana":["grafana"],"Prometheus":["prometheus"],"Datadog":["datadog"],"Splunk":["splunk"],
 "Test Automation":["test automation","automated testing","automation testing","automated tests"],"Selenium":["selenium","webdriver"],"Playwright":["playwright"],"Cypress":["cypress"],"Appium":["appium"],"JUnit":["junit"],"TestNG":["testng"],"pytest":["pytest"],"Cucumber":["cucumber","bdd","gherkin"],"API Testing":["api testing","api tests","postman","rest assured","restassured"],"Performance Testing":["performance testing","load testing","jmeter","k6","gatling"],"Manual Testing":["manual testing","exploratory testing"],"Test Strategy":["test strategy","test plan","test planning"],"Quality Assurance":["quality assurance","qa"],"Regression Testing":["regression testing","regression"],"Accessibility":["accessibility","wcag","a11y"],"Security Testing":["security testing","penetration testing","owasp"],
 "Machine Learning":["machine learning","ml"],"Deep Learning":["deep learning"],"LLM":["llm","llms","large language model","large language models"],"Generative AI":["generative ai","genai","gen ai"],"NLP":["nlp","natural language processing"],"Prompt Engineering":["prompt engineering","prompting"],"RAG":["rag","retrieval augmented generation","retrieval-augmented generation"],"AI Evaluation":["ai evaluation","llm evaluation","model evaluation","evals"],"PyTorch":["pytorch"],"TensorFlow":["tensorflow"],"scikit-learn":["scikit-learn","sklearn"],"pandas":["pandas"],"NumPy":["numpy"],"MLOps":["mlops"],"Computer Vision":["computer vision"],
 "Data Analysis":["data analysis","data analytics","analytics"],"Data Visualization":["data visualization","data visualisation"],"Tableau":["tableau"],"Power BI":["power bi","powerbi"],"Excel":["excel","spreadsheets"],"Looker":["looker"],"Statistics":["statistics","statistical"],"A/B Testing":["a/b testing","ab testing","experimentation"],
 "Agile":["agile"],"Scrum":["scrum"],"Kanban":["kanban"],"Jira":["jira"],"Confluence":["confluence"],"Project Management":["project management"],"Program Management":["program management","programme management"],"Product Management":["product management"],"Stakeholder Management":["stakeholder management","stakeholders","stakeholder"],"Roadmap":["roadmap","roadmaps","roadmapping"],"Budget Management":["budget management","budgets","budgeting","p&l"],"Risk Management":["risk management"],"Change Management":["change management"],"Vendor Management":["vendor management","vendors","suppliers"],"Process Improvement":["process improvement","continuous improvement","lean","six sigma"],
 "Leadership":["leadership","led","leading"],"People Management":["people management","line management","managed a team","team management","direct reports"],"Mentoring":["mentoring","mentored","coaching","coached"],"Hiring":["hiring","recruiting","recruitment","interviewing"],"Communication":["communication","communicator"],"Cross-functional Collaboration":["cross-functional","cross functional","collaboration"],"Problem Solving":["problem solving","problem-solving"],
 "SaaS":["saas"],"B2B":["b2b"],"B2C":["b2c"],"E-commerce":["e-commerce","ecommerce"],"Fintech":["fintech"],"Payments":["payments"],"Healthcare":["healthcare"],"Logistics":["logistics","supply chain"],
 "Salesforce":["salesforce"],"HubSpot":["hubspot"],"SAP":["sap"],"CRM":["crm"],"SEO":["seo","search engine optimization"],"SEM":["sem","google ads","ppc"],"Content Marketing":["content marketing"],"Social Media":["social media"],"Email Marketing":["email marketing"],"Marketing Automation":["marketing automation"],"Copywriting":["copywriting"],"Brand":["brand","branding"],"Lead Generation":["lead generation","demand generation"],"Account Management":["account management","account manager"],"Business Development":["business development"],"Negotiation":["negotiation","negotiating"],"Customer Success":["customer success"],"Customer Service":["customer service","customer support"],
 "Figma":["figma"],"UX":["ux","user experience"],"UI":["ui","user interface"],"User Research":["user research","usability testing"],"Design Systems":["design system","design systems"],
 "Financial Analysis":["financial analysis","financial modelling","financial modeling"],"Forecasting":["forecasting","forecast"],"Accounting":["accounting","bookkeeping"],"IFRS":["ifrs"],"GAAP":["gaap"],"Audit":["audit","auditing"],"Compliance":["compliance","regulatory"],"GDPR":["gdpr"],"ISO 27001":["iso 27001"],"Security":["cybersecurity","information security","infosec"],
 "Recruitment":["talent acquisition","sourcing"],"Onboarding":["onboarding"],"Training":["training","workshops"],"Documentation":["documentation","technical writing"],"Reporting":["reporting","dashboards","kpis","kpi","okrs"],"Dutch":["dutch"],"German":["german"],"French":["french"],"Spanish":["spanish"],"English":["english"]
};
const ALIAS = []; // [regex, canonical]
for (const [canon, al] of Object.entries(TERMS)) {
  const all = new Set([canon.toLowerCase(), ...al]);
  for (const a of all) {
    if (!a) continue;
    const esc = a.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
    // single short tokens like "r","go","ts" need exact case-sensitive-ish handling; skip ambiguous
    ALIAS.push([new RegExp("(^|[^a-z0-9+#])" + esc + "(?=$|[^a-z0-9+#])", "g"), canon, a]);
  }
}
const AMBIG = new Set(["R", "Go", "Swift", "Rust", "Ruby", "Spark", "Brand", "Training", "Reporting", "Leadership", "Communication", "English", "Excel", "Audit", "Forecasting", "Security", "Regression Testing", "Observability", "Hiring", "Mentoring", "Onboarding", "Documentation", "Roadmap", "Payments"]);

function norm(s) { return " " + (s || "").toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u2013\u2014]/g, "-").replace(/\s+/g, " ") + " "; }

function countTerms(text) {
  const t = norm(text), out = new Map();
  for (const [re, canon] of ALIAS) {
    re.lastIndex = 0; const m = t.match(re);
    if (m) out.set(canon, (out.get(canon) || 0) + m.length);
  }
  // "R" and "Go" only via exact uppercase standalone in original text
  for (const k of ["R", "Go"]) out.delete(k);
  if (/(^|[\s,(\/])R(?=[\s,)\/.]|$)/.test(text) && /\b(statistics|data|analytics|rstudio|tidyverse)\b/i.test(text)) out.set("R", 1);
  if (/\bGo(lang)?\b(?=[\s,)\/])/.test(text) && /\b(golang|backend|microservices|developer|engineer)\b/i.test(text) && /\bGo\b[ ,]/.test(text)) out.set("Go", 1);
  return out;
}

const CAP_STOP = new Set(("The We You Our Us Your They This That These Those It Its In On At For With And Or Of To As By From About Join Apply Who What Why How When Where Responsibilities Requirements Qualifications Preferred Required Benefits Salary Location Remote Hybrid Office Full Part Time Job Role Team Company Position Description Summary Overview Key Must Nice Have Bonus Plus Experience Skills Ability Strong Excellent Good Great Working Work New All Any Each Every Some Is Are Be Will Can May If Not No Yes Please Equal Opportunity Employer Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December EU US USA UK NL Europe European Netherlands Amsterdam London Berlin Germany France Paris Senior Junior Lead Head Manager Engineer Engineering Developer Analyst Specialist Director Mid Level Contract Permanent Internship You'll We're We'll What's Here Life Mission Values Culture Perks People Great Help Build Own Drive Make Ensure Develop Design Create Support Manage Collaborate Partner Deliver Use Work Own Understand Bring Proven Solid Hands Familiarity Knowledge Degree Bachelor Master BSc MSc PhD Years Year Day Days Week Weeks Month Months CV Resume Cover Letter Email Phone Website LinkedIn GitHub Inc Ltd BV GmbH LLC Corp Co EEO EEOC EMEA AMER APAC LATAM IP HR CEO CTO DEI FAQ API APIs AI ML Fortune PTO USD EUR GBP ID").split(/\s+/));

const BOILER = /\n[^\n]*(equal (employment )?opportunit|country hiring guidelines|privacy (policy|notice)|how [^\n]{0,30} will support you|what we offer|our benefits|benefits:?\s*\n|perks|remote-global|we are an equal|accommodation|diversity, equity|e-verify|salary range|compensation)/i;
function roleText(jd) { const m = jd.slice(200).search(BOILER); return m > 0 ? jd.slice(0, m + 200) : jd; }
function extractJobKeywords(jd0, companyName) {
  const jd = roleText(jd0);
  const lines = jd.split(/\n/);
  // boost lines in requirement-ish sections
  let boostText = "", inReq = false;
  for (const ln of lines) {
    const l = ln.trim().toLowerCase();
    if (/^(requirements|qualifications|what you('| wi)ll bring|what you bring|you have|you bring|must have|about you|who you are|your profile|what we('re| are) looking for|skills|nice to have|key skills)/.test(l)) inReq = true;
    else if (/^(benefits|what we offer|perks|about us|about the company|why join|our offer)/.test(l)) inReq = false;
    if (inReq) boostText += ln + "\n";
  }
  const base = countTerms(jd), boost = countTerms(boostText);
  const kw = new Map();
  for (const [k, c] of base) {
    if (companyName && companyName.toLowerCase().includes(k.toLowerCase())) continue;
    let w = 2 + Math.min(c, 4) + (boost.get(k) ? 2 : 0);
    if (AMBIG.has(k)) w -= 1;
    kw.set(k, { term: k, weight: w, source: "dict" });
  }
  // proper nouns / tools not in dictionary (e.g. "Snowplow", "SAFe", "ISTQB")
  const caps = new Map();
  const capRe = /(?:^|[^A-Za-z0-9])([A-Z][A-Za-z0-9+#]*[A-Z0-9+#][A-Za-z0-9+#]*|[A-Z][a-z]+[A-Z][A-Za-z]*)(?=[^A-Za-z0-9]|$)/g;
  let m;
  while ((m = capRe.exec(jd))) {
    const w = m[1];
    if (w.length < 2 || w.length > 20 || CAP_STOP.has(w)) continue;
    if (companyName && companyName.toLowerCase().includes(w.toLowerCase())) continue;
    caps.set(w, (caps.get(w) || 0) + 1);
  }
  const known = new Set([...kw.keys()].map(s => s.toLowerCase()));
  const aliasSet = new Set(ALIAS.map(a => a[2]));
  for (const [w, c] of caps) {
    const lw = w.toLowerCase();
    if (known.has(lw) || aliasSet.has(lw)) continue;
    const isAcr = /^[A-Z0-9+#]{2,7}$/.test(w);
    const isCamel = /^[A-Z][a-z]+[A-Z]/.test(w);
    if (c >= 2 || isCamel || (isAcr && c >= 1 && boostText.includes(w))) kw.set(w, { term: w, weight: 1 + Math.min(c, 3), source: "jd" });
  }
  return [...kw.values()].sort((a, b) => b.weight - a.weight).slice(0, 28);
}

function cvHas(cvNorm, cvRaw, term) {
  const canon = TERMS[term];
  if (canon !== undefined) {
    const c = countTerms(cvRaw); return c.has(term);
  }
  return new RegExp("(^|[^a-z0-9+#])" + term.toLowerCase().replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + "(?=$|[^a-z0-9+#])").test(cvNorm);
}

const HEAD_RE = /^(professional summary|summary|profile|about me|about|personal statement|career summary|objective|experience|work experience|professional experience|employment history|employment|career history|work history|relevant experience|skills|technical skills|core skills|key skills|skills & tools|skills and tools|competencies|core competencies|tools|education|education & training|academic background|certifications?|certificates|licenses|courses|training|projects|selected projects|key projects|languages|awards|achievements|publications|volunteering|volunteer experience|interests|hobbies|references)\s*:?$/i;
const BULLET_RE = /^\s*([\u2022\u25CF\u25AA\u25E6\u2023\u2043\u2219\-\*\u2013\u00B7>]|\d+[.)])\s+/;
const CONTACT_RE = /(@|\+?\d[\d\s().-]{7,}|linkedin|github|https?:\/\/|www\.|\|)/i;

function sectionKind(h) {
  const l = h.toLowerCase();
  if (/summary|profile|about|statement|objective/.test(l)) return "summary";
  if (/experience|employment|career history|work history/.test(l)) return "experience";
  if (/skill|competenc|tools/.test(l)) return "skills";
  return "other";
}

function parseCV(text) {
  const raw = text.replace(/\r/g, "").replace(/\t/g, " ").split("\n").map(s => s.replace(/\s+$/, ""));
  const cv = { name: "", contact: [], headline: "", sections: [] };
  let i = 0;
  while (i < raw.length && !raw[i].trim()) i++;
  const header = [];
  while (i < raw.length && !HEAD_RE.test(raw[i].trim().replace(/[:\-–—]+$/, "").trim())) { if (raw[i].trim()) header.push(raw[i].trim()); i++; if (header.length > 8) break; }
  if (header.length) {
    cv.name = header[0].replace(BULLET_RE, "");
    for (const h of header.slice(1)) {
      if (CONTACT_RE.test(h)) cv.contact.push(h);
      else if (!cv.headline && h.length < 90) cv.headline = h;
      else cv.contact.push(h);
    }
  }
  let cur = null;
  if (i < raw.length && !HEAD_RE.test(raw[i].trim().replace(/[:\-–—]+$/, "").trim())) cur = { title: "Profile", kind: "summary", lines: [] };
  for (; i < raw.length; i++) {
    const t = raw[i].trim(); const th = t.replace(/[:\-–—]+$/, "").trim();
    if (!t) { if (cur) cur.lines.push(""); continue; }
    if (HEAD_RE.test(th) && t.length < 40) { cur = { title: th.replace(/\b\w/g, c => c.toUpperCase()), kind: sectionKind(th), lines: [] }; cv.sections.push(cur); continue; }
    if (!cur) { cur = { title: "Profile", kind: "summary", lines: [] }; cv.sections.push(cur); }
    cur.lines.push(t);
  }
  if (cur && !cv.sections.includes(cur)) cv.sections.unshift(cur);
  for (const s of cv.sections) {
    while (s.lines.length && !s.lines[s.lines.length - 1]) s.lines.pop();
    if (s.kind === "experience") s.entries = parseEntries(s.lines);
    if (s.kind === "skills") s.items = parseSkills(s.lines);
  }
  return cv;
}

function parseEntries(lines) {
  const entries = []; let e = null; let sawBullet = false;
  for (const ln of lines) {
    if (!ln) { if (e && sawBullet) { e = null; sawBullet = false; } continue; }
    const isB = BULLET_RE.test(ln) || (e && e.header.length >= 2 && ln.length > 70);
    if (isB) {
      if (!e) { e = { header: [], bullets: [] }; entries.push(e); }
      e.bullets.push(ln.replace(BULLET_RE, "").trim()); sawBullet = true;
    } else {
      if (!e || sawBullet) { e = { header: [], bullets: [] }; entries.push(e); sawBullet = false; }
      if (e.header.length >= 3) { e.bullets.push(ln); sawBullet = true; } else e.header.push(ln);
    }
  }
  return entries;
}

function parseSkills(lines) {
  const items = [];
  for (const ln of lines) {
    if (!ln) continue;
    let l = ln.replace(BULLET_RE, "");
    const lab = l.match(/^([A-Za-z &/]{2,30}):\s*(.+)$/);
    if (lab) l = lab[2];
    for (const p of l.split(/\s*[,;|\u2022\u00B7]\s*/)) { const x = p.trim().replace(/\.$/, ""); if (x && x.length < 60 && !items.some(y => y.toLowerCase() === x.toLowerCase())) items.push(x); }
  }
  return items;
}

function relevance(text, kwMap) {
  const c = countTerms(text); let s = 0;
  for (const [k] of c) if (kwMap.has(k)) s += kwMap.get(k).weight;
  const tn = norm(text);
  for (const [k, v] of kwMap) if (v.source === "jd" && tn.includes(k.toLowerCase())) s += v.weight;
  return s;
}

// Align wording: where the CV uses an alias of a term the job names, use the job's canonical spelling.
function alignTerms(text, jdTerms, changes) {
  let out = text;
  for (const term of jdTerms) {
    const al = TERMS[term]; if (!al) continue;
    for (const a of al) {
      if (a.length < 3 || a === term.toLowerCase()) continue;
      const re = new RegExp("(^|[^A-Za-z0-9+#])(" + a.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + ")(?=$|[^A-Za-z0-9+#])", "gi");
      if (/^(led|leading|training|reporting|regression|monitoring|stakeholder|stakeholders|collaboration|analytics|budgets|vendors|suppliers|forecast|brand|lean|rest|node|gitlab|hiring|coached|mentored|qa|ml|ui|ux|sem|crm)$/.test(a)) continue;
      out = out.replace(re, (m0, p, w) => { if (w.toLowerCase() !== term.toLowerCase()) { const t2 = /^[A-Z]{2,5}$/.test(term) && /s$/i.test(w) && w.includes(" ") ? term + "s" : term; changes.add(`"${w}" → "${t2}"`); return p + t2; } return m0; });
    }
  }
  return out;
}

function splitSentences(t) { return (t.match(/[^.!?]+[.!?]*/g) || []).map(s => s.trim()).filter(Boolean); }

function guessJob(jd, title, company) {
  const lines = jd.split("\n").map(s => s.trim()).filter(Boolean);
  let t = title || "";
  if (!t) {
    const m = jd.match(/(?:job title|position|role)\s*[:\-]\s*(.{3,80})/i);
    t = m && !/^[(#\[]/.test(m[1].trim()) ? m[1].trim() : (lines.find(l => l.length <= 80 && !/^(about|we |our |job description|description|location|company)/i.test(l)) || "");
  }
  let c = company || "";
  if (!c) {
    const cand = new Map();
    const re = /\b(?:About|Join|at|At|with)\s+([A-Z][A-Za-z0-9&'\-]+(?:\s+[A-Z][A-Za-z0-9&'\-]+){0,2})|(?:^|\n|\. )([A-Z][A-Za-z0-9&'\-]+(?:\s+[A-Z][A-Za-z0-9&'\-]+){0,2})\s+(?:is|are|enables|builds|helps|was founded)\b/g;
    let m;
    while ((m = re.exec(jd))) { const n = (m[1] || m[2]).trim(); if (/^(The|Our|Us|You|This|We|It|They|Tier|Team|Remote|Home)\b/.test(n) || CAP_STOP.has(n)) continue; cand.set(n, 0); }
    for (const n of cand.keys()) cand.set(n, jd.split(n).length - 1);
    const best = [...cand.entries()].sort((a, b) => b[1] - a[1])[0];
    if (best && best[1] >= 2) c = best[0];
  }
  return { title: t.replace(/,(\S)/g, ", $1").replace(/\s*[-|–]\s*(remote|hybrid).*$/i, "").slice(0, 80), company: c.slice(0, 60) };
}

function tailorRules(cvText, jdText, opts = {}) {
  const job = guessJob(jdText, opts.title, opts.company);
  const kws = extractJobKeywords(jdText, job.company);
  const kwMap = new Map(kws.map(k => [k.term, k]));
  const cvNorm = norm(cvText);
  const matched = [], missing = [];
  let tot = 0, got = 0;
  for (const k of kws) { tot += k.weight; if (cvHas(cvNorm, cvText, k.term)) { got += k.weight; matched.push(k.term); } else missing.push(k.term); }
  const score = tot ? Math.round(100 * got / tot) : 0;
  const cv = parseCV(cvText);
  const changes = new Set(); const log = [];
  const jdTerms = kws.map(k => k.term);
  const cvTermCounts = countTerms(cvText);
  // summary
  let summarySec = cv.sections.find(s => s.kind === "summary");
  let summary = "";
  if (summarySec) {
    const sents = splitSentences(summarySec.lines.filter(Boolean).join(" "));
    const ranked = sents.map((s, i) => ({ s, i, r: relevance(s, kwMap) }));
    const first = ranked.slice().sort((a, b) => b.r - a.r || a.i - b.i)[0];
    const ordered = first && first.i > 0 ? [first, ...ranked.filter(x => x !== first)] : ranked;
    if (first && first.i > 0) log.push("Moved the most relevant sentence of your summary to the front.");
    summary = alignTerms(ordered.map(x => x.s).join(" "), jdTerms, changes);
  }
  // skills
  let skillsSec = cv.sections.find(s => s.kind === "skills");
  let skills = skillsSec ? skillsSec.items.slice() : [];
  const surfaced = [];
  for (const t of matched) {
    if (!skills.some(s => norm(s).includes(" " + t.toLowerCase() + " ") || countTerms(s).has(t))) {
      if (TERMS[t] !== undefined && cvTermCounts.has(t) && !AMBIG.has(t)) { skills.push(t); surfaced.push(t); }
    }
  }
  if (surfaced.length) log.push("Listed skills that already appear in your experience but were missing from your skills list: " + surfaced.join(", ") + ".");
  const sk = skills.map((s, i) => ({ s: alignTerms(s, jdTerms, changes), i, r: relevance(s, kwMap) + (kwMap.has(s) ? kwMap.get(s).weight : 0) }));
  sk.sort((a, b) => (b.r > 0) - (a.r > 0) || b.r - a.r || a.i - b.i);
  skills = sk.map(x => x.s);
  if (sk.some((x, j) => x.i !== j)) log.push("Put the skills this job asks for at the top of your skills list.");
  // experience
  const experience = [];
  let moved = 0;
  const expSec = cv.sections.find(s => s.kind === "experience");
  if (expSec) for (const e of expSec.entries) {
    const b = e.bullets.map((x, i) => ({ x: alignTerms(x, jdTerms, changes), i, r: relevance(x, kwMap) }));
    b.sort((p, q) => q.r - p.r || p.i - q.i);
    b.forEach((y, j) => { if (y.i !== j) moved++; });
    experience.push({ header: e.header, bullets: b.map(y => y.x) });
  }
  if (moved) log.push("Reordered bullet points inside each role so the most relevant achievements come first (" + moved + " moved). Role order, titles and dates are unchanged.");
  if (changes.size) log.push("Matched the job ad's wording where you already had the skill: " + [...changes].slice(0, 8).join(", ") + ".");
  const others = cv.sections.filter(s => s !== summarySec && s !== skillsSec && s !== expSec).map(s => ({ title: s.title, lines: s.lines.filter((l, i, a) => l || (a[i - 1] && i < a.length - 1)) }));
  if (!summary) {
    const top = matched.filter(t => cvTermCounts.has(t)).slice(0, 5);
    if (cv.headline && top.length) { summary = cv.headline.replace(/[.\s]+$/, "") + " with hands-on experience in " + top.slice(0, -1).join(", ") + (top.length > 1 ? " and " : "") + top[top.length - 1] + "."; log.push("Added a one-line summary built only from your own headline and skills."); }
  }
  const tailored = { name: cv.name, contact: cv.contact, headline: cv.headline, summary, skills, experience, expTitle: expSec ? expSec.title : "Experience", others };
  const cover = coverLetter(tailored, job, matched, kwMap);
  return { mode: "instant", job, score, matched, missing, keywords: kws.map(k => k.term), tailored, cover, changes: log };
}

function lcFirst(s) { if (/^[A-Z][a-z]/.test(s) && !/^(I|AI|API|QA)\b/.test(s)) return s[0].toLowerCase() + s.slice(1); return s; }

const IRREG = new Set("built ran led wrote drove grew cut made won set took brought began taught oversaw shipped hired cut spoke sold kept found rebuilt rewrote".split(" "));
function asClause(b) {
  const w = (b.split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z]/g, "");
  if (/ed$/.test(w) || IRREG.has(w)) return "I " + lcFirst(b);
  if (/^responsible for/i.test(b)) return "I was " + lcFirst(b);
  return "one highlight was: " + lcFirst(b);
}
function coverLetter(t, job, matched, kwMap) {
  const co = job.company || "your team", title = job.title || "this role";
  const top = matched.slice(0, 3);
  // each cited achievement keeps the role it came from, so nothing is attributed to the wrong employer
  const roleOf = en => String(en && en.header && en.header[0] || "").replace(/\s+/g, " ").replace(/[,;\s]+$/, "");
  const picks = t.experience.flatMap((en, k) => en.bullets.slice(0, 2).map(b => ({ b, k, role: roleOf(en) })))
    .sort((a, b) => relevance(b.b, kwMap) - relevance(a.b, kwMap)).slice(0, 2)
    .map(x => ({ ...x, c: asClause(x.b.replace(/[.;\s]+$/, "")) }));
  const p = [];
  p.push(`Dear Hiring Team${job.company ? " at " + job.company : ""},`);
  p.push(`I am applying for the ${title} position${job.company ? " at " + job.company : ""}.` + (top.length ? ` My background in ${top.length > 1 ? top.slice(0, -1).join(", ") + " and " + top[top.length - 1] : top[0]} matches what you describe in the role.` : ""));
  if (picks.length) {
    const a0 = picks[0], a1 = picks[1];
    let s = `${a0.role ? "As " + a0.role : "In a recent role"}, ${a0.c}.`;
    if (a1) {
      const c1 = a1.c.replace(/^I /, "I also ").replace(/^one highlight was/, "another highlight was");
      s += a1.k === a0.k ? ` In the same role, ${c1}.` : ` ${a1.role ? "As " + a1.role : "In another role"}, ${c1}.`;
    }
    p.push(s);
  }
  p.push(`I would welcome the chance to talk about how this experience could help ${co}. Thank you for your time and consideration.`);
  p.push(`Kind regards,\n${t.name || ""}`.trim());
  return p.join("\n\n");
}
