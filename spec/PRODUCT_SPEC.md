# Fitwise — Product Spec v1 (job-seeker SaaS, hosted outside Tab)

Written 31 Oct 2026. Status: draft for build start 1 Nov 2026.
**Hosting decision (Suresh, 31 Oct 2026 10:21 PM): "For now build everything on Tab."** Phases 1–4 run on Tab: the existing Fitwise site (fitwise.sites.tab.bot, a Cloudflare Worker with D1/KV/R2 stores), Tab mail for emails, Tab browser workers for auto-apply, Tab schedules for the daily rounds. No Neon, Vercel, Resend, Hetzner or Stripe accounts are needed now. Payments stay a placeholder until his Stripe account exists. Moving to his own stack is Phase 5 (§6B, §10).
Scope: everything a job seeker gets from a personal "Job Hunt OS" (daily search across 1,000+ employer sites, a tailored CV per job, auto-apply, tracker with inbox sync, a "needs you" list, digests), rebuilt as a multi-user product with its own accounts, billing and infrastructure.
Prices marked **[vendor page]** were read on the vendor's own page or its search snippet on 31 Oct 2026 (URL given). **[unverified]** means not confirmed on a vendor page. **[estimate]** is our own arithmetic.

---

## 1. Product in one paragraph

Fitwise tailors your CV to every job **without inventing anything**, finds the jobs worth applying to every morning across company career sites in the countries you choose, applies for you where it can do so truthfully, and puts everything it can't finish (a CAPTCHA, an account wall, a question with no honest answer) on one short "Needs you" list with the tailored CV ready. Replies from employers update your tracker automatically.

Positioning line: *"Your job hunt on autopilot. Truthful by design."*

---

## 2. Personas

| Persona | Who | Job to be done | Plan |
|---|---|---|---|
| **Applicant Ana** | Mid/senior professional, 1–3 applications a week, applies by hand | "Make my CV fit this job in 30 s, in my own layout" | Free → Credits |
| **Active Arjun** | Actively searching, 10–30 applications a week, multiple countries | "Find the right jobs daily, tailor each, track replies" | Credits (search) |
| **Busy Bea** | Employed or overloaded, wants volume without the grind | "Apply for me every day, only ask me when you must" | Autopilot |
| **Migrant Mo** | On a work permit / needs sponsorship, multi-country | "Only show jobs I can legally take, answer work-authorisation questions truthfully" | Credits + job bundle |
| **Coach Chris** | Career coach, partner or friend helping 1–5 people | "Run searches for someone else, search-only, digest by email" | Credits (one saved search per person) |

Anti-persona: spray-and-pray users wanting 500 LinkedIn applications a day. Fitwise caps volume and never automates LinkedIn.

---

## 3. Capability map: Job Hunt OS → Fitwise feature → tier

Source of each capability: the personal Job Hunt OS (brief, alert procedure, search panel, dashboard sync, root-cause analysis, tap list, CV builder v5/v6, apply ledger, search/scan scripts, insights tab, multi-person search, daily schedule list). All examples below are generic.

Pricing column: **Free** (with limits) or **Credits** (prepaid, per action; costs in §4). There are no monthly subscriptions (Suresh, 31 Oct 2026 10:38 PM: "make it pre-paid for all - with limits applied").

### 3.1 CV & documents
| # | Job Hunt OS capability | Fitwise feature | Tier |
|---|---|---|---|
| C1 | Master CV as single source of truth ("fact bank": every employer, title, date, tool, metric) | **Fact bank**: on upload, the CV is parsed into a structured profile; every later output is checked against it | Free |
| C2 | Per-job tailoring: headline = posting's title, 3-line summary mirroring the JD's top asks, top-5 bullets of the 2–3 most recent roles reordered/reworded to the JD, skills ordered by JD keywords, ≤2 pages | **Tailored CV in the user's own format** (DOCX edited in place; PDF rebuilt closest-match; pasted text → clean ATS layout) | Free (daily limit) · then credits |
| C3 | Truth check: no invented tools, employers, metrics or certificates; title-only change is not tailoring | **Truth guard**: every sentence diffed against the fact bank; unknown tool/number → blocked and shown to the user | Free |
| C4 | Keyword-coverage check + page-1 gate (the first third of page 1 must sell the candidate) | **Match score + missing keywords + page-1 check** | Free |
| C5 | "Selected achievements" block (5 metric bullets) in the top third | Optional achievements block in location formats | Free |
| C6 | Recruiter note ≤120 words naming company + role, for cover-letter fields | **Recruiter note** (≤120 words) free with each tailoring; **full cover letter** (DOCX/PDF) | Note free · cover letter 1 credit |
| C7 | No work-status line on the CV; work status only in form answers | **Work-status hygiene**: CV never carries visa wording; it goes in form answers only | Free |
| C8 | Different CV variants per role family (e.g. Test Manager vs Automation Lead) | **Role-family base CVs** (up to 3 bases) | Free |
| C9 | (New, agreed pricing) location conventions | **2 extra location formats** (US résumé / UK CV / EU-Europass-style or DACH), watermarked image preview free | Preview Free · Download 1 credit each |

### 3.2 Job discovery
| # | Job Hunt OS capability | Fitwise feature | Tier |
|---|---|---|---|
| D1 | 1,000+ company career boards scanned in code through public ATS JSON APIs (seen in the source list: Join, Greenhouse, Recruitee, Breezy, Ashby, Personio, SmartRecruiters, Lever, Workday, Workable, Teamtailor) | **Shared job index**: one crawler fetches each board once for all users; per-user matching runs on the index | Credits |
| D2 | Board list built from a public register of recognised visa-sponsor employers (≈13,000 orgs probed against 11 ATS APIs) | **Sponsor-employer discovery** per country (registers where public: NL IND register, UK Home Office sponsor list) + "sponsor-friendly" badge | Credits |
| D3 | Aggregators (Indeed, Glassdoor, national boards, expat boards, LinkedIn guest pages) | **Aggregator layer via licensed APIs only** (Adzuna, Jooble partner API, Careerjet) — no scraping of sites whose terms forbid it; LinkedIn = deep links only | Credits |
| D4 | Rounds per country at 08:00 local time (NL, UK, US Eastern, DE/CH/LU) | **Daily search per country at the user's chosen local time** | Credits |
| D5 | Free-text search panel: prompt + resume → search (+ auto-apply) | **"Ask Fitwise" search box**: natural-language prompt → structured filters → results in minutes | Search: credits · apply: per application |
| D6 | Title families incl. extended titles; mid-level allowed; software-only (exclude pharma/manufacturing "quality") | **Title family + seniority + domain filters** with negative keywords | Free filters · search runs: credits |
| D7 | Freshness window (7 days, 10 on Mondays; 24 h for some countries) | **Freshness setting** per search | Credits |
| D8 | Country rules: remote/hybrid/on-site, permanent vs contract/B2B/freelance, per country | **Per-country eligibility rules** (work mode × contract type × country) | Credits |
| D9 | Language requirement detection (ad requires Dutch/German/French; Dutch-written ad without a requirement is OK) | **Language filter**: "requires X" vs "written in X" | Credits |
| D10 | Knock-out screen before any CV is built: residency/work authorisation, W-2 only, clearance, language required | **Eligibility screen** from the user's own work-auth profile; every skip has a reason | Credits |
| D11 | Company watchlist checked every round; company blocklist (e.g. "never apply to X") | **Watchlist + blocklist** | Credits |
| D12 | Rejected-company block (companies that rejected the user in the last 24 months, mined from mail) | **"Already rejected you" guard** from inbox sync + manual list | Credits |
| D13 | Job-alert email ingestion (alert mails from boards, LinkedIn alerts, newsletters); follow "show all N jobs" links | **Alert inbox**: user forwards alert mails to their Fitwise address (or Gmail sync); jobs parsed, deduped, matched | Credits |
| D14 | Dedupe across all rounds (by URL and company+title), under a lock | **Global dedupe ledger** per user | Free |

