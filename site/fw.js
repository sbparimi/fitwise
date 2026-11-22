/* Fitwise: first-party page-view beacon + Google sign-in on gated pages + sign-out. 1 Nov 2026. No third-party trackers. */
(function(){
  var W = window, D = document;
  function hit(t, o, m){
    try {
      var b = JSON.stringify({t: t, u: location.href, r: t === 'pageview' ? D.referrer : '', o: o || null, m: m || null});
      if (W.fetch) fetch('/api/hit', {method: 'POST', body: b, keepalive: true, credentials: 'same-origin', headers: {'content-type': 'application/json'}}).catch(function(){});
      else if (navigator.sendBeacon) navigator.sendBeacon('/api/hit', b);
    } catch (e) {}
  }
  W.fwHit = hit;
  if (!W.FW_NOPV) hit('pageview');
  D.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('[data-signout],[data-copylink],[data-ev]'); if (!a) return;
    if (a.hasAttribute('data-ev')) hit(a.getAttribute('data-ev'));
    if (a.hasAttribute('data-signout')) { e.preventDefault(); fetch('/api/auth/logout', {method: 'POST', credentials: 'same-origin'}).then(function(){ try { google.accounts.id.disableAutoSelect(); } catch (x) {} location.href = '/'; }); }
    if (a.hasAttribute('data-copylink')) { hit('copy_link'); var u = location.href; var done = function(){ a.textContent = 'Link copied ✓ Paste it in your browser'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done, function(){ prompt('Copy this link:', u); }); else prompt('Copy this link:', u); }
  });
  /* ---- sign-in on a gated page (body[data-gate="1"]) ---- */
  if (D.body.getAttribute('data-gate') !== '1') return;
  var err = function(m){ var x = D.getElementById('gErr'); if (x) x.textContent = m || ''; };
  function onCred(resp){
    err('Signing you in…');
    fetch('/api/auth/google', {method: 'POST', headers: {'content-type': 'application/json'}, credentials: 'same-origin', body: JSON.stringify({credential: resp.credential, source: location.pathname + location.search})})
      .then(function(r){ return r.json().then(function(j){ return [r.ok, j]; }); })
      .then(function(a){ if (a[0]) location.reload(); else err(a[1].error || 'Sign-in failed. Please try again.'); })
      .catch(function(){ err('Network error. Please try again.'); hit('signin_fail', null, 'network'); });
  }
  var done = false;
  W.fwGsiReady = function(){
    if (done || !(W.google && google.accounts && google.accounts.id) || !W.FW_GCID) return;
    done = true;
    try {
      google.accounts.id.initialize({client_id: W.FW_GCID, callback: onCred, ux_mode: 'popup', auto_select: false, cancel_on_tap_outside: true, context: 'signin', itp_support: true});
      var el = D.getElementById('gBtn'); var w = Math.min(320, Math.max(200, el.clientWidth || 300));
      google.accounts.id.renderButton(el, {type: 'standard', theme: 'filled_blue', size: 'large', text: 'signin_with', shape: 'pill', logo_alignment: 'left', width: w, locale: 'en', click_listener: function(){ hit('signin_start'); }});
      if (!D.getElementById('fwIab')) google.accounts.id.prompt();
    } catch (e) { err('Google sign-in could not load. Please refresh the page.'); hit('signin_fail', null, 'gsi_error'); }
  };
  if (W.google && google.accounts) W.fwGsiReady();
  setTimeout(function(){
    if (!done) { W.fwGsiReady(); if (!done) { err('Google sign-in is taking long to load. Refresh the page, or open it in Chrome or Safari.'); hit('signin_fail', null, 'gsi_not_loaded'); } }
  }, 7000);
})();
