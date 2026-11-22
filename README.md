# Fitwise — ATS-Tested AI Resume Builder, 28-Check ATS Scanner & EU/Remote Job Board

> **Build 1 (22 Nov 2026)** — Complete SaaS frontend & API revamp.

## Hosting Architecture: Production (Cloudflare Worker + D1) vs. Static Preview (Vercel)

- **Production Runtime (Cloudflare Worker + D1):** [`https://fitwise.sites.tab.bot/`](https://fitwise.sites.tab.bot/)
  - Runs the full Worker bundle (`site/worker.mjs`) bound to Cloudflare D1 (`DB`).
  - Powers all server-side endpoints (`/api/*`), D1-backed EU/Remote curated job board (`/jobs`, `/jobs/<date>`, `/j/<id>`, `/j/<id>/go`), daily Your Job Buddy feed pipeline (`jobs_push.mjs`), Google sign-in sessions, saved resumes/scans, admin panel (`/admin`), and the Multi-Provider Free LLM Cascade (`Groq → Cerebras → Google Gemini → Mistral → OpenRouter :free → GitHub Models → built-in deterministic fallback`).
  - **Zero secrets in git:** API keys are configured at runtime via `/admin` and stored in D1 (`app_config`). Local CLI scripts read `ADMIN_SECRET.txt` (gitignored).
- **Static Frontend Preview (Vercel):**
  - `vercel.json` is configured with `{"outputDirectory": "site", "cleanUrls": true}` so the static frontend in `site/` (`/` homepage, `/ats-checker`, `/builder`, `/templates`, `/cover-letter`, `/cover-letter-checker`, `/dashboard`, `/pricing`, `/signin`, `/checklist`, `/agent-checklist`) deploys cleanly on Vercel out of the box.
  - Note: Client-side tools (ATS checker, 20-template builder, PDF/DOCX export, local storage) work directly on the static Vercel preview, while D1-backed routes (`/jobs`, `/j/<id>`, `/api/*`, cloud sync) remain hosted on the live Cloudflare Worker at `https://fitwise.sites.tab.bot/`.

## Build (Build 1)

```sh
./build.sh
```

Builds static pages (`build_pages.py`, `build_front.py`, `build_private.py`), copies shared client modules into `site/`, concatenates and syntax-checks `site/worker.mjs`, and validates all frontend scripts (`site/fw-*.js`).

---

## Historical Architecture & Operations Notes (v2–v4)

# Fitwise (CV-tailor SaaS) - v2, 31 Oct 2026

Live: https://fitwise.sites.tab.bot/   (Cloudflare Worker + D1 store, slug "fitwise")
Separate from all of Suresh's projects; no personal data. Test CVs are fictional (testdata/Marta_Kowalczyk_CV.docx/.pdf, test_cv.txt "Lena Marsh").

## Build + publish
python3 build_pages.py            # static pages + shared header/footer + partials.js
cp docmodel.js cvpdf.js render.js extract.js site/
cat engine.js docmodel.js cvpdf.js render.js formats.js partials.js jobs.js site_routes.js events.js worker_main.js > site/worker.mjs
cd /home/user/tab && node publish-cli.mjs site.publish '{"slug":"fitwise","source_dir":"/home/user/tab/files/saas-cvtailor/site","title":"Fitwise v2"}'
Verify (phone 390x844, live site, fictional CV vs a real Greenhouse job): node verify3.mjs pdf|docx  -> shots/v2/

## What the code does
- extract.js (browser): reads PDF (pdf.js, keeps font size/weight/colour per line) and DOCX (raw XML, paragraph indexes) into lines.
- docmodel.js: parses lines into name/contact, sections (summary, experience, skills, education, certs...), job entries (company, location, dates, title) and bullets; tailors in place (reorder bullets/skills by job relevance, never adds facts).
- DOCX: edited in place inside word/document.xml (styles, fonts, bullets kept) -> Word download + PDF.
- PDF/text: rebuilt "closest match" with the user's section order, heading style, accent colour.
- cvpdf.js/render.js: own PDF writer with embedded Unicode TTF subsets (Liberation/Carlito/Caladea) -> no "?" glyphs; real selectable text.
- formats.js: location formats (US résumé, US modern, UK CV, Europass-style, DACH/NL tabular). Region is read from the CV, user can change it.
  Free preview = server-rendered watermarked PDF without text layer -> rasterised to PNG in the browser (no download).
- Cover letter: generated server-side, only a preview is returned; full text = 1 credit (/api/cover). Each cited achievement names the role it came from.

## Money (placeholder - no payments are taken)
Prepaid only, no subscriptions.
- Free: tailored CV in own format (DOCX+PDF), match score, keywords, previews. Fair use 25/day per email/device, 60/day per network.
- Credits (USD): 1 credit = 1 extra-format download ($0.50), both formats = 2 credits ($1), full cover letter = 1 credit.
  Packs (worker_main.js CREDIT_PACKS + index.html): Starter 10/$5, Plus 30/$12, Power 70/$25. Re-download of the same job is free.
- Autopilot (coming soon, EUR job bundles, worker_main.js AUTOPILOT_BUNDLES + index.html): 10 jobs EUR1.50, 100 EUR9.50, 1000 EUR65 (Suresh asked to halve EUR3/19/129, 31 Oct); cap 50 applications/day; valid 90 days. Waitlist only.
- D1 tables: credits (balance per email hash), credit_ledger (every +/-; ref = jobId:format or cover:jobId -> idempotent), jobs (jobId -> doc hash so a paid download matches the preview).
- "Buy credits" today = early-access email capture (KV ea:credits:<hash>).
- To plug in Stripe: implement PAYMENTS.checkout() in worker_main.js (Checkout Session, mode "payment", metadata {email, pack}),
  set PAYMENTS.live = true, add /api/stripe/webhook that verifies the signature and calls grantCredits(env, email, CREDIT_PACKS[pack].credits, "purchase", session.id).
  Needs a Stripe account in Suresh's or his company's name + STRIPE_SECRET / webhook secret as Worker secrets.

## Demo clips
site/demo/<feature>.mp4 + .jpg poster: screen captures of the live UI (fictional CV), stitched with ffmpeg. Autopilot clip is from site/autopilot-preview.html (sample data, labelled "Preview - coming soon").

## Admin (key in ADMIN_SECRET.txt; only its SHA-256 is in the code)
- Stats: curl -s https://fitwise.sites.tab.bot/api/admin/stats -H "x-admin-key: $(cat ADMIN_SECRET.txt)"
- Grant credits: POST /api/admin/credits {"email","delta","note"}
- Purge a test email (credits, ledger, jobs, KV, covers): POST /api/admin/purge {"email"}
- AI mode on (key stays server-side): POST /api/admin/ai {"provider":"openai","model":"gpt-4.1-mini","key":"sk-..."}; off: {"clear":true}
  AI output is truth-checked server-side. Measured: ~$0.0019 per tailoring on gpt-4.1-mini. AI mode is OFF today (rules-based tailoring).

Verified 31 Oct 22:40 (live, 390x844): PDF + DOCX uploads, original-format PDF/DOCX download, 2 watermarked previews, 402 -> buy sheet, admin-granted credits -> paid format download + cover unlock, demo clips play. Test rows purged afterwards (reachparimi@gmail.com user row is Suresh's own trial, kept).

## Daily jobs page (added 1 Nov 2026)  https://fitwise.sites.tab.bot/jobs  + archive /jobs/YYYY-MM-DD
Source of the list: the daily Job Hunt OS LinkedIn post (50+ English-speaking tech jobs in Europe, visa sponsorship first).
Code: jobs.js (server-rendered page, filters, admin + subscribe API), site/jobs.css, site/og-jobs.png; app.js reads /?job=<url>&title=&company=&from=jobs
and pre-fills the tailoring tool (auto "Read link"; if the job site blocks reading, it tells the user to open the ad and paste it).
The list lives in D1 (kv rows jobs:feed:<date>, pointer jobs:latest) - NO rebuild or republish is needed for a daily update.

DAILY UPDATE (one command, run by the daily jobs worker after it writes the feed):
    cd /home/user/tab/files/saas-cvtailor && node jobs_push.mjs                 # pushes jobs_feed/latest.json
    node jobs_push.mjs 2026-11-02                                               # or a dated file jobs_feed/2026-11-02.json
    node jobs_push.mjs some/file.json --date 2026-11-02 --window "Posted 28 Oct - 1 Nov"   # any file; --no-latest = archive only
  It POSTs to /api/admin/jobs (key ADMIN_SECRET.txt), then fetches /jobs/<date> and /jobs and checks the count shows (exit 0 = OK, 1 = rejected, 2 = page mismatch).
  Feed: an array, or {date, window, jobs:[...]}; job fields company, title, city, country (code or name), remote ("Remote"/"Hybrid"/"On-site" or bool),
  posted (YYYY-MM-DD), url (employer page), visa_sponsored (bool), visa_evidence (short text, shown under the green check), category.
  Jobs without title/company/http(s) url are dropped (count in "dropped"). Sponsored jobs are listed first, feed order kept within each half.
  Date: --date, else the file's "date", else the date in the file name, else today (Amsterdam). /jobs shows the newest date pushed.
  Other: node jobs_push.mjs --list  (dates, counts, subscribers) · node jobs_push.mjs --delete 2026-11-02
LinkedIn caption link: https://fitwise.sites.tab.bot/jobs (or the dated /jobs/<date> so old posts keep their own list).
Email capture "Get tomorrow's list in your inbox": POST /api/jobs/subscribe stores kv sub:jobs:<sha(email)> {email,country,at}. Sending is NOT built yet
(page says "starting soon"); subscribers: node jobs_push.mjs --list. Admin purge also deletes the sub:jobs row.
Phone check: node verify_jobs.mjs <tag>  -> shots/jobs/<tag>_*.png (390x844, filters, Tailor click-through, subscribe test).
Rules: never show Suresh's name, CV, applied jobs or dashboard data on this page; no invented numbers; free tier stated as on the site (free for every job, fair use 25/day).

## v3 site (1 Nov 2026): pages, nav, trust, SEO
- Shared header/footer: partials_header.html / partials_footer.html. build_pages.py writes pricing/privacy/terms/about/contact/notfound.html,
  syncs them into index.html (<!--HEADER--> / <!--FOOTER--> markers) and writes partials.js (SITE_HEADER/SITE_FOOTER for the jobs page). Edit the partials, never the copies.
- Routes (site_routes.js): /pricing /privacy /terms /about /contact (pretty URLs), /robots.txt, /sitemap.xml (includes /jobs/<date> archive), 404 page from notfound.html.
  DO NOT add a site/404.html: the asset layer then answers browser navigations itself and /jobs (worker-rendered) returns 404 in browsers (seen 1 Nov).
- Contact form: POST /api/contact -> kv contact:<iso>:<id> (8/day per network). Read: curl -s .../api/admin/contact -H "x-admin-key: $(cat ADMIN_SECRET.txt)"; delete: POST {"delete":"contact:..."}.
  Nobody is notified automatically: someone has to read /api/admin/contact (or wire an email provider later). Admin purge also deletes that email's contact messages.
- Housekeeping: expired kv rows (cover letters after 14 days, counters after 2 days) are deleted at most hourly (sweepExpired), so the privacy page's "deleted" is true.
- Tool UX (app.js): file checks (.doc, images, >10 MB, wrong type, >30k chars), step-by-step progress text while tailoring, clearer empty-field errors; ?job= prefill from /jobs.
- Copy rules: describes today's rules engine (reorders, does not reword; AI mode off). (Superseded 1 Nov: Google sign-in is now required, see the last section.) Payments not live: buy buttons = early-access list.
- Phone/desktop shots of every page: node shots_pages.mjs <tag> /,/jobs,/pricing,/privacy,/terms,/about,/contact 4 phone,desk -> shots/v3/

## PRE-LAUNCH LIMIT (Suresh, WhatsApp 7:45 AM 1 Nov 2026, m:473380c7: "In the pre launch limit every user to use only once add a note of it")
- worker_main.js PRELAUNCH_FREE = 1: one free tailoring per person in total, counted per email (kv pl:e:<sha(email)>) AND per browser (kv pl:d:<device id>), no expiry.
  The per-network daily cap (60) and the daily fair-use counters still apply. 2nd try -> HTTP 429 {code:"prelaunch_used"} with the friendly pre-launch message.
- At launch: set PRELAUNCH_FREE = 0 (or a bigger number), rebuild, publish, and remove the pre-launch notes (index.html .plnote/.plnote2, build_pages.py, jobs.js, og.png says "Free to try").
- Admin purge clears pl:e for that email (device counters stay; test devices used: pltest-dev-A/B).
- Notes shown on: tool card (.plnote), result card, home Free plan, /pricing notice + plan + table + CTA, /jobs strip and Fitwise section, Terms and Privacy.

## V4 PROFESSIONAL PASS (Suresh WhatsApp 7:46 AM 1 Nov 2026)
- Home (site/index.html, hand-edited; header/footer synced by build_pages.py) order: hero (CTA "Tailor my CV free" + "See today's jobs") -> real before/after -> how it works -> what you get (4 tiles, inline SVG icons) -> today's jobs teaser (pages.js fetches /api/jobs, top 3, visa first) -> pricing summary (+ pre-launch note) -> privacy & trust -> FAQ -> final CTA -> footer.
- The tool moved to its own page /tailor (generated by build_pages.py from partials_tool.html + partials_tooldialogs.html + app.js; stepper 1-2-3 driven by a small inline script).
  Old links keep working: /?job=...  and /#try are redirected to /tailor by a script in the home <head> (the asset layer serves "/" before the worker, so the worker redirect in site_routes.js only covers non-asset paths).
- jobs.js "Tailor my CV for this job" links now go to /tailor?job=...; nav = Tailor CV, Jobs, Pricing, FAQ + CTA (phone: Jobs + "Start free" + menu).
- index.v3.html.bak = the v3 home with the tool inline, if you need to roll back.
- verify3.mjs now opens /tailor.

## Per-job pages /j/<id> (added 1 Nov 2026, Suresh WhatsApp 8:33 AM m:b026cad6: every job link in the LinkedIn post leads to Fitwise, Apply from there)
- https://fitwise.sites.tab.bot/j/<id>: title, company, city/country, work mode, posted date, visa line ("Visa sponsorship: Yes ✅" + evidence, or "Not stated"),
  big Apply button (label from the URL host: "Apply on LinkedIn" for linkedin.com links, else "Apply on company site"; new tab, rel noopener),
  "Tailor my CV for this job" -> /tailor?job=..., "See all today's jobs" -> /jobs, pre-launch 1-free note. og:title "<Title> at <Company> · <City>". Unknown id -> friendly 404.
- id = 6 base36 chars of sha256(job url). Assigned server-side on every admin jobs push (assignJobIds in jobs.js), stored as kv jobs:id:<id> = {url, date, job};
  the same URL keeps its id on later days; a collision (different URL, same 6 chars) takes the next 6-char slice. Old /j/ links keep working after newer pushes.
- /j/<id>/go: counts a click (kv stat:jgo:<id>) and 302s to the job URL. Both the /j page button and the /jobs card "Apply" go through it; /jobs card titles link to /j/<id>.
- Clicks: /api/admin/stats -> apply_clicks {total, by_job[]}; or GET /api/admin/jobclicks; reset: POST /api/admin/jobclicks {"reset":"all"|"<id>"} (x-admin-key).
- jobs_push.mjs writes jobs_feed/<date>.links.json after every push: [{id, short_url, title, company, city, country, visa_sponsored}] (from the server's answer).
  The LinkedIn post (jobhuntos-marketing/daily-jobs/make_post.py) reads it. Pass --window "posted in the last N days" or the /jobs window line goes blank.
- Evidence "IND recognised sponsor" (with or without "register") now renders as such, not as an "Ad:" quote.

## Conferences & Workshops (/events) behind Google sign-in — added 1 Nov 2026
Suresh (WhatsApp 12:40 PM 1 Nov, m:9ffe3737): move his conferences list to Fitwise as a new tab, visible only after Google sign-in.
- Page: https://fitwise.sites.tab.bot/events (/conferences redirects). Nav + menu + footer link "Conferences & Workshops" (partials_header/footer.html).
- Signed out: header, counts (total / NL / Europe / Online / open speaker calls), 5 blurred placeholder cards (dates and pills only, NO event
  names are sent), and the Google button. Signed in: open-speaker-call strip (soonest deadline first), search, Speaker-call-open chip,
  In person / Virtual chips, region select (NL / NL+Europe / Europe / Online), type, sort, topic chips, month groups, "show more".
- Code: events.js (server: routes, ID-token verification, page HTML) + site/events.js (browser; source copy events_client.js).
- Google: OAuth Web client in Google Cloud project "fitwise" (id gen-lang-client-0858860540, number 1024830327613, owner reachparimi@gmail.com),
  Google Auth Platform: app "Fitwise", External, In production, no logo, no extra scopes (openid/email/profile default), authorised
  domain tab.bot, JS origin https://fitwise.sites.tab.bot, no redirect URIs. Client ID (public) is GOOGLE_CLIENT_ID_DEFAULT in events.js;
  override without a rebuild: POST /api/admin/google {client_id} ({clear:true} resets). The client secret was never read or stored (GIS needs none).
- Sign-in: GIS button (popup) -> POST /api/auth/google {credential} -> RS256 check against Google's JWKS, aud = client id, iss, exp,
  email_verified -> D1 table users (sub, email, name, picture, provider, source, created, last_login, logins) -> session kv sess:<sha(token)>
  (30 days) + cookie fw_sess (HttpOnly, Secure, SameSite=Lax). /api/me, /api/auth/logout.
- Data: kv events:data. GET /api/events needs a session (401 otherwise). There is NO static events JSON in site/.
- Update: run files/job-hunt/workshops/workshops_fetch.py, then `node events_push.mjs` here (strips internal notes, refuses personal identifiers,
  checks /events and that /api/events answers 401). `node events_push.mjs --status` shows what is stored.
- Admin: GET /api/admin/signups (count + list; POST {delete_email} removes one), /api/admin/stats now has google_signups,
  POST /api/admin/test-session -> a 1-hour test cookie (not a signup) for checking the signed-in view.
- Privacy page lists the Google sign-in data and the sign-in cookie (build_pages.py).

## Google sign-in on every app page + analytics + /admin (1 Nov 2026)
Suresh (WhatsApp 1:09 PM 1 Nov, m:61f07e1b): every tab behind Google sign-in, full analytics, admin page for users, payments/billing, uploaded CVs.
- BUILD NOW: `./build.sh` (build_pages.py -> build_private.py -> copies -> cat ... private_pages.js ... worker_main.js gate.js > site/worker.mjs), then publish as above.
  build_private.py MOVES site/tailor.html + site/pricing.html into private_pages.js: the asset layer answers before the Worker, so a gated page
  must not exist as a static file. Never put a gated page back into site/.
- gate.js = the new front door (export default). worker_main.js's old handler is now `FW_MAIN`; gate.js routes to it after its checks.
- PUBLIC: / (static), /privacy, /terms, /about, /contact, /robots.txt, /sitemap.xml, favicon, static files, /api/contact, /api/auth/*, /api/me,
  /api/hit (beacon), /api/jobs/teaser (count + top 3 titles for the home teaser, no URLs), /api/status.
- GATED (no session -> sign-in screen, HTTP 200, header x-fitwise-gate: 1, noindex, private/no-store): /jobs, /jobs/<date>, /j/<id> (teaser: title,
  company, place, visa line; og tags kept for LinkedIn previews), /j/<id>/go (-> 302 to /j/<id>), /tailor (keeps ?job=&title=&company=), /pricing,
  /events (its own blurred teaser), /account. After Google sign-in the page reloads = same path + query (UTM kept).
  APIs return 401 {code:"signin_required"}: /api/jobs, /api/events, /api/tailor, /api/preview, /api/credits(/buy), /api/cover, /api/download,
  /api/fetch-job, /api/early-access, /api/usage, /api/jobs/subscribe, /api/cv, /api/my/*.
- In-app browsers (LinkedIn/Facebook/Instagram/X/TikTok/Android webview, by user agent): the gate shows "Open this page in your browser" with
  steps, Copy link, and on Android an "Open in Chrome" intent link (Google blocks sign-in in embedded browsers).
- The Google account is the account: /api/tailor, /api/credits, /api/cover, /api/download use the session email (the email field is read-only).
  Pre-launch 1 free tailoring is now counted per Google account (kv pl:u:<sub>) AND per email AND per browser (as before).
- x-admin-key header = signed-in admin view of every gated page (used by jobs_push.mjs checks and check_links.mjs).
- Signed-in strip under the header: "Signed in as … · Admin (admins only) · Your data · Sign out". /account: stored CVs (download/delete),
  delete my account (deleteUser: CVs, credits, ledger, tailoring records, covers, events, users row; ust:<sub> ends open sessions).
- ANALYTICS (first-party, D1 table ev, append-only): ts, day (Amsterdam), vid (cookie fw_vid, 1 year), uid (Google sub), type, path, ref (host),
  utm source/medium/campaign, dev/os/br (from UA; in-app named), cc (Cloudflare country; IP not stored), obj (job id etc.), meta.
  Page views come from /fw.js (footer, all pages incl. static ones) -> POST /api/hit. Server events: gate_shown, inapp_hint, signin_ok/
  signin_fail, job_view, apply_click, events_view, tailor_start/done/blocked/error, cv_upload, download, cover_letter, signout, waitlist_join,
  buy_interest, jobs_subscribe. Client events: signin_start (GIS click), signin_fail, open_browser, copy_link.
  Not recorded: bots/scripts (UA list incl. FitwiseCheck), the admin key, admin accounts' own visits. Test sessions are stored with uid test:…
  and excluded from stats; POST /api/admin/purge-test deletes them (+ {vids:[...]}).
  Retention: raw rows 90 days, then rolled up into ev_agg (daily counts by type/path/ref/utm/device/os/browser/country/job) and deleted (gateSweep, hourly).
- CVs: tables cvs + cv_chunks (D1 BLOB, 900 KB chunks, max 10 MB, 20 per user). app.js uploads the CV after a successful tailoring
  (the file, or the pasted text as pasted-cv.txt). Deleted after 90 days (gateSweep). Not stored for admin accounts (Suresh's own CV never stored).
- ADMIN: https://fitwise.sites.tab.bot/admin = admin Google session (allow-list: reachparimi@gmail.com fixed + kv cfg:admins via
  POST /api/admin/admins {add|remove}) or x-admin-key. Everyone else: 404 page; /api/admin/* answers 404 too.
  APIs: overview?days=, users?q=, user?sub= (GET detail; POST {action: grant|reset_free|block|unblock|delete, delta, confirm:<email>}),
  cvs?q=, cv?id=&dl=1 (GET), cv {delete} (POST), billing, content, export/users.csv, export/events.csv?days=, admins, purge-test.
- Test session in a browser: POST /api/admin/test-session {admin:true|false} (x-admin-key) -> login_path (one-time, 5 min) ->
  open S + login_path + "&next=/tailor". node verify_gate.mjs (phone: gate, in-app hint, sign-in return, jobs, events, tailoring, account, 404)
  and node verify_admin.mjs (admin tabs); afterwards POST /api/admin/purge-test. Shots: shots/gate/*.jpg.
- Daily checks: node jobs_push.mjs --check <date>; node check_links.mjs <date> 3 (visitor gate + signed-in Apply button). PROCEDURE.md v3 updated.

## Free checklists + course launch list (3 Nov 2026, Suresh "yes all" WhatsApp 9:20 PM, m:3d8e078d)
- Public pages (no sign-in): https://fitwise.sites.tab.bot/checklist (10-point QA CV check, from jobhuntos-marketing/growth/lead_magnet_ats_checklist.md)
  and https://fitwise.sites.tab.bot/agent-checklist (12 checks for agent-written tests + starter AGENTS.md, from growth/lead_magnet_agent_review_checklist.md).
  Built by build_pages.py (CHECKLIST / AGENT / CL_CSS); routed via SITE_PAGES in site_routes.js; in the sitemap. The LinkedIn Page links them for
  CHECKLIST / AGENT comment replies. Never name PostNL here.
- "Notify me when the course launches" box on both = the Udemy LAUNCH LIST. POST /api/notify {email, src: checklist|agent-checklist, website (honeypot)}
  -> kv notify:course:<sha(email)[:32]> = {email, src, at}; duplicate -> {ok, already}; 10/day per network; analytics event launch_notify.
  Read: curl -s .../api/admin/notify -H "x-admin-key: $(cat ADMIN_SECRET.txt)"   (?format=csv for a CSV)
  Remove one: POST /api/admin/notify {"delete_email":"..."}.  Privacy page lists it.  Tested 3 Nov with zz-test-*@example.com (deleted;
  kv stat:notify counter includes those 3 test sign-ups).  Phone check: node verify_checklists.mjs <outdir>/ (submits zz-test emails; delete them after).
- Copy fix 3 Nov: "while we're in beta" removed everywhere (pre-launch 1-free rule above unchanged).

## Courses tab (3 Nov 2026, Suresh WhatsApp 9:33 PM: "create a tab for courses Just like how udemy display courses in 4 rows ... add notify me")
- Public pages: /courses (Udemy-style card grid: 4/row desktop, 2 tablet, 1 phone) and /courses/<slug> (Udemy-style landing page: dark band, sticky price card
  with launch price + coupon + "Notify me", What you'll learn, Course content accordion with Expand all, Requirements, Description, Who it's for, Instructor).
- Source: build_courses.py (exec'd from build_pages.py; ALL course data + LAUNCH coupon config live there), courses_c1_curriculum.json (course 1 curriculum read
  from the Udemy draft 7406381, 37 lectures / 3h11m), images in site/courses/ (own graphics, 960x540 JPG <50 KB). Nav + footer link "Courses" (partials_*.html).
- Routing: SITE_PAGES has /courses; COURSE_SLUGS in site_routes.js (keep in sync with build_courses.py) -> /courses/<slug> serves courses/<slug>.html, unknown slug 404.
- Prices: course 1 list $19.99 (₹799 in India), launch price $12.99 (₹449 in India), code LAUNCH2026 until 31 Dec 2026 23:59 Amsterdam (Suresh 9:38/9:39 PM).
  3 Nov 2026 23:20: masterclass (course 2) coupon:False, so the LAUNCH2026 box is gone from its card and detail page (Suresh OK, WhatsApp 11:15 PM). Course 1 keeps it.
  Visitors in Asia/Kolkata see ₹ first. After the deadline JS hides the countdown/coupon and shows the list price. Masterclass + planned course: TBA, no numbers.
  Change prices/coupon in ONE place: LAUNCH + the course dict in build_courses.py. Never show ratings, student counts or reviews; never name an employer.
- Notify: POST /api/notify {email, src:"course", course:<slug>} -> same kv record notify:course:<sha(email)>, now with course + courses[] (a 2nd course is appended).
  Admin list shows by_course; CSV has a courses column. Test: node verify_courses.mjs shots/courses/ (desktop+390px shots, submits zz-test-courses@example.com,
  then delete it with POST /api/admin/notify {"delete_email":"zz-test-courses@example.com"}).

## Courses removed 4 Nov 2026 on Suresh's order; parked in _parked_courses/
- Suresh, WhatsApp 5:57 AM 4 Nov 2026 (m:a4c371fe): "For now stop udemy courses on fitwise and remove it from there". Nothing changed on Udemy itself.
- Gone from the public site: nav/footer/mobile-menu "Courses" link (partials_header/footer.html -> partials.js, private_pages.js), "/courses" in SITE_PAGES,
  COURSE_SLUGS = [] (so /courses and /courses/<slug> 404), the course entries in /sitemap.xml, the "Notify me when the course launches" boxes on /checklist and
  /agent-checklist (checklists kept; their script now only runs the copy buttons), and the privacy row now reads "Email update list (closed ...)".
- build_pages.py no longer execs build_courses.py (kept as is). POST /api/notify answers 410 "This sign-up list is closed."; the stored kv notify:course:* records
  are untouched and GET /api/admin/notify still lists them.
- Parked: _parked_courses/courses.html + courses/ (pages + images), src_backup/ (pre-removal sources), README.txt (how to bring it back).
