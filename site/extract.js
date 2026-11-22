
// ---------- Fitwise extraction (browser + node): PDF lines with geometry/style, DOCX paragraphs with styles, in-place DOCX edits ----------
var FitExtract = (function () {
const BOLD = /bold|black|heavy|semibold|demi|extrab/i, ITAL = /italic|oblique/i;
function famName(n) { return String(n || "").replace(/^[A-Z]{6}\+/, "").replace(/[-,](bold|italic|regular|semibold|black|light|medium|oblique|bolditalic|roman|book|demi).*$/i, "").replace(/(MT|PS|PSMT)$/, ""); }
function mergeRuns(runs) { const out = []; for (const r of runs) { const l = out[out.length - 1]; if (l && !!l.b === !!r.b && !!l.i === !!r.i) l.t += r.t; else out.push({ t: r.t, b: !!r.b, i: !!r.i }); } return out; }
function hexOf(rgb) { return "#" + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join(""); }
function saturated(hex) { if (!hex) return false; const v = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); return Math.max(...v) - Math.min(...v) > 40; }

// ---------------- PDF ----------------
async function pdfLines(pdf, opts) {
  opts = opts || {};
  const all = []; let pageW = 595, pageH = 842, famCount = {}, yOff = 0; const rulesY = [];
  const nPages = Math.min(pdf.numPages, 5);
  for (let pn = 1; pn <= nPages; pn++) {
    const page = await pdf.getPage(pn); const vp = page.getViewport({ scale: 1 });
    if (pn === 1) { pageW = vp.width; pageH = vp.height; }
    await page.getOperatorList();
    const tc = await page.getTextContent();
    const items = [];
    for (const it of tc.items) {
      if (!it.str || !it.str.trim()) { if (it.str && items.length) items[items.length - 1].sp = true; continue; }
      const tr = it.transform; const size = Math.hypot(tr[2], tr[3]) || Math.abs(tr[0]) || 10;
      let fname = ""; try { const fo = page.commonObjs.get(it.fontName); fname = (fo && (fo.name || fo.loadedName)) || ""; } catch (e) {}
      if (!fname && tc.styles[it.fontName]) fname = tc.styles[it.fontName].fontFamily || "";
      const fam = famName(fname); famCount[fam] = (famCount[fam] || 0) + it.str.length;
      items.push({ t: it.str, x: tr[4], y: tr[5], s: size, w: it.width || 0, b: BOLD.test(fname), i: ITAL.test(fname) || Math.abs(tr[2]) > 0.1 * size });
    }
    // group by baseline
    items.sort((a, b) => b.y - a.y || a.x - b.x);
    const rows = [];
    for (const it of items) { const r = rows.find(r => Math.abs(r.y - it.y) <= Math.max(2, Math.min(r.s, it.s) * 0.35)); if (r) { r.items.push(it); r.s = Math.max(r.s, it.s); } else rows.push({ y: it.y, s: it.s, items: [it] }); }
    rows.sort((a, b) => b.y - a.y);
    let colors = null; if (opts.sample) colors = await opts.sample(page, vp, rows, pn);
    rows.forEach((r, ri) => {
      r.items.sort((a, b) => a.x - b.x);
      const segs = [[]];
      r.items.forEach((it, k) => { if (k) { const p = r.items[k - 1]; const gap = it.x - (p.x + p.w); if (gap > Math.max(24, r.s * 2.6)) segs.push([]); } segs[segs.length - 1].push(it); });
      const toLine = seg => { const runs = []; let lastEnd = null; for (const it of seg) { if (lastEnd !== null) { const gap = it.x - lastEnd; const prev = runs[runs.length - 1]; if ((gap > it.s * 0.18 || seg[seg.indexOf(it) - 1].sp) && !/\s$/.test(prev ? prev.t : "") && !/^\s/.test(it.t)) runs.push({ t: " ", b: it.b, i: it.i }); } runs.push({ t: it.t, b: it.b, i: it.i }); lastEnd = it.x + it.w; } return mergeRuns(runs); };
      let left = segs[0], right = null;
      if (segs.length > 1) { const last = segs[segs.length - 1]; const lt = last.map(i => i.t).join(" "); if (last[0].x > pageW * 0.5 && lt.length < 45) { right = lt.trim(); left = segs.slice(0, -1).flat(); } else left = segs.flat(); }
      const runs = toLine(left); const t = runs.map(r => r.t).join("");
      // dominant size = size of the item with most characters
      let dom = left[0]; for (const it of left) if (it.t.length > dom.t.length) dom = it;
      const nb = runs.filter(r => r.t.trim()); const L = { t, runs, s: Math.round(dom.s * 10) / 10, b: nb.every(r => r.b), i: nb.every(r => r.i), x: Math.round(left[0].x), xr: left[left.length - 1].x + left[left.length - 1].w, y: yOff + (pageH - r.y), page: pn, right: right || "" };
      const cx = (L.x + L.xr) / 2; if (Math.abs(cx - pageW / 2) < 12 && L.x > pageW * 0.18) L.center = true;
      if (colors && colors[ri]) { L.c = colors[ri].c; L.colored = saturated(L.c); if (colors[ri].ruleBelow) L.ruleAfter = true; }
      all.push(L);
    });
    yOff += pageH;
  }
  // merge wrapped lines back into one paragraph / bullet
  const MARK = /^\s*([\u2022\u25CF\u25AA\u25E6\u2023\u2043\u2219\u25A0\u25BA\u25B6\u27A2\u27A4\u2756\u2713\u2714\u00B7\uF0B7\uF0A7\uF076\uF0D8\uF0FC\uF0A8\uF06C\uF06E*>]|[-\u2013](?=\s))/;
  const out = [];
  const rightEdge = {}; for (const L of all) rightEdge[L.page] = Math.max(rightEdge[L.page] || 0, L.xr);
  for (const L of all) {
    const A = out[out.length - 1];
    if (A && A.page === L.page && !A.right && !L.right && !MARK.test(L.t) && !A.ruleAfter) {
      const dy = L.y - A.lastY; const filled = A.lastXr >= rightEdge[A.page] - Math.max(A.s * 5, 40);
      const sameLook = Math.abs(L.s - A.s) < 0.6 && (L.b === A.b || !L.b);
      const notCaps = !(L.t === L.t.toUpperCase() && /[A-Z]{3}/.test(L.t));
      const aBul = MARK.test(A.t), indented = L.x > A.x + 3;
      const sentenceBreak = /[.:;!?]$/.test(A.t) && /^[A-Z]/.test(L.t) && !(aBul && indented) && (L.y - A.lastY) > Math.max(A.s, L.s) * 1.38;
      const boldStart = L.runs[0] && L.runs[0].b && !(A.runs[A.runs.length - 1] || {}).b;
      if (!sentenceBreak && !boldStart && dy > 0 && dy <= Math.max(A.s, L.s) * 1.65 && filled && sameLook && notCaps && L.x >= A.x - 2) {
        const hy = /[a-z]-$/.test(A.t) && /^[a-z]/.test(L.t);
        A.t += (hy ? "" : " ") + L.t; A.runs = mergeRuns(A.runs.concat(hy ? [] : [{ t: " ", b: L.b, i: L.i }], L.runs));
        A.lastY = L.y; A.lastXr = L.xr; continue;
      }
    }
    L.lastY = L.y; L.lastXr = L.xr; out.push(L);
  }
  // spacing before each line
  for (let k = 1; k < out.length; k++) out[k].gap = Math.max(0, Math.round(out[k].y - out[k - 1].lastY - out[k].s * 1.2));
  const fam = Object.entries(famCount).sort((a, b) => b[1] - a[1])[0];
  const style = { page: Math.abs(pageW - 612) < 8 && Math.abs(pageH - 792) < 8 ? "Letter" : Math.abs(pageW - 595) < 8 ? "A4" : [pageW, pageH], family: fam ? fam[0] : "", pages: pdf.numPages,
    margins: [Math.max(24, Math.min(...out.filter(l => l.page === 1).map(l => l.y - l.s))), Math.max(24, pageW - Math.max(...Object.values(rightEdge))), 36, Math.max(24, Math.min(...out.map(l => l.x)))] };
  return { lines: out.map(l => { const o = Object.assign({}, l); delete o.lastY; delete o.lastXr; delete o.y; delete o.xr; return o; }), style };
}
// browser only: colour of each line + horizontal rules, sampled from a rendering of the page
function canvasSampler(createCanvas) {
  return async (page, vp, rows, pn) => {
    const scale = 1.5, v = page.getViewport({ scale }); const cv = createCanvas(v.width, v.height); const ctx = cv.getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, v.width, v.height);
    await page.render({ canvasContext: ctx, viewport: v }).promise;
    const img = ctx.getImageData(0, 0, v.width, v.height).data, W = v.width, H = v.height;
    // horizontal rules: rows with a long run of non-white pixels
    const ruleRows = [];
    for (let y = 0; y < H; y++) { let run = 0, best = 0; for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; const dark = img[i] + img[i + 1] + img[i + 2] < 600; run = dark ? run + 1 : 0; if (run > best) best = run; } if (best > W * 0.45) ruleRows.push(y / scale); }
    return rows.map(r => {
      const top = (vp.height - r.y - r.s) * scale, bot = (vp.height - r.y + r.s * 0.25) * scale;
      const x0 = Math.max(0, Math.min(...r.items.map(i => i.x)) * scale), x1 = Math.min(W, Math.max(...r.items.map(i => i.x + i.w)) * scale);
      let n = 0, R = 0, G = 0, B = 0;
      for (let y = Math.max(0, Math.floor(top)); y < Math.min(H, bot); y += 1) for (let x = Math.floor(x0); x < x1; x += 2) { const i = (Math.floor(y) * W + x) * 4; const s = img[i] + img[i + 1] + img[i + 2]; if (s < 420) { R += img[i]; G += img[i + 1]; B += img[i + 2]; n++; } }
      const c = n ? hexOf([R / n, G / n, B / n]) : null;
      const base = vp.height - r.y; const ruleBelow = ruleRows.some(y => y > base && y < base + r.s * 1.1);
      return { c, ruleBelow };
    });
  };
}

