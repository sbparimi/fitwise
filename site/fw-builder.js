/* /builder — split-screen editor, live A4 preview, 20 templates, per-bullet AI Enhance, Copilot drawer,
   crisp PDF (print of live text) and real DOCX export. Local-first; cloud sync when signed in. */
(function(){
"use strict";
function init(){
var FW = window.FW; if(!FW || !FW.TEMPLATES) return;
var $ = FW.$, E = FW.esc;
var Q = new URLSearchParams(location.search);

/* ---------------- state ---------------- */
var rec = null;
function fresh(doc, title){
  return {id: FW.store.newId(), title: title || "Untitled resume", doc: doc || FW.emptyDoc(),
    theme: FW.emptyTheme(), ats_score: 0};
}
rec = FW.store.active() || fresh(FW.emptyDoc());
if(!rec.theme) rec.theme = FW.emptyTheme();
if(Q.get("sample") && FW.samples[Q.get("sample")]){
  var s = FW.samples[Q.get("sample")];
  rec = fresh(JSON.parse(JSON.stringify(s.doc)), s.doc.name + " — " + s.doc.role);
}
/* ?tpl= wins over whatever the record carried, and is applied after any ?sample= swap */
if(Q.get("tpl") && FW.TPL_BY_SLUG[Q.get("tpl")]) rec.theme.tpl = Q.get("tpl");
var jdText = "";
try{ jdText = sessionStorage.getItem("fw_last_jd") || ""; }catch(e){}
/* a job handed over from /jobs or /j/<id> */
if(Q.get("job") || Q.get("title")){
  var jt = [Q.get("title"), Q.get("company"), Q.get("location")].filter(Boolean).join("\n");
  if(jt) jdText = jt + (jdText ? "\n\n" + jdText : "");
}

/* ---------------- preview ---------------- */
var paper = $("paper"), scaler = $("scaler");
function paint(){
  FW.renderResume(paper, rec.doc, rec.theme);
  var z = rec.theme.zoom || 0.82;
  scaler.style.transform = "scale(" + z + ")";
  var rz = paper.querySelector(".rz");
  if(rz){ scaler.style.height = (rz.offsetHeight * z) + "px"; scaler.style.width = (rz.offsetWidth) + "px"; }
  $("zLbl").textContent = Math.round(z*100) + "%";
  score();
}
var score = FW.debounce(function(){
  var r = FW.atsScan({text: FW.docText(rec.doc), jd: jdText, filename: (rec.title||"resume") + ".pdf"});
  rec.ats_score = r.score;
  FW.ring($("miniRing"), r.score, "ATS");
  $("miniScore").textContent = r.score + "/100";
}, 320);
var repaint = FW.debounce(paint, 180);

function save(quiet){
  rec.title = ($("resTitle").value||"").trim() || "Untitled resume";
  FW.store.save(rec);
  if(!quiet) FW.toast("Saved in this browser" + (FW.cloud.me ? " and synced to your account" : ""));
  renderLocalList();
}
var autosave = FW.debounce(function(){ save(true); }, 1200);
function touched(){ repaint(); autosave(); }

/* ---------------- tabs ---------------- */
document.querySelectorAll(".btabs button").forEach(function(b){
  b.addEventListener("click", function(){
    document.querySelectorAll(".btabs button").forEach(function(x){ x.setAttribute("aria-selected","false"); });
    b.setAttribute("aria-selected","true");
    ["start","content","design","tailor"].forEach(function(p){ $("pane-"+p).classList.toggle("hide", p !== b.getAttribute("data-pane")); });
    if(b.getAttribute("data-pane")==="content") renderContent();
    if(b.getAttribute("data-pane")==="design") renderDesign();
  });
});
function goTab(name){
  var b = document.querySelector('.btabs button[data-pane="'+name+'"]'); if(b) b.click();
}

/* ---------------- start pane ---------------- */
$("sScratch").addEventListener("click", function(){ rec = fresh(FW.emptyDoc(), "My resume"); $("resTitle").value = rec.title; paint(); renderContent(); goTab("content"); });
$("sUpload").addEventListener("click", function(){ $("bFile").click(); });
$("sPaste").addEventListener("click", function(){ $("pasteBox").classList.toggle("hide"); $("sampleBox").classList.add("hide"); });
$("sSample").addEventListener("click", function(){ $("sampleBox").classList.toggle("hide"); $("pasteBox").classList.add("hide"); });
$("bFile").addEventListener("change", function(){
  var f = this.files[0]; if(!f) return;
  FW.toast("Reading " + f.name + "…");
  FW.readFileText(f).then(function(t){
    var doc = FW.parseResume(t);
    rec = fresh(doc, (doc.name ? doc.name + " — " + (doc.role||"Resume") : f.name.replace(/\.[a-z]+$/i,"")));
    $("resTitle").value = rec.title; paint(); renderContent(); goTab("content");
    FW.toast("Parsed — check each section and fix anything the parser guessed");
  }).catch(function(e){ FW.toast(e.message || "Could not read that file"); });
});
$("pasteGo").addEventListener("click", function(){
  var t = ($("pasteText").value||"").trim();
  if(t.length < 40){ FW.toast("Paste a bit more text first"); return; }
  var doc = FW.parseResume(t);
  rec = fresh(doc, doc.name ? doc.name + " — " + (doc.role||"Resume") : "Pasted resume");
  $("resTitle").value = rec.title; paint(); renderContent(); goTab("content");
});
$("sampleList").innerHTML = Object.keys(FW.samples).map(function(k){
  return '<button class="start-card" type="button" data-s="'+k+'"><b>'+E(FW.samples[k].label)+'</b><span>'+E(FW.samples[k].doc.name)+'</span></button>';
}).join("");
$("sampleList").addEventListener("click", function(e){
  var b = e.target.closest("[data-s]"); if(!b) return;
  var s = FW.samples[b.getAttribute("data-s")];
  rec = fresh(JSON.parse(JSON.stringify(s.doc)), s.doc.name + " — " + s.doc.role);
  $("resTitle").value = rec.title; paint(); renderContent(); goTab("content");
});
function renderLocalList(){
  var all = FW.store.all();
  var el = $("localList");
  if(!all.length){ el.innerHTML = "Nothing saved yet."; return; }
  el.innerHTML = all.slice(0,6).map(function(r){
    return '<button class="start-card" type="button" data-open="'+E(r.id)+'" style="margin-top:8px"><b>'+E(r.title||"Untitled")+'</b>' +
      '<span>ATS '+(r.ats_score||0)+'/100 · updated '+new Date(r.updated_at||Date.now()).toLocaleDateString()+'</span></button>';
  }).join("");
  el.querySelectorAll("[data-open]").forEach(function(b){
    b.addEventListener("click", function(){
      var r = FW.store.get(b.getAttribute("data-open")); if(!r) return;
      rec = r; if(!rec.theme) rec.theme = FW.emptyTheme();
      FW.store.setActive(rec.id); $("resTitle").value = rec.title || "";
      paint(); renderContent(); renderDesign(); goTab("content");
    });
  });
}

/* ---------------- content editor ---------------- */
function fld(label, val, path, type, ph){
  return '<div class="fld"><label>'+E(label)+'</label>' +
    (type==="area" ? '<textarea data-p="'+path+'" placeholder="'+E(ph||"")+'">'+E(val||"")+'</textarea>'
                   : '<input type="text" data-p="'+path+'" value="'+E(val||"")+'" placeholder="'+E(ph||"")+'">') + '</div>';
}
function renderContent(){
  var d = rec.doc;
  var h = "";
  h += '<details class="acc" open><summary>Personal details</summary><div class="acc-body">' +
    '<div class="row2">' + fld("Full name", d.name, "name", "", "Alex Moreau") + fld("Headline / target title", d.role, "role", "", "Senior QA Automation Engineer") + '</div>' +
    '<div class="row2">' + fld("Email", d.email, "email", "", "you@example.com") + fld("Phone", d.phone, "phone", "", "+31 6 1234 5678") + '</div>' +
    '<div class="row2">' + fld("City, country", d.location, "location", "", "Amsterdam, Netherlands") + fld("LinkedIn URL", d.linkedin, "linkedin", "", "linkedin.com/in/you") + '</div>' +
    fld("Website or portfolio", d.website, "website", "", "yoursite.com") + '</div></details>';

  h += '<details class="acc" open><summary>Professional summary <small>' + ((d.summary||"").split(/\s+/).filter(Boolean).length) + ' words</small></summary><div class="acc-body">' +
    fld("Summary", d.summary, "summary", "area", "Three or four lines: what you do, for whom, and the result you are known for.") +
    '<button class="addbtn" type="button" data-ai="summary">✦ AI Enhance summary</button></div></details>';

  h += '<details class="acc" open><summary>Experience <small>' + (d.experience||[]).length + ' role(s)</small></summary><div class="acc-body" id="expWrap">';
  (d.experience||[]).forEach(function(e, i){
    h += '<div class="item" data-exp="'+i+'"><div class="item-head"><b>Role ' + (i+1) + '</b><div class="item-tools">' +
      (i>0 ? '<button class="ibtn" type="button" data-move="exp:'+i+':-1" aria-label="Move up">↑</button>' : "") +
      (i < d.experience.length-1 ? '<button class="ibtn" type="button" data-move="exp:'+i+':1" aria-label="Move down">↓</button>' : "") +
      '<button class="ibtn danger" type="button" data-del="exp:'+i+'" aria-label="Delete role">✕</button></div></div>' +
      '<div class="row2">' + fld("Job title", e.title, "experience."+i+".title") + fld("Company", e.company, "experience."+i+".company") + '</div>' +
      '<div class="row2">' + fld("Dates", e.when, "experience."+i+".when", "", "Mar 2022 – Present") + fld("Location", e.location, "experience."+i+".location") + '</div>' +
      '<label style="font-weight:700;font-size:.88rem;display:block;margin:4px 0 6px">Achievements</label>';
    (e.bullets||[]).forEach(function(b, j){
      h += '<div class="blt"><textarea data-p="experience.'+i+'.bullets.'+j+'" placeholder="Start with a verb, end with a number">'+E(b)+'</textarea>' +
        '<div class="blt-tools"><button class="ibtn" type="button" data-ai="bullet:'+i+':'+j+'" title="AI Enhance this bullet">✦</button>' +
        '<button class="ibtn danger" type="button" data-del="blt:'+i+':'+j+'" title="Delete bullet">✕</button></div></div>';
    });
    h += '<button class="addbtn" type="button" data-add="blt:'+i+'">+ Add achievement</button></div>';
  });
  h += '<button class="addbtn" type="button" data-add="exp" style="margin-top:6px">+ Add a role</button></div></details>';

  h += '<details class="acc"><summary>Education <small>' + (d.education||[]).length + '</small></summary><div class="acc-body">';
  (d.education||[]).forEach(function(e,i){
    h += '<div class="item"><div class="item-head"><b>Entry ' + (i+1) + '</b><div class="item-tools">' +
      '<button class="ibtn danger" type="button" data-del="edu:'+i+'">✕</button></div></div>' +
      fld("Degree / qualification", e.degree, "education."+i+".degree") +
      '<div class="row2">' + fld("School", e.school, "education."+i+".school") + fld("Years", e.when, "education."+i+".when") + '</div></div>';
  });
  h += '<button class="addbtn" type="button" data-add="edu">+ Add education</button></div></details>';

  h += '<details class="acc"><summary>Skills <small>' + (d.skills||[]).length + '</small></summary><div class="acc-body">' +
    '<div class="fld"><label>One per line, or comma separated</label><textarea data-list="skills">' + E((d.skills||[]).join("\n")) + '</textarea></div>' +
    '<div class="chips">' + (d.skills||[]).map(function(s){ return '<span class="chip n">'+E(s)+'</span>'; }).join("") + '</div></div></details>';

  h += '<details class="acc"><summary>Projects <small>' + (d.projects||[]).length + '</small></summary><div class="acc-body">';
  (d.projects||[]).forEach(function(p,i){
    h += '<div class="item"><div class="item-head"><b>Project ' + (i+1) + '</b><div class="item-tools"><button class="ibtn danger" type="button" data-del="proj:'+i+'">✕</button></div></div>' +
      fld("Name", p.name, "projects."+i+".name") + fld("What it was and what came of it", p.detail, "projects."+i+".detail", "area") + '</div>';
  });
  h += '<button class="addbtn" type="button" data-add="proj">+ Add project</button></div></details>';

  h += '<details class="acc"><summary>Certifications <small>' + (d.certifications||[]).length + '</small></summary><div class="acc-body">' +
    '<div class="fld"><label>One per line</label><textarea data-list="certifications">' + E((d.certifications||[]).join("\n")) + '</textarea></div></div></details>';
  h += '<details class="acc"><summary>Languages <small>' + (d.languages||[]).length + '</small></summary><div class="acc-body">' +
    '<div class="fld"><label>One per line, e.g. “Dutch (B2)”</label><textarea data-list="languages">' + E((d.languages||[]).join("\n")) + '</textarea></div></div></details>';
  var c = d.custom || {title:"", items:[]};
  h += '<details class="acc"><summary>Custom section</summary><div class="acc-body">' +
    fld("Section title", c.title, "custom.title", "", "Volunteering, Publications, Awards…") +
    '<div class="fld"><label>Items, one per line</label><textarea data-list="custom.items">' + E((c.items||[]).join("\n")) + '</textarea></div></div></details>';

  $("pane-content").innerHTML = h;
  wireContent();
}
function setPath(path, val){
  var parts = path.split("."), o = rec.doc;
  for(var i=0;i<parts.length-1;i++){ o = o[parts[i]]; if(o==null) return; }
  o[parts[parts.length-1]] = val;
}
function getPath(path){
  var parts = path.split("."), o = rec.doc;
  for(var i=0;i<parts.length;i++){ if(o==null) return ""; o = o[parts[i]]; }
  return o;
}
function wireContent(){
  var p = $("pane-content");
  p.querySelectorAll("[data-p]").forEach(function(el){
    el.addEventListener("input", function(){ setPath(el.getAttribute("data-p"), el.value); touched(); });
  });
  p.querySelectorAll("[data-list]").forEach(function(el){
    el.addEventListener("input", function(){
      var items = el.value.split(/[\n,;]/).map(function(s){ return s.trim(); }).filter(Boolean);
      var key = el.getAttribute("data-list");
      if(key === "custom.items"){ rec.doc.custom = rec.doc.custom || {title:"",items:[]}; rec.doc.custom.items = items; }
      else rec.doc[key] = items;
      touched();
    });
  });
  p.addEventListener("click", function(e){
    var add = e.target.closest("[data-add]"), del = e.target.closest("[data-del]"),
        mv = e.target.closest("[data-move]"), ai = e.target.closest("[data-ai]");
    if(add){
      var a = add.getAttribute("data-add").split(":");
      if(a[0]==="exp") rec.doc.experience.push({title:"",company:"",when:"",location:"",bullets:[""]});
      if(a[0]==="blt") rec.doc.experience[+a[1]].bullets.push("");
      if(a[0]==="edu") rec.doc.education.push({degree:"",school:"",when:""});
      if(a[0]==="proj") rec.doc.projects.push({name:"",detail:""});
      renderContent(); touched(); return;
    }
    if(del){
      var dsp = del.getAttribute("data-del").split(":");
      if(dsp[0]==="exp") rec.doc.experience.splice(+dsp[1],1);
      if(dsp[0]==="blt") rec.doc.experience[+dsp[1]].bullets.splice(+dsp[2],1);
      if(dsp[0]==="edu") rec.doc.education.splice(+dsp[1],1);
      if(dsp[0]==="proj") rec.doc.projects.splice(+dsp[1],1);
      renderContent(); touched(); return;
    }
    if(mv){
      var m = mv.getAttribute("data-move").split(":"), i = +m[1], dir = +m[2];
      var arr = rec.doc.experience, t = arr[i]; arr[i] = arr[i+dir]; arr[i+dir] = t;
      renderContent(); touched(); return;
    }
    if(ai) aiEnhance(ai);
  });
}

/* ---------------- AI enhance ---------------- */
function aiEnhance(btn){
  var spec = btn.getAttribute("data-ai").split(":");
  var original, apply;
  if(spec[0]==="summary"){
    original = rec.doc.summary || "";
    if(original.trim().length < 20){ FW.toast("Write a line or two first, then Fitwise sharpens it"); return; }
    apply = function(t){ rec.doc.summary = t; };
  } else {
    var i = +spec[1], j = +spec[2];
    original = (rec.doc.experience[i].bullets||[])[j] || "";
    if(original.trim().length < 10){ FW.toast("Write the bullet first — Fitwise rewrites, it never invents"); return; }
    apply = function(t){ rec.doc.experience[i].bullets[j] = t; };
  }
  var label = btn.innerHTML;
  btn.innerHTML = '<span class="spin dark"></span>'; btn.classList.add("is-busy");
  FW.api("/api/ai/enhance-bullet", {bullet: original, role: rec.doc.role || "", jd: jdText})
    .then(function(j2){
      btn.innerHTML = label; btn.classList.remove("is-busy");
      if(j2 && j2.improved){
        apply(j2.improved); renderContent(); touched();
        FW.toast((j2.note || "Enhanced") + " · " + (j2.engine==="built-in-engine" ? "built-in engine" : j2.engine));
      } else FW.toast("Could not enhance that line — try again");
    })
    .catch(function(){ btn.innerHTML = label; btn.classList.remove("is-busy"); FW.toast("Network hiccup — try that again"); });
}

/* ---------------- design pane ---------------- */
var ACCENTS = ["#4F23E6","#1D4ED8","#0E9F6E","#B4267A","#B45309","#0F766E","#15181F","#7C3AED"];
function renderDesign(){
  $("tplNow").textContent = (FW.TPL_BY_SLUG[rec.theme.tpl]||{}).name || "";
  $("tplPick").innerHTML = FW.TEMPLATES.map(function(t){
    return '<button type="button" data-t="'+t.slug+'" aria-pressed="'+(t.slug===rec.theme.tpl)+'">' +
      '<span>'+E(t.name)+'</span><small>'+E(t.blurb)+'</small></button>';
  }).join("");
  $("swatches").innerHTML = ACCENTS.map(function(c){
    return '<button class="sw" type="button" data-c="'+c+'" style="background:'+c+'" aria-pressed="'+(c.toLowerCase()===String(rec.theme.accent).toLowerCase())+'" aria-label="Accent '+c+'"></button>';
  }).join("");
  $("hexIn").value = rec.theme.accent || "";
  $("fontSel").value = rec.theme.font || "Inter";
  $("sizeR").value = rec.theme.size; $("sizeO").textContent = rec.theme.size + " pt";
  $("lineR").value = rec.theme.spacing; $("lineO").textContent = rec.theme.spacing + "×";
  $("marR").value = rec.theme.margin; $("marO").textContent = rec.theme.margin + " mm";
  var ord = (rec.doc.order && rec.doc.order.length) ? rec.doc.order : FW.emptyDoc().order;
  var names = {summary:"Professional summary", experience:"Experience", education:"Education", skills:"Skills",
    projects:"Projects", certifications:"Certifications", languages:"Languages", custom:"Custom section"};
  $("orderList").innerHTML = ord.map(function(k,i){
    return '<li><span>'+E(names[k]||k)+'</span><span>' +
      (i>0 ? '<button class="ibtn" type="button" data-o="'+i+':-1" aria-label="Move up">↑</button>' : "") +
      (i<ord.length-1 ? '<button class="ibtn" type="button" data-o="'+i+':1" aria-label="Move down">↓</button>' : "") + '</span></li>';
  }).join("");
}
$("tplPick").addEventListener("click", function(e){
  var b = e.target.closest("[data-t]"); if(!b) return;
  rec.theme.tpl = b.getAttribute("data-t"); renderDesign(); touched();
  FW.toast(( FW.TPL_BY_SLUG[rec.theme.tpl]||{}).name + " applied");
});
$("swatches").addEventListener("click", function(e){
  var b = e.target.closest("[data-c]"); if(!b) return;
  rec.theme.accent = b.getAttribute("data-c"); renderDesign(); touched();
});
$("hexIn").addEventListener("input", function(){
  var v = this.value.trim();
  if(/^#[0-9a-f]{6}$/i.test(v)){ rec.theme.accent = v; touched(); }
});
$("fontSel").addEventListener("change", function(){ rec.theme.font = this.value; touched(); });
[["sizeR","size","sizeO"," pt"],["lineR","spacing","lineO","×"],["marR","margin","marO"," mm"]].forEach(function(a){
  $(a[0]).addEventListener("input", function(){
    rec.theme[a[1]] = parseFloat(this.value); $(a[2]).textContent = this.value + a[3]; touched();
  });
});
$("orderList").addEventListener("click", function(e){
  var b = e.target.closest("[data-o]"); if(!b) return;
  var p = b.getAttribute("data-o").split(":"), i = +p[0], dir = +p[1];
  var ord = (rec.doc.order && rec.doc.order.length) ? rec.doc.order.slice() : FW.emptyDoc().order;
  var t = ord[i]; ord[i] = ord[i+dir]; ord[i+dir] = t;
  rec.doc.order = ord; renderDesign(); touched();
});

/* ---------------- tailor pane ---------------- */
$("jdBox").value = jdText;
$("jdBox").addEventListener("input", function(){ jdText = this.value; try{ sessionStorage.setItem("fw_last_jd", jdText); }catch(e){} score(); });
$("jdScore").addEventListener("click", function(){
  var jdv = ($("jdBox").value||"").trim();
  if(jdv.length < 40){ FW.toast("Paste the job ad first"); return; }
  jdText = jdv;
  var gap = FW.keywordGap(FW.docText(rec.doc), jdv);
  var r = FW.atsScan({text: FW.docText(rec.doc), jd: jdv, filename: rec.title});
  $("jdOut").innerHTML =
    '<div class="score-row"><span class="ring" id="tRing"></span><div><b>' + gap.pct + '% keyword fit</b>' +
      '<p class="small muted">' + gap.have.length + ' of ' + gap.total + ' key terms from this ad appear in your resume.</p></div></div>' +
    (gap.missing.length ? '<p class="small"><b>Missing — add only what is true:</b></p><div class="chips">' +
      gap.missing.map(function(k){ return '<span class="chip">'+E(k)+'</span>'; }).join("") + '</div>' : '<p class="small">Nothing important is missing. Nice.</p>') +
    '<button class="btn block" type="button" id="tailorCp" style="margin-top:16px">Ask Copilot to tailor it →</button>';
  FW.ring($("tRing"), r.score, "ATS · this job");
  $("tailorCp").addEventListener("click", function(){
    openCopilot(); $("cpIn").value = "Tailor my resume to this job description, keeping everything truthful.";
    sendCopilot();
  });
  score();
});

/* ---------------- Copilot ---------------- */
var cp = $("copilot");
function openCopilot(){ cp.classList.add("open"); $("cpIn").focus(); }
$("cpFab").addEventListener("click", openCopilot);
$("cpClose").addEventListener("click", function(){ cp.classList.remove("open"); });
if(Q.get("copilot")) setTimeout(openCopilot, 400);
function bubble(who, html){
  var d = document.createElement("div");
  d.className = "bub " + (who==="me" ? "me" : "ai");
  d.innerHTML = html;
  $("cpBody").appendChild(d);
  $("cpBody").scrollTop = $("cpBody").scrollHeight;
  return d;
}
bubble("ai", "I can rewrite your summary, sharpen bullets, tailor the whole thing to a job ad, or tell you which ATS keywords you are missing. I only work from what you actually wrote — nothing invented.");
$("cpSug").addEventListener("click", function(e){
  var b = e.target.closest("button"); if(!b) return;
  $("cpIn").value = b.textContent; sendCopilot();
});
$("cpIn").addEventListener("keydown", function(e){
  if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendCopilot(); }
});
$("cpSend").addEventListener("click", sendCopilot);
function sendCopilot(){
  var msg = ($("cpIn").value||"").trim(); if(!msg) return;
  $("cpIn").value = "";
  bubble("me", E(msg));
  var pend = bubble("ai", '<span class="spin dark"></span> thinking…');
  FW.api("/api/ai/copilot", {message: msg, doc: rec.doc, jd: jdText}).then(function(j){
    if(!j || !j.reply){ pend.innerHTML = "That one did not come back. Try asking again."; return; }
    var html = E(j.reply).replace(/\n/g,"<br>");
    pend.innerHTML = html;
    $("cpEngine").textContent = "Engine: " + (j.engine === "built-in-engine" ? "Fitwise built-in engine" : j.engine + (j.model ? " · " + j.model : ""));
    if(j.patch){
      var btn = document.createElement("span");
      btn.className = "apply"; btn.setAttribute("role","button"); btn.tabIndex = 0;
      btn.textContent = "✓ Apply to resume";
      btn.addEventListener("click", function(){
        var p = j.patch;
        if(p.type==="summary"){ if(p.summary) rec.doc.summary = p.summary; if(p.headline) rec.doc.role = p.headline; }
        if(p.type==="experience_bullets" && rec.doc.experience[p.index||0] && Array.isArray(p.bullets))
          rec.doc.experience[p.index||0].bullets = p.bullets.filter(Boolean);
        if(p.type==="skills" && Array.isArray(p.skills)) rec.doc.skills = p.skills.filter(Boolean);
        if(p.type==="tailor"){
          if(p.summary) rec.doc.summary = p.summary;
          if(p.bullets && Array.isArray(p.bullets.items) && rec.doc.experience[p.bullets.index||0])
            rec.doc.experience[p.bullets.index||0].bullets = p.bullets.items.filter(Boolean);
        }
        renderContent(); touched();
        btn.textContent = "Applied ✓"; btn.style.pointerEvents = "none";
        FW.toast("Applied to your resume");
      });
      pend.appendChild(document.createElement("br"));
      pend.appendChild(btn);
    }
    $("cpBody").scrollTop = $("cpBody").scrollHeight;
  }).catch(function(){ pend.innerHTML = "Network hiccup — ask that again."; });
}

/* ---------------- export + zoom + save ---------------- */
$("zIn").addEventListener("click", function(){ rec.theme.zoom = Math.min(1.5, (rec.theme.zoom||0.82) + 0.08); paint(); });
$("zOut").addEventListener("click", function(){ rec.theme.zoom = Math.max(0.35, (rec.theme.zoom||0.82) - 0.08); paint(); });
$("pdfBtn").addEventListener("click", function(){
  save(true);
  FW.exportPdf(FW.renderResume(null, rec.doc, rec.theme), FW.fileBase(rec.doc));
  FW.toast("Choose “Save as PDF” in the print dialog — the text stays selectable");
});
$("docxBtn").addEventListener("click", function(){ save(true); FW.exportDocx(rec.doc, rec.theme); });
$("saveBtn").addEventListener("click", function(){ save(false); });
$("resTitle").addEventListener("input", autosave);

/* ---------------- boot ---------------- */
$("resTitle").value = rec.title || "";
paint(); renderDesign(); renderLocalList();
if(Q.get("from")==="scan" || (rec.doc.name || (rec.doc.experience||[]).length)) { renderContent(); goTab("content"); }
window.addEventListener("resize", FW.debounce(paint, 200));
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
