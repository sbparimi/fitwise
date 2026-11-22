
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

// ---------- Fitwise document model: parse any CV (PDF/DOCX/text lines) into sections, entries and bullets; tailor in place ----------
const MARK_RE = /^\s*([\u2022\u25CF\u25AA\u25AB\u25E6\u2023\u2043\u2219\u25A0\u25A1\u25BA\u25B6\u25B8\u25C6\u27A2\u27A4\u2756\u2713\u2714\u2705\u2794\u279C\u00B7\u2027\uF0B7\uF0A7\uF076\uF0D8\uF0FC\uF0A8\uF06C\uF06E\uF0A1\uF0B2\uF0FB\uF0E0\uF0E8*>\u00BB]|[-\u2013\u2014o](?=\s)|\d{1,2}[.)](?=\s))\s*/;
const RULE_RE = /^[\s\-_=\u2500-\u257F\u2014\u2013~*\u00B7\u2022.\u25AC\u2501\u2015\uF0BE]{5,}$/;
const MONTH = "(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|mrt|mei|okt|m\u00e4r|mai|dez|janv|f\u00e9v|avr|juil|ao\u00fbt|d\u00e9c)\\.?";
const D1 = `(?:${MONTH}\\s*'?(?:19|20)?\\d\\d|\\d{1,2}\\s*[/.\\-]\\s*(?:19|20)\\d\\d|(?:19|20)\\d\\d(?:\\s*[/.\\-]\\s*\\d{1,2})?|Q[1-4]\\s*(?:19|20)\\d\\d)`;
const DNOW = "(?:present|current|now|today|ongoing|date|heden|nu|heute|aktuell|jetzt|actuel|presente)";
const RANGE_RE = new RegExp(`\\(?\\s*(?:(?:since|from|sinds|seit)\\s+)?${D1}\\s*(?:[\\-\u2013\u2014~]|to|till|until|tot|bis|\u2192)\\s*(?:${D1}|${DNOW})\\s*\\)?|\\(?\\s*(?:since|from|sinds|seit)\\s+${D1}\\s*\\)?|\\(?\\s*${D1}\\s*\\)?`, "i");
const RANGE_STRICT = new RegExp(`${D1}\\s*(?:[\\-\u2013\u2014~]|to|till|until|tot|bis|\u2192)\\s*(?:${D1}|${DNOW})`, "i");
const ROLE_RE = /\b(engineer|manager|lead|leader|head|director|developer|analyst|consultant|specialist|architect|tester|test\s|officer|intern|designer|coordinator|scientist|administrator|owner|president|founder|co-founder|associate|assistant|executive|advisor|adviser|programmer|technician|supervisor|principal|vp|chief|cto|ceo|cfo|coo|sdet|qa\b|teacher|lecturer|researcher|nurse|accountant|editor|writer|recruiter|partner|trainee|apprentice|student|volunteer|representative|agent|operator|planner|strategist|marketer|product|scrum master|coach|mentor|freelance|contractor|clerk|controller|auditor|buyer|chef|driver|steward|pilot|doctor|physician|pharmacist|lawyer|paralegal|translator|bachelor|master|b\.?sc|m\.?sc|ph\.?d|mba|diploma|degree)\b/i;
const HEAD_KW = /(summary|profile|objective|statement|about me|experience|employment|career|history|skills|competenc|expertise|technolog|tools|education|qualification|academic|certific|licen[cs]e|training|courses|projects|achievements|accomplishments|awards|honou?rs|publications|languages|volunteer|interests|hobbies|references|personal (details|information|data|particulars)|personalia|contact|strengths|highlights|professional development|affiliations|memberships|portfolio|werkervaring|opleiding|vaardigheden|talen|berufserfahrung|ausbildung|kenntnisse|sprachen)/i;
const KIND = [["summary", /summary|profile|objective|statement|about|highlights|profiel|profil|kurzprofil/i], ["skills", /skill|competenc|expertise|technolog|tools|strengths|vaardigheden|kenntnisse|stack/i], ["languages", /language|talen|sprachen/i], ["certs", /certific|licen[cs]e|courses|training|professional development/i], ["education", /education|academic|qualification|opleiding|ausbildung|studies/i], ["experience", /experience|employment|career|work history|history|werkervaring|berufserfahrung|positions/i], ["projects", /project|portfolio/i], ["awards", /award|honou?r|achievement|accomplishment/i], ["personal", /personal|personalia|contact/i], ["interests", /interest|hobb/i], ["references", /reference/i], ["volunteer", /volunteer/i], ["publications", /publication/i]];
function kindOf(t) { for (const [k, re] of KIND) if (re.test(t)) return k; return "other"; }
const CONTACT_LINE = /(@|\+?\d[\d\s().\-]{7,}\d|linkedin|github|https?:\/\/|www\.|\bmobile\b|\bphone\b|\btel\b)/i;
const ENTRY_KINDS = new Set(["experience", "education", "projects", "volunteer"]);

// ---- place lexicon (country of the candidate; also used to find the location part of a job header) ----
const COUNTRIES = { "united states": "US", "usa": "US", "u.s.": "US", "us": "US", "america": "US", "canada": "CA", "united kingdom": "GB", "uk": "GB", "england": "GB", "scotland": "GB", "wales": "GB", "great britain": "GB", "ireland": "IE", "netherlands": "NL", "the netherlands": "NL", "holland": "NL", "nederland": "NL", "belgium": "BE", "luxembourg": "LU", "germany": "DE", "deutschland": "DE", "austria": "AT", "switzerland": "CH", "france": "FR", "spain": "ES", "portugal": "PT", "italy": "IT", "denmark": "DK", "sweden": "SE", "norway": "NO", "finland": "FI", "poland": "PL", "czech republic": "CZ", "czechia": "CZ", "romania": "RO", "hungary": "HU", "greece": "GR", "estonia": "EE", "latvia": "LV", "lithuania": "LT", "india": "IN", "australia": "AU", "new zealand": "NZ", "singapore": "SG", "uae": "AE", "united arab emirates": "AE", "dubai": "AE", "south africa": "ZA", "brazil": "BR", "mexico": "MX", "japan": "JP", "china": "CN", "pakistan": "PK", "bangladesh": "BD", "sri lanka": "LK", "philippines": "PH", "nigeria": "NG", "kenya": "KE", "egypt": "EG", "turkey": "TR", "israel": "IL", "saudi arabia": "SA", "qatar": "QA", "malaysia": "MY", "indonesia": "ID", "vietnam": "VN" };
const CITIES = { "new york": "US", "nyc": "US", "san francisco": "US", "los angeles": "US", "seattle": "US", "boston": "US", "chicago": "US", "austin": "US", "denver": "US", "atlanta": "US", "dallas": "US", "houston": "US", "miami": "US", "washington": "US", "philadelphia": "US", "san diego": "US", "san jose": "US", "portland": "US", "phoenix": "US", "raleigh": "US", "toronto": "CA", "vancouver": "CA", "montreal": "CA", "ottawa": "CA", "calgary": "CA", "london": "GB", "manchester": "GB", "birmingham": "GB", "leeds": "GB", "glasgow": "GB", "edinburgh": "GB", "bristol": "GB", "cambridge": "GB", "oxford": "GB", "dublin": "IE", "cork": "IE", "amsterdam": "NL", "rotterdam": "NL", "utrecht": "NL", "the hague": "NL", "den haag": "NL", "eindhoven": "NL", "groningen": "NL", "leiden": "NL", "delft": "NL", "haarlem": "NL", "amstelveen": "NL", "hoofddorp": "NL", "almere": "NL", "nijmegen": "NL", "arnhem": "NL", "breda": "NL", "tilburg": "NL", "zwolle": "NL", "uithoorn": "NL", "schiphol": "NL", "brussels": "BE", "antwerp": "BE", "ghent": "BE", "berlin": "DE", "munich": "DE", "m\u00fcnchen": "DE", "hamburg": "DE", "frankfurt": "DE", "cologne": "DE", "k\u00f6ln": "DE", "stuttgart": "DE", "d\u00fcsseldorf": "DE", "dusseldorf": "DE", "leipzig": "DE", "vienna": "AT", "wien": "AT", "zurich": "CH", "z\u00fcrich": "CH", "geneva": "CH", "basel": "CH", "bern": "CH", "lausanne": "CH", "paris": "FR", "lyon": "FR", "madrid": "ES", "barcelona": "ES", "lisbon": "PT", "porto": "PT", "milan": "IT", "rome": "IT", "copenhagen": "DK", "stockholm": "SE", "oslo": "NO", "helsinki": "FI", "warsaw": "PL", "krakow": "PL", "krak\u00f3w": "PL", "wroclaw": "PL", "prague": "CZ", "bucharest": "RO", "budapest": "HU", "athens": "GR", "tallinn": "EE", "bangalore": "IN", "bengaluru": "IN", "hyderabad": "IN", "chennai": "IN", "pune": "IN", "mumbai": "IN", "delhi": "IN", "new delhi": "IN", "noida": "IN", "gurgaon": "IN", "gurugram": "IN", "kolkata": "IN", "sydney": "AU", "melbourne": "AU", "brisbane": "AU", "auckland": "NZ", "singapore": "SG", "abu dhabi": "AE", "johannesburg": "ZA", "cape town": "ZA", "tokyo": "JP", "tel aviv": "IL", "istanbul": "TR", "kuala lumpur": "MY" };
const PLACE_RES = [...Object.entries(COUNTRIES).map(([k, v]) => [new RegExp("(^|[^a-z\u00e0-\u00ff])" + k.replace(/\./g, "\\.") + "($|[^a-z\u00e0-\u00ff])"), [v, k.length <= 3 && /^(us|uk|usa|u\.s\.)$/.test(k)]]), ...Object.entries(CITIES).map(([k, v]) => [new RegExp("(^|[^a-z\u00e0-\u00ff])" + k + "($|[^a-z\u00e0-\u00ff])"), [v, false]])];
const US_STATE = /,\s*(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/;
function placeOf(s) {
  const t = " " + String(s || "").toLowerCase().replace(/[()]/g, " ") + " ";
  if (US_STATE.test(s || "")) return "US";
  for (const [k, v] of PLACE_RES) { if (k.test(t)) { if (v[1] && !/\b(US|USA|UK|U\.S\.)\b/.test(s)) continue; return v[0]; } }
  return null;
}
const REGION = { US: "us", CA: "us", GB: "uk", IE: "uk", DE: "dach", AT: "dach", CH: "dach", LU: "dach", NL: "eu", BE: "eu", FR: "eu", ES: "eu", PT: "eu", IT: "eu", DK: "eu", SE: "eu", NO: "eu", FI: "eu", PL: "eu", CZ: "eu", RO: "eu", HU: "eu", GR: "eu", EE: "eu", LV: "eu", LT: "eu" };

// ---- plain text -> lines ----
function textToLines(text) {
  const raw = String(text || "").replace(/\r/g, "").split("\n");
  const out = [];
  for (let s of raw) {
    if (!s.trim()) { if (out.length) out[out.length - 1].after = (out[out.length - 1].after || 0) + 1; continue; }
    let right = "";
    const m = s.match(/^(.*\S)(?:\t+|\s{3,})(\S.*)$/);
    if (m && RANGE_RE.test(m[2]) && m[2].length < 45) { s = m[1]; right = m[2].trim(); }
    out.push({ t: s.replace(/\t/g, " ").replace(/\s+$/, ""), right, x: (s.match(/^\s*/)[0].length) * 3 });
  }
  return out;
}

function prep(lines) {
  // normalise: bullet markers, rules, whitespace
  const out = [];
  for (const L0 of lines) {
    const L = Object.assign({}, L0);
    let t = String(L.t || "").replace(/\u00A0/g, " ").replace(/\s+$/, "");
    if (!t.trim() && !L.right) continue;
    if (RULE_RE.test(t.trim()) && !L.right) { if (out.length) out[out.length - 1].ruleAfter = true; continue; }
    const m = t.match(MARK_RE);
    if (m && t.slice(m[0].length).trim().length > 1 && !(m[1] === "o" && !/^[A-Z]/.test(t.slice(m[0].length)))) {
      // a dash or number only counts as a marker when the rest isn't a date range ("2019 - 2021")
      if (!(/^\d/.test(m[1]) && RANGE_STRICT.test(t))) { L.bul = true; L.mark = m[1]; t = t.slice(m[0].length); if (L.runs) L.runs = stripRunsPrefix(L.runs, m[0]); }
    }
    t = t.trim().replace(/\s{2,}/g, " ");
    L.t = t; if (L.right) L.right = String(L.right).trim();
    out.push(L);
  }
  return out;
}
function stripRunsPrefix(runs, prefix) {
  let n = prefix.length; const out = [];
  for (const r of runs) { if (n <= 0) { out.push(r); continue; } const t = r.t; if (t.length <= n) { n -= t.length; continue; } out.push(Object.assign({}, r, { t: t.slice(n) })); n = 0; }
  if (out.length) out[0] = Object.assign({}, out[0], { t: out[0].t.replace(/^\s+/, "") });
  return out;
}
function median(a) { const b = a.filter(x => x > 0).sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : 0; }
function isCaps(t) { const l = t.replace(/[^A-Za-z\u00C0-\u024F]/g, ""); return l.length >= 3 && l === l.toUpperCase(); }
function words(t) { return t.split(/\s+/).filter(Boolean).length; }

function headingScore(L, body) {
  const t = L.t.replace(/[:\s]+$/, ""); if (!t || L.bul || L.right) return 0;
  if (words(t) > 6 || t.length > 48 || /[.!?;]$/.test(t) || RANGE_STRICT.test(t) || CONTACT_LINE.test(t) || /,/.test(t)) return 0;
  const styled = isCaps(t) || L.b || (L.s && body && L.s > body + 0.6) || (L.c && L.c !== "#000000" && L.c !== "#1a1a1a" && L.colored) || /:$/.test(L.t) || L.hstyle;
  const kw = HEAD_KW.test(t);
  if (kw && styled) return 3;
  if (kw && words(t) <= 3 && !L.s) return 2; // plain text CVs
  if (isCaps(t) && words(t) <= 4 && !ROLE_RE.test(t) && !placeOf(t)) return 1;
  return 0;
}

function parseDoc(lines0, meta) {
  meta = meta || {};
  const lines = prep(lines0);
  const body = median(lines.map(l => l.s || 0));
  // headings: keyword headings, then lines that share their exact look
  const hs = lines.map(l => headingScore(l, body));
  const sig = l => [Math.round((l.s || 0) * 2), !!l.b, l.c || "", isCaps(l.t)].join("|");
  const kwSigs = new Set(lines.filter((l, i) => hs[i] >= 2).map(sig));
  lines.forEach((l, i) => { if (hs[i] === 1 && !(kwSigs.has(sig(l)) || !l.s)) hs[i] = 0; if (hs[i] === 1 && !l.s && i < 3) hs[i] = 0; });
  // name / header block
  const doc = { name: null, header: [], sections: [], meta: { source: meta.source || "text" } };
  let i = 0;
  const firstHead = hs.findIndex(x => x > 0);
  // name = first line, or the biggest line among the first 4
  const top = lines.slice(0, Math.min(4, firstHead < 0 ? 4 : firstHead));
  let ni = 0; if (top.length && top.some(l => l.s)) { let mx = 0; top.forEach((l, k) => { if ((l.s || 0) > mx + 0.5) { mx = l.s; ni = k; } }); }
  if (lines.length) { doc.name = lineObj(lines[ni]); }
  const hdrEnd = firstHead < 0 ? Math.min(lines.length, 4) : firstHead;
  for (i = 0; i < hdrEnd; i++) {
    if (i === ni) continue;
    const L = lines[i];
    // pre-heading summary paragraph without a heading (long sentence) -> implicit profile section
    if (L.t.length > 140 && !CONTACT_LINE.test(L.t)) { doc.sections.push({ title: "", kind: "summary", implicit: true, blocks: [] }); break; }
    doc.header.push(Object.assign(lineObj(L), { kind: CONTACT_LINE.test(L.t) ? "contact" : "headline" }));
  }
  let sec = doc.sections[0] || null;
  for (; i < lines.length; i++) {
    const L = lines[i];
    if (hs[i] > 0) { sec = { title: L.t.replace(/:\s*$/, ""), kind: kindOf(L.t), st: stOf(L), runs: L.runs, src: [L.p], blocks: [], ruleAfter: !!L.ruleAfter }; doc.sections.push(sec); continue; }
    if (!sec) { sec = { title: "", kind: "summary", implicit: true, blocks: [] }; doc.sections.push(sec); }
    sec.lines = sec.lines || []; sec.lines.push(L);
  }
  for (const s of doc.sections) { s.blocks = buildBlocks(s, s.lines || []); delete s.lines; }
  // candidate country
  let cc = null;
  for (const h of doc.header) { cc = placeOf(h.t + " " + (h.right || "")); if (cc) break; }
  if (!cc) { const ex = doc.sections.find(s => s.kind === "experience"); const e = ex && ex.blocks.find(b => b.type === "entry"); if (e) cc = placeOf(e.head.map(h => h.t + " " + (h.right || "")).join(" ")); }
  doc.meta.country = cc; doc.meta.region = REGION[cc] || (cc ? "intl" : "intl");
  return doc;
}
function stOf(L) { const st = {}; if (L.s) st.s = L.s; if (L.b) st.b = 1; if (L.i) st.i = 1; if (L.colored && L.c) st.c = L.c; if (L.center) st.al = "c"; if (L.x) st.x = L.x; return st; }
function lineObj(L) { return { t: L.t, right: L.right || "", runs: L.runs, src: [L.p], st: stOf(L), ruleAfter: !!L.ruleAfter }; }
function isHeaderish(L, body) {
  if (L.bul) return false;
  if (L.right && RANGE_RE.test(L.right)) return true;
  if (RANGE_STRICT.test(L.t) && L.t.length < 140) return true;
  if (L.t.length > 110 || /[.;]$/.test(L.t) && L.t.length > 60) return false;
  if (L.b || L.i) return true;
  if (L.t.length < 80 && !/[.;]$/.test(L.t)) return true;
  return false;
}
function buildBlocks(sec, lines) {
  const blocks = [];
  if (ENTRY_KINDS.has(sec.kind) || (sec.kind === "other" && lines.some(l => l.right || RANGE_STRICT.test(l.t)))) {
    let cur = null;
    for (const L of lines) {
      const hdr = isHeaderish(L);
      if (hdr && (!cur || cur.items.length)) { cur = { type: "entry", head: [], items: [] }; blocks.push(cur); }
      if (hdr) { cur.head.push(lineObj(L)); continue; }
      if (!cur) { cur = { type: "entry", head: [], items: [] }; blocks.push(cur); }
      cur.items.push(Object.assign(lineObj(L), { type: L.bul ? "bullet" : "para", mark: L.mark }));
    }
    for (const b of blocks) b.fields = fieldsOf(b.head);
  } else {
    for (const L of lines) blocks.push(Object.assign(lineObj(L), { type: L.bul ? "bullet" : "para", mark: L.mark }));
  }
  return blocks;
}
const ORG_WORDS = /(universit|college|school|institut|academy|bank|labs?\b|group|b\.v\.|gmbh|ltd|inc\b|llc|telecom|logistics|payments|software|systems|solutions|technolog|services|consult|partners|hospital|ministry|council|agency|studio|company|corp)/i;
function isPlaceSeg(t) { return !!placeOf(t) && t.split(/\s+/).length <= 4 && !ORG_WORDS.test(t); }
function fieldsOf(head) {
  const f = { org: "", title: "", loc: "", dates: "" };
  const rest = [];
  for (const h of head) {
    for (let part of [h.t, h.right]) {
      if (!part) continue;
      const m = part.match(RANGE_STRICT) || (RANGE_RE.test(part) && part.match(RANGE_RE));
      if (m && !f.dates && (RANGE_STRICT.test(part) || /(19|20)\d\d/.test(m[0]))) { f.dates = m[0].replace(/^[\s(]+|[\s)]+$/g, ""); part = (part.slice(0, m.index) + " " + part.slice(m.index + m[0].length)).replace(/\(\s*\)/g, ""); }
      part = part.replace(/\s*[|\u2022\u00B7]\s*$/, "").replace(/^\s*[|\u2022\u00B7,\u2013\u2014-]\s*/, "").replace(/[\s,\u2013\u2014|-]+$/, "").trim();
      if (part) rest.push(part);
    }
  }
  const segs = [];
  for (const r of rest) {
    if (ROLE_RE.test(r) && !r.split(/\s*,\s*/).some(isPlaceSeg)) { segs.push({ t: r, role: true }); continue; }
    for (const s of r.split(/\s+[|\u2022\u00B7]\s+|\s+[\u2013\u2014]\s+|\s+-\s+|\s*,\s+(?=[A-Z])/)) if (s.trim()) segs.push({ t: s.trim() });
  }
  for (const s of segs) {
    const pl = !s.role && (isPlaceSeg(s.t) || /^(remote|hybrid|on-?site)\b/i.test(s.t));
    if (pl && !f.loc) { f.loc = s.t; continue; }
    if (pl && f.loc) { f.loc += ", " + s.t; continue; }
    if (!f.title && (s.role || ROLE_RE.test(s.t))) { f.title = s.t; continue; }
    if (!f.org) { f.org = s.t; continue; }
    if (!f.title) { f.title = s.t; continue; }
    f.org += ", " + s.t;
  }
  return f;
}
function docText(doc) {
  const out = [];
  if (doc.name) out.push(doc.name.t);
  for (const h of doc.header) out.push(h.t + (h.right ? " " + h.right : ""));
  for (const s of doc.sections) { out.push(s.title); for (const b of s.blocks) { if (b.type === "entry") { for (const h of b.head) out.push(h.t + (h.right ? " " + h.right : "")); for (const it of b.items) out.push(it.t); } else out.push(b.t); } }
  return out.join("\n");
}


// only true spelling variants (JS -> JavaScript, k8s -> Kubernetes); never swap a tool for a category
const SYN_OK = { "k8s": 1, "postgres": 1, "golang": 1, "nodejs": 1, "reactjs": 1, "react.js": 1, "vuejs": 1, "vue.js": 1, "nextjs": 1, "amazon web services": 1, "microsoft azure": 1, "google cloud": 1, "cicd": 1, "ci cd": 1, "dotnet": 1, "csharp": 1, "ecmascript": 1, "pyspark": 0, "gen ai": 1, "genai": 1, "large language models": 1, "large language model": 1, "micro-services": 1, "restful": 0, "webdriver": 0 };
function alignTermsSafe(text, jdTerms, changes) {
  let out = text;
  for (const term of jdTerms) {
    const al = TERMS[term]; if (!al) continue;
    const tn = term.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const a of al) {
      const an = a.replace(/[^a-z0-9]/g, "");
      if (a.length < 3 || a === term.toLowerCase()) continue;
      if (!(SYN_OK[a] || (an.length >= 4 && (tn.startsWith(an) || an.startsWith(tn)) && Math.abs(an.length - tn.length) <= 4))) continue;
      const re = new RegExp("(^|[^A-Za-z0-9+#])(" + a.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") + ")(?=$|[^A-Za-z0-9+#])", "gi");
      out = out.replace(re, (m0, p, w) => { if (w.toLowerCase() !== term.toLowerCase()) { changes.add(`"${w}" \u2192 "${term}"`); return p + term; } return m0; });
    }
  }
  return out;
}

// ---- tailoring on the model: reorder by relevance, align wording; never adds facts ----
function tailorDoc(doc0, jdText, opts) {
  opts = opts || {};
  const doc = JSON.parse(JSON.stringify(doc0));
  const job = guessJob(jdText, opts.title, opts.company);
  const kws = extractJobKeywords(jdText, job.company);
  const kwMap = new Map(kws.map(k => [k.term, k]));
  const jdTerms = kws.map(k => k.term);
  const cvText = docText(doc0), cvNorm = norm(cvText);
  const matched = [], missing = []; let tot = 0, got = 0;
  for (const k of kws) { tot += k.weight; if (cvHas(cvNorm, cvText, k.term)) { got += k.weight; matched.push(k.term); } else missing.push(k.term); }
  const score = tot ? Math.round(100 * got / tot) : 0;
  const changes = new Set(); const log = []; let moved = 0, reworded = 0;
  const setText = (node, t) => { if (t !== node.t) { node.o = node.o == null ? node.t : node.o; node.t = t; node.changed = true; reworded++; } };
  // reorder a run of consecutive bullets (blocks array, in place), keeping paragraphs where they are
  function reorder(arr) {
    let k = 0;
    while (k < arr.length) {
      if (arr[k].type !== "bullet") { k++; continue; }
      let j = k; while (j < arr.length && arr[j].type === "bullet") j++;
      const run = arr.slice(k, j).map((b, n) => ({ b, n, r: relevance(b.t, kwMap) }));
      run.sort((p, q) => q.r - p.r || p.n - q.n);
      run.forEach((x, n) => { if (x.n !== n) moved++; arr[k + n] = x.b; });
      k = j;
    }
  }
  for (const s of doc.sections) {
    if (s.kind === "summary") {
      reorder(s.blocks);
      for (const b of s.blocks) {
        if (b.type === "para" && b.t.length > 80) {
          const sents = splitSentences(b.t);
          if (sents.length > 2) {
            const ranked = sents.map((x, n) => ({ x, n, r: relevance(x, kwMap) }));
            const rest = ranked.slice(1).sort((p, q) => q.r - p.r || p.n - q.n);
            const t2 = [ranked[0], ...rest].map(x => x.x).join(" ");
            if (t2 !== b.t) { setText(b, t2); log.push("Summary: kept your opening line and moved the sentences closest to this job forward."); }
          }
        }
        setText(b, alignTermsSafe(b.t, jdTerms, changes));
      }
    } else if (s.kind === "skills") {
      for (const b of s.blocks) {
        const m = b.t.match(/^([^:]{2,40}:\s*)(.+)$/);
        const head = m ? m[1] : "", list = m ? m[2] : b.t;
        if (/[,;|\u2022\u00B7]/.test(list)) {
          const sep = list.includes(";") ? "; " : list.includes(" | ") ? " | " : list.includes("\u2022") ? " \u2022 " : list.includes("\u00B7") ? " \u00B7 " : ", ";
          const items = list.split(/\s*[,;|\u2022\u00B7]\s*/).filter(Boolean);
          const r = items.map((x, n) => ({ x, n, r: relevance(x, kwMap) + (kwMap.has(x) ? kwMap.get(x).weight : 0) }));
          r.sort((p, q) => (q.r > 0) - (p.r > 0) || q.r - p.r || p.n - q.n);
          const end = /[.]$/.test(list) ? "" : "";
          setText(b, head + r.map(x => x.x.replace(/[.]$/, "")).join(sep) + (/[.]$/.test(list.trim()) ? "." : ""));
        }
        b.rel = relevance(b.t, kwMap);
        setText(b, alignTermsSafe(b.t, jdTerms, changes));
      }
      // most relevant skill lines/bullets first
      const before = s.blocks.map(b => b);
      const idx = s.blocks.map((b, n) => ({ b, n }));
      if (s.blocks.every(b => b.type === b.type)) { idx.sort((p, q) => (q.b.rel > 0) - (p.b.rel > 0) || q.b.rel - p.b.rel || p.n - q.n); s.blocks = idx.map(x => x.b); }
      if (s.blocks.some((b, n) => b !== before[n]) || reworded) log.push("Skills: put the skills this job asks for first (only skills already on your CV).");
    } else {
      for (const b of s.blocks) {
        if (b.type === "entry") { reorder(b.items); for (const it of b.items) setText(it, alignTermsSafe(it.t, jdTerms, changes)); }
        else setText(b, alignTermsSafe(b.t, jdTerms, changes));
      }
    }
  }
  if (moved) log.push(`Reordered bullet points inside each role so the most relevant ones come first (${moved} moved). Sections, employers, titles and dates are unchanged.`);
  if (changes.size) log.push("Matched the job ad's wording where you already had the skill: " + [...changes].slice(0, 8).join(", ") + ".");
  if (!log.length) log.push("Your CV already lines up well with this job; no reordering was needed.");
  // cover letter (uses the experience section)
  const ex = doc.sections.find(s => s.kind === "experience");
  const t = { name: doc.name ? doc.name.t : "", experience: (ex ? ex.blocks.filter(b => b.type === "entry") : []).map(e => ({ header: [e.fields.title && e.fields.org ? e.fields.title + ", " + e.fields.org : (e.head[0] ? e.head[0].t : "")], bullets: e.items.map(x => x.t) })) };
  const cover = coverLetter(t, job, matched, kwMap);
  return { mode: "instant", job, score, matched, missing, keywords: jdTerms, doc, cover, changes: [...new Set(log)] };
}

// ---- the look of the uploaded CV, for rebuilding it ----
function docStyle(doc, ex) {
  ex = ex || {};
  const st = Object.assign({}, ex);
  const sizes = [];
  for (const s of doc.sections) for (const b of s.blocks) { const nodes = b.type === "entry" ? b.items : [b]; for (const n of nodes) if (n.st && n.st.s) sizes.push(n.st.s); }
  sizes.sort((a, b) => a - b); if (sizes.length) st.body = sizes[Math.floor(sizes.length / 2)];
  if (doc.name && doc.name.st && doc.name.st.s) st.nameSize = doc.name.st.s;
  if (doc.name && doc.name.st && doc.name.st.c) st.nameColor = doc.name.st.c;
  if (doc.name && doc.name.st && doc.name.st.al === "c") st.center = true;
  const hs = doc.sections.filter(s => s.title && s.st);
  if (hs.length) {
    const hz = hs.map(s => s.st.s).filter(Boolean).sort((a, b) => a - b); if (hz.length) st.headingSize = hz[Math.floor(hz.length / 2)];
    const cs = {}; hs.forEach(s => { if (s.st.c) cs[s.st.c] = (cs[s.st.c] || 0) + 1; }); const c = Object.entries(cs).sort((a, b) => b[1] - a[1])[0]; if (c && c[1] >= hs.length / 2) st.headingColor = c[0];
    st.headingBold = hs.filter(s => s.st.b).length >= hs.length / 2;
    st.headingRule = hs.filter(s => s.ruleAfter).length >= Math.max(1, hs.length / 3);
  }
  if (sizes.length) st.keepSizes = true;
  if (!st.family) st.family = "carlito";
  st.family = FitPDF.fam(st.family);
  if (doc.meta.source === "text") { st.family = "carlito"; st.headingRule = true; st.headingColor = "#1f3a5f"; st.headingSize = 11.5; st.body = 10.5; st.nameSize = 20; st.page = st.page || "A4"; }
  return st;
}

// ---------- Fitwise PDF engine: embedded Unicode TrueType (Identity-H), runs in browser and Worker ----------
var FitPDF = (function () {
const F = { metrics: null, bytes: {} };
const FAMS = { carlito: 1, caladea: 1, libsans: 1, libserif: 1 };
// characters fonts don't carry -> safe equivalents (never "?")
const NORM = { 0xF0B7: "\u2022", 0xF0A7: "\u25AA", 0xF076: "\u2022", 0xF0D8: "\u2022", 0xF0FC: "\u2713", 0xF0A8: "\u2022", 0xF0FB: "\u2022", 0xF0E0: "\u2192", 0xF0E8: "\u2192", 0xF06C: "\u2022", 0xF06E: "\u25A0", 0xF0A1: "\u2022", 0xF0B2: "\u2022",
  0x2756: "\u2022", 0x27A2: "\u2022", 0x27A4: "\u2022", 0x25BA: "\u2022", 0x25B6: "\u2022", 0x25B8: "\u2022", 0x2023: "\u2022", 0x2043: "\u2022", 0x2219: "\u2022", 0x25C6: "\u2022", 0x25C7: "\u2022", 0x2B9A: "\u2022", 0x2794: "\u2192", 0x279C: "\u2192", 0x27F6: "\u2192", 0x21D2: "\u2192",
  0x2705: "\u2713", 0x2714: "\u2713", 0x2611: "\u2713", 0xFB00: "ff", 0xFB01: "fi", 0xFB02: "fl", 0xFB03: "ffi", 0xFB04: "ffl", 0x00AD: "", 0x200B: "", 0x200C: "", 0x200D: "", 0xFEFF: "", 0x2060: "", 0xFFFD: "", 0x2028: " ", 0x2029: " ", 0x00A0: " ", 0x2002: " ", 0x2003: " ", 0x2009: " ", 0x202F: " ", 0x2007: " ",
  0x2010: "-", 0x2011: "-", 0x2012: "\u2013", 0x2015: "\u2014", 0x2212: "-", 0x2032: "'", 0x2033: "\"", 0x201B: "'", 0x201F: "\"", 0x2E3A: "\u2014", 0x2E3B: "\u2014", 0x00B4: "'", 0x02BC: "'", 0x02B9: "'", 0x02BA: "\"", 0x0060: "'" };
async function load(get) { // get(path) -> Promise<ArrayBuffer>
  if (F.metrics) return;
  const m = await get("/fonts/metrics.json"); F.metrics = JSON.parse(new TextDecoder().decode(m));
}
async function need(key, get) { if (!F.bytes[key]) F.bytes[key] = new Uint8Array(await get("/fonts/" + key + ".z")); }
function fam(name) {
  const n = String(name || "").toLowerCase();
  if (FAMS[n]) return n;
  if (/calibri|carlito|candara|corbel|aptos|segoe|source sans|myriad/.test(n)) return "carlito";
  if (/cambria|caladea|constantia/.test(n)) return "caladea";
  if (/times|georgia|garamond|serif|book antiqua|palatino|minion|baskerville|bodoni|lora|merriweather|charter|liberationserif|tinos|playfair|didot|cormorant/.test(n) && !/sans/.test(n)) return "libserif";
  if (/arial|helvetica|liberation|verdana|tahoma|roboto|open ?sans|lato|inter|montserrat|poppins|nunito|raleway|arimo|dejavu|noto|ubuntu|futura|avenir|gill|trebuchet|century gothic|sans/.test(n)) return "libsans";
  return "carlito";
}
function fk(family, b, i) { return fam(family) + "-" + (b ? "B" : i ? "I" : "R"); }
// normalise a string to what the font can draw; unknown characters are dropped, never "?"
function clean(s, key) {
  const m = F.metrics[key].cmap; let out = "";
  for (const ch of String(s == null ? "" : s).normalize("NFC")) {
    const cp = ch.codePointAt(0);
    if (cp === 9) { out += " "; continue; }
    if (cp < 32) continue;
    if (m[cp]) { out += ch; continue; }
    if (NORM[cp] !== undefined) { const r = NORM[cp]; if (!r || [...r].every(c => m[c.codePointAt(0)])) { out += r; continue; } }
    if (cp >= 0x2500 && cp <= 0x259F) { out += "-"; continue; } // box drawing
    const d = ch.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    if (d && [...d].every(c => m[c.codePointAt(0)])) { out += d; continue; }
    if (cp >= 0x25A0 && cp <= 0x27BF || cp >= 0xF000 && cp <= 0xF0FF) { out += "\u2022"; continue; }
    // else: drop
  }
  return out;
}
function width(s, key, size) { const m = F.metrics[key].cmap, dw = F.metrics[key].dw; let w = 0; for (const ch of s) { const g = m[ch.codePointAt(0)]; w += g ? g[1] : dw; } return w * size / 1000; }
function hex2rgb(h) { if (Array.isArray(h)) return h; const x = String(h || "#000").replace("#", ""); const v = x.length === 3 ? x.split("").map(c => c + c).join("") : x.padEnd(6, "0"); return [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) / 255); }
const f3 = n => (Math.round(n * 1000) / 1000).toString();

class Doc {
  constructor(o = {}) { this.W = o.w || 595.28; this.H = o.h || 841.89; this.preview = !!o.preview; this.title = o.title || "CV"; this.pages = []; this.used = {}; this.fontIdx = {}; }
  addPage() { const p = { ops: [] }; this.pages.push(p); return p; }
  _font(key) { if (!(key in this.fontIdx)) { this.fontIdx[key] = Object.keys(this.fontIdx).length + 1; this.used[key] = new Map(); } return this.fontIdx[key]; }
  text(p, x, y, s, key, size, color, opts = {}) {
    s = clean(s, key); if (!s) return 0;
    const idx = this._font(key), m = F.metrics[key].cmap, used = this.used[key]; let hex = "";
    for (const ch of s) { const cp = ch.codePointAt(0); const g = m[cp]; if (!g) continue; used.set(g[0], [cp, g[1]]); hex += g[0].toString(16).padStart(4, "0"); }
    const c = hex2rgb(color || "#000");
    let tr = "";
    if (opts.rotate) { const a = opts.rotate * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a); tr = `${f3(cs)} ${f3(sn)} ${f3(-sn)} ${f3(cs)} ${f3(x)} ${f3(this.H - y)} Tm`; }
    else tr = `1 0 0 1 ${f3(x)} ${f3(this.H - y)} Tm`;
    p.ops.push(`${opts.gs ? "q /" + opts.gs + " gs " : ""}BT /F${idx} ${f3(size)} Tf ${c.map(f3).join(" ")} rg ${tr} <${hex}> Tj ET${opts.gs ? " Q" : ""}`);
    return width(s, key, size);
  }
  line(p, x1, y1, x2, y2, w, color) { const c = hex2rgb(color || "#000"); p.ops.push(`${c.map(f3).join(" ")} RG ${f3(w || 0.6)} w ${f3(x1)} ${f3(this.H - y1)} m ${f3(x2)} ${f3(this.H - y2)} l S`); }
  rect(p, x, y, w, h, color) { const c = hex2rgb(color || "#000"); p.ops.push(`${c.map(f3).join(" ")} rg ${f3(x)} ${f3(this.H - y - h)} ${f3(w)} ${f3(h)} re f`); }
  circle(p, cx, cy, r, color) { const c = hex2rgb(color), k = 0.5523 * r, Y = this.H - cy; p.ops.push(`${c.map(f3).join(" ")} rg ${f3(cx + r)} ${f3(Y)} m ${f3(cx + r)} ${f3(Y + k)} ${f3(cx + k)} ${f3(Y + r)} ${f3(cx)} ${f3(Y + r)} c ${f3(cx - k)} ${f3(Y + r)} ${f3(cx - r)} ${f3(Y + k)} ${f3(cx - r)} ${f3(Y)} c ${f3(cx - r)} ${f3(Y - k)} ${f3(cx - k)} ${f3(Y - r)} ${f3(cx)} ${f3(Y - r)} c ${f3(cx + k)} ${f3(Y - r)} ${f3(cx + r)} ${f3(Y - k)} ${f3(cx + r)} ${f3(Y)} c f`); }
  watermark(p, label) {
    const key = "libsans-B"; label = label || "PREVIEW";
    for (let row = 0; row < 4; row++) {
      const y = this.H * (0.22 + row * 0.24), x = this.W * 0.08;
      this.text(p, x, y, label, key, 64, "#d22f2f", { rotate: 28, gs: "WM" });
    }
    for (let yy = 40; yy < this.H; yy += 70) for (let xx = -40 + (yy % 140 ? 60 : 0); xx < this.W; xx += 150) this.text(p, xx, yy, "FITWISE PREVIEW", key, 9, "#d22f2f", { rotate: 28, gs: "WM2" });
  }
  async bytes(get) {
    for (const k of Object.keys(this.used)) await need(k, get);
    const objs = []; const add = o => { objs.push(o); return objs.length; };
    const enc = new TextEncoder();
    const catalog = add(null), pagesId = add(null);
    const fontRefs = {};
    for (const key of Object.keys(this.fontIdx)) {
      const M = F.metrics[key], used = [...this.used[key].entries()].sort((a, b) => a[0] - b[0]);
      const z = F.bytes[key];
      const ff = add({ dict: `<< /Length ${z.length} /Length1 ${M.len} /Filter /FlateDecode >>`, data: z });
      const flags = 32 + (M.serif ? 2 : 0) + (M.ia ? 64 : 0);
      const psn = "FWSB" + "ABCDEFGHIJKL"[this.fontIdx[key] % 12] + "+" + M.ps;
      const fd = add(`<< /Type /FontDescriptor /FontName /${psn} /Flags ${flags} /FontBBox [${M.bbox.join(" ")}] /ItalicAngle ${M.ia} /Ascent ${M.asc} /Descent ${M.desc} /CapHeight ${M.cap} /StemV ${key.endsWith("B") ? 140 : 80} /FontFile2 ${ff} 0 R >>`);
      const W = used.map(([g, v]) => `${g} [${v[1]}]`).join(" ");
      const cid = add(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${psn} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${fd} 0 R /DW ${M.dw} /W [${W}] /CIDToGIDMap /Identity >>`);
      let tu = "";
      if (!this.preview) {
        const lines = used.map(([g, v]) => { const u = String.fromCodePoint(v[0]); let h = ""; for (let i = 0; i < u.length; i++) h += u.charCodeAt(i).toString(16).padStart(4, "0"); return `<${g.toString(16).padStart(4, "0")}> <${h}>`; });
        let body = "/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def /CMapName /Adobe-Identity-UCS def /CMapType 2 def 1 begincodespacerange <0000> <FFFF> endcodespacerange\n";
        for (let i = 0; i < lines.length; i += 100) { const ch = lines.slice(i, i + 100); body += `${ch.length} beginbfchar\n${ch.join("\n")}\nendbfchar\n`; }
        body += "endcmap CMapName currentdict /CMap defineresource pop end end";
        const t = add({ dict: `<< /Length ${enc.encode(body).length} >>`, data: enc.encode(body) });
        tu = ` /ToUnicode ${t} 0 R`;
      }
      fontRefs[key] = add(`<< /Type /Font /Subtype /Type0 /BaseFont /${psn} /Encoding /Identity-H /DescendantFonts [${cid} 0 R]${tu} >>`);
    }
    const fontDict = Object.keys(this.fontIdx).map(k => `/F${this.fontIdx[k]} ${fontRefs[k]} 0 R`).join(" ");
    const gs = add("<< /Type /ExtGState /ca 0.16 /CA 0.16 >>"), gs2 = add("<< /Type /ExtGState /ca 0.10 /CA 0.10 >>");
    const kids = [];
    for (const p of this.pages) {
      const body = enc.encode(p.ops.join("\n"));
      const c = add({ dict: `<< /Length ${body.length} >>`, data: body });
      kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${f3(this.W)} ${f3(this.H)}] /Resources << /Font << ${fontDict} >> /ExtGState << /WM ${gs} 0 R /WM2 ${gs2} 0 R >> >> /Contents ${c} 0 R >>`));
    }
    objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map(k => k + " 0 R").join(" ")}] /Count ${kids.length} >>`;
    const t16 = s => { let h = "FEFF"; for (let i = 0; i < s.length; i++) h += s.charCodeAt(i).toString(16).padStart(4, "0"); return "<" + h + ">"; };
    const info = add(`<< /Title ${t16(this.title)} /Producer (Fitwise) /Creator (Fitwise) >>`);
    const chunks = []; let off = 0; const offs = [];
    const push = b => { const u = typeof b === "string" ? enc.encode(b) : b; chunks.push(u); off += u.length; };
    push("%PDF-1.7\n%\u00e2\u00e3\u00cf\u00d3\n".replace(/[\u0080-\u00ff]/g, "x"));
    objs.forEach((o, i) => { offs.push(off); if (typeof o === "string") push(`${i + 1} 0 obj\n${o}\nendobj\n`); else { push(`${i + 1} 0 obj\n${o.dict}\nstream\n`); push(o.data); push("\nendstream\nendobj\n"); } });
    const xref = off;
    push(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, "0") + " 00000 n \n").join(""));
    push(`trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    const out = new Uint8Array(off); let p = 0; for (const c of chunks) { out.set(c, p); p += c.length; } return out;
  }
}

