#!/usr/bin/env python3
"""Builds the static pages (pricing, privacy, terms, about, contact, 404) and syncs the shared header/footer
into site/index.html (between <!--HEADER-->..<!--/HEADER--> and <!--FOOTER-->..<!--/FOOTER-->).
Run: python3 build_pages.py   (then the usual worker build + publish, see README)"""
import os, re
D = os.path.dirname(os.path.abspath(__file__)); S = os.path.join(D, "site")
HEADER = open(os.path.join(D, "partials_header.html")).read()
FOOTER = open(os.path.join(D, "partials_footer.html")).read()
SITE = "https://fitwise.sites.tab.bot"

def page(path, title, desc, body, extra_head="", scripts=""):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{SITE}{path}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Fitwise">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}">
<meta property="og:url" content="{SITE}{path}"><meta property="og:image" content="{SITE}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b6b58">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
<link rel="stylesheet" href="/v5.css">{extra_head}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{HEADER}
<main id="main">
{body}
</main>
{FOOTER}
{scripts}
</body>
</html>
"""

DIALOGS = open(os.path.join(D, "partials_dialogs.html")).read()

PRICING = """<section class="phero"><div class="wrap">
<p class="eyebrow">Pricing</p>
<h1>Free to try. Pay only for extras.</h1>
<p class="lead">Tailoring your CV in its own format is free. Extra country formats and full cover letters use prepaid credits: no subscription, nothing renews, credits don't expire.</p>
<div class="notice"><b>Pre-launch: 1 free tailoring per person</b> (one per email and per browser).</div>
<div class="notice"><b>Payments aren't live yet.</b> Credit packs open soon. Until then, "Buy credits" adds you to the early-access list and no payment is taken.</div>
</div></section>
<section class="pricing wrap" id="plans">
  <div class="plans">
    <div class="plan"><h2 class="h3">Free</h2><p class="price">$0</p><ul>
      <li>Your CV tailored to every job, in your own format</li><li>Word file edited in place, or your PDF rebuilt in its layout; download both free</li><li>Match score, keywords you have and keywords you lack</li><li>Free watermarked previews of 2 local formats</li><li>Cover letter preview</li><li><b>Pre-launch: 1 free tailoring per person</b></li></ul><a class="btn ghost" href="/tailor">Start free</a></div>
    <div class="plan hot"><span class="tag">Prepaid credits</span><h2 class="h3">Credits</h2><p class="price">$0.50<small> / credit</small></p><ul>
      <li>Extra location format download: 1 credit</li><li>Both formats for a job: 2 credits ($1)</li><li>Full cover letter for a job: 1 credit</li><li>US résumé, UK CV, Europass-style, DACH/NL tabular</li><li>Re-download the same job free</li></ul>
      <div class="packs"><span><b>Starter</b> 10 credits · $5</span><span><b>Plus</b> 30 credits · $12</span><span><b>Power</b> 70 credits · $25</span></div>
      <button class="btn" data-buy>Buy credits (opening soon)</button></div>
    <div class="plan"><span class="tag soon">Coming soon</span><h2 class="h3">Autopilot</h2><p class="price">from €1.50<small> · 10 jobs</small></p><ul>
      <li>Daily job search matched to your CV</li><li>A tailored CV for each job</li><li>Applications on supported job sites</li><li>Tracker + a "needs you" list for captchas and questions</li><li>Up to 50 applications a day; bundles valid 90 days</li></ul>
      <div class="packs bundles"><button class="pk" data-plan="autopilot" data-bundle="a10"><b>10 jobs</b> €1.50</button><button class="pk" data-plan="autopilot" data-bundle="a100"><b>100 jobs</b> €9.50</button><button class="pk" data-plan="autopilot" data-bundle="a1000"><b>1,000 jobs</b> €65</button></div>
      <button class="btn ghost" data-plan="autopilot">Join the waitlist</button><p class="small muted">Planned prices. Not available yet; nothing is charged.</p></div>
  </div>