### 3.3 Applying (Autopilot)
| # | Job Hunt OS capability | Fitwise feature | Tier |
|---|---|---|---|
| A1 | AUTO-APPLY RULE: when a search completes, apply to every suitable result | **Autopilot loop** (daily) with approval modes: *Review first* (default) or *Full auto* | Credits (per verified application) |
| A2 | Apply on the employer's own ATS with the tailored CV, truthful answers, recruiter note in free-text fields | **ATS adapters** (Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Recruitee, Personio, Teamtailor first; Workday later) | Credits (per verified application) |
| A3 | Rule #1: never claim a citizenship/authorisation the user does not hold; pick "Other" or leave blank; free-text eligibility statement | **Truthful-answer engine**: answers only from the user's answer bank; citizenship/authorisation questions are rule-locked | Credits (per verified application) |
| A4 | Verify: confirmation page or confirmation email; proof screenshot per application | **Proof of submission** (screenshot + confirmation text) stored per application | Credits (per verified application) |
| A5 | Same-day rejection re-check before reporting "applied" | **Status accuracy check** (inbox) | Credits (per verified application) |
| A6 | Hard stops → "needs Suresh": CAPTCHA, account walls (Workday, UKG, iCIMS, ADP), email/phone codes, Yes/No work-auth with no truthful option, video/AI interview, Easy-Apply-only | **Needs-you queue** with reason, link, the tailored CV and the prepared answers | Free (queue) · apply: per application |
| A7 | Daily 08:30 tap list: every role that needs the user's tap, each with its tailored CV | **Daily needs-you digest** (email + in-app), one tap opens the job with CV ready | Credits (per verified application) |
| A8 | LinkedIn Easy Apply queue with safety caps (5/day, single session, human pace) | **Easy-Apply assist** (no bot): queue, prepared CV + answers, "open on LinkedIn" button; user clicks submit themselves | Free (CV is the free tailoring) |
| A9 | Helper workers in parallel; one session per site at a time | **Worker pool** with per-ATS concurrency limits | — (infra) |

