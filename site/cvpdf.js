
// ---------- Fitwise PDF engine: embedded Unicode TrueType (Identity-H), runs in browser and Worker ----------
var FitPDF = (function () {
const F = { metrics: null, bytes: {} };
const FAMS = { carlito: 1, caladea: 1, libsans: 1, libserif: 1 };
// characters fonts don't carry -> safe equivalents (never "?")
const NORM = { 0xF0B7: "\u2022", 0xF0A7: "\u25AA", 0xF076: "\u2022", 0xF0D8: "\u2022", 0xF0FC: "\u2713", 0xF0A8: "\u2022", 0xF0FB: "\u2022", 0xF0E0: "\u2192", 0xF0E8: "\u2192", 0xF06C: "\u2022", 0xF06E: "\u25A0", 0xF0A1: "\u2022", 0xF0B2: "\u2022",
  0x2756: "\u2022", 0x27A2: "\u2022", 0x27A4: "\u2022", 0x25BA: "\u2022", 0x25B6: "\u2022", 0x25B8: "\u2022", 0x2023: "\u2022", 0x2043: "\u2022", 0x2219: "\u2022", 0x25C6: "\u2022", 0x25C7: "\u2022", 0x2B9A: "\u2022", 0x2794: "\u2192", 0x279C: "\u2192", 0x27F6: "\u2192", 0x21D2: "\u2192",
  0x2705: "\u2713", 0x2714: "\u2713", 0x2611: "\u2713", 0xFB00: "ff", 0xFB01: "fi", 0xFB02: "fl", 0xFB03: "ffi", 0xFB04: "ffl", 0x00AD: "", 0x200B: "", 0x200C: "", 0x200D: "", 0xFEFF: "", 0x2060: "", 0xFFFD: "", 0x2028: " ", 0x2029: " ", 0x00A0: " ", 0x2002: " ", 0x2003: " ", 0x2009: " ", 0x202F: " ", 0x2007: " ",
  0x2010: "-", 0x2011: "-", 0x2012: "\u2013", 0x2015: "\u2014", 0x2212: "-", 0x2032: "'", 0x2033: "\"", 0x201B: "'", 0x201F: "\"", 0x2E3A: "\u2014", 0x2E3B: "\u2014", 0x00B4: "'", 0x02BC: "'", 0x02B9: "'", 0x02BA: "\"", 0x0060: "'" };
async function load(get) { // get(path) -> Promise<ArrayBuffer>
  if (F.metrics) return;
  const m = await get("/fonts/metrics.json"); F.metrics = JSON.parse(new TextDecoder().decode(m));
}
async function need(key, get) { if (!F.bytes[key]) F.bytes[key] = new Uint8Array(await get("/fonts/" + key + ".z")); }
function fam(name) {
  const n = String(name || "").toLowerCase();
  if (FAMS[n]) return n;
  if (/calibri|carlito|candara|corbel|aptos|segoe|source sans|myriad/.test(n)) return "carlito";
  if (/cambria|caladea|constantia/.test(n)) return "caladea";
  if (/times|georgia|garamond|serif|book antiqua|palatino|minion|baskerville|bodoni|lora|merriweather|charter|liberationserif|tinos|playfair|didot|cormorant/.test(n) && !/sans/.test(n)) return "libserif";
  if (/arial|helvetica|liberation|verdana|tahoma|roboto|open ?sans|lato|inter|montserrat|poppins|nunito|raleway|arimo|dejavu|noto|ubuntu|futura|avenir|gill|trebuchet|century gothic|sans/.test(n)) return "libsans";
  return "carlito";
}
function fk(family, b, i) { return fam(family) + "-" + (b ? "B" : i ? "I" : "R"); }
// normalise a string to what the font can draw; unknown characters are dropped, never "?"
function clean(s, key) {
  const m = F.metrics[key].cmap; let out = "";
  for (const ch of String(s == null ? "" : s).normalize("NFC")) {
    const cp = ch.codePointAt(0);
    if (cp === 9) { out += " "; continue; }
    if (cp < 32) continue;
    if (m[cp]) { out += ch; continue; }
    if (NORM[cp] !== undefined) { const r = NORM[cp]; if (!r || [...r].every(c => m[c.codePointAt(0)])) { out += r; continue; } }
    if (cp >= 0x2500 && cp <= 0x259F) { out += "-"; continue; } // box drawing
    const d = ch.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    if (d && [...d].every(c => m[c.codePointAt(0)])) { out += d; continue; }
    if (cp >= 0x25A0 && cp <= 0x27BF || cp >= 0xF000 && cp <= 0xF0FF) { out += "\u2022"; continue; }
    // else: drop
  }
  return out;
}
function width(s, key, size) { const m = F.metrics[key].cmap, dw = F.metrics[key].dw; let w = 0; for (const ch of s) { const g = m[ch.codePointAt(0)]; w += g ? g[1] : dw; } return w * size / 1000; }
function hex2rgb(h) { if (Array.isArray(h)) return h; const x = String(h || "#000").replace("#", ""); const v = x.length === 3 ? x.split("").map(c => c + c).join("") : x.padEnd(6, "0"); return [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) / 255); }
const f3 = n => (Math.round(n * 1000) / 1000).toString();

class Doc {
  constructor(o = {}) { this.W = o.w || 595.28; this.H = o.h || 841.89; this.preview = !!o.preview; this.title = o.title || "CV"; this.pages = []; this.used = {}; this.fontIdx = {}; }
  addPage() { const p = { ops: [] }; this.pages.push(p); return p; }
  _font(key) { if (!(key in this.fontIdx)) { this.fontIdx[key] = Object.keys(this.fontIdx).length + 1; this.used[key] = new Map(); } return this.fontIdx[key]; }
  text(p, x, y, s, key, size, color, opts = {}) {
    s = clean(s, key); if (!s) return 0;
    const idx = this._font(key), m = F.metrics[key].cmap, used = this.used[key]; let hex = "";
    for (const ch of s) { const cp = ch.codePointAt(0); const g = m[cp]; if (!g) continue; used.set(g[0], [cp, g[1]]); hex += g[0].toString(16).padStart(4, "0"); }
    const c = hex2rgb(color || "#000");
    let tr = "";
    if (opts.rotate) { const a = opts.rotate * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a); tr = `${f3(cs)} ${f3(sn)} ${f3(-sn)} ${f3(cs)} ${f3(x)} ${f3(this.H - y)} Tm`; }
    else tr = `1 0 0 1 ${f3(x)} ${f3(this.H - y)} Tm`;
    p.ops.push(`${opts.gs ? "q /" + opts.gs + " gs " : ""}BT /F${idx} ${f3(size)} Tf ${c.map(f3).join(" ")} rg ${tr} <${hex}> Tj ET${opts.gs ? " Q" : ""}`);
    return width(s, key, size);
  }
  line(p, x1, y1, x2, y2, w, color) { const c = hex2rgb(color || "#000"); p.ops.push(`${c.map(f3).join(" ")} RG ${f3(w || 0.6)} w ${f3(x1)} ${f3(this.H - y1)} m ${f3(x2)} ${f3(this.H - y2)} l S`); }
  rect(p, x, y, w, h, color) { const c = hex2rgb(color || "#000"); p.ops.push(`${c.map(f3).join(" ")} rg ${f3(x)} ${f3(this.H - y - h)} ${f3(w)} ${f3(h)} re f`); }
  circle(p, cx, cy, r, color) { const c = hex2rgb(color), k = 0.5523 * r, Y = this.H - cy; p.ops.push(`${c.map(f3).join(" ")} rg ${f3(cx + r)} ${f3(Y)} m ${f3(cx + r)} ${f3(Y + k)} ${f3(cx + k)} ${f3(Y + r)} ${f3(cx)} ${f3(Y + r)} c ${f3(cx - k)} ${f3(Y + r)} ${f3(cx - r)} ${f3(Y + k)} ${f3(cx - r)} ${f3(Y)} c ${f3(cx - r)} ${f3(Y - k)} ${f3(cx - k)} ${f3(Y - r)} ${f3(cx)} ${f3(Y - r)} c ${f3(cx + k)} ${f3(Y - r)} ${f3(cx + r)} ${f3(Y - k)} ${f3(cx + r)} ${f3(Y)} c f`); }
  watermark(p, label) {
    const key = "libsans-B"; label = label || "PREVIEW";
    for (let row = 0; row < 4; row++) {
      const y = this.H * (0.22 + row * 0.24), x = this.W * 0.08;
      this.text(p, x, y, label, key, 64, "#d22f2f", { rotate: 28, gs: "WM" });
    }
    for (let yy = 40; yy < this.H; yy += 70) for (let xx = -40 + (yy % 140 ? 60 : 0); xx < this.W; xx += 150) this.text(p, xx, yy, "FITWISE PREVIEW", key, 9, "#d22f2f", { rotate: 28, gs: "WM2" });
  }
  async bytes(get) {
    for (const k of Object.keys(this.used)) await need(k, get);
    const objs = []; const add = o => { objs.push(o); return objs.length; };
    const enc = new TextEncoder();
    const catalog = add(null), pagesId = add(null);
    const fontRefs = {};
    for (const key of Object.keys(this.fontIdx)) {
      const M = F.metrics[key], used = [...this.used[key].entries()].sort((a, b) => a[0] - b[0]);
      const z = F.bytes[key];
      const ff = add({ dict: `<< /Length ${z.length} /Length1 ${M.len} /Filter /FlateDecode >>`, data: z });
      const flags = 32 + (M.serif ? 2 : 0) + (M.ia ? 64 : 0);
      const psn = "FWSB" + "ABCDEFGHIJKL"[this.fontIdx[key] % 12] + "+" + M.ps;
      const fd = add(`<< /Type /FontDescriptor /FontName /${psn} /Flags ${flags} /FontBBox [${M.bbox.join(" ")}] /ItalicAngle ${M.ia} /Ascent ${M.asc} /Descent ${M.desc} /CapHeight ${M.cap} /StemV ${key.endsWith("B") ? 140 : 80} /FontFile2 ${ff} 0 R >>`);
      const W = used.map(([g, v]) => `${g} [${v[1]}]`).join(" ");
      const cid = add(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${psn} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${fd} 0 R /DW ${M.dw} /W [${W}] /CIDToGIDMap /Identity >>`);
      let tu = "";
      if (!this.preview) {
        const lines = used.map(([g, v]) => { const u = String.fromCodePoint(v[0]); let h = ""; for (let i = 0; i < u.length; i++) h += u.charCodeAt(i).toString(16).padStart(4, "0"); return `<${g.toString(16).padStart(4, "0")}> <${h}>`; });
        let body = "/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def /CMapName /Adobe-Identity-UCS def /CMapType 2 def 1 begincodespacerange <0000> <FFFF> endcodespacerange\n";
        for (let i = 0; i < lines.length; i += 100) { const ch = lines.slice(i, i + 100); body += `${ch.length} beginbfchar\n${ch.join("\n")}\nendbfchar\n`; }
        body += "endcmap CMapName currentdict /CMap defineresource pop end end";
        const t = add({ dict: `<< /Length ${enc.encode(body).length} >>`, data: enc.encode(body) });
        tu = ` /ToUnicode ${t} 0 R`;
      }
      fontRefs[key] = add(`<< /Type /Font /Subtype /Type0 /BaseFont /${psn} /Encoding /Identity-H /DescendantFonts [${cid} 0 R]${tu} >>`);
    }
    const fontDict = Object.keys(this.fontIdx).map(k => `/F${this.fontIdx[k]} ${fontRefs[k]} 0 R`).join(" ");
    const gs = add("<< /Type /ExtGState /ca 0.16 /CA 0.16 >>"), gs2 = add("<< /Type /ExtGState /ca 0.10 /CA 0.10 >>");
    const kids = [];
    for (const p of this.pages) {
      const body = enc.encode(p.ops.join("\n"));
      const c = add({ dict: `<< /Length ${body.length} >>`, data: body });
      kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${f3(this.W)} ${f3(this.H)}] /Resources << /Font << ${fontDict} >> /ExtGState << /WM ${gs} 0 R /WM2 ${gs2} 0 R >> >> /Contents ${c} 0 R >>`));
    }
    objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map(k => k + " 0 R").join(" ")}] /Count ${kids.length} >>`;
    const t16 = s => { let h = "FEFF"; for (let i = 0; i < s.length; i++) h += s.charCodeAt(i).toString(16).padStart(4, "0"); return "<" + h + ">"; };
    const info = add(`<< /Title ${t16(this.title)} /Producer (Fitwise) /Creator (Fitwise) >>`);
    const chunks = []; let off = 0; const offs = [];
    const push = b => { const u = typeof b === "string" ? enc.encode(b) : b; chunks.push(u); off += u.length; };
    push("%PDF-1.7\n%\u00e2\u00e3\u00cf\u00d3\n".replace(/[\u0080-\u00ff]/g, "x"));
    objs.forEach((o, i) => { offs.push(off); if (typeof o === "string") push(`${i + 1} 0 obj\n${o}\nendobj\n`); else { push(`${i + 1} 0 obj\n${o.dict}\nstream\n`); push(o.data); push("\nendstream\nendobj\n"); } });
    const xref = off;
    push(`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, "0") + " 00000 n \n").join(""));
    push(`trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    const out = new Uint8Array(off); let p = 0; for (const c of chunks) { out.set(c, p); p += c.length; } return out;
  }
}

// ---- rich-text runs: [{t, b, i}] ----
function runsOf(x, b, i) { if (Array.isArray(x)) return x.filter(r => r && r.t); return [{ t: String(x || ""), b: !!b, i: !!i }]; }
function runsText(r) { return r.map(x => x.t).join(""); }
// keep the original formatting when the text did not change; keep a bold lead-in when it survived
function reRun(orig, text) {
  if (!orig || !orig.length) return [{ t: text }];
  if (runsText(orig) === text) return orig;
  const allB = orig.every(r => r.b || !r.t.trim()), allI = orig.every(r => r.i || !r.t.trim());
  if (allB || allI) return [{ t: text, b: allB, i: allI }];
  const first = orig[0];
  if ((first.b || first.i) && first.t.trim().length > 1 && text.startsWith(first.t)) return [{ t: first.t, b: first.b, i: first.i }, { t: text.slice(first.t.length) }];
  return [{ t: text }];
}
// tokens: words with their font flags; spaces kept as separate tokens
function tokens(runs) {
  const out = [];
  for (const r of runs) { for (const part of String(r.t).replace(/\t/g, " ").split(/(\s+)/)) if (part) out.push({ t: /^\s+$/.test(part) ? " " : part, b: r.b, i: r.i, sp: /^\s+$/.test(part) }); }
  return out;
}
function wrapRuns(runs, family, size, maxW) {
  const toks = tokens(runs); const lines = []; let cur = [], w = 0;
  const tw = t => width(clean(t.t, fk(family, t.b, t.i)), fk(family, t.b, t.i), size);
  for (const t of toks) {
    if (t.sp) { if (cur.length) { cur.push(t); w += tw(t); } continue; }
    let ww = tw(t);
    if (w + ww > maxW && cur.length) { while (cur.length && cur[cur.length - 1].sp) cur.pop(); lines.push(cur); cur = []; w = 0; }
    if (ww > maxW) { // hard-break a very long token
      let s = t.t; while (s) { let n = s.length; while (n > 1 && width(clean(s.slice(0, n), fk(family, t.b, t.i)), fk(family, t.b, t.i), size) > maxW - w) n--; cur.push({ ...t, t: s.slice(0, n) }); s = s.slice(n); if (s) { lines.push(cur); cur = []; w = 0; } else w += tw({ ...t, t: cur[cur.length - 1].t }); }
      continue;
    }
    cur.push(t); w += ww;
  }
  while (cur.length && cur[cur.length - 1].sp) cur.pop();
  if (cur.length) lines.push(cur);
  return lines;
}
function lineWidth(toks, family, size) { let w = 0; for (const t of toks) { const k = fk(family, t.b, t.i); w += width(clean(t.t, k), k, size); } return w; }

// ---- page flow ----
class Flow {
  constructor(doc, o) { this.doc = doc; this.o = o; this.page = null; this.y = 0; this.newPage(); }
  newPage() { this.page = this.doc.addPage(); this.y = this.o.mt; if (this.o.onPage) this.o.onPage(this, this.doc.pages.length); }
  get bottom() { return this.doc.H - this.o.mb; }
  ensure(h) { if (this.y + h > this.bottom + 0.01) { this.newPage(); return true; } return false; }
  // draw tokens line at x; returns width
  drawToks(toks, x, baseline, family, size, color, boldColor) {
    let cx = x;
    for (const t of toks) { const k = fk(family, t.b, t.i); cx += this.doc.text(this.page, cx, baseline, t.t, k, size, t.b && boldColor ? boldColor : color); }
    return cx - x;
  }
  // paragraph of runs. opts: x, w, size, lead, color, align('left'|'center'|'right'|'justify'), first (hanging prefix fn), keep
  para(runs, o) {
    const fam = o.family, size = o.size, lead = o.lead || size * 1.22, x = o.x, w = o.w;
    const lines = wrapRuns(runs, fam, size, w);
    lines.forEach((ln, i) => {
      if (this.ensure(lead) && o.onBreak) o.onBreak();
      const base = this.y + size * 0.86;
      let lx = x; const lw = lineWidth(ln, fam, size);
      if (o.align === "center") lx = x + (w - lw) / 2; else if (o.align === "right") lx = x + w - lw;
      if (i === 0 && o.marker) o.marker(this, base);
      this.drawToks(ln, lx, base, fam, size, o.color, o.boldColor);
      this.y += lead;
    });
    return lines.length;
  }
  measure(runs, o) { return wrapRuns(runs, o.family, o.size, o.w).length * (o.lead || o.size * 1.22); }
  space(h) { this.y += h; }
}
return { load, need, Doc, Flow, fam, fk, clean, width, wrapRuns, lineWidth, runsOf, runsText, reRun, hex2rgb, tokens, F };
})();
