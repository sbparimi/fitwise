/* Fitwise · Conferences & Workshops (/events), 1 Nov 2026. Google sign-in gate + the events list (from /api/events, session-checked). */
(function(){
  var $ = function(s){ return document.querySelector(s); };
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var TOPICS = ['Testing/QA','Test automation','AI/ML','DevOps/Cloud','SRE/Observability','Security','Data','Software engineering','Java/JVM','Agile/Product','Accessibility','General tech'];
  var DEF = {q:'', mic:false, fmt:'all', region:'all', topic:'all', kind:'all', sort:'date', shown:60};
  var st = Object.assign({}, DEF), D = null;
  function todayISO(){ var d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
  function pd(s){ var a = s.split('-').map(Number); return new Date(a[0], a[1]-1, a[2]); }
  function fmtD(s){ var d = pd(s); return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear(); }
  function daysTo(s){ return Math.round((pd(s) - pd(todayISO())) / 864e5); }
  function cfpOf(e){ var c = e.cfp || {}; if (c.status === 'Open' && c.deadline && c.deadline < todayISO()) return Object.assign({}, c, {status:'Closed'}); return c; }
  function isOpen(e){ return cfpOf(e).status === 'Open'; }
  function place(e){ return e.region === 'Online' ? 'Online' : [e.city, e.country].filter(Boolean).join(', '); }
  function upcoming(){ var t = todayISO(); return (D.events || []).filter(function(e){ return (e.end || e.start) >= t; }); }

  /* ---------- sign-in ---------- */
  function showErr(m){ var x = $('#gErr'); if (x) x.textContent = m || ''; }
  function onCred(resp){
    showErr('Signing you in…');
    fetch('/api/auth/google', {method:'POST', headers:{'content-type':'application/json'}, credentials:'same-origin', body: JSON.stringify({credential: resp.credential, source: location.pathname + location.search})})
      .then(function(r){ return r.json().then(function(j){ return [r.ok, j]; }); })
      .then(function(a){ if (a[0]) { location.reload(); } else { showErr(a[1].error || 'Sign-in failed. Please try again.'); } })
      .catch(function(){ showErr('Network error. Please try again.'); if (window.fwHit) fwHit('signin_fail', null, 'network'); });
  }
  var gsiDone = false;
  window.fwGsiReady = function(){
    if (gsiDone || document.body.classList.contains('signed')) return;
    if (!(window.google && google.accounts && google.accounts.id) || !window.FW_GCID) return;
    gsiDone = true;
    try {
      google.accounts.id.initialize({client_id: window.FW_GCID, callback: onCred, ux_mode: 'popup', auto_select: false, cancel_on_tap_outside: true, context: 'signin', itp_support: true});
      var w = Math.min(320, Math.max(200, ($('#gBtn').clientWidth || 300)));
      google.accounts.id.renderButton($('#gBtn'), {type:'standard', theme:'filled_blue', size:'large', text:'signin_with', shape:'pill', logo_alignment:'left', width: w, locale:'en', click_listener: function(){ if (window.fwHit) fwHit('signin_start'); }});
      google.accounts.id.prompt();
    } catch(e) { showErr('Google sign-in could not load. Please refresh the page.'); }
  };
  if (!document.body.classList.contains('signed')) {
    if (window.google && google.accounts) window.fwGsiReady();
    setTimeout(function(){ if (!gsiDone) { window.fwGsiReady(); if (!gsiDone) { showErr('Google sign-in is taking long to load. If it does not appear, allow accounts.google.com or refresh.'); if (window.fwHit) fwHit('signin_fail', null, 'gsi_not_loaded'); } } }, 6000);
    return;
  }

  /* ---------- signed in: load and render ---------- */
  function load(){
    fetch('/api/events', {credentials:'same-origin', cache:'no-store'}).then(function(r){
      if (r.status === 401) { location.reload(); return null; }
      return r.json().then(function(j){ if (!r.ok) throw new Error(j.error || 'error'); return j; });
    }).then(function(j){ if (!j) return; D = j; build(); }).catch(function(e){ $('#evList').innerHTML = '<div class="evempty">' + esc(e.message || 'Could not load the events. Please refresh.') + '</div>'; });
    fetch('/api/me', {credentials:'same-origin'}).then(function(r){ return r.json(); }).then(function(j){ if (j && j.user) $('#evWho').innerHTML = 'Signed in as ' + esc(j.user.email) + ' · <button type="button" id="evOut">Sign out</button>'; var b = $('#evOut'); if (b) b.onclick = function(){ fetch('/api/auth/logout', {method:'POST', credentials:'same-origin'}).then(function(){ try { google.accounts.id.disableAutoSelect(); } catch(e) {} location.reload(); }); }; }).catch(function(){});
  }

  function build(){
    var ev = upcoming(), open = ev.filter(isOpen);
    var cnt = function(r){ return ev.filter(function(e){ return e.region === r; }).length; };
    var k = function(l, n, s, act, cls){ return '<button type="button" class="' + (cls || '') + '" data-act="' + act + '"><small>' + l + '</small><b>' + n + '</b><span>' + s + '</span></button>'; };
    $('#evKpi').innerHTML = k('Upcoming', ev.length, 'from today', 'all') + k('Netherlands', cnt('NL'), 'in NL', 'NL') + k('Europe', cnt('Europe'), 'rest of Europe', 'Europe') + k('Online', cnt('Online'), 'virtual', 'Online') + k('🎤 Speaker calls', open.length, 'open now', 'mic', 'hot');
    Array.prototype.forEach.call($('#evKpi').querySelectorAll('button'), function(b){ b.addEventListener('click', function(){ var a = b.dataset.act; if (a === 'mic') st.mic = true; else { st.mic = false; st.region = a; } st.shown = 60; sync(); render(); $('#evListCard').scrollIntoView({behavior:'smooth', block:'start'}); }); });
    var oc = open.slice().sort(function(a, b){ return (cfpOf(a).deadline || '9999') < (cfpOf(b).deadline || '9999') ? -1 : 1; });
    $('#evCfpN').textContent = oc.length + ' open · soonest deadline first';
    $('#evStrip').innerHTML = oc.length ? oc.slice(0, 30).map(function(e){
      var c = cfpOf(e), dl = c.deadline ? daysTo(c.deadline) : null;
      var t = c.deadline ? '⏳ Deadline ' + fmtD(c.deadline) + (dl === 0 ? ' · today' : dl <= 14 ? ' · ' + dl + ' d left' : '') : '⏳ Rolling call, no deadline stated';
      return '<a class="evcf" href="' + esc(c.url || e.url) + '" target="_blank" rel="noopener"><span class="dl' + (dl !== null && dl <= 14 ? ' soon' : '') + '">' + t + '</span><b>' + esc(e.name) + '</b><span>' + fmtD(e.start) + ' · ' + esc(place(e)) + '</span></a>';
    }).join('') : '<div class="evempty">No open speaker calls right now.</div>';
    var tc = {}; ev.forEach(function(e){ (e.topics || []).forEach(function(t){ tc[t] = (tc[t] || 0) + 1; }); });
    $('#evTopics').innerHTML = '<button type="button" class="chip on" data-t="all">All topics</button>' + TOPICS.filter(function(t){ return tc[t]; }).map(function(t){ return '<button type="button" class="chip" data-t="' + esc(t) + '">' + esc(t) + ' <span class="mu">' + tc[t] + '</span></button>'; }).join('');
    Array.prototype.forEach.call($('#evTopics').querySelectorAll('.chip'), function(b){ b.addEventListener('click', function(){ st.topic = b.dataset.t; st.shown = 60; sync(); render(); }); });
    var g = D.generated_at ? new Date(D.generated_at) : null, gs = '';
    try { gs = g ? g.toLocaleString('en-GB', {timeZone:'Europe/Amsterdam', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : ''; } catch(e) {}
    $('#evUpd').textContent = gs ? 'List refreshed ' + gs + ' (Amsterdam time).' : '';
    sync(); render();
  }
  function sync(){
    $('#evMic').classList.toggle('on', st.mic);
    Array.prototype.forEach.call(document.querySelectorAll('#evFmt .chip'), function(b){ b.classList.toggle('on', b.dataset.f === st.fmt); });
    Array.prototype.forEach.call(document.querySelectorAll('#evTopics .chip'), function(b){ b.classList.toggle('on', b.dataset.t === st.topic); });
    $('#evRegion').value = st.region; $('#evKind').value = st.kind; $('#evSort').value = st.sort;
  }
  function filtered(){
    var q = st.q.trim().toLowerCase();
    var ev = upcoming().filter(function(e){
      if (st.mic && !isOpen(e)) return false;
      if (st.fmt === 'inperson' && !(e.format === 'In person' || e.format === 'Hybrid')) return false;
      if (st.fmt === 'virtual' && !(e.format === 'Virtual' || e.format === 'Hybrid')) return false;
      if (st.region === 'NL' && e.region !== 'NL') return false;
      if (st.region === 'Europe' && e.region !== 'Europe') return false;
      if (st.region === 'NLEU' && e.region === 'Online') return false;
      if (st.region === 'Online' && e.region !== 'Online') return false;
      if (st.topic !== 'all' && (e.topics || []).indexOf(st.topic) < 0) return false;
      if (st.kind !== 'all' && e.kind !== st.kind) return false;
      if (q && (e.name + ' ' + (e.city || '') + ' ' + (e.country || '') + ' ' + (e.topics || []).join(' ') + ' ' + (e.organiser || '')).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if (st.sort === 'cfp') ev.sort(function(a, b){ var ka = isOpen(a) ? (cfpOf(a).deadline || '9998') : '9999', kb = isOpen(b) ? (cfpOf(b).deadline || '9998') : '9999'; return ka < kb ? -1 : ka > kb ? 1 : (a.start < b.start ? -1 : 1); });
    else ev.sort(function(a, b){ return a.start < b.start ? -1 : a.start > b.start ? 1 : (a.region === 'NL' ? -1 : 1); });
    return ev;
  }
  function card(e){
    var d = pd(e.start), multi = e.end && e.end !== e.start, c = cfpOf(e);
    var fc = e.format === 'Virtual' ? 'vir' : e.format === 'Hybrid' ? 'hyb' : 'inp', cfp;
    if (c.status === 'Open') cfp = '<span class="cfp open">🎤 Speaker call open – ' + (c.deadline ? 'deadline ' + fmtD(c.deadline) : 'rolling, no deadline stated') + '</span>' + (c.url ? '<a class="ap" href="' + esc(c.url) + '" target="_blank" rel="noopener">Call for speakers ↗</a>' : '');
    else if (c.status === 'Closed') cfp = '<span class="cfp closed">Speaker call closed' + (c.deadline ? ' (' + fmtD(c.deadline) + ')' : '') + '</span>';
    else cfp = '<span class="cfp ns">Speaker call: not stated</span>';
    return '<div class="eve"><div class="evd"><small>' + MON[d.getMonth()] + '</small><b>' + d.getDate() + '</b><em>' + DOW[d.getDay()] + (e.time ? ' ' + esc(e.time) : '') + '</em></div>' +
      '<div class="evb"><a class="t" href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.name) + '</a>' +
      '<div class="evl">' + esc(place(e)) + ' · ' + fmtD(e.start) + (multi ? ' – ' + fmtD(e.end) : '') + (e.organiser ? ' · ' + esc(e.organiser) : '') + (e.date_checked === false ? ' · date per listing' : '') + '</div>' +
      '<div class="evp"><span class="pill ' + fc + '">' + esc(e.format) + '</span><span class="pill">' + esc(e.kind) + '</span>' + (e.region === 'NL' ? '<span class="pill nl">NL</span>' : '') + (e.price && e.price !== 'Not stated' ? '<span class="pill' + (e.price === 'Free' ? ' free' : '') + '">' + esc(e.price) + '</span>' : '') + (e.topics || []).map(function(t){ return '<span class="pill tp">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="evcp">' + cfp + '</div>' + (c.note ? '<div class="evn">' + esc(c.note) + '</div>' : '') + '</div></div>';
  }
  function render(){
    if (!D) return;
    var ev = filtered();
    $('#evCount').textContent = ev.length + ' event' + (ev.length === 1 ? '' : 's');
    if (!ev.length) { $('#evList').innerHTML = '<div class="evempty">No events match these filters.</div>'; return; }
    var h = '', cur = '';
    ev.slice(0, st.shown).forEach(function(e){ if (st.sort === 'date') { var d = pd(e.start), m = MONL[d.getMonth()] + ' ' + d.getFullYear(); if (m !== cur) { cur = m; h += '<div class="evmon">' + m + '</div>'; } } h += card(e); });
    if (ev.length > st.shown) h += '<button type="button" class="btn ghost evmore" id="evMore">Show ' + Math.min(60, ev.length - st.shown) + ' more of ' + (ev.length - st.shown) + '</button>';
    $('#evList').innerHTML = h;
    var mb = $('#evMore'); if (mb) mb.addEventListener('click', function(){ st.shown += 60; render(); });
  }
  $('#evQ').addEventListener('input', function(e){ st.q = e.target.value; st.shown = 60; render(); });
  $('#evMic').addEventListener('click', function(){ st.mic = !st.mic; st.shown = 60; sync(); render(); });
  Array.prototype.forEach.call(document.querySelectorAll('#evFmt .chip'), function(b){ b.addEventListener('click', function(){ st.fmt = st.fmt === b.dataset.f ? 'all' : b.dataset.f; st.shown = 60; sync(); render(); }); });
  $('#evRegion').addEventListener('change', function(e){ st.region = e.target.value; st.shown = 60; render(); });
  $('#evKind').addEventListener('change', function(e){ st.kind = e.target.value; st.shown = 60; render(); });
  $('#evSort').addEventListener('change', function(e){ st.sort = e.target.value; st.shown = 60; render(); });
  $('#evReset').addEventListener('click', function(){ st = Object.assign({}, DEF); $('#evQ').value = ''; sync(); render(); });
  load();
})();