### 3.4 Tracking, inbox & reporting
| # | Job Hunt OS capability | Fitwise feature | Tier |
|---|---|---|---|
| T1 | Live dashboard: every role with status (submitted / needs you / skipped + reason + link), KPIs (sent, response rate, interviews & tests, actions open, waiting on you, rejected), funnel, charts | **Tracker** (board + table views), KPI header, funnel chart | Free |
| T2 | Inbox reply sync twice daily: reply ∈ Acknowledged / Interview invite / Test or assessment / Rejected / Offer, with date, gist and action + deadline; uncertain matches flagged | **Inbox sync** (forwarding address on Tab; Gmail OAuth read-only in Phase 5) → auto status + next action | Free (for applications tracked in Fitwise) |
| T3 | Applications found only in mail (applied before the tracker) imported | **Import past applications** from inbox (last 12 months) | 2 credits one-off |
| T4 | Action tracker (to do / in progress / done, due time) feeding "Today" | **Actions & deadlines** (e.g. "assessment due Fri 23:59") | Free |
| T5 | Ping on new reply (one line: company – role: reply type, action + deadline) | **Reply alerts** by email (push/WhatsApp later) | Free |
| T6 | Fixed report format: funnel line first, then one line per role; HONESTY RULE: partial runs say so, unchecked counts listed | **Daily run report**: "412 jobs read → 38 matched → 9 eligible → 6 applied / 2 need you / 1 skipped", nothing hidden | Free (with each search run) |
| T7 | Google Sheet + CSV export | **CSV / Google Sheets export** | Free |
| T8 | Insights tab: smart actions, skills in demand, resume fit, gaps, rate benchmark, hot companies, win-rate learning, stale applications, best day to apply | **Insights** (learns from the user's own replies + the shared index) | Credits |
| T9 | Root-cause analysis "why so few applications" (loss per funnel step: language, location, auth, walls) | **Funnel doctor**: weekly "where your applications are lost" + one-click rule relaxations | Credits (per verified application) |
| T10 | Weekly skills review from 40+ live ads vs the CV (gaps, 4-week upgrade plan) | **Weekly skills radar** email | Credits |
| T11 | Interview reminders 30 min before calendar events | **Interview reminders** (Google Calendar read-only, later) | Free (later phase) |

### 3.5 Multi-person (from the second search profile)
| # | Job Hunt OS capability | Fitwise feature | Tier |
|---|---|---|---|
| M1 | Search-only profile for another person: never apply, own keywords/countries, twice-daily search, own dashboard tab | **Search-only mode** (any profile can be set to never apply) | Credits |
| M2 | Email digest of only NEW shortlisted roles, skipped when 0 new, sent "as X's assistant" | **Email digests**: daily/twice-daily, only new roles, never empty | Credits |
| M3 | Per-country chart and filter; English-only shortlist when the person doesn't speak the local language | Language + country filters on digests | Credits |
| M4 | Owner manages several people | **Coach seats** (manage up to 5 job seekers, search-only unless the seeker grants apply consent themselves) | Credits (later) |

Not productised (personal growth work): daily LinkedIn/Instagram content, page commenting. These become Fitwise's own marketing engine (§12).

---

## 4. Pricing: prepaid credits for everything, with limits (no subscriptions)

Decision (Suresh, 31 Oct 2026 10:38 PM): **"make it pre-paid for all - with limits applied."** The earlier Pro €12/mo and Autopilot €29/mo plans are removed. Every paid action spends prepaid credits; the user's own-format tailored CV stays free (agreed 10:04 PM) within daily limits.

### 4.1 Credit packs (USD)
1 credit = **$0.50** list price (as agreed: "$5 = 10 credits").
| Pack | Credits | Bonus | Effective $/credit |
|---|---|---|---|
| Starter | $5 → 10 | — | $0.50 |
| Job hunt | $10 → 22 | +10% | $0.45 |
| Serious | $25 → 60 | +20% | $0.42 |
| Autopilot month | $50 → 130 | +30% | $0.38 |
Welcome: 5 free credits after email verification (beta on Tab: credits granted by admin, since no payments yet). Packs are bought with one-time card payments (Stripe Checkout in Phase 5); small packs carry the highest fee share, which is why there is no pack below $5.

### 4.2 What each action costs
| Action | Credits | Notes |
|---|---|---|
| Tailored CV in the user's own format (DOCX/PDF) | **0** | Free: 5 per day, 30 per month per account; beyond that 1 credit each |
| Match score, missing keywords, recruiter note (≤120 words) | 0 | Comes with each tailoring |
| Location-format preview (watermarked image) | 0 | |
| Extra location-format download (US / UK / EU-DACH) | **1** | Both formats for one job = 2 ($1, as agreed) |
| Full cover letter (DOCX/PDF, tailored) | 1 | |
| Extra tailoring beyond the free daily/monthly limit | 1 | |
| **Job search round**: one saved search, daily for 7 days (all its countries, screen + digest + run report) | **2 per week** | ≈ $4/month per saved search; pauses when credits run out |
| One-off "Ask Fitwise" search now (prompt → results in minutes) | 1 | |
| **Auto-applied job** (verified submission on the employer's site) | **job bundle** (§4.3) | Paid from a prepaid EUR job bundle, not credits; 1 job used only on a verified submit |
| Needs-you item prepared (screened, tailored CV, answers ready) | 0 | User applies themself |
| Import past applications from inbox (12 months) | 2 | One-off |
| Weekly skills radar + funnel doctor | 1 per week | Opt-in |
| Tracker, reply sync, reply alerts, CSV export, digests | 0 | Free: they keep users coming back |

### 4.3 Auto-apply job bundles (EUR) — final prices
Decided in three steps on 31 Oct 2026: bundles instead of per-job (Suresh 10:46 PM: "10, 100, 1000 jobs … 1, 10, 20 euros"), raised for profit (10:49 PM: "make a decision to increase the cost"), then halved for job seekers (10:55 PM: "cutshort it to 50%"). **Final:**
| Bundle | Price | Per job | Valid for | Daily cap |
|---|---|---|---|---|
| 10 jobs | **€1.50** | €0.15 | 90 days | 50/day |
| 100 jobs | **€9.50** | €0.095 | 90 days | 50/day |
| 1,000 jobs | **€65** | €0.065 | 90 days (at 50/day ≥20 days to use) | 50/day |
Rules: a job is used only on a **verified** submission; failed, unverified, closed-before-submit and needs-you items return the job to the bundle automatically; oldest bundle used first; unused jobs expire with the bundle (warning 7 days before); ≤2 applications per company per 30 days; one application per job ever; the user can set a lower daily cap or pause anytime.

#### Real cost per auto-application **[estimate]**
Inputs: hosted browser $0.12 per browser-hour (Browserbase Developer overage **[vendor page, https://www.browserbase.com/pricing]**) or ~€0.001/application on our own Hetzner server (CX33 €8.99/mo **[vendor page]**, ~10k applications/month at 30% load **[estimate]**); AI at $0.40 / $1.60 per M input/output tokens (the model measured in v1, list price per README); ~13k input tokens per AI browser step (measured on Tab's own browser work); 1.3 attempts per verified submit (failures, needs-you); card fee 1.5% + €0.25 per bundle purchase (EEA card **[vendor page, https://stripe.com/nl/pricing]**); $1 ≈ €0.92 **[unverified FX]**.
| Route | Browser | AI | ×1.3 attempts | **Cost per verified application** |
|---|---|---|---|---|
| **A. Code adapter** (Greenhouse, Lever, Ashby, Workable, SmartRecruiters forms filled by code; AI only tailors the CV and maps unusual questions, ~10k tokens) on own server | ~€0.001 | ~€0.007 | +30% | **≈ €0.013** |
| A on hosted browsers (3 min) | ~€0.006 | ~€0.007 | +30% | **≈ €0.018** |
| **B. AI-driven browser** (unknown forms: ~20 AI steps ≈ 260k input tokens, 6 min) | ~€0.011 | ~€0.105 | +30% | **≈ €0.15** |
| C. On Tab (beta) with Tab's browser workers | Tab usage (larger model, minutes per application) | — | — | **not measured; likely well above €0.15** — beta bundles should be free/test only |
**Blended cost** = €0.013 + €0.137 × (share of jobs needing route B). The **~€0.05/job** figure quoted to Suresh at 10:54 PM holds while **≤27%** of applications need route B. Expected mix at launch (Greenhouse/Lever/Ashby/Workable/SmartRecruiters cover most tech-company boards, Workday/iCIMS/custom forms go to route B or needs-you): 15–30% route B **[estimate]** → €0.03–0.05/job.

#### Margin per bundle (final prices)
| Bundle | Card fee | Net | All route A | 20% route B (€0.040/job) | 27% route B (€0.050/job) | All route B | Break-even route-B share |
|---|---|---|---|---|---|---|---|
| 10 / €1.50 | €0.27 (18%) | €1.23 | **+€1.10 (73%)** | +€0.83 (55%) | +€0.73 (49%) | −€0.27 | 80% |
| 100 / €9.50 | €0.39 | €9.11 | **+€7.81 (82%)** | +€5.07 (53%) | +€4.11 (43%) | −€5.89 | 57% |
| 1,000 / €65 | €1.23 | €63.78 | **+€50.78 (78%)** | +€23.40 (36%) | +€13.78 (21%) | −€86.22 | 37% |
(Margins as % of the price paid; before shared costs such as the crawler server, email and support.)

Verdict: **all three bundles are profitable at the expected mix.** The 1,000-job bundle is the thinnest: it loses money if more than ~37% of its jobs need the AI route, and on Tab's own browser workers (beta) every bundle loses, so on Tab bundles are free beta grants only. Safeguards built in: (1) route B is used only after the code adapters; (2) an account whose route-B share passes 40% in a month gets those jobs as "Needs you" (user applies with the prepared CV) instead of auto-applied, shown in settings; (3) cost per verified application is a live admin metric with an alert at €0.06. Option kept open (not chosen): count a complex form as 2 jobs.

### 4.4 Limits (per account)
- Auto-apply: ≤50 per day (bundle cap, user can lower, default 20), ≤1,000 per 30 days; ≤2 applications per company per 30 days; one application per job ever.
- Saved searches: ≤5 active; ≤6 countries per search.
- Free tailoring: 5/day, 30/month; plus 8/day per network (abuse guard, exists in v1).
- On Tab (beta) additionally: auto-apply capacity is shared (~10–15 applications/hour for all users together), so daily caps may be lower and the queue is first-come.

### 4.5 User-set spend caps
- **Daily cap** (default 10 credits) and **monthly cap** (default 100 credits), editable; Autopilot stops for the day/month when reached and the morning email says so.
- **Low-balance alert** at 5 credits; at 0 credits search rounds and auto-apply pause (nothing runs on debt); free features keep working.
- **No auto top-up by default**; opt-in auto top-up with a chosen pack and a monthly maximum (Phase 5, Stripe saved card).
- Every debit is visible in a credits ledger (date, action, job, credits, balance).

### 4.6 Expiry & refunds
- Paid credits valid **12 months** from purchase, spent oldest first; bonus/welcome credits expire with their pack (welcome credits after 90 days). Expiry warning email 30 and 7 days before. (Check Dutch/EU consumer rules on prepaid expiry with the lawyer **[unverified]**.)
- **Failed applications are refunded automatically**: technical error, job closed before submit, submit not verified within 24 h, or the submit turns out not to have reached the employer → the job returns to the bundle and the ledger shows "refund: <reason>".
- Download refunds: a broken file or wrong format reported within 7 days → credit back.
- Unused paid packs: refundable in money within 14 days of purchase if no credit from the pack was used (EU withdrawal right; the digital-content waiver at checkout covers used credits).
- Account deletion: unused paid credits refunded on request within 30 days, otherwise forfeited (stated in ToS).

### 4.7 Unit economics per credit action **[estimate]**
Revenue per credit after card fees (EEA cards 1.5% + €0.25 per payment **[vendor page, https://stripe.com/nl/pricing]**, ≈$0.27 fixed at today's rate **[unverified FX]**): $5 pack ($5 − $0.075 − $0.27) / 10 ≈ **$0.47/credit**; $10 pack ≈ $0.43; $25 ≈ $0.40; $50 ≈ $0.37. On Tab (beta) there are no payments, so revenue is $0 until Phase 5.

| Action | Price (credits → $) | Our direct cost | Gross margin |
|---|---|---|---|
| Own-format tailored CV | free | ~$0.002 AI (measured v1: 2,464 in + 557 out tokens, gpt-4.1-mini list price) | cost of acquisition |
| Extra format download | 1 → ~$0.37–0.47 | ~$0.001 (render) | ~99% |
| Cover letter | 1 → ~$0.37–0.47 | ~$0.003 AI | ~99% |
| Job search week (7 rounds) | 2 → ~$0.74–0.93 | ~$0.10 (AI screening of ~30 JDs/day at ~$0.0005 each) + shared crawl (~€9/mo server ÷ users in Phase 5) | ~85–90% |
| Auto-applied job | job bundle | see §4.3 | see §4.3 |

Example user per month: 2 saved searches × 4 weeks (16 credits) + 6 extra formats (6) + 2 cover letters (2) = 24 credits ≈ a $10 + $5 pack, plus a 100-job bundle (€9.50) for auto-apply.
Currencies: document credits are in USD (agreed earlier) and job bundles in EUR (10:46 PM); one EUR wallet for both is simpler for an EU launch — open decision.


### 4.8 Competitor prices (checked 31 Oct 2026 via search; snippets, not full pages)
| Tool | Price as stated | What you get | Per application at full use | Source |
|---|---|---|---|---|
| LazyApply | Basic $99, Premium $149, Ultimate up to $999 (per year per reviews) | 15 / 150 applications per day | well under $0.01 | lazyapply.com snippet **[vendor page, plan period unclear in snippet]**; per-year per remotejobassistant.com review **[unverified]** |
| JobCopilot | "from $0.93 per day" Premium, "from $1.05 per day" Elite; weekly/monthly/quarterly | auto-apply daily (Reddit user: 30–50/day) | ~$0.02–0.03 at 40/day | https://jobcopilot.com/pricing/ **[vendor page]** |
| LoopCV | Free: 10 applications total; paid "from €9.99/month"; Standard 100/month, Premium 300/month | many are emails, not ATS submits (review) | ~€0.10–0.20 | https://www.loopcv.pro/pricing/ + /questions/loop-limits/ **[vendor page]**; $19.99/$59.99 per wobo.ai review **[unverified]** |
| AIApply | Auto-apply tiers ~$49–99/month (third-party) | resume tools + auto-apply | one user measured $0.50 per application (1,283 apps, $639) | clickhired.ai, Reddit **[unverified]** |
| **Fitwise** | **€1.50 / €9.50 / €65 bundles, no subscription** | verified ATS submits only; failed = refunded | **€0.065–0.15** | this spec |

Honest positioning: Fitwise is **not** the cheapest per application against high-volume subscription tools (LazyApply, JobCopilot charge less per application when used to the max). It is cheaper than LoopCV and AIApply per job, and it is the only one here sold **without a subscription**, charging **only for verified submissions** and refunding failures. Sell on: "pay only for applications that actually reach the employer; no monthly fee; never lies on your behalf." Do not claim "cheapest" (corrected to Suresh at 11:08 PM).

---

## 5. User flows

### 5.1 Onboarding (≈5 minutes)
1. **Sign up**: email magic link or Google (Better Auth). Country of residence + language.
2. **Upload CV** (DOCX preferred, PDF, or paste). Parser shows the detected sections (contact, summary, experience with company/city/dates/title/bullets, skills, education, certifications); user fixes anything wrong. This becomes the **fact bank**.
3. **Preferences**: target titles (suggested from the CV), seniority, domains to exclude, salary floor (optional), freshness (24 h / 3 / 7 days).
4. **Countries & work modes**: per country pick remote / hybrid / on-site × permanent / contract / freelance-B2B. Example: "Netherlands: hybrid or remote, permanent or contract · Germany: remote only · US: remote contract only".
5. **Work authorisation (per country)** — the most important screen:
   - Status per country: citizen · permanent resident · work permit (type, expiry) · needs sponsorship · contractor via own company only.
   - Generated **truthful answer bank**: "Are you authorised to work in X?", "Will you require sponsorship?", "Are you a citizen of X?" → exact answers, plus a free-text eligibility statement, e.g. *"Available on a contract/B2B basis via my own registered company; no sponsorship needed for contract engagement."*
   - Rule shown in plain words: *Fitwise will never claim a citizenship or work right you did not state. When a form offers no truthful option, it stops and asks you.*
   - Standard answers: notice period, salary expectation (range or "negotiable"), relocation, languages, EEO/diversity (default "prefer not to say").
6. **Consent** (separate, unticked checkboxes, versioned): (a) process my CV to tailor documents; (b) search jobs for me daily; (c) **apply on my behalf** to employers that match my rules (needs a job bundle), with approval mode; (d) read job-related mail (inbox sync); (e) marketing email (optional).
7. **Approval mode** (Autopilot): **Review first** (default: each morning's matches wait for "Approve all / pick"; nothing is sent without a tap) or **Full auto** (applies within rules; user can pause anytime; daily cap).
8. **Inbox**: copy your Fitwise forwarding address into a Gmail filter (on Tab: `fitwise@mail.tab.bot` + your personal code; Phase 5: `ana-7k2@in.<domain>` or connect Gmail read-only).

### 5.2 Daily autopilot loop (per user, at their local time, e.g. 08:00)
1. **Match**: the shared index (refreshed hourly) → user's saved searches → title/seniority/domain filter → freshness → country/work-mode/contract rules → language filter → watchlist boost / blocklist → dedupe ledger → rejected-company guard.
2. **Screen**: fetch the full JD; eligibility screen against the user's work-auth profile (residency, citizenship, clearance, W-2-only, language required). Fail → `skipped` with reason.
3. **Tailor**: CV in own format + recruiter note; truth guard; page-1 gate; match score. Gate fail → `needs_you` ("CV gate failed: please confirm").
4. **Approve**: Review-first → batch waits in app + morning email ("9 jobs ready, approve?"). Full-auto → straight on.
5. **Apply**: job enters the apply queue → worker opens the employer's ATS in an isolated browser context → fills from profile + answer bank → uploads the tailored CV → recruiter note in free-text → submits → verifies the confirmation page (and confirmation email if inbox sync is on) → screenshot proof.
6. **Hard stop** (CAPTCHA, account required, verification code, required question with no truthful option, assessment/video step, LinkedIn-only) → `needs_you` with blocker type, link, tailored CV, answers to paste. No retry spam.
7. **Report**: run summary in app + daily email: funnel line, then one line per role "Company – Title: Applied ✅ / Not applied ❌ (reason) | Action: …".

### 5.3 Needs-you queue
- One list, sorted by deadline/posting age; each card: company, title, blocker ("Workday account needed"), **Open job**, **Download CV**, **Copy answers**, **Mark done / Skip**.
- Daily digest at the user's chosen time; items older than 7 days auto-archive (posting likely stale) after one reminder.
- When the user marks done, status → submitted (user-reported) until a confirmation email confirms it.

### 5.4 Tracker + inbox sync
- Columns: Matched · Ready · Applied · Acknowledged · Assessment · Interview · Offer · Rejected · Skipped.
- Inbox sync 1–2× daily on Tab (hourly for accounts with an active job bundle, every 6 h otherwise, after Phase 5): read-only search for mail from applied companies' domains + job words; LLM classifies into Acknowledged / Interview invite / Test or assessment / Rejected / Offer; extracts date, gist, action + deadline; uncertain match → "match uncertain" chip, never silently applied.
- Reply alert email: "Acme – QA Lead: Interview invite | pick a slot by Tue".
- Rejection auto-adds the company to the rejected guard (user can undo).

### 5.5 Digests by email (Resend)
- **Morning**: new matches (only new; skipped when 0), applied overnight, needs-you count.
- **Needs-you digest**: the list with CVs as links.
- **Weekly**: funnel doctor + skills radar (top 10 skills in demand vs your CV, 3 gaps + how to close them).
- Unsubscribe per digest type; List-Unsubscribe header.

### 5.6 Credits & checkout
Preview watermarked image → "Download – 1 credit" → if balance 0: Stripe Checkout for a pack → webhook credits ledger → download unlocked for that job forever.

---

## 6. Architecture

### 6A. Tab-hosted architecture (Phases 1–4, build now)

```
 User's browser ──HTTPS──▶ fitwise.sites.tab.bot  (Cloudflare Worker, worker.mjs)
                              │  D1  "DB"    : users, sessions, profiles, jobs, matches, applications, credits …
                              │  R2  "FILES" : uploaded CVs, tailored DOCX/PDF, previews, proof screenshots
                              │  KV  "DATA"  : rate-limit counters, feature flags
                              │  /api/*      : app API  ·  /api/admin/* : box-only API (admin key)
                              ▲
                              │ admin API (HTTPS, x-admin-key; key only on the box)
 Suresh's Tab box ────────────┘
   Tab schedules ─▶ crawl.py (ATS APIs → jobs)        2× daily
                 ─▶ match + tailor batch                daily per timezone bucket
                 ─▶ autopilot: spawn browser worker(s) daily, applies the approved queue
                 ─▶ outbox: mail.send digests/needs-you/reply alerts from fitwise@mail.tab.bot
                 ─▶ inbox: mail.list on the forwarding address → reply classifier → tracker
```

Principles: the Worker serves the app and stores everything; heavy and long work (crawling, browser applies, sending mail) runs on the Tab box in scheduled batches and talks to the Worker only through the admin API. All code is new, under `/home/user/tab/files/saas-cvtailor/` (git-ready layout, so Phase 5 is a move, not a rewrite). Logic from the personal Job Hunt OS may be read for ideas and re-implemented; none of its files, data or dashboards are touched.

Code layout (new):
```
saas-cvtailor/
  site/            worker.mjs (built), index.html, app.html, assets, tab-site.json (bindings DB, FILES, DATA)
  src/worker/      router, auth, api/{cv,tailor,formats,jobs,matches,apps,needs,credits,admin}
  src/shared/      docmodel, truth-guard, screen rules, answer-bank mapping (shared by Worker + box)
  engine/          crawl.py, boards.json, match.py, apply/ (adapters: greenhouse, lever, ashby, workable, smartrecruiters), outbox.py, inbox.py
  schema.sql       D1 schema = §6.3 tables (SQLite types)
  spec/            this document
```

#### What Tab hosting supports today vs its limits, per feature
| Feature | On Tab today | Limit / caveat | Phase 5 fix |
|---|---|---|---|
| Landing, app UI, API | ✓ Worker serves static + API (live now) | Address is `fitwise.sites.tab.bot`; own custom domain not confirmed on Tab **[unverified]** | Vercel + own domain |
| Multi-tenant auth | ✓ build in the Worker: email + password (PBKDF2 via WebCrypto), session cookie (httpOnly) in D1; invite codes for beta; optional "Sign in with Google" (OpenID scopes only, free Google OAuth client) | No instant email from the Worker (Tab mail is sent from the box), so magic links / instant verification codes are not possible; email verification is batched (≤ one schedule interval) or replaced by invite codes | Better Auth + Resend magic links |
| Database | ✓ D1 (SQLite) bound as `DB`; v1 already uses it | D1 size and per-query limits are Cloudflare's (database size cap, single-writer SQLite) **[unverified for this account's plan]**; fine for beta (≤ a few hundred users) | Neon Postgres |
| File storage (CVs, PDFs, proofs) | ✓ R2 binding `FILES` can be declared in tab-site.json | Store small: proofs as compressed JPEG ≤150 KB, 180-day retention; R2 size limits are Cloudflare's **[unverified]** | Cloudflare R2 (own account) |
| CV parse + tailor (own format, DOCX/PDF/text) | ✓ runs in the Worker (v1/v2) | Worker CPU-time per request is Cloudflare's limit **[unverified for this account]**; heavy PDF→PNG preview rendering may need to move to the box batch | Vercel function / worker server |
| AI rewriting | ✓ wired (v1): provider key stored server-side in D1 via admin API | Needs an AI key billed to Suresh (Tab's own key proxy is box-only, not callable from the Worker). Measured v1: ~$0.0019 per tailoring (gpt-4.1-mini list price) | Same key, env var |
| Location formats + watermarked previews | ✓ (v2 in progress) | — | — |
| Credits & plans | ✓ ledger in D1; purchase = placeholder ("early access" capture); admin can grant credits to beta users | **No real payments until Stripe exists** | Stripe Checkout + Billing |
| Job index (1,000+ boards via public ATS JSON APIs) | ✓ `engine/crawl.py` on the box via a Tab schedule, 2× daily, bulk-upserts jobs to D1 through the admin API | Box disk is tight (~0.5 GB free): stream, no raw dumps; one crawler for all users; each schedule run costs Tab usage, so 2×/day not hourly | Hetzner cron hourly |
| Matching, eligibility screen, dedupe | ✓ SQL in D1 + `match.py` on the box (daily per timezone bucket: 07:00 CET, 08:00 UK, 08:00 ET) | Per-user local times grouped into 3 buckets | BullMQ per user |
| Tracker, needs-you queue, CSV export | ✓ Worker + D1 | — | — |
| Auto-apply engine | ✓ Tab browser workers (one Browserbase session per batch, a fresh browser context per application) spawned by the daily autopilot schedule | **Capacity**: one browser session at a time on this box, ~4–6 min per application **[estimate]** → ~10–15 applications/hour → beta ≈ 10 Autopilot users × 5 applications/day. Only no-account ATS (Greenhouse, Lever, Ashby, Workable, SmartRecruiters); account walls/CAPTCHAs/codes → needs-you. Browser minutes and model tokens count against Suresh's Tab usage | Playwright worker pool on Hetzner |
| Per-user browser isolation | ✓ new context per application, no saved cookies between users | Users' ATS logins are **not** stored on Tab (Tab's vault holds Suresh's own logins only) | Own envelope-encrypted vault |
| Email: digests, needs-you list, reply alerts, verification | ✓ Tab mail: claim `fitwise@mail.tab.bot`, send from the box with from_name "Fitwise" | Sends only from scheduled batches (not instant); deployment bounds per Tab: 200 sends/hour and a daily cap on new recipient domains (Tab's mail guide); List-Unsubscribe is added by Tab mail | Resend (own domain, instant) |
| Inbox reply sync | ✓ forwarding address: user adds a Gmail filter forwarding job replies to `fitwise@mail.tab.bot` (tag per user, e.g. a code in the subject or a `+tag` if tags are accepted inbound **[unverified]**); the box reads with `mail.list` once or twice a day and classifies | Each inbound mail lands on Suresh's Tab ledger; volume must stay modest (beta). No per-user Gmail OAuth on Tab (Tab's Google connection is Suresh's own) | Gmail OAuth (after Google verification) or own inbound domain |
| Daily rounds / scheduling | ✓ Tab schedules (crawl 2×, match/tailor 3 buckets, autopilot 1–2×, outbox 2×, inbox 2×) ≈ 9–10 schedule runs/day | Each run is a Tab turn; keep them few and silent; schedules belong to Suresh's Tab | Vercel cron + BullMQ |
| Analytics, errors | ✓ simple event table in D1 + admin stats endpoint (exists) | No PostHog/Sentry on Tab | PostHog, Sentry (EU) |
| Legal entity / GDPR | Pages can be published on the Worker | Controller is still Suresh's company; data sits in Tab's Cloudflare account → state it in the privacy policy; beta only with consent | Own vendor DPAs |

**Recommendation:** Phases 1–3 on Tab as a **closed beta** (invite codes, 20–50 users, Autopilot for ~10). Public Product Hunt launch works best after Phase 5 (own domain + real payments). A PH launch on Tab is possible but would have no payments and no instant emails.

### 6B. Target own stack (Phase 5, after the beta)

```
            Browser (Next.js app, PWA)
                    │ HTTPS
   ┌────────────────▼────────────────┐        ┌──────────────────────┐
   │ Vercel: Next.js (app + API)     │──SQL──▶│ Neon Postgres (EU)   │
   │ - Better Auth, Stripe webhooks  │        │ Drizzle ORM          │
   │ - CV tailoring (LLM call)       │        └──────────▲───────────┘
   │ - Cron: enqueue daily loops     │                   │ SQL
   └───────┬──────────────┬──────────┘                   │
           │HMAC enqueue  │ signed URLs       ┌──────────┴───────────┐
           ▼              ▼                   │ Hetzner VPS (EU)     │
   ┌──────────────┐  ┌──────────────┐         │ - Redis + BullMQ     │
   │ Resend       │  │ Object store │◀────────│ - crawler (ATS APIs) │
   │ (send+inbound)│ │ (R2, EU)     │         │ - apply workers      │
   └──────────────┘  └──────────────┘         │   (Playwright)       │
                                              │ - inbox sync worker  │
                                              └──────────────────────┘
   Stripe · PostHog (EU cloud) · Sentry (EU region) · LLM API
```

### 6.1 Components
| Component | Runs on | Responsibility |
|---|---|---|
| **web** (Next.js 15, App Router, Tailwind, shadcn/ui) | Vercel, region fra1 | Landing, app UI, API routes, Stripe webhooks, auth |
| **tailor** service | Vercel function (Node) | Parse CV (DOCX via `docx`/mammoth, PDF via pdf.js), fact bank, LLM rewrite, truth guard, render DOCX/PDF (DOCX in place; PDF via @react-pdf or Typst in worker), previews (PNG + watermark) |
| **crawler** | VPS, cron hourly | Fetch every registered ATS board once via public JSON APIs; upsert `jobs`; close vanished jobs; per-host rate limits |
| **matcher** | VPS (BullMQ job per user) | Daily loop steps 1–4 |
| **apply-worker** | VPS, Docker, N concurrent | Playwright Chromium, one fresh context per application; ATS adapters; proof capture |
| **inbox-worker** | VPS | Gmail API read-only polling (or inbound webhook from forwarding address), classification |
| **mailer** | Vercel + Resend | Transactional + digests (React Email templates) |
| **admin** | web /admin | Users, runs, failure rates per ATS adapter, refunds, kill switch per adapter |

### 6.2 Queue
- **BullMQ on Redis** (self-hosted on the VPS, no extra vendor). Queues: `crawl`, `match:user`, `tailor:job`, `apply:job`, `inbox:user`, `digest:user`.
- Vercel cron (daily per timezone bucket) calls the worker's `/enqueue` with an HMAC-signed body; the worker never exposes Redis publicly.
- Retries: crawl ×3 with backoff; apply **never auto-retries a submit step** (unknown outcome → check confirmation email/page first, then `needs_you`).
- Idempotency key on every application: `user_id + job_id`; DB unique constraint stops double applications.

### 6.3 Data model (used now in D1/SQLite; same tables in Postgres + Drizzle in Phase 5)
| Table | Key columns |
|---|---|
| `user`, `session`, `account`, `verification` | Better Auth standard tables |
| `profile` | user_id, residence_country, timezone, languages[], titles[], seniority, exclude_domains[], salary_floor, freshness_days, approval_mode (review/full), daily_cap, paused |
| `country_rule` | user_id, country, work_modes[], contract_types[], local_time |
| `work_auth` | user_id, country, status (citizen/pr/permit/needs_sponsor/contractor_only), permit_type, expiry, eligibility_statement |
| `answer_bank` | user_id, question_key, answer, source (user/derived), locked bool (citizenship/auth = locked) |
| `cv_document` | id, user_id, kind (master/base), original_key, mime, docmodel jsonb, fact_bank jsonb, created_at |
| `tailored_doc` | id, user_id, job_id, cv_document_id, format (own/us/uk/eu/dach), docx_key, pdf_key, preview_key, match_score, missing_keywords[], truth_report jsonb |
| `credit_ledger` | id, user_id, delta, reason (purchase/download/refund/grant), stripe_ref, tailored_doc_id |
| `subscription` | user_id, plan, status, stripe_customer, stripe_sub, period_end |
| `company` | id, name, normalized_name, domain, sponsor_registers[] |
| `ats_board` | id, company_id, ats, slug, country_hint, last_scan, status, error_count |
| `job` | id, board_id, ext_id, url, title, location, country, remote, contract_type, language, requires_languages[], posted_at, closed_at, jd_hash, jd_text (90-day TTL) |
| `saved_search` | id, user_id, prompt, filters jsonb, mode (apply/search_only), digest_schedule |
| `match` | user_id, job_id, saved_search_id, score, screen_result (pass/skip), reason, state |
| `application` | id, user_id, job_id, status (queued/submitted/needs_you/skipped/failed/user_reported), reason, tailored_doc_id, note, proof_key, confirmation, submitted_at; UNIQUE(user_id, job_id) |
| `application_event` | application_id, step, at, detail (audit trail of every page/answer) |
| `needs_you` | application_id, blocker (captcha/account/code/question/assessment/linkedin/gate), link, answers jsonb, resolved_at |
| `ats_credential` | user_id, ats_domain, username, secret_ciphertext, dek_ciphertext, created_by (user/fitwise), last_used |
| `inbox_connection` | user_id, kind (gmail/forward), refresh_token_ciphertext, forward_address, watermark |
| `reply` | application_id (nullable), from_domain, type, date, gist, action, due_at, confidence |
| `company_flag` | user_id, company_id, kind (blocklist/watchlist/rejected), since, source |
| `digest_log` | user_id, kind, sent_at, item_ids[] |
| `consent` | user_id, kind, version, granted_at, ip, revoked_at |
| `run` | user_id, kind, started, finished, funnel jsonb (read → matched → eligible → applied/needs/skipped/unchecked + reasons) |
| `audit_log` | actor, action, target, at |

### 6.4 Credential vault (users' ATS logins) — Phase 5 only; on Tab no user logins are stored
- **Default: no stored passwords.** Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Recruitee, Personio, Teamtailor take applications without an account.
- Account-based ATS (Workday, iCIMS, SuccessFactors, Taleo): Phase 3b, opt-in per user. Either the user enters an existing login, or Fitwise creates an account with a generated password on the user's email (with consent).
- Envelope encryption: per-user data key (AES-256-GCM), wrapped by a master key held **only on the worker host** (env file, root-only, not in Vercel, not in the repo); key rotation script; secrets decrypted in-memory per job, never logged, never in screenshots (mask fields before capture).
- Verification codes: read from the user's inbox connection only for the exact ATS sender within 10 minutes; otherwise `needs_you`.
- User can view (masked), delete, or export credentials; deleting an account wipes secrets immediately.

### 6.5 Per-user browser isolation
- Every application = a **new Playwright BrowserContext** (no shared cookies, storage or cache between users); optional persistent context per user × ATS domain, stored encrypted, only for account-based ATS.
- Worker containers run Chromium sandboxed, non-root, seccomp; download dir per job wiped after the run; `/tmp` tmpfs.
- Egress: datacenter IP by default; residential proxy only per user's country for ATS that geo-block **[decision deferred]**.
- Screenshots stored in object storage under `user/<id>/proof/`, 180-day retention.

### 6.6 Rate limits & fairness
- Crawler: per ATS host ≤2 req/s, conditional requests (ETag/If-Modified-Since), back off on 429 for 15 min (the personal system lost 133 boards to 429s when two rounds hit the same API at once — so one shared crawler, never per-user crawling).
- Applications: per user ≤50/day and ≤1,000 per 30 days; per employer ≤2 applications per user per 30 days; per ATS adapter global concurrency 3; human-like pacing (30–90 s between submits per host).
- API: per-IP and per-user limits on tailoring (free 5/day, 30/month; paid tailoring 200/day fair use).
- Kill switch per ATS adapter (admin) when its failure rate passes 20% in an hour.

### 6.7 Safety rules (hard-coded, not prompt-only) — apply on Tab and on the own stack
1. **Truthful answers**: form answers come only from `answer_bank`/`profile`; the LLM may *map* a question to an answer key, never write a new factual claim.
2. **Never claim citizenship or work rights** the user did not state: citizenship/authorisation/sponsorship questions are matched by rules + LLM classifier and answered from `locked` entries only; ambiguous or no truthful option → `needs_you`, never submit.
3. **CV truth guard**: no new employer, title, date, tool, certificate or number beyond the fact bank; courses ≠ certificates.
4. **No LinkedIn automation** (no sign-in, no Easy Apply bot, no scraping behind login). Deep links + Easy-Apply assist only.
5. **No retry on unknown submit outcome** without first checking confirmation.
6. **Approval modes**: Review first (default) / Full auto (opt-in, revocable, daily cap). "Pause autopilot" button in every email.
7. **Honest reporting**: every run states how many jobs were read, how many were not checked and why.
8. **Employer respect**: one application per role, ≤2 per company per month, no mass-applying to roles outside the user's rules.

---

## 7. Third-party services (Phase 5 own stack; none needed for Phases 1–4 on Tab)

**On Tab (now):** no vendor accounts. Running costs are (a) an AI key billed to Suresh for smarter rewrites (~$0.0019 per tailoring measured in v1; ~$6 per 3,000 CVs), and (b) Tab usage for schedules, browser minutes and model calls, which counts against Suresh's own Tab plan and daily allowance (heavy Autopilot use is what moves it). Optional later on Tab: a free Google OAuth client for "Sign in with Google".


| Need | Pick | Free tier (vendor) | Paid step | Source |
|---|---|---|---|---|
| Code | **GitHub** private repo (account sbparimi already connected) | Free private repos | — | github.com/pricing **[unverified for current limits]** |
| Hosting app/API | **Vercel** | Hobby: personal/non-commercial use only | **Pro $20/mo** incl. $20 usage credit | **[vendor page]** https://vercel.com/pricing, https://vercel.com/docs/plans/pro-plan |
| Database | **Neon Postgres** (EU: AWS Frankfurt) | Free: 100 CU-hours/project/month, 1 GB storage/project, up to 2 CU, scale-to-zero after 5 min | Launch: usage-based (third-party calculators quote storage $0.35/GB-mo **[unverified]**) | **[vendor page]** https://neon.com/pricing (snippet "updated October 31, 2026"; older third-party pages still say 0.5 GB) |
| Auth | **Better Auth** (open source library) | Free (self-hosted in our app) | Managed dashboard optional (Pro $20/mo per a third-party review **[unverified]**) | **[vendor page]** https://better-auth.com/pricing |
| Email | **Resend** | 3,000 emails/mo, 100/day, 3 domains | Pro $20/mo = 50,000/mo, extra $0.90/1,000 | **[vendor page]** https://resend.com/pricing |
| Payments | **Stripe** (Checkout, Billing, Tax) | No monthly fee | EEA standard cards 1.5% + €0.25; UK cards 2.5% + €0.25; Billing/Tax add-on % **[unverified]** | **[vendor page]** https://stripe.com/nl/pricing |
| Worker server | **Hetzner Cloud** (Nuremberg/Falkenstein/Helsinki) | — | CX23 (2 vCPU, 4 GB, 40 GB) €5.99/mo; CX33 (4 vCPU, 8 GB, 80 GB) €8.99/mo, excl. VAT (prices after 1 Apr 2026 adjustment) | **[vendor page]** https://www.hetzner.com/cloud/cost-optimized/ |
| File storage | **Cloudflare R2** (EU jurisdiction bucket) | 10 GB-month, 1M Class A ops, free egress | $0.015/GB-month | **[vendor page]** https://developers.cloudflare.com/r2/pricing/ |
| Analytics | **PostHog** (EU cloud) | 1M events/month free | from $0.00005/event | **[vendor page]** https://posthog.com/product-analytics/pricing |
| Errors | **Sentry** (EU data region) | Developer: free, 1 user, 5k errors | Team ~$26/mo annual, 50k errors **[third-party: last9.io]** | **[vendor page]** https://sentry.io/pricing/ |
| Job data | **Public ATS job-board APIs** (Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Recruitee, Personio, Teamtailor) | Free, public | — | each vendor's public job-board API docs **[unverified per vendor terms]** |
| Job data | **Adzuna API** | Free key "intended for evaluating the API" | Commercial use needs Adzuna's agreement | **[vendor page]** https://developer.adzuna.com/docs/terms_of_service |
| LLM | Small fast model for tailoring/classifying (e.g. Claude Haiku-class), larger model for hard form mapping | — | Haiku-class ≈ $0.10 / $0.50 per M input/output tokens per a search snippet of the vendor page **[unverified: re-check before launch]** | anthropic.com/pricing |
| Inbound mail (forward address) | Resend inbound or Cloudflare Email Routing | **[unverified]** | — | — |
| Gmail read-only OAuth | Google Cloud project | Free API | **Restricted scope → Google verification + annual CASA security assessment** (third-party lab fee, commonly quoted in the hundreds to low thousands of USD) **[unverified]** | developers.google.com/identity (restricted scopes) |
| Domain | e.g. fitwise.app / getfitwise.com | — | ~€10–20/yr **[unverified]**, availability not checked | registrar |

Open-source alternatives (if he wants zero vendor lock-in): Coolify or Dokploy (self-host PaaS on Hetzner instead of Vercel), self-hosted Postgres, Lucia/Better Auth, Listmonk + SES/Postal (email), Plausible/Umami (analytics), GlitchTip (Sentry-compatible), MinIO (storage), Lago (billing on top of Stripe). Trade-off: cheaper at 1,000+ users, more ops work now. Recommendation: managed stack until ~€2k MRR.

### 7.1 Own-stack monthly cost at 0 / 100 / 1,000 users (Phase 5) **[estimate]**
Assumptions: 100 users = 15 buying (5 using auto-apply); 1,000 users = 150 buying (50 using auto-apply). Tailoring ≈ 10k tokens in / 3k out ≈ $0.0025 per CV at Haiku-class prices. Autopilot ≈ 150 applications/user/month at ~$0.03 LLM + ~$0.01 compute per application **[estimate, to be measured in Phase 3]**.

| Line | 0 users (build) | 100 users | 1,000 users |
|---|---|---|---|
| Vercel | $0 (Hobby while private) → $20 at launch | $20 | $20–60 |
| Neon | $0 | $0–15 | $30–70 |
| Resend | $0 | $0–20 | $20 |
| Hetzner workers | €5.99 (CX23) | €8.99 (CX33) | €27 (3 × CX33) |
| R2 storage | $0 | $0 | ~$1–3 |
| PostHog / Sentry | $0 | $0 | $0 / $26 |
| LLM: tailoring | ~$1 | ~$8 (3k CVs) | ~$75 (30k CVs) |
| LLM + compute: auto-apply | $0 | ~$30 | ~$300 |
| Gmail CASA (amortised) | — | (use forward address) | ~$50–250 **[unverified]** |
| Domain | ~€1 | ~€1 | ~€1 |
| Stripe fees | — | ~€8 | ~€80 |
| **Total** | **≈ €7–30** | **≈ €75–110** | **≈ €600–900** |
| Revenue (prepaid, e.g. €15–25 per buying user/month) | €0 | ≈ €225–375 | ≈ €2,250–3,750 |

Auto-apply is the cost driver: keep applications on code adapters (≈€0.013 each) and price AI-driven forms separately (§4.3).

---

## 8. Legal & compliance (EU first; Suresh's company as data controller)
- **While on Tab (beta):** user data is stored in Tab's Cloudflare account (Worker, D1, R2) and mail goes through Tab mail; the privacy policy names Tab as hosting/processing provider; beta users accept a beta notice + explicit consents; no payments, so no VAT yet.
- **GDPR roles**: Fitwise (Suresh's company) = controller for user data; processors = Vercel, Neon, Resend, Stripe (Stripe is partly an independent controller), Cloudflare, PostHog, Sentry, LLM provider, Hetzner. Sign/accept each vendor's **DPA**; keep a sub-processor list page.
- **Lawful basis**: contract (Art. 6(1)(b)) for tailoring/search/apply the user asked for; consent for inbox reading, marketing and optional analytics. Work-permit/immigration status is not an Art. 9 special category, but treat it as sensitive: encrypted column, minimum use.
- **Applying on the user's behalf**: explicit, separate consent + approval mode; the user stays the applicant; every application is logged with proof; ToS states the user is responsible for the truth of their profile.
- **EU data residency**: Neon in AWS eu-central-1 (Frankfurt), Vercel functions pinned to fra1, R2 bucket with EU jurisdiction, PostHog EU cloud, Sentry EU region, Hetzner Germany/Finland. US vendors (Vercel, Stripe, Resend, LLM API) rely on the EU–US Data Privacy Framework/SCCs; list them in the privacy policy. Resend EU sending region **[unverified]**.
- **LLM**: provider with zero-retention / no-training terms for API data; CV text sent only for the user's own request.
- **Documents**: Privacy Policy, Terms of Service, DPA (for coach seats/B2B), Cookie Policy, Sub-processor list, Refund & credits policy (EU 14-day withdrawal; digital-content waiver checkbox at credit purchase), Acceptable Use (no fake profiles, no mass-applying).
- **Cookie banner**: essential cookies only by default; PostHog runs cookieless until consent (or EU cloud with consent banner — use an open-source CMP, e.g. vanilla-cookieconsent).
- **Data subject rights**: in-app export (JSON + files) and delete-account (hard delete within 30 days, backups roll off in 7–30 days); retention: JD text 90 days, proofs 180 days, inactive accounts deleted after 24 months with notice.
- **Google API Services User Data Policy** (Gmail): limited use, no ads, no humans reading mail, verification + CASA before public launch of the Gmail option.
- **Job boards' terms**: only public ATS APIs and licensed aggregator APIs; no LinkedIn automation; honour robots/ToS.
- **Company basics**: KvK registration, VAT (OSS for EU B2C digital services), Stripe Tax for VAT collection, imprint/contact page.
- Not legal advice: have a Dutch privacy lawyer review the policy + ToS before launch (≈€500–1,500 one-off **[unverified]**), or start from a generator (e.g. iubenda/Termly) **[pricing unverified]**.

---

## 9. Security
- Auth: Better Auth with email magic link + Google; optional TOTP 2FA; sessions httpOnly, SameSite=Lax; CSRF on mutations.
- Secrets: Vercel env (encrypted), worker `.env` root-only; no secrets in the repo (gitleaks in CI); master vault key only on workers.
- DB: least-privilege roles (web vs worker), row-level ownership checks in every query helper, encrypted columns for work_auth, credentials, refresh tokens.
- Files: private bucket, short-lived signed URLs (5 min), virus scan on upload (ClamAV on worker), file size ≤10 MB, DOCX/PDF only.
- Preview protection: location-format previews are server-rendered PNG with watermark, no text layer; original PDF only after credit spend.
- Workers: Docker, non-root, no inbound ports except HMAC-authenticated `/enqueue` behind Caddy TLS; firewall; automatic security updates; daily DB backups (Neon PITR) + weekly restore test.
- Stripe webhooks verified by signature; credits ledger append-only.
- Monitoring: Sentry for errors, uptime check, alert on apply-adapter failure rate and queue depth.
- Dependency updates via Renovate; `npm audit` in CI; Playwright pinned.
- Incident & breach process: 72-hour notification to the Dutch DPA (Autoriteit Persoonsgegevens) and affected users.

---

## 10. Phased build plan (one builder, working days)

### Phases 1–4 on Tab (start now)
| Phase | Concrete tasks | Days | Done when |
|---|---|---|---|
| **1. Core CV + accounts + credits** (starts 1 Nov; v2 CV fix already running) | 1) Finish v2: own-format tailoring (DOCX in place, PDF closest match, text → ATS layout), Unicode fonts, 2 location formats, watermarked PNG previews. 2) `schema.sql` in D1: user, session, profile, cv_document, tailored_doc, credit_ledger, consent, event. 3) Worker auth: sign-up with invite code + email + password (PBKDF2), login, logout, session cookie, password reset via batched email. 4) "My CVs" page: upload once → fact bank; tailor against job text/URL; history. 5) Credits: balance, "Download – 1 credit", placeholder buy (early-access capture), admin grant endpoint. 6) Pricing/FAQ/legal pages v1 (privacy, terms, beta notice). 7) Move uploads/outputs to R2 binding. | 4 | A beta user signs up with an invite code, uploads a CV, tailors 3 jobs, spends granted credits on a location format, and all files are in R2 |
| **2. Job search + tracker + email** | 1) Onboarding screens: titles, seniority, countries × work mode × contract type, languages, work-auth per country → answer bank (locked auth answers), consents. 2) `engine/boards.json`: seed ~1,500 public ATS boards (Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Recruitee, Personio, Teamtailor) from public sponsor registers + known employers; `crawl.py` streams jobs to `/api/admin/jobs/bulk` (2×/day schedule). 3) Matcher: filters + eligibility screen (residency, citizenship, clearance, W-2-only, language required) + dedupe + blocklist/watchlist; reasons stored. 4) Tracker (board/table), needs-you queue (manual), CSV export, "Ask Fitwise" prompt → filters. 5) Claim `fitwise@mail.tab.bot`; `outbox.py` sends morning digest (only new roles; skip when 0) + needs-you digest; unsubscribe link. 6) `inbox.py`: forwarding address reader → reply types (Acknowledged / Interview / Assessment / Rejected / Offer) → tracker + reply alert; rejected-company guard. | 5 | 5 beta users in 3 countries get a correct morning digest 2 days in a row; a forwarded rejection flips the tracker row |
| **3. Autopilot engine (Tab browser workers)** | 1) Approval modes (Review first default / Full auto), daily cap, pause button in every email. 2) Apply queue in D1 (UNIQUE user+job, idempotency). 3) Autopilot schedule: reads approved items → spawns one browser worker per batch with the batch file → per application: fresh context, open employer ATS, fill from profile + answer bank, upload tailored CV, recruiter note, submit, verify confirmation, proof JPEG to R2, status via admin API. 4) Adapters in order: Greenhouse, Lever, Ashby, then Workable, SmartRecruiters. 5) Hard stops → needs-you with link + CV + answers; no retry on unknown submit. 6) Run report email: funnel line + one line per role. 7) Audit page for each application (every answer given). | 6 | 30 real applications for consenting beta users, ≥90% verified on supported ATS, 0 untruthful answers in the audit |
| **4. Beta launch on Tab** | Invite 20–50 users (waitlist on the landing page), demo video, onboarding polish, feedback form, admin dashboard (runs, failures per adapter, kill switch), cost check per user | 3 | 2 weeks of beta, 5+ testimonials, top 10 issues fixed |
| **Total on Tab** | | **≈18 working days** | |

