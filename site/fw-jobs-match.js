/* /jobs and /j/<id>: client-side 0–100% resume match score + Save to Tracker. Nothing is sent anywhere;
   the score is computed in the browser from the resume already saved locally. */
(function(){
"use strict";
function init(){
  var FW = window.FW; if(!FW) return;
  var rec = FW.store.active();
  var text = rec && rec.doc ? FW.docText(rec.doc) : "";

  /* ---- job cards on /jobs ---- */
  var cards = document.querySelectorAll("article.jc");
  if(cards.length){
    if(!text){
      var strip = document.querySelector(".fwstrip > div");
      if(strip) strip.innerHTML = '<b>Match scores are one resume away.</b> Build or scan a resume once and every job below shows a 0–100% fit score against it. <a href="/builder">Build mine free →</a>';
    }
    cards.forEach(function(c){
      if(text){
        var jobText = (c.getAttribute("data-title")||"") + "\n" + (c.getAttribute("data-q")||"") + " " + (c.getAttribute("data-k")||"");
        var m = FW.matchScore(text, jobText);
        if(m){
          var el = c.querySelector(".jmatch");
          if(el){
            var cls = m.score>=70 ? "hi" : m.score>=45 ? "mid" : "low";
            el.hidden = false;
            el.className = "jmatch " + cls;
            el.textContent = m.score + "% match";
            el.title = (m.have.length ? "You match: " + m.have.slice(0,8).join(", ") : "") +
                       (m.missing.length ? "\nMissing: " + m.missing.slice(0,8).join(", ") : "");
          }
        }
      }
      var sv = c.querySelector("[data-save-job]");
      if(sv){
        var saved = FW.store.tracker().some(function(t){ return t.job_id === c.getAttribute("data-id"); });
        if(saved){ sv.textContent = "Saved ✓"; sv.classList.add("on"); }
        sv.addEventListener("click", function(){
          var id = c.getAttribute("data-id");
          if(sv.classList.contains("on")){
            FW.store.untrack(id); sv.textContent = "Save"; sv.classList.remove("on"); FW.toast("Removed from your tracker");
            return;
          }
          FW.store.track({job_id:id, title:c.getAttribute("data-title")||"", company:c.getAttribute("data-company")||"",
            location:c.getAttribute("data-place")||"", url:c.getAttribute("data-url")||"", status:"Saved",
            match_score: text ? (FW.matchScore(text, (c.getAttribute("data-title")||"")+"\n"+(c.getAttribute("data-q")||""))||{}).score||0 : 0});
          sv.textContent = "Saved ✓"; sv.classList.add("on");
          FW.toast("Saved to your tracker — see it on your dashboard");
        });
      }
    });
  }

  /* ---- single job page ---- */
  var box = document.getElementById("jdMatchBox");
  var card = document.getElementById("jdCard");
  if(box && card){
    if(!text){
      box.innerHTML = '<div class="jd-m-empty"><b>Want a match score for this role?</b> ' +
        'Build a resume in Fitwise once (free, no account) and this page shows your 0–100% fit plus the exact keywords you are missing. ' +
        '<a href="/builder">Build my resume free →</a></div>';
    } else {
      var jt = (card.getAttribute("data-title")||"") + "\n" + (card.getAttribute("data-company")||"") + " " +
               (card.getAttribute("data-cat")||"") + " " + (card.getAttribute("data-place")||"");
      var m2 = FW.matchScore(text, jt);
      if(m2){
        box.innerHTML = '<div class="jd-m-head"><span class="ring sm" id="jdRing"></span>' +
          '<div><b>Your fit for this role</b><p class="small muted">Scored in your browser against “' + FW.esc(rec.title||"your resume") + '”. Nothing was uploaded.</p></div></div>' +
          (m2.have.length ? '<p class="small"><b>You already match:</b></p><div class="chips">' +
            m2.have.slice(0,10).map(function(k){ return '<span class="chip have">'+FW.esc(k)+'</span>'; }).join("") + '</div>' : "") +
          (m2.missing.length ? '<p class="small" style="margin-top:10px"><b>Worth adding (only if true):</b></p><div class="chips">' +
            m2.missing.slice(0,10).map(function(k){ return '<span class="chip">'+FW.esc(k)+'</span>'; }).join("") + '</div>' : "");
        var rg = document.getElementById("jdRing"); if(rg) FW.ring(rg, m2.score, "match");
      }
    }
  }
  var sb = document.getElementById("jdSaveBtn");
  if(sb && card){
    var id2 = card.getAttribute("data-id");
    if(FW.store.tracker().some(function(t){ return t.job_id === id2; })){ sb.textContent = "Saved to Tracker ✓"; sb.classList.add("on"); }
    sb.addEventListener("click", function(){
      if(sb.classList.contains("on")){ FW.store.untrack(id2); sb.textContent="Save to Tracker"; sb.classList.remove("on"); FW.toast("Removed from your tracker"); return; }
      FW.store.track({job_id:id2, title:card.getAttribute("data-title")||"", company:card.getAttribute("data-company")||"",
        location:card.getAttribute("data-place")||"", url:card.getAttribute("data-url")||"", status:"Saved"});
      sb.textContent = "Saved to Tracker ✓"; sb.classList.add("on");
      FW.toast("Saved — it is on your dashboard now");
    });
  }
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
