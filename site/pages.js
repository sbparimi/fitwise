// Small script for pricing + contact pages (the home page uses app.js)
(function () {
  const $ = id => document.getElementById(id);
  const post = async (p, b) => { const r = await fetch(p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }); let j = {}; try { j = await r.json(); } catch {} return { ok: r.ok, j }; };
  const saved = (() => { try { return localStorage.getItem("fw_email") || ""; } catch { return ""; } })();
  // early access: credit packs
  if ($("buy")) {
    document.querySelectorAll("[data-buy]").forEach(b => b.onclick = () => { $("buyemail").value = saved; $("buyerr").textContent = ""; $("buyok").hidden = true; $("buyform").hidden = false; $("buyneed").textContent = ""; $("buy").showModal(); });
    $("buygo").onclick = async ev => { ev.preventDefault(); const pack = (document.querySelector('input[name="pack"]:checked') || {}).value || "starter";
      const r = await post("/api/early-access", { email: $("buyemail").value.trim(), plan: "credits", pack });
      if (!r.ok) { $("buyerr").textContent = r.j.error || "Try again."; return; }
      $("buyform").hidden = true; $("buyok").hidden = false; $("buyokmail").textContent = $("buyemail").value.trim(); };
    $("buyclose").onclick = () => $("buy").close(); $("buyclose2").onclick = () => $("buy").close();
  }
  // early access: Autopilot waitlist
  if ($("ea")) {
    const LBL = { a10: "10 jobs", a100: "100 jobs", a1000: "1,000 jobs" }; let bundle = null;
    document.querySelectorAll("[data-plan]").forEach(b => b.onclick = () => { bundle = b.dataset.bundle || null; $("eaplan").textContent = "Autopilot" + (bundle ? " · " + LBL[bundle] : "") + " (coming soon)"; $("eaemail").value = saved; $("eaerr").textContent = ""; $("eaf").hidden = false; $("eaok").hidden = true; $("ea").showModal(); });
    $("eago").onclick = async ev => { ev.preventDefault(); const r = await post("/api/early-access", { email: $("eaemail").value.trim(), plan: "autopilot", bundle });
      if (!r.ok) { $("eaerr").textContent = r.j.error || "Try again."; return; }
      $("eaf").hidden = true; $("eaok").hidden = false; $("eaokmail").textContent = $("eaemail").value.trim(); };
    $("eaclose").onclick = () => $("ea").close(); $("eaclose2").onclick = () => $("ea").close();
  }
  // contact form
  if ($("cf")) {
    if (saved) $("cemail").value = saved;
    $("cf").onsubmit = async ev => { ev.preventDefault(); $("cerr").textContent = "";
      const email = $("cemail").value.trim(), msg = $("cmsg").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { $("cerr").textContent = "Enter a valid email so we can reply."; $("cemail").focus(); return; }
      if (msg.length < 5) { $("cerr").textContent = "Write a short message."; $("cmsg").focus(); return; }
      const b = $("cgo"); b.disabled = true; b.textContent = "Sending…";
      const r = await post("/api/contact", { name: $("cname").value.trim(), email, topic: $("ctopic").value, message: msg }).catch(() => ({ ok: false, j: { error: "Network problem. Please try again." } }));
      b.disabled = false; b.textContent = "Send message";
      if (!r.ok) { $("cerr").textContent = r.j.error || "Couldn't send. Please try again."; return; }
      $("cf").hidden = true; $("cok").hidden = false; $("cokmail").textContent = email; };
  }
})();

// home: today's jobs teaser (top 3 visa-sponsored roles from the live feed)
(function () {
  const ul = document.getElementById("jtlist"); if (!ul) return;
  const esc = s => String(s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const CC = { NL: "Netherlands", DE: "Germany", BE: "Belgium", PT: "Portugal", FR: "France", ES: "Spain", IE: "Ireland", AT: "Austria", CH: "Switzerland", DK: "Denmark", SE: "Sweden", PL: "Poland", LU: "Luxembourg", IT: "Italy", FI: "Finland", NO: "Norway", CZ: "Czechia", GB: "United Kingdom", UK: "United Kingdom" };
  fetch("/api/jobs/teaser").then(r => r.ok ? r.json() : null).then(j => {
    if (!j || !Array.isArray(j.top) || !j.top.length) { ul.remove(); return; }
    ul.innerHTML = j.top.map(x => `<li><div><b>${esc(x.title)}</b><span>${esc(x.company)} · ${esc([x.city, CC[x.country] || x.country].filter(Boolean).join(", "))}</span>${x.visa ? '<em class="vz">Visa sponsorship ✅</em>' : ""}</div><a class="jtt" href="${x.id ? "/j/" + esc(x.id) : "/jobs"}">See job</a></li>`).join("");
    const d = new Date(j.date + "T12:00:00Z");
    const ds = isNaN(d) ? "" : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
    document.getElementById("jtsub").textContent = `${ds ? ds + ": " : ""}${j.count} roles, ${j.visa} with visa sponsorship. Updated every morning, visa-sponsored roles first.`;
    document.getElementById("jtall").textContent = `See all ${j.count} jobs →`;
  }).catch(() => ul.remove());
})();
// close the mobile menu after a tap
document.querySelectorAll(".menu .menupanel a").forEach(a => a.addEventListener("click", () => { const m = a.closest("details"); if (m) m.open = false; }));
