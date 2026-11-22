/* Homepage: live template rail, the hero resume shot, and the live job counts from /api/jobs */
(function(){
  function init(){
    var FW = window.FW; if(!FW || !FW.TEMPLATES) return;
    var demo = FW.demoDoc();
    var shot = document.getElementById("heroShot");
    if(shot){
      FW.renderResume(shot, demo, {tpl:"amsterdam-modern", accent:"#4F23E6", font:"Inter", size:10.2, spacing:1.42, margin:14});
      var rz = shot.querySelector(".rz");
      if(rz){ rz.style.boxShadow="none"; rz.style.width="210mm"; rz.style.transformOrigin="top left"; }
      var fit = function(){
        var r = shot.querySelector(".rz"); if(!r) return;
        var scale = shot.clientWidth / r.offsetWidth;
        r.style.transform = "scale(" + scale + ")";
        shot.style.height = (r.offsetHeight * scale * 0.78) + "px";
        shot.style.overflow = "hidden";
      };
      fit(); window.addEventListener("resize", FW.debounce(fit, 150));
    }
    var hr = document.getElementById("heroRing"); if(hr) FW.ring(hr, 88, "ATS");
    var ad = document.getElementById("atsDemoRing"); if(ad) FW.ring(ad, 76, "out of 100");

    var rail = document.getElementById("tplRail");
    if(rail){
      rail.innerHTML = FW.TEMPLATES.slice(0,10).map(function(t){
        return '<div class="tpl-card"><div class="tpl-thumb" data-tpl="'+t.slug+'"></div>' +
          '<div class="tpl-meta"><b>'+FW.esc(t.name)+'</b><span class="tag'+(t.cat.indexOf("ats")>=0?"":" v")+'">'+
          (t.cat.indexOf("ats")>=0?"ATS-safe":t.cat[0])+'</span></div>' +
          '<a class="btn sm ghost" href="/builder?tpl='+t.slug+'">Use this template</a></div>';
      }).join("");
      rail.querySelectorAll(".tpl-thumb").forEach(function(th){
        FW.renderResume(th, demo, {tpl:th.getAttribute("data-tpl"), accent:"#4F23E6", font:"Inter", size:10.2, spacing:1.4, margin:14});
      });
    }

    fetch("/api/jobs?limit=400", {credentials:"same-origin"}).then(function(r){ return r.json(); }).then(function(j){
      var jobs = (j && (j.jobs || j.items)) || [];
      var spon = jobs.filter(function(x){ return /yes/i.test(String(x.visa||x.sponsorship||"")); }).length;
      var el = document.getElementById("jbJobs"); if(el) el.textContent = jobs.length ? jobs.length : "—";
      var e2 = document.getElementById("jbSpon"); if(e2) e2.textContent = spon ? spon : "see board";
      var e3 = document.getElementById("jbDate");
      if(e3){ var d = (j && j.date) || (jobs[0] && (jobs[0].date || jobs[0].posted)) || "";
        e3.textContent = d ? String(d).slice(0,10) : "today"; e3.style.fontSize = "1.05rem"; }
    }).catch(function(){
      var el = document.getElementById("jbJobs"); if(el) el.textContent = "live";
      var e2 = document.getElementById("jbSpon"); if(e2) e2.textContent = "stated per role";
      var e3 = document.getElementById("jbDate"); if(e3){ e3.textContent = "today"; e3.style.fontSize="1.05rem"; }
    });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