### Phase 5: migrate to his own stack (when Stripe + domain exist; ≈5–7 days)
| Tab now | Own stack | Migration step |
|---|---|---|
| Cloudflare Worker at fitwise.sites.tab.bot | Next.js on Vercel (fra1) + own domain | Port `src/worker` routes to Next.js route handlers; same `src/shared` code |
| D1 (SQLite) | Neon Postgres (Frankfurt) + Drizzle | `schema.sql` → Drizzle schema; export D1 → CSV/SQL → import; switch IDs unchanged |
| R2 binding on Tab's account | R2 bucket in his Cloudflare account (EU jurisdiction) | rclone copy; signed URLs |
| Worker auth (password + invite codes) | Better Auth (magic link, Google, 2FA) | Import users with password hashes (PBKDF2 supported via custom verifier) or force reset |
| Tab mail `fitwise@mail.tab.bot` | Resend on own domain (send + inbound) | DNS (SPF/DKIM/DMARC), swap `outbox.py` sender; forwarding address moves to `in.<domain>` |
| Tab schedules | Vercel cron + BullMQ on Hetzner | Same scripts as queue jobs |
| Tab browser workers | Playwright worker pool on Hetzner (Docker) | Same adapters; add per-user encrypted vault for account-based ATS |
| Placeholder credits + job bundles | Stripe Checkout one-time payments (credit packs + job bundles) + Stripe Tax | Webhook → existing credit_ledger |
| D1 events + admin stats | PostHog (EU) + Sentry (EU) | Add SDKs |
| Forwarding-address inbox | + Gmail OAuth read-only (after Google verification/CASA) | Optional, both kept |
Then the Product Hunt launch (§12) on the own domain with live payments.

