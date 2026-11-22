
(function () {
const $ = id => document.getElementById(id);
const LS = window.localStorage;
let dev = LS.getItem("fw_dev"); if (!dev) { dev = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now()); LS.setItem("fw_dev", dev); }
let last = null, src = null, credits = 0, region = null, lastExtract = "";
const PRICE = { perFormat: 1, usdPerCredit: 0.5 };
if (LS.getItem("fw_email")) $("email").value = LS.getItem("fw_email");
let upFile = null;
// signed in with Google (1 Nov 2026): the Google account is the account; the email field shows it and can't be changed
if (window.FW_USER && window.FW_USER.email) { $("email").value = window.FW_USER.email; $("email").readOnly = true; const eh = $("email").parentElement && $("email").parentElement.nextElementSibling; if (eh && eh.classList.contains("hint")) eh.textContent = "Signed in with Google: your credits and results stay with this account. No spam."; }
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const getAsset = async p => (await fetch(p)).arrayBuffer();

async function api(path, body, raw) {
  const r = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (r.status === 401) { location.reload(); return { ok: false, status: 401, j: { error: "Please sign in again." } }; }
  if (raw && r.ok) return { ok: true, status: r.status, r };
  let j = {}; try { j = await r.json(); } catch {}
  return { ok: r.ok, status: r.status, j };
}
function setCredits(n) { credits = n || 0; document.querySelectorAll(".credbal").forEach(e => e.textContent = credits === 1 ? "1 credit" : credits + " credits"); }
async function refreshCredits() { const e = $("email").value.trim(); if (!e) return; const r = await api("/api/credits", { email: e }); if (r.ok) setCredits(r.j.credits); }
refreshCredits();
try { if (LS.getItem("fw_pl_used") && document.querySelector(".plnote")) document.querySelector(".plnote").innerHTML = "<b>Pre-launch:</b> 1 free tailoring per person. This browser has already used its free tailoring."; } catch {}

// ---- job link
$("fetch").onclick = async () => {
  const u = $("jurl").value.trim(); if (!u) { $("jdhint").textContent = "Paste a job link first."; return; }
  $("fetch").disabled = true; $("jdhint").textContent = "Reading the job page…";
  const r = await api("/api/fetch-job", { url: u });
  $("fetch").disabled = false;
  if (!r.ok) { $("jdhint").textContent = r.j.error || "Couldn't read that link. Paste the job text instead."; return; }
  $("jd").value = r.j.text; if (r.j.title) $("jtitle").value = r.j.title; if (r.j.company) $("jco").value = r.j.company;
  $("jdhint").textContent = `Read ${r.j.text.length.toLocaleString()} characters from the job page. Check it looks right.`;
};


// ---- prefill from the daily jobs page (/?job=<url>&title=&company=&from=jobs)
(function () {
  const qp = new URLSearchParams(location.search); const ju = qp.get("job"); if (!ju || !/^https?:\/\//i.test(ju)) return;
  $("jurl").value = ju; if (qp.get("title")) $("jtitle").value = qp.get("title"); if (qp.get("company")) $("jco").value = qp.get("company");
  const jp = $("jobpick"); if (jp) jp.hidden = false;
  const go = () => { const t = $("try"); if (t) t.scrollIntoView({ block: "start" }); };
  setTimeout(go, 60); window.addEventListener("load", () => setTimeout(go, 50));
  const head = `Tailoring for <b>${esc(qp.get("title") || "this job")}</b>${qp.get("company") ? " at <b>" + esc(qp.get("company")) + "</b>" : ""}. `;
  const back = qp.get("from") === "jobs" ? ' <a href="/jobs">← Back to the jobs list</a>' : "";
  const openAd = `<a href="${esc(ju)}" target="_blank" rel="noopener nofollow">open the job ad ↗</a>`;
  if (jp) jp.innerHTML = head + "Reading the job ad from its link…" + back;
  setTimeout(() => $("fetch").click(), 120);
  let tries = 0; const iv = setInterval(() => {
    const h = $("jdhint").textContent || ""; tries++;
    if (/^Read /.test(h) && $("jd").value.trim()) { clearInterval(iv); if (jp) jp.innerHTML = head + "The job ad is loaded in step 2. Add your CV in step 1, then tap Tailor." + back; }
    else if ((h && !/^Reading/.test(h)) || tries > 60) { clearInterval(iv); if (jp) jp.innerHTML = head + `This job site doesn't let us read the ad automatically: ${openAd}, copy the description and paste it into step 2. Then add your CV.` + back; $("jdhint").innerHTML = `Couldn't read this job page automatically. ${openAd.replace(">open", ">Open")} and paste the description here.`; }
  }, 500);
})();

// ---- pdf.js (read PDFs, draw previews)
function loadScript(s) { return new Promise((res, rej) => { const e = document.createElement("script"); e.src = s; e.onload = res; e.onerror = rej; document.head.appendChild(e); }); }
async function pdfjs() { if (!window.pdfjsLib) { await loadScript("/vendor/pdf.min.js"); window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.js"; } return window.pdfjsLib; }
const mkCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; };
// PDF bytes -> page images (no text layer, nothing to select or save as PDF)
async function toImages(bytes, maxPages, px) {
  const lib = await pdfjs(); const pdf = await lib.getDocument({ data: bytes }).promise; const out = [];
  for (let i = 1; i <= Math.min(pdf.numPages, maxPages || 3); i++) {
    const pg = await pdf.getPage(i); const v1 = pg.getViewport({ scale: 1 }); const scale = (px || 900) / v1.width; const v = pg.getViewport({ scale });
    const c = mkCanvas(v.width, v.height); const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    await pg.render({ canvasContext: ctx, viewport: v }).promise; out.push(c.toDataURL("image/jpeg", 0.82));
  }
  return { imgs: out, pages: pdf.numPages };
}

// ---- file upload: keep the structure, not just the text
const linesText = ls => ls.map(l => l.t + (l.right ? "    " + l.right : "")).join("\n");
$("cvfile").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  const nm = f.name || "";
  if (/\.doc$/i.test(nm)) { $("cvhint").textContent = "That's an old Word .doc file. Save it as .docx or PDF and upload again, or paste the text."; e.target.value = ""; return; }
  if (/^image\//.test(f.type) || /\.(png|jpe?g|heic|webp|gif)$/i.test(nm)) { $("cvhint").textContent = "That's an image. Upload your CV as Word (.docx) or PDF, or paste the text."; e.target.value = ""; return; }
  if (!/\.(pdf|docx|txt)$/i.test(nm) && !/pdf|wordprocessingml|text\/plain/.test(f.type)) { $("cvhint").textContent = "Fitwise reads Word (.docx), PDF or .txt files. Try one of those, or paste the text."; e.target.value = ""; return; }
  if (f.size > 10 * 1024 * 1024) { $("cvhint").textContent = "That file is over 10 MB. A CV is usually under 1 MB: export it again as PDF or Word, or paste the text."; e.target.value = ""; return; }
  $("cvhint").textContent = "Reading " + f.name + "…"; src = null;
  try {
    const buf = await f.arrayBuffer(); upFile = { name: f.name, type: f.type || "application/octet-stream", buf };
    if (/\.docx$/i.test(f.name)) {
      const X = FitExtract; const xml = await X.readZipText(buf, "word/document.xml");
      if (!xml) throw new Error("not docx");
      const ex = X.docxLines(xml, await X.readZipText(buf, "word/styles.xml"), await X.readZipText(buf, "word/numbering.xml"), await X.readZipText(buf, "word/theme/theme1.xml"));
      src = { kind: "docx", name: f.name, buf, xml, paras: ex.paras, lines: ex.lines, style: ex.style };
    } else if (/\.pdf$/i.test(f.name) || f.type === "application/pdf") {
      const lib = await pdfjs(); const pdf = await lib.getDocument({ data: new Uint8Array(buf) }).promise;
      const ex = await FitExtract.pdfLines(pdf, { sample: FitExtract.canvasSampler(mkCanvas) });
      src = { kind: "pdf", name: f.name, lines: ex.lines, style: ex.style };
    } else { const t = new TextDecoder().decode(buf); $("cv").value = t; $("cvhint").textContent = `Read ${f.name}.`; e.target.value = ""; return; }
    const t = linesText(src.lines);
    if (!t || t.length < 100) throw new Error("empty");
    $("cv").value = t; lastExtract = t;
    if (t.length > 30000) { $("cvhint").textContent = `Read ${f.name}, but it's very long (${t.length.toLocaleString()} characters). Only the first 30,000 are used; a CV of 1–3 pages works best.`; e.target.value = ""; return; }
    $("cvhint").innerHTML = src.kind === "docx" ? `Read <b>${esc(f.name)}</b>. We'll edit your Word file in place, so it keeps your fonts, styles and bullets.` : `Read <b>${esc(f.name)}</b>. We'll rebuild it in your layout (sections, headings, fonts and colours). Tip: upload the .docx for an exact copy.`;
  } catch (err) { src = null; $("cvhint").textContent = "Couldn't read that file (scanned PDFs have no text). Paste your CV text instead."; }
  e.target.value = "";
};
$("cv").addEventListener("input", () => { if (src && $("cv").value !== lastExtract) { src.edited = true; $("cvhint").textContent = "You edited the text, so we'll use your edits with a clean layout (your file's formatting can't follow manual edits)."; } });

// ---- results
function slug(s) { return String(s || "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40); }
function save(bytes, name, type) {
  const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: type || "application/pdf" }); const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
}
const baseName = () => `${slug(last.doc.name && last.doc.name.t) || "CV"}_CV_${slug(last.job.company || last.job.title) || "tailored"}`;
async function buildOriginal() {
  await FitPDF.load(getAsset);
  const T = FitRender.originalTemplate(last.style);
  const d = FitRender.render(last.doc, T, {});
  last.origPdf = await d.bytes(getAsset);
  if (src && src.kind === "docx" && !src.edited && last.orig) {
    const nx = FitExtract.applyDocxEdits(src.xml, src.paras, last.orig, last.doc);
    last.docx = FitExtract.writeZip(src.buf, { "word/document.xml": nx });
  } else last.docx = null;
  const im = await toImages(last.origPdf.slice(), 3, 900); // pdf.js detaches the buffer it is given; keep ours intact for the download
  $("origpv").innerHTML = im.imgs.map((s, i) => `<img src="${s}" alt="Your tailored CV, page ${i + 1}" loading="lazy">`).join("");
  $("origpages").textContent = im.pages === 1 ? "1 page" : im.pages + " pages";
}
function render(r) {
  last = r; region = r.region;
  $("out").hidden = false;
  $("scoreN").textContent = r.score + "%";
  requestAnimationFrame(() => $("arc").setAttribute("stroke-dasharray", `${r.score},100`));
  $("jobline").textContent = [r.job.title, r.job.company].filter(Boolean).join(" · ") || "Your match";
  $("have").innerHTML = r.matched.map(k => `<span>${esc(k)}</span>`).join("") || '<span>none yet</span>';
  $("miss").innerHTML = r.missing.map(k => `<span>${esc(k)}</span>`).join("") || '<span>none</span>';
  $("changes").innerHTML = r.changes.map(c => `<li>${esc(c)}</li>`).join("");
  $("mode").textContent = (r.mode === "ai" ? "Written with AI, then truth-checked against your CV. " : "Reordered and reworded by rules; nothing added. ") + (r.aiNote ? r.aiNote + "." : "");
  const kind = src && !src.edited ? src.kind : "text";
  $("orignote").innerHTML = kind === "docx" ? "<b>Your Word file, edited in place.</b> Same fonts, styles, bullets and section order; only the order and wording of your own lines changed. The PDF is drawn from it." :
    kind === "pdf" ? "<b>Rebuilt from your PDF, closest match.</b> Same section order, headings, job headers and bullets, with your fonts, sizes and colours where we could read them. For an exact copy of your design, upload the Word (.docx) version." :
    "<b>Clean, ATS-friendly layout.</b> Upload your PDF or Word file instead to keep your own design.";
  $("dldocx").hidden = !(kind === "docx");
  $("origpv").innerHTML = '<p class="muted pad">Drawing your CV…</p>';
  buildOriginal().catch(e => { $("origpv").innerHTML = '<p class="err pad">Couldn\'t draw the preview. Try the download button.</p>'; console.error(e); });
  // regions
  $("region").innerHTML = Object.entries(r.regions).map(([k, v]) => `<option value="${k}"${k === region ? " selected" : ""}>${esc(v)}</option>`).join("");
  $("regionwhy").textContent = r.country ? `Picked from your CV (${r.country}). Change it if you're applying elsewhere.` : "Pick the country you're applying in.";
  showFormats();
  setCover(r);
  setCredits(r.credits);
  $("out").scrollIntoView({ behavior: "smooth", block: "start" });
}
function showFormats() {
  const ids = last.regionFormats[region] || last.regionFormats.intl;
  $("fmts").innerHTML = ids.map(id => { const f = last.formats[id]; return `<div class="fmt" data-f="${id}">
    <button class="thumb" data-view="${id}" aria-label="View ${esc(f.label)} preview"><span class="ph">Loading preview…</span></button>
    <div class="fmeta"><h4>${esc(f.label)}</h4><p class="small">${esc(f.blurb)}</p>
    <div class="row wrapb"><button class="btn ghost sm" data-view="${id}">View free preview</button><button class="btn sm" data-dl="${id}">Download – 1 credit <span class="usd">($0.50)</span></button></div></div></div>`; }).join("");
  $("both").dataset.f = ids.join(",");
  $("bothlbl").textContent = ids.map(id => last.formats[id].label).join(" + ");
  document.querySelectorAll("[data-view]").forEach(b => b.onclick = () => viewFormat(b.dataset.view));
  document.querySelectorAll("[data-dl]").forEach(b => b.onclick = () => downloadFormats([b.dataset.dl], b));
  ids.forEach(id => loadPreview(id).catch(() => { const t = document.querySelector(`.fmt[data-f="${id}"] .thumb`); if (t) t.innerHTML = '<span class="ph">Preview failed, tap to retry</span>'; }));
}
const pvCache = {};
async function loadPreview(id) {
  const key = last.jobId + ":" + id;
  if (!pvCache[key]) {
    pvCache[key] = (async () => {
      const r = await api("/api/preview", { doc: last.doc, format: id }, true);
      if (!r.ok) throw new Error("preview");
      return toImages(new Uint8Array(await r.r.arrayBuffer()), 3, 1000);
    })();
    pvCache[key].catch(() => delete pvCache[key]);
  }
  const im = await pvCache[key];
  const t = document.querySelector(`.fmt[data-f="${id}"] .thumb`);
  if (t) t.innerHTML = `<img src="${im.imgs[0]}" alt="${esc(last.formats[id].label)} preview" draggable="false"><span class="pvtag">PREVIEW</span>`;
  return im;
}
async function viewFormat(id) {
  const f = last.formats[id];
  $("pvtitle").textContent = f.label; $("pvbody").innerHTML = '<p class="muted pad">Loading…</p>';
  $("pvdl").onclick = () => { $("pv").close(); downloadFormats([id], $("pvdl")); };
  $("pv").showModal();
  try { const im = await loadPreview(id); $("pvbody").innerHTML = im.imgs.map((s, i) => `<img src="${s}" alt="${esc(f.label)} page ${i + 1}" draggable="false">`).join(""); }
  catch { $("pvbody").innerHTML = '<p class="err pad">Couldn\'t load the preview. Try again.</p>'; }
}
async function downloadFormats(ids, btn) {
  const email = $("email").value.trim();
  const old = btn ? btn.innerHTML : ""; if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Preparing…'; }
  try {
    for (const id of ids) {
      const r = await api("/api/download", { email, jobId: last.jobId, doc: last.doc, format: id }, true);
      if (!r.ok) { if (r.status === 402) { setCredits(r.j.credits); openBuy(ids.length * PRICE.perFormat, ids); return; } alert(r.j.error || "Download failed. Please try again."); return; }
      const blob = await r.r.blob(); setCredits(+r.r.headers.get("x-credits-left") || 0);
      save(blob, `${baseName()}_${id}.pdf`);
    }
  } finally { if (btn) { btn.disabled = false; btn.innerHTML = old; } }
}
$("both").onclick = () => downloadFormats($("both").dataset.f.split(","), $("both"));
$("region").onchange = () => { region = $("region").value; showFormats(); };
$("dlorig").onclick = () => last && last.origPdf && save(last.origPdf, baseName() + ".pdf");
$("dldocx").onclick = () => last && last.docx && save(new Blob([last.docx], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), baseName() + ".docx");
function setCover(r) {
  const locked = !!r.coverLocked && !r.coverPaid;
  $("cl").value = r.cover; $("cl").readOnly = locked; $("clwrap").classList.toggle("locked", locked);
  $("clunlock").hidden = !locked; $("dlcl").hidden = locked; $("cpcl").hidden = locked;
}
$("clunlock").onclick = async () => {
  if (!last) return; const b = $("clunlock"), old = b.innerHTML; b.disabled = true; b.innerHTML = '<span class="spin"></span> Unlocking…';
  try {
    const r = await api("/api/cover", { email: $("email").value.trim(), jobId: last.jobId });
    if (!r.ok) { if (r.status === 402) { setCredits(r.j.credits); openBuy(r.j.need || 1, null, "cover letter"); return; } alert(r.j.error || "Couldn't unlock. Please try again."); return; }
    last.cover = r.j.cover; last.coverPaid = true; setCover(last); setCredits(r.j.credits);
  } finally { b.disabled = false; b.innerHTML = old; }
};
$("dlcl").onclick = async () => { if (!last) return; await FitPDF.load(getAsset); const d = FitRender.letterPdf($("cl").value, last.doc.name && last.doc.name.t, last.style); save(await d.bytes(getAsset), `${slug(last.doc.name && last.doc.name.t) || "Cover"}_Cover_Letter_${slug(last.job.company) || "job"}.pdf`); };
$("cpcl").onclick = async () => { try { await navigator.clipboard.writeText($("cl").value); $("cpcl").textContent = "Copied ✓"; setTimeout(() => $("cpcl").textContent = "Copy cover letter", 1800); } catch { $("cl").select(); } };
$("again").onclick = () => { $("out").hidden = true; $("jd").value = ""; $("jurl").value = ""; $("jtitle").value = ""; $("jco").value = ""; };
$("pvclose").onclick = () => $("pv").close();

// keep the CV that was tailored (stored server-side for 90 days; the user can delete it on /account)
function storeCv(res, body) {
  try {
    const job = [body.title || (res.job && res.job.title), body.company || (res.job && res.job.company)].filter(Boolean).join(" @ ");
    const f = upFile && !(src && src.edited) ? upFile : null;
    const data = f ? f.buf : new Blob([$("cv").value], { type: "text/plain" });
    fetch("/api/cv", { method: "POST", credentials: "same-origin", headers: { "content-type": f ? f.type : "text/plain", "x-filename": encodeURIComponent(f ? f.name : "pasted-cv.txt"), "x-source": f ? "file" : "pasted", "x-job": encodeURIComponent(job.slice(0, 150)) }, body: data }).catch(() => {});
  } catch (e) {}
}
$("f").onsubmit = async ev => {
  ev.preventDefault(); $("err").textContent = "";
  const email = $("email").value.trim(); LS.setItem("fw_email", email);
  if ($("cv").value.trim().length < 150) { $("err").textContent = "Add your CV first: upload the file or paste the full text."; $("cv").focus(); return; }
  if ($("jd").value.trim().length < 100) { $("err").textContent = "Add the job ad: paste the description, or paste the link and tap Read link."; $("jd").focus(); return; }
  const b = $("go"); b.disabled = true; b.innerHTML = '<span class="spin"></span> Tailoring…';
  const STEPS = ["Reading your CV…", "Matching it to the job ad…", "Reordering your lines for this job…", "Building your CV in its own format…"]; let si = 0;
  const pg = $("progress"); if (pg) { pg.hidden = false; pg.textContent = STEPS[0]; }
  const piv = setInterval(() => { si = Math.min(si + 1, STEPS.length - 1); if (pg) pg.textContent = STEPS[si]; }, 1400);
  try {
    const body = { jd: $("jd").value, title: $("jtitle").value, company: $("jco").value, email, device: dev };
    if (src && !src.edited) { body.lines = src.lines.map(l => { const o = Object.assign({}, l); delete o.src; return o; }); body.meta = { source: src.kind, style: src.style }; }
    else body.cv = $("cv").value;
    const r = await api("/api/tailor", body);
    if (!r.ok) { if (r.j && r.j.code === "prelaunch_used") { try { LS.setItem("fw_pl_used", "1"); } catch {} $("err").innerHTML = esc(r.j.error) + ' <a href="/jobs">Browse today\'s jobs</a> · <a href="/pricing">Pricing</a>'; return; } $("err").textContent = r.j.error || "Something went wrong. Please try again."; return; }
    try { if (r.j && r.j.prelaunchFree) LS.setItem("fw_pl_used", "1"); } catch {}
    if (src && src.kind === "docx" && !src.edited) { /* keep paragraph indexes for in-place edits */ }
    render(r.j);
    storeCv(r.j, body);
  } catch (e) { console.error(e); $("err").textContent = "Network problem. Please try again."; }
  finally { clearInterval(piv); if (pg) pg.hidden = true; b.disabled = false; b.textContent = "Tailor my CV"; }
};

// ---- credits & early access (no payment is taken yet)
let plan = "autopilot", pack = "starter", want = null, bundle = null;
const BUNDLE_LABEL = { a10: "10 jobs · €1.50", a100: "100 jobs · €9.50", a1000: "1,000 jobs · €65" };
function openBuy(need, ids, what) {
  want = ids || (what ? [what] : null);
  $("buyneed").textContent = need ? `This ${what || "download"} needs ${need} credit${need > 1 ? "s" : ""}. You have ${credits}.` : `You have ${credits} credit${credits === 1 ? "" : "s"}.`;
  $("buyemail").value = $("email").value; $("buyerr").textContent = ""; $("buyok").hidden = true; $("buyform").hidden = false;
  $("buy").showModal();
}
document.querySelectorAll("[data-buy]").forEach(b => b.onclick = () => openBuy(0));
document.querySelectorAll("[name=pack]").forEach(r => r.onchange = () => pack = r.value);
$("buygo").onclick = async ev => {
  ev.preventDefault();
  const email = $("buyemail").value.trim();
  const r = await api("/api/credits/buy", { email, pack, want });
  if (!r.ok) { $("buyerr").textContent = r.j.error || "Try again."; return; }
  if (r.j.url) { location.href = r.j.url; return; }
  $("buyform").hidden = true; $("buyok").hidden = false; $("buyokmail").textContent = email;
};
$("buyclose").onclick = () => $("buy").close(); $("buyclose2").onclick = () => $("buy").close();
document.querySelectorAll("[data-plan]").forEach(b => b.onclick = () => { plan = b.dataset.plan; bundle = b.dataset.bundle || null; $("eaplan").textContent = "Autopilot" + (bundle ? " · " + BUNDLE_LABEL[bundle] : "") + " (coming soon)"; $("eaemail").value = $("email").value; $("eaerr").textContent = ""; $("eaf").hidden = false; $("eaok").hidden = true; $("ea").showModal(); });
$("eago").onclick = async ev => {
  ev.preventDefault();
  const r = await api("/api/early-access", { email: $("eaemail").value.trim(), plan, bundle });
  if (!r.ok) { $("eaerr").textContent = r.j.error || "Try again."; return; }
  $("eaf").hidden = true; $("eaok").hidden = false; $("eaokmail").textContent = $("eaemail").value;
};
$("eaclose").onclick = () => $("ea").close(); $("eaclose2").onclick = () => $("ea").close();
$("email").addEventListener("change", refreshCredits);
})();

// ---- demo clips (lazy: the video loads only when opened)
const DEMO_INFO = {"owncv": ["Your CV, your format", "Upload your CV + job link: the tailored CV comes back in your own layout."], "score": ["Match score & keywords", "See your match score, the keywords you have and the ones you lack."], "formats": ["Local formats, free preview", "US, UK or EU style: preview free as a watermarked image."], "credits": ["Download with credits", "1 credit per format download. Prepaid, no subscription."], "cover": ["Cover letter", "Preview free, unlock the full letter for 1 credit."], "autopilot": ["Autopilot \u00b7 coming soon", "Matches \u2192 tailored CV per job \u2192 tracker. Preview with sample data."]};
function openDemo(id) {
  const [t, d] = DEMO_INFO[id] || ["Demo", ""];
  document.getElementById("dvtitle").textContent = t; document.getElementById("dvnote").textContent = d + (id === "autopilot" ? " Not live yet." : "");
  document.getElementById("dvbody").innerHTML = `<video src="demo/${id}.mp4" poster="demo/${id}.jpg" autoplay muted loop playsinline controls preload="auto"></video>`;
  document.getElementById("dv").showModal();
}
document.querySelectorAll("[data-demo]").forEach(b => b.onclick = ev => { ev.preventDefault(); openDemo(b.dataset.demo); });
document.getElementById("dvclose").onclick = () => { document.getElementById("dv").close(); };
document.getElementById("dv").addEventListener("close", () => { document.getElementById("dvbody").innerHTML = ""; });