// ---------------- DOCX ----------------
const ent = s => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, "&");
const xesc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function attr(tagXml, name) { const m = tagXml.match(new RegExp("<" + name + "\\b[^>]*?w:val=\"([^\"]*)\"")); return m ? m[1] : null; }
function onOff(x, name) { const m = x.match(new RegExp("<" + name + "(?:\\s[^>]*)?/?>")); if (!m) return null; const v = m[0].match(/w:val="([^"]*)"/); return !(v && /^(0|false|off)$/i.test(v[1])); }
function rpr(x) { const m = x.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/); if (!m) return {}; const r = m[1]; const o = {}; const b = onOff(r, "w:b"); if (b !== null) o.b = b; const i = onOff(r, "w:i"); if (i !== null) o.i = i; const sz = attr(r, "w:sz"); if (sz) o.sz = +sz / 2; const c = attr(r, "w:color"); if (c && c !== "auto") o.c = "#" + c.toLowerCase(); const f = r.match(/<w:rFonts\b[^>]*w:ascii="([^"]+)"/); if (f) o.font = f[1]; const ft = r.match(/<w:rFonts\b[^>]*w:asciiTheme="([^"]+)"/); if (ft) o.theme = ft[1]; const cap = onOff(r, "w:caps"); if (cap) o.caps = true; return o; }
function parseStyles(sx, themeX) {
  const S = {}; const D = {};
  const dd = (sx.match(/<w:docDefaults>([\s\S]*?)<\/w:docDefaults>/) || [])[1] || ""; Object.assign(D, rpr((dd.match(/<w:rPrDefault>([\s\S]*?)<\/w:rPrDefault>/) || [])[1] || ""));
  const re = /<w:style\b([^>]*)>([\s\S]*?)<\/w:style>/g; let m;
  while ((m = re.exec(sx))) { const id = (m[1].match(/w:styleId="([^"]+)"/) || [])[1]; if (!id) continue; const body = m[2]; const pp = (body.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/) || [])[1] || ""; S[id] = Object.assign({ basedOn: attr(body, "w:basedOn"), name: attr(body, "w:name") || id, num: /<w:numPr>/.test(pp) ? { numId: attr(pp, "w:numId"), ilvl: attr(pp, "w:ilvl") || "0" } : null, bdr: /<w:pBdr>[\s\S]*?<w:bottom\b[^>]*w:val="(?!nil|none)/.test(pp) }, rpr(body)); }
  const minor = themeX && (themeX.match(/<a:minorFont>[\s\S]*?<a:latin typeface="([^"]+)"/) || [])[1];
  const major = themeX && (themeX.match(/<a:majorFont>[\s\S]*?<a:latin typeface="([^"]+)"/) || [])[1];
  const get = (id, k, depth = 0) => { const s = S[id]; if (!s || depth > 8) return undefined; if (s[k] !== undefined && s[k] !== null) return s[k]; return s.basedOn ? get(s.basedOn, k, depth + 1) : undefined; };
  return { S, D, get, minor, major };
}
function parseNumbering(nx) {
  const abs = {}, nums = {}; if (!nx) return { fmt: () => null };
  const ra = /<w:abstractNum\b[^>]*w:abstractNumId="(\d+)"[^>]*>([\s\S]*?)<\/w:abstractNum>/g; let m;
  while ((m = ra.exec(nx))) { const lv = {}; const rl = /<w:lvl\b[^>]*w:ilvl="(\d+)"[^>]*>([\s\S]*?)<\/w:lvl>/g; let k; while ((k = rl.exec(m[2]))) lv[k[1]] = { fmt: attr(k[2], "w:numFmt"), text: attr(k[2], "w:lvlText") }; abs[m[1]] = lv; }
  const rn = /<w:num\b[^>]*w:numId="(\d+)"[^>]*>([\s\S]*?)<\/w:num>/g; while ((m = rn.exec(nx))) nums[m[1]] = attr(m[2], "w:abstractNumId");
  return { fmt: (numId, ilvl) => { const a = abs[nums[numId]]; return a && a[ilvl || "0"] || null; } };
}
function docxParas(xml) {
  // every <w:p> in document order with its offsets; paragraphs inside table rows are tagged with the row
  const paras = []; const re = /<w:p\b[^>]*\/>|<w:p\b[^>]*>[\s\S]*?<\/w:p>|<w:tr\b[^>]*>|<\/w:tr>|<w:tc\b[^>]*>/g; let m, row = null, cell = -1, rowN = 0;
  // drop nested paragraphs in text boxes from the scan by blanking drawings first (same length to keep offsets)
  const scan = xml.replace(/<w:drawing>[\s\S]*?<\/w:drawing>|<mc:AlternateContent>[\s\S]*?<\/mc:AlternateContent>|<w:pict>[\s\S]*?<\/w:pict>/g, s => " ".repeat(s.length));
  while ((m = re.exec(scan))) {
    const s = m[0];
    if (s.startsWith("<w:tr")) { row = ++rowN; cell = -1; continue; }
    if (s === "</w:tr>") { row = null; continue; }
    if (s.startsWith("<w:tc")) { cell++; continue; }
    paras.push({ start: m.index, end: m.index + s.length, row, cell });
  }
  return paras;
}
function paraInfo(px, ST, NUM) {
  const pPr = (px.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/) || [])[1] || "";
  const sid = attr(pPr, "w:pStyle") || "Normal";
  let num = /<w:numPr>/.test(pPr) ? { numId: attr(pPr, "w:numId"), ilvl: attr(pPr, "w:ilvl") || "0" } : ST.get(sid, "num");
  let mark = null; if (num && num.numId && num.numId !== "0") { const f = NUM.fmt(num.numId, num.ilvl); if (f) mark = f.fmt === "bullet" ? "\u2022" : (f.fmt && f.fmt !== "none" ? "1." : null); else mark = "\u2022"; }
  const runs = []; const rr = /<w:r\b[^>]*>([\s\S]*?)<\/w:r>/g; let m;
  const sdef = { b: ST.get(sid, "b"), i: ST.get(sid, "i"), sz: ST.get(sid, "sz") || ST.D.sz || 11, c: ST.get(sid, "c"), font: ST.get(sid, "font") || ST.D.font, theme: ST.get(sid, "theme") || ST.D.theme, caps: ST.get(sid, "caps") };
  const pr = rpr(pPr); // paragraph mark run props are not text props; ignore except as hint
  while ((m = rr.exec(px))) {
    const r = m[1]; if (/<w:instrText/.test(r) || /<w:delText/.test(r)) continue;
    const p = Object.assign({}, sdef, rpr(r)); let t = "";
    const tk = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>|<w:tab\/>|<w:br\/>|<w:sym\b[^>]*w:char="([0-9A-Fa-f]+)"/g; let k;
    while ((k = tk.exec(r))) { if (k[0].startsWith("<w:tab")) t += "\t"; else if (k[0].startsWith("<w:br")) t += " "; else if (k[2]) t += String.fromCharCode(parseInt(k[2], 16)); else t += ent(k[1]); }
    if (t) runs.push({ t: p.caps ? t.toUpperCase() : t, b: !!p.b, i: !!p.i, sz: p.sz, c: p.c, font: p.font || (p.theme && /major/.test(p.theme) ? ST.major : ST.minor) });
  }
  const jc = attr(pPr, "w:jc"); const ind = pPr.match(/<w:ind\b[^>]*w:(?:left|start)="(\d+)"/);
  const bdr = /<w:pBdr>[\s\S]*?<w:bottom\b[^>]*w:val="(?!nil|none)/.test(pPr) || ST.get(sid, "bdr");
  return { sid, sname: (ST.S[sid] && ST.S[sid].name) || sid, mark, runs, center: jc === "center", x: ind ? +ind[1] / 20 : 0, bdr };
}
function docxLines(xml, stylesXml, numberingXml, themeXml) {
  const ST = parseStyles(stylesXml || "", themeXml || ""), NUM = parseNumbering(numberingXml || "");
  const paras = docxParas(xml); const lines = []; let fams = {};
  const infos = paras.map(p => paraInfo(xml.slice(p.start, p.end), ST, NUM));
  const rowsDone = new Set();
  paras.forEach((p, idx) => {
    const inf = infos[idx];
    if (p.row && !rowsDone.has(p.row)) {
      rowsDone.add(p.row);
      const rowIdx = paras.map((q, j) => q.row === p.row ? j : -1).filter(j => j >= 0);
      const cells = {}; rowIdx.forEach(j => { (cells[paras[j].cell] = cells[paras[j].cell] || []).push(j); });
      const ck = Object.keys(cells);
      if (ck.length >= 2 && ck.length <= 3 && ck.every(c => cells[c].filter(j => infos[j].runs.length).length <= 1)) {
        const parts = ck.map(c => cells[c].map(j => infos[j].runs.map(r => r.t).join("")).join(" ").trim()).filter(Boolean);
        if (parts.length) { const all = ck.flatMap(c => cells[c]); const first = infos[all.find(j => infos[j].runs.length) ?? all[0]]; lines.push(mk(first, parts.length > 1 ? parts.slice(0, -1).join(" | ") : parts[0], parts.length > 1 ? parts[parts.length - 1] : "", all)); }
        return;
      }
    }
    if (p.row && rowsDone.has(p.row) && lines.length && lines[lines.length - 1].src && lines[lines.length - 1].src.includes(idx)) return;
    if (!inf.runs.length) { if (lines.length && inf.bdr) lines[lines.length - 1].ruleAfter = true; return; }
    const text = inf.runs.map(r => r.t).join("");
    let left = text, right = "";
    if (text.includes("\t")) { const parts = text.split(/\t+/).map(s => s.trim()).filter(Boolean); if (parts.length >= 2 && parts[parts.length - 1].length < 45) { right = parts.pop(); left = parts.join(" "); } else left = text.replace(/\t+/g, " "); }
    lines.push(mk(inf, left, right, [idx]));
  });
  function mk(inf, t, right, src) {
    const nb = inf.runs.filter(r => r.t.trim());
    let dom = nb[0] || inf.runs[0] || {}; for (const r of nb) if (r.t.length > (dom.t || "").length) dom = r;
    for (const r of nb) fams[r.font || ""] = (fams[r.font || ""] || 0) + r.t.length;
    const runs = []; let acc = 0; const tl = t.length;
    // runs restricted to the left part (right part handled separately)
    for (const r of inf.runs) { const rt = r.t.replace(/\t+/g, " "); runs.push({ t: rt, b: r.b, i: r.i }); }
    let lr = mergeRuns(runs); const joined = lr.map(r => r.t).join("");
    if (right && joined.includes(right)) { let cut = joined.lastIndexOf(right); const out = []; let pos = 0; for (const r of lr) { if (pos >= cut) break; out.push({ t: r.t.slice(0, Math.max(0, cut - pos)), b: r.b, i: r.i }); pos += r.t.length; } lr = mergeRuns(out.filter(r => r.t)); }
    if (lr.length) { lr[0].t = lr[0].t.replace(/^\s+/, ""); lr[lr.length - 1].t = lr[lr.length - 1].t.replace(/\s+$/, ""); }
    const L = { t: (inf.mark ? inf.mark + " " : "") + t.trim(), runs: inf.mark ? [{ t: inf.mark + " " }].concat(lr) : lr, right, s: dom.sz || 11, b: nb.length > 0 && nb.every(r => r.b), i: nb.length > 0 && nb.every(r => r.i), x: inf.x, p: src.length === 1 ? src[0] : undefined, src, center: inf.center, sname: inf.sname };
    if (dom.c) { L.c = dom.c; L.colored = saturated(dom.c); }
    if (inf.bdr) L.ruleAfter = true;
    if (/^(Heading|Title|Kop)/i.test(inf.sname)) L.hstyle = true;
    return L;
  }
  // page
  const sect = (xml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/g) || []).pop() || "";
  const pw = +((sect.match(/<w:pgSz\b[^>]*w:w="(\d+)"/) || [])[1] || 11906) / 20, ph = +((sect.match(/<w:pgSz\b[^>]*w:h="(\d+)"/) || [])[1] || 16838) / 20;
  const mg = k => +((sect.match(new RegExp("<w:pgMar\\b[^>]*w:" + k + "=\"(\\d+)\"")) || [])[1] || 1134) / 20;
  const fam = Object.entries(fams).sort((a, b) => b[1] - a[1])[0];
  const style = { page: Math.abs(pw - 612) < 8 ? "Letter" : Math.abs(pw - 595) < 8 ? "A4" : [pw, ph], family: (fam && fam[0]) || ST.minor || "Calibri", margins: [mg("top"), mg("right"), mg("bottom"), mg("left")], keepSizes: true };
  return { lines, paras, style };
}