// ---- rich-text runs: [{t, b, i}] ----
function runsOf(x, b, i) { if (Array.isArray(x)) return x.filter(r => r && r.t); return [{ t: String(x || ""), b: !!b, i: !!i }]; }
function runsText(r) { return r.map(x => x.t).join(""); }
// keep the original formatting when the text did not change; keep a bold lead-in when it survived
function reRun(orig, text) {
  if (!orig || !orig.length) return [{ t: text }];
  if (runsText(orig) === text) return orig;
  const allB = orig.every(r => r.b || !r.t.trim()), allI = orig.every(r => r.i || !r.t.trim());
  if (allB || allI) return [{ t: text, b: allB, i: allI }];
  const first = orig[0];
  if ((first.b || first.i) && first.t.trim().length > 1 && text.startsWith(first.t)) return [{ t: first.t, b: first.b, i: first.i }, { t: text.slice(first.t.length) }];
  return [{ t: text }];
}
// tokens: words with their font flags; spaces kept as separate tokens
function tokens(runs) {
  const out = [];
  for (const r of runs) { for (const part of String(r.t).replace(/\t/g, " ").split(/(\s+)/)) if (part) out.push({ t: /^\s+$/.test(part) ? " " : part, b: r.b, i: r.i, sp: /^\s+$/.test(part) }); }
  return out;
}
function wrapRuns(runs, family, size, maxW) {
  const toks = tokens(runs); const lines = []; let cur = [], w = 0;
  const tw = t => width(clean(t.t, fk(family, t.b, t.i)), fk(family, t.b, t.i), size);
  for (const t of toks) {
    if (t.sp) { if (cur.length) { cur.push(t); w += tw(t); } continue; }
    let ww = tw(t);
    if (w + ww > maxW && cur.length) { while (cur.length && cur[cur.length - 1].sp) cur.pop(); lines.push(cur); cur = []; w = 0; }
    if (ww > maxW) { // hard-break a very long token
      let s = t.t; while (s) { let n = s.length; while (n > 1 && width(clean(s.slice(0, n), fk(family, t.b, t.i)), fk(family, t.b, t.i), size) > maxW - w) n--; cur.push({ ...t, t: s.slice(0, n) }); s = s.slice(n); if (s) { lines.push(cur); cur = []; w = 0; } else w += tw({ ...t, t: cur[cur.length - 1].t }); }
      continue;
    }
    cur.push(t); w += ww;
  }
  while (cur.length && cur[cur.length - 1].sp) cur.pop();
  if (cur.length) lines.push(cur);
  return lines;
}
function lineWidth(toks, family, size) { let w = 0; for (const t of toks) { const k = fk(family, t.b, t.i); w += width(clean(t.t, k), k, size); } return w; }

// ---- page flow ----
class Flow {
  constructor(doc, o) { this.doc = doc; this.o = o; this.page = null; this.y = 0; this.newPage(); }
  newPage() { this.page = this.doc.addPage(); this.y = this.o.mt; if (this.o.onPage) this.o.onPage(this, this.doc.pages.length); }
  get bottom() { return this.doc.H - this.o.mb; }
  ensure(h) { if (this.y + h > this.bottom + 0.01) { this.newPage(); return true; } return false; }
  // draw tokens line at x; returns width
  drawToks(toks, x, baseline, family, size, color, boldColor) {
    let cx = x;
    for (const t of toks) { const k = fk(family, t.b, t.i); cx += this.doc.text(this.page, cx, baseline, t.t, k, size, t.b && boldColor ? boldColor : color); }
    return cx - x;
  }
  // paragraph of runs. opts: x, w, size, lead, color, align('left'|'center'|'right'|'justify'), first (hanging prefix fn), keep
  para(runs, o) {
    const fam = o.family, size = o.size, lead = o.lead || size * 1.22, x = o.x, w = o.w;
    const lines = wrapRuns(runs, fam, size, w);
    lines.forEach((ln, i) => {
      if (this.ensure(lead) && o.onBreak) o.onBreak();
      const base = this.y + size * 0.86;
      let lx = x; const lw = lineWidth(ln, fam, size);
      if (o.align === "center") lx = x + (w - lw) / 2; else if (o.align === "right") lx = x + w - lw;
      if (i === 0 && o.marker) o.marker(this, base);
      this.drawToks(ln, lx, base, fam, size, o.color, o.boldColor);
      this.y += lead;
    });
    return lines.length;
  }
  measure(runs, o) { return wrapRuns(runs, o.family, o.size, o.w).length * (o.lead || o.size * 1.22); }
  space(h) { this.y += h; }
}
return { load, need, Doc, Flow, fam, fk, clean, width, wrapRuns, lineWidth, runsOf, runsText, reRun, hex2rgb, tokens, F };
})();

