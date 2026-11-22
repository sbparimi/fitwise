/* Fitwise core (Build 1) — nav behaviour, local-first store, the 28-check ATS engine, keyword & match scoring.
   Loaded on every page. Nothing here calls an external service; AI calls go to /api/ai/* which cascade across
   free providers and always fall back to the built-in engine. */
(function(){
"use strict";
var FW = window.FW = window.FW || {};

/* ---------------- tiny helpers ---------------- */
FW.$ = function(id){ return document.getElementById(id); };
FW.esc = function(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
FW.toast = function(msg, ms){
  var t = document.querySelector(".toast");
  if(!t){ t = document.createElement("div"); t.className="toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(FW._tt); FW._tt = setTimeout(function(){ t.classList.remove("show"); }, ms||2600);
};
FW.api = function(path, body, method){
  return fetch(path, {
    method: method || (body ? "POST" : "GET"),
    headers: body ? {"content-type":"application/json"} : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials:"same-origin"
  }).then(function(r){ return r.json().then(function(j){ j._status=r.status; return j; }).catch(function(){ return {_status:r.status, error:"Bad response"}; }); });
};
FW.debounce = function(fn, ms){ var t; return function(){ var a=arguments, s=this; clearTimeout(t); t=setTimeout(function(){ fn.apply(s,a); }, ms||260); }; };

/* ---------------- local-first store ---------------- */
var LS = {
  get:function(k,d){ try{ var v=localStorage.getItem(k); return v==null?d:JSON.parse(v); }catch(e){ return d; } },
  set:function(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } },
  del:function(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
FW.LS = LS;
var RKEY="fw_resumes_v1", AKEY="fw_active_resume", TKEY="fw_tracker_v1", CKEY="fw_letters_v1";
FW.store = {
  all:function(){ var a = LS.get(RKEY, []); return Array.isArray(a)?a:[]; },
  get:function(id){ return FW.store.all().filter(function(r){ return r.id===id; })[0] || null; },
  activeId:function(){ return LS.get(AKEY, null); },
  setActive:function(id){ LS.set(AKEY, id); },
  active:function(){ var id=FW.store.activeId(); return (id && FW.store.get(id)) || FW.store.all()[0] || null; },
  save:function(rec){
    var all = FW.store.all(), i = -1;
    all.forEach(function(r,n){ if(r.id===rec.id) i=n; });
    rec.updated_at = Date.now();
    if(!rec.created_at) rec.created_at = rec.updated_at;
    if(i>=0) all[i]=rec; else all.unshift(rec);
    LS.set(RKEY, all.slice(0,40));
    FW.store.setActive(rec.id);
    FW.cloud.push(rec);
    return rec;
  },
  remove:function(id){ LS.set(RKEY, FW.store.all().filter(function(r){ return r.id!==id; }));
    if(FW.store.activeId()===id) LS.del(AKEY);
    if(FW.cloud.me) FW.api("/api/resumes?id="+encodeURIComponent(id), null, "DELETE").catch(function(){}); },
  newId:function(){ return "res_" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); },
  letters:function(){ var a=LS.get(CKEY,[]); return Array.isArray(a)?a:[]; },
  saveLetter:function(rec){ var all=FW.store.letters(), i=-1; all.forEach(function(r,n){ if(r.id===rec.id) i=n; });
    rec.updated_at=Date.now(); if(i>=0) all[i]=rec; else all.unshift(rec); LS.set(CKEY, all.slice(0,30));
    if(FW.cloud.me) FW.api("/api/cover-letters", rec).catch(function(){}); return rec; },
  tracker:function(){ var a=LS.get(TKEY,[]); return Array.isArray(a)?a:[]; },
  track:function(item){
    var all=FW.store.tracker(), i=-1;
    all.forEach(function(r,n){ if(r.job_id && r.job_id===item.job_id) i=n; });
    item.updated_at=Date.now(); if(!item.created_at) item.created_at=item.updated_at;
    if(!item.id) item.id = "trk_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    if(i>=0) all[i]=item; else all.unshift(item);
    LS.set(TKEY, all.slice(0,250));
    if(FW.cloud.me) FW.api("/api/tracker", item).catch(function(){});
    return item;
  },
  untrack:function(id){ LS.set(TKEY, FW.store.tracker().filter(function(r){ return r.id!==id && r.job_id!==id; }));
    if(FW.cloud.me) FW.api("/api/tracker?id="+encodeURIComponent(id), null, "DELETE").catch(function(){}); }
};
/* cloud sync: silent no-op until the visitor is signed in */
FW.cloud = {
  me:null,
  check:function(){ return FW.api("/api/auth/me").then(function(j){
      FW.cloud.me = (j && (j.signed_in || j.user)) ? {email:(j.user&&j.user.email)||j.email||"your account", name:(j.user&&j.user.name)||j.name||""} : null;
      return FW.cloud.me; }).catch(function(){ return null; }); },
  push:function(rec){
    if(!FW.cloud.me) return Promise.resolve(false);
    return FW.api("/api/resumes", {id:rec.id,title:rec.title,target_role:(rec.doc&&rec.doc.role)||"",doc:rec.doc,theme:rec.theme,ats_score:rec.ats_score||0,created_at:rec.created_at})
      .then(function(j){ return !!(j&&j.ok); }).catch(function(){ return false; });
  },
  pull:function(){
    if(!FW.cloud.me) return Promise.resolve([]);
    return FW.api("/api/resumes").then(function(j){
      var rows = (j && j.resumes) || [];
      if(rows.length){
        var local = FW.store.all(), byId = {};
        local.forEach(function(r){ byId[r.id]=r; });
        rows.forEach(function(r){
          var ex = byId[r.id];
          if(!ex || (r.updated_at||0) > (ex.updated_at||0))
            byId[r.id] = {id:r.id,title:r.title,doc:r.doc,theme:r.theme,ats_score:r.ats_score,updated_at:r.updated_at,created_at:r.created_at};
        });
        var merged = Object.keys(byId).map(function(k){ return byId[k]; })
          .sort(function(a,b){ return (b.updated_at||0)-(a.updated_at||0); });
        LS.set(RKEY, merged.slice(0,40));
      }
      return rows;
    }).catch(function(){ return []; });
  }
};

/* ---------------- shared nav behaviour ---------------- */
function navInit(){
  var dd = document.getElementById("featDd");
  if(dd){
    var btn = dd.querySelector(".nav-dd-btn");
    var openIt = function(on){ dd.classList.toggle("open", on); btn.setAttribute("aria-expanded", String(on)); };
    var byHover = false;
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      if(byHover && dd.classList.contains("open")){ byHover = false; return; } /* hover already opened it */
      openIt(!dd.classList.contains("open"));
    });
    if(window.matchMedia && window.matchMedia("(hover: hover)").matches){
      dd.addEventListener("mouseenter", function(){ byHover = true; openIt(true); });
      dd.addEventListener("mouseleave", function(){ byHover = false; openIt(false); });
    }
    document.addEventListener("click", function(e){ if(!dd.contains(e.target)) openIt(false); });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape") openIt(false); });
  }
  var m = document.getElementById("mobMenu");
  if(m){
    document.addEventListener("click", function(e){ if(m.open && !m.contains(e.target)) m.open=false; });
    m.querySelectorAll(".menupanel a").forEach(function(a){ a.addEventListener("click", function(){ m.open=false; }); });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape" && m.open) m.open=false; });
    /* the panel is an overlay: close it when anything else in the header is opened */
    ["langBtn","navAuthBtn","navDashBtn"].forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.addEventListener("click", function(){ if(m.open) m.open = false; });
    });
  }
  /* reflect sign-in state in the header without gating anything */
  FW.cloud.check().then(function(u){
    var auth = document.getElementById("navAuthBtn");
    if(u && auth){ auth.textContent = "Account"; auth.href = "/dashboard"; }
    if(u) FW.cloud.pull();
  });
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", navInit); else navInit();

/* ---------------- text & keyword tools ---------------- */
var STOP = ("a an the and or but if then than that this these those of in on at to for with by from as is are was were be been being have has had do does did " +
"will would can could should may might must we you they he she it i our your their his her its not no nor so such own same too very just also about into over under " +
"more most other some any each few own only own s t don now d ll m o re ve y ain aren couldn didn doesn hadn hasn haven isn ma mightn mustn needn shan shouldn wasn weren won wouldn " +
"work working works role roles job jobs team teams company companies year years experience experiences new using used use strong ability able plus etc per via within across " +
"including include includes required requirements requirement responsibilities responsibility skills skill knowledge good great excellent well like looking candidate candidates " +
"you'll we're our us help helps helping ensure ensuring support supporting").split(/\s+/);
var STOPSET = {}; STOP.forEach(function(w){ STOPSET[w]=1; });
var SKILL_HINTS = ("python java javascript typescript react angular vue node sql nosql postgres mysql mongodb redis aws azure gcp docker kubernetes terraform ansible jenkins " +
"git github gitlab ci cd devops linux bash playwright cypress selenium pytest junit testng jest postman rest api graphql soap jira confluence agile scrum kanban safe " +
"tdd bdd cucumber gherkin automation manual regression performance jmeter gatling k6 security owasp accessibility wcag sap salesforce servicenow workday tableau powerbi " +
"looker dbt snowflake databricks spark hadoop kafka airflow etl elt pandas numpy sklearn tensorflow pytorch llm rag langchain openai machine learning data science analytics " +
"excel vba figma sketch adobe photoshop illustrator seo sem hubspot marketo mailchimp google analytics crm erp itil prince2 pmp csm istqb cka aws-certified " +
"typescript golang rust kotlin swift php ruby scala c# .net spring django flask fastapi express nestjs laravel").split(/\s+/);
var SKILLSET = {}; SKILL_HINTS.forEach(function(w){ SKILLSET[w]=1; });

FW.tokens = function(text){
  return String(text||"").toLowerCase().replace(/[^a-z0-9+#./\- ]/g," ").split(/\s+/)
    .map(function(w){ return w.replace(/^[.\-/]+|[.\-/]+$/g,""); })
    .filter(function(w){ return w.length>1 && w.length<28 && !STOPSET[w] && !/^\d+$/.test(w); });
};
/* keywords a job description actually asks for, ranked */
FW.jdKeywords = function(jd, limit){
  var toks = FW.tokens(jd), freq = {}, order = [];
  toks.forEach(function(w){ if(!freq[w]) order.push(w); freq[w]=(freq[w]||0)+1; });
  /* two-word phrases that look like real skills */
  var raw = String(jd||"").toLowerCase().replace(/[^a-z0-9+#. ]/g," ").split(/\s+/);
  for(var i=0;i<raw.length-1;i++){
    var a=raw[i], b=raw[i+1];
    if(STOPSET[a]||STOPSET[b]||a.length<3||b.length<3) continue;
    var ph=a+" "+b;
    if(SKILLSET[a]||SKILLSET[b]){ if(!freq[ph]) order.push(ph); freq[ph]=(freq[ph]||0)+2; }
  }
  return order.map(function(w){ return {kw:w, n:freq[w], skill:!!SKILLSET[w.split(" ")[0]]||!!SKILLSET[w]}; })
    .sort(function(x,y){ return (y.n + (y.skill?6:0)) - (x.n + (x.skill?6:0)); })
    .slice(0, limit||26);
};
FW.keywordGap = function(resumeText, jd){
  var hay = " " + String(resumeText||"").toLowerCase().replace(/[^a-z0-9+#./ ]/g," ") + " ";
  var kws = FW.jdKeywords(jd, 26), have=[], miss=[];
  kws.forEach(function(k){ (hay.indexOf(" "+k.kw) >= 0 || hay.indexOf(k.kw) >= 0 ? have : miss).push(k.kw); });
  return {have:have, missing:miss, total:kws.length,
          pct: kws.length ? Math.round(have.length*100/kws.length) : 0};
};
/* 0-100 match score between a resume and a job (used on /jobs and /j/<id>) */
FW.matchScore = function(resumeText, jobText){
  if(!resumeText || !jobText) return null;
  var g = FW.keywordGap(resumeText, jobText);
  if(!g.total) return null;
  var base = g.pct;
  var titleBoost = 0;
  var firstLine = String(jobText).split("\n")[0].toLowerCase();
  var rt = String(resumeText).toLowerCase();
  firstLine.split(/[^a-z]+/).filter(function(w){ return w.length>3 && !STOPSET[w]; })
    .forEach(function(w){ if(rt.indexOf(w)>=0) titleBoost += 3; });
  return {score: Math.max(8, Math.min(99, Math.round(base*0.82 + Math.min(18, titleBoost)))),
          have:g.have, missing:g.missing};
};

/* ---------------- the 28-check ATS engine (deterministic, runs in the browser) ---------------- */
var STRONG_VERBS = ("led managed built designed developed delivered launched implemented automated migrated reduced increased improved optimized optimised created " +
"architected engineered scaled streamlined negotiated coordinated mentored owned drove established introduced resolved validated tested deployed integrated " +
"analyzed analysed forecast cut saved generated grew accelerated standardized standardised rolled refactored rebuilt shipped").split(/\s+/);
var WEAK_PHRASES = [/responsible for/i,/duties included/i,/tasked with/i,/helped with/i,/worked on/i,/assisted with/i,/involved in/i,/various tasks/i,/team player/i,/hard working/i,/hard-working/i,/go-getter/i,/think outside the box/i,/synergy/i,/results-driven/i,/detail-oriented/i];
var SECTION_RE = {
  experience:/\b(work experience|professional experience|experience|employment history|career history)\b/i,
  education:/\b(education|academic background|qualifications)\b/i,
  skills:/\b(skills|technical skills|core competencies|competencies|tech stack)\b/i,
  summary:/\b(summary|profile|professional summary|about me|objective)\b/i
};
var ODD_HEADINGS = /\b(my journey|toolbox|what i bring|the story so far|my world|beyond work|hobbies)\b/i;

function pct(n,d){ return d? Math.round(n*100/d) : 0; }

/* report = {score, groups:[{name, checks:[{id,title,status,detail}]}], keywords:{have,missing,pct}, meta} */
FW.atsScan = function(opts){
  var text = String(opts.text||"");
  var jd = String(opts.jd||"");
  var filename = opts.filename || "Pasted resume";
  var lines = text.split(/\r?\n/).map(function(l){ return l.trim(); }).filter(Boolean);
  var words = text.split(/\s+/).filter(Boolean);
  var wc = words.length;
  var lower = text.toLowerCase();
  var bullets = lines.filter(function(l){ return /^[•\-\*\u2022\u25cf\u25aa\u2023\u2043o]\s+/.test(l) || /^[A-Z][a-z]+ed\b/.test(l); });
  var groups = [], add = function(g){ groups.push(g); };
  var C = function(id,title,status,detail){ return {id:id,title:title,status:status,detail:detail}; };

  /* 1. Parsing & Readability (5) */
  var g1 = {name:"Parsing & Readability", checks:[]};
  g1.checks.push(C("text_extraction","Text extraction (ATS readability)", wc>120?"pass":(wc>40?"warn":"fail"),
    wc>120 ? "Your resume text parses cleanly ("+wc+" words extracted), so ATS software can read every line."
           : "Only "+wc+" words could be read. An ATS may see the same gap — export as a text-based PDF or DOCX, never a scan or image."));
  var ext = (filename.match(/\.([a-z0-9]+)$/i)||[])[1];
  g1.checks.push(C("file_format","File format", (!ext||/^(pdf|docx|doc|txt)$/i.test(ext))?"pass":"fail",
    !ext ? "Pasted text was analysed directly. For applications, upload a PDF or DOCX — the two formats every major ATS handles best."
         : (/^(pdf|docx|doc|txt)$/i.test(ext) ? "Your resume is a "+ext.toUpperCase()+" file, one of the formats ATS software handles best."
            : "." + ext + " is not reliably parsed. Export to PDF or DOCX instead.")));
  g1.checks.push(C("word_count","Length in words", (wc>=350&&wc<=1100)?"pass":(wc>=220&&wc<=1500?"warn":"fail"),
    (wc>=350&&wc<=1100) ? wc+" words is in the range recruiters and parsers expect (roughly 350–1,100)."
      : (wc<350 ? "At "+wc+" words your resume is thin. Add measurable detail to your recent roles."
                : "At "+wc+" words this reads long. Cut older roles to 2–3 bullets each.")));
  var odd = (text.match(/[\u2500-\u257F\u2580-\u259F\uE000-\uF8FF\u25A0-\u25FF]/g)||[]).length;
  g1.checks.push(C("glyphs","Icons, symbols and special glyphs", odd===0?"pass":(odd<8?"warn":"fail"),
    odd===0 ? "No icon fonts or decorative glyphs were found. Parsers read your contact details as text."
            : odd+" decorative glyph(s) found. Icon fonts often extract as garbage — write \"Email:\" and \"Phone:\" as plain words."));
  var badBullets = (text.match(/^[\u25cf\u2023\u2043\u00bb\u279c\u2794]/gm)||[]).length;
  g1.checks.push(C("bullet_chars","Bullet characters", badBullets===0?"pass":"warn",
    badBullets===0 ? "Bullets use standard characters that every parser maps to a list item."
                   : "Some bullets use unusual markers (»,➜). Use a plain • or - so each achievement stays its own line."));
  add(g1);

  /* 2. Structure & Sections (5) */
  var g2 = {name:"Structure & Sections", checks:[]};
  ["experience","education","skills","summary"].forEach(function(k){
    var found = SECTION_RE[k].test(text);
    var titles = {experience:"Work Experience section", education:"Education section", skills:"Skills section", summary:"Summary / profile section"};
    var need = (k==="summary") ? "warn" : "fail";
    g2.checks.push(C("sec_"+k, titles[k], found?"pass":need,
      found ? "Found a clearly labelled "+k+" section, which is how an ATS maps your history."
            : "No "+k+" heading was found. Add the literal word \""+(k==="summary"?"Summary":k.charAt(0).toUpperCase()+k.slice(1))+"\" as its own line."));
  });
  g2.checks.push(C("standard_headings","Standard section naming", ODD_HEADINGS.test(text)?"warn":"pass",
    ODD_HEADINGS.test(text) ? "Creative headings like \"My Journey\" or \"Toolbox\" are frequently skipped. Rename them to Experience / Skills."
                            : "Your headings use the standard names parsers are built around."));
  add(g2);

  /* 3. Contact & Links (4) */
  var g3 = {name:"Contact Information", checks:[]};
  var email = (text.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/)||[])[0];
  var phone = (text.match(/(\+\d[\d\s().-]{7,}\d)|(\b0\d[\d\s().-]{7,}\d\b)/)||[])[0];
  var li = /linkedin\.com\/(in|pub)\//i.test(text);
  var loc = /\b(amsterdam|rotterdam|utrecht|the hague|den haag|eindhoven|berlin|munich|münchen|hamburg|frankfurt|zurich|zürich|geneva|vienna|brussels|antwerp|paris|madrid|barcelona|lisbon|porto|warsaw|krakow|prague|stockholm|copenhagen|oslo|helsinki|dublin|london|manchester|milan|rome|luxembourg|remote|netherlands|germany|belgium|switzerland|austria|sweden|poland|portugal|spain|ireland|united kingdom|uk|usa|united states)\b/i.test(text)
    || /\b[A-Z][a-z]+,\s*[A-Z][a-zA-Z ]{2,}\b/.test(text);
  g3.checks.push(C("email","Email address", email?"pass":"fail", email ? "Found an email address in the body text where every parser looks for it." : "No email address was found in the resume body. Put it on one line under your name (not in the header image)."));
  g3.checks.push(C("phone","Phone number", phone?"pass":"warn", phone ? "A phone number is present in a format recruiters can dial." : "No phone number detected. Add it with the country code, e.g. +31 6 1234 5678."));
  g3.checks.push(C("linkedin","LinkedIn profile URL", li?"pass":"warn", li ? "Your LinkedIn URL is present as text, so recruiters can click straight through." : "Add your full LinkedIn URL (linkedin.com/in/your-name) as plain text — hyperlinked icons often vanish in parsing."));
  g3.checks.push(C("location","City / country", loc?"pass":"warn", loc ? "A location is stated, which most ATS filters use for shortlisting." : "Add your city and country — many ATS filters sort by location before a human reads anything."));
  add(g3);

  /* 4. Impact & Metrics (4) */
  var g4 = {name:"Impact & Metrics", checks:[]};
  var metricLines = bullets.filter(function(b){ return /\d/.test(b); });
  var metricPct = bullets.length ? pct(metricLines.length, bullets.length) : 0;
  g4.checks.push(C("quantified","Quantified achievements", metricPct>=40?"pass":(metricPct>=20?"warn":"fail"),
    bullets.length===0 ? "No bullet points were detected. Write each achievement as its own bulleted line."
      : metricPct+"% of your bullets contain a number. "+(metricPct>=40?"That is the level recruiters scan for."
        :"Aim for 40%+ — add volume, %, time saved, team size or budget to your strongest bullets.")));
  var nums = (text.match(/\b\d+([.,]\d+)?\s?(%|k|m|eur|usd|€|\$|hours?|days?|weeks?|months?|users?|clients?|people)\b/gi)||[]).length;
  g4.checks.push(C("metrics_present","Numbers and scale", nums>=3?"pass":(nums>=1?"warn":"fail"),
    nums>=3 ? "Found "+nums+" concrete figures (%, currency, volume, time) that prove scale."
            : "Only "+nums+" concrete figure(s). Numbers are what separate a duty from an achievement."));
  var longB = bullets.filter(function(b){ return b.split(/\s+/).length > 34; }).length;
  g4.checks.push(C("bullet_len","Bullet length", longB===0?"pass":(longB<3?"warn":"fail"),
    longB===0 ? "Bullets are a scannable length (under ~34 words each)." : longB+" bullet(s) run long. Split anything over two lines into two achievements."));
  var pronouns = (text.match(/\b(I|me|my|myself)\b/g)||[]).length;
  g4.checks.push(C("pronouns","First-person pronouns", pronouns<=2?"pass":(pronouns<=6?"warn":"fail"),
    pronouns<=2 ? "Your bullets are written in the implied first person recruiters expect."
                : pronouns+" uses of \"I / my\" found. Drop them from bullets: \"Led\" not \"I led\"."));
  add(g4);

  /* 5. Action Verbs (3) */
  var g5 = {name:"Action Verbs & Language", checks:[]};
  var verbStart = bullets.filter(function(b){
    var w = b.replace(/^[^A-Za-z]+/,"").split(/\s+/)[0]||""; return STRONG_VERBS.indexOf(w.toLowerCase())>=0; }).length;
  var verbPct = bullets.length ? pct(verbStart, bullets.length) : 0;
  g5.checks.push(C("verbs_start","Bullets open with a strong verb", verbPct>=50?"pass":(verbPct>=25?"warn":"fail"),
    bullets.length===0 ? "Add bulleted achievements, each opening with an action verb."
      : verbPct+"% of your bullets start with a strong action verb (Led, Built, Reduced...)."+(verbPct>=50?"":" Rewrite the rest to open with one.")));
  var weakHits = WEAK_PHRASES.filter(function(r){ return r.test(text); }).map(function(r){ return String(r).replace(/[/\\i]/g,""); });
  g5.checks.push(C("weak_phrases","Filler and cliché phrases", weakHits.length===0?"pass":(weakHits.length<3?"warn":"fail"),
    weakHits.length===0 ? "No \"responsible for\" filler or recruiter-fatigue clichés found."
      : "Found: "+weakHits.slice(0,4).join(", ")+". Replace each with what you actually achieved."));
  var uniqueVerbs = {}; bullets.forEach(function(b){ var w=(b.replace(/^[^A-Za-z]+/,"").split(/\s+/)[0]||"").toLowerCase(); if(w) uniqueVerbs[w]=1; });
  var uv = Object.keys(uniqueVerbs).length;
  g5.checks.push(C("verb_variety","Verb variety", (bullets.length<4||uv>=Math.min(6,bullets.length-1))?"pass":"warn",
    bullets.length<4 ? "Too few bullets to judge repetition yet." :
    (uv>=Math.min(6,bullets.length-1) ? uv+" different opening verbs across your bullets — no repetition problem."
      : "Only "+uv+" different opening verbs across "+bullets.length+" bullets. Vary them so every role reads distinctly.")));
  add(g5);

  /* 6. Keyword Alignment (4) */
  var gap = jd ? FW.keywordGap(text, jd) : null;
  var g6 = {name:"Keyword Alignment", checks:[]};
  g6.checks.push(C("jd_match","Job description keyword match", !jd?"warn":(gap.pct>=70?"pass":(gap.pct>=45?"warn":"fail")),
    !jd ? "No job description was pasted. Add one and this scan also scores keyword fit for that exact role."
        : gap.pct+"% of this job's key terms appear in your resume ("+gap.have.length+" of "+gap.total+")."+(gap.pct>=70?"":" The missing ones are listed above.")));
  var hard = FW.tokens(text).filter(function(w){ return SKILLSET[w]; });
  var hardU = {}; hard.forEach(function(w){ hardU[w]=1; });
  var hardN = Object.keys(hardU).length;
  g6.checks.push(C("hard_skills","Named hard skills and tools", hardN>=8?"pass":(hardN>=4?"warn":"fail"),
    hardN+" recognised tools/technologies named"+(hardN>=8?". Plenty for keyword filters to match on."
      :". Name the concrete tools you use — parsers match on exact tool names, not on \"various technologies\".")));
  var titleHit = false;
  if(jd){ var jl = jd.split("\n")[0].toLowerCase().split(/[^a-z]+/).filter(function(w){ return w.length>3 && !STOPSET[w]; });
    titleHit = jl.length ? jl.some(function(w){ return lower.indexOf(w)>=0; }) : false; }
  g6.checks.push(C("title_match","Target job title present", !jd?"warn":(titleHit?"pass":"fail"),
    !jd ? "Add a job description to check whether your headline mirrors the advertised title."
      : (titleHit ? "Your resume echoes the advertised job title, which many ATS rank on directly."
                  : "The advertised job title does not appear in your resume. Put it in your headline if it is honestly what you do.")));
  var acro = (text.match(/\b[A-Z]{2,5}\b/g)||[]);
  var acroOk = acro.length===0 || acro.some(function(a){ return new RegExp("\\(" + a + "\\)").test(text) || new RegExp(a + "\\s*\\(").test(text); });
  g6.checks.push(C("acronyms","Acronyms spelled out", acroOk?"pass":"warn",
    acroOk ? "Acronyms appear with their spelled-out form, so both search terms hit."
           : "Spell an acronym out once: \"Continuous Integration (CI)\". Recruiters search both forms."));
  add(g6);

  /* 7. Length & Readability (3) */
  var g7 = {name:"Length & Readability", checks:[]};
  var pages = Math.max(1, Math.round(wc/520));
  g7.checks.push(C("pages","Estimated page count", pages<=2?"pass":"warn",
    "About "+pages+" page(s) at standard formatting."+(pages<=2?" Two pages or fewer is the safe range."
      :" Trim to two pages unless this is an academic CV.")));
  var sentences = text.split(/[.!?]\s/).filter(function(s){ return s.split(/\s+/).length>2; });
  var avgLen = sentences.length ? Math.round(words.length/sentences.length) : 0;
  g7.checks.push(C("sentence_len","Sentence length", (avgLen>0&&avgLen<=24)?"pass":(avgLen<=32?"warn":"fail"),
    avgLen===0 ? "Not enough prose to measure." : "Average sentence runs "+avgLen+" words."+(avgLen<=24?" Easy to scan in six seconds."
      :" Shorten the long ones — recruiters skim.")));
  var dateStyles = 0;
  if(/\b(0[1-9]|1[0-2])\/\d{4}\b/.test(text)) dateStyles++;
  if(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b/.test(text)) dateStyles++;
  if(/\b\d{4}\s*[–\-]\s*(\d{4}|present|current)\b/i.test(text)) dateStyles++;
  g7.checks.push(C("dates","Consistent date format", dateStyles<=1?"pass":"warn",
    dateStyles<=1 ? "Dates use one consistent format across your roles."
                  : dateStyles+" different date formats found. Pick one (e.g. \"Mar 2024 – Present\") and use it everywhere."));
  add(g7);

  /* ---- scoring ---- */
  var all = [], passN = 0, warnN = 0, failN = 0;
  groups.forEach(function(g){ g.checks.forEach(function(c){ all.push(c);
    if(c.status==="pass") passN++; else if(c.status==="warn") warnN++; else failN++; }); });
  var formatChecks = g1.checks.concat(g2.checks, g3.checks, g7.checks);
  var contentChecks = g4.checks.concat(g5.checks);
  var sc = function(arr){ var p=0; arr.forEach(function(c){ p += c.status==="pass"?1:(c.status==="warn"?0.5:0); });
    return arr.length ? Math.round(p*100/arr.length) : 0; };
  var fmt = sc(formatChecks), cont = sc(contentChecks);
  var kwScore = jd ? gap.pct : null;
  var score = jd ? Math.round(fmt*0.4 + cont*0.3 + kwScore*0.3) : Math.round(fmt*0.58 + cont*0.42);
  score = Math.max(4, Math.min(100, score));

  return {
    score: score, format_score: fmt, content_score: cont, keyword_score: kwScore,
    groups: groups, total_checks: all.length, passed: passN, warnings: warnN, failed: failN,
    keywords: gap ? {have:gap.have, missing:gap.missing, pct:gap.pct, total:gap.total} : null,
    meta: {filename: filename, words: wc, bullets: bullets.length, pages: pages, scanned_at: new Date().toISOString()}
  };
};

/* ---------------- score ring painter ---------------- */
FW.ring = function(el, value, label){
  var v = Math.max(0, Math.min(100, Math.round(value||0)));
  var col = v>=80 ? "#0E9F6E" : v>=60 ? "#C2820B" : v>=40 ? "#D97706" : "#DC2626";
  var r = 54, circ = 2*Math.PI*r;
  el.innerHTML = '<svg viewBox="0 0 120 120" aria-hidden="true">' +
    '<circle class="trk" cx="60" cy="60" r="'+r+'" stroke-width="11"></circle>' +
    '<circle class="bar" cx="60" cy="60" r="'+r+'" stroke-width="11" stroke="'+col+'" ' +
      'stroke-dasharray="'+circ.toFixed(1)+'" stroke-dashoffset="'+(circ*(1-v/100)).toFixed(1)+'"></circle></svg>' +
    '<span class="lbl"><b style="color:'+col+'">'+v+'</b><span>'+FW.esc(label||"out of 100")+'</span></span>';
  el.setAttribute("role","img");
  el.setAttribute("aria-label",(label||"score")+": "+v+" out of 100");
};

/* ---------------- file text extraction (PDF / DOCX / TXT) ---------------- */
FW.readFileText = function(file){
  if(!file || typeof file.size !== "number") return Promise.reject(new Error("Choose a PDF, DOCX or TXT file."));
  if(file.size > 10 * 1024 * 1024) return Promise.reject(new Error("Files must be 10 MB or smaller."));
  var name = (file.name||"").toLowerCase();
  var task;
  if(/\\.txt$/.test(name)) task = file.text();
  else if(/\\.docx$/.test(name)) task = FW.docxText(file);
  else if(/\\.pdf$/.test(name)) task = FW.pdfText(file);
  else return Promise.reject(new Error("Unsupported file type. Upload a PDF, DOCX or TXT file."));
  return Promise.resolve(task).then(function(text){
    text = String(text || "");
    if(!text.trim()) throw new Error("No readable text was found. Try another file or paste the resume text.");
    if(text.length > 50000) throw new Error("This resume contains too much text. Keep it under 50,000 characters or paste a shorter version.");
    return text;
  });
};
/* DOCX = a zip; pull word/document.xml with a minimal inflate via DecompressionStream */
FW.docxText = function(file){
  return file.arrayBuffer().then(function(buf){
    var u8 = new Uint8Array(buf), dv = new DataView(buf);
    /* walk local file headers looking for word/document.xml */
    for(var i=0;i<u8.length-4;i++){
      if(dv.getUint32(i,true)===0x04034b50){
        var method = dv.getUint16(i+8,true), csize = dv.getUint32(i+18,true), usize = dv.getUint32(i+22,true);
        var nlen = dv.getUint16(i+26,true), elen = dv.getUint16(i+28,true);
        var name = new TextDecoder().decode(u8.subarray(i+30, i+30+nlen));
        var start = i+30+nlen+elen;
        if(name==="word/document.xml"){
          var data = u8.subarray(start, start + (csize||usize));
          if(method===0) return FW.xmlToText(new TextDecoder().decode(data));
          if(typeof DecompressionStream === "function"){
            var ds = new DecompressionStream("deflate-raw");
            return new Response(new Blob([data]).stream().pipeThrough(ds)).text()
              .then(function(xml){ return FW.xmlToText(xml); });
          }
          throw new Error("This browser cannot unzip DOCX. Paste the text instead.");
        }
      }
    }
    throw new Error("That DOCX could not be read. Paste the text instead.");
  });
};
FW.xmlToText = function(xml){
  return String(xml)
    .replace(/<w:p[ >][\s\S]*?(?=<w:p[ >]|$)/g, function(m){ return m + "\n"; })
    .replace(/<\/w:p>/g,"\n").replace(/<w:tab\/>/g," ").replace(/<w:br\/>/g,"\n")
    .replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\n{3,}/g,"\n\n").trim();
};
/* PDF text: pull uncompressed + FlateDecode content streams and read the text-showing operators */
FW.pdfText = function(file){
  return file.arrayBuffer().then(function(buf){
    var u8 = new Uint8Array(buf);
    var marker = [0x73,0x74,0x72,0x65,0x61,0x6d]; /* "stream" */
    var chunks = [], i = 0;
    function find(from){
      outer: for(var p=from;p<u8.length-6;p++){
        for(var k=0;k<6;k++) if(u8[p+k]!==marker[k]) continue outer;
        return p;
      }
      return -1;
    }
    var jobs = [];
    while((i = find(i)) !== -1){
      var s = i+6;
      if(u8[s]===13) s++;
      if(u8[s]===10) s++;
      /* endstream */
      var e = s;
      outer2: for(var p=s;p<u8.length-9;p++){
        if(u8[p]===0x65&&u8[p+1]===0x6e&&u8[p+2]===0x64&&u8[p+3]===0x73&&u8[p+4]===0x74&&u8[p+5]===0x72&&u8[p+6]===0x65&&u8[p+7]===0x61&&u8[p+8]===0x6d){ e=p; break outer2; }
      }
      if(e<=s){ i = s; continue; }
      jobs.push(u8.subarray(s,e));
      i = e+9;
      if(jobs.length>400) break;
    }
    var decodeChunk = function(data){
      var looksFlate = data.length>2 && (data[0]&0x0f)===8;
      if(!looksFlate || typeof DecompressionStream!=="function")
        return Promise.resolve(new TextDecoder("latin1").decode(data));
      return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate"))).text()
        .catch(function(){ return new TextDecoder("latin1").decode(data); });
    };
    return Promise.all(jobs.map(decodeChunk)).then(function(parts){
      var out = [];
      parts.join("\n").replace(/\[((?:[^\]\\]|\\.)*)\]\s*TJ|\(((?:[^)\\]|\\.)*)\)\s*Tj|T\*|\bTd\b|\bTD\b|\bET\b/g, function(m, arr, str){
        if(arr!=null){
          var s = "";
          arr.replace(/\(((?:[^)\\]|\\.)*)\)|(-?\d+(?:\.\d+)?)/g, function(mm, t, num){
            if(t!=null) s += t.replace(/\\([()\\])/g,"$1").replace(/\\n/g,"\n");
            else if(Math.abs(parseFloat(num))>180) s += " ";
            return "";
          });
          out.push(s);
        } else if(str!=null){ out.push(str.replace(/\\([()\\])/g,"$1")); }
        else { out.push("\n"); }
        return "";
      });
      var text = out.join("").replace(/\u0000/g,"").replace(/[ \t]{2,}/g," ").replace(/\n{3,}/g,"\n\n").trim();
      if(text.replace(/\s/g,"").length < 60)
        throw new Error("This PDF holds no extractable text (it looks scanned). An ATS sees the same nothing — paste the text instead.");
      return text;
    });
  });
};

/* ---------------- parse plain resume text into the structured doc ---------------- */
FW.parseResume = function(text){
  var lines = String(text||"").split(/\r?\n/).map(function(l){ return l.replace(/\s+$/,""); });
  var nonEmpty = lines.filter(function(l){ return l.trim(); });
  var doc = FW.emptyDoc();
  if(!nonEmpty.length) return doc;
  doc.name = nonEmpty[0].replace(/^[^A-Za-z]+/,"").slice(0,70);
  var email = (text.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/)||[])[0] || "";
  var phone = (text.match(/(\+\d[\d\s().-]{7,}\d)|(\b0\d[\d\s().-]{7,}\d\b)/)||[])[0] || "";
  var li = (text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+/i)||[])[0] || "";
  doc.email = email; doc.phone = (phone||"").trim(); doc.linkedin = li;
  var locm = text.match(/\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)?),\s*(Netherlands|Germany|Belgium|Switzerland|Austria|Sweden|Poland|Portugal|Spain|Ireland|France|Italy|Luxembourg|Denmark|Norway|Finland|Czechia|United Kingdom|UK|USA|United States|Remote)\b/);
  doc.location = locm ? locm[0] : "";
  if(nonEmpty[1] && nonEmpty[1].length < 70 && !/@|\d{4}/.test(nonEmpty[1])) doc.role = nonEmpty[1].trim();

  /* split into sections by heading-looking lines */
  var HEAD = /^(work experience|professional experience|experience|employment(?: history)?|career history|education|qualifications|skills|technical skills|core competencies|competencies|tech stack|summary|profile|professional summary|objective|about me|projects|certifications|certificates|languages|awards|publications|volunteering|interests)\b[:\s]*$/i;
  var cur = "head", buckets = {head:[]};
  lines.forEach(function(l){
    var t = l.trim();
    if(HEAD.test(t)){ cur = t.toLowerCase().replace(/[:\s]+$/,""); buckets[cur] = buckets[cur]||[]; return; }
    (buckets[cur] = buckets[cur]||[]).push(l);
  });
  var pick = function(res){ for(var k in buckets){ if(res.test(k)) return buckets[k]; } return null; };
  var sum = pick(/summary|profile|objective|about me/);
  if(sum) doc.summary = sum.join(" ").replace(/\s+/g," ").trim().slice(0,900);
  var sk = pick(/skills|competenc|tech stack/);
  if(sk){
    var items = sk.join(", ").split(/[,;•|\u2022\n]/).map(function(s){ return s.replace(/^[\s\-•*]+/,"").trim(); })
      .filter(function(s){ return s.length>1 && s.length<40; });
    doc.skills = items.slice(0,28);
  }
  var exp = pick(/experience|employment|career/);
  if(exp){
    var cu = null;
    exp.forEach(function(l){
      var t = l.trim(); if(!t) return;
      var isBullet = /^[•\-\*\u2022\u25cf\u2023o]\s+/.test(t);
      var dates = t.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{2}\/\d{4}|\d{4})\s*[–\-—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{2}\/\d{4}|\d{4}|Present|Current|Now)/i);
      if(!isBullet && (dates || (t.length<90 && /[A-Za-z]/.test(t) && !/[.!?]$/.test(t) && cu===null))){
        cu = {title:"", company:"", when: dates?dates[0]:"", location:"", bullets:[]};
        var rest = t.replace(dates?dates[0]:"", "").replace(/[|•\u2022]+/g,"@@").replace(/\s{2,}/g,"@@").trim();
        var parts = rest.split("@@").map(function(s){ return s.replace(/^[\s,\-–]+|[\s,\-–]+$/g,""); }).filter(Boolean);
        cu.title = parts[0]||""; cu.company = parts[1]||""; cu.location = parts[2]||"";
        doc.experience.push(cu);
      } else if(cu){
        if(isBullet) cu.bullets.push(t.replace(/^[•\-\*\u2022\u25cf\u2023o]\s+/,"").trim());
        else if(cu.bullets.length) cu.bullets[cu.bullets.length-1] += " " + t;
        else if(!cu.company) cu.company = t.slice(0,80);
        else cu.bullets.push(t);
      }
    });
    doc.experience = doc.experience.filter(function(e){ return e.title || e.company || e.bullets.length; }).slice(0,8);
  }
  var ed = pick(/education|qualifications/);
  if(ed){
    var buf = ed.filter(function(l){ return l.trim(); });
    for(var i2=0;i2<buf.length;i2++){
      var t2 = buf[i2].trim(); if(t2.length<3) continue;
      var dm = t2.match(/\b(19|20)\d{2}\b(\s*[–\-]\s*((19|20)\d{2}|Present))?/i);
      doc.education.push({degree:t2.replace(dm?dm[0]:"","").replace(/[,|•\u2022]+/g," ").replace(/\s{2,}/g," ").trim().slice(0,110),
        school: (buf[i2+1]&&buf[i2+1].trim().length<80&&!/\d{4}/.test(buf[i2+1])) ? (i2++, buf[i2].trim()) : "",
        when: dm?dm[0]:""});
      if(doc.education.length>=5) break;
    }
  }
  var cert = pick(/certificat/);
  if(cert) doc.certifications = cert.join("\n").split(/\n|[•\u2022]/).map(function(s){ return s.replace(/^[\s\-*]+/,"").trim(); }).filter(function(s){ return s.length>2; }).slice(0,10);
  var lang = pick(/languages/);
  if(lang) doc.languages = lang.join(", ").split(/[,;•\u2022\n]/).map(function(s){ return s.trim(); }).filter(function(s){ return s.length>1 && s.length<40; }).slice(0,8);
  var proj = pick(/projects/);
  if(proj){
    var pl = proj.filter(function(l){ return l.trim(); });
    for(var j=0;j<pl.length && doc.projects.length<5;j++){
      var line = pl[j].trim().replace(/^[\s\-•*]+/,"");
      if(line.length>2) doc.projects.push({name: line.slice(0,70), detail: (pl[j+1]&&pl[j+1].trim().length>40)?(j++, pl[j].trim().slice(0,220)):""});
    }
  }
  return doc;
};

