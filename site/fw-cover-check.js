/* Shared 10-point cover-letter grader + the /cover-letter-checker page. */
(function(){
"use strict";
var FW = window.FW = window.FW || {};
var CLICHE = [/to whom it may concern/i,/i am writing to apply/i,/i believe i would be a (great|perfect) fit/i,
  /team player/i,/hard[- ]working/i,/think outside the box/i,/passionate about/i,/dynamic environment/i,
  /proven track record/i,/results[- ]driven/i,/self[- ]starter/i,/wear many hats/i,/hit the ground running/i,
  /synergy/i,/go[- ]getter/i,/please find attached my (resume|cv)/i];
FW.coverGrade = function(text, jd, company, role){
  var t = String(text||"").trim();
  var words = t.split(/\s+/).filter(Boolean), wc = words.length;
  var paras = t.split(/\n\s*\n/).filter(function(p){ return p.trim().length > 30; });
  var first = (t.split(/\n/).filter(function(l){ return l.trim().length>20; })[0] || "").trim();
  var lower = t.toLowerCase();
  var hits = CLICHE.filter(function(r){ return r.test(t); });
  var nums = (t.match(/\b\d+([.,]\d+)?\s?(%|k|m|eur|usd|€|\$|years?|months?|users?|clients?|people)?\b/gi)||[])
    .filter(function(x){ return /\d/.test(x); }).length;
  var co = String(company||"").trim();
  var rl = String(role||"").trim();
  var jdWords = jd ? FW.jdKeywords(jd, 16).map(function(k){ return k.kw; }) : [];
  var jdHit = jdWords.filter(function(k){ return lower.indexOf(k) >= 0; }).length;
  var checks = [
    {title:"Opens with something specific, not a template line", ok: !!first && !/^(dear sir|to whom|i am writing to apply|i am writing in response)/i.test(first)},
    {title:"Names the company", ok: co ? lower.indexOf(co.toLowerCase())>=0 : /\b(your (team|company)|at [A-Z][a-zA-Z]+)\b/.test(t)},
    {title:"Names the role", ok: rl ? lower.indexOf(rl.toLowerCase().split(" ")[0])>=0 : /\b(role|position)\b/i.test(t)},
    {title:"Carries concrete evidence (numbers, scale, outcomes)", ok: nums >= 2},
    {title:"Free of recruiter-fatigue clichés", ok: hits.length === 0, detail: hits.length ? hits.length + " found" : ""},
    {title:"Length is right (180–420 words)", ok: wc >= 180 && wc <= 420},
    {title:"Three or more real paragraphs", ok: paras.length >= 3},
    {title:"Reflects the job ad’s own language", ok: jd ? jdHit >= Math.max(2, Math.round(jdWords.length*0.25)) : paras.length >= 3},
    {title:"Says what you want next, not only what you did", ok: /\b(i would (like|love)|i am keen|keen to|looking forward|happy to|i would welcome|next step)\b/i.test(t)},
    {title:"Closes with a clear sign-off", ok: /\b(kind regards|best regards|sincerely|yours (sincerely|faithfully)|many thanks|regards)\b/i.test(t)}
  ];
  var passed = checks.filter(function(c){ return c.ok; }).length;
  return {score: Math.round(passed*10), passed: passed, checks: checks, words: wc, cliches: hits.length};
};
function init(){
  var go = document.getElementById("ccGo"); if(!go) return;
  var idle = document.getElementById("ccIdle"); if(idle) FW.ring(idle, 0, "awaiting letter");
  go.addEventListener("click", function(){
    var t = (document.getElementById("ccText").value||"").trim();
    if(t.length < 80){ FW.toast("Paste the whole letter first"); return; }
    var jd = (document.getElementById("ccJd").value||"").trim();
    var r = FW.coverGrade(t, jd, "", "");
    document.getElementById("ccOut").innerHTML =
      '<div class="score-row"><span class="ring" id="ccRing"></span><div><b style="font-size:1.1rem">' + r.score + '/100</b>' +
      '<p class="small muted" style="margin:2px 0 0">' + r.passed + ' of 10 checks passed · ' + r.words + ' words' +
      (r.cliches ? ' · ' + r.cliches + ' cliché' + (r.cliches===1?"":"s") : "") + '</p></div></div>' +
      '<div class="checks" style="margin-top:14px">' + r.checks.map(function(c){
        return '<div class="ck'+(c.ok?"":" warn")+'"><span class="ck-ic">'+(c.ok?"✓":"!")+'</span><div><b>'+FW.esc(c.title)+'</b>' +
          (c.ok ? "" : '<p>Worth fixing before you send it.</p>') + '</div></div>'; }).join("") + '</div>' +
      '<a class="btn block" href="/cover-letter" style="margin-top:16px">Rewrite it in the Studio →</a>';
    FW.ring(document.getElementById("ccRing"), r.score, "quality");
  });
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
