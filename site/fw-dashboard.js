/* /dashboard — multi-resume CRUD (localStorage + D1 sync when signed in) and the saved-jobs tracker. */
(function(){
"use strict";
function init(){
var FW = window.FW; if(!FW) return;
var E = FW.esc;
function drawResumes(){
  var all = FW.store.all(), el = document.getElementById("resList");
  if(!all.length){
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><b>No resumes yet</b>' +
      '<p class="muted">Start one from scratch, upload a PDF or DOCX, or load a sample role — it takes about a minute.</p>' +
      '<a class="btn" href="/builder" style="margin-top:12px">Build my first resume</a></div>';
    return;
  }
  el.innerHTML = all.map(function(r){
    return '<div class="rcard" data-id="'+E(r.id)+'"><div class="rc-prev" data-prev="'+E(r.id)+'"></div>' +
      '<div class="rc-body"><b>'+E(r.title||"Untitled")+'</b>' +
      '<small>ATS '+(r.ats_score||0)+'/100 · '+((FW.TPL_BY_SLUG[(r.theme||{}).tpl]||{}).name||"Harvard Clean")+
      ' · updated '+new Date(r.updated_at||Date.now()).toLocaleDateString()+'</small></div>' +
      '<div class="rc-foot">' +
        '<a class="btn xs" href="/builder">Edit</a>' +
        '<button class="btn xs ghost" type="button" data-act="dup">Duplicate</button>' +
        '<button class="btn xs ghost" type="button" data-act="rename">Rename</button>' +
        '<button class="btn xs ghost" type="button" data-act="pdf">PDF</button>' +
        '<button class="btn xs ghost" type="button" data-act="docx">DOCX</button>' +
        '<button class="btn xs ghost" type="button" data-act="del">Delete</button>' +
      '</div></div>';
  }).join("");
  el.querySelectorAll("[data-prev]").forEach(function(p){
    var r = FW.store.get(p.getAttribute("data-prev"));
    if(r) FW.renderResume(p, r.doc, r.theme || FW.emptyTheme());
  });
  el.querySelectorAll(".rcard").forEach(function(card){
    var id = card.getAttribute("data-id");
    card.addEventListener("click", function(e){
      var b = e.target.closest("[data-act]"); if(!b) return;
      var r = FW.store.get(id); if(!r) return;
      var act = b.getAttribute("data-act");
      if(act==="dup"){
        var copy = JSON.parse(JSON.stringify(r));
        copy.id = FW.store.newId(); copy.title = (r.title||"Resume") + " (copy)"; copy.created_at = Date.now();
        FW.store.save(copy); drawResumes(); FW.toast("Duplicated");
      }
      if(act==="rename"){
        var n = prompt("New name for this resume:", r.title || "");
        if(n && n.trim()){ r.title = n.trim(); FW.store.save(r); drawResumes(); FW.toast("Renamed"); }
      }
      if(act==="pdf"){ FW.exportPdf(FW.renderResume(null, r.doc, r.theme||FW.emptyTheme()), FW.fileBase(r.doc));
        FW.toast("Choose “Save as PDF” in the print dialog"); }
      if(act==="docx"){ FW.exportDocx(r.doc, r.theme||FW.emptyTheme()); }
      if(act==="del"){
        if(confirm("Delete “" + (r.title||"this resume") + "”? This removes it from this browser and requests deletion from your account if cloud sync is enabled.")){
          if(!FW.store.remove(id)){ FW.toast("Could not delete this resume from browser storage."); return; }
          drawResumes(); FW.toast("Deleted from this browser");
        }
      }
      if(act!=="del" && act!=="pdf" && act!=="docx") return;
    });
    card.querySelector('a.btn.xs').addEventListener("click", function(){ FW.store.setActive(id); });
  });
}
var STAGES = ["Saved","Applied","Interviewing","Offer","Closed"];
function drawTracker(){
  var items = FW.store.tracker(), el = document.getElementById("trkList");
  if(!items.length){
    el.innerHTML = '<div class="empty-state"><b>No saved jobs yet</b><p class="muted">Tap <b>Save</b> on any role on the Fitwise job board and it lands here with its match score.</p>' +
      '<a class="btn" href="/jobs" style="margin-top:12px">See today’s jobs</a></div>';
    return;
  }
  el.innerHTML = '<div class="grid g2">' + items.map(function(t){
    return '<div class="card" data-trk="'+E(t.id||t.job_id)+'">' +
      '<div class="res-head" style="margin:0 0 8px">' +
        '<div><b>'+E(t.title||"Role")+'</b><p class="small muted" style="margin:2px 0 0">'+E(t.company||"")+(t.location?" · "+E(t.location):"")+'</p></div>' +
        (t.match_score ? '<span class="tag v">'+t.match_score+'% match</span>' : "") + '</div>' +
      '<div class="btn-row" style="gap:6px">' +
        '<select data-stage style="max-width:150px;padding:7px 9px;font-size:.85rem">' +
          STAGES.map(function(s){ return '<option'+(s===(t.status||"Saved")?" selected":"")+'>'+s+'</option>'; }).join("") + '</select>' +
        (t.url ? '<a class="btn xs ghost" href="'+E(t.url)+'">Open job</a>' : "") +
        '<a class="btn xs ghost" href="/builder?job='+E(t.job_id||"")+'&title='+encodeURIComponent(t.title||"")+'&company='+encodeURIComponent(t.company||"")+'">Tailor CV</a>' +
        '<button class="btn xs ghost" type="button" data-rm>Remove</button>' +
      '</div></div>';
  }).join("") + '</div>';
  el.querySelectorAll("[data-trk]").forEach(function(c){
    var id = c.getAttribute("data-trk");
    var item = FW.store.tracker().filter(function(x){ return (x.id||x.job_id)===id; })[0];
    c.querySelector("[data-stage]").addEventListener("change", function(){
      item.status = this.value; FW.store.track(item); FW.toast("Moved to " + this.value);
    });
    c.querySelector("[data-rm]").addEventListener("click", function(){ FW.store.untrack(id); drawTracker(); FW.toast("Removed"); });
  });
}
FW.cloud.check().then(function(u){
  var line = document.getElementById("syncLine"), link = document.getElementById("signLink");
  if(u){
    line.textContent = "Saved in this browser and synced to " + (u.email||"your account") + ".";
    if(link){ link.textContent = "Signed in ✓"; link.href = "/dashboard"; }
    return FW.cloud.pull().then(function(){ drawResumes(); });
  }
  line.textContent = "Saved in this browser. Sign in to sync them across devices.";
}).then(drawResumes).catch(drawResumes);
drawResumes(); drawTracker();
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