FW.emptyDoc = function(){
  return {name:"", role:"", email:"", phone:"", location:"", linkedin:"", website:"", summary:"",
    experience:[], education:[], skills:[], projects:[], certifications:[], languages:[],
    custom:{title:"", items:[]},
    order:["summary","experience","education","skills","projects","certifications","languages","custom"]};
};
FW.emptyTheme = function(){
  return {tpl:"ats-harvard", accent:"#4F23E6", font:"Inter", size:10.2, spacing:1.42, margin:16, zoom:0.82};
};
FW.docText = function(doc){
  var out = [doc.name, doc.role, [doc.email, doc.phone, doc.location, doc.linkedin, doc.website].filter(Boolean).join(" | ")];
  if(doc.summary) out.push("Summary", doc.summary);
  if(doc.experience && doc.experience.length){
    out.push("Experience");
    doc.experience.forEach(function(e){
      out.push([e.title, e.company, e.location, e.when].filter(Boolean).join(" | "));
      (e.bullets||[]).forEach(function(b){ out.push("• " + b); });
    });
  }
  if(doc.education && doc.education.length){ out.push("Education");
    doc.education.forEach(function(e){ out.push([e.degree, e.school, e.when].filter(Boolean).join(" | ")); }); }
  if(doc.skills && doc.skills.length) out.push("Skills", doc.skills.join(", "));
  if(doc.projects && doc.projects.length){ out.push("Projects");
    doc.projects.forEach(function(p){ out.push(p.name + (p.detail?": "+p.detail:"")); }); }
  if(doc.certifications && doc.certifications.length) out.push("Certifications", doc.certifications.join("; "));
  if(doc.languages && doc.languages.length) out.push("Languages", doc.languages.join(", "));
  if(doc.custom && doc.custom.items && doc.custom.items.length) out.push(doc.custom.title||"Additional", doc.custom.items.join("; "));
  return out.filter(Boolean).join("\n");
};

