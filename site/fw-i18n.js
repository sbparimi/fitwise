/* Fitwise i18n — EN / DE / NL. Lightweight: swaps [data-i18n] text nodes and remembers the choice. */
(function(){
  var DICT = {
    en:{nav_features:"Features",nav_templates:"Templates",nav_ats:"ATS Checker",nav_jobs:"Jobs",nav_pricing:"Pricing",
        nav_dashboard:"Dashboard",nav_signin:"Sign In",nav_cta:"Get Started Free",
        hero_cta1:"Build My Resume Free",hero_cta2:"Free ATS Scan",foot_rights:"All rights reserved."},
    de:{nav_features:"Funktionen",nav_templates:"Vorlagen",nav_ats:"ATS-Check",nav_jobs:"Jobs",nav_pricing:"Preise",
        nav_dashboard:"Dashboard",nav_signin:"Anmelden",nav_cta:"Kostenlos starten",
        hero_cta1:"Lebenslauf kostenlos erstellen",hero_cta2:"Kostenloser ATS-Check",foot_rights:"Alle Rechte vorbehalten."},
    nl:{nav_features:"Functies",nav_templates:"Sjablonen",nav_ats:"ATS-check",nav_jobs:"Vacatures",nav_pricing:"Prijzen",
        nav_dashboard:"Dashboard",nav_signin:"Inloggen",nav_cta:"Gratis beginnen",
        hero_cta1:"Maak mijn cv gratis",hero_cta2:"Gratis ATS-scan",foot_rights:"Alle rechten voorbehouden."}
  };
  var KEY="fw_lang";
  function cur(){ try{ return localStorage.getItem(KEY)||"en"; }catch(e){ return "en"; } }
  function apply(lang){
    var d = DICT[lang]||DICT.en;
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var k = el.getAttribute("data-i18n"); if(d[k]) el.textContent = d[k];
    });
    var cu = document.getElementById("langCur"); if(cu) cu.textContent = lang.toUpperCase();
    document.querySelectorAll("#langMenu button").forEach(function(b){
      b.setAttribute("aria-current", b.getAttribute("data-lang")===lang ? "true":"false");
    });
    try{ document.documentElement.lang = lang; }catch(e){}
  }
  function set(lang){ try{ localStorage.setItem(KEY, lang); }catch(e){} apply(lang); }
  function init(){
    apply(cur());
    var btn=document.getElementById("langBtn"), menu=document.getElementById("langMenu");
    if(btn&&menu){
      btn.addEventListener("click",function(e){ e.stopPropagation();
        var mm=document.getElementById("mobMenu"); if(mm && mm.open) mm.open=false;
        var open = !menu.hidden; menu.hidden = open; btn.setAttribute("aria-expanded", String(!open)); });
      menu.querySelectorAll("button").forEach(function(b){
        b.addEventListener("click",function(){ set(b.getAttribute("data-lang")); menu.hidden=true; btn.setAttribute("aria-expanded","false"); });
      });
      document.addEventListener("click",function(e){ if(!menu.hidden && !menu.contains(e.target) && e.target!==btn){ menu.hidden=true; btn.setAttribute("aria-expanded","false"); } });
    }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
  window.FWI18N={set:set,current:cur,dict:DICT};
})();