// ---- in-place DOCX edit: reorder whole paragraphs (keeps every run's formatting) and patch changed words ----
function wtNodes(px) { const out = []; const re = /(<w:t(?:\s[^>]*)?>)([^<]*)(<\/w:t>)/g; let m; while ((m = re.exec(px))) out.push({ i: m.index, len: m[0].length, open: m[1], text: ent(m[2]), close: m[3] }); return out; }
function setParaText(px, newText) {
  const nodes = wtNodes(px); if (!nodes.length) return px;
  const C = nodes.map(n => n.text).join("");
  // strip a leading/trailing whitespace difference
  const lead = C.match(/^\s*/)[0], trail = C.match(/\s*$/)[0];
  const target = lead + newText + trail;
  if (C === target) return px;
  let p = 0; while (p < C.length && p < target.length && C[p] === target[p]) p++;
  let s = 0; while (s < C.length - p && s < target.length - p && C[C.length - 1 - s] === target[target.length - 1 - s]) s++;
  const a = p, b = C.length - s; // [a,b) in C replaced by target.slice(p, target.length - s)
  const rep = target.slice(p, target.length - s);
  let pos = 0, si = -1, ei = -1;
  nodes.forEach((n, k) => { const st = pos, en = pos + n.text.length; n.st = st; pos = en; if (si < 0 && a >= st && (a < en || (a === en && (k === nodes.length - 1 || a === b)))) si = k; if (ei < 0 && ((b > st && b <= en) || (b === st && a === b && k === si) || (b === 0 && k === 0))) ei = k; });
  let texts = nodes.map(n => n.text);
  if (si >= 0 && si === ei) { const n = nodes[si]; texts[si] = n.text.slice(0, a - n.st) + rep + n.text.slice(b - n.st); }
  else { texts = nodes.map((n, k) => k === 0 ? target : ""); }
  let out = "", last = 0;
  nodes.forEach((n, k) => { out += px.slice(last, n.i) + n.open.replace(/^<w:t(?![^>]*xml:space)/, '<w:t xml:space="preserve"') + xesc(texts[k]) + n.close; last = n.i + n.len; });
  return out + px.slice(last);
}
// orig/tail: Fitwise documents (same structure). Returns new document.xml
function applyDocxEdits(xml, paras, orig, tail) {
  const slot = {}; // para index -> new paragraph xml
  const pxOf = i => xml.slice(paras[i].start, paras[i].end);
  function container(oa, na) {
    if (!oa || !na || oa.length !== na.length) return;
    const one = n => n && n.src && n.src.length === 1 && n.src[0] != null;
    const permutable = oa.every(one) && na.every(one);
    oa.forEach((o, k) => {
      const n = na[k]; if (o.type === "entry" || !one(o)) return;
      const srcIdx = permutable ? n.src[0] : o.src[0];
      const node = permutable ? n : (na.find(x => one(x) && x.src[0] === o.src[0]) || o);
      let px = pxOf(srcIdx);
      if (node.changed) px = setParaText(px, node.t);
      if (srcIdx !== o.src[0] || node.changed) slot[o.src[0]] = px;
    });
    oa.forEach((o, k) => { if (o.type === "entry") container(o.items, na[k] && na[k].items); });
  }
  orig.sections.forEach((s, k) => { const t = tail.sections[k]; if (!t) return; container(s.blocks, t.blocks); });
  const keys = Object.keys(slot).map(Number).sort((a, b) => b - a);
  let out = xml; for (const i of keys) out = out.slice(0, paras[i].start) + slot[i] + out.slice(paras[i].end);
  return out;
}

