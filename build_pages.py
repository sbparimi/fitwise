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
<p class="muted">Last updated: 22 November 2026</p>
<p>This policy describes how Fitwise handles information when you use the resume builder and ATS-style checker. Fitwise's operator identity and business contact details must be completed in this policy before public commercial launch.</p>
<h2>Resume builder</h2>
<p>The core builder reads PDF, DOCX and TXT files in your browser. Resume editing and autosave use your browser's local storage. Your resume is not uploaded just because you open or edit it. Clearing browser storage or using a different browser/device can remove or make that local copy unavailable.</p>
<h2>ATS-style checker and share links</h2>
<p>The checker analyses the resume text in your browser. If you choose to create a shareable report, Fitwise receives and stores the generated report, the file name and the report date. The resume text and job description are not stored in the shareable report. Shareable reports are retained for up to 30 days and then deleted.</p>
<h2>Optional account and cloud sync</h2>
<p>Account sign-in is optional for the core builder and checker. If you choose to sign in and use cloud sync, Fitwise stores the account identifier and email address, session information, and the resume documents and template settings you choose to sync. Synced content remains until you delete it or request account deletion. The account area provides the available data-management controls.</p>
<h2>Optional AI features</h2>
<p>If an AI enhancement feature is enabled and you choose to use it, the relevant resume text, bullet or job-description excerpt is sent to the AI provider configured for Fitwise so it can return the requested result. The configured provider may process that content under its own terms and privacy policy. The core resume editor and rule-based ATS checks do not require an AI provider.</p>
<h2>Usage and security information</h2>
<p>Fitwise uses first-party operational analytics to understand page visits and product actions. This can include page paths, referring site, campaign parameters, device and browser category, approximate country, and actions such as sign-in or report creation. A random first-party visitor identifier is stored in a cookie. Detailed event records are retained for up to 90 days and may then be kept only as aggregated totals. Fitwise does not use third-party advertising trackers.</p>
<h2>Contact messages</h2>
<p>If you submit the contact form, Fitwise stores the name and email address you provide, the topic and message so the team can respond. Data requests can be submitted through the <a href="/contact">contact page</a>.</p>
<h2>Where information is processed</h2>
<p>The production application uses Cloudflare Workers and a Cloudflare D1 database. If optional AI features are enabled, the configured AI provider also processes the content required for that feature. Depending on the provider and service configuration, processing may occur outside your country or the European Economic Area.</p>
<h2>Retention and deletion</h2>
<ul>
<li>Local resumes: until you delete them or clear your browser storage.</li>
<li>Shareable ATS reports: up to 30 days.</li>
<li>Cloud-synced resumes and account data: until you delete the content or request account deletion.</li>
<li>Detailed first-party analytics: up to 90 days, followed by aggregated totals where applicable.</li>
<li>Contact messages: until the request has been handled and no longer needs to be retained.</li>
</ul>
<p>You can delete local resumes from the builder or dashboard where available. For cloud data, account deletion or a copy/correction request, use the <a href="/contact">contact page</a>. If you are in the EU or UK, you may also have rights to access, rectify, erase, restrict or object to certain processing, and to complain to your data protection authority.</p>
<h2>Cookies and local storage</h2>
<p>Fitwise uses a first-party visitor cookie for its own analytics and a session cookie when you sign in. The builder uses browser local storage for your resumes and settings. Fitwise does not use advertising cookies or third-party analytics cookies.</p>
<h2>Children</h2>
<p>Fitwise is intended for job seekers aged 16 and over.</p>
<h2>Changes</h2>
<p>Material changes to this policy will be reflected here with an updated date.</p>
</article>"""

TERMS = """<article class="wrap prose">
<p class="eyebrow">Legal</p>
<h1>Terms of use</h1>
<p class="muted">Last updated: 22 November 2026</p>
<p>These terms apply when you use Fitwise's resume builder, templates, document exports and ATS-style resume checker.</p>
<h2>What Fitwise does</h2>
<p>Fitwise lets you create and edit a structured resume, preview it in selected templates, export PDF or DOCX files, and run deterministic checks for common resume formatting, structure, readability and job-description keyword issues.</p>
<h2>What the ATS-style score means</h2>
<p>The score is a diagnostic generated by Fitwise's own rules. Fitwise is not certified by, integrated with or endorsed by Workday, Greenhouse, Lever, iCIMS, Taleo or any other applicant tracking system. A score does not guarantee that an employer's system will parse, rank or accept your resume, or that you will receive an interview or job offer.</p>
<h2>Your responsibilities</h2>
<ul>
<li>Only upload or process documents that belong to you or that you have permission to use.</li>
<li>Review every resume and exported document before sending it to an employer.</li>
<li>Check that all personal details, dates, qualifications, skills and achievements are accurate.</li>
<li>Do not misuse the service, attempt to disrupt it or exceed reasonable usage limits.</li>
</ul>
<h2>Your content and storage</h2>
<p>Your resume remains yours. The core builder stores working copies in your browser. If you choose optional cloud sync, your synced resume is stored against your account. If you create an ATS share link, the report and file name are retained for up to 30 days; the resume text and job description are not stored in that report. See the <a href="/privacy">privacy policy</a> for details.</p>
<h2>Availability and liability</h2>
<p>Fitwise is provided on an early-access basis and may change or be unavailable at times. You are responsible for checking the accuracy and suitability of every result. To the extent permitted by law, Fitwise is not liable for indirect losses or employer decisions. Nothing in these terms limits rights you have under applicable consumer law.</p>
<h2>Payments</h2>
<p>Payments are not enabled for the resume builder and ATS-style checker at this time. No payment is taken through the core launch workflows.</p>
<h2>Contact</h2>
<p>Questions about these terms: use the <a href="/contact">contact page</a>.</p>
</article>"""

ABOUT = """<article class="wrap prose">
<p class="eyebrow">About</p>
<h1>Make your resume clearer and easier to improve</h1>
<p class="lead">Fitwise combines a practical resume editor with a transparent, rule-based review. The aim is to help job seekers improve the clarity, structure and relevance of their resumes without inventing experience.</p>
<h2>The core tools</h2>
<ul>
<li><b>Resume Builder.</b> Create or import a resume, edit structured sections, preview 20 templates and export PDF or DOCX.</li>
<li><b>ATS-style Checker.</b> Run 28 deterministic checks for common formatting, structure, readability, impact and keyword issues.</li>
<li><b>Local-first workflow.</b> Your working resume stays in your browser unless you explicitly choose optional cloud sync or an optional AI feature.</li>
</ul>
<h2>Important limitation</h2>
<p>Fitwise's checks are practical diagnostics. They are not integrations, certifications or guarantees for any employer's applicant tracking system.</p>
<p>Feedback and data requests can be sent through the <a href="/contact">contact page</a>.</p>
<p><a class="btn" href="/builder">Build your resume</a> <a class="btn ghost" href="/ats-checker">Check your resume</a></p>
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