/* ---------------- sample resumes ---------------- */
FW.samples = {
  qa:{label:"QA / Automation Engineer", doc:{
    name:"Alex Moreau", role:"Senior QA Automation Engineer", email:"alex.moreau@example.com", phone:"+31 6 1234 5678",
    location:"Amsterdam, Netherlands", linkedin:"linkedin.com/in/alexmoreau", website:"",
    summary:"Senior QA Automation Engineer with 8 years in payments and SaaS platforms. Builds Playwright and API test suites that catch regressions before release, and coaches teams on testable design and CI quality gates.",
    experience:[
      {title:"Senior QA Automation Engineer", company:"Mollie", location:"Amsterdam", when:"Mar 2022 – Present", bullets:[
        "Rebuilt the end-to-end suite in Playwright and TypeScript, cutting the regression run from 4 hours to 38 minutes",
        "Introduced contract tests across 12 payment APIs, reducing integration defects reaching production by 61%",
        "Wired quality gates into GitHub Actions so no build merges below 85% critical-path coverage",
        "Mentored 5 engineers on test design and review of agent-written tests"]},
      {title:"QA Engineer", company:"Adyen", location:"Amsterdam", when:"Jun 2018 – Feb 2022", bullets:[
        "Automated 240 manual regression cases with Cypress and Postman, freeing 3 days per release cycle",
        "Led risk-based test planning for a card-issuing launch across 6 European markets",
        "Built a flaky-test dashboard that cut re-runs in CI by 44%"]}],
    education:[{degree:"BSc Computer Science", school:"University of Amsterdam", when:"2014 – 2018"}],
    skills:["Playwright","TypeScript","Cypress","Postman","REST API testing","CI/CD","GitHub Actions","Jira","SQL","Docker","Test strategy","Risk-based testing","ISTQB","Agile"],
    projects:[], certifications:["ISTQB Advanced Test Analyst (2021)"], languages:["English (fluent)","French (native)","Dutch (B1)"],
    custom:{title:"",items:[]},
    order:["summary","experience","education","skills","certifications","languages","projects","custom"]}},
  pm:{label:"Product Manager", doc:{
    name:"Priya Raghavan", role:"Senior Product Manager", email:"priya.r@example.com", phone:"+49 151 234 5678",
    location:"Berlin, Germany", linkedin:"linkedin.com/in/priyaraghavan", website:"",
    summary:"Product Manager for B2B SaaS with 7 years shipping data and workflow products. Runs discovery with real users, writes the decision down, and ships in small increments against clear success metrics.",
    experience:[
      {title:"Senior Product Manager", company:"Personio", location:"Berlin", when:"Jan 2023 – Present", bullets:[
        "Owned the onboarding product line, lifting activation from 46% to 68% in three quarters",
        "Ran 40+ customer discovery interviews and cut the roadmap from 14 bets to 4 funded ones",
        "Shipped a self-serve import flow that removed 1,100 support tickets a quarter",
        "Aligned engineering, design and sales on one quarterly metric tree"]},
      {title:"Product Manager", company:"Contentful", location:"Berlin", when:"Aug 2019 – Dec 2022", bullets:[
        "Launched role-based permissions used by 2,300 enterprise accounts in the first year",
        "Introduced weekly usage reviews that reduced feature rollback rate by 30%"]}],
    education:[{degree:"MSc Management", school:"TU Munich", when:"2016 – 2018"},{degree:"BEng Information Technology", school:"Anna University", when:"2011 – 2015"}],
    skills:["Product discovery","Roadmapping","SQL","Amplitude","A/B testing","Jira","Figma","Stakeholder management","OKRs","B2B SaaS","Pricing","Go-to-market"],
    projects:[], certifications:[], languages:["English (fluent)","German (B2)","Tamil (native)"],
    custom:{title:"",items:[]},
    order:["summary","experience","education","skills","languages","projects","certifications","custom"]}},
  data:{label:"Data Analyst", doc:{
    name:"Tomás Silva", role:"Data Analyst", email:"tomas.silva@example.com", phone:"+351 91 234 5678",
    location:"Lisbon, Portugal", linkedin:"linkedin.com/in/tomassilva", website:"",
    summary:"Data Analyst with 5 years turning product and finance data into decisions. Strong SQL and dbt, builds dashboards people actually open, and writes the caveats next to the number.",
    experience:[
      {title:"Data Analyst", company:"Feedzai", location:"Lisbon", when:"Apr 2022 – Present", bullets:[
        "Built the fraud-ops reporting layer in dbt and Snowflake, cutting report build time by 70%",
        "Modelled chargeback drivers across 4M transactions and found a rule change worth €420k a year",
        "Replaced 9 ad-hoc spreadsheets with one governed Looker dashboard used daily by 60 people"]},
      {title:"Junior Analyst", company:"Farfetch", location:"Porto", when:"Sep 2020 – Mar 2022", bullets:[
        "Automated weekly merchandising reports in Python, saving 6 hours a week",
        "Ran the A/B analysis for checkout changes that lifted conversion 3.1%"]}],
    education:[{degree:"BSc Economics", school:"Nova SBE", when:"2017 – 2020"}],
    skills:["SQL","Python","dbt","Snowflake","Looker","Tableau","Pandas","Statistics","A/B testing","Airflow","Excel","Data modelling"],
    projects:[], certifications:["dbt Analytics Engineering (2023)"], languages:["Portuguese (native)","English (fluent)","Spanish (B2)"],
    custom:{title:"",items:[]},
    order:["summary","experience","education","skills","certifications","languages","projects","custom"]}},
  mkt:{label:"Marketing Lead", doc:{
    name:"Hanna Weber", role:"Marketing Lead", email:"hanna.weber@example.com", phone:"+43 660 123 4567",
    location:"Vienna, Austria", linkedin:"linkedin.com/in/hannaweber", website:"",
    summary:"Marketing Lead for B2B software with 9 years across demand generation, lifecycle and brand. Builds channel mixes that pay back inside two quarters and reports on pipeline, not impressions.",
    experience:[
      {title:"Marketing Lead", company:"Bitpanda", location:"Vienna", when:"Feb 2022 – Present", bullets:[
        "Grew marketing-sourced pipeline 2.4x in 18 months on a flat budget",
        "Rebuilt lifecycle email in HubSpot, raising trial-to-paid conversion from 9% to 14%",
        "Led a brand refresh across 3 markets, lifting organic traffic 58% year on year"]},
      {title:"Growth Marketing Manager", company:"Dynatrace", location:"Linz", when:"May 2017 – Jan 2022", bullets:[
        "Ran paid search and content for DACH, cutting cost per qualified lead by 37%",
        "Launched a webinar programme that generated 1,900 qualified leads in year one"]}],
    education:[{degree:"MA Communication Science", school:"University of Vienna", when:"2013 – 2016"}],
    skills:["Demand generation","HubSpot","SEO","Google Ads","Content strategy","Lifecycle marketing","Analytics","Positioning","Budget ownership","Team leadership"],
    projects:[], certifications:[], languages:["German (native)","English (fluent)"],
    custom:{title:"",items:[]},
    order:["summary","experience","education","skills","languages","projects","certifications","custom"]}}
};
})();