</section>
<section class="wrap narrow">
<h2>What things cost, by example</h2>
<div class="tbl" role="region" aria-label="Cost examples" tabindex="0"><table>
<thead><tr><th>You want</th><th>Credits</th><th>Cost</th></tr></thead>
<tbody>
<tr><td>Your own CV tailored to a job, Word + PDF</td><td>0</td><td>Free (pre-launch: 1 per person)</td></tr>
<tr><td>Match score, keywords, format previews</td><td>0</td><td>Free</td></tr>
<tr><td>A UK CV version of it, as PDF</td><td>1</td><td>$0.50</td></tr>
<tr><td>Both local formats for one job</td><td>2</td><td>$1.00</td></tr>
<tr><td>The full cover letter for one job</td><td>1</td><td>$0.50</td></tr>
<tr><td>Downloading the same file again</td><td>0</td><td>Free</td></tr>
</tbody></table></div>
<p class="small muted">Dollar amounts are per credit when bought in the Starter pack. Bigger packs cost less per credit.</p>
</section>
<section class="faq wrap narrow">
<h2>Pricing questions</h2>
<details><summary>Is there a subscription?</summary><p>No. Everything is prepaid. Nothing renews and nothing is charged automatically.</p></details>
<details><summary>Do credits expire?</summary><p>No. Credits stay on your email until you use them.</p></details>
<details><summary>Do I need an account?</summary><p>No account or password. Your email keeps your credits and lets you re-download a paid file.</p></details>
<details><summary>Can I pay today?</summary><p>Not yet. Card payments open soon. Join the early-access list and we'll email you when they open. Nothing is charged today.</p></details>
<details><summary>What is Autopilot?</summary><p>A planned feature that finds matching jobs daily, tailors your CV for each and applies on supported job sites, with a tracker. It is not available yet. The prices shown are planned; join the waitlist to hear when it opens.</p></details>
</section>
<section class="ctaband"><div class="wrap center"><h2>Try it on your next application</h2><p class="muted">Free to try: 1 tailoring per person during pre-launch. No account, no card.</p><a class="btn" href="/tailor">Tailor my CV free</a></div></section>
""" + DIALOGS

PRIVACY = """<article class="wrap prose">
<p class="eyebrow">Legal</p>
<h1>Privacy policy</h1>
<p class="muted">Last updated: 1 November 2026</p>
<p>This page explains what Fitwise collects when you use it, why, how long it's kept, and how to have it deleted. It describes how the service actually works today.</p>
<h2>In short</h2>
<ul>
<li>To use the app pages (jobs, job pages, the tailoring tool, events, pricing) you <b>sign in with Google</b>. We store your Google account ID, <b>email and name</b> to create your free account.</li>
<li>The <b>CV you tailor</b> (the file you upload, or the text you paste) is <b>stored on our server for 90 days</b>, then deleted automatically. You can delete it, or your whole account, any time on your <a href="/account">Your data</a> page. The job ad text is not saved.</li>
<li>We keep <b>first-party usage statistics</b>: which pages you open, how you arrived, your device type and actions such as Apply clicks and tailorings. No third-party analytics or advertising trackers.</li>
<li>We keep your <b>email</b>, your <b>credit balance</b> and a small record of each tailoring (job title and company, plus a fingerprint of the result) so that a paid download matches what you previewed.</li>
<li>The generated <b>cover letter</b> is kept for <b>14 days</b> so you can unlock it, then deleted.</li>
<li>Tailoring runs on our own rules engine. Your text is <b>not sent to any AI service</b> today.</li>
<li>No advertising trackers. We don't sell or share your data.</li>
</ul>
<h2>What we collect and why</h2>
<table class="ptbl"><thead><tr><th>Data</th><th>Why</th><th>How long</th></tr></thead><tbody>
<tr><td>Job ad text</td><td>To create your tailored CV, match score and cover letter</td><td>Not stored. Used only while your request runs.</td></tr>
<tr><td>The CV you tailor: the file you upload (PDF, Word or text) or the text you paste, with its file name, size, upload time and the job it was tailored for</td><td>Your file is read in your browser to keep your layout. After a tailoring, a copy is stored so there is a record of what was tailored, so we can help you if something went wrong, and to improve Fitwise. Only the Fitwise team can open it; it is never shown to other users or shared.</td><td>90 days, then deleted automatically. Delete it sooner on your <a href="/account">Your data</a> page.</td></tr>
<tr><td>Email address</td><td>To link your credits and results to you, and to email you if you join a waitlist or the daily jobs list</td><td>Until you ask us to delete it</td></tr>
<tr><td>Tailoring record: job title and company, a random ID, a fingerprint (hash) of the result, date</td><td>So a paid download matches the preview, and re-downloads stay free</td><td>Until you ask us to delete it</td></tr>
<tr><td>Generated cover letter</td><td>So you can unlock the full letter later</td><td>14 days, then deleted</td></tr>
<tr><td>Credit balance and history</td><td>To know how many credits you have</td><td>Until you ask us to delete it</td></tr>
<tr><td>Daily usage counters (per email, per browser, and a shortened one-way hash of your IP address)</td><td>Fair-use limits and abuse prevention</td><td>About 2 days</td></tr>
<tr><td>Pre-launch counter (one-way hash of your email, your Google account ID, and the random browser ID)</td><td>To apply the 1-free-tailoring pre-launch limit</td><td>Until launch, or deletion on request</td></tr>
<tr><td>A random browser ID in your browser's local storage, and your email if you entered it</td><td>To apply fair-use limits and prefill your email next time</td><td>Until you clear your browser data</td></tr>
<tr><td>Google sign-in: your Google account ID, email, name and profile-picture link, sign-up date, last sign-in and number of sign-ins</td><td>To create your free Fitwise account. Sign-in is needed for the jobs list, job pages, the tailoring tool, Conferences &amp; Workshops and pricing.</td><td>Until you delete your account or ask us to</td></tr>
<tr><td>Usage statistics (first-party): pages you open and when, the referring site, UTM campaign tags in the link, device type, operating system and browser (read from your browser's user agent), your country (looked up from your connection; the IP address itself is not stored), and actions: sign-in started/completed/failed, job viewed, Apply clicked (which job), tailoring started/finished, downloads, cover letters, sign-out. Linked to your account once you sign in.</td><td>To understand how people find and use Fitwise and to improve it. Recorded on our own server; no third-party analytics.</td><td>Detailed records 90 days, then only daily totals without any personal link</td></tr>
<tr><td>A visitor cookie (a random ID, fw_vid)</td><td>To count visits and link the visits before sign-in to your account</td><td>1 year</td></tr>
<tr><td>A sign-in cookie (random session token)</td><td>To keep you signed in</td><td>30 days, or until you sign out</td></tr>
<tr><td>Messages you send through the contact form</td><td>To answer you</td><td>Until handled, then deleted on request</td></tr>
<tr><td>Email update list (closed; no new sign-ups are taken): your email, the page you signed up on and the date</td><td>To send the one update email you asked for</td><td>Until you ask us to remove it</td></tr>
</tbody></table>
<h2>Where it's stored</h2>
<p>Fitwise runs on Cloudflare (Workers and a D1 database). Data is processed and stored on Cloudflare's network. Job pages you link to are fetched from the job site to read the ad.</p>
<h2>AI processing</h2>
<p>Today, Fitwise does not send your CV to any AI provider. If that changes, we'll update this page first and say so in the tool before your text is sent.</p>
<h2>Payments</h2>
<p>Payments are not live yet. When they open, card details will be handled by the payment provider and never stored by Fitwise.</p>
<h2>Cookies</h2>
<p>Fitwise sets no advertising cookies and uses no third-party analytics. It sets two first-party cookies: a random visitor ID (fw_vid, 1 year) for its own usage statistics, and, when you sign in with Google, a sign-in cookie (a random token, no personal data in it, 30 days). It also uses your browser's local storage for the random browser ID and your email, as described above. Google's sign-in button is loaded from Google and follows <a href="https://policies.google.com/privacy" rel="noopener">Google's privacy policy</a>.</p>
<h2>Your rights</h2>
<p>On your <a href="/account">Your data</a> page (after sign-in) you can delete your stored CVs, or delete your account and everything linked to it (stored CVs, credits and history, tailoring records, cover letters, usage records), at any time. You can also ask for a copy of your data, a correction, or deletion from the <a href="/contact">contact page</a> with the email you used. We delete it and confirm. If you're in the EU or UK, you also have the right to complain to your data protection authority.</p>
<h2>Children</h2>
<p>Fitwise is meant for job seekers aged 16 and over.</p>
<h2>Changes</h2>
<p>If this policy changes, the date at the top changes too. Material changes will be announced on the site.</p>
</article>"""

TERMS = """<article class="wrap prose">
<p class="eyebrow">Legal</p>
<h1>Terms of use</h1>
<p class="muted">Last updated: 1 November 2026</p>
<p>Fitwise is an early-access service. By using it you agree to these terms. The legal entity that operates Fitwise will be named on this page before paid credit packs open.</p>
<h2>What Fitwise does</h2>
<p>Fitwise reorders the content of your CV to match a job ad, shows a match score and keywords, writes a cover letter draft from your CV, and offers your CV in other country formats. It works with what is already in your CV; it doesn't add employers, titles, dates, skills or numbers.</p>
<h2>Your responsibilities</h2>
<ul>
<li>Only upload a CV that is yours, or that you have permission to use.</li>
<li>Check every result before you send it. You are responsible for what you submit to employers.</li>
<li>Don't misuse the service: no automated bulk use beyond the fair-use limits, no attempts to break or overload it.</li>
</ul>
<h2>No guarantees</h2>
<p>A match score is an estimate based on keywords and wording. Fitwise does not guarantee interviews, offers or how any employer or applicant tracking system will treat your CV. The service is provided "as is" during early access and may change or be unavailable at times.</p>
<h2>Free use and credits</h2>
<p>Tailoring in your own format is free to try. During pre-launch each person gets 1 free tailoring (counted per email and per browser); after launch a fair-use limit applies. Extra formats and full cover letters use prepaid credits. Credit payments are not live yet; when they open, prices are shown before you pay, credits don't expire, and nothing renews automatically.</p>
<h2>Daily jobs list</h2>
<p>The jobs on the <a href="/jobs">daily jobs page</a> are collected from public company career pages and job boards. Fitwise is not the employer and is not affiliated with them. "Visa sponsorship ✅" means the ad mentions visa or relocation support, or (in the Netherlands) the employer is on the IND public register of recognised sponsors; always confirm with the employer.</p>
<h2>Your content</h2>
<p>Your CV stays yours. You give Fitwise permission to process it only to produce your results. See the <a href="/privacy">privacy policy</a> for what is kept.</p>
<h2>Liability</h2>
<p>To the extent the law allows, Fitwise is not liable for indirect losses or for decisions made by employers. Nothing in these terms limits rights you have under consumer law.</p>
<h2>Contact</h2>
<p>Questions about these terms: <a href="/contact">contact us</a>.</p>
</article>"""

ABOUT = """<article class="wrap prose">
<p class="eyebrow">About</p>
<h1>Why Fitwise exists</h1>
<p class="lead">Recruiters and applicant tracking systems look for the words in the job ad. Most people send the same CV everywhere, and many CV tools "fix" that by inventing skills. Fitwise does the opposite.</p>
<h2>What we believe</h2>
<ul>
<li><b>Your CV, your format.</b> You spent time on your layout. Fitwise keeps it: your Word file is edited in place, your PDF is rebuilt in the same style.</li>
<li><b>Nothing made up.</b> Fitwise reorders what you already wrote so the most relevant experience comes first. Keywords you don't have are shown to you, never slipped in.</li>
<li><b>Fair pricing.</b> Tailoring in your own format is free to try (1 per person during pre-launch). Extras are prepaid, with no subscription.</li>
<li><b>Built for applying abroad.</b> One CV can become a US résumé, a UK CV, a Europass-style CV or a Dutch/German tabular CV. The <a href="/jobs">daily jobs list</a> shows English-speaking tech jobs in Europe, visa sponsorship first.</li>
</ul>
<h2>Where we are</h2>
<p>Fitwise is in early access. Tailoring, match score, keywords, formats and previews work today. Card payments and Autopilot are coming soon. Feedback shapes what we build next: <a href="/contact">tell us what you need</a>.</p>
<p><a class="btn" href="/tailor">Tailor my CV free</a></p>
</article>"""

CONTACT = """<section class="wrap narrow prose">
<p class="eyebrow">Contact</p>
<h1>Get in touch</h1>
<p class="lead">Questions, feedback, a bug, or a data request (copy or deletion)? Send a message and the Fitwise team will reply by email.</p>
<form id="cf" class="cform" novalidate>
<label for="cname">Your name <span class="muted">(optional)</span></label><input id="cname" autocomplete="name" maxlength="80">
<label for="cemail">Your email</label><input id="cemail" type="email" autocomplete="email" required maxlength="190">
<label for="ctopic">Topic</label><select id="ctopic"><option>Question</option><option>Feedback</option><option>Bug report</option><option>Data request (copy or deletion)</option><option>Other</option></select>
<label for="cmsg">Message</label><textarea id="cmsg" rows="6" required maxlength="4000"></textarea>
<p class="err" id="cerr" role="alert"></p>
<button class="btn" id="cgo">Send message</button>
</form>
<div id="cok" class="notice ok" hidden role="status"><b>Thanks, your message was received.</b> We'll reply to <span id="cokmail"></span>.</div>
<p class="small muted">For deletion requests, use the email address you used on Fitwise.</p>
</section>"""

NOTFOUND = """<section class="wrap narrow center nf"><p class="eyebrow">404</p><h1>This page doesn't exist</h1><p class="muted">The link may be old or mistyped.</p><p><a class="btn" href="/">Go to the home page</a> <a class="btn ghost" href="/jobs">See today's jobs</a></p></section>"""

PAGES_JS = '<script src="/pages.js" defer></script>'
out = {
 # pricing.html is built by build_front.py (Build 1 revamp)
 # "pricing.html": page("/pricing", "Pricing · Fitwise", "Try Fitwise free (pre-launch: 1 tailoring per person). Prepaid credits for extra formats and cover letters: 10 for $5. No subscription.", PRICING, scripts=PAGES_JS),
 "privacy.html": page("/privacy", "Privacy policy · Fitwise", "What Fitwise collects, why, how long it is kept and how to delete it.", PRIVACY),
 "terms.html": page("/terms", "Terms of use · Fitwise", "The terms for using Fitwise during early access.", TERMS),
 "about.html": page("/about", "About · Fitwise", "Fitwise tailors your own CV to each job without inventing anything.", ABOUT),
 "contact.html": page("/contact", "Contact · Fitwise", "Questions, feedback or a data request: contact the Fitwise team.", CONTACT, scripts=PAGES_JS),
 "notfound.html": page("/notfound", "Page not found · Fitwise", "This page doesn't exist.", NOTFOUND),
}

# ---- free checklists (3 Nov 2026, Suresh "yes all" WhatsApp 9:20 PM): public pages with the course launch list box
CL_CSS = '\n<style>\n.ckl{max-width:720px}\n.ckl h1{font-size:clamp(1.6rem,6vw,2.3rem);line-height:1.2;margin:.2em 0 .3em}\n.ckl .lead{font-size:1.05rem}\n.ckl ol.cks{list-style:none;padding:0;margin:1.2rem 0;counter-reset:ck}\n.ckl ol.cks>li{counter-increment:ck;position:relative;background:#fff;border:1px solid #e3e8e6;border-radius:12px;padding:14px 14px 14px 52px;margin:0 0 10px;line-height:1.5}\n.ckl ol.cks>li::before{content:counter(ck);position:absolute;left:14px;top:13px;width:26px;height:26px;border-radius:50%;background:#0b6b58;color:#fff;font-weight:700;font-size:.85rem;display:flex;align-items:center;justify-content:center}\n.ckl ol.cks>li b{display:block;margin-bottom:2px}\n.ckl .box{background:#f3f8f6;border:1px solid #d6e7e1;border-radius:12px;padding:14px 16px;margin:1rem 0}\n.ckl .score{font-size:1.15rem;font-weight:700}\n.ckl pre{background:#0f1f1b;color:#e8f3ef;border-radius:12px;padding:14px;overflow-x:auto;font-size:.85rem;line-height:1.5;white-space:pre-wrap;word-break:break-word}\n.ckl .copy{margin:-4px 0 12px}\n.nfy{background:#0b6b58;color:#fff;border-radius:16px;padding:20px 18px;margin:1.6rem 0}\n.nfy h2{color:#fff;margin:0 0 6px;font-size:1.25rem}\n.nfy p{color:#e3f2ed;margin:0 0 12px}\n.nfy form{display:flex;gap:8px;flex-wrap:wrap}\n.nfy input[type=email]{flex:1 1 220px;min-width:0;font-size:16px;padding:12px;border-radius:10px;border:0}\n.nfy button{flex:0 0 auto;font-size:16px;padding:12px 18px;border-radius:10px;border:0;background:#fff;color:#0b6b58;font-weight:700;cursor:pointer}\n.nfy .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}\n.nfy .msg{margin:10px 0 0;font-weight:600;color:#fff}\n.nfy small{display:block;margin-top:10px;color:#cfe7df}\n</style>'
CHECKLIST = '<article class="wrap prose ckl">\n<p class="eyebrow">Free checklist</p>\n<h1>The 10-point QA CV check (free)</h1>\n<p class="lead"><i>Run your CV through these 10 checks before every application. Score 1 point per pass. Aim for 10/10.</i></p>\n<ol class="cks">\n<li><b>The text copies out clean.</b> Open your PDF, select all, paste into a plain text editor. Your name comes first and the sections read top to bottom in order. Missing or jumbled text = the system sees the same mess.</li>\n<li><b>One column, nothing hidden.</b> No tables, text boxes, icons, photos or skill bars. Nothing important in the header or footer, since many systems skip them.</li>\n<li><b>Standard headings.</b> Summary, Experience, Skills, Education, Certifications. "My Journey" or "Toolbox" can get missed.</li>\n<li><b>Contact details in the body text.</b> Name, email, phone, city, LinkedIn URL, on one line under your name. Work-permit details: answer them in the application form, where they\'re asked directly.</li>\n<li><b>Your headline mirrors the job title.</b> If the ad says "Senior QA Engineer" and that is what you are, your summary line says "Senior QA Engineer", not "Quality Enthusiast".</li>\n<li><b>The must-have keywords are there.</b> List the tools and skills the ad repeats (Playwright, Cypress, Postman, API testing, CI/CD, Jira, test strategy...). Cover at least 8 in 10 of the ones you really have, spelled the way the ad spells them. Never add one you can\'t discuss in an interview.</li>\n<li><b>Dates in one format.</b> "Mar 2024 – Present" on every role, current role clearly marked, and no overlaps you can\'t explain.</li>\n<li><b>Zero spelling mistakes.</b> Run a spellcheck, then read page 1 out loud. Pick UK or US spelling and stick with it (organise vs organize).</li>\n<li><b>Two pages max, a standard font, a clear file name.</b> Calibri, Arial or similar. File name: FirstName-LastName_Company_Role.pdf.</li>\n<li><b>Every line is true and defensible.</b> Each employer, date, number and certificate matches your real history. If you can\'t talk about it for two minutes, cut it.</li>\n</ol>\n<div class="box"><b>QA bonus:</b> say <i>what</i> you tested (payments, mobile, data, LLM features), not only <i>how</i>.</div>\n<p class="score">Your score: ___ / 10</p>\n<p>Tailoring checks 5 and 6 for every job is the slow part. <b>Fitwise</b> reorders your own CV for each job and shows the keywords you\'re missing, without adding anything you didn\'t write. Free to try:</p>\n<p><a class="btn" href="/tailor">Tailor my CV free</a></p>\n<p class="small muted">More for QA engineers: <a href="/agent-checklist">12 checks for agent-written tests</a> · <a href="/jobs">today\'s English-speaking tech jobs in Europe</a></p>\n</article>'
AGENT = '<article class="wrap prose ckl">\n<p class="eyebrow">Free checklist</p>\n<h1>Reviewing agent-written tests: 12 checks + a starter AGENTS.md (free)</h1>\n<p class="lead"><i>For QA engineers whose coding agent now writes the Playwright tests.</i></p>\n<h2>Before you trust a green run</h2>\n<ol class="cks">\n<li>Every test traces to a rule in the story, spec or acceptance criteria. No rule, no test.</li>\n<li>Assertions check behaviour (totals, states, messages), not only "element is visible".</li>\n<li>No assertion was weakened, skipped or deleted to make a run pass. Check the diff, not the result.</li>\n<li>No hard waits (<code>waitForTimeout</code>) and no blind retries hiding a flaky flow.</li>\n<li>Locators are user-facing (<code>getByRole</code>, <code>getByLabel</code>) rather than brittle CSS chains.</li>\n<li>Test data is synthetic. No real customer data, tokens or secrets in the repo.</li>\n<li>Negative paths exist: invalid input, empty states, permissions, errors.</li>\n<li>Break the feature on purpose: the test goes red. If it stays green, it isn\'t testing anything.</li>\n<li>Tests are independent: run one alone, run them in random order.</li>\n<li>Names say what is being proven ("rejects expired card"), not "test1".</li>\n<li>Nothing changed outside the test folder (config, CI, secrets) without a human OK.</li>\n<li>A human makes the release call. The agent\'s report is input, not the decision.</li>\n</ol>\n<h2>Starter AGENTS.md (drop it in your repo root)</h2>\n<pre id="agentsmd"># House rules for test agents\n1. Never change or remove an assertion to make a failing test pass. Report the failure.\n2. Only synthetic test data. Never real customer data, tokens or secrets.\n3. Every test names the rule or acceptance criterion it covers.\n4. No hard waits. Use Playwright\'s auto-waiting and web-first assertions.\n5. Prefer getByRole / getByLabel / getByTestId locators.\n6. Ask before touching config, CI pipelines, secrets or anything outside /tests.\n7. When a test fails, report: what failed, the likely cause, and whether it is the test or the product.</pre>\n<p class="copy"><button class="btn ghost sm" type="button" data-copy="agentsmd">Copy AGENTS.md</button></p>\n<p>Follow <a href="https://www.linkedin.com/company/jobhuntos/" rel="noopener">Your Job Buddy on LinkedIn</a> for more on QA careers and agentic test automation.</p>\n<p class="small muted">Also free: <a href="/checklist">the 10-point QA CV check</a></p>\n</article>'
NJS_C = '<script>(function(){document.querySelectorAll("[data-copy]").forEach(function(c){c.addEventListener("click",function(){var t=document.getElementById(c.getAttribute("data-copy")).innerText;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){c.textContent="Copied"},function(){c.textContent="Select and copy"})})})})();</script>'  # 4 Nov 2026: launch-list form removed (courses parked); copy buttons only
NJS_A = NJS_C
out["checklist.html"] = page("/checklist", "The 10-point QA CV check (free) · Fitwise", "Run your QA CV through these 10 checks before every application. Score 1 point per pass. Aim for 10/10.", CHECKLIST, extra_head=CL_CSS, scripts=NJS_C)
out["agent-checklist.html"] = page("/agent-checklist", "Reviewing agent-written tests: 12 checks + a starter AGENTS.md · Fitwise", "For QA engineers whose coding agent now writes the Playwright tests: 12 checks before you trust a green run, plus a starter AGENTS.md.", AGENT, extra_head=CL_CSS, scripts=NJS_A)
# ---- Courses tab (3 Nov 2026, Suresh WhatsApp 9:33 PM): Udemy-style grid + course pages, see build_courses.py
# exec(open(os.path.join(D, "build_courses.py")).read())  # 4 Nov 2026: Courses removed on Suresh's order; pages parked in _parked_courses/

# ---- /tailor: the tool on its own page (v4). Tool markup lives in partials_tool.html, its dialogs in partials_tooldialogs.html
TOOL = open(os.path.join(D, "partials_tool.html")).read().replace("<h2>Tailor your CV</h2>", "", 1)
TOOLDLG = open(os.path.join(D, "partials_tooldialogs.html")).read()
TAILOR = """<section class="tintro"><div class="wrap narrow center">
<h1>Tailor your CV to a job</h1>
<p class="muted">Upload your CV, add the job ad, and get your tailored CV with a match score. About 30 seconds.</p>
<ol class="stepper" id="stepper" aria-label="Progress"><li id="st1" class="on"><b>1</b>Your CV</li><li id="st2"><b>2</b>The job</li><li id="st3"><b>3</b>Your result</li></ol>
</div></section>
""" + TOOL + TOOLDLG
TAILOR_JS = """<script src="/docmodel.js" defer></script>
<script src="/cvpdf.js" defer></script>
<script src="/render.js" defer></script>
<script src="/extract.js" defer></script>
<script src="/app.js" defer></script>
<script>(function(){var g=function(i){return document.getElementById(i)};function u(){var cv=(g("cv").value||"").trim().length>80,jd=(g("jd").value||"").trim().length>80,out=!g("out").hidden;g("st1").className=cv?"done":"on";g("st2").className=jd?"done":(cv?"on":"");g("st3").className=out?"done":(cv&&jd?"on":"")}
document.addEventListener("DOMContentLoaded",function(){["cv","jd"].forEach(function(i){g(i).addEventListener("input",u)});new MutationObserver(u).observe(g("out"),{attributes:true});new MutationObserver(u).observe(g("cvhint"),{childList:true,subtree:true,characterData:true});new MutationObserver(u).observe(g("jdhint"),{childList:true,subtree:true,characterData:true});setInterval(u,1500);u()})})();</script>"""
out["tailor.html"] = page("/tailor", "Tailor your CV to a job · Fitwise", "Upload your CV and a job ad. Get your CV back in its own format with the most relevant experience first, a match score and missing keywords. Nothing invented.", TAILOR, scripts=TAILOR_JS)
for name, html in out.items():
    open(os.path.join(S, name), "w").write(html)
# sync header/footer into index.html
ip = os.path.join(S, "index.html"); h = open(ip).read()
h = re.sub(r"<!--HEADER-->.*?<!--/HEADER-->", lambda m: "<!--HEADER-->\n" + HEADER + "\n<!--/HEADER-->", h, flags=re.S)
h = re.sub(r"<!--FOOTER-->.*?<!--/FOOTER-->", lambda m: "<!--FOOTER-->\n" + FOOTER + "\n<!--/FOOTER-->", h, flags=re.S)
open(ip, "w").write(h)
import json as _j
open(os.path.join(D, "partials.js"), "w").write("const SITE_HEADER = " + _j.dumps(HEADER) + ";\nconst SITE_FOOTER = " + _j.dumps(FOOTER) + ";\n")
print("built", ", ".join(out), "+ index.html header/footer")
