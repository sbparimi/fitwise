
const fs=require('fs'), path=require('path'), vm=require('vm');
const P=process.argv[2];
const ctx={console, TextEncoder, TextDecoder, require, Blob, Response, setTimeout, Buffer};
vm.createContext(ctx);
for (const f of ['engine.js','docmodel.js','extract.js','cvpdf.js','render.js','formats.js']) vm.runInContext(fs.readFileSync(path.join(P,f),'utf8').replace(/^var (Fit\w+) =/m,'globalThis.$1 =')+(f==='formats.js'?';globalThis.FORMATS=FORMATS;globalThis.docStyle=docStyle;':''), ctx, {filename:f});
ctx.pdfjsLib = require(P+'/site/vendor/pdf.min.js'); ctx.pdfjsLib.GlobalWorkerOptions.workerSrc = P+'/site/vendor/pdf.worker.min.js';
const get = async p => { const b=fs.readFileSync(path.join(P,'site',p)); return b.buffer.slice(b.byteOffset,b.byteOffset+b.length); };
vm.runInContext(`globalThis.__run = async function(mode, file, jd, outDir, get){
  let ex, buf;
  if (mode==='docx'){ buf=file; const x=await FitExtract.readZipText(buf,'word/document.xml'); ex=FitExtract.docxLines(x, await FitExtract.readZipText(buf,'word/styles.xml'), await FitExtract.readZipText(buf,'word/numbering.xml'), await FitExtract.readZipText(buf,'word/theme/theme1.xml')); ex.xml=x; }
  else if (mode==='pdf'){ const doc=await pdfjsLib.getDocument({data:new Uint8Array(file), disableFontFace:true}).promise; ex=await FitExtract.pdfLines(doc); }
  else { ex={lines:textToLines(file), style:{}}; }
  const doc=parseDoc(ex.lines,{source:mode});
  const res=tailorDoc(doc, jd);
  return {ex, doc, res};
}`, ctx);
(async()=>{
  const mode=process.argv[3], file=process.argv[4], jd=fs.readFileSync(process.argv[5],'utf8'), out=process.argv[6];
  const data = mode==='text' ? fs.readFileSync(file,'utf8') : (b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.length))(fs.readFileSync(file));
  const r = await ctx.__run(mode, data, jd, out, get);
  fs.writeFileSync(out+'/'+mode+'_lines.json', JSON.stringify(r.ex.lines.map(l=>[l.t,l.right,l.s,l.b?'B':'',l.c||'',l.ruleAfter?'R':'']),null,0).replace(/\],\[/g,'],\n['));
  fs.writeFileSync(out+'/'+mode+'_doc.json', JSON.stringify(r.doc,(k,v)=>k==='runs'?undefined:v,1));
  console.log('score',r.res.score,'changes',r.res.changes);
  await ctx.FitPDF.load(get);
  const style = ctx.docStyle ? ctx.docStyle(r.doc, r.ex.style) : r.ex.style;
  const T = ctx.FitRender.originalTemplate(style);
  let d = ctx.FitRender.render(r.res.doc, T, {}); fs.writeFileSync(out+'/'+mode+'_original.pdf', await d.bytes(get));
  for (const f of ['us','us_modern','uk','europass','dach']) { d = ctx.FitRender.render(r.res.doc, ctx.FORMATS[f].T, {preview: f==='europass'}); fs.writeFileSync(out+'/'+mode+'_'+f+'.pdf', await d.bytes(get)); }
  if (mode==='docx') { const nx = ctx.FitExtract.applyDocxEdits(r.ex.xml, r.ex.paras, r.doc, r.res.doc); fs.writeFileSync(out+'/docx_tailored.docx', ctx.FitExtract.writeZip(data, {'word/document.xml': nx})); }
  console.log('region', r.doc.meta.country, r.doc.meta.region, 'style', JSON.stringify(style));
})().catch(e=>{console.log('ERR',e.stack)});
