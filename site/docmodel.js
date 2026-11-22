
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
