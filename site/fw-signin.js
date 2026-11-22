/* /signin — passwordless email code (works inside in-app browsers where Google sign-in is blocked). */
(function(){
function init(){
  var FW = window.FW; if(!FW) return;
  var $ = FW.$, msg = $("signMsg");
  FW.cloud.check().then(function(u){
    if(u){
      $("signForm").classList.add("hide");
      var box = $("signedIn"); box.classList.remove("hide");
      box.innerHTML = '<b>You are signed in as ' + FW.esc(u.email||"your account") + '.</b> Your resumes sync automatically. ' +
        '<a href="/dashboard">Open your dashboard →</a>';
    }
  });
  $("emGo").addEventListener("click", function(){
    var email = ($("emIn").value||"").trim();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ msg.textContent = "Enter a valid email address."; return; }
    this.classList.add("is-busy"); this.innerHTML = '<span class="spin"></span> Sending…';
    var b = this;
    FW.api("/api/auth/email/request", {email: email}).then(function(j){
      b.classList.remove("is-busy"); b.textContent = "Resend the code";
      if(j && (j.ok || j.sent)){ $("codeBox").classList.remove("hide"); $("codeIn").focus();
        msg.textContent = "Code sent to " + email + ". It is good for 10 minutes."; }
      else msg.textContent = (j && j.error) || "Could not send a code right now. Try the dashboard’s Google sign-in instead.";
    }).catch(function(){ b.classList.remove("is-busy"); b.textContent = "Email me a 6-digit code"; msg.textContent = "Network error — try again."; });
  });
  $("codeGo").addEventListener("click", function(){
    var email = ($("emIn").value||"").trim(), code = ($("codeIn").value||"").trim();
    if(code.length < 4){ msg.textContent = "Enter the 6-digit code."; return; }
    this.classList.add("is-busy"); this.innerHTML = '<span class="spin"></span> Verifying…';
    var b = this;
    FW.api("/api/auth/email/verify", {email: email, code: code}).then(function(j){
      b.classList.remove("is-busy"); b.textContent = "Verify & sign in";
      if(j && j.ok){ msg.textContent = "Signed in. Syncing your resumes…"; setTimeout(function(){ location.href = "/dashboard"; }, 700); }
      else msg.textContent = (j && j.error) || "That code did not match. Request a fresh one.";
    }).catch(function(){ b.classList.remove("is-busy"); b.textContent = "Verify & sign in"; msg.textContent = "Network error — try again."; });
  });
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