// ---------- Fitwise CV renderer: one layout engine, many looks (original style or a location template) ----------
var FitRender = (function () {
const { Doc, Flow, fk, clean, width, wrapRuns, lineWidth, reRun, runsText } = FitPDF;
const PAGES = { A4: [595.28, 841.89], Letter: [612, 792] };
const MON = { jan: 1, feb: 2, mar: 3, mrt: 3, apr: 4, may: 5, mei: 5, mai: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, okt: 10, nov: 11, dec: 12, dez: 12 };
function mmyyyy(d) {
  if (!d) return "";
  return d.replace(/([A-Za-z\u00e4]{3,9})\.?\s*'?((?:19|20)?\d\d)\b/g, (m0, mo, y) => { const n = MON[mo.slice(0, 3).toLowerCase()]; if (!n) return m0; if (y.length === 2) y = "20" + y; return String(n).padStart(2, "0") + "/" + y; })
          .replace(/\s*[\u2013\u2014-]\s*|\s+to\s+/i, " \u2013 ").replace(/\bcurrent|now|today\b/i, "present").replace(/\bPresent\b/, "present");
}
function contactItems(doc) {
  const items = [];
  for (const h of doc.header) {
    if (h.kind !== "contact" && !/[|\u2022\u00B7]/.test(h.t)) continue;
    for (const p of (h.t + (h.right ? " | " + h.right : "")).split(/\s*[|\u2022\u00B7\u2013]\s+|\s{3,}|\t|\s+\|\s*/)) {
      const t = p.trim(); if (!t) continue;
      let k = "other";
      if (/@/.test(t)) k = "email"; else if (/linkedin/i.test(t)) k = "linkedin"; else if (/github|https?:|www\.|\.[a-z]{2,4}\//i.test(t)) k = "web"; else if (/^\+?[\d\s().\-]{8,}$/.test(t.replace(/^(tel|phone|mobile|m)[:.]?\s*/i, ""))) k = "phone"; else if (placeOf(t) || /^[A-Z][a-z]+(,\s*[A-Z][A-Za-z ]+)?$/.test(t)) k = "location";
      items.push({ k, t: t.replace(/^(e-?mail|tel|phone|mobile|linkedin|web|address)\s*:\s*/i, "") });
    }
  }
  return items;
}
function headlines(doc) { return doc.header.filter(h => h.kind !== "contact" && !/[|\u2022\u00B7]/.test(h.t)); }
function skillItems(sec) {
  const out = [];
  for (const b of sec.blocks) {
    const t = b.t; const m = t.match(/^([^:]{2,40}):\s*(.+)$/);
    const list = m ? m[2] : t;
    if (/[,;|\u2022\u00B7]/.test(list) || b.type === "bullet" && t.length < 50) out.push(...list.split(/\s*[,;|\u2022\u00B7]\s*/).map(s => s.replace(/[.]$/, "").trim()).filter(Boolean));
    else return null; // sentence-style skills: keep as written
  }
  return out;
}
function markOf(b, T) { if (T.bullet) return T.bullet; const m = b.mark || "\u2022"; if (/^[\u2013\u2014-]$/.test(m)) return "\u2013"; if (/^\d/.test(m)) return m; if (m === "\u2713" || m === "\u2714" || m === "\u2705" || m === "\uF0FC") return "\u2713"; if (m === "\u25AA" || m === "\uF0A7" || m === "\u25A0") return "\u25AA"; if (m === ">" || m === "\u27A2" || m === "\u27A4" || m === "\uF0D8") return "\u203A"; return "\u2022"; }

function render(doc, T, opts) {
  opts = opts || {};
  let best = null;
  const maxPages = T.maxPages || 2;
  for (const sc of [1, 0.95, 0.91, 0.87, 0.84]) {
    const d = layout(doc, T, sc, opts);
    best = d;
    if (d.pages.length <= maxPages) break;
  }
  if (opts.preview) for (const p of best.pages) best.watermark(p);
  return best;
}

function layout(doc, T, sc, opts) {
  const [W, H] = Array.isArray(T.page) ? T.page : PAGES[T.page] || PAGES.A4;
  const D = new Doc({ w: W, h: H, preview: opts.preview, title: (doc.name ? doc.name.t : "CV") + " - CV" });
  const fam = T.family, ml = T.margins[3], mr = T.margins[1];
  const body = T.body * sc, lead = body * (T.leadK || 1.25), gap = T.gap * sc;
  const CW = W - ml - mr;
  const F = new Flow(D, { mt: T.margins[0], mb: T.margins[2], onPage: (fl, n) => { if (T.pageFooter && n > 1) {} } });
  const color = T.color || "#1a1a1a", muted = T.muted || "#555555", accent = T.accent || color;
  const two = T.layout === "twocol";
  const LX = two ? ml + T.labelW : ml, LW = two ? CW - T.labelW : CW;
  const st = (n, k) => (n && n.st && n.st[k]);
  const sz = (n, def) => { const s = st(n, "s"); return T.keepSizes && s ? Math.max(7.5, Math.min(s, 30)) * sc : def; };
  const col = (n, def) => (T.keepColors && st(n, "c")) || def;
  const runsFor = n => reRun(n.runs && n.runs.length ? n.runs : [{ t: n.t, b: !!st(n, "b"), i: !!st(n, "i") }], n.t);

  // ---- header ----
  if (doc.name) {
    const s = T.name.size * (T.keepSizes && st(doc.name, "s") ? Math.min(1.25, Math.max(0.75, st(doc.name, "s") / T.name.size)) : 1) * (sc < 1 ? Math.max(sc, 0.92) : 1);
    const nameT = T.name.caps ? doc.name.t.toUpperCase() : doc.name.t;
    F.para([{ t: nameT, b: T.name.b !== false }], { family: T.name.family || fam, size: s, lead: s * 1.15, x: ml, w: CW, align: T.name.align, color: col(doc.name, T.name.color || color) });
    F.space(T.name.after * sc);
  }
  const hl = headlines(doc), ci = contactItems(doc);
  if (T.contact === "asIs") {
    for (const h of doc.header) {
      const s = sz(h, body * 0.95);
      F.para(runsFor(h).concat(h.right ? [{ t: "   " + h.right }] : []), { family: fam, size: s, x: ml, w: CW, align: st(h, "al") === "c" || T.name.align === "center" ? "center" : "left", color: col(h, h.kind === "contact" ? muted : color) });
      if (h.ruleAfter) { D.line(F.page, ml, F.y + 2, W - mr, F.y + 2, 0.6, T.ruleColor || accent); F.space(5); }
    }
  } else {
    for (const h of hl) F.para([{ t: h.t, b: true }], { family: fam, size: body * 1.05, x: ml, w: CW, align: T.name.align, color: T.headlineColor || accent });
    if (T.contact === "line") {
      const t = ci.map(c => c.t).join(T.sep || "  |  ");
      if (t) F.para([{ t }], { family: fam, size: body * 0.92, x: ml, w: CW, align: T.name.align, color: muted });
    }
  }
  F.space(T.headerAfter * sc);
  if (T.headerRule) { D.line(F.page, ml, F.y, W - mr, F.y, T.headerRule, accent); F.space(gap); }

  // ---- personal-details rows (Europass / tabular) ----
  const rowLabel = (label, y) => { const k = fk(fam, false, false); const s = body * 0.88; const lw = width(clean(label, k), k, s); D.text(F.page, ml + T.labelW - 14 - lw, y + s * 0.86 + (body - s) * 0.5, label, k, s, T.labelColor || muted); };
  function heading(title, kind, node) {
    const label = T.labels ? (T.labels[kind] || (T.caps ? title.toUpperCase() : title)) : title;
    const hs = T.heading.size * sc;
    F.ensure(hs * 1.6 + lead * 3 + T.heading.before * sc);
    if (F.y > T.margins[0] + 1) F.space(T.heading.before * sc);
    if (two) {
      const k = fk(fam, T.heading.b !== false, false); const y = F.y;
      const t = T.caps ? label.toUpperCase() : label;
      const lw = width(clean(t, k), k, hs);
      D.text(F.page, ml + T.labelW - 14 - lw, y + hs * 0.86, t, k, hs, T.heading.color || accent);
      D.line(F.page, ml + T.labelW, y + hs * 0.55, W - mr, y + hs * 0.55, 0.6, T.ruleColor || accent);
      F.space(hs * 1.5);
      return;
    }
    const t = T.caps || (T.heading.caps) ? label.toUpperCase() : label;
    const n = T.headingNode || null;
    F.para([{ t, b: T.heading.b !== false }], { family: T.heading.family || fam, size: hs, lead: hs * 1.2, x: ml, w: CW, align: T.heading.align, color: T.heading.color || accent });
    if (T.heading.rule || (T.keepRules && node && node.ruleAfter)) { D.line(F.page, ml, F.y + 1.2, W - mr, F.y + 1.2, T.heading.rule || 0.7, T.ruleColor || T.heading.color || accent); F.space(4.5 * sc); }
    F.space(T.heading.after * sc);
  }
  function bullet(b, x, w, s, c) {
    const m = markOf(b, T);
    const ind = (T.bulletIndent || 11) * sc;
    const runs = runsFor(b);
    F.ensure(lead);
    F.para(runs, { family: fam, size: s, lead: s * (T.leadK || 1.25), x: x + ind, w: w - ind, color: c, marker: (fl, base) => { const k = fk(fam, false, false); D.text(fl.page, x + (T.markX || 1) * sc, base, m, k, s, T.markColor || c); } });
    F.space((T.bulletGap || 1) * sc);
  }
  function para(b, x, w, s, c) { F.para(runsFor(b), { family: fam, size: s, lead: s * (T.leadK || 1.25), x, w, color: c }); F.space(T.paraGap * sc); }
  function rightLine(leftRuns, right, x, w, s, c, rc) {
    const k = fk(fam, false, !!T.dateItalic); const rs = s * 0.95; const rw = right ? width(clean(right, k), k, rs) + 10 : 0;
    const before = F.y; F.ensure(s * 1.3);
    const lines = wrapRuns(leftRuns, fam, s, w - rw);
    lines.forEach((ln, i) => { F.ensure(s * 1.3); const base = F.y + s * 0.86; F.drawToks(ln, x, base, fam, s, c); if (i === 0 && right) D.text(F.page, x + w - rw + 10, base, right, k, rs, rc || c); F.y += s * 1.3; });
  }
  function entry(e, kind) {
    const f = e.fields || {}; const s = body;
    const hdrH = (e.head.length || 1) * s * 1.3 + lead * 2;
    F.ensure(hdrH);
    const structured = T.entry !== "asIs" && (f.title || f.org);
    if (two) {
      const y0 = F.y; const k = fk(fam, false, false); const ds = s * 0.9;
      const dt = T.dateFmt === "mm" ? mmyyyy(f.dates) : f.dates;
      if (dt) { const lines = wrapRuns([{ t: dt }], fam, ds, T.labelW - 18); lines.forEach((ln, i) => { const lw = lineWidth(ln, fam, ds); F.drawToks(ln, ml + T.labelW - 14 - lw, y0 + ds * 0.86 + i * ds * 1.25 + 0.5, fam, ds, T.labelColor || muted); }); }
      if (structured) {
        if (f.title) F.para([{ t: f.title, b: true }], { family: fam, size: s * 1.02, x: LX, w: LW, color });
        const ol = [f.org, f.loc].filter(Boolean).join(", ");
        if (ol) F.para([{ t: ol, i: !!T.orgItalic }], { family: fam, size: s, x: LX, w: LW, color: T.orgColor || accent });
      } else for (const h of e.head) F.para(runsFor(h).concat(h.right && !f.dates ? [{ t: "  " + h.right }] : []), { family: fam, size: s, x: LX, w: LW, color });
      F.space(2 * sc);
    } else if (!structured) {
      for (const h of e.head) rightLine(runsFor(h), h.right, ml, CW, sz(h, s), col(h, color), col(h, T.dateColor || color));
      F.space(1.5 * sc);
    } else if (T.entry === "titleFirst") {
      rightLine([{ t: f.title || f.org, b: true }], T.dateFmt === "mm" ? mmyyyy(f.dates) : f.dates, ml, CW, s * 1.02, color, T.dateColor || color);
      const ol = [f.title ? f.org : "", f.loc].filter(Boolean).join(T.orgSep || ", ");
      if (ol) rightLine([{ t: ol, i: !!T.orgItalic }], "", ml, CW, s, T.orgColor || color);
      F.space(2 * sc);
    } else { // orgFirst
      rightLine([{ t: f.org || f.title, b: true }], f.loc, ml, CW, s * 1.02, T.orgColor || color, muted);
      if (f.org && f.title || f.dates) rightLine([{ t: f.org ? f.title : "", i: !!T.titleItalic, b: !!T.titleBold }], T.dateFmt === "mm" ? mmyyyy(f.dates) : f.dates, ml, CW, s, color, T.dateColor || muted);
      F.space(2 * sc);
    }
    for (const it of e.items) { if (it.type === "bullet") bullet(it, LX, LW, sz(it, s), col(it, color)); else para(it, LX, LW, sz(it, s), col(it, color)); }
    F.space(T.entryGap * sc);
  }
  function skills(sec) {
    const items = T.skills !== "asIs" ? skillItems(sec) : null;
    const catd = sec.blocks.length > 0 && sec.blocks.every(b => /^[^:]{2,40}:\s*\S/.test(b.t));
    if (items && T.skills === "columns" && items.length >= 4 && (items.length <= 18 && !catd)) {
      const cols = T.skillCols || 3, cw = LW / cols, rows = Math.ceil(items.length / cols);
      for (let r = 0; r < rows; r++) {
        let h = 0; const y0 = F.y; F.ensure(lead);
        let maxY = F.y;
        for (let c = 0; c < cols; c++) { const it = items[c * rows + r]; if (!it) continue; F.y = y0; bullet({ t: it, mark: "\u2022" }, LX + c * cw, cw - 6, body, color); maxY = Math.max(maxY, F.y); }
        F.y = maxY;
      }
      return;
    }
    if (items && (T.skills === "inline" || T.skills === "columns")) {
      const cats = sec.blocks.filter(b => /^[^:]{2,40}:\s*\S/.test(b.t));
      if (cats.length === sec.blocks.length) { for (const b of sec.blocks) { const m = b.t.match(/^([^:]{2,40}:)\s*(.+)$/); F.para([{ t: m[1] + " ", b: true }, { t: m[2] }], { family: fam, size: body, lead, x: LX, w: LW, color }); F.space(T.paraGap * sc); } return; }
      F.para([{ t: items.join(T.skillSep || "  \u2022  ") }], { family: fam, size: body, lead, x: LX, w: LW, color }); F.space(T.paraGap * sc); return;
    }
    for (const b of sec.blocks) { if (b.type === "bullet") bullet(b, LX, LW, sz(b, body), col(b, color)); else para(b, LX, LW, sz(b, body), col(b, color)); }
  }
  // ---- personal details (twocol templates) ----
  if (T.personal && ci.length) {
    heading("Personal information", "personal");
    const lab = { email: "Email", phone: "Phone", linkedin: "LinkedIn", web: "Website", location: "Location", other: "" };
    for (const c of ci) { const y = F.y; rowLabel(lab[c.k] || "", y); F.para([{ t: c.t }], { family: fam, size: body, lead, x: LX, w: LW, color }); }
    const per = doc.sections.find(s => s.kind === "personal");
    if (per) for (const b of per.blocks) { const m = b.t.match(/^([^:]{2,30}):\s*(.+)$/); const y = F.y; if (m) { rowLabel(m[1], y); F.para([{ t: m[2] }], { family: fam, size: body, lead, x: LX, w: LW, color }); } else F.para([{ t: b.t }], { family: fam, size: body, lead, x: LX, w: LW, color }); }
    F.space(gap * 0.5);
  }
  // ---- sections ----
  let secs = doc.sections.slice();
  if (T.order) { const rank = k => { const i = T.order.indexOf(k); return i < 0 ? T.order.length : i; }; secs = secs.map((s, i) => ({ s, i })).sort((a, b) => rank(a.s.kind) - rank(b.s.kind) || a.i - b.i).map(x => x.s); }
  if (T.drop) secs = secs.filter(s => !T.drop.includes(s.kind));
  if (T.personal) secs = secs.filter(s => s.kind !== "personal");
  for (const sec of secs) {
    if (!sec.blocks.length) continue;
    if (sec.title || T.labels) heading(sec.title || "Profile", sec.kind === "summary" && !sec.title ? "summary" : sec.kind, sec);
    if (sec.kind === "skills") skills(sec);
    else for (const b of sec.blocks) {
      if (b.type === "entry") entry(b, sec.kind);
      else if (b.type === "bullet") bullet(b, LX, LW, sz(b, body), col(b, color));
      else para(b, LX, LW, sz(b, body), col(b, color));
    }
    F.space(T.sectionGap * sc);
  }
  if (T.closing) { F.ensure(lead * 3); F.space(gap); heading(T.closing.title, "references"); F.para([{ t: T.closing.text }], { family: fam, size: body, lead, x: LX, w: LW, color }); }
  // page numbers on multi-page documents
  if (D.pages.length > 1 && T.pageNumbers !== false) D.pages.forEach((p, i) => { const k = fk(fam, false, false); const t = (doc.name ? doc.name.t + "  \u00B7  " : "") + "Page " + (i + 1) + " of " + D.pages.length; const tw = width(clean(t, k), k, 7.5); D.text(p, W - mr - tw, H - T.margins[2] * 0.45, t, k, 7.5, "#888888"); });
  return D;
}

// template that reproduces the uploaded CV's own look
function originalTemplate(style) {
  style = style || {};
  const b = Math.max(8.5, Math.min(style.body || 10.5, 12.5));
  const page = style.page || "A4";
  const m = style.margins || [42, 46, 40, 46];
  return {
    page, margins: m.map(x => Math.max(28, Math.min(x, 80))), family: style.family || "carlito", body: b, gap: b * 0.6, leadK: style.leadK || 1.22,
    color: style.color || "#1a1a1a", muted: style.muted || "#4a4a4a", accent: style.accent || style.headingColor || "#1a1a1a",
    name: { size: Math.max(14, Math.min(style.nameSize || 20, 30)), b: true, color: style.nameColor || "#111111", align: style.center ? "center" : "left", after: 2 },
    contact: "asIs", headerAfter: b * 0.6, headerRule: 0,
    heading: { size: Math.max(b, Math.min(style.headingSize || b + 1.5, 18)), b: style.headingBold !== false, color: style.headingColor || "#1a1a1a", rule: style.headingRule ? 0.7 : 0, before: b * 0.9, after: b * 0.45, caps: false },
    ruleColor: style.ruleColor || style.headingColor || "#999999", keepRules: true,
    entry: "asIs", skills: "asIs", keepSizes: !!style.keepSizes, keepColors: true,
    paraGap: b * 0.25, entryGap: b * 0.55, sectionGap: 0, bulletGap: 0.8, bulletIndent: b * 1.15,
    maxPages: Math.max(2, style.pages || 2), pageNumbers: false
  };
}

// cover letter in the CV's own font
function letterPdf(text, name, style) {
  style = style || {};
  const fam = style.family || "carlito"; const [W, H] = Array.isArray(style.page) ? style.page : PAGES[style.page] || PAGES.A4;
  const D = new Doc({ w: W, h: H, title: (name || "Cover") + " - Cover letter" });
  const F = new Flow(D, { mt: 64, mb: 60 }); const x = 66, w = W - 132, s = 11;
  if (name) { F.para([{ t: name, b: true }], { family: fam, size: 16, x, w, color: style.nameColor || "#111111" }); F.space(14); }
  for (const p of String(text || "").split(/\n{2,}/)) { for (const ln of p.split("\n")) F.para([{ t: ln }], { family: fam, size: s, lead: s * 1.38, x, w, color: "#1a1a1a" }); F.space(s * 0.8); }
  return D;
}
return { render, originalTemplate, letterPdf, mmyyyy, contactItems, PAGES };
})();

// ---------- location formats (server only; the clean PDFs are the paid product) ----------
const FORMATS = {
  us: { id: "us", label: "US résumé", blurb: "Letter size, 1–2 pages, no photo or date of birth, title and dates on one line, achievements first.",
    T: { page: "Letter", margins: [40, 46, 38, 46], family: "carlito", body: 10.6, gap: 6, leadK: 1.2, color: "#161616", muted: "#4a4a4a", accent: "#161616",
      name: { size: 21, b: true, align: "center", after: 1, caps: false }, contact: "line", sep: "  |  ", headerAfter: 5, headerRule: 0, headlineColor: "#333333",
      heading: { size: 11, b: true, rule: 0.8, before: 8, after: 3.5 }, caps: true, ruleColor: "#161616",
      labels: { summary: "Professional Summary", skills: "Core Skills", experience: "Professional Experience", education: "Education", certs: "Certifications", projects: "Selected Projects", awards: "Awards", languages: "Languages", volunteer: "Volunteer Experience", publications: "Publications" },
      order: ["summary", "skills", "experience", "projects", "education", "certs", "awards", "publications", "languages", "volunteer", "other"],
      drop: ["personal", "references", "interests"], entry: "titleFirst", orgItalic: true, orgSep: " \u2014 ", skills: "inline", skillSep: "  \u2022  ",
      paraGap: 2.5, entryGap: 6, sectionGap: 0, bulletGap: 0.6, bulletIndent: 12, maxPages: 2 } },
  us_modern: { id: "us_modern", label: "US résumé · modern", blurb: "Letter size, left-aligned header with a colour accent, core-skills grid, ATS-safe single column.",
    T: { page: "Letter", margins: [40, 48, 38, 48], family: "libsans", body: 9.8, gap: 6, leadK: 1.25, color: "#1c1c1c", muted: "#555555", accent: "#1f4e79",
      name: { size: 23, b: true, align: "left", after: 2, color: "#1f4e79" }, contact: "line", sep: "   \u00B7   ", headerAfter: 6, headerRule: 1.6, headlineColor: "#1f4e79",
      heading: { size: 10.5, b: true, rule: 0.5, before: 9, after: 3.5, color: "#1f4e79" }, caps: true, ruleColor: "#b8c7d9",
      labels: { summary: "Summary", skills: "Core Competencies", experience: "Experience", education: "Education", certs: "Certifications", projects: "Projects", awards: "Achievements", languages: "Languages", volunteer: "Volunteering", publications: "Publications" },
      order: ["summary", "skills", "experience", "projects", "certs", "education", "awards", "publications", "languages", "volunteer", "other"],
      drop: ["personal", "references", "interests"], entry: "orgFirst", titleItalic: false, titleBold: true, orgColor: "#1f4e79", skills: "columns", skillCols: 3,
      paraGap: 2.5, entryGap: 7, sectionGap: 0, bulletGap: 0.8, bulletIndent: 11, maxPages: 2 } },
  uk: { id: "uk", label: "UK CV", blurb: "A4, up to 2 pages, personal statement, key skills, employment history; no photo or date of birth.",
    T: { page: "A4", margins: [44, 50, 42, 50], family: "caladea", body: 10.8, gap: 6, leadK: 1.22, color: "#1b1b1b", muted: "#4d4d4d", accent: "#163a5f",
      name: { size: 22, b: true, align: "center", after: 2, color: "#163a5f" }, contact: "line", sep: "  \u2022  ", headerAfter: 6, headerRule: 0, headlineColor: "#163a5f",
      heading: { size: 11.5, b: true, rule: 0.7, before: 9, after: 4, color: "#163a5f" }, caps: true, ruleColor: "#163a5f",
      labels: { summary: "Personal Statement", skills: "Key Skills", experience: "Employment History", education: "Education & Qualifications", certs: "Professional Training & Certifications", projects: "Key Projects", awards: "Achievements", languages: "Languages", interests: "Interests", volunteer: "Voluntary Work", publications: "Publications" },
      order: ["summary", "skills", "experience", "projects", "education", "certs", "awards", "publications", "languages", "volunteer", "interests", "other"],
      drop: ["personal", "references"], entry: "titleFirst", orgItalic: true, orgSep: ", ", dateColor: "#4d4d4d", skills: "columns", skillCols: 2,
      paraGap: 3, entryGap: 7, sectionGap: 0, bulletGap: 0.8, bulletIndent: 12, maxPages: 2,
      closing: { title: "References", text: "Available on request." } } },
  europass: { id: "europass", label: "EU · Europass-style", blurb: "A4, two-column Europass layout: dates on the left, personal information block, language section.",
    T: { page: "A4", margins: [40, 40, 40, 34], family: "libsans", body: 9.4, gap: 6, leadK: 1.28, color: "#1d1d1d", muted: "#4f5a66", accent: "#0e4194", labelColor: "#3d5a80",
      layout: "twocol", labelW: 150, name: { size: 20, b: true, align: "left", after: 4, color: "#0e4194" }, contact: "none", headerAfter: 2, headerRule: 0, headlineColor: "#3d5a80",
      heading: { size: 10, b: true, before: 10, after: 3, color: "#0e4194" }, caps: true, ruleColor: "#9db3d8", personal: true,
      labels: { summary: "Profile", skills: "Skills", experience: "Work experience", education: "Education and training", certs: "Certifications and courses", projects: "Projects", awards: "Honours and awards", languages: "Language skills", interests: "Interests", volunteer: "Volunteering", publications: "Publications", references: "References" },
      order: ["summary", "experience", "education", "certs", "skills", "languages", "projects", "awards", "publications", "volunteer", "interests", "references", "other"],
      entry: "two", dateFmt: "mm", orgColor: "#3d5a80", skills: "inline", skillSep: ", ",
      paraGap: 2.5, entryGap: 7, sectionGap: 0, bulletGap: 0.6, bulletIndent: 10, maxPages: 2 } },
  dach: { id: "dach", label: "Tabular CV (DACH / NL)", blurb: "A4, German-, Austrian-, Swiss- and Dutch-style tabular CV: personal details first, MM/YYYY dates in a left column.",
    T: { page: "A4", margins: [46, 46, 42, 46], family: "carlito", body: 10.4, gap: 6, leadK: 1.24, color: "#1a1a1a", muted: "#555555", accent: "#2b2b2b", labelColor: "#555555",
      layout: "twocol", labelW: 112, name: { size: 22, b: true, align: "left", after: 0, color: "#1a1a1a" }, contact: "none", headerAfter: 4, headerRule: 2, headlineColor: "#7a1f1f",
      heading: { size: 11, b: true, before: 11, after: 4, color: "#7a1f1f" }, caps: false, ruleColor: "#c9b2b2", personal: true,
      labels: { personal: "Personal details", summary: "Profile", skills: "Skills", experience: "Professional experience", education: "Education", certs: "Further training", projects: "Projects", awards: "Awards", languages: "Languages", interests: "Interests", volunteer: "Volunteering", publications: "Publications", references: "References" },
      order: ["summary", "experience", "education", "certs", "skills", "languages", "projects", "awards", "publications", "volunteer", "interests", "references", "other"],
      entry: "two", dateFmt: "mm", orgColor: "#444444", skills: "inline", skillSep: " \u00B7 ",
      paraGap: 2.5, entryGap: 7, sectionGap: 0, bulletGap: 0.6, bulletIndent: 10, maxPages: 2 } }
};
const REGION_FORMATS = { us: ["us", "us_modern"], uk: ["uk", "europass"], dach: ["dach", "europass"], eu: ["europass", "dach"], intl: ["uk", "us"] };
const REGION_LABEL = { us: "United States / Canada", uk: "United Kingdom / Ireland", dach: "Germany / Austria / Switzerland", eu: "Netherlands, Belgium, Nordics & rest of EU", intl: "International / other" };
// generated by build_front.py from partials_header.html / partials_footer.html
const SITE_HEADER = "<header class=\"nav\" id=\"fwNav\">\n  <div class=\"nav-in\">\n    <a class=\"logo\" href=\"/\" aria-label=\"Fitwise home\">\n      <span class=\"mark\" aria-hidden=\"true\">\n        <svg viewBox=\"0 0 28 28\" width=\"28\" height=\"28\" fill=\"none\"><rect width=\"28\" height=\"28\" rx=\"8\" fill=\"url(#fwG)\"/><path d=\"M8.5 8.5h11v2.6h-8v3h6.8v2.5h-6.8V21H8.5V8.5z\" fill=\"#fff\"/><circle cx=\"19.5\" cy=\"19.5\" r=\"2.2\" fill=\"#34D399\"/><defs><linearGradient id=\"fwG\" x1=\"0\" y1=\"0\" x2=\"28\" y2=\"28\"><stop stop-color=\"#6D3DF8\"/><stop offset=\"1\" stop-color=\"#4F23E6\"/></linearGradient></defs></svg>\n      </span>\n      <span class=\"logo-txt\">fitwise</span>\n    </a>\n    <nav class=\"nav-links\" aria-label=\"Main\">\n      <div class=\"nav-dd\" id=\"featDd\">\n        <button class=\"nav-dd-btn\" type=\"button\" aria-expanded=\"false\" aria-haspopup=\"true\"><span data-i18n=\"nav_features\">Features</span> <svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\"><path d=\"M3 4.5l3 3 3-3\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></button>\n        <div class=\"nav-mega\" role=\"menu\">\n          <div class=\"mega-grid\">\n            <a href=\"/builder\" class=\"mega-item\" role=\"menuitem\"><span class=\"mi-ic ic-v\">\u2726</span><span><b>AI Resume Builder</b><small>Split-screen editor, 20 templates &amp; Copilot</small></span></a>\n            <a href=\"/ats-checker\" class=\"mega-item\" role=\"menuitem\"><span class=\"mi-ic ic-g\">\u2713</span><span><b>ATS Resume Checker</b><small>Free 28-check scan, zero login required</small></span></a>\n            <a href=\"/cover-letter\" class=\"mega-item\" role=\"menuitem\"><span class=\"mi-ic ic-b\">\u2709</span><span><b>Cover Letter Studio</b><small>Matching styled letters + quality score</small></span></a>\n            <a href=\"/jobs\" class=\"mega-item\" role=\"menuitem\"><span class=\"mi-ic ic-e\">\u26a1</span><span><b>Job Matcher &amp; Board</b><small>Daily EU &amp; Remote roles with match %</small></span></a>\n            <a href=\"/dashboard#tracker\" class=\"mega-item\" role=\"menuitem\"><span class=\"mi-ic ic-a\">\u25a4</span><span><b>Job Tracker</b><small>Save &amp; track applications from /jobs</small></span></a>\n            <a href=\"/tailor\" class=\"mega-item\" role=\"menuitem\"><span class=\"mi-ic ic-p\">\u21c4</span><span><b>In-Place DOCX Tailor</b><small>Edit your exact Word file without losing layout</small></span></a>\n            <a href=\"/cover-letter-checker\" class=\"mega-item\" role=\"menuitem\"><span class=\"mi-ic ic-r\">\u25ce</span><span><b>Cover Letter Checker</b><small>Instant 10-point grader &amp; clich\u00e9 detector</small></span></a>\n            <a href=\"/builder?tab=import\" class=\"mega-item\" role=\"menuitem\"><span class=\"mi-ic ic-i\">in</span><span><b>LinkedIn PDF Import</b><small>Turn LinkedIn profile PDF into an ATS CV</small></span></a>\n            <a href=\"/checklist\" class=\"mega-item\" role=\"menuitem\"><span class=\"mi-ic ic-t\">\u2611</span><span><b>Free QA Checklists</b><small>10-point CV &amp; 12-point Agentic Testing guides</small></span></a>\n          </div>\n          <div class=\"mega-foot\">\n            <span>New: 20 ATS-tested templates &amp; free multi-model AI cascade</span>\n            <a href=\"/templates\">Explore all 20 templates \u2192</a>\n          </div>\n        </div>\n      </div>\n      <a href=\"/templates\" data-i18n=\"nav_templates\">Templates</a>\n      <a href=\"/ats-checker\" data-i18n=\"nav_ats\">ATS Checker</a>\n      <a href=\"/jobs\" data-i18n=\"nav_jobs\">Jobs</a>\n      <a href=\"/pricing\" data-i18n=\"nav_pricing\">Pricing</a>\n    </nav>\n    <div class=\"nav-right\">\n      <div class=\"lang-dd\" id=\"langDd\">\n        <button class=\"lang-btn\" type=\"button\" id=\"langBtn\" aria-label=\"Language\" aria-expanded=\"false\">\ud83c\udf10 <span id=\"langCur\">EN</span> \u25be</button>\n        <div class=\"lang-menu\" id=\"langMenu\" hidden>\n          <button type=\"button\" data-lang=\"en\">\ud83c\uddec\ud83c\udde7 English (EN)</button>\n          <button type=\"button\" data-lang=\"de\">\ud83c\udde9\ud83c\uddea Deutsch (DE)</button>\n          <button type=\"button\" data-lang=\"nl\">\ud83c\uddf3\ud83c\uddf1 Nederlands (NL)</button>\n        </div>\n      </div>\n      <a class=\"btn sm ghost nav-dash\" href=\"/dashboard\" id=\"navDashBtn\" data-i18n=\"nav_dashboard\">Dashboard</a>\n      <a class=\"btn sm ghost nav-login\" href=\"/signin\" id=\"navAuthBtn\" data-i18n=\"nav_signin\">Sign In</a>\n      <a class=\"btn sm nav-cta\" href=\"/builder\" data-i18n=\"nav_cta\">Get Started Free</a>\n      <details class=\"menu\" id=\"mobMenu\">\n        <summary aria-label=\"Menu\"><span>\u2630</span></summary>\n        <div class=\"menupanel\">\n          <a href=\"/builder\">\u2726 AI Resume Builder</a>\n          <a href=\"/ats-checker\">\u2713 Free ATS Checker (28 Checks)</a>\n          <a href=\"/templates\">\u25a6 20 Resume Templates</a>\n          <a href=\"/cover-letter\">\u2709 Cover Letter Studio</a>\n          <a href=\"/cover-letter-checker\">\u25ce Cover Letter Checker</a>\n          <a href=\"/jobs\">\u26a1 Live Jobs Board (EU &amp; Remote)</a>\n          <a href=\"/dashboard\">\u25a4 My Dashboard &amp; Tracker</a>\n          <a href=\"/tailor\">\u21c4 In-Place DOCX Tailor</a>\n          <a href=\"/pricing\">Pricing</a>\n          <a href=\"/checklist\">QA CV Checklist</a>\n          <a href=\"/agent-checklist\">Agentic Testing Checklist</a>\n          <a href=\"/signin\">Sign In / Account</a>\n        </div>\n      </details>\n    </div>\n  </div>\n</header>";
const SITE_FOOTER = "<footer class=\"foot\">\n  <div class=\"wrap foot-grid\">\n    <div class=\"foot-brand\">\n      <a class=\"logo logo-dark\" href=\"/\"><span class=\"mark\" aria-hidden=\"true\"><svg viewBox=\"0 0 28 28\" width=\"28\" height=\"28\" fill=\"none\"><rect width=\"28\" height=\"28\" rx=\"8\" fill=\"#6D3DF8\"/><path d=\"M8.5 8.5h11v2.6h-8v3h6.8v2.5h-6.8V21H8.5V8.5z\" fill=\"#fff\"/><circle cx=\"19.5\" cy=\"19.5\" r=\"2.2\" fill=\"#34D399\"/></svg></span><span class=\"logo-txt\">fitwise</span></a>\n      <p class=\"foot-tag\">The truth-first AI career suite tested against Workday, Greenhouse, Lever, iCIMS &amp; Taleo. Local-first editing with optional cloud sync.</p>\n      <div class=\"foot-badges\">\n        <span>EN \u00b7 DE \u00b7 NL</span>\n        <span>20 ATS Templates</span>\n        <span>Daily EU + Remote Jobs</span>\n      </div>\n    </div>\n    <div class=\"foot-col\">\n      <b>Core Features</b>\n      <a href=\"/builder\">AI Resume Builder</a>\n      <a href=\"/ats-checker\">ATS Resume Checker</a>\n      <a href=\"/templates\">Resume Templates (20)</a>\n      <a href=\"/cover-letter\">Cover Letter Studio</a>\n      <a href=\"/jobs\">Job Matcher &amp; Board</a>\n      <a href=\"/dashboard#tracker\">Job Application Tracker</a>\n      <a href=\"/tailor\">In-Place DOCX Tailor</a>\n      <a href=\"/dashboard\">My Resumes Dashboard</a>\n    </div>\n    <div class=\"foot-col\">\n      <b>Free Tools</b>\n      <a href=\"/ats-checker\">28-Check ATS Scanner</a>\n      <a href=\"/cover-letter-checker\">Cover Letter Checker</a>\n      <a href=\"/builder?tab=tailor\">JD Keyword Matcher</a>\n      <a href=\"/builder?copilot=1\">AI Bullet Enhancer</a>\n      <a href=\"/builder?tab=import\">LinkedIn PDF to Resume</a>\n      <a href=\"/checklist\">10-Point QA CV Checklist</a>\n      <a href=\"/agent-checklist\">Agentic Testing Checklist</a>\n      <a href=\"/events\">Conferences &amp; Workshops</a>\n    </div>\n    <div class=\"foot-col\">\n      <b>Templates &amp; Roles</b>\n      <a href=\"/templates?cat=ats\">ATS-Friendly Templates</a>\n      <a href=\"/templates?cat=modern\">Modern Templates</a>\n      <a href=\"/templates?cat=executive\">Executive Templates</a>\n      <a href=\"/templates?cat=regional\">US / UK / EU / DACH CVs</a>\n      <a href=\"/builder?sample=qa\">QA / Automation Sample</a>\n      <a href=\"/builder?sample=pm\">Product Manager Sample</a>\n      <a href=\"/builder?sample=data\">Data Analyst Sample</a>\n      <a href=\"/builder?sample=mkt\">Marketing Lead Sample</a>\n    </div>\n    <div class=\"foot-col\">\n      <b>Company &amp; Legal</b>\n      <a href=\"/pricing\">Pricing</a>\n      <a href=\"/about\">About Fitwise</a>\n      <a href=\"/contact\">Contact &amp; Support</a>\n      <a href=\"/signin\">Sign In / Sync</a>\n      <a href=\"/privacy\">Privacy Policy</a>\n      <a href=\"/terms\">Terms of Use</a>\n      <a href=\"/#faq\">FAQ</a>\n    </div>\n  </div>\n  <div class=\"wrap foot-bottom\">\n    <span>\u00a9 2026 Fitwise. Built for transparent, ATS-ready job applications.</span>\n    <span>Local browser editing \u00b7 Optional free cloud sync \u00b7 Zero fabricated experience</span>\n  </div>\n</footer>\n<script src=\"/fw-i18n.js\" defer></script>\n<script src=\"/fw-core.js\" defer></script>\n<script src=\"/fw.js\" defer></script>";
// generated by build_private.py (all public conversion routes un-gated)
const PRIVATE_PAGES = {};

// ---------- Daily jobs page (/jobs, /jobs/YYYY-MM-DD) ----------
const JOBS_SITE = "https://fitwise.sites.tab.bot";
const JOB_COUNTRIES = { NL: "Netherlands", CH: "Switzerland", DE: "Germany", LU: "Luxembourg", BE: "Belgium", SE: "Sweden", PT: "Portugal", PL: "Poland", DK: "Denmark", FI: "Finland", AT: "Austria", IE: "Ireland", ES: "Spain", FR: "France", CZ: "Czechia", NO: "Norway", IT: "Italy", EE: "Estonia", RO: "Romania", GR: "Greece", HU: "Hungary", LT: "Lithuania", LV: "Latvia", HR: "Croatia", SK: "Slovakia", SI: "Slovenia", BG: "Bulgaria", MT: "Malta", CY: "Cyprus", IS: "Iceland" };
const JOB_NAME2CODE = Object.fromEntries(Object.entries(JOB_COUNTRIES).map(([c, n]) => [n.toLowerCase(), c]));
Object.assign(JOB_NAME2CODE, { "the netherlands": "NL", holland: "NL", "czech republic": "CZ", deutschland: "DE", schweiz: "CH", suisse: "CH" });
const flagOf = c => /^[A-Z]{2}$/.test(c || "") ? String.fromCodePoint(...[...c].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65)) : "";
const jesc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const prettyDate = d => { if (!DATE_RE.test(d || "")) return ""; const [y, m, dd] = d.split("-").map(Number); const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(Date.UTC(y, m - 1, dd)).getUTCDay()]; return `${wd} ${dd} ${MONTHS[m - 1]} ${y}`; };
const shortDate = d => { const m = String(d || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${+m[3]} ${MONTHS[+m[2] - 1]}` : String(d || "").slice(0, 12); };
function amsToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); } catch { return new Date().toISOString().slice(0, 10); } }


function fmtEvidence(raw) {
  let t = String(raw || "").replace(/<[^>]+>/g, " ").replace(/([a-z\.\)])([A-Z][a-z])/g, "$1 $2").replace(/\s+/g, " ").replace(/^["'“”\s]+|["'“”\s]+$/g, "").trim();
  const ind = t.match(/^IND recogni[sz]ed[- ]sponsor(?:\s+register)?:?\s*(.*)$/i);
  if (ind) return ("IND recognised sponsor" + (ind[1] ? " (" + ind[1].trim() + ")" : "")).slice(0, 120);
  const m = t.search(/visa|sponsor|relocat|work permit|blue card|kennismigrant|highly skilled migrant/i);
  if (t.length > 130) {
    let a = m < 0 ? 0 : Math.max(0, m - 45), b = Math.min(t.length, a + 130);
    let cut = t.slice(a, b); if (a > 0) cut = "…" + cut.replace(/^\S*\s/, ""); if (b < t.length) cut = cut.replace(/\s\S*$/, "") + "…";
    t = cut;
  }
  return "Ad: “" + t + "”";
}
function cleanJob(j) {
  j = Object.assign({}, j);
  if (j.country == null && j.country_code == null && j.cc) j.country = j.cc;
  if (j.remote == null) j.remote = j.work_mode || j.workplace || j.wp;
  if (j.category == null) j.category = j.family || j.role_family;
  if (j.visa_sponsored == null && j.sponsored != null) j.visa_sponsored = j.sponsored;
  if (!j.visa_evidence) j.visa_evidence = j.sponsor_label || j.sponsor_evidence || j.sponsor_basis || "";
  if (j.city == null && j.location == null && j.loc) j.city = j.loc;
  const s = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);
  let url = s(j.url || j.link || j.apply_url, 600); try { const u = new URL(url); if (!/^https?:$/.test(u.protocol)) url = ""; } catch { url = ""; }
  let cc = s(j.country_code || j.country, 40); const up = cc.toUpperCase();
  cc = /^[A-Z]{2}$/.test(up) ? (up === "UK" ? "GB" : up) : (JOB_NAME2CODE[cc.toLowerCase()] || cc);
  let remote = j.remote; if (remote === true) remote = "Remote"; else if (remote === false || remote == null) remote = ""; remote = s(remote, 30);
  const rl = remote.toLowerCase(); const mode = /hybrid/.test(rl) ? "hybrid" : /remote|anywhere/.test(rl) ? "remote" : /on.?site|office/.test(rl) ? "onsite" : (rl ? "other" : "na");
  let visa = j.visa_sponsored === true || j.visa_sponsored === "true" || j.visa_sponsored === 1 || j.visa_sponsored === "yes";
  const evRaw = String(j.visa_evidence || "");
  // safety: never show the green check when the quoted evidence itself says there is no support
  if (visa && /\b(not|no|unable|cannot|can't|cant|won't|don't|do not|doesn't|without)\b[^.]{0,40}\b(visa|sponsor\w*|relocat\w*|work permit)|\b(visa|sponsor\w*|relocat\w*|work permit)\b[^.]{0,40}\b(is not|are not|isn't|aren't|not (?:be )?(?:provided|offered|available|possible|supported)|unavailable|not able)/i.test(evRaw)) visa = false;
  return { company: s(j.company, 90), title: s(j.title, 140), city: s(j.city || j.location, 80), country: cc, remote, mode, posted: s(j.posted || j.date_posted, 25), url, visa, evidence: visa ? fmtEvidence(evRaw) : "", category: s(j.category, 40) };
}
function feedFromBody(b) {
  const jobs = Array.isArray(b) ? b : (b.jobs || b.items || []);
  const out = jobs.map(cleanJob).filter(j => j.title && j.company && j.url);
  const visa = out.filter(j => j.visa), rest = out.filter(j => !j.visa);
  return { jobs: visa.concat(rest), window: String((b && b.window) || "").slice(0, 60) };
}
async function getFeed(env, date) {
  const st = store(env);
  if (!date) date = await st.get("jobs:latest");
  if (!date) return null;
  const raw = await st.get("jobs:feed:" + date); if (!raw) return null;
  try { const f = JSON.parse(raw); f.date = date; return f; } catch { return null; }
}
async function feedDates(env) { const r = await store(env).list({ prefix: "jobs:feed:" }); return r.keys.map(k => k.name.slice(10)).filter(d => DATE_RE.test(d)).sort().reverse(); }

const catLabel = c => { const t = String(c || "").replace(/[_-]+/g, " ").trim(); if (!t) return "Other"; return t.split(" ").map(w => /^(qa|ai|ml|sre|sdet|aiops|llm|it)$/i.test(w) ? w.toUpperCase().replace("AIOPS", "AIOps") : w[0].toUpperCase() + w.slice(1)).join(" "); };
const modeLabel = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site", other: "", na: "" };

function jobCard(j, i) {
  const cn = JOB_COUNTRIES[j.country] || j.country || ""; const low = cn.toLowerCase();
  const segs = String(j.city || "").split(/\s*[|,·]\s*/).map(x => x.trim()).filter(Boolean)
    .map(x => low ? x.replace(new RegExp("[\\s-]*\\b(the\\s+)?" + low.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$", "i"), "").trim() : x)
    .filter(x => x && x.toLowerCase() !== low && x.toUpperCase() !== j.country);
  const city = segs.filter((x, k) => segs.findIndex(y => y.toLowerCase() === x.toLowerCase()) === k).join(", ");
  const place = [city, cn].filter(Boolean).join(", ");
  const ml = j.mode === "other" ? j.remote : modeLabel[j.mode];
  const tq = new URLSearchParams({ job: j.id || j.url, url: j.url, title: j.title, company: j.company, location: place, from: "jobs" }).toString();
  const hay = (j.title + " " + j.company + " " + j.city + " " + (JOB_COUNTRIES[j.country] || j.country) + " " + j.category).toLowerCase();
  return `<article class="jc${j.visa ? " v" : ""}" data-id="${jesc(j.id || ("row_" + i))}" data-title="${jesc(j.title)}" data-company="${jesc(j.company)}" data-place="${jesc(place)}" data-url="${jesc(j.id ? "/j/" + j.id : j.url)}" data-c="${jesc(j.country)}" data-k="${jesc(catLabel(j.category))}" data-m="${j.mode}" data-v="${j.visa ? 1 : 0}" data-q="${jesc(hay)}">
<div class="jh"><span class="co">${jesc(j.company)}</span><span class="jh-r"><span class="jmatch" hidden></span>${j.posted ? `<span class="pd">Posted ${jesc(shortDate(j.posted))}</span>` : ""}</span></div>
<h3>${j.id ? `<a class="jt" href="/j/${jesc(j.id)}">${jesc(j.title)}</a>` : jesc(j.title)}</h3>
<p class="mt"><span>${flagOf(j.country)} ${jesc(place)}</span>${ml ? `<span class="pill m-${j.mode}">${jesc(ml)}</span>` : ""}${j.category ? `<span class="pill">${jesc(catLabel(j.category))}</span>` : ""}</p>
${j.visa ? `<p class="vz"><span class="vb">✅ Visa sponsorship</span>${j.evidence ? `<span class="ev" title="${jesc(j.evidence)}">${jesc(j.evidence)}</span>` : ""}</p>` : ""}
<div class="ja"><a class="btn tl" href="/builder?${jesc(tq)}" data-i="${i}">Tailor CV in Builder</a><button type="button" class="btn ghost sm jsave" data-save-job>Save</button><a class="btn ghost ap" href="${j.id ? "/j/" + jesc(j.id) + "/go" : jesc(j.url)}" target="_blank" rel="noopener nofollow">Apply ↗</a></div>
</article>`;
}

function opts(vals, label) { return `<option value="">${label}</option>` + vals.map(([v, t]) => `<option value="${jesc(v)}">${jesc(t)}</option>`).join(""); }

function jobsHTML(feed, dates, isLatest) {
  const date = feed ? feed.date : amsToday();
  const jobs = feed ? feed.jobs : [];
  const n = jobs.length, nv = jobs.filter(j => j.visa).length;
  const pd = prettyDate(date);
  const path = isLatest ? "/jobs" : "/jobs/" + date;
  const title = n ? `${n} English-speaking tech jobs in Europe · ${pd} · Visa sponsorship ✅ first` : `English-speaking tech jobs in Europe · Fitwise`;
  const desc = n ? `${n} jobs today${nv ? `, ${nv} with visa sponsorship ✅` : ""}: QA, AI QA, AIOps, platform, ML and data engineering roles in the Netherlands, Switzerland, Germany and more. Tap Apply, or tailor your CV to the job in 30 seconds.` : "A daily list of English-speaking tech jobs in Europe, visa sponsorship first.";
  const countries = [...new Set(jobs.map(j => j.country).filter(Boolean))].sort((a, b) => (JOB_COUNTRIES[a] || a).localeCompare(JOB_COUNTRIES[b] || b));
  const cats = [...new Set(jobs.map(j => catLabel(j.category)))].sort();
  const cCount = c => jobs.filter(j => j.country === c).length;
  const visa = jobs.map((j, i) => [j, i]).filter(([j]) => j.visa), rest = jobs.map((j, i) => [j, i]).filter(([j]) => !j.visa);
  const promo = `<aside class="promo"><b>Found one that fits?</b> Fitwise tailors your own CV to that exact job in about 30 seconds: match score, the keywords you have and lack, same layout you already use. Free to start — switch across 20 ATS-tested templates, score your CV on 28 checks, and export clean PDF or DOCX.</aside>`;
  const past = dates.filter(d => d !== date).slice(0, 7);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${jesc(title)}</title>
<meta name="description" content="${jesc(desc)}">
<link rel="canonical" href="${JOBS_SITE}${path}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Fitwise">
<meta property="og:title" content="${jesc(title)}"><meta property="og:description" content="${jesc(desc)}">
<meta property="og:url" content="${JOBS_SITE}${path}"><meta property="og:image" content="${JOBS_SITE}/og-jobs.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${jesc(title)}"><meta name="twitter:description" content="${jesc(desc)}"><meta name="twitter:image" content="${JOBS_SITE}/og-jobs.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css"><link rel="stylesheet" href="/jobs.css"><meta name="theme-color" content="#5b2bf5">
</head><body class="jobs">
<a class="skip" href="#main">Skip to content</a>
${SITE_HEADER}
<main id="main">
<section class="jhero"><div class="wrap">
<p class="eyebrow">Daily list · ${jesc(pd)}</p>
<h1>Today's English-speaking tech jobs in Europe</h1>
<p class="stats"><span><b>${n}</b> jobs</span>${nv ? `<span><b>${nv}</b> with visa sponsorship ✅</span>` : ""}<span>Visa sponsorship ✅ first</span></p>
<p class="lead">QA, AI QA, AIOps, platform, test and engineering managers, ML and data engineers. ${feed && feed.window ? jesc(String(feed.window).charAt(0).toUpperCase() + String(feed.window).slice(1)) + ". " : ""}Every job links to the employer's own page.</p>
<div class="fwstrip"><div><b>Apply with a CV that fits.</b> Tap <i>Tailor my CV for this job</i> on any card: match score, keywords, and your CV back in its own format. Free to try, nothing invented. <a href="#fitwise">How it works</a></div></div>
</div></section>
<section class="jlist"><div class="wrap">
${n ? `<form class="filters" onsubmit="return false">
<input id="q" type="search" placeholder="Search title, company or city" aria-label="Search" enterkeyhint="search">
<select id="fc" aria-label="Country">${opts(countries.map(c => [c, `${flagOf(c)} ${JOB_COUNTRIES[c] || c} (${cCount(c)})`]), "All countries")}</select>
<select id="fk" aria-label="Role">${opts(cats.map(c => [c, c]), "All roles")}</select>
<select id="fm" aria-label="Work mode">${opts([["remote", "Remote"], ["hybrid", "Hybrid"], ["onsite", "On-site"]], "Any work mode")}</select>
<label class="vonly"><input type="checkbox" id="fv"> Visa ✅ only</label><label class="vonly" id="sortMatchWrap" hidden><input type="checkbox" id="fsm"> Sort by Best Match</label>
<p class="shown" id="shown" aria-live="polite">Showing all ${n} jobs</p>
</form>
<h2 class="sec" id="visa">Visa sponsorship ✅ <span class="cnt" data-sec="visa">${visa.length}</span></h2>
<p class="secnote">The ad mentions visa or relocation support, or (Netherlands) the employer is on the IND public register of recognised sponsors. Always confirm with the employer.</p>
<div class="cards" id="cv">${visa.map(([j, i]) => jobCard(j, i)).join("") || `<p class="empty">No sponsored roles in today's list.</p>`}</div>
${promo}
<h2 class="sec" id="more">More English-speaking roles <span class="cnt" data-sec="more">${rest.length}</span></h2>
<p class="secnote">No visa sponsorship stated in the ad.</p>
<div class="cards" id="cm">${rest.map(([j, i]) => jobCard(j, i)).join("") || `<p class="empty">None today.</p>`}</div>
<p class="empty" id="none" hidden>No jobs match these filters. <a href="#" id="clr">Clear filters</a></p>`
: `<p class="empty big">Today's list is being put together. Check back later today${past.length ? ", or open an earlier day below" : ""}.</p>`}
${past.length ? `<p class="past">Earlier lists: ${past.map(d => `<a href="/jobs/${d}">${jesc(prettyDate(d))}</a>`).join(" · ")}</p>` : ""}
</div></section>
<section id="fitwise" class="fwsell"><div class="wrap">
<h2>Tailor your CV to the job in 30 seconds</h2>
<ul class="fwf">
<li><b>Match score + keywords</b><span>See how well your CV fits the ad, the keywords you already have, and the ones you're missing.</span></li>
<li><b>Your CV, your own format</b><span>Upload Word or PDF. Your Word file is edited in place; a PDF is rebuilt in your layout. Download free.</span></li>
<li><b>Nothing made up</b><span>Fitwise only reorders and rewords what is already in your CV. Missing keywords are shown to you, never slipped in.</span></li>
<li><b>US, UK or Europass version</b><span>Preview free. Download for 1 credit; a full cover letter is 1 credit too.</span></li>
</ul>
<div class="fwprice"><p><b>Pre-launch: 1 free tailoring per person</b>. No card, no subscription. Credits are prepaid: 10 for $5, 30 for $12, 70 for $25. <span class="muted">Credit payments open soon; early access sign-up on the main page.</span></p>
<p><b>Autopilot</b> (finds matches and tailors a CV per job): <span class="soon">coming soon</span> · <a href="/#pricing">join the waitlist</a></p></div>
<p class="center"><a class="btn" href="/builder">Open AI Resume Builder</a> <a class="btn ghost" href="/ats-checker">Run Free ATS Scan</a></p>
</div></section>
<section class="sub"><div class="wrap">
<h2>Get tomorrow's list in your inbox</h2>
<p class="muted center">The daily email is starting soon. Leave your email and you'll get it from the first send. Unsubscribe any time.</p>
<form id="subf" class="subf"><input id="sube" type="email" placeholder="you@example.com" required autocomplete="email"><button class="btn" id="subb">Keep me posted</button></form>
<p class="center small" id="subm" aria-live="polite"></p>
</div></section>
<p class="wrap small muted disc">Jobs are collected from public company career pages and job boards. Fitwise is not affiliated with these employers. Details can change; the employer's page is the source of truth.</p>
</main>
${SITE_FOOTER}
<script src="/fw-jobs-match.js" defer></script>
<script>
(function(){var $=function(i){return document.getElementById(i)};var cards=[].slice.call(document.querySelectorAll(".jc"));var total=cards.length;
function run(){if(!total)return;var q=($("q").value||"").toLowerCase().trim(),c=$("fc").value,k=$("fk").value,m=$("fm").value,v=$("fv").checked,n=0,cnt={visa:0,more:0};
cards.forEach(function(e){var ok=(!c||e.dataset.c===c)&&(!k||e.dataset.k===k)&&(!m||e.dataset.m===m)&&(!v||e.dataset.v==="1")&&(!q||q.split(/\s+/).every(function(w){return e.dataset.q.indexOf(w)>=0}));e.hidden=!ok;if(ok){n++;cnt[e.dataset.v==="1"?"visa":"more"]++}});
document.querySelectorAll(".cnt").forEach(function(s){s.textContent=cnt[s.dataset.sec]});
["visa","more"].forEach(function(s){var show=cnt[s]>0||(!q&&!c&&!k&&!m&&!v);var h=$(s);h.hidden=!show;h.nextElementSibling.hidden=!show;h.nextElementSibling.nextElementSibling.hidden=!show});
$("more").hidden=$("more").hidden||v;$("more").nextElementSibling.hidden=$("more").hidden;$("cm").hidden=$("more").hidden;
$("none").hidden=n>0;$("shown").textContent=n===total?"Showing all "+total+" jobs":"Showing "+n+" of "+total+" jobs"}
if(total){["q","fc","fk","fm","fv"].forEach(function(i){$(i).addEventListener("input",run);$(i).addEventListener("change",run)});$("clr").onclick=function(ev){ev.preventDefault();$("q").value="";$("fc").value="";$("fk").value="";$("fm").value="";$("fv").checked=false;run()}}
$("subf").onsubmit=function(ev){ev.preventDefault();var b=$("subb");b.disabled=true;fetch("/api/jobs/subscribe",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:$("sube").value.trim(),country:$("fc")?$("fc").value:""})}).then(function(r){return r.json().then(function(j){return[r.ok,j]})}).then(function(a){b.disabled=false;$("subm").textContent=a[0]?"You're on the list. You'll get the first daily email at "+$("sube").value.trim()+".":(a[1].error||"Try again.")}).catch(function(){b.disabled=false;$("subm").textContent="Network error, try again."})};
})();
document.querySelectorAll(".menu .menupanel a").forEach(function(a){a.addEventListener("click",function(){var m=a.closest("details");if(m)m.open=false})});
</script></body></html>`;
}

async function jobsPage(p, env) {
  const m = p.match(/^\/jobs\/?(\d{4}-\d{2}-\d{2})?\/?$/);
  if (!m) return new Response("Not found", { status: 404 });
  const date = m[1] || null;
  const feed = await getFeed(env, date);
  if (date && !feed) {
    const html = jobsHTML(null, await feedDates(env), false).replace("Today's list is being put together. Check back later today", "There is no list for " + prettyDate(date));
    return new Response(html, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
  }
  return new Response(jobsHTML(feed, await feedDates(env), !date), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=120" } });
}

async function routeJobs(p, req, env, url) {
  if (p === "/api/jobs" && req.method === "GET") {
    const d = url.searchParams.get("date"); const f = await getFeed(env, d && DATE_RE.test(d) ? d : null);
    return f ? json({ date: f.date, count: f.jobs.length, visa: f.jobs.filter(j => j.visa).length, jobs: f.jobs }) : json({ error: "no list" }, 404);
  }
  if (p === "/api/jobs/subscribe" && req.method === "POST") {
    const b = await req.json().catch(() => ({})); const email = String(b.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email." }, 400);
    const k = "sub:jobs:" + (await sha(email)); const had = await store(env).get(k);
    await store(env).put(k, JSON.stringify({ email, country: String(b.country || "").slice(0, 4), at: had ? JSON.parse(had).at : new Date().toISOString() }));
    if (!had) await bump(env, "stat:jobsubs");
    return json({ ok: true });
  }
  if (p === "/api/admin/jobclicks") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({})); const r = String(b.reset || "");
      const keys = r === "all" ? (await store(env).list({ prefix: "stat:jgo:" })).keys.map(k => k.name) : (JID_RE.test(r) ? ["stat:jgo:" + r] : []);
      for (const k of keys) await store(env).delete(k);
      return json({ ok: true, reset: keys.length });
    }
    return json(await jobClickStats(env));
  }
  if (p === "/api/admin/jobs") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    if (req.method === "GET") {
      const dates = await feedDates(env); const out = [];
      for (const d of dates.slice(0, 14)) { const f = await getFeed(env, d); out.push({ date: d, count: f ? f.jobs.length : 0, visa: f ? f.jobs.filter(j => j.visa).length : 0 }); }
      const subs = (await store(env).list({ prefix: "sub:jobs:" })).keys.length;
      return json({ latest: await store(env).get("jobs:latest"), feeds: out, subscribers: subs });
    }
    if (req.method === "POST") {
      const b = await req.json().catch(() => null); if (!b) return json({ error: "bad json" }, 400);
      const date = String(b.date || ""); if (!DATE_RE.test(date)) return json({ error: "need date YYYY-MM-DD" }, 400);
      if (b.delete) { await store(env).delete("jobs:feed:" + date); return json({ ok: true, deleted: date }); }
      const f = feedFromBody(b); if (!f.jobs.length) return json({ error: "no valid jobs (need title, company, url)" }, 400);
      await assignJobIds(env, f.jobs, date);
      await store(env).put("jobs:feed:" + date, JSON.stringify({ jobs: f.jobs, window: f.window, updated: new Date().toISOString() }));
      const cur = await store(env).get("jobs:latest");
      if (b.latest !== false && (!cur || date >= cur)) await store(env).put("jobs:latest", date);
      return json({ ok: true, date, links: f.jobs.map(j => ({ id: j.id, short_url: JOBS_SITE + "/j/" + j.id, title: j.title, company: j.company, city: j.city, country: JOB_COUNTRIES[j.country] || j.country, visa_sponsored: j.visa })), count: f.jobs.length, visa: f.jobs.filter(j => j.visa).length, dropped: (Array.isArray(b.jobs) ? b.jobs.length : 0) - f.jobs.length, latest: await store(env).get("jobs:latest") });
    }
  }
  return null;
}


// ---------- Per-job pages (/j/<id>, /j/<id>/go) — added 1 Nov 2026 ----------
// id = 6 chars (base36) of sha256(job url); the same url keeps its id on later days (index row jobs:id:<id>).
const JID_RE = /^[a-z0-9]{5,8}$/;
async function jobIdCands(u) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(u).trim())));
  let n = 0n; for (const b of d) n = (n << 8n) | BigInt(b);
  const s = n.toString(36).padStart(50, "0").slice(-48);
  const out = []; for (let k = 0; k + 6 <= s.length; k += 6) out.push(s.slice(k, k + 6)); return out;
}
async function assignJobIds(env, jobs, date) {
  const used = new Set(); const st = store(env);
  for (const j of jobs) {
    const cands = await jobIdCands(j.url); let pick = null;
    for (const c of cands) {
      if (used.has(c)) continue;
      const row = await st.get("jobs:id:" + c);
      if (row) { try { if (JSON.parse(row).url !== j.url) continue; } catch {} }
      pick = c; break;
    }
    if (!pick) pick = cands[0] + String(used.size % 10);
    used.add(pick); j.id = pick;
    await st.put("jobs:id:" + pick, JSON.stringify({ url: j.url, date, job: j }));
  }
}
async function getJobById(env, id) {
  if (!JID_RE.test(id || "")) return null;
  const row = await store(env).get("jobs:id:" + id); if (!row) return null;
  try { const r = JSON.parse(row); return r && r.job ? Object.assign({}, r.job, { id, listDate: r.date }) : null; } catch { return null; }
}
function jobPlaceParts(j) {
  const cn = JOB_COUNTRIES[j.country] || j.country || ""; const low = cn.toLowerCase();
  const segs = String(j.city || "").split(/\s*[|,·]\s*/).map(x => x.trim()).filter(Boolean)
    .map(x => low ? x.replace(new RegExp("[\\s-]*\\b(the\\s+)?" + low.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$", "i"), "").trim() : x)
    .filter(x => x && x.toLowerCase() !== low && x.toUpperCase() !== j.country);
  const city = segs.filter((x, k) => segs.findIndex(y => y.toLowerCase() === x.toLowerCase()) === k).join(", ");
  return { city, country: cn };
}
const JD_CSS = `<style>
.jd{max-width:640px;margin:0 auto;padding:22px 18px 40px}
.jd .crumb{font-size:.92rem;margin:0 0 14px}.jd .crumb a{color:var(--g);font-weight:600;text-decoration:none}
.jd .card2{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:22px 20px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.jd .co{font-weight:700;color:var(--mut);font-size:.98rem;margin:0 0 4px}
.jd h1{font-size:1.55rem;line-height:1.25;margin:0 0 14px;letter-spacing:-.01em}
.jd dl{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;margin:0 0 18px;font-size:.98rem}
.jd dt{color:var(--mut)}.jd dd{margin:0;font-weight:600}
.jd .vz{border-radius:12px;padding:12px 14px;margin:0 0 20px;font-size:.98rem;background:#f3f1ea;border:1px solid var(--line)}
.jd .vz.y{background:#e8f5ef;border-color:#bfe3d3}.jd .vz b{display:block}.jd .vz small{display:block;color:var(--mut);margin-top:4px;font-size:.88rem}
.jd .acts{display:flex;flex-direction:column;gap:10px}.jd .acts .btn{width:100%;box-sizing:border-box}
.jd .hint{color:var(--mut);font-size:.88rem;margin:10px 0 0;text-align:center}
.jd .pl{margin:18px 0 0;font-size:.92rem;color:var(--mut);background:#fff8ee;border:1px solid #f0dcc0;border-radius:12px;padding:10px 12px}
.jd .all{display:block;text-align:center;margin:22px 0 0;font-weight:700;color:var(--g)}
@media(min-width:720px){.jd{padding-top:40px}.jd h1{font-size:1.9rem}.jd .acts{flex-direction:row}.jd .acts .btn{width:auto;flex:1}}
</style>`;
function jobPageShell(title, desc, canon, body, status, robots) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${jesc(title)}</title>
<meta name="description" content="${jesc(desc)}">${robots ? `<meta name="robots" content="${robots}">` : ""}
${canon ? `<link rel="canonical" href="${canon}">` : ""}
<meta property="og:type" content="website"><meta property="og:site_name" content="Fitwise">
<meta property="og:title" content="${jesc(title)}"><meta property="og:description" content="${jesc(desc)}">
${canon ? `<meta property="og:url" content="${canon}">` : ""}<meta property="og:image" content="${JOBS_SITE}/og-jobs.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${jesc(title)}"><meta name="twitter:description" content="${jesc(desc)}"><meta name="twitter:image" content="${JOBS_SITE}/og-jobs.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css"><link rel="stylesheet" href="/jobs.css"><meta name="theme-color" content="#5b2bf5">
${JD_CSS}
</head><body class="jobs jobdetail">
<a class="skip" href="#main">Skip to content</a>
${SITE_HEADER}
<main id="main">${body}</main>
${SITE_FOOTER}
<script src="/fw-jobs-match.js" defer></script>
</body></html>`, { status: status || 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": status && status !== 200 ? "no-store" : "public, max-age=300" } });
}
function applyLabel(u) {
  let h = ""; try { h = new URL(u).hostname.toLowerCase(); } catch (e) {}
  const boards = { "linkedin.com": "LinkedIn", "indeed.com": "Indeed", "indeed.nl": "Indeed", "glassdoor.com": "Glassdoor", "glassdoor.nl": "Glassdoor" };
  for (const [d, n] of Object.entries(boards)) if (h === d || h.endsWith("." + d)) return "Apply on " + n;
  return "Apply on company site";
}
function jobDetailHTML(j) {
  const { city, country } = jobPlaceParts(j);
  const place = [city, country].filter(Boolean).join(", ");
  const ml = j.mode === "other" ? j.remote : modeLabel[j.mode];
  const ogTitle = `${j.title} at ${j.company}${city || country ? " · " + (city || country) : ""}`;
  const desc = `${j.title} at ${j.company}${place ? " in " + place : ""}${ml ? " (" + ml + ")" : ""}. Visa sponsorship: ${j.visa ? "Yes ✅" : "not stated"}. Apply now, or tailor your CV to this job with Fitwise first.`;
  const tq = new URLSearchParams({ job: j.id || j.url, url: j.url, title: j.title, company: j.company, location: place, from: "jobs" }).toString();
  const posted = DATE_RE.test(j.posted || "") ? prettyDate(j.posted) : (j.posted || "");
  const rows = [["Location", place ? `${flagOf(j.country)} ${jesc(place)}` : ""], ["Work mode", ml ? jesc(ml) : ""], ["Posted", posted ? jesc(posted) : ""], ["Field", j.category ? jesc(catLabel(j.category)) : ""]].filter(r => r[1]);
  const body = `<div class="jd">
<p class="crumb"><a href="/jobs">← All of today's jobs</a></p>
<article class="card2" id="jdCard" data-id="${jesc(j.id)}" data-title="${jesc(j.title)}" data-company="${jesc(j.company)}" data-place="${jesc(place)}" data-url="/j/${jesc(j.id)}" data-cat="${jesc(catLabel(j.category))}">
<p class="co">${jesc(j.company)}</p>
<h1>${jesc(j.title)}</h1>
${rows.length ? `<dl>${rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("")}</dl>` : ""}
${j.visa ? `<p class="vz y"><b>Visa sponsorship: Yes ✅</b>${j.evidence ? `<small>${jesc(j.evidence)}</small>` : ""}</p>` : `<p class="vz"><b>Visa sponsorship: Not stated</b><small>The ad does not mention visa sponsorship. Ask the employer if you need it.</small></p>`}
<div id="jdMatchBox" class="jd-match"></div>
<div class="acts">
<a class="btn big" href="/j/${jesc(j.id)}/go" target="_blank" rel="noopener nofollow">${applyLabel(j.url)} ↗</a>
<a class="btn big ghost" href="/builder?${jesc(tq)}">Tailor CV for this Role</a>
<button type="button" class="btn big ghost" id="jdSaveBtn">Save to Tracker</button>
</div>
<p class="hint">Opens the original job ad in a new tab · Or <a href="/tailor?${jesc(tq)}">edit your own DOCX/PDF in place</a>.</p>
</article>
<a class="all" href="/jobs">See all today's jobs →</a>
</div>`;
  return jobPageShell(ogTitle, desc, `${JOBS_SITE}/j/${j.id}`, body, 200);
}
function jobNotFoundHTML() {
  const body = `<div class="jd"><article class="card2">
<p class="co">Job not found</p><h1>This job link has expired or doesn't exist</h1>
<p>The job may have been taken down, or the link was mistyped. Today's full list is one tap away.</p>
<div class="acts"><a class="btn big" href="/jobs">See all today's jobs</a></div>
</article></div>`;
  return jobPageShell("Job not found · Fitwise", "This job link has expired. See today's English-speaking tech jobs in Europe on Fitwise.", "", body, 404, "noindex");
}
async function jobDetailPage(p, req, env) {
  const m = p.match(/^\/j\/([A-Za-z0-9]{1,16})(\/go)?\/?$/);
  if (!m) return jobNotFoundHTML();
  const id = m[1].toLowerCase(); const j = await getJobById(env, id);
  if (!j) return jobNotFoundHTML();
  if (m[2]) {
    if (req.method === "GET") { try { await bump(env, "stat:jgo:" + id); } catch (e) {} }
    return new Response(null, { status: 302, headers: { location: j.url, "cache-control": "no-store", "referrer-policy": "no-referrer-when-downgrade" } });
  }
  return jobDetailHTML(j);
}
async function jobClickStats(env) {
  const r = await store(env).list({ prefix: "stat:jgo:" }); const out = []; let total = 0;
  for (const k of r.keys) { const id = k.name.slice(9); const n = await kvNum(env, k.name); if (!n) continue; total += n; let t = ""; try { const g = await getJobById(env, id); if (g) t = g.title + " – " + g.company; } catch (e) {} out.push({ id, clicks: n, job: t }); }
  out.sort((a, b) => b.clicks - a.clicks);
  return { total, by_job: out.slice(0, 200) };
}

// ---------- site pages: pretty URLs, robots, sitemap, 404, contact, housekeeping ----------
const SITE_PAGES = ["/ats-checker", "/templates", "/builder", "/cover-letter", "/cover-letter-checker", "/dashboard", "/signin", "/tailor", "/pricing", "/privacy", "/terms", "/about", "/contact", "/checklist", "/agent-checklist"];  // 4 Nov 2026: "/courses" removed (Suresh), pages parked in _parked_courses/
const COURSE_SLUGS = [];  // 4 Nov 2026: Courses removed on Suresh's order; old slugs in _parked_courses/README.txt
async function assetFetch(env, req, path) {
  let r = await env.ASSETS.fetch(new Request(new URL(path, req.url).toString(), { method: "GET", headers: req.headers }));
  if (r.status >= 300 && r.status < 400 && r.headers.get("location")) { const loc = new URL(r.headers.get("location"), req.url); r = await env.ASSETS.fetch(new Request(loc.toString(), { method: "GET", headers: req.headers })); }
  return r;
}
async function notFound(env, req) {
  const r = await assetFetch(env, req, "/notfound.html");
  return new Response(r.ok ? r.body : "Page not found", { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
}
async function sitePage(p, req, env) {
  if (p === "/" ) { const u0 = new URL(req.url); if (u0.searchParams.has("job") || u0.searchParams.has("paid")) return Response.redirect(new URL("/tailor" + u0.search, req.url).toString(), 302); }
  if (p === "/robots.txt") return new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${JOBS_SITE}/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
  if (p === "/sitemap.xml") {
    let dates = []; try { dates = (await feedDates(env)).slice(0, 30); } catch {}
    const urls = [["/", "weekly", "1.0"], ["/builder", "weekly", "0.95"], ["/ats-checker", "weekly", "0.95"], ["/templates", "weekly", "0.9"], ["/cover-letter", "weekly", "0.9"], ["/cover-letter-checker", "weekly", "0.85"], ["/jobs", "daily", "0.95"], ["/tailor", "monthly", "0.85"], ["/pricing", "monthly", "0.8"], ["/events", "weekly", "0.75"], ["/checklist", "monthly", "0.75"], ["/agent-checklist", "monthly", "0.75"]].concat([ ["/about", "monthly", "0.5"], ["/contact", "yearly", "0.4"], ["/privacy", "yearly", "0.3"], ["/terms", "yearly", "0.3"]]).concat(dates.map(d => ["/jobs/" + d, "never", "0.5"]));
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` + urls.map(([u, f, pr]) => `<url><loc>${JOBS_SITE}${u}</loc><changefreq>${f}</changefreq><priority>${pr}</priority></url>`).join("\n") + `\n</urlset>\n`;
    return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8" } });
  }
  const k = p.length > 1 ? p.replace(/\/+$/, "") : p;
  if (SITE_PAGES.includes(k)) { const r = await assetFetch(env, req, k + ".html"); return r.ok ? new Response(r.body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } }) : notFound(env, req); }
  const cm = p.match(/^\/courses\/([a-z0-9-]{1,80})(\.html)?\/?$/);
  if (cm) { if (!COURSE_SLUGS.includes(cm[1])) return notFound(env, req); if (cm[2]) return Response.redirect(new URL("/courses/" + cm[1], req.url).toString(), 301);
    const r = await assetFetch(env, req, "/courses/" + cm[1] + ".html"); return r.ok ? new Response(r.body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" } }) : notFound(env, req); }
  if (p.endsWith(".html") && SITE_PAGES.includes(p.slice(0, -5))) return Response.redirect(new URL(p.slice(0, -5), req.url).toString(), 301);
  if (p === "/notfound.html" || p === "/notfound") return notFound(env, req);
  return null;
}
let _lastSweep = 0;
async function sweepExpired(env) {
  if (Date.now() - _lastSweep < 3600e3) return; _lastSweep = Date.now();
  try { const last = +(await store(env).get("sweep:last") || 0); if (Date.now() - last < 3600e3) return;
    await env.DB.prepare("DELETE FROM kv WHERE exp IS NOT NULL AND exp < ?").bind(Math.floor(Date.now() / 1000)).run();
    await store(env).put("sweep:last", String(Date.now())); } catch {}
}
async function routeSite(p, req, env) {
  if (p === "/api/contact" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const email = String(b.email || "").trim().toLowerCase(), message = String(b.message || "").trim().slice(0, 4000);
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email so we can reply." }, 400);
    if (message.length < 5) return json({ error: "Write a short message." }, 400);
    const ip = req.headers.get("cf-connecting-ip") || "0", day = new Date().toISOString().slice(0, 10);
    const kI = "q:c:" + (await sha(ip)).slice(0, 24) + ":" + day;
    if ((await kvNum(env, kI)) >= 8) return json({ error: "Too many messages today. Please try again tomorrow." }, 429);
    await bump(env, kI, 172800);
    const key = "contact:" + new Date().toISOString() + ":" + crypto.randomUUID().slice(0, 8);
    await store(env).put(key, JSON.stringify({ name: String(b.name || "").slice(0, 80), email, topic: String(b.topic || "").slice(0, 60), message, at: new Date().toISOString() }));
    await bump(env, "stat:contact");
    return json({ ok: true });
  }
  // ---- course launch list (3 Nov 2026): public email capture on /checklist and /agent-checklist ----
  if (p === "/api/notify" && req.method === "POST") {
    return json({ ok: false, error: "This sign-up list is closed." }, 410); // 4 Nov 2026: no new launch-list sign-ups (courses parked); stored kv records untouched
    const b = await req.json().catch(() => ({}));
    if (b.website) return json({ ok: true }); // honeypot
    const email = String(b.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email address." }, 400);
    const src = ["checklist", "agent-checklist", "course"].includes(String(b.src)) ? String(b.src) : "other";
    const course = COURSE_SLUGS.includes(String(b.course || "")) ? String(b.course) : null; // Courses tab (3 Nov 2026): which course this sign-up is for
    const ip = req.headers.get("cf-connecting-ip") || "0", day = new Date().toISOString().slice(0, 10);
    const kI = "q:n:" + (await sha(ip)).slice(0, 24) + ":" + day;
    if ((await kvNum(env, kI)) >= 10) return json({ error: "Too many sign-ups from this network today. Please try again tomorrow." }, 429);
    await bump(env, kI, 172800);
    const key = "notify:course:" + (await sha(email)).slice(0, 32);
    const prevS = await store(env).get(key);
    if (prevS) {
      const prev = JSON.parse(prevS || "{}"); const cs = Array.isArray(prev.courses) ? prev.courses : (prev.course ? [prev.course] : []);
      if (!course || cs.includes(course)) return json({ ok: true, already: true });
      cs.push(course); prev.courses = cs; prev.course = prev.course || course; prev.updated = new Date().toISOString();
      await store(env).put(key, JSON.stringify(prev));
      try { if (typeof track === "function") track(req, "launch_notify", { obj: "course:" + course }); } catch (e) {}
      return json({ ok: true });
    }
    await store(env).put(key, JSON.stringify(course ? { email, src, course, courses: [course], at: new Date().toISOString() } : { email, src, at: new Date().toISOString() }));
    await bump(env, "stat:notify");
    try { if (typeof track === "function") track(req, "launch_notify", { obj: course ? "course:" + course : src }); } catch (e) {}
    return json({ ok: true });
  }
  if (p === "/api/admin/notify") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const em = String(b.delete_email || "").trim().toLowerCase();
      if (!em) return json({ error: "need delete_email" }, 400);
      const key = "notify:course:" + (await sha(em)).slice(0, 32);
      const had = !!(await store(env).get(key)); await store(env).delete(key);
      return json({ ok: true, deleted: had ? em : null });
    }
    const out = []; let cursor;
    do { const r = await store(env).list({ prefix: "notify:course:", cursor }); for (const k of r.keys) out.push(JSON.parse((await store(env).get(k.name)) || "{}")); cursor = r.list_complete === false ? r.cursor : undefined; } while (cursor);
    out.sort((a, b) => String(b.at).localeCompare(String(a.at)));
    if (new URL(req.url).searchParams.get("format") === "csv") return new Response("email,source,courses,joined\n" + out.map(x => [x.email, x.src, (x.courses || (x.course ? [x.course] : [])).join(" "), x.at].join(",")).join("\n") + "\n", { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=course-launch-list.csv" } });
    return json({ count: out.length, by_source: out.reduce((m, x) => (m[x.src] = (m[x.src] || 0) + 1, m), {}), by_course: out.reduce((m, x) => ((x.courses || (x.course ? [x.course] : [])).forEach(c => m[c] = (m[c] || 0) + 1), m), {}), list: out });
  }
  if (p === "/api/admin/contact") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    if (req.method === "POST") { const b = await req.json().catch(() => ({})); if (b.delete && String(b.delete).startsWith("contact:")) { await store(env).delete(String(b.delete)); return json({ ok: true, deleted: b.delete }); } return json({ error: "need delete key" }, 400); }
    const r = await store(env).list({ prefix: "contact:" }); const out = [];
    for (const k of r.keys.slice(-200)) out.push({ key: k.name, ...JSON.parse((await store(env).get(k.name)) || "{}") });
    return json({ count: out.length, messages: out.reverse() });
  }
  return null;
}

// ---------- Conferences & Workshops (/events) behind Google sign-in — added 1 Nov 2026 ----------
// Data: kv "events:data" (pushed by events_push.mjs from files/job-hunt/workshops/events.json). Readable only with a valid session.
// Sign-in: Google Identity Services ID token -> verified here (RS256 against Google's JWKS, aud = client id) -> users table + session cookie.
const GOOGLE_CLIENT_ID_DEFAULT = "1024830327613-9fgve3b6lhtmbpl9ac13dn6uumaflj16.apps.googleusercontent.com";
const SESS_COOKIE = "fw_sess";
const SESS_TTL = 30 * 86400;
async function googleClientId(env) { try { return (await store(env).get("cfg:google_client_id")) || GOOGLE_CLIENT_ID_DEFAULT; } catch (e) { return GOOGLE_CLIENT_ID_DEFAULT; } }
function b64uBytes(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function b64uJSON(s) { return JSON.parse(new TextDecoder().decode(b64uBytes(s))); }
let _jwks = null, _jwksAt = 0;
async function googleJwks(force) {
  if (!force && _jwks && Date.now() - _jwksAt < 3600e3) return _jwks;
  const r = await fetch("https://www.googleapis.com/oauth2/v3/certs", force ? {} : { cf: { cacheTtl: 3600 } });
  if (!r.ok) throw new Error("jwks " + r.status);
  _jwks = await r.json(); _jwksAt = Date.now(); return _jwks;
}
async function verifyGoogleIdToken(tok, aud) {
  const parts = String(tok || "").split("."); if (parts.length !== 3) throw new Error("malformed token");
  const hdr = b64uJSON(parts[0]), pl = b64uJSON(parts[1]);
  if (hdr.alg !== "RS256" || !hdr.kid) throw new Error("bad alg");
  let jwk = (await googleJwks(false)).keys.find(k => k.kid === hdr.kid);
  if (!jwk) jwk = (await googleJwks(true)).keys.find(k => k.kid === hdr.kid);
  if (!jwk) throw new Error("unknown key");
  const key = await crypto.subtle.importKey("jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64uBytes(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
  if (!ok) throw new Error("bad signature");
  const now = Math.floor(Date.now() / 1000);
  if (pl.iss !== "accounts.google.com" && pl.iss !== "https://accounts.google.com") throw new Error("bad issuer");
  if (pl.aud !== aud) throw new Error("bad audience");
  if (!pl.exp || pl.exp < now - 60) throw new Error("expired");
  if (pl.iat && pl.iat > now + 300) throw new Error("issued in the future");
  if (!pl.sub || !pl.email || !(pl.email_verified === true || pl.email_verified === "true")) throw new Error("email not verified");
  return pl;
}
let _usersReady = false;
async function usersDb(env) {
  const db = env.DB;
  if (!_usersReady) { await db.prepare("CREATE TABLE IF NOT EXISTS users (sub TEXT PRIMARY KEY, email TEXT, name TEXT, picture TEXT, provider TEXT, source TEXT, created INTEGER, last_login INTEGER, logins INTEGER DEFAULT 1)").run(); _usersReady = true; }
  return db;
}
function cookieOf(req, name) { const c = req.headers.get("cookie") || ""; const m = c.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)")); return m ? decodeURIComponent(m[1]) : null; }
async function sessionOf(req, env) {
  const t = cookieOf(req, SESS_COOKIE); if (!t || !/^[a-f0-9]{64}$/.test(t)) return null;
  const v = await store(env).get("sess:" + (await sha(t))); if (!v) return null;
  try { return JSON.parse(v); } catch (e) { return null; }
}
async function newSession(env, user, ttl) {
  const b = new Uint8Array(32); crypto.getRandomValues(b); const t = [...b].map(x => x.toString(16).padStart(2, "0")).join("");
  await store(env).put("sess:" + (await sha(t)), JSON.stringify({ sub: user.sub, email: user.email, name: user.name || "", at: new Date().toISOString(), test: !!user.test, admin: !!(user.test && user.admin) }), { expirationTtl: ttl || SESS_TTL });
  return t;
}
const sessCookie = (t, maxAge) => `${SESS_COOKIE}=${t}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
async function eventsData(env) { const v = await store(env).get("events:data"); return v ? JSON.parse(v) : null; }
function evToday() { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date()); } catch (e) { return new Date().toISOString().slice(0, 10); } }
function evUpcoming(d) { const t = evToday(); return ((d && d.events) || []).filter(e => (e.end || e.start) >= t); }
function evCfpOpen(e) { const c = e.cfp || {}; return c.status === "Open" && !(c.deadline && c.deadline < evToday()); }
const EV_TOPICS = ["Testing/QA", "Test automation", "AI/ML", "DevOps/Cloud", "SRE/Observability", "Security", "Data", "Software engineering", "Java/JVM", "Agile/Product", "Accessibility", "General tech"];

async function routeEvents(p, req, env, url) {
  if (p === "/api/auth/config" && req.method === "GET") return json({ client_id: await googleClientId(env) });
  if (p === "/api/auth/google" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const ip = req.headers.get("cf-connecting-ip") || "0", day = new Date().toISOString().slice(0, 10);
    const kI = "q:g:" + (await sha(ip)).slice(0, 24) + ":" + day;
    if ((await kvNum(env, kI)) >= 60) return json({ error: "Too many sign-in attempts from this network today." }, 429);
    await bump(env, kI, 172800);
    let pl; try { pl = await verifyGoogleIdToken(b.credential, await googleClientId(env)); } catch (e) { track(req, "signin_fail", { meta: String(e.message || e).slice(0, 60), path: String(b.source || "").split("?")[0].slice(0, 160) || null, ref: null }); return json({ error: "Google sign-in could not be verified. Please try again.", detail: String(e.message || e).slice(0, 60) }, 401); }
    const email = String(pl.email).toLowerCase(), name = String(pl.name || "").slice(0, 120), now = Date.now();
    const ust = await store(env).get("ust:" + pl.sub);
    if (ust === "blocked") { track(req, "signin_fail", { meta: "blocked", ref: null }); return json({ error: "This account can't sign in. If you think this is a mistake, write to us from the contact page." }, 403); }
    if (ust) await store(env).delete("ust:" + pl.sub);
    const db = await usersDb(env);
    const had = await db.prepare("SELECT sub FROM users WHERE sub = ?").bind(pl.sub).first();
    if (had) await db.prepare("UPDATE users SET email = ?, name = ?, picture = ?, last_login = ?, logins = COALESCE(logins, 0) + 1 WHERE sub = ?").bind(email, name, String(pl.picture || "").slice(0, 300), now, pl.sub).run();
    else { await db.prepare("INSERT INTO users (sub, email, name, picture, provider, source, created, last_login, logins) VALUES (?, ?, ?, ?, 'google', ?, ?, ?, 1)").bind(pl.sub, email, name, String(pl.picture || "").slice(0, 300), String(b.source || "events").split("?")[0].slice(0, 60), now, now).run(); await bump(env, "stat:signups"); }
    await afterSignin(req, env, pl, email, !had, b.source);
    const t = await newSession(env, { sub: pl.sub, email, name });
    return json({ ok: true, new_user: !had, user: { email, name } }, 200, { "set-cookie": sessCookie(t, SESS_TTL) });
  }
  if (p === "/api/auth/logout" && req.method === "POST") {
    const t = cookieOf(req, SESS_COOKIE); if (t && /^[a-f0-9]{64}$/.test(t)) await store(env).delete("sess:" + (await sha(t)));
    return json({ ok: true }, 200, { "set-cookie": sessCookie("", 0) });
  }
  if (p === "/api/me" && req.method === "GET") { const s = await currentSession(req, env); return s ? json({ signed_in: true, user: { email: s.email, name: s.name } }) : json({ signed_in: false }, 401); }
  if (p === "/api/events" && req.method === "GET") {
    const s = await currentSession(req, env); if (!s) return json({ error: "Sign in with Google to see the events." }, 401);
    const d = await eventsData(env); if (!d) return json({ error: "The events list is being refreshed. Please check back soon." }, 503);
    return json({ generated_at: d.generated_at, events: evUpcoming(d) }, 200, { "cache-control": "private, no-store" });
  }
  if (p.startsWith("/api/admin/events") || p === "/api/admin/signups" || p === "/api/admin/google" || p === "/api/admin/test-session") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    if (p === "/api/admin/events") {
      if (req.method === "POST") {
        const b = await req.json().catch(() => null); if (!b || !Array.isArray(b.events)) return json({ error: "need {events:[...]}" }, 400);
        const ev = b.events.filter(e => e && e.name && e.start && /^https?:\/\//.test(e.url || "") && /^\d{4}-\d{2}-\d{2}$/.test(e.start));
        await store(env).put("events:data", JSON.stringify({ generated_at: b.generated_at || new Date().toISOString(), pushed_at: new Date().toISOString(), events: ev }));
        const d = await eventsData(env); const up = evUpcoming(d);
        return json({ ok: true, stored: ev.length, upcoming: up.length, cfp_open: up.filter(evCfpOpen).length });
      }
      const d = await eventsData(env); const up = evUpcoming(d);
      return json({ generated_at: d && d.generated_at, pushed_at: d && d.pushed_at, stored: d ? d.events.length : 0, upcoming: up.length, cfp_open: up.filter(evCfpOpen).length });
    }
    if (p === "/api/admin/signups") {
      const db = await usersDb(env);
      if (req.method === "POST") { const b = await req.json().catch(() => ({})); if (b.delete_email) { const r = await db.prepare("DELETE FROM users WHERE email = ?").bind(String(b.delete_email).toLowerCase()).run(); return json({ ok: true, deleted: r.meta.changes }); } return json({ error: "need delete_email" }, 400); }
      const n = await db.prepare("SELECT COUNT(*) AS n FROM users").first();
      const r = await db.prepare("SELECT email, name, provider, source, created, last_login, logins FROM users ORDER BY created DESC LIMIT 200").all();
      return json({ count: n ? n.n : 0, users: (r.results || []).map(u => ({ ...u, created: new Date(u.created).toISOString(), last_login: new Date(u.last_login).toISOString() })) });
    }
    if (p === "/api/admin/google" && req.method === "POST") { const b = await req.json().catch(() => ({})); if (b.clear) { await store(env).delete("cfg:google_client_id"); return json({ ok: true, client_id: GOOGLE_CLIENT_ID_DEFAULT }); } if (!/^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/.test(String(b.client_id || ""))) return json({ error: "need client_id" }, 400); await store(env).put("cfg:google_client_id", b.client_id); return json({ ok: true, client_id: b.client_id }); }
    if (p === "/api/admin/test-session" && req.method === "POST") { const tb = await req.json().catch(() => ({})); const t = await newSession(env, { sub: "test:" + crypto.randomUUID(), email: "test-session@fitwise.invalid", name: "Test session", test: true, admin: tb.admin === true }, 3600); const lk = rid(24); await store(env).put("tlogin:" + lk, t, { expirationTtl: 300 }); return json({ ok: true, cookie: SESS_COOKIE + "=" + t, expires_in: 3600, login_path: "/api/auth/test-login?k=" + lk }); }
  }
  return null;
}

const EV_CSS = `<style>
.evw{max-width:1040px;margin:0 auto;padding:26px 16px 50px}
.evh h1{font-size:1.75rem;margin:.2em 0 .25em}.evh p{color:var(--mut);margin:0 0 .4em;max-width:760px}
.evh .src{font-size:.85rem}
.evk{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:18px 0}
.evk button,.evk div{all:unset;box-sizing:border-box;cursor:pointer;background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column}
.evk div{cursor:default}.evk button:hover{border-color:var(--g)}
.evk small{color:var(--mut);font-size:.72rem;text-transform:uppercase;letter-spacing:.05em;font-weight:700}.evk b{font-size:1.6rem;line-height:1.15;color:var(--ink)}.evk span{color:var(--mut);font-size:.78rem}
.evk .hot b{color:var(--g)}
.evc{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px;margin:0 0 16px}
.evc h2{text-align:left;font-size:1.1rem;margin:0 0 10px;display:flex;justify-content:space-between;gap:8px;align-items:baseline;flex-wrap:wrap}.evc h2 small{color:var(--mut);font-weight:500;font-size:.82rem}
.evs{display:flex;align-items:flex-start;gap:10px;overflow-x:auto;padding-bottom:6px;scroll-snap-type:x mandatory}
.evcf{flex:0 0 250px;scroll-snap-align:start;background:#f2faf7;border:1px solid #bfe3d7;border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:4px;text-decoration:none;color:var(--ink)}
.evcf .dl{font-size:.8rem;font-weight:800;color:var(--g)}.evcf .dl.soon{color:var(--warn)}.evcf b{font-size:.95rem;line-height:1.25}.evcf span{font-size:.8rem;color:var(--mut)}
.evf{display:flex;flex-direction:column;gap:10px}.evr{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.evf input[type=search],.evf select{padding:10px 11px;border-radius:10px;border:1px solid var(--line);background:#fff;color:var(--ink);font:inherit;font-size:.92rem;min-height:42px}
.evf input[type=search]{flex:1 1 230px;min-width:0}.evf select{flex:0 1 auto;max-width:100%}
.chip{border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:999px;padding:8px 13px;font:inherit;font-size:.86rem;font-weight:600;cursor:pointer;white-space:nowrap;min-height:38px}
.chip.on{background:var(--g);border-color:var(--g);color:#fff}.chip .mu{opacity:.65;font-weight:500}
.evt{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}
.evm{font-size:.85rem;color:var(--mut)}.evm button{all:unset;cursor:pointer;color:var(--g);font-weight:600;margin-left:8px}
.evmon{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin:18px 0 4px;padding-bottom:5px;border-bottom:1px solid var(--line)}.evmon:first-child{margin-top:4px}
.eve{display:grid;grid-template-columns:58px 1fr;gap:12px;padding:12px 0;border-bottom:1px dashed var(--line)}.eve:last-child{border-bottom:0}
.evd{background:#f2faf7;border:1px solid #d5ebe3;border-radius:12px;text-align:center;padding:6px 0;height:max-content}
.evd small{display:block;font-size:.68rem;font-weight:800;color:var(--g);text-transform:uppercase}.evd b{display:block;font-size:1.35rem;line-height:1.1}.evd em{display:block;font-style:normal;font-size:.68rem;color:var(--mut)}
.evb{min-width:0}.evb a.t{font-weight:700;font-size:1rem;color:var(--ink);text-decoration:none;line-height:1.3;word-break:break-word}.evb a.t:hover{color:var(--g);text-decoration:underline}
.evl{font-size:.85rem;color:var(--mut);margin-top:2px}
.evp{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.pill{font-size:.74rem;font-weight:650;border-radius:7px;padding:2px 8px;background:#f4f2ec;border:1px solid var(--line);color:#3b404a;white-space:nowrap}
.pill.inp{color:#1d5fb8;background:#eef4fc;border-color:#d3e2f6}.pill.vir{color:#6a3fb5;background:#f4effc;border-color:#e0d4f5}.pill.hyb{color:#0b7a8a;background:#ecf8f9;border-color:#cbe9ec}
.pill.free{color:var(--g);background:#eaf6f1;border-color:#c9e7dc}.pill.nl{color:#b4531a;background:#fdf3ea;border-color:#f3dcc6}.pill.tp{background:transparent}
.evcp{margin-top:8px;font-size:.85rem;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.cfp{font-weight:700;border-radius:8px;padding:3px 9px;font-size:.8rem}
.cfp.open{background:#e3f4ed;color:var(--g);border:1px solid #9fd3c0}.cfp.closed{color:#8a3b3b;background:#fbf1f1;border:1px solid #efd3d3;font-weight:600}.cfp.ns{color:var(--mut);border:1px solid var(--line);font-weight:500}
.evcp a.ap{color:var(--g);font-weight:800;text-decoration:none}.evn{font-size:.8rem;color:var(--mut);margin-top:4px}
.evempty{color:var(--mut);padding:22px 0;text-align:center}
.evmore{display:block;margin:14px auto 0}
.evu{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:.86rem;color:var(--mut);margin:8px 0 0}.evu button{all:unset;cursor:pointer;color:var(--g);font-weight:700}
/* gate */
.gate{position:relative;margin-top:6px}
.gate .ghost{filter:blur(5px);opacity:.75;pointer-events:none;user-select:none}
.bar{display:inline-block;height:.85em;border-radius:5px;background:#d9d5ca;vertical-align:middle}
.gatebox{position:absolute;left:50%;top:44px;transform:translateX(-50%);width:min(440px,92%);background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 18px 50px rgba(20,30,25,.16);padding:22px 20px;text-align:center}
.gatebox h2{font-size:1.25rem;margin:0 0 6px;text-align:center}.gatebox p{color:var(--mut);margin:0 0 14px;font-size:.93rem}
.gatebox .gbtn{display:flex;justify-content:center;min-height:44px}.gatebox .fine{font-size:.76rem;color:var(--mut);margin:12px 0 0}
.gatebox .err{color:#a33;font-size:.85rem;margin:10px 0 0;min-height:1em}
body.signed .gate{display:none}body:not(.signed) #evApp{display:none}
.xl2{display:inline}@media(max-width:760px){.evk{grid-template-columns:repeat(3,1fr);gap:8px}.evk b{font-size:1.3rem}.evk span{display:none}.evk>:nth-child(n+4){grid-column:span 1}
.evw{padding-top:18px}.evh h1{font-size:1.45rem}.evc{padding:12px}.eve{grid-template-columns:48px 1fr;gap:10px}.evd b{font-size:1.15rem}.evf select{flex:1 1 45%}.gatebox{top:24px}}
</style>`;

function evEsc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function eventsHTML(d, signed, clientId) {
  const up = evUpcoming(d); const n = up.length, open = up.filter(evCfpOpen).length;
  const cnt = r => up.filter(e => e.region === r).length;
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const tc = {}; up.forEach(e => (e.topics || []).forEach(t => tc[t] = (tc[t] || 0) + 1));
  const topicsLine = EV_TOPICS.filter(t => tc[t]).slice(0, 8).map(t => `<span class="pill">${evEsc(t)} · ${tc[t]}</span>`).join(" ");
  // teaser cards: date, format and region only; names are not sent to signed-out visitors
  const ghost = up.slice(0, 5).map((e, i) => { const [y, m, dd] = e.start.split("-").map(Number); const fc = e.format === "Virtual" ? "vir" : e.format === "Hybrid" ? "hyb" : "inp";
    return `<div class="eve"><div class="evd"><small>${MON[m - 1]}</small><b>${dd}</b><em>&nbsp;</em></div><div class="evb"><span class="bar" style="width:${55 + (i * 13) % 35}%"></span><div class="evl"><span class="bar" style="width:${30 + (i * 17) % 25}%;height:.7em"></span></div><div class="evp"><span class="pill ${fc}">${evEsc(e.format)}</span><span class="pill">${evEsc(e.kind || "Event")}</span>${e.region === "NL" ? '<span class="pill nl">NL</span>' : ""}${evCfpOpen(e) ? '<span class="pill free">🎤 Speaker call open</span>' : ""}</div></div></div>`; }).join("");
  const kpi = (l, v, s, act, cls) => `<${signed ? "button type=\"button\"" : "div"} class="${cls || ""}" data-act="${act}"><small>${l}</small><b>${v}</b><span>${s}</span></${signed ? "button" : "div"}>`;
  const kpis = kpi("Upcoming", n, "from today", "all") + kpi("Netherlands", cnt("NL"), "in NL", "NL") + kpi("Europe", cnt("Europe"), "rest of Europe", "Europe") + kpi("Online", cnt("Online"), "virtual", "Online") + kpi("🎤 Speaker calls", open, "open now", "mic", "hot");
  const desc = `${n} upcoming IT conferences, workshops and meetups in the Netherlands, Europe and online, with ${open} open speaker calls. Free with Google sign-in.`;
  const body = `<div class="evw">
<div class="evh"><span class="eyebrow">Conferences &amp; Workshops</span><h1>IT conferences, workshops and meetups: NL, Europe and online</h1>
<p>Upcoming events for testing/QA, test automation, AI/ML, DevOps and cloud, observability, security, data and software engineering. Nearest date first; past events drop off automatically. Open calls for speakers are listed with their deadlines.</p>
<p class="src muted">Speaker-call status comes only from the event's own call-for-papers page or its public listing; when no source says, it shows "not stated". Looking for a job? See <a href="/jobs">today's jobs in Europe</a>.</p></div>
<div class="evk" id="evKpi">${kpis}</div>
<div class="gate" id="evGate">
  <div class="evc ghost" aria-hidden="true"><h2>Upcoming events <small>${n} events</small></h2>${ghost}</div>
  <div class="gatebox" role="region" aria-label="Sign in to see all events"><h2>Sign in to see all ${n} events</h2>
    <p>Free. Sign in with Google to see every event, the ${open} open speaker calls with deadlines, and the filters (in person / virtual, NL / Europe / online, topic).</p>
    <div class="gbtn" id="gBtn"><noscript>Turn on JavaScript to sign in with Google.</noscript></div>
    <div class="err" id="gErr" role="alert"></div>
    <p class="fine">We store your Google email and name to create your free Fitwise account. No password, no posting. <a href="/privacy">Privacy</a></p>
    <div style="margin-top:10px">${topicsLine}</div></div>
</div>
<div id="evApp">
  <div class="evc"><h2>🎤 Open speaker calls <small id="evCfpN"></small></h2><div class="evs" id="evStrip"></div></div>
  <div class="evc" id="evListCard">
    <div class="evf">
      <div class="evr"><input type="search" id="evQ" placeholder="Search event, city, topic…" aria-label="Search events">
        <button type="button" class="chip" id="evMic">🎤 Speaker call open</button>
        <span class="evr" id="evFmt"><button type="button" class="chip" data-f="inperson">In person</button><button type="button" class="chip" data-f="virtual">Virtual</button></span></div>
      <div class="evr">
        <select id="evRegion" aria-label="Where"><option value="all">NL + Europe + Online</option><option value="NL">NL only</option><option value="NLEU">NL + Europe (in person)</option><option value="Europe">Rest of Europe</option><option value="Online">Online only</option></select>
        <select id="evKind" aria-label="Type"><option value="all">All types</option><option value="Conference">Conferences</option><option value="Meetup">Meetups &amp; workshops</option></select>
        <select id="evSort" aria-label="Sort"><option value="date">Nearest date first</option><option value="cfp">Speaker deadline first</option></select></div>
      <div class="evt" id="evTopics"></div>
      <div class="evm"><span id="evCount"></span><button type="button" id="evReset">Reset filters</button></div>
    </div>
    <div id="evList" style="margin-top:8px"><div class="evempty">Loading events…</div></div>
  </div>
  <div class="evu"><span id="evUpd"></span><span id="evWho"></span></div>
</div>
</div>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>IT Conferences &amp; Workshops in NL, Europe and online · Fitwise</title>
<meta name="description" content="${evEsc(desc)}">
<link rel="canonical" href="${JOBS_SITE}/events">
<meta property="og:type" content="website"><meta property="og:site_name" content="Fitwise"><meta property="og:title" content="IT Conferences &amp; Workshops · Fitwise"><meta property="og:description" content="${evEsc(desc)}"><meta property="og:url" content="${JOBS_SITE}/events"><meta property="og:image" content="${JOBS_SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css"><meta name="theme-color" content="#0b6b58">
${EV_CSS}
</head><body class="events${signed ? " signed" : ""}">
<a class="skip" href="#main">Skip to content</a>
${SITE_HEADER}
<main id="main">${body}</main>
${SITE_FOOTER}
<script>window.FW_GCID=${JSON.stringify(clientId)};</script>
<script src="/events.js?v=3" defer></script>
<script src="https://accounts.google.com/gsi/client" async defer onload="window.fwGsiReady&&window.fwGsiReady()"></script>
</body></html>`;
  return html;
}
async function eventsPage(p, req, env) {
  if (p !== "/events" && p !== "/events/") return null;
  const d = await eventsData(env);
  const s = await currentSession(req, env);
  if (!s) track(req, "gate_shown", { meta: { page: "events" } });
  const app = s ? "" : inAppName(req.headers.get("user-agent") || "");
  if (app) track(req, "inapp_hint", { meta: { app } });
  return new Response(eventsHTML(d, !!s, await googleClientId(env)).replace('<div class="gatebox" role="region" aria-label="Sign in to see all events">', '<div class="gatebox" role="region" aria-label="Sign in to see all events">' + (app ? inAppBox(app, req) : "")), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store" } });
}
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

  // 2. Email OTP Passwordless Sign-In (works in LinkedIn in-app browser & everywhere!)
  if (p === "/api/auth/email/request" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const email = String(b.email || "").trim().toLowerCase();
    const name = String(b.name || "").trim().slice(0, 80);
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email address." }, 400);
    const ip = req.headers.get("cf-connecting-ip") || "0", day = amsDay();
    const kI = "q:otp:" + (await sha(ip)).slice(0, 20) + ":" + day;
    if ((await kvNum(env, kI)) >= 20) return json({ error: "Too many sign-in codes requested today. Try again tomorrow." }, 429);
    await bump(env, kI, 172800);
    const code = String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
    const eh = await sha(email);
    await store(env).put("otp:" + eh, JSON.stringify({ code, email, name, at: Date.now() }), { expirationTtl: 600 });
    // Check if Resend email key is configured in app_config
    let emailed = false;
    try {
      const mailCfg = await getAppCfg(env, "mail_provider");
      if (mailCfg && mailCfg.resend_key) {
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
        emailed = mr.ok;
      }
    } catch {}
    return json({
      ok: true,
      emailed,
      instant_code: emailed ? undefined : code,
      message: emailed ? `We sent a 6-digit code to ${email}.` : `Instant verification code generated for ${email} (email delivery not configured yet).`
    });
  }

  if (p === "/api/auth/email/verify" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const email = String(b.email || "").trim().toLowerCase();
    const code = String(b.code || "").trim();
    if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(code)) return json({ error: "Enter a valid email and 6-digit code." }, 400);
    const eh = await sha(email);
    const raw = await store(env).get("otp:" + eh);
    if (!raw) return json({ error: "Code expired or not found. Request a new code." }, 401);
    const rec = JSON.parse(raw);
    if (rec.code !== code) return json({ error: "Incorrect code. Please double-check and try again." }, 401);
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
    if (req.method === "GET") {
      const id = String(url.searchParams.get("id") || "").trim();
      if (!id) return json({ error: "missing id" }, 400);
      const row = await db.prepare("SELECT id, filename, score, report_json, resume_text, jd_text, created_at FROM ats_scans WHERE id = ?").bind(id).first();
      if (!row) return json({ error: "scan not found" }, 404);
      return json({ id: row.id, filename: row.filename, score: row.score, report: JSON.parse(row.report_json || "{}"), resume_text: row.resume_text || "", jd_text: row.jd_text || "", created_at: row.created_at });
    }
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const s = await currentSession(req, env);
      const id = "scan_" + crypto.randomUUID().replace(/-/g, "").slice(0, 14);
      const report = b.report || {};
      await db.prepare("INSERT INTO ats_scans (id, sub, filename, score, report_json, resume_text, jd_text, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(
        id, s ? s.sub : null, String(b.filename || "Pasted Resume").slice(0, 120), Number(report.score || 0),
        JSON.stringify(report).slice(0, 60000), String(b.resume_text || "").slice(0, 35000), String(b.jd_text || "").slice(0, 15000), Date.now()
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

// ---------- storage adapter: KV, D1 or R2, same tiny interface ----------
let _tableReady = false;
function store(env) {
  if (env.DATA) return env.DATA;
  if (env.DB) {
    const db = env.DB;
    const ready = async () => { if (!_tableReady) { await db.prepare("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT, exp INTEGER)").run(); _tableReady = true; } };
    return {
      async get(k) { await ready(); const r = await db.prepare("SELECT v, exp FROM kv WHERE k = ?").bind(k).first(); if (!r) return null; if (r.exp && r.exp < Date.now() / 1000) return null; return r.v; },
      async put(k, v, o) { await ready(); const exp = o && o.expirationTtl ? Math.floor(Date.now() / 1000) + o.expirationTtl : null; await db.prepare("INSERT INTO kv (k, v, exp) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, exp = excluded.exp").bind(k, v, exp).run(); },
      async delete(k) { await ready(); await db.prepare("DELETE FROM kv WHERE k = ?").bind(k).run(); },
      async list({ prefix }) { await ready(); const r = await db.prepare("SELECT k FROM kv WHERE k LIKE ? ORDER BY k LIMIT 1000").bind(prefix.replace(/[%_]/g, "") + "%").all(); return { keys: (r.results || []).map(x => ({ name: x.k })), list_complete: true }; }
    };
  }
  if (env.FILES) {
    const b = env.FILES;
    return {
      async get(k) { const o = await b.get(k); if (!o) return null; const e = o.customMetadata && o.customMetadata.exp; if (e && +e < Date.now() / 1000) return null; return o.text(); },
      async put(k, v, o) { await b.put(k, v, { customMetadata: o && o.expirationTtl ? { exp: String(Math.floor(Date.now() / 1000) + o.expirationTtl) } : {} }); },
      async delete(k) { await b.delete(k); },
      async list({ prefix, cursor }) { const r = await b.list({ prefix, cursor }); return { keys: r.objects.map(x => ({ name: x.key })), list_complete: !r.truncated, cursor: r.cursor }; }
    };
  }
  throw new Error("no storage bound");
}

// ---------- Fitwise Worker: API + static assets ----------
const FREE_LIMIT = 3;
const IP_DAILY_LIMIT = 8;
const ADMIN_HASH = "7a10a784b5b843d370c1d08192d0baac6470e6e855eae5612844f3cfecda519c";

const SYS_PROMPT = `You tailor CVs to a job ad. HARD RULES (truthfulness):
- Rephrase and reorder ONLY. Never invent employers, titles, dates, degrees, certifications, tools, skills, numbers or achievements.
- Every skill you list must already appear somewhere in the CV text.
- Every number in your output must already appear in the CV text.
- Keep each role's header lines exactly as given. Do not add or remove roles. Do not add bullets; you may merge or shorten them.
- Do not add qualities, scale or adjectives the CV does not state (e.g. 'high-availability', 'scalable', 'expert', 'millions').
- Use the job ad's exact wording for a skill only where the CV clearly shows that same skill.
- Plain ATS-friendly text: no tables, no emojis, no first-person in bullets, start bullets with strong verbs.
Return ONLY a JSON object: {"summary": string (2-3 sentences), "skills": [string], "experience": [{"bullets": [string]}] (same number and order of roles as the input), "cover_letter": string (3 short paragraphs + sign-off with the candidate's name, under 230 words, no invented facts)}.`;

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });
}
async function sha(s) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join(""); }
async function isAdmin(req) { const k = req.headers.get("x-admin-key") || ""; if (k && (await sha(k)) === ADMIN_HASH) return true; const c = REQ.get(req); if (!c) return false; const s = await currentSession(req, c.env); return !!(s && s.isAdmin); }
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
async function kvNum(env, k) { const v = await store(env).get(k); return v ? parseInt(v, 10) || 0 : 0; }
async function bump(env, k, ttl) { const n = (await kvNum(env, k)) + 1; await store(env).put(k, String(n), ttl ? { expirationTtl: ttl } : undefined); return n; }

function decodeEntities(s) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&rsquo;|&lsquo;/g, "'").replace(/&rdquo;|&ldquo;/g, '"').replace(/&ndash;/g, "–").replace(/&mdash;/g, "—").replace(/&bull;/g, "•").replace(/&euro;/g, "€");
}
function htmlToText(h) {
  h = h.replace(/<(script|style|noscript|svg|nav|footer|header|form|iframe)[\s\S]*?<\/\1>/gi, " ");
  h = h.replace(/<li[^>]*>/gi, "\n- ").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h[1-6]|ul|ol|section|tr)>/gi, "\n").replace(/<h[1-6][^>]*>/gi, "\n");
  h = decodeEntities(h.replace(/<[^>]+>/g, " "));
  return h.split("\n").map(l => l.replace(/[ \t\u00a0]+/g, " ").trim()).filter((l, i, a) => l || (a[i - 1] && a[i - 1].trim())).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
async function getJSON(u) { const r = await fetch(u, { headers: { "user-agent": "Mozilla/5.0 (compatible; FitwiseBot/1.0)", accept: "application/json" }, cf: { cacheTtl: 300 } }); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }

async function fetchJob(url) {
  let u; try { u = new URL(url); } catch { throw new Error("That doesn't look like a link."); }
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) links work.");
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(u.hostname)) throw new Error("That link isn't public.");
  let m;
  if ((m = u.href.match(/greenhouse\.io\/([\w-]+)\/jobs\/(\d+)/)) || ((m = [null, u.searchParams.get("for"), u.searchParams.get("token")]) && m[1] && m[2] && /greenhouse/.test(u.hostname))) {
    const j = await getJSON(`https://boards-api.greenhouse.io/v1/boards/${m[1]}/jobs/${m[2]}`);
    let co = m[1]; try { const b = await getJSON(`https://boards-api.greenhouse.io/v1/boards/${m[1]}`); co = b.name || co; } catch {}
    return { title: j.title, company: co, text: htmlToText(decodeEntities(j.content || "")), source: "greenhouse" };
  }
  if ((m = u.href.match(/jobs\.(?:eu\.)?lever\.co\/([\w.-]+)\/([0-9a-f-]{36})/))) {
    const host = /\.eu\./.test(u.hostname) ? "api.eu.lever.co" : "api.lever.co";
    const j = await getJSON(`https://${host}/v0/postings/${m[1]}/${m[2]}`);
    const lists = (j.lists || []).map(l => l.text + "\n" + htmlToText(l.content)).join("\n\n");
    return { title: j.text, company: m[1], text: [j.descriptionPlain || htmlToText(j.description || ""), lists, j.additionalPlain || ""].join("\n\n").trim(), source: "lever" };
  }
  if ((m = u.href.match(/jobs\.ashbyhq\.com\/([\w.%-]+)\/([0-9a-f-]{36})/))) {
    const b = await getJSON(`https://api.ashbyhq.com/posting-api/job-board/${m[1]}`);
    const j = (b.jobs || []).find(x => x.id === m[2]);
    if (j) return { title: j.title, company: decodeURIComponent(m[1]), text: j.descriptionPlain || htmlToText(j.descriptionHtml || ""), source: "ashby" };
  }
  const r = await fetch(u.href, { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", accept: "text/html,*/*", "accept-language": "en" }, redirect: "follow" });
  if (!r.ok) throw new Error("The job site answered " + r.status + ". Paste the job text instead.");
  const html = (await r.text()).slice(0, 1500000);
  for (const blk of html.match(/<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi) || []) {
    try {
      let d = JSON.parse(blk.replace(/^<script[^>]*>|<\/script>$/gi, ""));
      const arr = Array.isArray(d) ? d : (d["@graph"] || [d]);
      const jp = arr.find(x => x && (x["@type"] === "JobPosting" || (Array.isArray(x["@type"]) && x["@type"].includes("JobPosting"))));
      if (jp && jp.description) return { title: jp.title || "", company: (jp.hiringOrganization && (jp.hiringOrganization.name || jp.hiringOrganization)) || "", text: htmlToText(decodeEntities(jp.description)), source: "jsonld" };
    } catch {}
  }
  const tm = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const body = (html.match(/<main[\s\S]*?<\/main>/i) || html.match(/<body[\s\S]*<\/body>/i) || [html])[0];
  const text = htmlToText(body).slice(0, 15000);
  if (text.length < 300) throw new Error("This site loads the job with scripts we can't read. Paste the job text instead.");
  return { title: tm ? decodeEntities(tm[1]).trim().slice(0, 100) : "", company: "", text, source: "html" };
}

function numbersIn(s) { return (s.match(/\d[\d,.]*/g) || []).map(x => x.replace(/[,.]$/, "").replace(/,/g, "")); }
function allNumbersKnown(s, cvNums) { return numbersIn(s).every(n => cvNums.has(n)); }

