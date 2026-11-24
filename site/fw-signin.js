/* /signin — optional Google or passwordless email sign-in; requires configured runtime services. */
(function(){
function init(){
  var FW = window.FW; if(!FW) return;
  var $ = FW.$, msg = $("signMsg"), googleMsg = $("googleMsg");
  FW.cloud.check().then(function(u){
    if(u){
      $("signForm").classList.add("hide");
      var box = $("signedIn"); box.classList.remove("hide");
      box.innerHTML = '<b>You are signed in as ' + FW.esc(u.email||"your account") + '.</b> Your resumes sync automatically. ' +
        '<a href="/dashboard">Open your dashboard →</a>';
    }
  });

  function googleCredential(resp){
    if(!resp || !resp.credential){ googleMsg.textContent = "Google did not return a sign-in credential. Try again."; return; }
    googleMsg.textContent = "Verifying your Google account…";
    FW.api("/api/auth/google", {credential:resp.credential,source:location.pathname+location.search}).then(function(j){
      if(j && j.ok){ googleMsg.textContent = "Signed in. Opening your dashboard…"; location.href="/dashboard"; }
      else googleMsg.textContent = (j && j.error) || "Google sign-in could not be completed. Try again.";
    }).catch(function(){ googleMsg.textContent = "Network error. Try Google sign-in again."; });
  }

  var googleStarted = false;
  window.fwGsiReady = function(){
    if(googleStarted || !window.google || !google.accounts || !google.accounts.id) return;
    googleStarted = true;
    googleMsg.textContent = "Preparing secure Google sign-in…";
    FW.api("/api/auth/config").then(function(cfg){
      if(!cfg || !cfg.client_id){ googleMsg.textContent = "Google sign-in is not configured on this environment."; return; }
      try{
        google.accounts.id.initialize({
          client_id:cfg.client_id,
          callback:googleCredential,
          ux_mode:"popup",
          auto_select:false,
          cancel_on_tap_outside:true,
          context:"signin",
          itp_support:true
        });
        google.accounts.id.renderButton($("googleBtn"), {
          type:"standard",
          theme:"outline",
          size:"large",
          text:"continue_with",
          shape:"pill",
          logo_alignment:"left",
          width:Math.min(360,Math.max(220,$("googleBtn").clientWidth||320)),
          locale:"en"
        });
        googleMsg.textContent = "Continue with your Google account.";
      }catch(e){
        googleMsg.textContent = "Google sign-in could not initialize. Refresh and try again.";
        googleStarted = false;
      }
    }).catch(function(){
      googleMsg.textContent = "Google sign-in is unavailable on this preview. Use the production Fitwise site.";
    });
  };
  if(window.google && google.accounts && google.accounts.id) window.fwGsiReady();
  else setTimeout(function(){
    if(!googleStarted){
      window.fwGsiReady();
      if(!googleStarted) googleMsg.textContent = "Google sign-in did not load. Allow accounts.google.com or refresh.";
    }
  },6000);

  $("emGo").addEventListener("click", function(){
    var email = ($("emIn").value||"").trim();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ msg.textContent = "Enter a valid email address."; return; }
    this.classList.add("is-busy"); this.innerHTML = '<span class="spin"></span> Sending…';
    var b = this;
    FW.api("/api/auth/email/request", {email: email}).then(function(j){
      b.classList.remove("is-busy"); b.textContent = "Resend the code";
      if(j && j.ok && j.emailed){ $("codeBox").classList.remove("hide"); $("codeIn").focus();
        msg.textContent = "Code sent to " + email + ". It is good for 10 minutes."; }
      else { $("codeBox").classList.add("hide"); msg.textContent = (j && j.error) || "Email sign-in is unavailable. You can continue without an account."; }
    }).catch(function(){ b.classList.remove("is-busy"); b.textContent = "Email me a 6-digit code"; msg.textContent = "Network error — try again."; });
  });
  $("codeGo").addEventListener("click", function(){
    var email = ($("emIn").value||"").trim(), code = ($("codeIn").value||"").trim();
    if(code.length !== 6){ msg.textContent = "Enter the 6-digit code."; return; }
    this.classList.add("is-busy"); this.innerHTML = '<span class="spin"></span> Verifying…';
    var b = this;
    FW.api("/api/auth/email/verify", {email: email, code: code}).then(function(j){
      b.classList.remove("is-busy"); b.textContent = "Verify & sign in";
      if(j && j.ok){ msg.textContent = "Signed in. Syncing your resumes…"; location.href = "/dashboard"; }
      else msg.textContent = (j && j.error) || "That code did not match. Request a fresh one.";
    }).catch(function(){ b.classList.remove("is-busy"); b.textContent = "Verify & sign in"; msg.textContent = "Network error — try again."; });
  });
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
