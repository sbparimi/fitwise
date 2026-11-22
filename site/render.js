
// ---------- Fitwise CV renderer: one layout engine, many looks (original style or a location template) ----------
var FitRender = (function () {
const { Doc, Flow, fk, clean, width, wrapRuns, lineWidth, reRun, runsText } = FitPDF;
const PAGES = { A4: [595.28, 841.89], Letter: [612, 792] };
const MON = { jan: 1, feb: 2, mar: 3, mrt: 3, apr: 4, may: 5, mei: 5, mai: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, okt: 10, nov: 11, dec: 12, dez: 12 };
function mmyyyy(d) {
  if (!d) return "";
  return d.replace(/([A-Za-z\u00e4]{3,9})\.?\s*'?((?:19|20)?\d\d)\b/g, (m0, mo, y) => { const n = MON[mo.slice(0, 3).toLowerCase()]; if (!n) return m0; if (y.length === 2) y = "20" + y; return String(n).padStart(2, "0") + "/" + y; })
          .replace(/\s*[\u2013\u2014-]\s*|\s+to\s+/i, " \u2013 ").replace(/\bcurrent|now|today\b/i, "present").replace(/\bPresent\b/, "present");
}
function contactItems(doc) {
  const items = [];
  for (const h of doc.header) {
    if (h.kind !== "contact" && !/[|\u2022\u00B7]/.test(h.t)) continue;
    for (const p of (h.t + (h.right ? " | " + h.right : "")).split(/\s*[|\u2022\u00B7\u2013]\s+|\s{3,}|\t|\s+\|\s*/)) {
      const t = p.trim(); if (!t) continue;
      let k = "other";
      if (/@/.test(t)) k = "email"; else if (/linkedin/i.test(t)) k = "linkedin"; else if (/github|https?:|www\.|\.[a-z]{2,4}\//i.test(t)) k = "web"; else if (/^\+?[\d\s().\-]{8,}$/.test(t.replace(/^(tel|phone|mobile|m)[:.]?\s*/i, ""))) k = "phone"; else if (placeOf(t) || /^[A-Z][a-z]+(,\s*[A-Z][A-Za-z ]+)?$/.test(t)) k = "location";
      items.push({ k, t: t.replace(/^(e-?mail|tel|phone|mobile|linkedin|web|address)\s*:\s*/i, "") });
    }
  }
  return items;
}
function headlines(doc) { return doc.header.filter(h => h.kind !== "contact" && !/[|\u2022\u00B7]/.test(h.t)); }
function skillItems(sec) {
  const out = [];
  for (const b of sec.blocks) {
    const t = b.t; const m = t.match(/^([^:]{2,40}):\s*(.+)$/);
    const list = m ? m[2] : t;
    if (/[,;|\u2022\u00B7]/.test(list) || b.type === "bullet" && t.length < 50) out.push(...list.split(/\s*[,;|\u2022\u00B7]\s*/).map(s => s.replace(/[.]$/, "").trim()).filter(Boolean));
    else return null; // sentence-style skills: keep as written
  }
  return out;
}
function markOf(b, T) { if (T.bullet) return T.bullet; const m = b.mark || "\u2022"; if (/^[\u2013\u2014-]$/.test(m)) return "\u2013"; if (/^\d/.test(m)) return m; if (m === "\u2713" || m === "\u2714" || m === "\u2705" || m === "\uF0FC") return "\u2713"; if (m === "\u25AA" || m === "\uF0A7" || m === "\u25A0") return "\u25AA"; if (m === ">" || m === "\u27A2" || m === "\u27A4" || m === "\uF0D8") return "\u203A"; return "\u2022"; }

function render(doc, T, opts) {
  opts = opts || {};
  let best = null;
  const maxPages = T.maxPages || 2;
  for (const sc of [1, 0.95, 0.91, 0.87, 0.84]) {
    const d = layout(doc, T, sc, opts);
    best = d;
    if (d.pages.length <= maxPages) break;
  }
  if (opts.preview) for (const p of best.pages) best.watermark(p);
  return best;
}

function layout(doc, T, sc, opts) {
  const [W, H] = Array.isArray(T.page) ? T.page : PAGES[T.page] || PAGES.A4;
  const D = new Doc({ w: W, h: H, preview: opts.preview, title: (doc.name ? doc.name.t : "CV") + " - CV" });
  const fam = T.family, ml = T.margins[3], mr = T.margins[1];
  const body = T.body * sc, lead = body * (T.leadK || 1.25), gap = T.gap * sc;
  const CW = W - ml - mr;
  const F = new Flow(D, { mt: T.margins[0], mb: T.margins[2], onPage: (fl, n) => { if (T.pageFooter && n > 1) {} } });
  const color = T.color || "#1a1a1a", muted = T.muted || "#555555", accent = T.accent || color;
  const two = T.layout === "twocol";
  const LX = two ? ml + T.labelW : ml, LW = two ? CW - T.labelW : CW;
  const st = (n, k) => (n && n.st && n.st[k]);
  const sz = (n, def) => { const s = st(n, "s"); return T.keepSizes && s ? Math.max(7.5, Math.min(s, 30)) * sc : def; };
  const col = (n, def) => (T.keepColors && st(n, "c")) || def;
  const runsFor = n => reRun(n.runs && n.runs.length ? n.runs : [{ t: n.t, b: !!st(n, "b"), i: !!st(n, "i") }], n.t);

  // ---- header ----
  if (doc.name) {
    const s = T.name.size * (T.keepSizes && st(doc.name, "s") ? Math.min(1.25, Math.max(0.75, st(doc.name, "s") / T.name.size)) : 1) * (sc < 1 ? Math.max(sc, 0.92) : 1);
    const nameT = T.name.caps ? doc.name.t.toUpperCase() : doc.name.t;
    F.para([{ t: nameT, b: T.name.b !== false }], { family: T.name.family || fam, size: s, lead: s * 1.15, x: ml, w: CW, align: T.name.align, color: col(doc.name, T.name.color || color) });
    F.space(T.name.after * sc);
  }
  const hl = headlines(doc), ci = contactItems(doc);
  if (T.contact === "asIs") {
    for (const h of doc.header) {
      const s = sz(h, body * 0.95);
      F.para(runsFor(h).concat(h.right ? [{ t: "   " + h.right }] : []), { family: fam, size: s, x: ml, w: CW, align: st(h, "al") === "c" || T.name.align === "center" ? "center" : "left", color: col(h, h.kind === "contact" ? muted : color) });
      if (h.ruleAfter) { D.line(F.page, ml, F.y + 2, W - mr, F.y + 2, 0.6, T.ruleColor || accent); F.space(5); }
    }
  } else {
    for (const h of hl) F.para([{ t: h.t, b: true }], { family: fam, size: body * 1.05, x: ml, w: CW, align: T.name.align, color: T.headlineColor || accent });
    if (T.contact === "line") {
      const t = ci.map(c => c.t).join(T.sep || "  |  ");
      if (t) F.para([{ t }], { family: fam, size: body * 0.92, x: ml, w: CW, align: T.name.align, color: muted });
    }
  }
  F.space(T.headerAfter * sc);
  if (T.headerRule) { D.line(F.page, ml, F.y, W - mr, F.y, T.headerRule, accent); F.space(gap); }

  // ---- personal-details rows (Europass / tabular) ----
  const rowLabel = (label, y) => { const k = fk(fam, false, false); const s = body * 0.88; const lw = width(clean(label, k), k, s); D.text(F.page, ml + T.labelW - 14 - lw, y + s * 0.86 + (body - s) * 0.5, label, k, s, T.labelColor || muted); };
  function heading(title, kind, node) {
    const label = T.labels ? (T.labels[kind] || (T.caps ? title.toUpperCase() : title)) : title;
    const hs = T.heading.size * sc;
    F.ensure(hs * 1.6 + lead * 3 + T.heading.before * sc);
    if (F.y > T.margins[0] + 1) F.space(T.heading.before * sc);
    if (two) {
      const k = fk(fam, T.heading.b !== false, false); const y = F.y;
      const t = T.caps ? label.toUpperCase() : label;
      const lw = width(clean(t, k), k, hs);
      D.text(F.page, ml + T.labelW - 14 - lw, y + hs * 0.86, t, k, hs, T.heading.color || accent);
      D.line(F.page, ml + T.labelW, y + hs * 0.55, W - mr, y + hs * 0.55, 0.6, T.ruleColor || accent);
      F.space(hs * 1.5);
      return;
    }
    const t = T.caps || (T.heading.caps) ? label.toUpperCase() : label;
    const n = T.headingNode || null;
    F.para([{ t, b: T.heading.b !== false }], { family: T.heading.family || fam, size: hs, lead: hs * 1.2, x: ml, w: CW, align: T.heading.align, color: T.heading.color || accent });
    if (T.heading.rule || (T.keepRules && node && node.ruleAfter)) { D.line(F.page, ml, F.y + 1.2, W - mr, F.y + 1.2, T.heading.rule || 0.7, T.ruleColor || T.heading.color || accent); F.space(4.5 * sc); }
    F.space(T.heading.after * sc);
  }
  function bullet(b, x, w, s, c) {
    const m = markOf(b, T);
    const ind = (T.bulletIndent || 11) * sc;
    const runs = runsFor(b);
    F.ensure(lead);
    F.para(runs, { family: fam, size: s, lead: s * (T.leadK || 1.25), x: x + ind, w: w - ind, color: c, marker: (fl, base) => { const k = fk(fam, false, false); D.text(fl.page, x + (T.markX || 1) * sc, base, m, k, s, T.markColor || c); } });
    F.space((T.bulletGap || 1) * sc);
  }
  function para(b, x, w, s, c) { F.para(runsFor(b), { family: fam, size: s, lead: s * (T.leadK || 1.25), x, w, color: c }); F.space(T.paraGap * sc); }
  function rightLine(leftRuns, right, x, w, s, c, rc) {
    const k = fk(fam, false, !!T.dateItalic); const rs = s * 0.95; const rw = right ? width(clean(right, k), k, rs) + 10 : 0;
    const before = F.y; F.ensure(s * 1.3);
    const lines = wrapRuns(leftRuns, fam, s, w - rw);
    lines.forEach((ln, i) => { F.ensure(s * 1.3); const base = F.y + s * 0.86; F.drawToks(ln, x, base, fam, s, c); if (i === 0 && right) D.text(F.page, x + w - rw + 10, base, right, k, rs, rc || c); F.y += s * 1.3; });
  }
  function entry(e, kind) {
    const f = e.fields || {}; const s = body;
    const hdrH = (e.head.length || 1) * s * 1.3 + lead * 2;
    F.ensure(hdrH);
    const structured = T.entry !== "asIs" && (f.title || f.org);
    if (two) {
      const y0 = F.y; const k = fk(fam, false, false); const ds = s * 0.9;
      const dt = T.dateFmt === "mm" ? mmyyyy(f.dates) : f.dates;
      if (dt) { const lines = wrapRuns([{ t: dt }], fam, ds, T.labelW - 18); lines.forEach((ln, i) => { const lw = lineWidth(ln, fam, ds); F.drawToks(ln, ml + T.labelW - 14 - lw, y0 + ds * 0.86 + i * ds * 1.25 + 0.5, fam, ds, T.labelColor || muted); }); }
      if (structured) {
        if (f.title) F.para([{ t: f.title, b: true }], { family: fam, size: s * 1.02, x: LX, w: LW, color });
        const ol = [f.org, f.loc].filter(Boolean).join(", ");
        if (ol) F.para([{ t: ol, i: !!T.orgItalic }], { family: fam, size: s, x: LX, w: LW, color: T.orgColor || accent });
      } else for (const h of e.head) F.para(runsFor(h).concat(h.right && !f.dates ? [{ t: "  " + h.right }] : []), { family: fam, size: s, x: LX, w: LW, color });
      F.space(2 * sc);
    } else if (!structured) {
      for (const h of e.head) rightLine(runsFor(h), h.right, ml, CW, sz(h, s), col(h, color), col(h, T.dateColor || color));
      F.space(1.5 * sc);
    } else if (T.entry === "titleFirst") {
      rightLine([{ t: f.title || f.org, b: true }], T.dateFmt === "mm" ? mmyyyy(f.dates) : f.dates, ml, CW, s * 1.02, color, T.dateColor || color);
      const ol = [f.title ? f.org : "", f.loc].filter(Boolean).join(T.orgSep || ", ");
      if (ol) rightLine([{ t: ol, i: !!T.orgItalic }], "", ml, CW, s, T.orgColor || color);
      F.space(2 * sc);
    } else { // orgFirst
      rightLine([{ t: f.org || f.title, b: true }], f.loc, ml, CW, s * 1.02, T.orgColor || color, muted);
      if (f.org && f.title || f.dates) rightLine([{ t: f.org ? f.title : "", i: !!T.titleItalic, b: !!T.titleBold }], T.dateFmt === "mm" ? mmyyyy(f.dates) : f.dates, ml, CW, s, color, T.dateColor || muted);
      F.space(2 * sc);
    }
    for (const it of e.items) { if (it.type === "bullet") bullet(it, LX, LW, sz(it, s), col(it, color)); else para(it, LX, LW, sz(it, s), col(it, color)); }
    F.space(T.entryGap * sc);
  }
  function skills(sec) {
    const items = T.skills !== "asIs" ? skillItems(sec) : null;
    const catd = sec.blocks.length > 0 && sec.blocks.every(b => /^[^:]{2,40}:\s*\S/.test(b.t));
    if (items && T.skills === "columns" && items.length >= 4 && (items.length <= 18 && !catd)) {
      const cols = T.skillCols || 3, cw = LW / cols, rows = Math.ceil(items.length / cols);
      for (let r = 0; r < rows; r++) {
        let h = 0; const y0 = F.y; F.ensure(lead);
        let maxY = F.y;
        for (let c = 0; c < cols; c++) { const it = items[c * rows + r]; if (!it) continue; F.y = y0; bullet({ t: it, mark: "\u2022" }, LX + c * cw, cw - 6, body, color); maxY = Math.max(maxY, F.y); }
        F.y = maxY;
      }
      return;
    }
    if (items && (T.skills === "inline" || T.skills === "columns")) {
      const cats = sec.blocks.filter(b => /^[^:]{2,40}:\s*\S/.test(b.t));
      if (cats.length === sec.blocks.length) { for (const b of sec.blocks) { const m = b.t.match(/^([^:]{2,40}:)\s*(.+)$/); F.para([{ t: m[1] + " ", b: true }, { t: m[2] }], { family: fam, size: body, lead, x: LX, w: LW, color }); F.space(T.paraGap * sc); } return; }
      F.para([{ t: items.join(T.skillSep || "  \u2022  ") }], { family: fam, size: body, lead, x: LX, w: LW, color }); F.space(T.paraGap * sc); return;
    }
    for (const b of sec.blocks) { if (b.type === "bullet") bullet(b, LX, LW, sz(b, body), col(b, color)); else para(b, LX, LW, sz(b, body), col(b, color)); }
  }
  // ---- personal details (twocol templates) ----
  if (T.personal && ci.length) {
    heading("Personal information", "personal");
    const lab = { email: "Email", phone: "Phone", linkedin: "LinkedIn", web: "Website", location: "Location", other: "" };
    for (const c of ci) { const y = F.y; rowLabel(lab[c.k] || "", y); F.para([{ t: c.t }], { family: fam, size: body, lead, x: LX, w: LW, color }); }
    const per = doc.sections.find(s => s.kind === "personal");
    if (per) for (const b of per.blocks) { const m = b.t.match(/^([^:]{2,30}):\s*(.+)$/); const y = F.y; if (m) { rowLabel(m[1], y); F.para([{ t: m[2] }], { family: fam, size: body, lead, x: LX, w: LW, color }); } else F.para([{ t: b.t }], { family: fam, size: body, lead, x: LX, w: LW, color }); }
    F.space(gap * 0.5);
  }
  // ---- sections ----
  let secs = doc.sections.slice();
  if (T.order) { const rank = k => { const i = T.order.indexOf(k); return i < 0 ? T.order.length : i; }; secs = secs.map((s, i) => ({ s, i })).sort((a, b) => rank(a.s.kind) - rank(b.s.kind) || a.i - b.i).map(x => x.s); }
  if (T.drop) secs = secs.filter(s => !T.drop.includes(s.kind));
  if (T.personal) secs = secs.filter(s => s.kind !== "personal");
  for (const sec of secs) {
    if (!sec.blocks.length) continue;
    if (sec.title || T.labels) heading(sec.title || "Profile", sec.kind === "summary" && !sec.title ? "summary" : sec.kind, sec);
    if (sec.kind === "skills") skills(sec);
    else for (const b of sec.blocks) {
      if (b.type === "entry") entry(b, sec.kind);
      else if (b.type === "bullet") bullet(b, LX, LW, sz(b, body), col(b, color));
      else para(b, LX, LW, sz(b, body), col(b, color));
    }
    F.space(T.sectionGap * sc);
  }
  if (T.closing) { F.ensure(lead * 3); F.space(gap); heading(T.closing.title, "references"); F.para([{ t: T.closing.text }], { family: fam, size: body, lead, x: LX, w: LW, color }); }
  // page numbers on multi-page documents
  if (D.pages.length > 1 && T.pageNumbers !== false) D.pages.forEach((p, i) => { const k = fk(fam, false, false); const t = (doc.name ? doc.name.t + "  \u00B7  " : "") + "Page " + (i + 1) + " of " + D.pages.length; const tw = width(clean(t, k), k, 7.5); D.text(p, W - mr - tw, H - T.margins[2] * 0.45, t, k, 7.5, "#888888"); });
  return D;
}

// template that reproduces the uploaded CV's own look
function originalTemplate(style) {
  style = style || {};
  const b = Math.max(8.5, Math.min(style.body || 10.5, 12.5));
  const page = style.page || "A4";
  const m = style.margins || [42, 46, 40, 46];
  return {
    page, margins: m.map(x => Math.max(28, Math.min(x, 80))), family: style.family || "carlito", body: b, gap: b * 0.6, leadK: style.leadK || 1.22,
    color: style.color || "#1a1a1a", muted: style.muted || "#4a4a4a", accent: style.accent || style.headingColor || "#1a1a1a",
    name: { size: Math.max(14, Math.min(style.nameSize || 20, 30)), b: true, color: style.nameColor || "#111111", align: style.center ? "center" : "left", after: 2 },
    contact: "asIs", headerAfter: b * 0.6, headerRule: 0,
    heading: { size: Math.max(b, Math.min(style.headingSize || b + 1.5, 18)), b: style.headingBold !== false, color: style.headingColor || "#1a1a1a", rule: style.headingRule ? 0.7 : 0, before: b * 0.9, after: b * 0.45, caps: false },
    ruleColor: style.ruleColor || style.headingColor || "#999999", keepRules: true,
    entry: "asIs", skills: "asIs", keepSizes: !!style.keepSizes, keepColors: true,
    paraGap: b * 0.25, entryGap: b * 0.55, sectionGap: 0, bulletGap: 0.8, bulletIndent: b * 1.15,
    maxPages: Math.max(2, style.pages || 2), pageNumbers: false
  };
}

// cover letter in the CV's own font
function letterPdf(text, name, style) {
  style = style || {};
  const fam = style.family || "carlito"; const [W, H] = Array.isArray(style.page) ? style.page : PAGES[style.page] || PAGES.A4;
  const D = new Doc({ w: W, h: H, title: (name || "Cover") + " - Cover letter" });
  const F = new Flow(D, { mt: 64, mb: 60 }); const x = 66, w = W - 132, s = 11;
  if (name) { F.para([{ t: name, b: true }], { family: fam, size: 16, x, w, color: style.nameColor || "#111111" }); F.space(14); }
  for (const p of String(text || "").split(/\n{2,}/)) { for (const ln of p.split("\n")) F.para([{ t: ln }], { family: fam, size: s, lead: s * 1.38, x, w, color: "#1a1a1a" }); F.space(s * 0.8); }
  return D;
}
return { render, originalTemplate, letterPdf, mmyyyy, contactItems, PAGES };
})();
