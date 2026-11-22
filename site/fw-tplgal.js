/* /templates — live-rendered gallery of all 20 templates with category filters. */
(function(){
function init(){
  var FW = window.FW; if(!FW || !FW.TEMPLATES) return;
  var demo = FW.demoDoc();
  var cur = new URLSearchParams(location.search).get("cat") || "all";
  var fil = document.getElementById("tFilters"), gal = document.getElementById("tGal");
  var counts = {};
  FW.TPL_CATS.forEach(function(c){
    counts[c.id] = c.id==="all" ? FW.TEMPLATES.length : FW.TEMPLATES.filter(function(t){ return t.cat.indexOf(c.id)>=0; }).length;
  });
  fil.innerHTML = FW.TPL_CATS.map(function(c){
    return '<button type="button" data-cat="'+c.id+'" aria-pressed="'+(c.id===cur)+'">'+FW.esc(c.label.replace(/\s\(\d+\)$/,""))+' ('+counts[c.id]+')</button>';
  }).join("");
  function draw(){
    var list = cur==="all" ? FW.TEMPLATES : FW.TEMPLATES.filter(function(t){ return t.cat.indexOf(cur)>=0; });
    gal.innerHTML = list.map(function(t){
      var badge = t.cat.indexOf("ats")>=0 ? '<span class="tag">ATS-safe</span>' : '<span class="tag v">'+FW.esc(t.cat[0])+'</span>';
      return '<div class="tpl-card"><div class="tpl-thumb" data-tpl="'+t.slug+'"></div>' +
        '<div class="tpl-meta"><b>'+FW.esc(t.name)+'</b>'+badge+'</div>' +
        '<p class="small muted" style="margin:0 14px 10px">'+FW.esc(t.blurb)+'</p>' +
        '<a class="btn sm" href="/builder?tpl='+t.slug+'">Use this template</a></div>';
    }).join("");
    gal.querySelectorAll(".tpl-thumb").forEach(function(th){
      FW.renderResume(th, demo, {tpl: th.getAttribute("data-tpl"), accent:"#4F23E6", font:"Inter", size:10.2, spacing:1.4, margin:14});
    });
  }
  fil.addEventListener("click", function(e){
    var b = e.target.closest("[data-cat]"); if(!b) return;
    cur = b.getAttribute("data-cat");
    fil.querySelectorAll("[data-cat]").forEach(function(x){ x.setAttribute("aria-pressed", String(x===b)); });
    history.replaceState(null,"","/templates" + (cur==="all" ? "" : "?cat="+cur));
    draw();
  });
  draw();
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