async function callAI(cfg, system, user) {
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 55000);
  try {
    if (cfg.provider === "anthropic") {
      const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal: ctl.signal, headers: { "x-api-key": cfg.key, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: cfg.model, max_tokens: 3000, temperature: 0.2, system, messages: [{ role: "user", content: user }] }) });
      const j = await r.json(); if (!r.ok) throw new Error("ai " + r.status + " " + JSON.stringify(j).slice(0, 200));
      return { text: (j.content || []).map(c => c.text || "").join(""), usage: { in: j.usage?.input_tokens, out: j.usage?.output_tokens } };
    }
    const base = (cfg.base_url || "https://api.openai.com/v1").replace(/\/$/, "");
    const r = await fetch(base + "/chat/completions", { method: "POST", signal: ctl.signal, headers: { authorization: "Bearer " + cfg.key, "content-type": "application/json" }, body: JSON.stringify({ model: cfg.model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }) });
    const j = await r.json(); if (!r.ok) throw new Error("ai " + r.status + " " + JSON.stringify(j).slice(0, 200));
    return { text: j.choices?.[0]?.message?.content || "", usage: { in: j.usage?.prompt_tokens, out: j.usage?.completion_tokens } };
  } finally { clearTimeout(to); }
}

async function tailorAI(cfg, cvText, jdText, base) {
  const t = base.tailored;
  const user = JSON.stringify({
    job_title: base.job.title, company: base.job.company, job_ad: jdText.slice(0, 12000),
    job_keywords_cv_already_has: base.matched, job_keywords_cv_lacks_DO_NOT_ADD: base.missing,
    cv: { name: t.name, headline: t.headline, summary: t.summary, skills: t.skills, roles: t.experience.map(e => ({ header: e.header, bullets: e.bullets })) },
    full_cv_text: cvText.slice(0, 12000)
  });
  const res = await callAI(cfg, SYS_PROMPT, user);
  const m = res.text.match(/\{[\s\S]*\}/); if (!m) throw new Error("no json");
  const out = JSON.parse(m[0]);
  const cvNums = new Set(numbersIn(cvText)); const cvN = norm(cvText);
  const guard = [];
  const next = JSON.parse(JSON.stringify(t));
  if (typeof out.summary === "string" && out.summary.length > 20) { if (allNumbersKnown(out.summary, cvNums)) next.summary = out.summary.trim(); else guard.push("summary"); }
  if (Array.isArray(out.skills)) {
    const ok = out.skills.filter(s => typeof s === "string" && s.trim() && (cvN.includes(" " + s.toLowerCase().trim() + " ") || cvN.includes(s.toLowerCase().trim()) || [...countTerms(s).keys()].some(k => countTerms(cvText).has(k))));
    const dropped = out.skills.length - ok.length; if (dropped) guard.push(dropped + " skill(s)");
    const seen = new Set(ok.map(s => s.toLowerCase()));
    next.skills = [...ok, ...t.skills.filter(s => !seen.has(s.toLowerCase()))];
  }
  if (Array.isArray(out.experience) && out.experience.length === t.experience.length) {
    out.experience.forEach((e, i) => {
      const b = (e && Array.isArray(e.bullets) ? e.bullets : []).filter(x => typeof x === "string" && x.trim()).slice(0, Math.max(t.experience[i].bullets.length, 1));
      if (b.length && b.every(x => allNumbersKnown(x, cvNums))) next.experience[i].bullets = b.map(x => x.replace(/^[-•*]\s*/, "").trim());
      else if (b.length) guard.push("role " + (i + 1));
    });
  } else guard.push("roles");
  let cover = base.cover;
  if (typeof out.cover_letter === "string" && out.cover_letter.length > 200) { if (allNumbersKnown(out.cover_letter, cvNums)) cover = out.cover_letter.trim(); else guard.push("cover letter"); }
  const changes = ["Rewrote your summary and bullets around this job's priorities, using only facts already in your CV.", ...base.changes.filter(c => /Listed skills|Matched the job/.test(c))];
  if (guard.length) changes.push("Truth check: kept your original wording for " + guard.join(", ") + " because the AI draft contained something not in your CV.");
  return { ...base, mode: "ai", tailored: next, cover, changes, usage: res.usage };
}