// ---- tiny zip (read: deflate-raw via DecompressionStream or node zlib; write: stored + deflated passthrough) ----
function u16(b, o) { return b[o] | b[o + 1] << 8; } function u32(b, o) { return (b[o] | b[o + 1] << 8 | b[o + 2] << 16 | b[o + 3] << 24) >>> 0; }
function zipEntries(buf) {
  const b = new Uint8Array(buf); let e = b.length - 22; while (e >= 0 && u32(b, e) !== 0x06054b50) e--;
  const n = u16(b, e + 10), cd = u32(b, e + 16); const out = []; let o = cd;
  for (let k = 0; k < n; k++) { const method = u16(b, o + 10), crc = u32(b, o + 16), csize = u32(b, o + 20), usize = u32(b, o + 24), nl = u16(b, o + 28), xl = u16(b, o + 30), cl = u16(b, o + 32), lo = u32(b, o + 42); const name = new TextDecoder().decode(b.subarray(o + 46, o + 46 + nl)); const lnl = u16(b, lo + 26), lxl = u16(b, lo + 28); out.push({ name, method, crc, csize, usize, data: b.subarray(lo + 30 + lnl + lxl, lo + 30 + lnl + lxl + csize) }); o += 46 + nl + xl + cl; }
  return out;
}
async function inflate(data, method) {
  if (method === 0) return data;
  if (typeof DecompressionStream !== "undefined") { const s = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw")); return new Uint8Array(await new Response(s).arrayBuffer()); }
  return new Uint8Array(require("zlib").inflateRawSync(data));
}
async function readZipText(buf, name) { const e = zipEntries(buf).find(x => x.name === name); return e ? new TextDecoder().decode(await inflate(e.data, e.method)) : null; }
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(d) { let c = 0xFFFFFFFF; for (let i = 0; i < d.length; i++) c = CRC[(c ^ d[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
// rebuild the zip: replaced entries stored uncompressed, all others copied byte-for-byte
function writeZip(buf, replace) {
  const ents = zipEntries(buf); const enc = new TextEncoder(); const chunks = [], cds = []; let off = 0;
  const w16 = v => [v & 255, v >> 8 & 255], w32 = v => [v & 255, v >> 8 & 255, v >> 16 & 255, v >>> 24 & 255];
  for (const e of ents) {
    let data = e.data, method = e.method, crc = e.crc, us = e.usize;
    if (replace[e.name] != null) { data = typeof replace[e.name] === "string" ? enc.encode(replace[e.name]) : replace[e.name]; method = 0; crc = crc32(data); us = data.length; }
    const nm = enc.encode(e.name);
    const lh = new Uint8Array([...w32(0x04034b50), 20, 0, 0, 0, ...w16(method), 0, 0, 0x21, 0, ...w32(crc), ...w32(data.length), ...w32(us), ...w16(nm.length), 0, 0]);
    chunks.push(lh, nm, data);
    cds.push(new Uint8Array([...w32(0x02014b50), 20, 0, 20, 0, 0, 0, ...w16(method), 0, 0, 0x21, 0, ...w32(crc), ...w32(data.length), ...w32(us), ...w16(nm.length), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...w32(off)]), nm);
    off += lh.length + nm.length + data.length;
  }
  const cdStart = off; let cdLen = 0; for (const c of cds) cdLen += c.length;
  const end = new Uint8Array([...w32(0x06054b50), 0, 0, 0, 0, ...w16(ents.length), ...w16(ents.length), ...w32(cdLen), ...w32(cdStart), 0, 0]);
  const all = chunks.concat(cds, [end]); let n = 0; for (const c of all) n += c.length; const out = new Uint8Array(n); let p = 0; for (const c of all) { out.set(c, p); p += c.length; } return out;
}
return { pdfLines, canvasSampler, docxLines, applyDocxEdits, setParaText, readZipText, writeZip, zipEntries, saturated };
})();
if (typeof module !== "undefined") module.exports = FitExtract;
