/* Fitwise export — real .docx (OOXML in a store-only zip, built in the browser) and crisp vector PDF via print. */
(function(){
"use strict";
var FW = window.FW = window.FW || {};

/* ---------- minimal ZIP writer (stored, no compression — valid .docx) ---------- */
var CRC_T = (function(){ var t=new Uint32Array(256);
  for(var n=0;n<256;n++){ var c=n; for(var k=0;k<8;k++) c = c&1 ? 0xEDB88320 ^ (c>>>1) : c>>>1; t[n]=c>>>0; } return t; })();
function crc32(u8){ var c = 0xFFFFFFFF; for(var i=0;i<u8.length;i++) c = CRC_T[(c ^ u8[i]) & 0xFF] ^ (c>>>8); return (c ^ 0xFFFFFFFF)>>>0; }
function zip(files){
  var enc = new TextEncoder(), chunks = [], central = [], offset = 0;
  files.forEach(function(f){
    var nameB = enc.encode(f.name), data = typeof f.data === "string" ? enc.encode(f.data) : f.data;
    var crc = crc32(data);
    var lh = new Uint8Array(30 + nameB.length), dv = new DataView(lh.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0, true); dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true); dv.setUint16(12, 0x2821, true);
    dv.setUint32(14, crc, true); dv.setUint32(18, data.length, true); dv.setUint32(22, data.length, true);
    dv.setUint16(26, nameB.length, true); dv.setUint16(28, 0, true);
    lh.set(nameB, 30);
    chunks.push(lh, data);
    var ch = new Uint8Array(46 + nameB.length), cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true); cv.setUint16(10, 0, true); cv.setUint16(12, 0, true); cv.setUint16(14, 0x2821, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameB.length, true); cv.setUint32(42, offset, true);
    ch.set(nameB, 46);
    central.push(ch);
    offset += lh.length + data.length;
  });
  var cdSize = central.reduce(function(a,c){ return a + c.length; }, 0);
  var end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true); ev.setUint32(16, offset, true);
  return new Blob(chunks.concat(central, [end]), {type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
}

/* ---------- OOXML building blocks ---------- */
function xe(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function run(text, o){
  o = o || {};
  var rpr = "<w:rPr>" +
    (o.bold?"<w:b/>":"") + (o.italic?"<w:i/>":"") + (o.caps?"<w:caps/>":"") +
    (o.color?'<w:color w:val="'+o.color.replace("#","")+'"/>':"") +
    (o.size?'<w:sz w:val="'+Math.round(o.size*2)+'"/><w:szCs w:val="'+Math.round(o.size*2)+'"/>':"") +
    (o.font?'<w:rFonts w:ascii="'+o.font+'" w:hAnsi="'+o.font+'"/>':"") +
    (o.spacing?'<w:spacing w:val="'+o.spacing+'"/>':"") + "</w:rPr>";
  return '<w:r>'+rpr+'<w:t xml:space="preserve">'+xe(text)+'</w:t></w:r>';
}
function para(runs, o){
  o = o || {};
  var ppr = "<w:pPr>" +
    (o.align?'<w:jc w:val="'+o.align+'"/>':"") +
    '<w:spacing w:before="'+(o.before||0)+'" w:after="'+(o.after==null?60:o.after)+'" w:line="'+(o.line||240)+'" w:lineRule="auto"/>' +
    (o.border?'<w:pBdr><w:bottom w:val="single" w:sz="'+(o.borderSz||6)+'" w:space="1" w:color="'+(o.borderColor||"999999")+'"/></w:pBdr>':"") +
    (o.bullet?'<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>':"") +
    (o.indent?'<w:ind w:left="'+o.indent+'"/>':"") + "</w:pPr>";
  return '<w:p>'+ppr+(runs||"")+'</w:p>';
}
FW.docxBlob = function(doc, theme){
  theme = theme || FW.emptyTheme();
  var acc = (theme.accent||"#4F23E6").replace("#","");
  var font = ({Inter:"Calibri", Georgia:"Georgia", Roboto:"Calibri", Lato:"Calibri", Merriweather:"Georgia", Mono:"Consolas"})[theme.font] || "Calibri";
  var base = Math.max(9, Math.min(12, theme.size || 10.5));
  var P = [];
  P.push(para(run(doc.name || "Your Name", {bold:true, size:base+9, font:font}), {align:"center", after:20}));
  if(doc.role) P.push(para(run(doc.role, {size:base+1.5, color:acc, bold:true, font:font}), {align:"center", after:20}));
  var contact = [doc.email, doc.phone, doc.location, doc.linkedin, doc.website].filter(Boolean).join("  |  ");
  if(contact) P.push(para(run(contact, {size:base-1.4, font:font}), {align:"center", after:160}));
  function heading(t){
    P.push(para(run(t.toUpperCase(), {bold:true, size:base-0.6, color:acc, font:font, spacing:20}),
      {before:150, after:60, border:true, borderColor:"D8DBE6"}));
  }
  var ord = (doc.order && doc.order.length) ? doc.order : ["summary","experience","education","skills","projects","certifications","languages","custom"];
  ord.forEach(function(key){
    if(key==="summary" && doc.summary){ heading("Professional Summary"); P.push(para(run(doc.summary,{size:base,font:font}),{after:80})); }
    if(key==="experience" && (doc.experience||[]).length){
      heading("Experience");
      doc.experience.forEach(function(e){
        var head = run((e.title||"Role"), {bold:true, size:base+0.4, font:font}) +
          (e.company ? run("  ·  " + e.company + (e.location ? ", " + e.location : ""), {size:base, font:font}) : "") +
          (e.when ? run("    " + e.when, {size:base-1.4, color:"5B6076", font:font}) : "");
        P.push(para(head, {after:30}));
        (e.bullets||[]).filter(Boolean).forEach(function(b){ P.push(para(run(b,{size:base,font:font}), {bullet:true, after:20})); });
      });
    }
    if(key==="education" && (doc.education||[]).length){
      heading("Education");
      doc.education.forEach(function(e){
        P.push(para(run(e.degree||"", {bold:true, size:base, font:font}) +
          (e.school?run("  ·  "+e.school, {size:base, font:font}):"") +
          (e.when?run("    "+e.when, {size:base-1.4, color:"5B6076", font:font}):""), {after:40}));
      });
    }
    if(key==="skills" && (doc.skills||[]).length){ heading("Skills"); P.push(para(run(doc.skills.join("  ·  "), {size:base, font:font}), {after:60})); }
    if(key==="projects" && (doc.projects||[]).length){
      heading("Projects");
      doc.projects.forEach(function(p){ P.push(para(run(p.name||"", {bold:true, size:base, font:font}) + (p.detail?run(" — "+p.detail, {size:base, font:font}):""), {after:40})); });
    }
    if(key==="certifications" && (doc.certifications||[]).length){
      heading("Certifications");
      doc.certifications.forEach(function(c){ P.push(para(run(c,{size:base,font:font}), {bullet:true, after:20})); });
    }
    if(key==="languages" && (doc.languages||[]).length){ heading("Languages"); P.push(para(run(doc.languages.join("  ·  "), {size:base, font:font}), {after:60})); }
    if(key==="custom" && doc.custom && (doc.custom.items||[]).length){
      heading(doc.custom.title || "Additional");
      doc.custom.items.forEach(function(c){ P.push(para(run(c,{size:base,font:font}), {bullet:true, after:20})); });
    }
  });
  var m = Math.round((theme.margin || 16) * 56.7); /* mm -> twips */
  var docXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + P.join("") +
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="'+m+'" w:right="'+m+'" w:bottom="'+m+'" w:left="'+m+'" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>' +
    '</w:body></w:document>';
  var numbering = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="\u2022"/>' +
    '<w:lvlJc w:val="left"/><w:pPr><w:ind w:left="360" w:hanging="200"/></w:pPr>' +
    '<w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/></w:rPr></w:lvl></w:abstractNum>' +
    '<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>';
  var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr>' +
    '<w:rFonts w:ascii="'+font+'" w:hAnsi="'+font+'" w:cs="'+font+'"/><w:sz w:val="'+Math.round(base*2)+'"/></w:rPr></w:rPrDefault>' +
    '<w:pPrDefault><w:pPr><w:spacing w:after="60" w:line="'+Math.round((theme.spacing||1.42)*240/1.42*1.0)+'" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>';
  var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  var docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
  var ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>';
  return zip([
    {name:"[Content_Types].xml", data:ct},
    {name:"_rels/.rels", data:rels},
    {name:"word/document.xml", data:docXml},
    {name:"word/_rels/document.xml.rels", data:docRels},
    {name:"word/numbering.xml", data:numbering},
    {name:"word/styles.xml", data:styles}
  ]);
};
FW.download = function(blob, filename){
  var a = document.createElement("a"), url = URL.createObjectURL(blob);
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 1200);
};
FW.fileBase = function(doc, suffix){
  var n = String(doc && doc.name || "Fitwise-Resume").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"") || "Fitwise-Resume";
  return n + (suffix ? "_" + suffix : "") + "_Fitwise";
};
FW.exportDocx = function(doc, theme){
  try{
    FW.download(FW.docxBlob(doc, theme), FW.fileBase(doc) + ".docx");
    FW.toast("DOCX downloaded — opens in Word, Pages and Google Docs");
  }catch(e){ FW.toast("DOCX export failed: " + (e.message||e)); }
};
/* PDF: print the A4 node itself so the text stays selectable vector text, not a screenshot */
FW.exportPdf = function(html, filename){
  var holder = document.getElementById("printArea");
  if(!holder){ holder = document.createElement("div"); holder.id = "printArea"; document.body.appendChild(holder); }
  holder.innerHTML = html;
  var prev = document.title;
  document.title = filename || prev;
  var done = function(){ document.title = prev; holder.innerHTML = ""; window.removeEventListener("afterprint", done); };
  window.addEventListener("afterprint", done);
  setTimeout(function(){ window.print(); setTimeout(done, 1500); }, 120);
};
})();