async function handleTailor(req, env) {
  let b; try { b = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  const cv = String(b.cv || "").slice(0, 25000), jd = String(b.jd || "").slice(0, 25000);
  const email = String(b.email || "").trim().toLowerCase(), device = String(b.device || "").slice(0, 64);
  if (cv.trim().length < 150) return json({ error: "Your CV looks too short. Paste the full text (or upload the file)." }, 400);
  if (jd.trim().length < 100) return json({ error: "Add the job description (paste it, or fetch it from the link)." }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email so we can count your free tailorings." }, 400);
  const eh = await sha(email), ip = req.headers.get("cf-connecting-ip") || "0", day = new Date().toISOString().slice(0, 10);
  const kE = "q:e:" + eh, kD = device ? "q:d:" + device : null, kI = "q:i:" + (await sha(ip)).slice(0, 24) + ":" + day;
  const used = Math.max(await kvNum(env, kE), kD ? await kvNum(env, kD) : 0);
  if (used >= FREE_LIMIT) return json({ error: "limit", used, limit: FREE_LIMIT }, 402);
  if ((await kvNum(env, kI)) >= IP_DAILY_LIMIT) return json({ error: "Too many tailorings from this network today. Try again tomorrow." }, 429);
  const t0 = Date.now();
  let result = tailorRules(cv, jd, { title: String(b.title || "").slice(0, 100), company: String(b.company || "").slice(0, 80) });
  let aiNote = null;
  const cfgRaw = await store(env).get("cfg:ai");
  if (cfgRaw) {
    try { result = await tailorAI(JSON.parse(cfgRaw), cv, jd, result); }
    catch (e) { aiNote = "AI unavailable, used instant mode"; await store(env).put("log:aierr", String(e).slice(0, 300) + " @" + new Date().toISOString()); }
  }
  const n = await bump(env, kE); if (kD) await store(env).put(kD, String(Math.max(n, (await kvNum(env, kD)) + 1)));
  await bump(env, kI, 172800);
  if (n === 1) await store(env).put("lead:" + eh, JSON.stringify({ email, first: new Date().toISOString() }));
  await bump(env, "stat:tailorings");
  if (result.usage) { await store(env).put("stat:lastusage", JSON.stringify({ ...result.usage, at: new Date().toISOString() })); delete result.usage; }
  return json({ ...result, aiNote, ms: Date.now() - t0, used: n, limit: FREE_LIMIT });
}


// ---------- v2: structured tailoring, location formats, credits ----------
const DAILY_FAIR = 25;            // free tailorings per email/device per day (fair use; applies after launch)
const PRELAUNCH_FREE = 1;         // pre-launch: free tailorings per person in total (email AND browser). Set 0 at launch.
const PRELAUNCH_MSG = "Pre-launch: 1 free tailoring per person, and you've already used yours. Thanks for trying Fitwise! More tailorings open at launch.";
const IP_DAILY_FAIR = 60;
const CREDIT_PACKS = { starter: { credits: 10, usd: 5 }, plus: { credits: 30, usd: 12 }, power: { credits: 70, usd: 25 } };
const CREDITS_PER_COVER = 1;      // a cover letter for one job = 1 credit (preview free)
// Autopilot (coming soon): prepaid job bundles in EUR, each with a daily cap and a validity window
const AUTOPILOT_BUNDLES = { a10: { jobs: 10, eur: 1.5 }, a100: { jobs: 100, eur: 9.5 }, a1000: { jobs: 1000, eur: 65 } };
const AUTOPILOT_DAILY_CAP = 50, AUTOPILOT_VALID_DAYS = 90;
const CREDITS_PER_FORMAT = 1;     // $0.50 each; both formats for a job = 2 credits ($1)
let _sqlReady = false;
async function sql(env) {
  const db = env.DB;
  if (!_sqlReady) {
    await db.batch([
      db.prepare("CREATE TABLE IF NOT EXISTS credits (email_hash TEXT PRIMARY KEY, email TEXT, balance INTEGER NOT NULL DEFAULT 0, updated INTEGER)"),
      db.prepare("CREATE TABLE IF NOT EXISTS credit_ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, email_hash TEXT, delta INTEGER, reason TEXT, ref TEXT, created INTEGER)"),
      db.prepare("CREATE INDEX IF NOT EXISTS credit_ledger_ref ON credit_ledger (email_hash, ref)"),
      db.prepare("CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, email_hash TEXT, doc_hash TEXT, title TEXT, created INTEGER)")
    ]);
    _sqlReady = true;
  }
  return db;
}
async function balanceOf(env, eh) { const r = await (await sql(env)).prepare("SELECT balance FROM credits WHERE email_hash = ?").bind(eh).first(); return r ? r.balance : 0; }
// the one place credits are added: Stripe webhook (later) and admin grants call this
async function grantCredits(env, email, n, reason, ref) {
  const db = await sql(env); const eh = await sha(email); const now = Date.now();
  await db.batch([
    db.prepare("INSERT INTO credits (email_hash, email, balance, updated) VALUES (?, ?, ?, ?) ON CONFLICT(email_hash) DO UPDATE SET balance = balance + excluded.balance, updated = excluded.updated").bind(eh, email, n, now),
    db.prepare("INSERT INTO credit_ledger (email_hash, delta, reason, ref, created) VALUES (?, ?, ?, ?, ?)").bind(eh, n, reason, ref || "", now)
  ]);
  return balanceOf(env, eh);
}
// payment provider hook. Today: no payments (early access list). Later: Stripe Checkout for credit packs.
const PAYMENTS = {
  live: false,
  async checkout(env, email, packId, origin) {
    // LATER (Stripe): const s = await stripe.checkout.sessions.create({ mode: "payment", customer_email: email,
    //   line_items: [{ price: env.STRIPE_PRICE_<PACK>, quantity: 1 }], metadata: { email, pack: packId },
    //   success_url: origin + "/?paid=1#try", cancel_url: origin + "/#pricing" }); return { url: s.url };
    // and a webhook route (/api/stripe/webhook) that verifies the signature and calls
    //   grantCredits(env, metadata.email, CREDIT_PACKS[pack].credits, "purchase", session.id)  (idempotent on session.id)
    return null;
  }
};
const fontGet = env => async p => { const r = await env.ASSETS.fetch(new Request("https://assets.local" + p)); if (!r.ok) throw new Error("asset " + p + " " + r.status); return r.arrayBuffer(); };
function pdfResp(bytes, name) { return new Response(bytes, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${name}"`, "cache-control": "no-store" } }); }

async function handleTailor2(req, env) {
  let b; try { b = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  const jd = String(b.jd || "").slice(0, 30000);
  const email = String(b.email || "").trim().toLowerCase(), device = String(b.device || "").slice(0, 64);
  let lines = Array.isArray(b.lines) ? b.lines.slice(0, 900) : null;
  const cvText = lines ? lines.map(l => String(l && l.t || "") + (l && l.right ? " " + l.right : "")).join("\n") : String(b.cv || "").slice(0, 30000);
  if (cvText.trim().length < 150) return json({ error: "Your CV looks too short. Paste the full text (or upload the file)." }, 400);
  if (jd.trim().length < 100) return json({ error: "Add the job description (paste it, or fetch it from the link)." }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email so we can save your results and credits." }, 400);
  const eh = await sha(email), ip = req.headers.get("cf-connecting-ip") || "0", day = new Date().toISOString().slice(0, 10);
  const kE = "d:e:" + eh + ":" + day, kD = device ? "d:d:" + device + ":" + day : null, kI = "q:i:" + (await sha(ip)).slice(0, 24) + ":" + day;
  // PRE-LAUNCH (Suresh, WhatsApp 7:45 AM 1 Nov 2026): 1 free tailoring per person, counted per email AND per browser, never resets until launch
  const kPE = "pl:e:" + eh, kPD = device ? "pl:d:" + device : null;
  if (PRELAUNCH_FREE > 0) {
    const usedPL = Math.max(await kvNum(env, kPE), kPD ? await kvNum(env, kPD) : 0);
    if (usedPL >= PRELAUNCH_FREE) return json({ error: PRELAUNCH_MSG, code: "prelaunch_used", limit: PRELAUNCH_FREE }, 429);
  }
  const usedToday = Math.max(await kvNum(env, kE), kD ? await kvNum(env, kD) : 0);
  if (usedToday >= DAILY_FAIR) return json({ error: `That's ${DAILY_FAIR} tailorings today. The free daily limit resets tomorrow.` }, 429);
  if ((await kvNum(env, kI)) >= IP_DAILY_FAIR) return json({ error: "Too many tailorings from this network today. Try again tomorrow." }, 429);
  const t0 = Date.now();
  if (!lines) lines = textToLines(cvText);
  const meta = b.meta && typeof b.meta === "object" ? b.meta : {};
  const orig = parseDoc(lines, { source: ["pdf", "docx", "text"].includes(meta.source) ? meta.source : "text" });
  let res = tailorDoc(orig, jd, { title: String(b.title || "").slice(0, 100), company: String(b.company || "").slice(0, 80) });
  let aiNote = null;
  const cfgRaw = await store(env).get("cfg:ai");
  if (cfgRaw) {
    try { res = await tailorAIDoc(JSON.parse(cfgRaw), cvText, jd, res); }
    catch (e) { aiNote = "AI unavailable, used instant mode"; await store(env).put("log:aierr", String(e).slice(0, 300) + " @" + new Date().toISOString()); }
  }
  const style = docStyle(orig, meta.style && typeof meta.style === "object" ? meta.style : {});
  if (meta.source === "pdf" && meta.style && meta.style.colors) Object.assign(style, meta.style.colors);
  let region = REGION_FORMATS[b.region] ? b.region : orig.meta.region || "intl";
  const n1 = await bump(env, kE, 172800); if (kD) await bump(env, kD, 172800);
  if (PRELAUNCH_FREE > 0) { await bump(env, kPE); if (kPD) await bump(env, kPD); }
  await bump(env, kI, 172800);
  if (!(await store(env).get("lead:" + eh))) await store(env).put("lead:" + eh, JSON.stringify({ email, first: new Date().toISOString() }));
  await bump(env, "stat:tailorings");
  if (res.usage) { await store(env).put("stat:lastusage", JSON.stringify({ ...res.usage, at: new Date().toISOString() })); delete res.usage; }
  const jobId = crypto.randomUUID();
  const docHash = await sha(JSON.stringify(res.doc));
  await (await sql(env)).prepare("INSERT INTO jobs (id, email_hash, doc_hash, title, created) VALUES (?, ?, ?, ?, ?)").bind(jobId, eh, docHash, [res.job.title, res.job.company].filter(Boolean).join(" @ ").slice(0, 120), Date.now()).run();
  const coverFull = String(res.cover || "");
  await store(env).put("cover:" + jobId, JSON.stringify({ eh, t: coverFull }), { expirationTtl: 1209600 });
  const coverPaid = false;
  res.cover = coverPreview(coverFull);
  return json({ ...res, coverLocked: true, coverCost: CREDITS_PER_COVER, coverPaid, orig, style, jobId, region, country: orig.meta.country, regions: REGION_LABEL, regionFormats: REGION_FORMATS,
    formats: Object.fromEntries(Object.values(FORMATS).map(f => [f.id, { id: f.id, label: f.label, blurb: f.blurb }])),
    credits: await balanceOf(env, eh), aiNote, ms: Date.now() - t0, usedToday: n1, dailyFair: DAILY_FAIR, prelaunchFree: PRELAUNCH_FREE });
}
function coverPreview(t) { const paras = String(t).split(/\n\s*\n/); const head = paras.slice(0, 2).join("\n\n"); return head.length > 420 ? head.slice(0, 420).replace(/\s+\S*$/, "") + "…" : head + (paras.length > 2 ? "\n\n…" : ""); }
async function renderFormat(env, doc, fmt, preview) {
  await FitPDF.load(fontGet(env));
  const d = FitRender.render(doc, FORMATS[fmt].T, { preview });
  return d.bytes(fontGet(env));
}
function fileName(doc, fmt) { const n = String(doc && doc.name && doc.name.t || "CV").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40); return `${n || "CV"}_CV_${fmt}.pdf`; }

async function tailorAIDoc(cfg, cvText, jd, res) {
  // reuse the v1 AI writer, then map its bullets back into the structure (same count per role, or keep ours)
  const ex = res.doc.sections.find(s => s.kind === "experience");
  const entries = ex ? ex.blocks.filter(b => b.type === "entry") : [];
  const sum = res.doc.sections.find(s => s.kind === "summary");
  const sk = res.doc.sections.find(s => s.kind === "skills");
  const base = { job: res.job, matched: res.matched, missing: res.missing, cover: res.cover, changes: res.changes,
    tailored: { name: res.doc.name ? res.doc.name.t : "", headline: "", summary: sum ? sum.blocks.filter(b => b.type === "para").map(b => b.t).join(" ") : "", skills: sk ? sk.blocks.map(b => b.t) : [], experience: entries.map(e => ({ header: e.head.map(h => h.t), bullets: e.items.filter(i => i.type === "bullet").map(i => i.t) })) } };
  const out = await tailorAI(cfg, cvText, jd, base);
  entries.forEach((e, k) => { const nb = out.tailored.experience[k] && out.tailored.experience[k].bullets; const items = e.items.filter(i => i.type === "bullet"); if (nb && nb.length === items.length) items.forEach((it, j) => { if (nb[j] !== it.t) { it.o = it.o || it.t; it.t = nb[j]; it.changed = true; } }); });
  if (sum) { const paras = sum.blocks.filter(b => b.type === "para"); if (paras.length === 1 && out.tailored.summary && out.tailored.summary !== paras[0].t) { paras[0].o = paras[0].o || paras[0].t; paras[0].t = out.tailored.summary; paras[0].changed = true; } }
  return { ...res, mode: "ai", cover: out.cover, changes: out.changes, usage: out.usage };
}

async function routeV2(p, req, env) {
  const body = async () => req.json().catch(() => ({}));
  if (p === "/api/tailor" && req.method === "POST") return handleTailor2(req, env);
  if (p === "/api/preview" && req.method === "POST") {
    // watermarked, text-layer-free PDF; the page turns it into images, it is never offered as a download
    const b = await body(); const fmt = String(b.format || "");
    if (!FORMATS[fmt] || !b.doc || !b.doc.sections) return json({ error: "bad request" }, 400);
    const bytes = await renderFormat(env, b.doc, fmt, true);
    return new Response(bytes, { headers: { "content-type": "application/octet-stream", "cache-control": "no-store", "x-robots-tag": "noindex" } });
  }
  if (p === "/api/credits" && req.method === "POST") {
    const b = await body(); const email = String(b.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return json({ credits: 0 });
    return json({ credits: await balanceOf(env, await sha(email)), packs: CREDIT_PACKS, perFormat: CREDITS_PER_FORMAT, perCover: CREDITS_PER_COVER, autopilot: { bundles: AUTOPILOT_BUNDLES, dailyCap: AUTOPILOT_DAILY_CAP, validDays: AUTOPILOT_VALID_DAYS, live: false }, payments: PAYMENTS.live });
  }
  if (p === "/api/credits/buy" && req.method === "POST") {
    const b = await body(); const email = String(b.email || "").trim().toLowerCase(); const pack = CREDIT_PACKS[b.pack] ? b.pack : "starter";
    if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email." }, 400);
    const co = PAYMENTS.live ? await PAYMENTS.checkout(env, email, pack, new URL(req.url).origin) : null;
    if (co && co.url) return json({ ok: true, url: co.url });
    await store(env).put("ea:credits:" + (await sha(email)), JSON.stringify({ email, plan: "credits", pack, want: b.want || null, at: new Date().toISOString() }));
    await bump(env, "stat:ea");
    return json({ ok: true, live: false });
  }
  if (p === "/api/cover" && req.method === "POST") {
    const b = await body(); const email = String(b.email || "").trim().toLowerCase(); const jobId = String(b.jobId || "");
    if (!EMAIL_RE.test(email) || !jobId) return json({ error: "bad request" }, 400);
    const eh = await sha(email); const db = await sql(env);
    const raw = await store(env).get("cover:" + jobId); const c = raw ? JSON.parse(raw) : null;
    if (!c || c.eh !== eh) return json({ error: "This result has expired. Tailor again to get the cover letter." }, 409);
    const ref = "cover:" + jobId;
    const paid = await db.prepare("SELECT id FROM credit_ledger WHERE email_hash = ? AND ref = ? AND delta < 0").bind(eh, ref).first();
    if (!paid) {
      const r = await db.prepare("UPDATE credits SET balance = balance - ?, updated = ? WHERE email_hash = ? AND balance >= ?").bind(CREDITS_PER_COVER, Date.now(), eh, CREDITS_PER_COVER).run();
      if (!r.meta || !r.meta.changes) return json({ error: "no_credits", credits: await balanceOf(env, eh), need: CREDITS_PER_COVER }, 402);
      await db.prepare("INSERT INTO credit_ledger (email_hash, delta, reason, ref, created) VALUES (?, ?, 'cover', ?, ?)").bind(eh, -CREDITS_PER_COVER, ref, Date.now()).run();
    }
    return json({ cover: c.t, credits: await balanceOf(env, eh), charged: paid ? 0 : CREDITS_PER_COVER });
  }
  if (p === "/api/download" && req.method === "POST") {
    const b = await body(); const email = String(b.email || "").trim().toLowerCase(); const fmt = String(b.format || ""); const jobId = String(b.jobId || "");
    if (!EMAIL_RE.test(email) || !FORMATS[fmt] || !b.doc || !jobId) return json({ error: "bad request" }, 400);
    const eh = await sha(email); const db = await sql(env);
    const job = await db.prepare("SELECT doc_hash, email_hash FROM jobs WHERE id = ?").bind(jobId).first();
    if (!job || job.email_hash !== eh || job.doc_hash !== (await sha(JSON.stringify(b.doc)))) return json({ error: "This result has expired. Tailor again to download." }, 409);
    const ref = jobId + ":" + fmt;
    const paid = await db.prepare("SELECT id FROM credit_ledger WHERE email_hash = ? AND ref = ? AND delta < 0").bind(eh, ref).first();
    if (!paid) {
      const r = await db.prepare("UPDATE credits SET balance = balance - ?, updated = ? WHERE email_hash = ? AND balance >= ?").bind(CREDITS_PER_FORMAT, Date.now(), eh, CREDITS_PER_FORMAT).run();
      if (!r.meta || !r.meta.changes) return json({ error: "no_credits", credits: await balanceOf(env, eh), need: CREDITS_PER_FORMAT }, 402);
      await db.prepare("INSERT INTO credit_ledger (email_hash, delta, reason, ref, created) VALUES (?, ?, 'download', ?, ?)").bind(eh, -CREDITS_PER_FORMAT, ref, Date.now()).run();
    }
    const bytes = await renderFormat(env, b.doc, fmt, false);
    const left = await balanceOf(env, eh);
    const resp = pdfResp(bytes, fileName(b.doc, fmt)); resp.headers.set("x-credits-left", String(left)); resp.headers.set("x-charged", paid ? "0" : String(CREDITS_PER_FORMAT));
    return resp;
  }
  if (p === "/api/admin/credits" && req.method === "POST") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    const b = await body(); const email = String(b.email || "").trim().toLowerCase(); const n = parseInt(b.delta, 10);
    if (!EMAIL_RE.test(email) || !n) return json({ error: "need email and delta" }, 400);
    return json({ ok: true, balance: await grantCredits(env, email, n, "admin", String(b.note || "").slice(0, 80)) });
  }
  if (p === "/api/admin/purge" && req.method === "POST") {
    if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
    const b = await body(); const email = String(b.email || "").trim().toLowerCase(); const eh = await sha(email); const db = await sql(env);
    const out = {};
    for (const [t, q] of [["credits", "DELETE FROM credits WHERE email_hash = ?"], ["ledger", "DELETE FROM credit_ledger WHERE email_hash = ?"], ["jobs", "DELETE FROM jobs WHERE email_hash = ?"]]) out[t] = (await db.prepare(q).bind(eh).run()).meta.changes;
    let kv = 0; for (const pre of ["lead:" + eh, "ea:pro:" + eh, "ea:plus:" + eh, "ea:autopilot:" + eh, "ea:credits:" + eh, "q:e:" + eh, "sub:jobs:" + eh, "pl:e:" + eh]) { if (await store(env).get(pre)) { await store(env).delete(pre); kv++; } }
    const pre = "d:e:" + eh + ":"; const r = await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, ?) = ?").bind(pre.length, pre).run(); out.daily = r.meta.changes;
    out.covers = (await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, 6) = 'cover:' AND instr(v, ?) > 0").bind('"eh":"' + eh + '"').run()).meta.changes;
    out.contact = (await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, 8) = 'contact:' AND instr(v, ?) > 0").bind('"email":"' + email + '"').run()).meta.changes;
    out.kv = kv; return json({ ok: true, deleted: out });
  }
  return null;
}

// the app before the sign-in gate; gate.js routes every request here after its checks
const FW_MAIN = {
  async fetch(req, env, ctx) {
    const url = new URL(req.url); const p = url.pathname;
    if (p.startsWith("/j/")) { try { return await jobDetailPage(p, req, env); } catch (e) { return new Response("Something went wrong loading this job. Please refresh.", { status: 500 }); } }
    if (p === "/events" || p === "/events/" || p === "/conferences") { if (p === "/conferences") return Response.redirect(new URL("/events", req.url).toString(), 301); try { return await eventsPage("/events", req, env); } catch (e) { return new Response("Something went wrong loading this page. Please refresh.", { status: 500 }); } }
    if (p === "/jobs" || p.startsWith("/jobs/")) { try { return await jobsPage(p, env); } catch (e) { return new Response("Something went wrong loading the jobs list. Please refresh.", { status: 500 }); } }
    if (!p.startsWith("/api/")) {
      try { const sp = await sitePage(p, req, env); if (sp) return sp; } catch (e) {}
      const r = await env.ASSETS.fetch(req);
      if (r.status === 404 && req.method === "GET") return notFound(env, req);
      return r;
    }
    if (ctx && ctx.waitUntil) ctx.waitUntil(sweepExpired(env));
    try {
      const jr = await routeJobs(p, req, env, url); if (jr) return jr;
      const evr = await routeEvents(p, req, env, url); if (evr) return evr;
      const b1 = await routeBuild1(p, req, env, url); if (b1) return b1;
      const sr = await routeSite(p, req, env); if (sr) return sr;
      const v2 = await routeV2(p, req, env); if (v2) return v2;
      if (p === "/api/status") { const ccfg = await getCascadeConfig(env); const cs = publicCascadeStatus(ccfg); return json({ ok: true, ai: cs.ai_providers_configured.length > 0, ...cs, daily_fair: DAILY_FAIR, prelaunch_free: PRELAUNCH_FREE, version: 4 }); }
      if (p === "/api/usage" && req.method === "POST") {
        const b = await req.json().catch(() => ({})); const email = String(b.email || "").trim().toLowerCase();
        const u = Math.max(EMAIL_RE.test(email) ? await kvNum(env, "q:e:" + (await sha(email))) : 0, b.device ? await kvNum(env, "q:d:" + String(b.device).slice(0, 64)) : 0);
        return json({ used: u, limit: FREE_LIMIT });
      }
      if (p === "/api/tailor" && req.method === "POST") return await handleTailor(req, env);
      if (p === "/api/fetch-job" && req.method === "POST") {
        const b = await req.json().catch(() => ({}));
        try { const r = await fetchJob(String(b.url || "")); return json({ ...r, text: r.text.slice(0, 20000) }); }
        catch (e) { return json({ error: String(e.message || e) }, 422); }
      }
      if (p === "/api/early-access" && req.method === "POST") {
        const b = await req.json().catch(() => ({})); const email = String(b.email || "").trim().toLowerCase();
        if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email." }, 400);
        const plan = ["autopilot", "credits"].includes(b.plan) ? b.plan : "autopilot";
        const bundle = AUTOPILOT_BUNDLES[b.bundle] ? b.bundle : null;
        await store(env).put("ea:" + plan + ":" + (await sha(email)), JSON.stringify({ email, plan, bundle, at: new Date().toISOString() }));
        await bump(env, "stat:ea");
        return json({ ok: true });
      }
      if (p.startsWith("/api/admin/")) {
        if (!(await isAdmin(req))) return json({ error: "not allowed" }, 403);
        if (p === "/api/admin/ai" && req.method === "POST") {
          const b = await req.json();
          if (b.clear) { await store(env).delete("cfg:ai"); return json({ ok: true, ai: false }); }
          if (!b.key || !b.model) return json({ error: "need key and model" }, 400);
          await store(env).put("cfg:ai", JSON.stringify({ provider: b.provider === "anthropic" ? "anthropic" : "openai", base_url: b.base_url || "", model: b.model, key: b.key }));
          return json({ ok: true, ai: true, provider: b.provider || "openai", model: b.model });
        }
        if (p === "/api/admin/stats") {
          const list = async pre => { const out = []; let cur; do { const r = await store(env).list({ prefix: pre, cursor: cur }); for (const k of r.keys) out.push(JSON.parse((await store(env).get(k.name)) || "{}")); cur = r.list_complete ? null : r.cursor; } while (cur && out.length < 1000); return out; };
          return json({ apply_clicks: await jobClickStats(env), google_signups: await (async () => { try { const r = await (await usersDb(env)).prepare("SELECT COUNT(*) AS n FROM users").first(); return r ? r.n : 0; } catch (e) { return null; } })(), tailorings: await kvNum(env, "stat:tailorings"), early_access: await list("ea:"), users: await list("lead:"), last_ai_usage: JSON.parse((await store(env).get("stat:lastusage")) || "null"), last_ai_error: await store(env).get("log:aierr") });
        }
      }
      return json({ error: "not found" }, 404);
    } catch (e) { return json({ error: "Something went wrong on our side. Please try again." , detail: String(e).slice(0, 120) }, 500); }
  }
};

// ---------- Sign-in gate on every app page, first-party analytics, stored CVs, /account and /admin — added 1 Nov 2026 ----------
// Suresh (WhatsApp 1:09 PM 1 Nov 2026, m:61f07e1b): every tab behind Google sign-in, full analytics, an admin page for users, CVs, billing.
// Public: / (asset), /privacy, /terms, /about, /contact, /robots.txt, /sitemap.xml, favicon and static files. Everything else that is an app page needs a session.
const ADMIN_EMAILS_DEFAULT = ["reachparimi@gmail.com"];
const VID_COOKIE = "fw_vid";
const CV_RETENTION_DAYS = 90, EV_RAW_DAYS = 90, CV_MAX_BYTES = 10 * 1024 * 1024, CV_CHUNK = 900000, CV_PER_USER = 20;
const HIT_TYPES = ["pageview", "signin_start", "signin_fail", "inapp_hint", "open_browser", "copy_link"];
const GATED_API = ["/api/credits", "/api/cover", "/api/download"];
const REQ = new WeakMap();
function rid(n) { const b = new Uint8Array(n); crypto.getRandomValues(b); return [...b].map(x => (x % 36).toString(36)).join(""); }
function reqCtx(req, env, ctx) {
  const v = cookieOf(req, VID_COOKIE); const ok = !!v && /^[a-z0-9-]{16,40}$/.test(v);
  const c = { env, ctx, vid: ok ? v : rid(20), newVid: !ok, sess: undefined }; REQ.set(req, c); return c;
}
function amsDay(ts) { try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date(ts || Date.now())); } catch (e) { return new Date(ts || Date.now()).toISOString().slice(0, 10); } }
async function adminEmails(env) {
  try { const v = await store(env).get("cfg:admins"); if (v) { const a = JSON.parse(v); if (Array.isArray(a)) return [...new Set(ADMIN_EMAILS_DEFAULT.concat(a.map(x => String(x).toLowerCase())))]; } } catch (e) {}
  return ADMIN_EMAILS_DEFAULT;
}
// the signed-in user for this request (cached), or null. A valid x-admin-key header counts as an admin session (scripts, checks).
async function currentSession(req, env) {
  const c = REQ.get(req); if (c && c.sess !== undefined) return c.sess;
  let s = null;
  const k = req.headers.get("x-admin-key");
  if (k && (await sha(k)) === ADMIN_HASH) s = { sub: "adminkey", email: "admin-key@fitwise.invalid", name: "Admin key", test: true, admin: true, key: true, isAdmin: true };
  else {
    s = await sessionOf(req, env);
    if (s && !s.test) { const st = await store(env).get("ust:" + s.sub); if (st) s = null; }
    if (s) s.isAdmin = s.test ? !!s.admin : (await adminEmails(env)).includes(String(s.email || "").toLowerCase());
  }
  if (c) c.sess = s;
  return s;
}

// ---------- user agent ----------
function inAppName(ua) {
  if (/LinkedInApp/i.test(ua)) return "LinkedIn"; if (/FBAN|FBAV|FB_IAB|FBIOS/.test(ua)) return "Facebook"; if (/Instagram/.test(ua)) return "Instagram";
  if (/Twitter/i.test(ua)) return "X"; if (/\bLine\//.test(ua)) return "LINE"; if (/Snapchat/.test(ua)) return "Snapchat"; if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return "TikTok";
  if (/; wv\)/.test(ua)) return "an app"; return "";
}
function isBot(ua) { return !ua || /bot\b|bot\/|crawl|spider|slurp|preview|facebookexternalhit|WhatsApp|Slack|Discord|Telegram|curl|wget|python|node-fetch|undici|^node$|axios|Go-http|java\/|okhttp|HeadlessChrome|Lighthouse|PTST|monitor|libwww|httpclient|scrapy|Bytespider|Embedly|Pinterest|Applebot|bingpreview|Google-InspectionTool|GoogleOther|Chrome-Lighthouse|Headless|FitwiseCheck/i.test(ua); }
function uaInfo(ua) {
  ua = ua || "";
  const dev = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? "tablet" : /Mobi|iPhone|iPod|Android/i.test(ua) ? "mobile" : "desktop";
  const os = /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /CrOS/.test(ua) ? "ChromeOS" : /Mac OS X|Macintosh/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Other";
  const app = inAppName(ua);
  const br = app ? (app === "an app" ? "In-app browser" : app + " in-app") : /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /SamsungBrowser/.test(ua) ? "Samsung Internet" : /Firefox|FxiOS/.test(ua) ? "Firefox" : /CriOS|Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Other";
  return { dev, os, br, app };
}
function refHost(r, self) {
  if (r === null) return null; if (!r) return "(direct)";
  try { const x = new URL(r); if (x.host === self) return "(internal)"; if (x.protocol === "android-app:") return "app:" + x.host; return x.host.replace(/^www\./, "").slice(0, 80); } catch (e) { return "(other)"; }
}

// ---------- analytics store (D1) ----------
let _anaReady = false;
async function anaDb(env) {
  const db = env.DB;
  if (!_anaReady) {
    await usersDb(env);
    await db.batch([
      db.prepare("CREATE TABLE IF NOT EXISTS ev (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, day TEXT, vid TEXT, uid TEXT, type TEXT, path TEXT, ref TEXT, us TEXT, um TEXT, uc TEXT, dev TEXT, os TEXT, br TEXT, cc TEXT, obj TEXT, meta TEXT)"),
      db.prepare("CREATE INDEX IF NOT EXISTS ev_day_type ON ev (day, type)"),
      db.prepare("CREATE INDEX IF NOT EXISTS ev_uid ON ev (uid, ts)"),
      db.prepare("CREATE INDEX IF NOT EXISTS ev_vid ON ev (vid)"),
      db.prepare("CREATE TABLE IF NOT EXISTS ev_agg (day TEXT, type TEXT, dim TEXT, k TEXT, n INTEGER, PRIMARY KEY (day, type, dim, k))"),
      db.prepare("CREATE TABLE IF NOT EXISTS cvs (id TEXT PRIMARY KEY, sub TEXT, email TEXT, filename TEXT, mime TEXT, size INTEGER, source TEXT, job TEXT, chunks INTEGER, created INTEGER)"),
      db.prepare("CREATE INDEX IF NOT EXISTS cvs_sub ON cvs (sub, created)"),
      db.prepare("CREATE TABLE IF NOT EXISTS cv_chunks (cv_id TEXT, idx INTEGER, data BLOB, PRIMARY KEY (cv_id, idx))")
    ]);
    let have = [];
    try { have = ((await db.prepare("SELECT name FROM pragma_table_info('users')").all()).results || []).map(r => r.name); } catch (e) {}
    for (const col of ["first_src TEXT", "first_ref TEXT", "signup_path TEXT", "status TEXT"]) if (!have.includes(col.split(" ")[0])) { try { await db.prepare("ALTER TABLE users ADD COLUMN " + col).run(); } catch (e) {} }
    _anaReady = true;
  }
  return db;
}
function track(req, type, o) {
  const c = REQ.get(req); if (!c) return null;
  const p = recordEv(req, c, type, o || {}).catch(() => {});
  if (c.ctx && c.ctx.waitUntil) c.ctx.waitUntil(p);
  return p;
}
async function recordEv(req, c, type, o) {
  const env = c.env; const ua = req.headers.get("user-agent") || "";
  if (isBot(ua)) return;
  const s = o.sess !== undefined ? o.sess : await currentSession(req, env);
  if (s && (s.key || (s.isAdmin && !s.test))) return; // the admin key and the owner's own visits are not counted
  let u; try { u = new URL(o.url || req.url); } catch (e) { u = new URL(req.url); }
  const sp = u.searchParams, cut = (x, n) => (x == null || x === "") ? null : String(x).slice(0, n);
  const ref = refHost(o.ref !== undefined ? o.ref : (req.headers.get("referer") || ""), new URL(req.url).host);
  const ui = uaInfo(ua), now = Date.now();
  let cc = (req.cf && req.cf.country) || req.headers.get("cf-ipcountry") || null; if (cc === "XX" || cc === "T1") cc = null;
  await (await anaDb(env)).prepare("INSERT INTO ev (ts, day, vid, uid, type, path, ref, us, um, uc, dev, os, br, cc, obj, meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(now, amsDay(now), c.vid, s ? s.sub : null, type, cut(o.path || u.pathname, 160), ref, cut(sp.get("utm_source"), 60), cut(sp.get("utm_medium"), 60), cut(sp.get("utm_campaign"), 80), ui.dev, ui.os, ui.br, cc, cut(o.obj, 60), o.meta ? cut(typeof o.meta === "string" ? o.meta : JSON.stringify(o.meta), 300) : null).run();
}
const NOTEST = "(uid IS NULL OR uid NOT LIKE 'test:%') AND vid NOT LIKE 'zztest%'";

// ---------- housekeeping: roll raw events older than 90 days into daily counts, drop old CVs ----------
async function gateSweep(env) {
  try {
    const last = +(await store(env).get("sweep:gate") || 0); if (Date.now() - last < 3600e3) return;
    await store(env).put("sweep:gate", String(Date.now()));
    const db = await anaDb(env); const cut = amsDay(Date.now() - EV_RAW_DAYS * 864e5);
    const old = await db.prepare("SELECT COUNT(*) AS n FROM ev WHERE day < ?").bind(cut).first();
    if (old && old.n) {
      const ins = "INSERT INTO ev_agg (day, type, dim, k, n) ";
      const up = " ON CONFLICT(day, type, dim, k) DO UPDATE SET n = n + excluded.n";
      await db.batch([
        db.prepare(ins + "SELECT day, type, 'all', '', COUNT(*) FROM ev WHERE day < ? GROUP BY day, type" + up).bind(cut),
        db.prepare(ins + "SELECT day, 'visitors', 'all', '', COUNT(DISTINCT vid) FROM ev WHERE day < ? AND type = 'pageview' GROUP BY day" + up).bind(cut),
        ...["path", "ref", "us", "uc", "dev", "os", "br", "cc"].map(d => db.prepare(ins + `SELECT day, 'pageview', '${d}', COALESCE(${d}, ''), COUNT(*) FROM ev WHERE day < ? AND type = 'pageview' GROUP BY day, ${d}` + up).bind(cut)),
        db.prepare(ins + "SELECT day, 'apply_click', 'obj', COALESCE(obj, ''), COUNT(*) FROM ev WHERE day < ? AND type = 'apply_click' GROUP BY day, obj" + up).bind(cut),
        db.prepare("DELETE FROM ev WHERE day < ?").bind(cut)
      ]);
    }
    const cvCut = Date.now() - CV_RETENTION_DAYS * 864e5;
    const olds = (await db.prepare("SELECT id FROM cvs WHERE created < ? LIMIT 500").bind(cvCut).all()).results || [];
    for (const r of olds) await deleteCv(env, r.id);
  } catch (e) {}
}

// ---------- stored CVs ----------
async function deleteCv(env, id) { const db = await anaDb(env); await db.batch([db.prepare("DELETE FROM cv_chunks WHERE cv_id = ?").bind(id), db.prepare("DELETE FROM cvs WHERE id = ?").bind(id)]); }
async function deleteCvsOf(env, sub) { const db = await anaDb(env); const r = (await db.prepare("SELECT id FROM cvs WHERE sub = ?").bind(sub).all()).results || []; for (const x of r) await deleteCv(env, x.id); return r.length; }
async function storeCv(req, env, s) {
  const db = await anaDb(env);
  const buf = new Uint8Array(await req.arrayBuffer());
  if (!buf.length) return json({ error: "empty file" }, 400);
  if (buf.length > CV_MAX_BYTES) return json({ error: "file too large" }, 413);
  let name = "cv"; try { name = decodeURIComponent(req.headers.get("x-filename") || "cv"); } catch (e) {}
  name = name.replace(/[\\/\r\n"]+/g, "_").slice(0, 120) || "cv";
  const mime = String(req.headers.get("content-type") || "application/octet-stream").split(";")[0].slice(0, 100);
  let job = ""; try { job = decodeURIComponent(req.headers.get("x-job") || "").slice(0, 160); } catch (e) {}
  const id = crypto.randomUUID(); const n = Math.ceil(buf.length / CV_CHUNK);
  const st = [db.prepare("INSERT INTO cvs (id, sub, email, filename, mime, size, source, job, chunks, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, s.sub, s.email, name, mime, buf.length, String(req.headers.get("x-source") || "file").slice(0, 20), job, n, Date.now())];
  for (let i = 0; i < n; i++) st.push(db.prepare("INSERT INTO cv_chunks (cv_id, idx, data) VALUES (?, ?, ?)").bind(id, i, buf.slice(i * CV_CHUNK, (i + 1) * CV_CHUNK).buffer));
  await db.batch(st);
  const extra = (await db.prepare("SELECT id FROM cvs WHERE sub = ? ORDER BY created DESC LIMIT 100 OFFSET ?").bind(s.sub, CV_PER_USER).all()).results || [];
  for (const x of extra) await deleteCv(env, x.id);
  track(req, "cv_upload", { obj: id, meta: { size: buf.length, mime } });
  return json({ ok: true, id, retention_days: CV_RETENTION_DAYS });
}
async function cvResponse(env, id, download) {
  const db = await anaDb(env);
  const m = await db.prepare("SELECT * FROM cvs WHERE id = ?").bind(id).first(); if (!m) return null;
  const rows = (await db.prepare("SELECT data FROM cv_chunks WHERE cv_id = ? ORDER BY idx").bind(id).all()).results || [];
  const parts = rows.map(r => r.data instanceof ArrayBuffer ? new Uint8Array(r.data) : new Uint8Array(r.data || []));
  const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
  const safe = String(m.filename || "cv").replace(/[^\w.\- ]+/g, "_");
  const inlineOk = !download && /^(application\/pdf|text\/plain)$/.test(m.mime);
  return new Response(out, { headers: { "content-type": inlineOk ? m.mime + (m.mime === "text/plain" ? "; charset=utf-8" : "") : (m.mime || "application/octet-stream"), "content-disposition": `${inlineOk ? "inline" : "attachment"}; filename="${safe}"`, "cache-control": "private, no-store", "x-content-type-options": "nosniff", "content-security-policy": "sandbox" } });
}

// ---------- deleting a person ----------
async function purgeEmailData(env, email) {
  const eh = await sha(email); const db = await sql(env); const out = {};
  for (const [t, q] of [["credits", "DELETE FROM credits WHERE email_hash = ?"], ["ledger", "DELETE FROM credit_ledger WHERE email_hash = ?"], ["jobs", "DELETE FROM jobs WHERE email_hash = ?"]]) out[t] = (await db.prepare(q).bind(eh).run()).meta.changes;
  let kv = 0; for (const pre of ["lead:" + eh, "ea:pro:" + eh, "ea:plus:" + eh, "ea:autopilot:" + eh, "ea:credits:" + eh, "q:e:" + eh, "sub:jobs:" + eh, "pl:e:" + eh]) { if (await store(env).get(pre)) { await store(env).delete(pre); kv++; } }
  const pre = "d:e:" + eh + ":"; out.daily = (await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, ?) = ?").bind(pre.length, pre).run()).meta.changes;
  out.covers = (await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, 6) = 'cover:' AND instr(v, ?) > 0").bind('"eh":"' + eh + '"').run()).meta.changes;
  out.contact = (await env.DB.prepare("DELETE FROM kv WHERE substr(k, 1, 8) = 'contact:' AND instr(v, ?) > 0").bind('"email":"' + email + '"').run()).meta.changes;
  out.kv = kv; return out;
}
async function resetFree(env, sub, email) {
  let n = 0; const ks = ["pl:u:" + sub]; if (email) ks.push("pl:e:" + (await sha(email)));
  try { const d = JSON.parse((await store(env).get("udev:" + sub)) || "[]"); for (const x of d) ks.push("pl:d:" + x); } catch (e) {}
  for (const k of ks) if (await store(env).get(k)) { await store(env).delete(k); n++; }
  return n;
}
async function deleteUser(env, sub, why) {
  const db = await anaDb(env);
  const u = await db.prepare("SELECT email FROM users WHERE sub = ?").bind(sub).first();
  const out = { cvs: await deleteCvsOf(env, sub), free_reset: await resetFree(env, sub, u && u.email) };
  if (u && u.email) out.email_data = await purgeEmailData(env, u.email);
  const vids = ((await db.prepare("SELECT DISTINCT vid FROM ev WHERE uid = ?").bind(sub).all()).results || []).map(r => r.vid);
  let evn = (await db.prepare("DELETE FROM ev WHERE uid = ?").bind(sub).run()).meta.changes;
  for (const v of vids) evn += (await db.prepare("DELETE FROM ev WHERE vid = ?").bind(v).run()).meta.changes;
  out.events = evn;
  out.user = (await db.prepare("DELETE FROM users WHERE sub = ?").bind(sub).run()).meta.changes;
  await store(env).delete("udev:" + sub);
  await store(env).put("ust:" + sub, why || "deleted", { expirationTtl: 31 * 86400 }); // ends their open sessions
  return out;
}

// ---------- shared page bits ----------
function gEsc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
const NOSTORE = { "cache-control": "private, no-store", "vary": "Cookie" };
async function privateResp(res, s, extraHead) {
  const ct = res.headers.get("content-type") || "";
  if (!/text\/html/.test(ct)) { const r = new Response(res.body, res); for (const [k, v] of Object.entries(NOSTORE)) r.headers.set(k, v); r.headers.set("x-fitwise-gate", "0"); return r; }
  let html = await res.text();
  if (s) html = html.replace("</header>", "</header>" + acctStrip(s));
  if (extraHead) html = html.replace("</head>", extraHead + "</head>");
  const h = new Headers(res.headers); for (const [k, v] of Object.entries(NOSTORE)) h.set(k, v); h.set("x-fitwise-gate", s ? "0" : "1"); h.delete("content-length");
  return new Response(html, { status: res.status, headers: h });
}
function acctStrip(s) {
  const who = s.key ? "Admin key" : (s.email || "");
  return `<div class="fwacct"><style>.fwacct{display:flex;justify-content:flex-end;align-items:center;gap:12px;flex-wrap:wrap;max-width:1100px;margin:0 auto;padding:6px 16px 0;font-size:.8rem;color:var(--mut,#5c6370)}.fwacct a,.fwacct button{all:unset;cursor:pointer;color:var(--g,#0b6b58);font-weight:650}.fwacct a:hover,.fwacct button:hover{text-decoration:underline}.fwacct .em{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:60vw}</style><span class="em">Signed in as ${gEsc(who)}</span>${s.isAdmin && !s.key ? '<a href="/admin">Admin</a>' : ""}<a href="/account">Your data</a><button type="button" data-signout>Sign out</button></div>`;
}
const GATE_CSS = `<style>
.gw{max-width:980px;margin:0 auto;padding:30px 16px 56px;display:grid;grid-template-columns:1.1fr .9fr;gap:22px;align-items:start}
.gw .tz,.gw .sg{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px}
.gw .tz .co{color:var(--g);font-weight:700;margin:0 0 4px;font-size:.95rem}.gw .tz h1{font-size:1.6rem;line-height:1.2;margin:.1em 0 .4em}
.gw .tz p{color:var(--mut);margin:.3em 0}.gw .tz ul{margin:.8em 0 0;padding-left:1.1em}.gw .tz li{margin:.35em 0}
.gw .meta{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.gw .meta span{font-size:.8rem;font-weight:650;border-radius:8px;padding:3px 9px;background:#f4f2ec;border:1px solid var(--line)}
.gw .meta .vz{background:#e3f4ed;color:var(--g);border-color:#9fd3c0}
.gw .lock{margin-top:14px;border:1px dashed var(--line);border-radius:12px;padding:12px;color:var(--mut);font-size:.9rem;display:flex;gap:8px;align-items:center}
.gw .sg{text-align:center;position:sticky;top:16px}.gw .sg h2{font-size:1.2rem;margin:0 0 6px;text-align:center}.gw .sg p{color:var(--mut);font-size:.92rem;margin:0 0 14px}
.gw .gbtn{display:flex;justify-content:center;min-height:44px}.gw .err{color:#a33;font-size:.85rem;margin:10px 0 0;min-height:1em}
.gw .fine{font-size:.76rem;color:var(--mut);margin:14px 0 0}.gw .fine a{color:inherit}
@media(max-width:760px){.gw{grid-template-columns:1fr;padding-top:14px;gap:12px}.gw .sg{position:static}.gw .tz{padding:16px 18px}.gw .tz ul,.gw .tz .lock{display:none}.gw .tz h1{font-size:1.35rem;margin-bottom:.2em}.gw .tz p{font-size:.9rem}}
</style>`;
function inAppBox(app, req) {
  const u = new URL(req.url); const ua = req.headers.get("user-agent") || "";
  const android = /Android/i.test(ua);
  const intent = `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.android.chrome;end`;
  return `<style>.iab{background:#fff8e6;border:1px solid #f0d9a0;border-radius:14px;padding:14px;margin:0 0 16px;text-align:left;font-size:.9rem}.iab b{display:block;margin-bottom:4px}.iab ol{margin:6px 0 10px;padding-left:1.2em}.iab .row{display:flex;gap:8px;flex-wrap:wrap}.iab .btn{font-size:.85rem;padding:9px 13px}</style><div class="iab" id="fwIab" data-app="${gEsc(app)}"><b>Open this page in your browser to sign in</b>
Google doesn't allow sign-in inside ${app === "an app" ? "in-app browsers" : "the " + gEsc(app) + " app's browser"}. ${android ? "Tap the button below, or tap ⋮ (top right) and choose <i>Open in browser</i>." : "Tap ⋯ (top right) and choose <i>Open in browser</i> (or <i>Open in Safari</i>)."}
<div class="row" style="margin-top:10px">${android ? `<a class="btn" href="${gEsc(intent)}" data-ev="open_browser">Open in Chrome</a>` : ""}<button type="button" class="btn ghost" data-copylink>Copy link</button></div></div>`;
}
// the sign-in screen shown instead of a gated page
function gateResp(req, env, clientId, o) {
  const ua = req.headers.get("user-agent") || ""; const app = inAppName(ua);
  const og = o.og || {};
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${gEsc(og.title || o.h1)}</title>
<meta name="description" content="${gEsc(og.desc || o.lead || "")}">
${og.canon ? `<link rel="canonical" href="${gEsc(og.canon)}"><meta property="og:url" content="${gEsc(og.canon)}">` : ""}
<meta property="og:type" content="website"><meta property="og:site_name" content="Fitwise"><meta property="og:title" content="${gEsc(og.title || o.h1)}"><meta property="og:description" content="${gEsc(og.desc || o.lead || "")}"><meta property="og:image" content="${JOBS_SITE}/${og.image || "og.png"}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${gEsc(og.title || o.h1)}"><meta name="twitter:image" content="${JOBS_SITE}/${og.image || "og.png"}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css"><meta name="theme-color" content="#0b6b58">
${GATE_CSS}
</head><body class="gated" data-gate="1">
<a class="skip" href="#main">Skip to content</a>
${SITE_HEADER}
<main id="main"><div class="gw">
<section class="tz">${o.eyebrow ? `<p class="co">${gEsc(o.eyebrow)}</p>` : ""}<h1>${gEsc(o.h1)}</h1>${o.teaser || ""}${o.lead ? `<p>${gEsc(o.lead)}</p>` : ""}
${o.bullets && o.bullets.length ? `<ul>${o.bullets.map(b => `<li>${gEsc(b)}</li>`).join("")}</ul>` : ""}
<div class="lock">🔒 <span>${gEsc(o.lock || "Free with Google sign-in. Takes a few seconds.")}</span></div></section>
<aside class="sg" aria-label="Sign in">
${app ? inAppBox(app, req) : ""}
<h2>${gEsc(o.cta || "Sign in with Google to continue")}</h2>
<p>Free. One tap with your Google account. You'll come straight back to this page.</p>
<div class="gbtn" id="gBtn"><noscript>Turn on JavaScript to sign in with Google.</noscript></div>
<div class="err" id="gErr" role="alert"></div>
<p class="fine">We store your Google email and name to create your free Fitwise account, and keep first-party usage statistics (pages visited, how you arrived). No password, nothing is posted. <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>
</aside></div></main>
${SITE_FOOTER}
<script>window.FW_GCID=${JSON.stringify(clientId)};</script>
<script src="https://accounts.google.com/gsi/client" async defer onload="window.fwGsiReady&&window.fwGsiReady()"></script>
</body></html>`;
  track(req, "gate_shown", { obj: o.obj || null, meta: o.kind ? { page: o.kind } : null });
  if (app) track(req, "inapp_hint", { meta: { app } });
  return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8", ...NOSTORE, "x-fitwise-gate": "1", "x-robots-tag": "noindex" } });
}
const CC_NAMES = { NL: "Netherlands", DE: "Germany", BE: "Belgium", PT: "Portugal", FR: "France", ES: "Spain", IE: "Ireland", AT: "Austria", CH: "Switzerland", DK: "Denmark", SE: "Sweden", PL: "Poland", LU: "Luxembourg", IT: "Italy", FI: "Finland", NO: "Norway", CZ: "Czechia", GB: "United Kingdom", UK: "United Kingdom" };
async function gateFor(p, req, env) {
  const cid = await googleClientId(env); const u = new URL(req.url);
  const m = p.match(/^\/j\/([A-Za-z0-9]{1,16})\/?$/);
  if (m) {
    const j = await getJobById(env, m[1].toLowerCase());
    if (!j) return jobNotFoundHTML();
    const { city, country } = jobPlaceParts(j); const place = [city, country].filter(Boolean).join(", ");
    return gateResp(req, env, cid, { kind: "job", obj: j.id, eyebrow: j.company, h1: j.title, cta: "Sign in with Google to see the job and apply",
      teaser: `<div class="meta">${place ? `<span>📍 ${gEsc(place)}</span>` : ""}${j.remote ? `<span>${gEsc(j.remote)}</span>` : ""}${j.visa ? '<span class="vz">Visa sponsorship: Yes ✅</span>' : ""}</div>`,
      bullets: ["The full job details and the Apply button", "Tailor your CV to this exact job in about 30 seconds", "Today's full list of English-speaking tech jobs in Europe"],
      lock: "The Apply link and job details open after you sign in. Free.",
      og: { title: `${j.title} at ${j.company}${city || country ? " · " + (city || country) : ""}`, desc: `${j.title} at ${j.company}${place ? " in " + place : ""}. Visa sponsorship: ${j.visa ? "Yes ✅" : "not stated"}. See the job and apply on Fitwise.`, canon: `${JOBS_SITE}/j/${j.id}`, image: "og-jobs.png" } });
  }
  if (p === "/jobs" || p.startsWith("/jobs/")) {
    let f = null; try { const dm = p.match(/^\/jobs\/(\d{4}-\d{2}-\d{2})/); f = await getFeed(env, dm ? dm[1] : null); } catch (e) {}
    const n = f ? f.jobs.length : 0, v = f ? f.jobs.filter(x => x.visa).length : 0;
    return gateResp(req, env, cid, { kind: "jobs", eyebrow: "Daily jobs in Europe", h1: n ? `${n} English-speaking tech jobs in Europe${f.date ? " · " + prettyDate(f.date) : ""}` : "English-speaking tech jobs in Europe, every morning",
      teaser: n ? `<div class="meta"><span class="vz">${v} with visa sponsorship ✅</span><span>Updated every morning</span></div>` : "",
      bullets: ["Every job with its location, work mode and visa-sponsorship evidence", "Filters by country, remote/hybrid and field", "One tap to apply, or tailor your CV to the job first"],
      cta: "Sign in with Google to see today's jobs", og: { title: "Daily English-speaking tech jobs in Europe · Fitwise", desc: "A fresh list every morning, visa-sponsored roles first. Free with Google sign-in.", canon: JOBS_SITE + "/jobs", image: "og-jobs.png" } });
  }
  if (p === "/tailor") {
    const t = (u.searchParams.get("title") || "").slice(0, 100), c = (u.searchParams.get("company") || "").slice(0, 80);
    return gateResp(req, env, cid, { kind: "tailor", eyebrow: t ? "Tailor your CV for" : "Tailor your CV", h1: t ? `${t}${c ? " at " + c : ""}` : "Tailor your CV to a job in about 30 seconds",
      bullets: ["Your CV back in its own format, most relevant experience first", "A match score and the keywords you're missing", "Nothing invented: only facts already in your CV"],
      lead: "Pre-launch: 1 free tailoring per person.", cta: "Sign in with Google to tailor your CV", og: { title: "Tailor your CV to a job · Fitwise", desc: "Upload your CV and a job ad. Get your CV back in its own format, a match score and missing keywords.", canon: JOBS_SITE + "/tailor" } });
  }
  if (p === "/pricing") return gateResp(req, env, cid, { kind: "pricing", eyebrow: "Pricing", h1: "Free to try. Prepaid credits for extras.", bullets: ["See what's free and what credits unlock", "No subscription"], cta: "Sign in with Google to see pricing", og: { title: "Pricing · Fitwise", desc: "Free to try. Prepaid credits for extra formats and cover letters.", canon: JOBS_SITE + "/pricing" } });
  if (p === "/account") return gateResp(req, env, cid, { kind: "account", h1: "Your Fitwise account", bullets: ["See and delete the CVs you uploaded", "Delete your account and data"], cta: "Sign in with Google to see your data" });
  return null;
}

// ---------- /account ----------
function accountHTML(s) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Your data · Fitwise</title><meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css"><style>.acw{max-width:760px;margin:0 auto;padding:26px 16px 56px}.acw .c{background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;margin:0 0 14px}.acw h1{font-size:1.5rem}.acw h2{font-size:1.1rem;text-align:left;margin:0 0 8px}.acw table{width:100%;border-collapse:collapse;font-size:.88rem}.acw td{padding:7px 4px;border-bottom:1px solid var(--line)}.acw td:last-child{text-align:right;white-space:nowrap}.acw button.l{all:unset;cursor:pointer;color:var(--g);font-weight:650;margin-left:10px}.acw .danger{background:#a33}.acw .muted{color:var(--mut);font-size:.88rem}</style></head><body>
${SITE_HEADER}<main id="main"><div class="acw"><h1>Your data</h1>
<div class="c"><h2>Account</h2><p>Signed in with Google as <b>${gEsc(s.email)}</b>${s.name ? " (" + gEsc(s.name) + ")" : ""}.</p></div>
<div class="c"><h2>CVs you uploaded</h2><p class="muted">Fitwise keeps the CV you tailor for ${CV_RETENTION_DAYS} days, then deletes it automatically. You can delete it now.</p><div id="cvl">Loading…</div><p><button class="btn ghost" id="cvall" type="button">Delete all my stored CVs</button></p></div>
<div class="c"><h2>Delete my account</h2><p class="muted">Deletes your Fitwise account, stored CVs, credits and history, tailoring records and usage records, and signs you out. This can't be undone.</p><button class="btn danger" id="del" type="button">Delete my account and data</button><p class="err" id="derr"></p></div>
<p class="muted">Questions or a data request: <a href="/contact">contact us</a>. <a href="/privacy">Privacy policy</a></p>
</div></main>${SITE_FOOTER}
<script>(function(){var $=function(i){return document.getElementById(i)};var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
function load(){fetch("/api/my/cvs",{credentials:"same-origin"}).then(function(r){return r.json()}).then(function(j){var l=j.cvs||[];$("cvl").innerHTML=l.length?"<table>"+l.map(function(c){return "<tr><td>"+esc(c.filename)+"<br><span class=muted>"+new Date(c.created).toLocaleString()+" · "+Math.max(1,Math.round(c.size/1024))+" KB"+(c.job?" · "+esc(c.job):"")+"</span></td><td><a href=\\"/api/my/cv?id="+c.id+"\\">Download</a><button class=l data-d=\\""+c.id+"\\">Delete</button></td></tr>"}).join("")+"</table>":"<p class=muted>No CVs stored.</p>";document.querySelectorAll("[data-d]").forEach(function(b){b.onclick=function(){fetch("/api/my/cv",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({delete:b.getAttribute("data-d")})}).then(load)}})}).catch(function(){$("cvl").textContent="Could not load."})}
load();$("cvall").onclick=function(){if(!confirm("Delete all your stored CVs?"))return;fetch("/api/my/cv",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({delete:"all"})}).then(load)};
$("del").onclick=function(){if(!confirm("Delete your Fitwise account and all its data? This can't be undone."))return;fetch("/api/my/delete-account",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({confirm:true})}).then(function(r){return r.json()}).then(function(j){if(j.ok){try{google.accounts.id.disableAutoSelect()}catch(e){}location.href="/"}else $("derr").textContent=j.error||"Try again."})};})();</script>
</body></html>`;
}

// ---------- admin APIs (admin Google session or x-admin-key; anyone else gets 404) ----------
function csvResp(rows, cols, name) {
  const q = v => { const s = v == null ? "" : String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const body = [cols.join(",")].concat(rows.map(r => cols.map(c => q(r[c])).join(","))).join("\n") + "\n";
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}"`, "cache-control": "private, no-store" } });
}
async function adminOverview(env, days) {
  const db = await anaDb(env); await sql(env);
  const since = amsDay(Date.now() - (days - 1) * 864e5); const sinceTs = Date.now() - days * 864e5;
  const W = `day >= ? AND ${NOTEST}`;
  const all = async (q, ...b) => ((await db.prepare(q).bind(...b).all()).results || []);
  const one = async (q, ...b) => (await db.prepare(q).bind(...b).first()) || {};
  const daily = await all(`SELECT day, COUNT(*) AS pv, COUNT(DISTINCT vid) AS v FROM ev WHERE type = 'pageview' AND ${W} GROUP BY day ORDER BY day`, since);
  const sud = await all("SELECT created FROM users WHERE created >= ?", sinceTs);
  const su = {}; sud.forEach(r => { const d = amsDay(r.created); su[d] = (su[d] || 0) + 1; });
  const fsteps = [["Visited", "pageview"], ["Saw the sign-in screen", "gate_shown"], ["Started Google sign-in", "signin_start"], ["Signed in", "signin_ok"], ["Viewed a job", "job_view"], ["Clicked Apply", "apply_click"], ["Started a tailoring", "tailor_start"], ["Finished a tailoring", "tailor_done"]];
  const fr = await all(`SELECT type, COUNT(DISTINCT vid) AS n FROM ev WHERE ${W} GROUP BY type`, since); const fm = {}; fr.forEach(r => fm[r.type] = r.n);
  const tot = await one(`SELECT COUNT(*) AS pv, COUNT(DISTINCT vid) AS v FROM ev WHERE type = 'pageview' AND ${W}`, since);
  const act = await one(`SELECT COUNT(DISTINCT uid) AS n FROM ev WHERE uid IS NOT NULL AND ${W}`, since);
  const users = await one("SELECT COUNT(*) AS n FROM users");
  const grp = (dim, type, lim, extra) => all(`SELECT COALESCE(${dim}, '(unknown)') AS k, COUNT(*) AS n, COUNT(DISTINCT vid) AS v FROM ev WHERE type = '${type}' AND ${W} ${extra || ""} GROUP BY ${dim} ORDER BY v DESC, n DESC LIMIT ${lim}`, since);
  return {
    days, since, generated: new Date().toISOString(),
    totals: { pageviews: tot.pv || 0, visitors: tot.v || 0, signups: sud.length, users_total: users.n || 0, active_users: act.n || 0 },
    daily: daily.map(r => ({ ...r, signups: su[r.day] || 0 })).concat(Object.keys(su).filter(d => !daily.some(r => r.day === d)).map(d => ({ day: d, pv: 0, v: 0, signups: su[d] }))).sort((a, b) => a.day < b.day ? -1 : 1),
    funnel: fsteps.map(([l, t]) => ({ step: l, type: t, visitors: fm[t] || 0 })),
    events: (await all(`SELECT type, COUNT(*) AS n FROM ev WHERE ${W} GROUP BY type ORDER BY n DESC`, since)),
    referrers: await grp("ref", "pageview", 15, "AND ref NOT IN ('(internal)')"),
    campaigns: await all(`SELECT COALESCE(us, '') AS source, COALESCE(um, '') AS medium, COALESCE(uc, '') AS campaign, COUNT(*) AS n, COUNT(DISTINCT vid) AS v FROM ev WHERE type = 'pageview' AND us IS NOT NULL AND ${W} GROUP BY us, um, uc ORDER BY v DESC LIMIT 20`, since),
    pages: await grp("path", "pageview", 20),
    jobs: await all(`SELECT obj AS id, MAX(meta) AS job, COUNT(*) AS clicks, COUNT(DISTINCT vid) AS v FROM ev WHERE type = 'apply_click' AND ${W} GROUP BY obj ORDER BY clicks DESC LIMIT 20`, since),
    job_views: await all(`SELECT obj AS id, MAX(meta) AS job, COUNT(*) AS views FROM ev WHERE type = 'job_view' AND ${W} GROUP BY obj ORDER BY views DESC LIMIT 20`, since),
    devices: await grp("dev", "pageview", 5), os: await grp("os", "pageview", 8), browsers: await grp("br", "pageview", 10), countries: await grp("cc", "pageview", 20),
    apply_clicks_all_time: await jobClickStats(env).then(x => x.total).catch(() => null)
  };
}
async function adminUsers(env, q) {
  const db = await anaDb(env); await sql(env);
  const like = "%" + String(q || "").toLowerCase() + "%";
  const r = (await db.prepare(`SELECT u.sub, u.email, u.name, u.source, u.signup_path, u.first_src, u.first_ref, u.created, u.last_login, u.logins, u.status,
    (SELECT MAX(ts) FROM ev WHERE uid = u.sub) AS last_seen, (SELECT COUNT(*) FROM ev WHERE uid = u.sub AND type = 'tailor_done') AS tailor_events,
    (SELECT COUNT(*) FROM cvs WHERE sub = u.sub) AS cvs, (SELECT balance FROM credits c WHERE c.email = u.email) AS credits
    FROM users u WHERE (? = '%%' OR lower(u.email) LIKE ? OR lower(u.name) LIKE ?) ORDER BY u.created DESC LIMIT 1000`).bind(like, like, like).all()).results || [];
  const tj = {}; ((await db.prepare("SELECT email_hash, COUNT(*) AS n FROM jobs GROUP BY email_hash").all()).results || []).forEach(x => tj[x.email_hash] = x.n);
  const admins = await adminEmails(env);
  for (const u of r) { u.tailorings = tj[await sha(String(u.email || "").toLowerCase())] || 0; u.admin = admins.includes(String(u.email).toLowerCase()); u.free_used = await kvNum(env, "pl:u:" + u.sub); }
  return r;
}
async function routeAdmin(p, req, env, url) {
  const body = async () => req.json().catch(() => ({}));
  if (p === "/api/admin/overview") { const d = Math.min(365, Math.max(1, parseInt(url.searchParams.get("days") || "30", 10) || 30)); return json(await adminOverview(env, d)); }
  if (p === "/api/admin/users") return json({ users: await adminUsers(env, url.searchParams.get("q")) });
  if (p === "/api/admin/user" && req.method === "GET") {
    const sub = String(url.searchParams.get("sub") || ""); const db = await anaDb(env); await sql(env);
    const u = await db.prepare("SELECT * FROM users WHERE sub = ?").bind(sub).first(); if (!u) return json({ error: "no such user" }, 404);
    const eh = await sha(String(u.email).toLowerCase());
    const tl = (await db.prepare(`SELECT ts, type, path, ref, us, um, uc, dev, os, br, cc, obj, meta, uid IS NOT NULL AS signed FROM ev WHERE uid = ? OR vid IN (SELECT DISTINCT vid FROM ev WHERE uid = ?) ORDER BY ts DESC LIMIT 300`).bind(sub, sub).all()).results || [];
    const led = (await db.prepare("SELECT delta, reason, ref, created FROM credit_ledger WHERE email_hash = ? ORDER BY created DESC LIMIT 100").bind(eh).all()).results || [];
    const cv = (await db.prepare("SELECT id, filename, mime, size, source, job, created FROM cvs WHERE sub = ? ORDER BY created DESC").bind(sub).all()).results || [];
    const tj = (await db.prepare("SELECT title, created FROM jobs WHERE email_hash = ? ORDER BY created DESC LIMIT 50").bind(eh).all()).results || [];
    return json({ user: u, credits: await balanceOf(env, eh), ledger: led, cvs: cv, tailorings: tj, free_used: await kvNum(env, "pl:u:" + sub), timeline: tl });
  }
  if (p === "/api/admin/user" && req.method === "POST") {
    const b = await body(); const sub = String(b.sub || ""); const db = await anaDb(env);
    const u = await db.prepare("SELECT sub, email FROM users WHERE sub = ?").bind(sub).first(); if (!u) return json({ error: "no such user" }, 404);
    if (b.action === "grant") { const n = parseInt(b.delta, 10); if (!n || Math.abs(n) > 1000) return json({ error: "delta 1..1000 (negative to remove)" }, 400); return json({ ok: true, balance: await grantCredits(env, u.email, n, "admin", String(b.note || "admin page").slice(0, 80)) }); }
    if (b.action === "reset_free") return json({ ok: true, cleared: await resetFree(env, sub, u.email) });
    if (b.action === "block") { await db.prepare("UPDATE users SET status = 'blocked' WHERE sub = ?").bind(sub).run(); await store(env).put("ust:" + sub, "blocked"); return json({ ok: true, status: "blocked" }); }
    if (b.action === "unblock") { await db.prepare("UPDATE users SET status = NULL WHERE sub = ?").bind(sub).run(); await store(env).delete("ust:" + sub); return json({ ok: true, status: "active" }); }
    if (b.action === "delete") { if (b.confirm !== u.email) return json({ error: "confirm with the user's email" }, 400); return json({ ok: true, deleted: await deleteUser(env, sub, "deleted") }); }
    return json({ error: "unknown action" }, 400);
  }
  if (p === "/api/admin/cvs" && req.method === "GET") {
    const db = await anaDb(env); const like = "%" + String(url.searchParams.get("q") || "").toLowerCase() + "%";
    const r = (await db.prepare("SELECT c.id, c.sub, c.email, u.name, c.filename, c.mime, c.size, c.source, c.job, c.created FROM cvs c LEFT JOIN users u ON u.sub = c.sub WHERE (? = '%%' OR lower(c.email) LIKE ? OR lower(c.filename) LIKE ?) ORDER BY c.created DESC LIMIT 1000").bind(like, like, like).all()).results || [];
    const t = await db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(size), 0) AS bytes FROM cvs").first();
    return json({ count: t.n, bytes: t.bytes, retention_days: CV_RETENTION_DAYS, cvs: r });
  }
  if (p === "/api/admin/cv" && req.method === "GET") { const r = await cvResponse(env, String(url.searchParams.get("id") || ""), url.searchParams.get("dl") === "1"); return r || json({ error: "not found" }, 404); }
  if (p === "/api/admin/cv" && req.method === "POST") { const b = await body(); if (!b.delete) return json({ error: "need delete" }, 400); await deleteCv(env, String(b.delete)); return json({ ok: true }); }
  if (p === "/api/admin/billing") {
    const db = await sql(env); const all = async q => ((await db.prepare(q).all()).results || []);
    const bal = await all("SELECT email, balance, updated FROM credits ORDER BY balance DESC LIMIT 500");
    const led = await all("SELECT l.delta, l.reason, l.ref, l.created, c.email FROM credit_ledger l LEFT JOIN credits c ON c.email_hash = l.email_hash ORDER BY l.created DESC LIMIT 300");
    const byReason = await all("SELECT reason, COUNT(*) AS rows, SUM(delta) AS credits FROM credit_ledger GROUP BY reason ORDER BY rows DESC");
    const ea = []; for (const pre of ["ea:credits:", "ea:autopilot:"]) { const r = await store(env).list({ prefix: pre }); for (const k of r.keys) { try { const v = JSON.parse((await store(env).get(k.name)) || "{}"); ea.push({ list: pre.slice(3, -1), email: v.email, pack: v.pack || v.bundle || "", at: v.at }); } catch (e) {} } }
    return json({ payments_live: PAYMENTS.live, provider: null, balances: bal, credits_outstanding: bal.reduce((a, r) => a + (r.balance || 0), 0), ledger: led, by_reason: byReason, interest: ea, packs: CREDIT_PACKS, per_format: CREDITS_PER_FORMAT, per_cover: CREDITS_PER_COVER });
  }
  if (p === "/api/admin/content") {
    const d = await eventsData(env); const up = d ? evUpcoming(d) : [];
    const dates = await feedDates(env).catch(() => []); const feeds = [];
    for (const dt of dates.slice(0, 7)) { try { const raw = await store(env).get("jobs:feed:" + dt); const f = raw ? JSON.parse(raw) : null; feeds.push({ date: dt, count: f ? f.jobs.length : 0, visa: f ? f.jobs.filter(j => j.visa).length : 0, pushed: f && f.updated || null, window: f && f.window || "" }); } catch (e) {} }
    const subs = (await store(env).list({ prefix: "sub:jobs:" })).keys.length; const contact = (await store(env).list({ prefix: "contact:" })).keys.length;
    return json({ events: { stored: d ? d.events.length : 0, upcoming: up.length, cfp_open: up.filter(evCfpOpen).length, generated_at: d && d.generated_at || null, pushed_at: d && d.pushed_at || null }, jobs: { latest: await store(env).get("jobs:latest"), feeds, subscribers: subs }, contact_messages: contact, ai_mode: !!(await store(env).get("cfg:ai")) });
  }
  if (p === "/api/admin/export/users.csv") return csvResp((await adminUsers(env, "")).map(u => ({ ...u, created: u.created && new Date(u.created).toISOString(), last_login: u.last_login && new Date(u.last_login).toISOString(), last_seen: u.last_seen && new Date(u.last_seen).toISOString() })), ["email", "name", "created", "last_login", "last_seen", "logins", "tailorings", "free_used", "credits", "cvs", "status", "signup_path", "first_src", "first_ref", "admin"], "fitwise-users-" + amsDay() + ".csv");
  if (p === "/api/admin/export/events.csv") {
    const d = Math.min(365, Math.max(1, parseInt(url.searchParams.get("days") || "30", 10) || 30)); const db = await anaDb(env);
    const r = (await db.prepare(`SELECT e.ts, e.day, e.type, e.path, e.ref, e.us, e.um, e.uc, e.dev, e.os, e.br, e.cc, e.obj, e.meta, e.vid, e.uid, u.email FROM ev e LEFT JOIN users u ON u.sub = e.uid WHERE e.day >= ? AND (? = 1 OR ((e.uid IS NULL OR e.uid NOT LIKE 'test:%') AND e.vid NOT LIKE 'zztest%')) ORDER BY e.ts DESC LIMIT 50000`).bind(amsDay(Date.now() - (d - 1) * 864e5), url.searchParams.get("include_test") === "1" ? 1 : 0).all()).results || [];
    return csvResp(r.map(x => ({ ...x, time: new Date(x.ts).toISOString() })), ["time", "day", "type", "path", "ref", "us", "um", "uc", "dev", "os", "br", "cc", "obj", "meta", "vid", "email", "uid"], "fitwise-events-" + amsDay() + ".csv");
  }
  if (p === "/api/admin/admins") {
    if (req.method === "POST") { const b = await body(); let a = []; try { a = JSON.parse((await store(env).get("cfg:admins")) || "[]"); } catch (e) {} const e = String(b.add || b.remove || "").toLowerCase(); if (!EMAIL_RE.test(e)) return json({ error: "need add or remove email" }, 400); a = b.add ? [...new Set(a.concat(e))] : a.filter(x => x !== e); await store(env).put("cfg:admins", JSON.stringify(a)); }
    return json({ admins: await adminEmails(env), fixed: ADMIN_EMAILS_DEFAULT });
  }
  if (p === "/api/admin/purge-test" && req.method === "POST") {
    const db = await anaDb(env); const out = {};
    const subs = ((await db.prepare("SELECT DISTINCT sub FROM cvs WHERE sub LIKE 'test:%'").all()).results || []).map(r => r.sub);
    out.cvs = 0; for (const s of subs) out.cvs += await deleteCvsOf(env, s);
    out.events = (await db.prepare("DELETE FROM ev WHERE uid LIKE 'test:%' OR vid LIKE 'zztest%' OR vid IN (SELECT DISTINCT vid FROM ev WHERE uid LIKE 'test:%')").run()).meta.changes;
    const pb = await req.json().catch(() => ({})); if (Array.isArray(pb.vids)) for (const v of pb.vids.slice(0, 200)) out.events += (await db.prepare("DELETE FROM ev WHERE vid = ?").bind(String(v)).run()).meta.changes;
    out.email_data = await purgeEmailData(env, "test-session@fitwise.invalid");
    out.kv = (await env.DB.prepare("DELETE FROM kv WHERE k LIKE 'pl:u:test:%' OR k LIKE 'pl:d:zztest%' OR k LIKE 'udev:test:%' OR k LIKE 'd:d:zztest%'").run()).meta.changes;
    return json({ ok: true, deleted: out });
  }
  return null;
}

// ---------- /admin page (rendered only for an admin; data comes from /api/admin/*) ----------
function ADMIN_HTML(s) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Admin · Fitwise</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/v5.css">
<style>
body{background:#f6f5f1}.aw{max-width:1180px;margin:0 auto;padding:14px 14px 60px}
.atop{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}.atop h1{font-size:1.3rem;margin:0}.atop small{color:var(--mut)}
.tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px}.tabs button{all:unset;cursor:pointer;padding:8px 14px;border-radius:999px;background:#fff;border:1px solid var(--line);font-weight:650;font-size:.88rem;white-space:nowrap}.tabs button.on{background:var(--g);color:#fff;border-color:var(--g)}
.c{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px;margin:0 0 12px;overflow-x:auto}.c h2{font-size:1rem;text-align:left;margin:0 0 10px}
.k{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:12px}.k div{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px}.k small{display:block;color:var(--mut);font-size:.72rem;text-transform:uppercase;font-weight:700;letter-spacing:.04em}.k b{font-size:1.6rem}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
table{width:100%;border-collapse:collapse;font-size:.84rem}th{text-align:left;color:var(--mut);font-weight:650;font-size:.75rem;text-transform:uppercase;padding:6px 6px;border-bottom:1px solid var(--line)}td{padding:6px;border-bottom:1px solid #eee;vertical-align:top}td.n{text-align:right;font-variant-numeric:tabular-nums}
.bar{height:8px;background:var(--g);border-radius:4px;display:block;min-width:2px}.fun td:first-child{white-space:nowrap}
.muted{color:var(--mut)}.pill{font-size:.72rem;border-radius:6px;padding:1px 6px;background:#f0eee8;border:1px solid var(--line)}.pill.r{background:#fbeaea;color:#a33}.pill.g{background:#e3f4ed;color:var(--g)}
#days{width:auto;min-width:160px}input[type=search],input[type=number],input[type=text],select{padding:8px 10px;border:1px solid var(--line);border-radius:9px;font:inherit;font-size:.9rem}
button.a{all:unset;cursor:pointer;color:var(--g);font-weight:650;margin-right:10px;font-size:.84rem}button.a.r{color:#a33}
.soon{border:1px dashed #d8c58a;background:#fffbea;border-radius:12px;padding:12px;color:#6b5a1f}
.chart{display:flex;align-items:flex-end;gap:2px;height:150px;padding-top:6px;border-bottom:1px solid var(--line)}.chart span{flex:1;background:var(--g);border-radius:3px 3px 0 0;position:relative;min-height:1px}.chart span i{position:absolute;bottom:0;left:0;right:0;background:#9fd3c0;border-radius:3px 3px 0 0}
.cx{display:flex;justify-content:space-between;font-size:.72rem;color:var(--mut);margin-top:4px}
.tl td{font-size:.8rem}.hide{display:none}
@media(max-width:800px){.k{grid-template-columns:repeat(2,1fr)}.g2,.g3{grid-template-columns:1fr}}
</style></head><body>
<div class="aw">
<div class="atop"><h1>Fitwise admin</h1><small>Signed in as ${gEsc(s.key ? "admin key" : s.email)} · <a href="/">Site</a> · <a href="#" id="out">Sign out</a></small></div>
<div class="tabs" id="tabs"><button data-t="ov" class="on">Overview</button><button data-t="ai">AI Models &amp; Keys</button><button data-t="us">Users</button><button data-t="cv">Resumes</button><button data-t="bi">Payments &amp; billing</button><button data-t="co">Content</button><button data-t="ex">Export</button></div>
<section id="ov"><div class="atop"><span class="muted" id="ovnote"></span><select id="days"><option value="7">Last 7 days</option><option value="30" selected>Last 30 days</option><option value="90">Last 90 days</option></select></div><div id="ovb">Loading…</div></section>
<section id="us" class="hide"><div class="c"><input type="search" id="uq" placeholder="Search email or name" style="width:min(340px,100%)"> <span class="muted" id="un"></span><div id="ul" style="margin-top:10px"></div></div><div id="ud"></div></section>
<section id="cv" class="hide"><div class="c"><h2>Uploaded CVs</h2><p class="muted" id="cvn"></p><input type="search" id="cq" placeholder="Search email or file name" style="width:min(340px,100%)"><div id="cvl" style="margin-top:10px"></div></div></section>
<section id="bi" class="hide"><div id="bib">Loading…</div></section>
<section id="co" class="hide"><div id="cob">Loading…</div></section>
<section id="ai" class="hide"><div id="aib">Loading AI cascade configuration…</div></section>
<section id="ex" class="hide"><div class="c"><h2>Export CSV</h2><p><a class="btn" href="/api/admin/export/users.csv">Users (CSV)</a></p><p><a class="btn ghost" href="/api/admin/export/events.csv?days=30">Events, last 30 days (CSV)</a> <a class="btn ghost" href="/api/admin/export/events.csv?days=90">Events, last 90 days (CSV)</a></p><p class="muted">Test sessions and your own admin visits are not counted. Raw events are kept ${EV_RAW_DAYS} days, then rolled up into daily totals.</p></div></section>
</div>
<script>
(function(){
var $=function(i){return document.getElementById(i)};var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var nf=function(n){return (n||0).toLocaleString()};var dt=function(t){return t?new Date(t).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):""};
var get=function(u){return fetch(u,{credentials:"same-origin",cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json()})};
var post=function(u,b){return fetch(u,{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify(b)}).then(function(r){return r.json()})};
var loaded={};
document.querySelectorAll("#tabs button").forEach(function(b){b.onclick=function(){document.querySelectorAll("#tabs button").forEach(function(x){x.classList.toggle("on",x===b)});["ov","ai","us","cv","bi","co","ex"].forEach(function(t){$(t).classList.toggle("hide",t!==b.dataset.t)});if(!loaded[b.dataset.t]){loaded[b.dataset.t]=1;({ai:aiPanel,us:users,cv:cvs,bi:billing,co:content}[b.dataset.t]||function(){})()}}});
$("out").onclick=function(e){e.preventDefault();post("/api/auth/logout",{}).then(function(){location.href="/"})};
function tbl(rows,cols,empty){if(!rows||!rows.length)return '<p class="muted">'+(empty||"No data yet.")+'</p>';var mx=0;cols.forEach(function(c){if(c.bar)rows.forEach(function(r){mx=Math.max(mx,r[c.k]||0)})});
return "<table><tr>"+cols.map(function(c){return "<th>"+c.h+"</th>"}).join("")+"</tr>"+rows.map(function(r){return "<tr>"+cols.map(function(c){var v=c.f?c.f(r):esc(r[c.k]);if(c.bar)v='<span style="display:flex;gap:6px;align-items:center;justify-content:flex-end">'+nf(r[c.k])+'<span class="bar" style="width:'+Math.round(60*(r[c.k]||0)/(mx||1))+'px"></span></span>';return "<td"+(c.n?' class="n"':"")+">"+v+"</td>"}).join("")+"</tr>"}).join("")+"</table>"}
function card(t,h){return '<div class="c"><h2>'+t+"</h2>"+h+"</div>"}
function chart(d){if(!d.length)return '<p class="muted">No page views yet in this period.</p>';var mx=Math.max.apply(null,d.map(function(x){return x.pv}))||1;
return '<div class="chart">'+d.map(function(x){return '<span title="'+x.day+": "+x.pv+" page views, "+x.v+" visitors, "+x.signups+' sign-ups" style="height:'+Math.max(1,Math.round(100*x.pv/mx))+'%"><i style="height:'+Math.round(100*x.v/Math.max(1,x.pv))+'%"></i></span>'}).join("")+'</div><div class="cx"><span>'+d[0].day+"</span><span>dark = page views · light = visitors (hover for sign-ups)</span><span>"+d[d.length-1].day+"</span></div>"}
function overview(){$("ovb").innerHTML="Loading…";get("/api/admin/overview?days="+$("days").value).then(function(o){var t=o.totals;
$("ovnote").textContent="Since "+o.since+" (Amsterdam days). First-party data only; recording started 1 Nov 2026.";
var f=o.funnel,top=f[0].visitors||0;
$("ovb").innerHTML='<div class="k"><div><small>Visitors</small><b>'+nf(t.visitors)+'</b></div><div><small>Page views</small><b>'+nf(t.pageviews)+'</b></div><div><small>Sign-ups</small><b>'+nf(t.signups)+'</b></div><div><small>Active users</small><b>'+nf(t.active_users)+'</b></div><div><small>All users</small><b>'+nf(t.users_total)+"</b></div></div>"+
card("Page views per day",chart(o.daily))+
card("Conversion funnel (unique visitors)",'<table class="fun">'+f.map(function(s){return "<tr><td>"+esc(s.step)+'</td><td class="n">'+nf(s.visitors)+'</td><td style="width:45%"><span class="bar" style="width:'+(top?Math.round(100*s.visitors/top):0)+'%"></span></td><td class="n muted">'+(top?Math.round(100*s.visitors/top):0)+"%</td></tr>"}).join("")+"</table>")+
'<div class="g2">'+card("Top referrers",tbl(o.referrers,[{h:"Source",k:"k"},{h:"Visitors",k:"v",n:1,bar:1},{h:"Views",k:"n",n:1}]))+card("UTM campaigns",tbl(o.campaigns,[{h:"Source / medium",f:function(r){return esc(r.source)+(r.medium?" / "+esc(r.medium):"")}},{h:"Campaign",k:"campaign"},{h:"Visitors",k:"v",n:1,bar:1}],"No UTM-tagged visits yet."))+"</div>"+
'<div class="g2">'+card("Top pages",tbl(o.pages,[{h:"Page",k:"k"},{h:"Views",k:"n",n:1,bar:1},{h:"Visitors",k:"v",n:1}]))+card("Top jobs by Apply clicks",tbl(o.jobs,[{h:"Job",f:function(r){return esc(r.job||r.id)+' <a class="muted" href="/j/'+esc(r.id)+'" target="_blank">/j/'+esc(r.id)+"</a>"}},{h:"Clicks",k:"clicks",n:1,bar:1},{h:"People",k:"v",n:1}],"No Apply clicks in this period.")+'<p class="muted">All-time Apply clicks (counter since 1 Nov): '+nf(o.apply_clicks_all_time)+"</p>")+"</div>"+
'<div class="g3">'+card("Devices",tbl(o.devices,[{h:"Device",k:"k"},{h:"Visitors",k:"v",n:1,bar:1}]))+card("Operating systems",tbl(o.os,[{h:"OS",k:"k"},{h:"Visitors",k:"v",n:1,bar:1}]))+card("Browsers",tbl(o.browsers,[{h:"Browser",k:"k"},{h:"Visitors",k:"v",n:1,bar:1}]))+"</div>"+
'<div class="g2">'+card("Countries",tbl(o.countries,[{h:"Country",k:"k"},{h:"Visitors",k:"v",n:1,bar:1}]))+card("Most viewed jobs",tbl(o.job_views,[{h:"Job",f:function(r){return esc(r.job||r.id)}},{h:"Views",k:"views",n:1,bar:1}],"No job views in this period."))+"</div>"+
card("All events",tbl(o.events,[{h:"Event",k:"type"},{h:"Count",k:"n",n:1,bar:1}]));
}).catch(function(e){$("ovb").textContent="Could not load: "+e.message})}
$("days").onchange=overview;overview();
var uT;$("uq").oninput=function(){clearTimeout(uT);uT=setTimeout(users,300)};
function users(){get("/api/admin/users?q="+encodeURIComponent($("uq").value)).then(function(j){$("un").textContent=j.users.length+" users";
$("ul").innerHTML=tbl(j.users,[{h:"User",f:function(u){return '<a href="#" data-u="'+esc(u.sub)+'"><b>'+esc(u.email)+"</b></a><br><span class=muted>"+esc(u.name)+"</span> "+(u.admin?'<span class="pill g">admin</span>':"")+(u.status?'<span class="pill r">'+esc(u.status)+"</span>":"")}},{h:"Signed up",f:function(u){return dt(u.created)+"<br><span class=muted>"+esc(u.signup_path||u.source||"")+"</span>"}},{h:"Came from",f:function(u){return esc(u.first_src||u.first_ref||"")}},{h:"Last seen",f:function(u){return dt(u.last_seen||u.last_login)}},{h:"Sign-ins",k:"logins",n:1},{h:"Tailorings",k:"tailorings",n:1},{h:"Credits",f:function(u){return nf(u.credits)},n:1},{h:"CVs",k:"cvs",n:1}],"No users yet.");
document.querySelectorAll("[data-u]").forEach(function(a){a.onclick=function(e){e.preventDefault();user(a.dataset.u)}})}).catch(function(e){$("ul").textContent="Could not load: "+e.message})}
function user(sub){$("ud").innerHTML='<div class="c">Loading…</div>';get("/api/admin/user?sub="+encodeURIComponent(sub)).then(function(j){var u=j.user;
$("ud").innerHTML='<div class="c"><h2>'+esc(u.email)+" "+(u.status?'<span class="pill r">'+esc(u.status)+"</span>":"")+'</h2><p class="muted">'+esc(u.name)+" · signed up "+dt(u.created)+" · last sign-in "+dt(u.last_login)+" · "+nf(u.logins)+" sign-ins · first came from "+esc(u.first_src||u.first_ref||"unknown")+'</p><p>Credits: <b>'+nf(j.credits)+'</b> · pre-launch free tailoring used: <b>'+j.free_used+'</b> · tailorings: <b>'+j.tailorings.length+'</b></p>'+
'<p><input type="number" id="gd" value="10" style="width:90px"> <button class="a" id="gG">Grant credits</button><button class="a" id="gR">Reset free tailoring</button><button class="a" id="gB">'+(u.status==="blocked"?"Unblock":"Block")+'</button><button class="a r" id="gD">Delete user and data</button> <span id="gm" class="muted"></span></p></div>'+
'<div class="g2">'+card("Stored CVs",cvTable(j.cvs))+card("Credits ledger",tbl(j.ledger,[{h:"When",f:function(r){return dt(r.created)}},{h:"Change",k:"delta",n:1},{h:"Why",f:function(r){return esc(r.reason)+" <span class=muted>"+esc(r.ref)+"</span>"}}],"No credit movements."))+"</div>"+
card("Activity timeline (newest first; includes visits before sign-in from the same browser)",'<div class="tl">'+tbl(j.timeline,[{h:"When",f:function(r){return dt(r.ts)}},{h:"Event",k:"type"},{h:"Page",k:"path"},{h:"Detail",f:function(r){return esc([r.obj,r.meta].filter(Boolean).join(" · "))}},{h:"From",f:function(r){return esc([r.ref,r.us,r.uc].filter(Boolean).join(" · "))}},{h:"Device",f:function(r){return esc([r.dev,r.os,r.br,r.cc].filter(Boolean).join(" · "))}}],"No activity recorded.")+"</div>");
var act=function(b){post("/api/admin/user",Object.assign({sub:sub},b)).then(function(r){$("gm").textContent=r.ok?"Done.":(r.error||"Failed");if(r.ok)setTimeout(function(){user(sub);users()},400)})};
$("gG").onclick=function(){act({action:"grant",delta:$("gd").value,note:"admin page"})};$("gR").onclick=function(){act({action:"reset_free"})};
$("gB").onclick=function(){act({action:u.status==="blocked"?"unblock":"block"})};
$("gD").onclick=function(){var e=prompt("Type the user's email to delete the account and all its data:");if(e)act({action:"delete",confirm:e.trim().toLowerCase()})};bindCv();
$("ud").scrollIntoView({behavior:"smooth"})}).catch(function(e){$("ud").innerHTML='<div class="c">Could not load: '+esc(e.message)+"</div>"})}
function cvTable(l){return tbl(l,[{h:"File",f:function(c){return esc(c.filename)+"<br><span class=muted>"+(c.email?esc(c.email)+" · ":"")+esc(c.job||"")+"</span>"}},{h:"Uploaded",f:function(c){return dt(c.created)}},{h:"Size",f:function(c){return Math.max(1,Math.round(c.size/1024))+" KB"},n:1},{h:"",f:function(c){return '<a class="a" target="_blank" href="/api/admin/cv?id='+c.id+'">View</a> <a class="a" href="/api/admin/cv?dl=1&id='+c.id+'">Download</a> <button class="a r" data-dc="'+c.id+'">Delete</button>'}}],"No CVs stored.")}
function bindCv(){document.querySelectorAll("[data-dc]").forEach(function(b){b.onclick=function(){if(!confirm("Delete this CV?"))return;post("/api/admin/cv",{delete:b.dataset.dc}).then(function(){b.closest("tr").remove()})}})}
var cT;$("cq").oninput=function(){clearTimeout(cT);cT=setTimeout(cvs,300)};
function cvs(){get("/api/admin/cvs?q="+encodeURIComponent($("cq").value)).then(function(j){$("cvn").textContent=j.count+" CVs stored ("+Math.round(j.bytes/1024)+" KB). Each is deleted automatically "+j.retention_days+" days after upload; users can delete theirs on their Your data page.";$("cvl").innerHTML=cvTable(j.cvs);bindCv()}).catch(function(e){$("cvl").textContent="Could not load: "+e.message})}
function billing(){get("/api/admin/billing").then(function(b){
$("bib").innerHTML='<div class="c"><h2>Card payments</h2><div class="soon"><b>Coming soon.</b> No payment provider is connected and nothing is charged. Credit packs on the site ('+Object.keys(b.packs).map(function(k){return b.packs[k].credits+" for $"+b.packs[k].usd}).join(", ")+') collect interest only. Revenue, invoices and refunds will show here once payments are live.</div></div>'+
'<div class="k"><div><small>Credits outstanding</small><b>'+nf(b.credits_outstanding)+'</b></div><div><small>Accounts with credits</small><b>'+nf(b.balances.length)+'</b></div><div><small>Ledger rows</small><b>'+nf(b.ledger.length)+'</b></div><div><small>Purchase interest</small><b>'+nf(b.interest.filter(function(x){return x.list==="credits"}).length)+'</b></div><div><small>Autopilot waitlist</small><b>'+nf(b.interest.filter(function(x){return x.list==="autopilot"}).length)+"</b></div></div>"+
'<div class="g2">'+card("Credit balances",tbl(b.balances,[{h:"Email",k:"email"},{h:"Balance",k:"balance",n:1},{h:"Updated",f:function(r){return dt(r.updated)}}],"No credit balances."))+card("Credits by reason",tbl(b.by_reason,[{h:"Reason",k:"reason"},{h:"Rows",k:"rows",n:1},{h:"Credits",k:"credits",n:1}],"No credit movements yet."))+"</div>"+
card("Credit ledger (latest 300)",tbl(b.ledger,[{h:"When",f:function(r){return dt(r.created)}},{h:"Email",k:"email"},{h:"Change",k:"delta",n:1},{h:"Why",f:function(r){return esc(r.reason)+" <span class=muted>"+esc(r.ref)+"</span>"}}],"No credit movements yet."))+
card("Purchase interest and waitlists (no payment taken)",tbl(b.interest,[{h:"List",k:"list"},{h:"Email",k:"email"},{h:"Pack / bundle",k:"pack"},{h:"When",f:function(r){return dt(r.at)}}],"Nobody yet."))+
'<div class="c"><h2>Wallet top-ups, invoices, refunds</h2><div class="soon">Coming soon. Not built yet.</div></div>'}).catch(function(e){$("bib").textContent="Could not load: "+e.message})}
function aiPanel(){
  $("aib").innerHTML='<div class="c">Loading multi-provider free LLM cascade…</div>';
  get("/api/admin/llm").then(function(d){
    var st=d.status||{};
    var act=(st.ai_active_models||[]).map(function(x){return '<span class="pill g">'+esc(x.name)+' ('+esc(x.model)+')</span>'}).join(" ");
    var html='<div class="c"><h2>Free &amp; Open-Source Multi-Provider LLM Cascade</h2>'+
      '<p class="muted">Requests route automatically in speed+quality order (8s per-provider timeout + automatic cooldown skip on 429/exhaustion). Built-in deterministic engine runs as zero-cost final fallback so Fitwise never errors.</p>'+
      '<p><b>Active Cascade:</b> '+(act||'<span class="pill">No external keys yet — using built-in smart engine</span>')+' → <span class="pill">Built-in Engine</span></p></div>';
    html += '<div class="g2">' + (d.catalog||[]).map(function(spec){
      var cur=(d.providers||{})[spec.id]||{};
      var badge=cur.has_key?'<span class="pill g">Key Saved ('+esc(cur.key_hint)+')</span>':'<span class="pill">Not configured</span>';
      return '<div class="c" data-pid="'+esc(spec.id)+'">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px"><b>'+esc(spec.name)+'</b>'+badge+'</div>'+
        '<div style="display:grid;gap:8px">'+
          '<input type="password" class="aik" placeholder="'+(cur.has_key?'Leave blank to keep saved key, or paste new key':'Paste '+esc(spec.name)+' API key')+'" autocomplete="off">'+
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+
            '<input type="text" class="aim" value="'+esc(cur.model||spec.default_models[0]||"")+'" placeholder="Primary model">'+
            '<input type="text" class="aif" value="'+esc(cur.fallback_model||spec.default_models[1]||"")+'" placeholder="Secondary model (optional)">'+
          '</div>'+
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">'+
            '<button class="btn sm aisave" type="button">Save Key</button>'+
            '<button class="btn sm ghost aitest" type="button">Test Connection</button>'+
            (cur.has_key?'<button class="a r aiclr" type="button">Remove</button>':'')+
            '<a class="muted" style="margin-left:auto;font-size:.8rem" href="'+esc(spec.signup)+'" target="_blank" rel="noopener">Get free key ↗</a>'+
          '</div>'+
          '<small class="aimsg muted"></small>'+
        '</div></div>';
    }).join("") + '</div>';
    html += '<div class="c"><h2>Email OTP Delivery (Optional Resend Key)</h2>'+
      '<p class="muted">Optional: add a free Resend API key to send 6-digit login codes via email. Without it, Email OTP shows an instant on-screen verification code.</p>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'+
        '<input type="password" id="rsk" placeholder="'+(d.mail&&d.mail.has_resend_key?'Resend key saved — enter new to replace':'re_...')+'" style="flex:1;min-width:200px">'+
        '<input type="text" id="rsf" value="'+esc((d.mail&&d.mail.from)||"Fitwise <noreply@fitwise.sites.tab.bot>")+'" style="flex:1;min-width:200px">'+
        '<button class="btn sm" id="rssave" type="button">Save Email Key</button>'+
      '</div><small id="rsmsg" class="muted"></small></div>';
    $("aib").innerHTML=html;
    document.querySelectorAll("#aib [data-pid]").forEach(function(box){
      var pid=box.getAttribute("data-pid"), msg=box.querySelector(".aimsg");
      box.querySelector(".aisave").onclick=function(){
        msg.textContent="Saving…";
        post("/api/admin/llm",{provider:pid,key:box.querySelector(".aik").value.trim(),model:box.querySelector(".aim").value.trim(),fallback_model:box.querySelector(".aif").value.trim(),enabled:true}).then(function(r){
          msg.textContent=r.ok?"Saved! Refreshing…":(r.error||"Failed"); if(r.ok)setTimeout(aiPanel,350);
        });
      };
      box.querySelector(".aitest").onclick=function(){
        msg.textContent="Testing live connection…";
        var kv=box.querySelector(".aik").value.trim()||"__KEEP__";
        post("/api/admin/llm",{action:"test",provider:pid,key:kv,model:box.querySelector(".aim").value.trim()}).then(function(r){
          msg.textContent=r.ok?("Connected! "+r.model+" replied: "+r.reply):("Error: "+(r.error||"failed"));
        });
      };
      var clr=box.querySelector(".aiclr");
      if(clr) clr.onclick=function(){ if(!confirm("Remove key for "+pid+"?"))return; post("/api/admin/llm",{provider:pid,clear:true}).then(aiPanel); };
    });
    $("rssave").onclick=function(){
      $("rsmsg").textContent="Saving…";
      post("/api/admin/llm",{action:"save_mail",resend_key:$("rsk").value.trim(),from:$("rsf").value.trim()}).then(function(r){$("rsmsg").textContent=r.ok?"Saved email provider!":(r.error||"Error")});
    };
  }).catch(function(e){$("aib").textContent="Could not load: "+e.message});
}
function content(){get("/api/admin/content").then(function(c){var e=c.events,jb=c.jobs;
$("cob").innerHTML='<div class="g2">'+card("Conferences &amp; Workshops (/events)","<p>Stored: <b>"+nf(e.stored)+"</b> · upcoming now: <b>"+nf(e.upcoming)+"</b> · open speaker calls: <b>"+nf(e.cfp_open)+"</b></p><p class=muted>List built: "+dt(e.generated_at)+" · pushed to Fitwise: "+dt(e.pushed_at)+"</p><p class=muted>Refresh: workshops_fetch.py, then node events_push.mjs</p>")+
card("Daily jobs feed (/jobs)","<p>Latest list: <b>"+esc(jb.latest||"none")+"</b> · email subscribers: <b>"+nf(jb.subscribers)+"</b> (sending: coming soon)</p>"+tbl(jb.feeds,[{h:"Date",k:"date"},{h:"Jobs",k:"count",n:1},{h:"Visa ✅",k:"visa",n:1},{h:"Pushed",f:function(r){return dt(r.pushed)}}]))+"</div>"+
card("Other","<p>Contact-form messages waiting: <b>"+nf(c.contact_messages)+"</b> · AI tailoring mode: <b>"+(c.ai_mode?"on":"off")+"</b></p>")}).catch(function(e){$("cob").textContent="Could not load: "+e.message})}
})();
</script></body></html>`;
}

// ---------- routing: gate first, then the existing app (FW_MAIN) ----------
async function afterSignin(req, env, pl, email, isNew, source) {
  try {
    const db = await anaDb(env); const c = REQ.get(req);
    const admin = (await adminEmails(env)).includes(email);
    if (isNew && c) {
      const ft = await db.prepare("SELECT us, um, uc, ref FROM ev WHERE vid = ? AND (us IS NOT NULL OR ref NOT IN ('(direct)', '(internal)')) ORDER BY ts LIMIT 1").bind(c.vid).first();
      const src = ft && ft.us ? [ft.us, ft.um, ft.uc].filter(Boolean).join(" / ") : null;
      await db.prepare("UPDATE users SET signup_path = ?, first_src = ?, first_ref = ? WHERE sub = ?").bind(String(source || "").slice(0, 160), src, ft ? ft.ref : null, pl.sub).run();
    }
    await track(req, "signin_ok", { sess: { sub: pl.sub, email, isAdmin: admin }, meta: { new_user: !!isNew }, path: String(source || "").split("?")[0].slice(0, 160) || null, ref: null });
  } catch (e) {}
}
async function gatedApi(p, req, env, ctx, s, url) {
  if (p === "/api/cv" && req.method === "POST") { if (s.key || (s.isAdmin && !s.test)) return json({ ok: true, stored: false, reason: "not stored for the owner's own account" }); return storeCv(req, env, s); }
  if (p === "/api/my/cvs") { const r = (await (await anaDb(env)).prepare("SELECT id, filename, mime, size, job, created FROM cvs WHERE sub = ? ORDER BY created DESC").bind(s.sub).all()).results || []; return json({ cvs: r, retention_days: CV_RETENTION_DAYS }); }
  if (p === "/api/my/cv" && req.method === "GET") { const id = String(url.searchParams.get("id") || ""); const m = await (await anaDb(env)).prepare("SELECT sub FROM cvs WHERE id = ?").bind(id).first(); if (!m || m.sub !== s.sub) return json({ error: "not found" }, 404); return cvResponse(env, id, true); }
  if (p === "/api/my/cv" && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    if (b.delete === "all") return json({ ok: true, deleted: await deleteCvsOf(env, s.sub) });
    const m = await (await anaDb(env)).prepare("SELECT sub FROM cvs WHERE id = ?").bind(String(b.delete || "")).first(); if (!m || m.sub !== s.sub) return json({ error: "not found" }, 404);
    await deleteCv(env, String(b.delete)); track(req, "cv_delete"); return json({ ok: true });
  }
  if (p === "/api/my/delete-account" && req.method === "POST") {
    const b = await req.json().catch(() => ({})); if (b.confirm !== true) return json({ error: "need confirm" }, 400);
    if (s.key) return json({ error: "not for the admin key" }, 400);
    const out = s.test ? { cvs: await deleteCvsOf(env, s.sub) } : await deleteUser(env, s.sub, "deleted");
    const t = cookieOf(req, SESS_COOKIE); if (t && /^[a-f0-9]{64}$/.test(t)) await store(env).delete("sess:" + (await sha(t)));
    return json({ ok: true, deleted: out }, 200, { "set-cookie": sessCookie("", 0) });
  }
  if (["/api/tailor", "/api/credits", "/api/cover", "/api/download", "/api/usage"].includes(p) && req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    b.email = String(s.email || "").toLowerCase(); // the signed-in Google account is the account
    if (p === "/api/tailor") {
      track(req, "tailor_start", { meta: [b.title, b.company].filter(Boolean).join(" @ ").slice(0, 160) || null });
      if (PRELAUNCH_FREE > 0 && (await kvNum(env, "pl:u:" + s.sub)) >= PRELAUNCH_FREE) { track(req, "tailor_blocked", { meta: "prelaunch: account already used its free tailoring" }); return json({ error: PRELAUNCH_MSG, code: "prelaunch_used", limit: PRELAUNCH_FREE }, 429); }
    }
    const h = new Headers(req.headers); h.delete("content-length");
    const r2 = new Request(req.url, { method: "POST", headers: h, body: JSON.stringify(b) }); REQ.set(r2, REQ.get(req));
    const res = await FW_MAIN.fetch(r2, env, ctx);
    if (p === "/api/tailor") {
      if (res.status === 200) {
        let j = {}; try { j = await res.clone().json(); } catch (e) {}
        if (PRELAUNCH_FREE > 0) await bump(env, "pl:u:" + s.sub);
        const dev = String(b.device || "").slice(0, 64);
        if (dev) { let d = []; try { d = JSON.parse((await store(env).get("udev:" + s.sub)) || "[]"); } catch (e) {} if (!d.includes(dev)) { d = d.concat(dev).slice(-10); await store(env).put("udev:" + s.sub, JSON.stringify(d)); } }
        track(req, "tailor_done", { obj: j.jobId || null, meta: [b.title, b.company].filter(Boolean).join(" @ ").slice(0, 160) || null });
      } else if (res.status === 429) track(req, "tailor_blocked", { meta: "limit" });
      else track(req, "tailor_error", { meta: "HTTP " + res.status });
    }
    if (p === "/api/download" && res.status === 200) track(req, "download", { obj: b.jobId || null, meta: b.format || null });
    if (p === "/api/cover" && res.status === 200) track(req, "cover_letter", { obj: b.jobId || null });
    return res;
  }
  if ((p === "/api/early-access" || p === "/api/credits/buy") && req.method === "POST") {
    const res = await FW_MAIN.fetch(req, env, ctx);
    if (res.status === 200) track(req, p === "/api/early-access" ? "waitlist_join" : "buy_interest");
    return res;
  }
  if (p === "/api/jobs/subscribe" && req.method === "POST") { const res = await FW_MAIN.fetch(req, env, ctx); if (res.status === 200) track(req, "jobs_subscribe"); return res; }
  return FW_MAIN.fetch(req, env, ctx);
}
async function fwRoute(req, env, ctx) {
  const url = new URL(req.url); const p = url.pathname;
  if (ctx && ctx.waitUntil) ctx.waitUntil(gateSweep(env));
  if (p === "/admin" || p === "/admin/") {
    const s = await currentSession(req, env);
    if (!s || !s.isAdmin) return notFound(env, req);
    return new Response(ADMIN_HTML(s), { headers: { "content-type": "text/html; charset=utf-8", ...NOSTORE, "x-robots-tag": "noindex", "x-frame-options": "DENY" } });
  }
  if (p.startsWith("/api/admin/")) {
    if (!(await isAdmin(req))) return json({ error: "not found" }, 404);
    const r = await routeAdmin(p, req, env, url); if (r) return r;
    return FW_MAIN.fetch(req, env, ctx);
  }
  if (p === "/api/hit" && req.method === "POST") {
    const t = await req.text(); let b = null;
    if (t.length < 3000) { try { b = JSON.parse(t); } catch (e) {} }
    if (b && HIT_TYPES.includes(b.t)) { let u = null; try { u = new URL(String(b.u || "")); if (u.host !== url.host) u = null; } catch (e) {} if (u) await track(req, b.t, { url: u.toString(), ref: b.t === "pageview" ? String(b.r || "") : null, obj: b.o || null, meta: b.m || null }); }
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  }
  if (p === "/api/jobs/teaser" && req.method === "GET") {
    const f = await getFeed(env, null); if (!f) return json({ error: "no list" }, 404);
    const top = f.jobs.filter(x => x.visa).concat(f.jobs.filter(x => !x.visa)).slice(0, 3).map(x => ({ id: x.id || null, title: x.title, company: x.company, city: x.city, country: x.country, visa: !!x.visa }));
    return json({ date: f.date, count: f.jobs.length, visa: f.jobs.filter(x => x.visa).length, top });
  }
  if (p === "/api/auth/test-login" && req.method === "GET") { // one-time link minted by /api/admin/test-session (admin key), for checking the signed-in view in a browser
    const lk = String(url.searchParams.get("k") || ""); const t = /^[a-z0-9]{24}$/.test(lk) ? await store(env).get("tlogin:" + lk) : null;
    if (!t) return notFound(env, req);
    await store(env).delete("tlogin:" + lk);
    const next = /^\/[A-Za-z0-9/_\-?=&%.]*$/.test(url.searchParams.get("next") || "") ? url.searchParams.get("next") : "/jobs";
    return new Response(null, { status: 302, headers: { location: next, "set-cookie": sessCookie(t, 3600), ...NOSTORE } });
  }
  if (p === "/api/auth/logout" && req.method === "POST") { const s = await currentSession(req, env); if (s) await track(req, "signout", { sess: s }); return FW_MAIN.fetch(req, env, ctx); }
  const k = p.length > 1 ? p.replace(/\/+$/, "") : p;
  if (k === "/tailor.html" || k === "/pricing.html") return Response.redirect(new URL(k.slice(0, -5) + url.search, req.url).toString(), 301);
  if (k === "/conferences") return Response.redirect(new URL("/events", req.url).toString(), 301);
  const jm = p.match(/^\/j\/([A-Za-z0-9]{1,16})(\/go)?\/?$/);
  if (jm && req.method === "GET") {
    const j = await getJobById(env, jm[1].toLowerCase());
    if (j) track(req, jm[2] ? "apply_click" : "job_view", { obj: j.id, meta: (j.title + " – " + j.company).slice(0, 200) });
    const r = await FW_MAIN.fetch(req, env, ctx);
    if (jm[2]) return r;
    const h = new Headers(r.headers); h.set("x-fitwise-gate", "0");
    return new Response(r.body, { status: r.status, headers: h });
  }
  if ((k === "/jobs" || k.startsWith("/jobs/")) && req.method === "GET") {
    const r = await FW_MAIN.fetch(req, env, ctx);
    const h = new Headers(r.headers); h.set("x-fitwise-gate", "0");
    return new Response(r.body, { status: r.status, headers: h });
  }
  if (k === "/events" && req.method === "GET") {
    const s = await currentSession(req, env);
    const r = await FW_MAIN.fetch(req, env, ctx);
    if (s) track(req, "events_view");
    return privateResp(r, s);
  }
  if (k === "/account" && req.method === "GET") {
    const s = await currentSession(req, env);
    if (!s) { const g = await gateFor(k, req, env); if (g) return g; return notFound(env, req); }
    return privateResp(new Response(accountHTML(s), { headers: { "content-type": "text/html; charset=utf-8" } }), s);
  }
  if (p.startsWith("/api/") && (GATED_API.includes(p) || p === "/api/cv" || p.startsWith("/api/my/"))) {
    const s = await currentSession(req, env);
    if (!s) return json({ error: "Sign in with Google to continue.", code: "signin_required" }, 401);
    return gatedApi(p, req, env, ctx, s, url);
  }
  return FW_MAIN.fetch(req, env, ctx);
}
export default {
  async fetch(req, env, ctx) {
    const c = reqCtx(req, env, ctx);
    let res;
    try { res = await fwRoute(req, env, ctx); } catch (e) { res = new Response("Something went wrong on our side. Please refresh.", { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } }); }
    if (c.newVid && res && !isBot(req.headers.get("user-agent") || "")) { try { res = new Response(res.body, res); res.headers.append("set-cookie", `${VID_COOKIE}=${c.vid}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`); } catch (e) {} }
    return res;
  }
};
