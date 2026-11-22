
// Fitwise mini PDF writer: A4, Helvetica, text only, ATS-friendly (real selectable text).
(function () {
const WIDTHS = {"Helvetica": [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584, 761, 556, 0, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0, 0, 222, 222, 333, 333, 350, 556, 1000, 333, 1000, 500, 333, 944, 0, 500, 667, 278, 333, 556, 556, 556, 556, 260, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 556, 537, 278, 333, 333, 365, 556, 834, 834, 834, 611, 667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 500, 556, 556, 556, 556, 278, 278, 278, 278, 556, 556, 556, 556, 556, 556, 556, 584, 611, 556, 556, 556, 556, 500, 556, 500], "Helvetica-Bold": [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584, 761, 556, 0, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 0, 611, 0, 0, 278, 278, 500, 500, 350, 556, 1000, 333, 1000, 556, 333, 944, 0, 500, 667, 278, 333, 556, 556, 556, 556, 280, 556, 333, 737, 370, 556, 584, 333, 737, 333, 400, 584, 333, 333, 333, 611, 556, 278, 333, 333, 365, 556, 834, 834, 834, 611, 722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778, 778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 556, 556, 556, 556, 556, 278, 278, 278, 278, 611, 611, 611, 611, 611, 611, 611, 584, 611, 611, 611, 611, 611, 556, 611, 556]};
const UNI = { 0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F };
const FALLBACK = { 0x25CF: 0x95, 0x25AA: 0x95, 0x25E6: 0x95, 0x2023: 0x95, 0x2043: 0x95, 0x2219: 0x95, 0x2192: 0x3E, 0x2010: 0x2D, 0x2011: 0x2D, 0x2012: 0x2D, 0x2212: 0x2D, 0x00A0: 0x20, 0x2009: 0x20, 0x202F: 0x20, 0x2032: 0x27, 0x2033: 0x22 };
function enc(s) {
  let out = "";
  for (const ch of (s || "").normalize("NFC")) {
    const c = ch.codePointAt(0);
    if (c >= 32 && c < 127) out += ch;
    else if (UNI[c]) out += String.fromCharCode(UNI[c]);
    else if (FALLBACK[c]) out += String.fromCharCode(FALLBACK[c]);
    else if (c >= 160 && c <= 255) out += ch;
    else { const d = ch.normalize("NFD")[0]; out += d && d.charCodeAt(0) < 127 ? d : "?"; }
  }
  return out;
}
function width(s, font, size) { const w = WIDTHS[font]; let t = 0; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); t += (c >= 32 && c < 256 ? w[c - 32] : 556) || 556; } return t * size / 1000; }
function wrap(s, font, size, maxW) {
  const words = s.split(/ +/), lines = []; let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (width(t, font, size) <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    while (width(cur, font, size) > maxW && cur.length > 1) { let k = cur.length; while (k > 1 && width(cur.slice(0, k), font, size) > maxW) k--; lines.push(cur.slice(0, k)); cur = cur.slice(k); }
  }
  if (cur) lines.push(cur);
  return lines;
}
function esc(s) { return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }

class Doc {
  constructor(meta) { this.W = 595.28; this.H = 841.89; this.M = 54; this.pages = []; this.meta = meta || {}; this.newPage(); }
  newPage() { this.cur = []; this.pages.push(this.cur); this.y = this.H - this.M; }
  need(h) { if (this.y - h < this.M) this.newPage(); }
  text(str, o = {}) {
    const font = o.bold ? "Helvetica-Bold" : "Helvetica", size = o.size || 10, lh = o.lh || size * 1.32, ind = o.indent || 0;
    const color = o.color || [0.1, 0.1, 0.12];
    const maxW = this.W - 2 * this.M - ind;
    for (const para of String(str).split("\n")) {
      const lines = para.trim() ? wrap(enc(para), font, size, maxW) : [""];
      lines.forEach((ln, i) => {
        this.need(lh); this.y -= lh;
        let x = this.M + ind;
        if (o.center) x = (this.W - width(ln, font, size)) / 2;
        if (o.bullet && i === 0) this.cur.push(`BT /${font === "Helvetica" ? "F1" : "F2"} ${size} Tf ${color.join(" ")} rg ${(this.M + ind - 10).toFixed(2)} ${this.y.toFixed(2)} Td (${esc("\x95")}) Tj ET`);
        if (ln) this.cur.push(`BT /${font === "Helvetica" ? "F1" : "F2"} ${size} Tf ${color.join(" ")} rg ${x.toFixed(2)} ${this.y.toFixed(2)} Td (${esc(ln)}) Tj ET`);
      });
    }
  }
  gap(h) { this.y -= h; }
  rule(color = [0.05, 0.49, 0.4]) { this.need(6); this.y -= 3; this.cur.push(`${color.join(" ")} RG 0.8 w ${this.M} ${this.y.toFixed(2)} m ${(this.W - this.M).toFixed(2)} ${this.y.toFixed(2)} l S`); this.y -= 4; }
  heading(t) { this.need(40); this.gap(8); this.text(t.toUpperCase(), { bold: true, size: 10.5, color: [0.05, 0.42, 0.35] }); this.rule(); }
  bytes() {
    const objs = []; const add = s => { objs.push(s); return objs.length; };
    const f1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    const f2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    const pagesId = objs.length + 1; objs.push(null);
    const kids = [];
    for (const p of this.pages) {
      const c = p.join("\n");
      const cid = add(`<< /Length ${c.length} >>\nstream\n${c}\nendstream`);
      kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${this.W} ${this.H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${cid} 0 R >>`));
    }
    objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map(k => k + " 0 R").join(" ")}] /Count ${kids.length} >>`;
    const info = add(`<< /Title (${esc(enc(this.meta.title || "CV"))}) /Author (${esc(enc(this.meta.author || ""))}) /Creator (Fitwise) /Producer (Fitwise) >>`);
    const cat = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"; const offs = [];
    objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, "0") + " 00000 n \n").join("");
    out += `trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const b = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) b[i] = out.charCodeAt(i) & 255; return b;
  }
}

function cvPdf(t) {
  const d = new Doc({ title: (t.name || "CV") + " - CV", author: t.name || "" });
  d.text(t.name || "", { bold: true, size: 20, lh: 24 });
  if (t.headline) d.text(t.headline, { size: 11.5, color: [0.05, 0.42, 0.35], lh: 16 });
  for (const c of t.contact || []) d.text(c, { size: 9.5, color: [0.3, 0.3, 0.35], lh: 13 });
  if (t.summary) { d.heading("Summary"); d.text(t.summary, { size: 10 }); }
  if (t.skills && t.skills.length) { d.heading("Skills"); d.text(t.skills.join(" \u2022 "), { size: 10 }); }
  if (t.experience && t.experience.length) {
    d.heading(t.expTitle || "Experience");
    t.experience.forEach((e, i) => {
      if (i) d.gap(6);
      d.need(40);
      (e.header || []).forEach((h, j) => d.text(h, { bold: j === 0, size: j === 0 ? 10.5 : 9.5, color: j === 0 ? [0.1, 0.1, 0.12] : [0.35, 0.35, 0.4] }));
      d.gap(2);
      for (const b of e.bullets || []) d.text(b, { size: 10, indent: 14, bullet: true });
    });
  }
  for (const s of t.others || []) {
    d.heading(s.title);
    for (const l of s.lines) { if (!l) { d.gap(5); continue; } const isB = /^\s*([\u2022\u25CF\-\*\u2013\u00B7])\s+/.test(l); d.text(l.replace(/^\s*([\u2022\u25CF\-\*\u2013\u00B7])\s+/, ""), { size: 10, indent: isB ? 14 : 0, bullet: isB }); }
  }
  return d.bytes();
}
function letterPdf(text, name) {
  const d = new Doc({ title: (name || "Cover letter") + " - Cover letter", author: name || "" });
  if (name) { d.text(name, { bold: true, size: 14, lh: 18 }); d.gap(14); }
  for (const p of text.split(/\n\s*\n/)) { d.text(p.trim(), { size: 10.5, lh: 15 }); d.gap(9); }
  return d.bytes();
}
window.FitwisePDF = { cvPdf, letterPdf };
})();
