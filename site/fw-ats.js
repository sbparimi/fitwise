/* /ats-checker — ungated 28-check scan, shareable ?scan_id, 1-click hand-off into the builder. */
(function(){
"use strict";
function init(){
  var FW = window.FW; if(!FW) return;
  var $ = FW.$;
  var drop = $("drop"), file = $("file"), cv = $("cvText"), jd = $("jdText"), btn = $("scanBtn");
  var idle = $("atsIdle"), rep = $("atsReport"), form = $("atsForm"), summ = $("atsSummary");
  var state = {filename:"Pasted resume", text:"", report:null, scanId:null};

  var ir = $("idleRing"); if(ir) FW.ring(ir, 0, "awaiting scan");

  function setFile(f){
    if(!f) return;
    drop.innerHTML = '<b>Reading ' + FW.esc(f.name) + '…</b><span class="spin dark" style="margin-top:8px"></span>';
    FW.readFileText(f).then(function(t){
      state.filename = f.name; state.text = t; cv.value = t;
      drop.innerHTML = '<b>✓ ' + FW.esc(f.name) + '</b><span>' + t.split(/\s+/).filter(Boolean).length + ' words read — scan it below</span>';
    }).catch(function(e){
      drop.innerHTML = '<b>Could not read that file</b><span>' + FW.esc(e.message||String(e)) + '</span>';
    });
  }
  if(drop){
    drop.addEventListener("click", function(){ file.click(); });
    drop.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); file.click(); } });
    ["dragenter","dragover"].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.add("over"); }); });
    ["dragleave","drop"].forEach(function(ev){ drop.addEventListener(ev, function(e){ e.preventDefault(); drop.classList.remove("over"); }); });
    drop.addEventListener("drop", function(e){ if(e.dataTransfer.files && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); });
    file.addEventListener("change", function(){ if(file.files[0]) setFile(file.files[0]); });
  }

  function statusIcon(s){ return s==="pass" ? "✓" : s==="warn" ? "!" : "×"; }
  function groupStatus(g){
    var f = g.checks.filter(function(c){ return c.status==="fail"; }).length;
    var w = g.checks.filter(function(c){ return c.status==="warn"; }).length;
    return f ? {cls:"failc", txt:f + " to fix"} : w ? {cls:"warnc", txt:w + " to review"} : {cls:"pass", txt:"All clear"};
  }
  function render(r){
    state.report = r;
    idle.classList.add("hide"); rep.classList.remove("hide");
    form.classList.add("hide"); summ.classList.remove("hide");

    /* left summary */
    var kw = r.keywords;
    summ.innerHTML =
      '<div class="score-cards">' +
        '<div class="sc"><span class="ring sm" id="rFmt" style="margin:0 auto"></span><small>Format &amp; readability</small></div>' +
        '<div class="sc"><span class="ring sm" id="rKw" style="margin:0 auto"></span><small>' + (kw ? "Keyword match" : "Content &amp; impact") + '</small></div>' +
      '</div>' +
      (kw && kw.missing.length ? '<p class="small"><b>' + kw.missing.length + ' keyword' + (kw.missing.length===1?"":"s") + ' from this job are missing:</b></p><div class="chips">' +
        kw.missing.slice(0,12).map(function(k){ return '<span class="chip">'+FW.esc(k)+'</span>'; }).join("") + '</div>' : "") +
      (kw && kw.have.length ? '<p class="small" style="margin-top:12px"><b>You already match:</b></p><div class="chips">' +
        kw.have.slice(0,12).map(function(k){ return '<span class="chip have">'+FW.esc(k)+'</span>'; }).join("") + '</div>' : "") +
      '<ul class="grp-list">' + r.groups.map(function(g){ var s = groupStatus(g);
        return '<li><span>'+FW.esc(g.name)+'</span><span class="st '+s.cls+'">'+s.txt+'</span></li>'; }).join("") + '</ul>' +
      '<button class="btn block" id="fixBtn" type="button" style="margin-top:16px">Fix in Builder →</button>' +
      '<button class="btn ghost block" id="againBtn" type="button" style="margin-top:8px">New scan</button>';
    FW.ring($("rFmt"), r.format_score, "format");
    FW.ring($("rKw"), kw ? kw.pct : r.content_score, kw ? "keywords" : "content");

    /* right report */
    rep.innerHTML =
      '<div class="res-head"><div><p class="eyebrow">Instant ATS report</p><b class="fn">'+FW.esc(r.meta.filename)+'</b>' +
        '<p class="small muted" style="margin:4px 0 0">'+r.meta.words+' words · '+r.meta.bullets+' bullets · about '+r.meta.pages+' page'+(r.meta.pages===1?"":"s")+'</p></div>' +
        '<div class="score-row" style="margin:0"><span class="ring" id="mainRing"></span></div></div>' +
      '<p><span class="tag">'+r.passed+' of '+r.total_checks+' checks passed</span> ' +
        (r.warnings?'<span class="tag w">'+r.warnings+' to review</span> ':"") +
        (r.failed?'<span class="tag" style="background:var(--bad-soft);color:#991B1B">'+r.failed+' failing</span>':"") + '</p>' +
      r.groups.map(function(g){ var s = groupStatus(g);
        return '<div class="ck-group"><h3>'+FW.esc(g.name)+'<span class="st '+s.cls+'">'+s.txt+'</span></h3><div class="checks">' +
          g.checks.map(function(c){
            return '<div class="ck'+(c.status==="warn"?" warn":c.status==="fail"?" fail":"")+'">' +
              '<span class="ck-ic">'+statusIcon(c.status)+'</span><div><b>'+FW.esc(c.title)+'</b><p>'+FW.esc(c.detail)+'</p></div></div>';
          }).join("") + '</div></div>';
      }).join("") +
      '<div class="sharebar"><b class="small">Shareable link:</b><input type="text" id="shareUrl" readonly disabled placeholder="Saving report…">' +
        '<button class="btn sm ghost" id="copyShare" type="button" disabled>Copy</button><span id="shareStatus" class="small" role="status">Saving report…</span></div>';
    FW.ring($("mainRing"), r.score, "out of 100");
    var fixBtn = $("fixBtn");
    if(fixBtn){
      fixBtn.disabled = !state.text;
      if(!state.text) fixBtn.textContent = "Source resume is not included in this shared report";
    }

    $("fixBtn").addEventListener("click", function(){
      if(!state.text){ FW.toast("The source resume is not available from a shared report."); return; }
      var doc = FW.parseResume(state.text);
      var rec = {id: FW.store.newId(), title: (doc.name ? doc.name + " — " + (doc.role||"Resume") : "Imported resume"),
        doc: doc, theme: FW.emptyTheme(), ats_score: r.score};
      if(!FW.store.save(rec)){ FW.toast("Browser storage is unavailable or full. Free space or export a copy before continuing."); return; }
      try{ sessionStorage.setItem("fw_last_jd", jd.value||""); }catch(e){}
      location.href = "/builder?from=scan" + (state.scanId ? "&scan_id="+encodeURIComponent(state.scanId) : "");
    });
    $("againBtn").addEventListener("click", function(){
      form.classList.remove("hide"); summ.classList.add("hide");
      rep.classList.add("hide"); idle.classList.remove("hide");
      drop.innerHTML = '<b>Drop your resume here</b><span>PDF, DOCX or TXT — read in your browser</span>';
      drop.appendChild(file);
      history.replaceState(null,"","/ats-checker");
      window.scrollTo({top:0,behavior:"smooth"});
    });
    $("copyShare").addEventListener("click", function(){
      var i = $("shareUrl");
      if(!i || !i.value){ FW.toast("A share link is not available for this scan."); return; }
      i.select();
      (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.reject())
        .then(function(){ FW.toast("Scan link copied"); }, function(){ FW.toast("Select the link and copy it"); });
    });
    rep.scrollIntoView({behavior:"smooth", block:"start"});
  }

  function setShareLink(url, message){
    var input = $("shareUrl"), button = $("copyShare"), status = $("shareStatus");
    if(input){ input.value = url || ""; input.disabled = !url; }
    if(button) button.disabled = !url;
    if(status) status.textContent = message || (url ? "Link ready. Expires in 30 days." : "Share link unavailable. Your results remain in this browser.");
  }

  function scan(){
    var text = (cv.value||"").trim();
    if(text.length < 60){ FW.toast("Paste your resume text, or drop a PDF/DOCX first"); cv.focus(); return; }
    btn.classList.add("is-busy"); btn.innerHTML = '<span class="spin"></span> Scanning…';
    state.text = text;
    var r = FW.atsScan({text:text, jd:(jd.value||"").trim(), filename: state.filename});
    setTimeout(function(){
      btn.classList.remove("is-busy"); btn.textContent = "Scan my resume free";
      render(r);
      FW.api("/api/ats/scan", {filename: state.filename, report: r})
        .then(function(j){
          if(j && j.scan_id){
            state.scanId = j.scan_id;
            var url = location.origin + "/ats-checker?scan_id=" + j.scan_id;
            setShareLink(url, "Link ready. Expires in 30 days.");
            history.replaceState(null, "", "/ats-checker?scan_id=" + j.scan_id);
          } else setShareLink("", "Share link unavailable. Your scan results remain in this browser.");
        }).catch(function(){ setShareLink("", "Share link unavailable. Your scan results remain in this browser."); });
    }, 320);
  }
  if(btn) btn.addEventListener("click", scan);

  /* reopen a shared scan */
  var sid = new URLSearchParams(location.search).get("scan_id");
  if(sid){
    rep.innerHTML = '<p class="center muted" style="padding:50px"><span class="spin dark"></span> Loading that scan…</p>';
    rep.classList.remove("hide"); idle.classList.add("hide");
    FW.api("/api/ats/scan?id=" + encodeURIComponent(sid)).then(function(j){
      if(j && j.report && j.report.groups){
        state.filename = j.filename || "Shared scan"; state.text = ""; state.scanId = sid;
        cv.value = ""; jd.value = "";
        render(j.report);
        setShareLink(location.origin + "/ats-checker?scan_id=" + sid, "Link ready. Expires in 30 days.");
      } else {
        rep.classList.add("hide"); idle.classList.remove("hide");
        FW.toast("That scan link has expired — run a fresh scan");
      }
    }).catch(function(){ rep.classList.add("hide"); idle.classList.remove("hide"); });
  } else {
    /* prefill from a resume already in the browser */
    var rec = FW.store.active();
    if(rec && rec.doc){ cv.value = FW.docText(rec.doc); state.filename = (rec.title||"My resume") + " (from builder)";
      drop.innerHTML = '<b>Using “'+FW.esc(rec.title||"your resume")+'”</b><span>Loaded from this browser — or drop a different file</span>';
      drop.appendChild(file); }
    try{ var lj = sessionStorage.getItem("fw_last_jd"); if(lj && !jd.value) jd.value = lj; }catch(e){}
  }
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
