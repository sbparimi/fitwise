/* /pricing — early-access capture (payments are not live yet; nothing is charged). */
(function(){
function init(){
  var FW = window.FW; if(!FW) return;
  var note = document.getElementById("payNote");
  document.addEventListener("click", function(e){
    var b = e.target.closest("[data-plan]"); if(!b) return;
    var plan = b.getAttribute("data-plan");
    note.classList.remove("hide");
    note.innerHTML = '<b>Card payments are not switched on yet.</b> Leave your email and you will be first in when ' +
      (plan.indexOf("credits")===0 ? "credit packs" : "Pro") + ' opens — nothing is charged now.' +
      '<form id="eaForm" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">' +
      '<input type="email" id="eaEmail" required placeholder="you@example.com" style="flex:1 1 220px">' +
      '<button class="btn" type="submit">Join the early-access list</button></form><p id="eaMsg" class="small" style="margin:10px 0 0"></p>';
    note.scrollIntoView({behavior:"smooth", block:"center"});
    document.getElementById("eaForm").addEventListener("submit", function(ev){
      ev.preventDefault();
      var email = document.getElementById("eaEmail").value.trim();
      FW.api("/api/early-access", {email: email, plan: plan.indexOf("credits")===0 ? "credits" : "autopilot"})
        .then(function(j){
          document.getElementById("eaMsg").textContent = (j && (j.ok || j._status===200))
            ? "You are on the list — we will email " + email + " the moment it opens. Nothing was charged."
            : (j && j.error) || "Could not add that email, try again.";
        }).catch(function(){ document.getElementById("eaMsg").textContent = "Network error — try again."; });
    });
  });
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
