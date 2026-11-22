/* /cover-letter — Studio: pulls the active resume, tone control, live editable preview, copy / save / PDF. */
(function(){
"use strict";
function init(){
var FW = window.FW; if(!FW) return;
var $ = FW.$, E = FW.esc;
var tone = "Professional", letter = "", rec = null;
var Q = new URLSearchParams(location.search);

var all = FW.store.all();
$("clResume").innerHTML = all.length
  ? all.map(function(r){ return '<option value="'+E(r.id)+'">'+E(r.title||"Untitled")+'</option>'; }).join("")
  : '<option value="">No resume yet — build one first</option>';
rec = FW.store.active() || all[0] || null;
if(rec) $("clResume").value = rec.id;
$("clResume").addEventListener("change", function(){ rec = FW.store.get(this.value) || rec; });

if(Q.get("role")) $("clRole").value = Q.get("role");
if(Q.get("company")) $("clCompany").value = Q.get("company");
try{ var lj = sessionStorage.getItem("fw_last_jd"); if(lj) $("clJd").value = lj; }catch(e){}
if(rec && rec.doc && rec.doc.role && !$("clRole").value) $("clRole").value = rec.doc.role;

$("clTones").addEventListener("click", function(e){
  var b = e.target.closest("[data-tone]"); if(!b) return;
  tone = b.getAttribute("data-tone");
  $("clTones").querySelectorAll("[data-tone]").forEach(function(x){ x.setAttribute("aria-pressed", String(x===b)); });
});

function paint(text){
  letter = text;
  var d = (rec && rec.doc) || {};
  var acc = (rec && rec.theme && rec.theme.accent) || "#4F23E6";
  var p = $("clPaper");
  p.style.setProperty("--rz-acc", acc);
  p.innerHTML = '<div class="cl-hd">' + E(d.name || "Your Name") + '</div>' +
    '<div class="cl-sub">' + E([d.role, d.email, d.phone, d.location].filter(Boolean).join(" · ")) + '</div>' +
    E(text);
  $("clStatus").textContent = "Draft ready — edit anything";
  grade(text);
}
function grade(text){
  var box = $("clScoreBox");
  var jd = ($("clJd").value||"").trim();
  var r = FW.coverGrade(text, jd, $("clCompany").value, $("clRole").value);
  box.classList.remove("hide");
  box.innerHTML = '<div class="score-row" style="margin-bottom:10px"><span class="ring sm" id="clRing"></span>' +
    '<div><b>Letter quality: ' + r.score + '/100</b><p class="small muted" style="margin:2px 0 0">' + r.passed + ' of 10 checks passed</p></div></div>' +
    '<ul class="grp-list">' + r.checks.map(function(c){
      return '<li><span>'+E(c.title)+'</span><span class="st '+(c.ok?"pass":"warnc")+'">'+(c.ok?"✓":"fix")+'</span></li>'; }).join("") + '</ul>';
  FW.ring($("clRing"), r.score, "quality");
}
$("clGo").addEventListener("click", function(){
  if(!rec || !rec.doc || (!rec.doc.name && !(rec.doc.experience||[]).length)){
    FW.toast("Build a resume first — the letter is written from it"); return;
  }
  var btn = this; btn.classList.add("is-busy"); btn.innerHTML = '<span class="spin"></span> Writing…';
  $("clStatus").textContent = "Writing…";
  FW.api("/api/ai/cover-letter", {doc: rec.doc, role: ($("clRole").value||"").trim(), company: ($("clCompany").value||"").trim(),
      hiringManager: ($("clManager").value||"").trim(), jd: ($("clJd").value||"").trim(), tone: tone})
    .then(function(j){
      btn.classList.remove("is-busy"); btn.textContent = "Rewrite my cover letter";
      if(j && j.letter){ paint(j.letter);
        FW.toast("Letter ready · " + (j.engine==="built-in-engine" ? "built-in writer" : j.engine));
      } else { $("clStatus").textContent = "That did not come back — try again"; }
    })
    .catch(function(){ btn.classList.remove("is-busy"); btn.textContent = "Write my cover letter"; FW.toast("Network hiccup — try again"); });
});
$("clCopy").addEventListener("click", function(){
  var t = $("clPaper").innerText || "";
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject())
    .then(function(){ FW.toast("Letter copied"); }, function(){ FW.toast("Select the letter and copy it"); });
});
$("clSave").addEventListener("click", function(){
  var t = $("clPaper").innerText || "";
  if(t.trim().length < 40){ FW.toast("Write the letter first"); return; }
  FW.store.saveLetter({id:"cl_"+Date.now().toString(36), title:($("clRole").value||"Cover letter")+" · "+($("clCompany").value||""),
    company:$("clCompany").value, role:$("clRole").value, tone:tone, content:t, theme:(rec&&rec.theme)||{},
    score: FW.coverGrade(t, $("clJd").value, $("clCompany").value, $("clRole").value).score});
  FW.toast("Saved" + (FW.cloud.me ? " and synced" : " in this browser"));
});
$("clPdf").addEventListener("click", function(){
  var acc = (rec && rec.theme && rec.theme.accent) || "#4F23E6";
  var html = '<div class="rz" style="--rz-acc:'+acc+';padding:20mm 18mm;font-size:10.8pt;line-height:1.62">' +
    $("clPaper").innerHTML + '</div>';
  FW.exportPdf(html, ((rec&&rec.doc&&rec.doc.name)||"Fitwise") + "_Cover_Letter");
  FW.toast("Choose “Save as PDF” in the print dialog");
});
["clCompany","clRole"].forEach(function(id){ $(id).addEventListener("input", function(){ if(letter) grade($("clPaper").innerText||""); }); });
$("clPaper").addEventListener("input", FW.debounce(function(){ grade($("clPaper").innerText||""); }, 700));
paint("Click “Write my cover letter” and your tailored draft appears here, built from the resume you selected and the job ad you pasted. Every word stays editable.");
$("clStatus").textContent = "Your letter appears here";
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
