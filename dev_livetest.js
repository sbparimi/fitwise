
const fs=require('fs'), path=require('path'), vm=require('vm');
const P=process.argv[2], BASE='https://fitwise.sites.tab.bot';
const ctx={console, TextEncoder, TextDecoder, require, Blob, Response};
vm.createContext(ctx);
for (const f of ['engine.js','docmodel.js','extract.js']) vm.runInContext(fs.readFileSync(path.join(P,f),'utf8').replace(/^var (Fit\w+) =/m,'globalThis.$1 ='), ctx, {filename:f});
const X=ctx.FitExtract; const ADMIN=fs.readFileSync(P+'/ADMIN_SECRET.txt','utf8').trim();
const post=(p,b,h={})=>fetch(BASE+p,{method:'POST',headers:{'content-type':'application/json',...h},body:JSON.stringify(b)});
(async()=>{
  const b=fs.readFileSync(P+'/testdata/Marta_Kowalczyk_CV.docx'); const buf=b.buffer.slice(b.byteOffset,b.byteOffset+b.length);
  const xml=await X.readZipText(buf,'word/document.xml');
  const ex=X.docxLines(xml, await X.readZipText(buf,'word/styles.xml'), await X.readZipText(buf,'word/numbering.xml'), await X.readZipText(buf,'word/theme/theme1.xml'));
  const email='fitwise.v2.test@example.com';
  let t0=Date.now();
  let r=await post('/api/tailor',{lines:ex.lines.map(l=>{const o={...l};delete o.src;return o;}),meta:{source:'docx',style:ex.style},jd:fs.readFileSync(P+'/testdata/job_celonis.txt','utf8'),email,device:'test-device-v2'});
  let j=await r.json(); console.log('tailor',r.status,Date.now()-t0,'ms', j.error||'', 'score',j.score,'region',j.region,j.country,'credits',j.credits,'job',JSON.stringify(j.job));
  if(!r.ok) return;
  fs.writeFileSync('/tmp/fw/live_tailor.json',JSON.stringify(j));
  for (const f of j.regionFormats[j.region]) { t0=Date.now(); r=await post('/api/preview',{doc:j.doc,format:f}); const by=new Uint8Array(await r.arrayBuffer()); fs.writeFileSync('/tmp/fw/live_prev_'+f+'.pdf',by); console.log('preview',f,r.status,by.length,Date.now()-t0,'ms'); }
  r=await post('/api/download',{email,jobId:j.jobId,doc:j.doc,format:'europass'}); console.log('download no credits',r.status,await r.text());
  r=await post('/api/admin/credits',{email,delta:3,note:'v2 test'},{'x-admin-key':ADMIN}); console.log('grant',r.status,await r.text());
  r=await post('/api/download',{email,jobId:j.jobId,doc:j.doc,format:'europass'}); let by=new Uint8Array(await r.arrayBuffer()); fs.writeFileSync('/tmp/fw/live_paid_europass.pdf',by); console.log('download paid',r.status,by.length,r.headers.get('x-credits-left'),r.headers.get('x-charged'));
  r=await post('/api/download',{email,jobId:j.jobId,doc:j.doc,format:'europass'}); await r.arrayBuffer(); console.log('re-download',r.status,r.headers.get('x-credits-left'),r.headers.get('x-charged'));
  const bad=JSON.parse(JSON.stringify(j.doc)); bad.name.t='Someone Else'; r=await post('/api/download',{email,jobId:j.jobId,doc:bad,format:'dach'}); console.log('tampered',r.status,(await r.text()).slice(0,100));
  r=await post('/api/credits',{email}); console.log('credits',await r.text());
  r=await post('/api/credits/buy',{email,pack:'standard'}); console.log('buy',r.status,await r.text());
})().catch(e=>console.log('ERR',e.stack));