---

## 11. Accounts: who creates what

**Now (Phases 1–4 on Tab): nothing is required from Suresh to start.** Optional:
- An AI API key in his/his company's name (card) to switch on smart rewrites (otherwise rule-based tailoring keeps working).
- His OK to claim the mailbox `fitwise@mail.tab.bot` for Fitwise digests (free, Tab-side).
- Optional: a free Google OAuth client for "Sign in with Google" (Tab can set it up on his Google account; no card).

**Phase 5 — Suresh must create or approve (card, ID, legal identity, or his personal profile):**
1. **Stripe** — KYC (ID, company KvK, bank IBAN). Payments are impossible without it.
2. **Vercel Pro** — card ($20/mo); Hobby can't be used commercially.
3. **Hetzner Cloud** — card + identity check.
4. **Domain** (registrar) — card; choose name (fitwise.app / getfitwise.com — availability not checked).
5. **LLM API account** (if not done above) — card, billing in his/company name.
6. **Google Cloud OAuth consent screen + verification** — company identity, domain verification; pays the CASA assessment when Gmail sync goes public.
7. **Product Hunt maker account** — must be his own real profile.
8. **Lawyer / policy generator** — contract in company name.
9. Optional: Cloudflare R2 (may ask for a payment method to enable **[unverified]**), residential proxy vendor (card).

