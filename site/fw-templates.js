/* Fitwise resume templates — 20 genuinely distinct, ATS-tested layouts. Pure HTML/CSS so the PDF export
   is real selectable vector text, not an image. Each template declares a layout engine + its own CSS. */
(function(){
"use strict";
var FW = window.FW = window.FW || {};
var E = FW.esc;

function row(doc){
  return [doc.email, doc.phone, doc.location, doc.linkedin, doc.website].filter(Boolean)
    .map(function(x){ return '<span>'+E(x)+'</span>'; }).join("");
}
function secTitle(t){ return '<div class="rz-h">'+E(t)+'</div>'; }
function expHtml(doc, opt){
  if(!doc.experience || !doc.experience.length) return "";
  return doc.experience.map(function(e){
    var head = '<div class="rz-job-h"><div><span class="rz-job-t">'+E(e.title||"Role")+'</span>'+
      (e.company?'<span class="rz-job-c">'+(opt&&opt.dash?" — ":" · ")+E(e.company)+'</span>':"")+'</div>'+
      (e.when?'<span class="rz-when">'+E(e.when)+'</span>':"")+'</div>';
    var loc = (e.location && (!opt||!opt.hideLoc)) ? '<div class="rz-when rz-loc">'+E(e.location)+'</div>' : "";
    var b = (e.bullets||[]).filter(Boolean);
    return '<div class="rz-job">'+head+loc+(b.length?'<ul>'+b.map(function(x){ return '<li>'+E(x)+'</li>'; }).join("")+'</ul>':"")+'</div>';
  }).join("");
}
function eduHtml(doc){
  if(!doc.education || !doc.education.length) return "";
  return doc.education.map(function(e){
    return '<div class="rz-job"><div class="rz-job-h"><div><span class="rz-job-t">'+E(e.degree||"Degree")+'</span>'+
      (e.school?'<span class="rz-job-c"> · '+E(e.school)+'</span>':"")+'</div>'+
      (e.when?'<span class="rz-when">'+E(e.when)+'</span>':"")+'</div></div>';
  }).join("");
}
function skillsHtml(doc, plain){
  if(!doc.skills || !doc.skills.length) return "";
  if(plain) return '<p class="rz-sum">'+doc.skills.map(E).join(" · ")+'</p>';
  return '<div class="rz-skills">'+doc.skills.map(function(s){ return '<span>'+E(s)+'</span>'; }).join("")+'</div>';
}
function projHtml(doc){
  if(!doc.projects || !doc.projects.length) return "";
  return doc.projects.map(function(p){
    return '<div class="rz-job"><span class="rz-job-t">'+E(p.name||"")+'</span>'+
      (p.detail?'<div>'+E(p.detail)+'</div>':"")+'</div>';
  }).join("");
}
function listHtml(arr){ return arr && arr.length ? '<ul>'+arr.filter(Boolean).map(function(x){ return '<li>'+E(x)+'</li>'; }).join("")+'</ul>' : ""; }

/* section blocks by key, so the user's section order is honoured */
function block(key, doc, o){
  o = o||{};
  switch(key){
    case "summary": return doc.summary ? '<div class="rz-sec rz-s-summary">'+secTitle(o.sumTitle||"Professional Summary")+'<p class="rz-sum">'+E(doc.summary)+'</p></div>' : "";
    case "experience": { var h=expHtml(doc,o); return h ? '<div class="rz-sec rz-s-exp">'+secTitle(o.expTitle||"Experience")+h+'</div>' : ""; }
    case "education": { var h2=eduHtml(doc); return h2 ? '<div class="rz-sec rz-s-edu">'+secTitle("Education")+h2+'</div>' : ""; }
    case "skills": { var h3=skillsHtml(doc,o.plainSkills); return h3 ? '<div class="rz-sec rz-s-skills">'+secTitle(o.skillsTitle||"Skills")+h3+'</div>' : ""; }
    case "projects": { var h4=projHtml(doc); return h4 ? '<div class="rz-sec rz-s-proj">'+secTitle("Projects")+h4+'</div>' : ""; }
    case "certifications": { var h5=listHtml(doc.certifications); return h5 ? '<div class="rz-sec rz-s-cert">'+secTitle("Certifications")+h5+'</div>' : ""; }
    case "languages": { var h6=(doc.languages&&doc.languages.length)?'<p class="rz-sum">'+doc.languages.map(E).join(" · ")+'</p>':""; return h6 ? '<div class="rz-sec rz-s-lang">'+secTitle("Languages")+h6+'</div>' : ""; }
    case "custom": { var c=doc.custom||{}; var h7=listHtml(c.items); return h7 ? '<div class="rz-sec rz-s-custom">'+secTitle(c.title||"Additional")+h7+'</div>' : ""; }
  }
  return "";
}
function order(doc){
  var def = ["summary","experience","education","skills","projects","certifications","languages","custom"];
  var o = (doc.order && doc.order.length) ? doc.order.slice() : def;
  def.forEach(function(k){ if(o.indexOf(k)<0) o.push(k); });
  return o;
}
function body(doc, o){ return order(doc).map(function(k){ return block(k, doc, o); }).join(""); }

/* ---- layout engines ---- */
var L = {
  classic: function(doc,o){
    return '<header class="rz-head"><h1 class="rz-name">'+E(doc.name||"Your Name")+'</h1>'+
      (doc.role?'<p class="rz-role">'+E(doc.role)+'</p>':"")+
      '<div class="rz-contact">'+row(doc)+'</div></header>'+body(doc,o);
  },
  centered: function(doc,o){
    return '<header class="rz-head rz-center"><h1 class="rz-name">'+E(doc.name||"Your Name")+'</h1>'+
      (doc.role?'<p class="rz-role">'+E(doc.role)+'</p>':"")+
      '<div class="rz-contact">'+row(doc)+'</div></header>'+body(doc,o);
  },
  band: function(doc,o){
    return '<header class="rz-band"><h1 class="rz-name">'+E(doc.name||"Your Name")+'</h1>'+
      (doc.role?'<p class="rz-role">'+E(doc.role)+'</p>':"")+
      '<div class="rz-contact">'+row(doc)+'</div></header><div class="rz-main">'+body(doc,o)+'</div>';
  },
  sidebar: function(doc,o){
    var side = '<aside class="rz-side">'+
      '<div class="rz-side-name"><h1 class="rz-name">'+E(doc.name||"Your Name")+'</h1>'+
      (doc.role?'<p class="rz-role">'+E(doc.role)+'</p>':"")+'</div>'+
      '<div class="rz-side-sec"><div class="rz-h">Contact</div><div class="rz-side-list">'+
        [doc.email,doc.phone,doc.location,doc.linkedin,doc.website].filter(Boolean).map(function(x){ return '<div>'+E(x)+'</div>'; }).join("")+'</div></div>'+
      ((doc.skills&&doc.skills.length)?'<div class="rz-side-sec"><div class="rz-h">Skills</div><div class="rz-side-list">'+
        doc.skills.map(function(s){ return '<div>'+E(s)+'</div>'; }).join("")+'</div></div>':"")+
      ((doc.languages&&doc.languages.length)?'<div class="rz-side-sec"><div class="rz-h">Languages</div><div class="rz-side-list">'+
        doc.languages.map(function(s){ return '<div>'+E(s)+'</div>'; }).join("")+'</div></div>':"")+
      ((doc.certifications&&doc.certifications.length)?'<div class="rz-side-sec"><div class="rz-h">Certifications</div><div class="rz-side-list">'+
        doc.certifications.map(function(s){ return '<div>'+E(s)+'</div>'; }).join("")+'</div></div>':"")+
      '</aside>';
    var keys = order(doc).filter(function(k){ return ["skills","languages","certifications"].indexOf(k)<0; });
    return '<div class="rz-split">'+side+'<section class="rz-body">'+keys.map(function(k){ return block(k,doc,o); }).join("")+'</section></div>';
  },
  split: function(doc,o){
    var keys = order(doc);
    var left = keys.filter(function(k){ return ["summary","experience","projects"].indexOf(k)>=0; });
    var right = keys.filter(function(k){ return left.indexOf(k)<0; });
    return '<header class="rz-head"><h1 class="rz-name">'+E(doc.name||"Your Name")+'</h1>'+
      (doc.role?'<p class="rz-role">'+E(doc.role)+'</p>':"")+'<div class="rz-contact">'+row(doc)+'</div></header>'+
      '<div class="rz-cols"><div class="rz-c1">'+left.map(function(k){ return block(k,doc,o); }).join("")+'</div>'+
      '<div class="rz-c2">'+right.map(function(k){ return block(k,doc,o); }).join("")+'</div></div>';
  }
};

/* ---- the 20 templates ---- */
FW.TEMPLATES = [
  /* regional */
  {slug:"us-classic", name:"US Classic", cat:["regional","ats"], blurb:"Chronological US résumé, one column", layout:"centered", css:
   '.rz{font-family:"Georgia",serif}.rz .rz-center{text-align:center}.rz .rz-center .rz-contact{justify-content:center}'+
   '.rz .rz-h{border-bottom:1.5px solid #222;color:#15181F;letter-spacing:.14em}'},
  {slug:"us-modern", name:"US Modern", cat:["regional","modern"], blurb:"Clean US résumé with accent rules", layout:"classic", css:
   '.rz .rz-name{font-size:23pt}.rz .rz-h{border-bottom:2px solid var(--rz-acc);letter-spacing:.07em}'+
   '.rz .rz-job-t{color:#111}.rz .rz-contact span+span::before{content:"•";margin-right:9pt;color:#9AA0B4}'},
  {slug:"uk-executive", name:"UK Executive CV", cat:["regional","executive"], blurb:"UK CV with profile-first ordering", layout:"classic", css:
   '.rz{font-family:"Georgia",serif;font-size:10.4pt}.rz .rz-name{letter-spacing:.02em}'+
   '.rz .rz-h{text-transform:none;font-size:11pt;letter-spacing:0;border-bottom:1px solid #C9CCDA;font-weight:700}'+
   '.rz .rz-role{font-style:italic;color:#3A3F55}'},
  {slug:"europass-eu", name:"Europass EU", cat:["regional","ats"], blurb:"EU-standard tabular CV", layout:"classic", css:
   '.rz .rz-sec{display:grid;grid-template-columns:34mm 1fr;gap:6pt;border-top:1px solid #DCDFEA;padding-top:5pt}'+
   '.rz .rz-h{border:0;padding:0;margin:0;color:var(--rz-acc)}.rz .rz-sec>*:not(.rz-h){grid-column:2}'+
   '.rz .rz-name{font-size:19pt}.rz .rz-contact{border-bottom:2px solid var(--rz-acc);padding-bottom:7pt}'},
  {slug:"dach-cv", name:"DACH Lebenslauf", cat:["regional","ats"], blurb:"German/Swiss tabular layout", layout:"classic", css:
   '.rz{font-family:"Arial",Helvetica,sans-serif}.rz .rz-name{font-size:18pt;text-transform:uppercase;letter-spacing:.06em}'+
   '.rz .rz-job-h{display:grid;grid-template-columns:32mm 1fr;align-items:start}'+
   '.rz .rz-when{order:-1;color:#15181F;font-weight:700}.rz .rz-h{background:#F1F2F7;padding:3pt 5pt;border:0;color:#15181F}'},
  /* ATS-first */
  {slug:"ats-harvard", name:"Harvard Clean", cat:["ats"], blurb:"The safest parse of all 20", layout:"centered", css:
   '.rz{font-family:"Inter",Arial,sans-serif}.rz .rz-center{text-align:center;border-bottom:1.5px solid #15181F;padding-bottom:7pt}'+
   '.rz .rz-center .rz-contact{justify-content:center;margin-bottom:0}.rz .rz-h{color:#15181F;border-bottom:1px solid #15181F}'},
  {slug:"tech-minimal", name:"Tech Minimal", cat:["ats","modern"], blurb:"Minimal type, dense signal", layout:"classic", css:
   '.rz{font-size:9.9pt}.rz .rz-name{font-weight:700;font-size:19pt}.rz .rz-h{border:0;color:#6B7186;font-size:8.6pt;letter-spacing:.16em}'+
   '.rz .rz-job{border-left:2px solid #ECEBF5;padding-left:8pt}.rz .rz-job-t{color:var(--rz-acc)}'},
  {slug:"consulting-compact", name:"Consulting Compact", cat:["ats","executive"], blurb:"Two pages of impact, tightly set", layout:"classic", css:
   '.rz{font-size:9.6pt;line-height:1.34}.rz .rz-sec{margin-bottom:7pt}.rz li{margin-bottom:1.8pt}'+
   '.rz .rz-h{letter-spacing:.12em;border-bottom:1px solid #15181F;color:#15181F;font-size:8.8pt}'+
   '.rz .rz-name{font-size:17pt;text-transform:uppercase;letter-spacing:.08em}'},
  {slug:"engineering-mono", name:"Engineering Mono", cat:["ats","modern"], blurb:"Monospace headers, clean body", layout:"classic", css:
   '.rz .rz-name,.rz .rz-h,.rz .rz-when{font-family:"JetBrains Mono","SFMono-Regular",Consolas,monospace}'+
   '.rz .rz-name{font-size:18pt;letter-spacing:-.02em}.rz .rz-h{font-size:8.6pt;letter-spacing:.1em;border-bottom:1px dashed #C7CBDA}'+
   '.rz .rz-skills span{border-radius:2pt;background:#F3F4F9;font-family:"JetBrains Mono",monospace;font-size:8.2pt}'},
  {slug:"fresh-graduate", name:"Fresh Graduate", cat:["ats"], blurb:"Education first, projects prominent", layout:"centered", css:
   '.rz .rz-center{text-align:center}.rz .rz-center .rz-contact{justify-content:center}'+
   '.rz .rz-h{color:var(--rz-acc);border-bottom:1px solid var(--rz-acc)}.rz .rz-s-edu{order:-1}'+
   '.rz .rz-name{font-size:22pt;color:var(--rz-acc)}'},
  /* modern */
  {slug:"berlin-grid", name:"Berlin Grid", cat:["modern"], blurb:"Two-column grid, airy spacing", layout:"split", css:
   '.rz .rz-cols{display:grid;grid-template-columns:1.55fr 1fr;gap:12pt}'+
   '.rz .rz-h{border:0;background:linear-gradient(90deg,var(--rz-acc),transparent);color:#fff;padding:3pt 6pt;border-radius:2pt}'+
   '.rz .rz-c2 .rz-h{background:#F0EFF8;color:var(--rz-acc)}.rz .rz-name{font-size:24pt;letter-spacing:-.03em}'},
  {slug:"amsterdam-modern", name:"Amsterdam Modern", cat:["modern"], blurb:"Accent band header, crisp body", layout:"band", css:
   '.rz{padding:0}.rz .rz-band{background:var(--rz-acc);color:#fff;padding:13mm 15mm 10mm}'+
   '.rz .rz-band .rz-name{color:#fff;font-size:23pt}.rz .rz-band .rz-role{color:rgba(255,255,255,.88)}'+
   '.rz .rz-band .rz-contact{color:rgba(255,255,255,.92);margin:0}.rz .rz-main{padding:10mm 15mm 15mm}'+
   '.rz .rz-h{border-bottom:2px solid var(--rz-acc)}'},
  {slug:"silicon-split", name:"Silicon Valley Split", cat:["modern","visual"], blurb:"Sidebar skills, bold main column", layout:"sidebar", css:
   '.rz{padding:0}.rz .rz-split{display:grid;grid-template-columns:62mm 1fr;min-height:297mm}'+
   '.rz .rz-side{background:#15181F;color:#E8EAF2;padding:14mm 9mm}'+
   '.rz .rz-side .rz-name{color:#fff;font-size:18pt}.rz .rz-side .rz-role{color:var(--rz-acc-l,#C3B1FF)}'+
   '.rz .rz-side .rz-h{color:#9AA0B4;border-bottom:1px solid #2A2F3E}'+
   '.rz .rz-side-list div{font-size:8.6pt;margin-bottom:3pt;word-break:break-word}'+
   '.rz .rz-side-sec{margin-top:9pt}.rz .rz-body{padding:14mm 12mm 14mm}'},
  {slug:"startup-bold", name:"Startup Bold", cat:["modern","visual"], blurb:"Big name, confident accents", layout:"classic", css:
   '.rz .rz-name{font-size:30pt;font-weight:800;letter-spacing:-.04em;color:var(--rz-acc)}'+
   '.rz .rz-role{font-size:12pt;font-weight:700;color:#15181F}'+
   '.rz .rz-h{background:#15181F;color:#fff;border:0;padding:3pt 7pt;display:inline-block;border-radius:3pt;letter-spacing:.1em}'+
   '.rz .rz-skills span{background:var(--rz-acc);color:#fff}'},
  {slug:"product-leader", name:"Product Leader", cat:["modern","executive"], blurb:"Summary-led, metric-forward", layout:"classic", css:
   '.rz .rz-sum{background:#F7F6FD;border-left:3px solid var(--rz-acc);padding:7pt 9pt;border-radius:0 3pt 3pt 0}'+
   '.rz .rz-h{border-bottom:1px solid #DCDFEA;color:#15181F}.rz .rz-job-t{font-size:10.8pt}'+
   '.rz .rz-when{background:#F1F2F7;border-radius:99pt;padding:1.5pt 7pt}'},
  /* executive */
  {slug:"executive-serif", name:"Executive Serif", cat:["executive"], blurb:"Serif authority, generous margins", layout:"centered", css:
   '.rz{font-family:"Merriweather","Georgia",serif;font-size:10pt;padding:20mm 18mm}'+
   '.rz .rz-name{font-size:21pt;letter-spacing:.04em;text-transform:uppercase}'+
   '.rz .rz-center{text-align:center;border-bottom:1px solid #15181F;padding-bottom:8pt}'+
   '.rz .rz-center .rz-contact{justify-content:center}.rz .rz-h{border:0;text-align:center;color:#15181F;letter-spacing:.2em}'},
  {slug:"finance-classic", name:"Finance Classic", cat:["executive"], blurb:"Conservative, numbers-first", layout:"classic", css:
   '.rz{font-family:"Georgia",serif}.rz .rz-name{font-size:19pt}'+
   '.rz .rz-h{border-bottom:1px solid #15181F;color:#15181F;letter-spacing:.12em;font-size:9pt}'+
   '.rz .rz-job-h{border-bottom:1px dotted #D3D6E2;padding-bottom:2pt}.rz li{margin-bottom:2.2pt}'},
  {slug:"healthcare-clear", name:"Healthcare Clear", cat:["executive","ats"], blurb:"High-contrast, credential-forward", layout:"classic", css:
   '.rz .rz-h{background:#EAF4FF;color:#124E86;border:0;padding:3pt 6pt;letter-spacing:.08em}'+
   '.rz .rz-name{color:#124E86;font-size:21pt}.rz .rz-role{color:#15181F;font-weight:700}'+
   '.rz .rz-skills span{background:#EAF4FF;color:#124E86}'},
  /* visual */
  {slug:"creative-sidebar", name:"Creative Sidebar", cat:["visual"], blurb:"Tinted sidebar, portfolio-ready", layout:"sidebar", css:
   '.rz{padding:0}.rz .rz-split{display:grid;grid-template-columns:58mm 1fr;min-height:297mm}'+
   '.rz .rz-side{background:#F4F1FE;padding:14mm 9mm;border-right:3px solid var(--rz-acc)}'+
   '.rz .rz-side .rz-name{color:var(--rz-acc);font-size:17pt}.rz .rz-side .rz-h{color:var(--rz-acc);border-bottom:1px solid #DCD4F7}'+
   '.rz .rz-side-list div{font-size:8.6pt;margin-bottom:3pt;word-break:break-word}'+
   '.rz .rz-side-sec{margin-top:9pt}.rz .rz-body{padding:14mm 12mm}'+
   '.rz .rz-body .rz-h{border:0;border-left:3px solid var(--rz-acc);padding-left:6pt}'},
  {slug:"academic-cv", name:"Academic CV", cat:["visual","ats"], blurb:"Publications and teaching friendly", layout:"classic", css:
   '.rz{font-family:"Merriweather","Georgia",serif;font-size:9.8pt}'+
   '.rz .rz-name{font-size:18pt;font-weight:700}.rz .rz-h{border-bottom:1px solid #15181F;letter-spacing:.1em;color:#15181F}'+
   '.rz .rz-job-h{display:block}.rz .rz-when{display:block;margin-top:1pt}.rz li{margin-bottom:2.4pt}'}
];
FW.TPL_BY_SLUG = {};
FW.TEMPLATES.forEach(function(t){ FW.TPL_BY_SLUG[t.slug]=t; });
FW.TPL_CATS = [
  {id:"all", label:"All (20)"},{id:"ats", label:"ATS-Friendly"},{id:"modern", label:"Modern"},
  {id:"executive", label:"Executive"},{id:"regional", label:"Regional (US/UK/EU/DACH)"},{id:"visual", label:"Visually Rich"}
];

function lighten(hex, amt){
  var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex||"#4F23E6"));
  if(!m) return "#C3B1FF";
  var c = [1,2,3].map(function(i){ return Math.min(255, Math.round(parseInt(m[i],16) + (255-parseInt(m[i],16))*amt)); });
  return "#" + c.map(function(x){ return ("0"+x.toString(16)).slice(-2); }).join("");
}
/* renders one resume into an element; returns the html string too */
FW.renderResume = function(el, doc, theme){
  theme = theme || FW.emptyTheme();
  doc = doc || FW.emptyDoc();
  var t = FW.TPL_BY_SLUG[theme.tpl] || FW.TPL_BY_SLUG["ats-harvard"];
  var engine = L[t.layout] || L.classic;
  var opts = {};
  if(t.slug==="uk-executive") opts.sumTitle = "Profile";
  if(t.slug==="dach-cv"){ opts.expTitle = "Berufserfahrung"; opts.sumTitle = "Kurzprofil"; opts.skillsTitle = "Kenntnisse"; }
  if(t.slug==="europass-eu") opts.plainSkills = true;
  if(t.slug==="consulting-compact") opts.plainSkills = true;
  var inner = engine(doc, opts);
  var fonts = {Inter:'"Inter",Arial,sans-serif', Georgia:'"Georgia","Times New Roman",serif', Roboto:'"Roboto",Arial,sans-serif',
    Lato:'"Lato",Arial,sans-serif', Merriweather:'"Merriweather","Georgia",serif', Mono:'"JetBrains Mono",Consolas,monospace'};
  var scope = '.rz[data-tpl="' + t.slug + '"]';
  /* scope only the bare .rz selector — never .rz-name, .rz-h, .rz-split and friends */
  var tplCss = t.css.replace(/\.rz(?![-\w])/g, scope);
  var m = Math.max(6, +theme.margin || 16);
  var m2 = Math.max(6, m - 1);
  /* padding comes last so it wins over a template that zeroes .rz padding, and lands on the
     inner regions for the band and sidebar layouts where the chrome runs to the page edge */
  var pad;
  if(t.layout === "band") pad = scope + ' .rz-band{padding:' + (m - 2) + 'mm ' + m2 + 'mm ' + Math.max(5, m - 6) + 'mm}' +
      scope + ' .rz-main{padding:' + Math.max(5, m - 6) + 'mm ' + m2 + 'mm ' + m + 'mm}';
  else if(t.layout === "sidebar") pad = scope + ' .rz-side{padding:' + m + 'mm ' + Math.max(6, m - 7) + 'mm}' +
      scope + ' .rz-body{padding:' + m + 'mm ' + Math.max(8, m - 4) + 'mm}';
  else pad = scope + '{padding:' + m + 'mm ' + m2 + 'mm}';
  var baseCss = scope + '{font-family:' + (fonts[theme.font] || fonts.Inter) + ';font-size:' + (theme.size || 10.2) +
    'pt;line-height:' + (theme.spacing || 1.42) + '}';
  var html = '<style>' + baseCss + tplCss + pad + '</style>' +
    '<div class="rz" data-tpl="' + t.slug + '" style="--rz-acc:' + E(theme.accent || "#4F23E6") +
      ';--rz-acc-l:' + lighten(theme.accent, .62) + '">' + inner + '</div>';
  if(el) el.innerHTML = html;
  return html;
};
/* a small demo doc for gallery thumbnails */
FW.demoDoc = function(){
  var d = JSON.parse(JSON.stringify(FW.samples.qa.doc));
  d.experience = d.experience.map(function(e){ return {title:e.title, company:e.company, location:e.location, when:e.when, bullets:e.bullets.slice(0,3)}; });
  return d;
};
})();