**Phase 5 — Tab can sign up with reachparimi@gmail.com (free tiers, no card), handling verification codes from his inbox, after his OK:**
GitHub private repo (his connected account sbparimi), Neon (Free), Resend (Free; DNS once the domain exists), PostHog (Free, EU cloud), Sentry (Developer, EU region), Adzuna API key (evaluation), Better Auth (library, no account).

---

## 12. Product Hunt launch checklist (after Phase 5; a closed beta on Tab comes first)
- **Timing**: launch 00:01 PT on a Tuesday–Thursday; avoid big-launch days; teaser page "Coming soon" on PH 1–2 weeks before.
- **Assets**: name + tagline (≤60 chars, e.g. "Tailor your CV to every job — truthfully, on autopilot"), 240×240 logo/GIF, 5–7 gallery images 1270×760 (before/after CV, match score, location formats, needs-you list, tracker, autopilot report), 60–90 s demo video (YouTube/Loom), first comment ready.
- **Demo video script**: 0–10 s hook (a job ad + "your CV, rewritten for it in 30 s, nothing invented") → upload CV → tailored CV in own layout → location previews → morning digest → autopilot report with proof → needs-you list → pricing → CTA.
- **Maker comment**: who Suresh is (QA/AI lead who built his own job-hunt system), the problem (1,000s of postings, walls, untruthful AI CVs), what Fitwise does differently (truth guard, per-country rules, no LinkedIn bots), PH offer, ask for feedback.
- **Landing**: hero + demo video, 3-step how-it-works, live sample (try without signup), pricing, FAQ (truth, privacy, LinkedIn, refunds), testimonials from beta users, trust badges (EU data, GDPR).
- **Waitlist**: Resend audience + referral position; invite 50–100 beta users 2 weeks before (Job Hunt OS LinkedIn page + @your.job.buddy audience), collect 5–10 testimonials and fix top issues.
- **Launch day**: notify waitlist at launch hour, post on LinkedIn/X/Instagram/communities (no vote-begging), reply to every PH comment within 30 min, PH-only coupon, live counter of tailored CVs.
- **After**: day-2 recap email, convert PH visitors to free → credits; post-mortem with PostHog funnel.
- **Ready gates**: Stripe live mode tested with a real €5 purchase + refund, legal pages live, status page, error budget, support email (hello@domain) monitored, rate limits on, cost alerts on every vendor.

---

## 13. Open decisions for Suresh
1. Brand + domain: keep **Fitwise** (current demo) — check domain/trademark.
2. One wallet in EUR for both credits and job bundles (recommended for an EU launch) vs USD credits + EUR bundles as agreed.
3. Gmail OAuth at launch (needs Google verification + CASA fee) vs forwarding address first (recommended; the only option on Tab).
6. Beta size on Tab (proposed 20–50 users, ~10 on Autopilot) and when to start Phase 5 (trigger: Stripe account ready).
4. Which countries at launch (proposed NL, DE, UK, US-remote, IE, BE).
5. Company entity for Stripe/legal (his existing NL company?).

## 14. Success metrics (first 90 days)
Activation (CV uploaded + first tailored CV) ≥60% of signups · Free→paid ≥4% · Autopilot verified-submit rate ≥90% on supported ATS · 0 untruthful-answer incidents · Reply rate per application tracked and shown · Churn <8%/month.
