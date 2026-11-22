#!/usr/bin/env python3
"""Courses tab (3 Nov 2026, Suresh WhatsApp 9:33 PM: "create a tab for courses Just like how udemy display courses...").
Builds site/courses.html (Udemy-style card grid) and site/courses/<slug>.html (Udemy-style landing page).
Run from build_pages.py (exec'd at the end; uses page(), D, S). Data: below + courses_c1_curriculum.json (read from the
Udemy draft 7406381 curriculum, 3 Nov 2026). Rules: no ratings, student counts, reviews or testimonials; never name an employer."""
import os, json, html as _h
E = _h.escape
# ---- launch discount config (Suresh 9:38 PM 3 Nov 2026: "add disscount coupons with expiry of december 31st"). ONE place.
# A per-course "sale" price shows only when Suresh gives a number (strikethrough list + sale). Never invent one.
# Course 1 launch price confirmed by Suresh 9:39 PM 3 Nov 2026: $12.99 (₹449 in India), list $19.99 (₹799 in India). Masterclass: TBA, no numbers.
LAUNCH = {"code": "LAUNCH2026", "ends_iso": "2026-12-31T23:59:59+01:00", "ends_label": "31 Dec 2026"}
C1_SECS = json.load(open(os.path.join(D, "courses_c1_curriculum.json")))

def fmt_min(sec):
    m = round(sec / 60)
    return f"{m}min" if m < 60 else f"{m//60}h {m%60}min" if m % 60 else f"{m//60}h"

def total_hm(sec):
    m = round(sec / 60); return f"{m//60}h {m%60:02d}m" if m >= 60 else f"{m}m"

c1_sec_total = sum(l["sec"] for s in C1_SECS for l in s["lectures"])
c1_lec = sum(len(s["lectures"]) for s in C1_SECS)

BIO = ("<p>Suresh Parimi has more than 18 years in QA and test leadership. Today he is AI &amp; Automation Quality Lead at a major Dutch logistics company, "
       "where his work covers test automation and the quality of AI systems.</p>"
       "<p>He builds his courses around one idea: AI agents can now write a lot of the test code, so the tester's job moves to intent, review, risk and the release decision. "
       "Every course is project-based, with real runs on screen and tasks you do yourself. Courses are published under the Skills in Action (SIA) brand.</p>")

COURSES = [
 {"slug": "playwright-codex-agentic-test-automation",
  "title": "Playwright + Codex: Agentic Test Automation from Jira",
  "subtitle": "The Agentic QA Factory: Codex turns Jira tickets into reviewed specs and Playwright tests. You write zero test code.",
  "short": "Codex turns Jira tickets into reviewed specs and Playwright tests. You own the risk.",
  "price": "$19.99", "price_in": "₹799", "price_note": "₹799 in India", "sale": "$12.99", "sale_in": "₹449", "coupon": True, "status": "Coming soon to Udemy", "badge": "Coming soon", "level": "Intermediate",
  "hours": total_hm(c1_sec_total), "lectures": c1_lec, "updated": "11/2026", "lang": "English",
  "img": "/courses/playwright-codex-agentic-test-automation.jpg", "draft": False,
  "learn": [
   "Set up Codex CLI with Playwright MCP, Jira (Atlassian) MCP and the Playwright Test Agents, with sandbox and approval guardrails",
   "Write an AGENTS.md rulebook and Codex skills that every agent follows, and prove it by asking Codex to break a rule",
   "Turn a Jira ticket into an approved requirement, numbered business rules and a spec, traced from ticket to test",
   "Have Codex build a Playwright + TypeScript framework: config, page objects, fixtures, synthetic data, five Docker environments",
   "Use the Playwright planner agent to write reviewed test plans for MFA sign-in, booking rules, shadow DOM and canvas UI",
   "Generate positive, negative, edge and abuse test cases with AI, then review them for gaps, duplicates and traceability",
   "Turn approved plans into Playwright tests with the generator, including dynamic data and MFA auth without hard-coded secrets",
   "Gate AI-written code: secret scanning, a verify gate that blocks hard waits, and reviewing generated tests like a lead"],
  "includes": [("video", f"{fmt_min(c1_sec_total).replace('min',' min')} on-demand video"), ("file", "Downloadable resources: course tickets and code checkpoints"),
               ("task", f"{len(C1_SECS)} mini projects with full solutions"), ("phone", "Access on mobile and TV"), ("cert", "Certificate of completion")],
  "sections": [{"title": s["title"], "lectures": [(l["title"], fmt_min(l["sec"])) for l in s["lectures"]], "len": fmt_min(sum(l["sec"] for l in s["lectures"]))} for s in C1_SECS],
  "content_note": "",
  "requirements": [
   "Some software testing experience, manual or automated. No TypeScript or Playwright knowledge needed: Codex writes the code",
   "A Windows, macOS or Linux computer that can run Node.js, Git, VS Code and Docker Desktop (installed together in lecture 2.1)",
   "A ChatGPT account to sign in to Codex, or your own OpenAI API key. Lecture 2.8 shows both paths",
   "A free Jira Cloud site is recommended for the ticket lectures; the course tickets are also provided as files"],
  "desc": [
   "<p><i>This course contains the use of artificial intelligence. The narration uses an AI voice reading scripts written and reviewed by the instructor, and OpenAI Codex, an AI coding agent, is one of the tools the course teaches.</i></p>",
   "<p>Most Playwright + AI courses show a chatbot writing one test. This course teaches what QA teams need next: OpenAI Codex as the engine, and a Jira ticket as the starting point.</p>",
   "<p>You run an agentic QA factory for a realistic healthcare portal, ParimiPractice, where every patient and record is synthetic. A Jira ticket comes in. Codex reads it and asks the product owner its questions before anyone writes a test. The answers become numbered business rules and a reviewed spec. The Playwright planner agent explores the live app and writes a test plan. The generator turns the approved plan into Playwright + TypeScript tests. And a quality gate stops a generated test with a hard wait before it reaches your suite.</p>",
   "<p>You write no test code. You write the intent in plain English: rules, specs, prompts and policies. Codex writes the tests, page objects, fixtures and scripts in real runs on screen, nothing faked. Your job is the one agents can't do: review, decide and own the risk.</p>",
   "<p><b>What you build, step by step:</b></p><ul><li>Codex with Playwright MCP, Jira MCP and the Playwright Test Agents, behind sandbox and approval guardrails</li><li>An AGENTS.md rulebook that Codex follows, and refuses to break</li><li>Ticket-to-spec intake with traceability from ticket to test</li><li>A framework on five Docker environments with synthetic patient data, drift checks and secret scanning</li><li>Reviewed test plans, AI-generated test cases, and generated tests you review like a lead</li></ul>",
   "<p>Every lecture is short, in 4K, and ends with a risk lens and a \"your turn\" task. Mini projects make you do it yourself. Work with your ChatGPT sign-in or your own OpenAI key; both paths are shown.</p>",
   "<p>Lecture 1.1 shows the whole factory end to end. This course goes deep on the first two factory stages: agent setup and autonomous test design and generation.</p>",
   "<p class=\"muted small\">&copy; 2026 Skills in Action (SIA)</p>"],
  "who": [
   "Manual testers who want to automate with AI agents without learning to code first",
   "Automation engineers and SDETs who want an agentic Playwright workflow with Codex, from ticket to test",
   "QA leads and test managers designing AI-assisted testing with review gates, traceability and guardrails",
   "Testers in regulated domains such as healthcare who need evidence and audit trails, not just green runs"]},
]

# ---- course 2: Suresh's masterclass (his structure, WhatsApp 9:32 PM 3 Nov 2026). Draft; price TBA.
C2 = [
 ("Phase 1", "Welcome to AI Quality Engineering", "20–25 min", ["What you will build during this course", "The evolution of QA into AI Quality Engineering", "Understanding the ProcureAI enterprise project", "Tools, prerequisites and repository walkthrough"]),
 ("Phase 1", "Understanding AI Quality and Evaluation", "50–60 min", ["Traditional software testing versus AI evaluation", "Deterministic versus probabilistic systems", "Why LLM outputs cannot be validated using exact assertions alone", "Understanding AI evaluation datasets", "Understanding scorers, graders and benchmarks", "Offline versus online evaluation", "The three layers of AI quality assurance"]),
 ("Phase 1", "Designing an Enterprise AI Test Strategy", "60–75 min", ["Understanding the enterprise AI application landscape", "Designing a layered testing strategy", "Unit, component, contract, integration and E2E testing", "Determining where deterministic testing ends and AI evaluation begins", "Risk-based testing for AI systems", "Mapping quality gates to release risks", "Building an enterprise test coverage matrix", "Creating a living AI test strategy", "Assignment 1: an enterprise AI test strategy for ProcureAI"]),
 ("Phase 2", "Setting Up the Enterprise AI Testing Environment", "45–55 min", ["ProcureAI application architecture", "Understanding frontend, backend and agent services", "Installing Python and configuring virtual environments", "Setting up Playwright and Pytest", "Connecting PostgreSQL and configuring test data", "Setting up GitHub and the initial repository"]),
 ("Phase 2", "Building a Reusable Test Automation Framework", "65–75 min", ["Designing the automation framework", "Pytest fixtures and configuration", "Test data factories", "Environment-specific configuration", "Reusable API clients", "Logging, reporting and evidence collection", "Parallel execution", "Framework maintainability and debugging"]),
 ("Phase 2", "Full-Stack Application Testing", "75–90 min", ["React UI automation using Playwright", "Authentication and session management", "Authorization and role-based testing", "Backend service testing", "Database validation using SQL", "Multi-tenant isolation", "Background jobs and asynchronous processing", "Email and document ingestion", "End-to-end RFQ and quotation journeys"]),
 ("Phase 2", "Advanced API and Integration Testing", "65–75 min", ["API contract testing", "Schema validation", "Negative and boundary testing", "Idempotency and duplicate requests", "Timeouts, retries and failure recovery", "Webhooks and event processing", "Distributed data consistency", "Integration failure investigation", "Assignment 2: automate a complete RFQ journey"]),
 ("Phase 3", "Building Your First AI Evaluation Framework", "55–65 min", ["Understanding AI evaluation architecture", "Setting up Google AI Studio", "Connecting Gemini to Python", "Setting up Braintrust", "Creating your first evaluation dataset", "Building your first scorer", "Running and interpreting experiments"]),
 ("Phase 3", "Evaluation Dataset Engineering and Advanced Scoring", "75–90 min", ["Designing golden datasets", "Generating synthetic test scenarios", "Building edge-case datasets", "Extracting cases from production failures", "Dataset versioning", "Exact and rule-based scorers", "Semantic evaluation", "LLM-as-a-judge and rubric design", "Calibrating graders against human assessments"]),
 ("Phase 3", "Evaluating Business-Critical AI Applications", "75–90 min", ["Evaluating information extraction", "Measuring extraction accuracy", "Evaluating product and material matching", "Classification and routing evaluation", "Generated RFQ and quotation quality", "Grounding and evidence verification", "Hallucination evaluation", "Instruction adherence", "Statistical evaluation and regression analysis"]),
 ("Phase 3", "RAG and Agentic AI Evaluation", "85–100 min", ["Understanding RAG evaluation", "Retrieval precision and recall", "Context relevance and faithfulness", "Evaluating generated answers", "Understanding agent execution traces", "Evaluating tool selection", "Validating tool arguments and execution order", "Evaluating agent decisions and source data", "Measuring task completion and business outcomes", "Agent cost, latency and recovery evaluation", "Assignment 3: a multi-dimensional evaluation framework"]),
 ("Phase 4", "AI Security and Adversarial Testing", "50–60 min", ["Threat modelling AI applications", "Direct and indirect prompt injection", "Document-based prompt injection", "Data leakage and tenant isolation", "Unauthorized tool execution", "Adversarial evaluation datasets", "AI security release gates"]),
 ("Phase 4", "Building Controlled AI Testing Agents", "75–90 min", ["Architecture of an AI testing agent", "Requirement analysis agents", "Generating candidate test scenarios", "AI-powered exploratory testing", "Adversarial test generation", "Automated defect reproduction", "Analysing application and agent traces", "Human approval and bounded execution", "Evaluating the reliability of AI testing agents", "Assignment 4: a controlled AI testing agent with human approval"]),
 ("Phase 5", "AI Quality Gates, CI/CD and Release Readiness", "75–90 min", ["AI quality pipeline architecture", "GitHub Actions implementation", "Change-based test selection", "Running deterministic tests in CI", "Running AI evaluations in CI", "Baseline comparison and regression detection", "Statistical thresholds and confidence", "Blocking releases based on critical quality failures", "Creating release readiness reports"]),
 ("Phase 5", "Production Observability, Failure Investigation and Enterprise Capstone", "110–130 min", ["AI production observability architecture", "Collecting browser, API and application evidence", "Database and asynchronous job investigation", "Analysing agent execution traces", "Model outputs and grader analysis", "Correlating failures with deployments and configuration", "Root-cause analysis across layers", "Turning production incidents into regression cases", "Completing the ProcureAI enterprise quality framework", "Presenting an evidence-based release recommendation"]),
]
c2_lessons = sum(len([x for x in s[3] if not x.startswith("Assignment")]) for s in C2)
COURSES.append({
  "slug": "ai-quality-engineering-llm-evals-agent-testing",
  "title": "AI Quality Engineering: LLM Evals & AI Agent Testing",
  "subtitle": "Enterprise test automation, LLM evaluation, agentic AI testing and release governance, built on one progressive enterprise project.",
  "short": "Evaluate LLM apps and AI agents, and make an evidence-based release call.",
  "price": "TBA", "sale": None, "coupon": False,  # LAUNCH2026 box removed from the masterclass (Suresh OK, WhatsApp 11:15 PM 3 Nov 2026)
  "status": "In development · curriculum is a draft", "badge": "Coming soon", "level": "Intermediate–Advanced",
  "hours": "16–18h planned", "lectures": c2_lessons, "updated": "11/2026 (draft)", "lang": "English",
  "img": "/courses/ai-quality-engineering-llm-evals-agent-testing.jpg", "draft": True, "working_title": True,
  "learn": [
   "Design an enterprise AI test strategy: test layers, risks, ownership and quality gates",
   "Decide where deterministic testing ends and AI evaluation begins",
   "Build a reusable automation framework for UI, API, database and integration tests",
   "Engineer evaluation datasets: golden, synthetic, edge-case and production-derived, with versioning",
   "Write scorers, design LLM-as-a-judge rubrics and calibrate graders against human assessments",
   "Evaluate RAG: retrieval precision and recall, context relevance, faithfulness and hallucination",
   "Evaluate AI agents: tool selection, tool arguments, execution order, task completion, cost and latency",
   "Test AI security: direct, indirect and document-based prompt injection, data leakage, unauthorized tool use",
   "Build a controlled AI testing agent with human approval and execution boundaries",
   "Run tests and AI evaluations in CI with GitHub Actions, and block releases on critical quality failures",
   "Investigate production failures across layers and turn incidents into regression cases",
   "Present an evidence-based release recommendation for an enterprise AI application"],
  "includes": [("video", "16–18 hours of on-demand video (planned)"), ("file", "12 downloadable resources: templates, scorer library, CI templates, full repo"),
               ("task", "5 practical assignments and a final capstone"), ("quiz", "Quizzes at the end of every major section"), ("cert", "Certificate of completion")],
  "sections": [{"title": f"{t}", "phase": ph, "lectures": [(x, "") for x in ls], "len": ln} for ph, t, ln, ls in C2],
  "content_note": "Draft curriculum. Sections, lessons and lengths may change before launch.",
  "requirements": [
   "Experience in software testing or QA. This is an intermediate-to-advanced course, not one for absolute beginners",
   "Working knowledge of Python: the course does not teach Python basics",
   "A computer that can run Python, Playwright, Pytest, PostgreSQL and Git",
   "No paid subscriptions for the core learning journey: labs use free-tier model access where available"],
  "desc": [
   "<p><b>Working title. This course is in development and the curriculum below is a draft.</b></p>",
   "<p>Most AI testing courses test a few LLM responses. This masterclass teaches you to own the quality of a complete AI application: its software layers, its AI behaviour, its autonomous agents and the release decision.</p>",
   "<p>You build one application through the whole course: <b>ProcureAI</b>, an enterprise procurement app that handles RFQs and quotations with a web UI, backend services, a database, document ingestion and AI agents. Each phase makes the project more complete:</p>",
   "<ol><li><b>Understand AI quality.</b> Why traditional testing is not enough, and how AI quality is measured.</li><li><b>Engineer software quality.</b> UI, API, database and integration automation.</li><li><b>Evaluate AI behaviour.</b> Datasets, scorers, graders and statistical evaluation.</li><li><b>Assure autonomous agents.</b> Decisions, tool calls, trajectories and business outcomes.</li><li><b>Automate quality engineering.</b> Bounded AI testing agents and CI/CD quality gates.</li><li><b>Govern production quality.</b> Investigate failures, decide release readiness and keep improving.</li></ol>",
   "<p><b>How every lesson works:</b> the business context, the concept, the implementation in real code, a failure demonstration, how to detect and measure that failure, an exercise for you, and a short knowledge check. Lectures stay between 5 and 15 minutes.</p>",
   "<p><b>What you take away:</b> an enterprise AI test strategy template, a reference architecture, a risk-based test matrix, an evaluation dataset template, a reusable scorer library, an agent evaluation schema, an AI security catalogue, a controlled testing-agent framework, GitHub Actions templates, a release readiness template, a failure investigation playbook and the full ProcureAI repository with tagged milestones.</p>",
   "<p><b>What this course leaves out on purpose:</b> Python basics, a React course, machine-learning maths, training models, and every evaluation framework on the market. It teaches what an AI Quality Engineering professional needs.</p>",
   "<p class=\"muted small\">Free-tier model access has quotas, and free-tier content may be used by the provider to improve its products. Never upload confidential company data in the labs.</p>"],
  "who": [
   "QA managers and test engineering managers",
   "Senior QA automation engineers moving into AI quality",
   "AI quality engineers and AI evaluation engineers",
   "AI engineers, technical product managers, engineering managers and test architects who need to know when an AI feature is safe to ship"]})

COURSES.append({
  "slug": "autonomous-software-factory-engineering",
  "title": "Autonomous Software Factory Engineering",
  "subtitle": "How to engineer software delivery with coordinated autonomous agents.",
  "short": "Engineer software delivery with coordinated autonomous agents.",
  "price": "TBA", "status": "Planned", "badge": "Planned", "level": "", "hours": "", "lectures": 0, "updated": "", "lang": "English",
  "img": "/courses/autonomous-software-factory-engineering.jpg", "planned": True})


def price_html(c, cls):
    if c.get("sale"):
        lp, sp = float(c["price"].strip("$")), float(c["sale"].strip("$")); off = round((1 - sp / lp) * 100)
        ends = LAUNCH["ends_iso"]
        return (f'<span class="cr-pw" data-ends="{ends}"><span class="{cls} cr-p" data-in="{E(c["sale_in"])}" data-exp="{E(c["price"])}" data-exp-in="{E(c["price_in"])}">{E(c["sale"])}</span>'
                f'<s class="cr-was cr-p" data-in="{E(c["price_in"])}" data-exp-hide="1">{E(c["price"])}</s><span class="cr-off" data-exp-hide="1">{off}% off</span>'
                f'<span class="cr-pn" data-in="about {E(c["sale"])} elsewhere (list {E(c["price"])})" data-exp="{E(c["price_in"])} in India" data-exp-in="about {E(c["price"])} elsewhere">'
                f'{E(c["sale_in"])} in India (list {E(c["price_in"])})</span></span>')
    din = f' data-in="{E(c["price_in"])}"' if c.get("price_in") else ""
    p = f'<span class="{cls} cr-p"{din}>{E(c["price"])}</span>'
    if c.get("price_note"):
        p += f'<span class="cr-pn" data-in="about {E(c["price"])} elsewhere">{E(c["price_note"])}</span>'
    return p

def disc_html(c, compact=False):
    if not c.get("coupon"): return ""
    k = LAUNCH["code"]
    if compact:
        return (f'<div class="cr-disc sm" data-ends="{LAUNCH["ends_iso"]}"><p class="cr-dl">Launch {"price" if c.get("sale") else "discount"} ends {LAUNCH["ends_label"]} <span class="cr-cd"></span></p>'
                f'<div class="cr-cp"><code>{k}</code><button type="button" data-code="{k}" aria-label="Copy coupon code {k}">Copy</button></div>'
                f'<p class="cr-cpn">Coupon code, applied at launch on Udemy</p></div>')
    return (f'<div class="cr-disc" data-ends="{LAUNCH["ends_iso"]}"><p class="cr-dl">⏰ <b>Launch {"price" if c.get("sale") else "discount"} ends {LAUNCH["ends_label"]}</b> <span class="cr-cd"></span></p>'
            f'<p class="cr-cpn">Coupon code — applied at launch on Udemy</p><div class="cr-cp"><code>{k}</code><button type="button" data-code="{k}" aria-label="Copy coupon code {k}">Copy</button></div>'
            f'<p class="cr-cpn2">People on the Notify list get the coupon link when the course goes live.</p></div>')

COMMON_JS = """<script>(function(){var tz="";try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||""}catch(e){}
var IN=/^Asia\\/(Kolkata|Calcutta)$/.test(tz);if(IN){document.querySelectorAll(".cr-p[data-in],.cr-pn[data-in]").forEach(function(p){p.textContent=p.getAttribute("data-in")})}
document.querySelectorAll(".cr-pw[data-ends]").forEach(function(w){if(new Date(w.getAttribute("data-ends")).getTime()>Date.now())return;w.querySelectorAll("[data-exp-hide]").forEach(function(x){x.style.display="none"});w.querySelectorAll("[data-exp]").forEach(function(x){x.textContent=IN&&x.getAttribute("data-exp-in")?x.getAttribute("data-exp-in"):x.getAttribute("data-exp")})});
function tick(){document.querySelectorAll(".cr-disc[data-ends]").forEach(function(d){var ms=new Date(d.getAttribute("data-ends")).getTime()-Date.now(),c=d.querySelector(".cr-cd");if(ms<=0){d.style.display="none";return}var h=Math.floor(ms/36e5),dd=Math.floor(h/24);h=h%24;var m=Math.floor(ms/6e4)%60;if(c)c.textContent="· "+(dd>0?dd+(dd==1?" day ":" days ")+h+(h==1?" hour":" hours"):h+"h "+m+"m")+" left"})}
tick();setInterval(tick,60000);
document.querySelectorAll("button[data-code]").forEach(function(b){b.addEventListener("click",function(ev){ev.preventDefault();ev.stopPropagation();var t=b.getAttribute("data-code");function ok(){b.textContent="Copied ✓";setTimeout(function(){b.textContent="Copy"},2000)}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,function(){b.textContent=t})}else{var i=document.createElement("textarea");i.value=t;document.body.appendChild(i);i.select();try{document.execCommand("copy");ok()}catch(e){b.textContent=t}document.body.removeChild(i)}})})})();</script>"""

ICONS = {"video": "▶", "file": "📄", "task": "📝", "phone": "📱", "cert": "🏆", "quiz": "❓"}

CR_CSS = """
<style>
.cr-wide{max-width:1184px;margin:0 auto;padding-left:24px!important;padding-right:24px!important;box-sizing:border-box}@media (max-width:620px){.cr-wide{padding-left:16px!important;padding-right:16px!important}}.cr-hero{padding:34px 0 10px;text-align:left}.cr-hero h1{font-size:clamp(1.7rem,4.5vw,2.4rem);margin:.15em 0 .25em}.cr-hero .lead{max-width:760px}
.cr-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px;padding:18px 0 56px}
@media (max-width:1023px){.cr-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:599px){.cr-grid{grid-template-columns:1fr}}
.cr-card{display:flex;flex-direction:column;color:inherit;text-decoration:none;background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;transition:box-shadow .15s,transform .15s}
.cr-card:hover{box-shadow:0 8px 24px rgba(16,24,40,.12);transform:translateY(-2px)}
.cr-card{text-align:left}.cr-card img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;background:#0e121c}
.cr-card .b{padding:12px 14px 16px;display:flex;flex-direction:column;gap:5px;flex:1}
.cr-card h2{text-align:left;font-size:1.02rem;line-height:1.3;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cr-card .ins{font-size:.8rem;color:var(--mut)}.cr-card .sh{font-size:.88rem;color:#2b2f37;line-height:1.4}
.cr-card .mt{font-size:.78rem;color:var(--mut)}.cr-card .pr{font-weight:800;font-size:1.05rem;margin-top:auto;padding-top:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cr-badge{display:inline-block;font-size:.72rem;font-weight:700;padding:3px 8px;border-radius:4px;background:#fcebc6;color:#6b4a00;letter-spacing:.01em}
.cr-badge.pl{background:#ece6fb;color:#4b2f8f}.cr-badge.dr{background:#e3f4f0;color:#0b6b58}
.cr-band{background:#1c1d1f;color:#fff}
.cr-band .in{max-width:1184px;margin:0 auto;padding:28px 24px 34px}
.cr-band .lc{max-width:700px;min-height:250px}
.cr-crumb{font-size:.85rem;margin:0 0 14px}.cr-crumb a{color:#c0c4fc;text-decoration:none;font-weight:700}.cr-crumb span{color:#c0c4fc;margin:0 6px}
.cr-band h1{font-size:clamp(1.55rem,3.6vw,2.15rem);line-height:1.2;margin:0 0 10px;color:#fff}
.cr-band .sub{font-size:1.1rem;line-height:1.45;margin:0 0 14px;color:#fff}
.cr-band .row{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:.88rem;align-items:center;margin:8px 0}
.cr-band .row a{color:#c0c4fc}.cr-band .muted2{color:#d1d7dc}
.cr-page{max-width:1184px;margin:0 auto;padding:0 24px 64px;display:grid;grid-template-columns:minmax(0,700px) 340px;justify-content:space-between;gap:40px}
.cr-main{grid-column:1;grid-row:1;padding-top:30px;min-width:0}
.cr-side{grid-column:2;grid-row:1;align-self:start;position:sticky;top:76px;margin-top:-286px;z-index:2;max-height:calc(100vh - 90px);overflow-y:auto;border-radius:8px;scrollbar-width:thin}
.cr-box{background:#fff;border:1px solid #d1d7dc;box-shadow:0 2px 4px rgba(0,0,0,.08),0 4px 12px rgba(0,0,0,.08);border-radius:8px;overflow:hidden}
.cr-box img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover}
.cr-box .bd{padding:18px 20px 20px}
.cr-price{font-size:2rem;font-weight:800;margin:0;display:flex;flex-wrap:wrap;align-items:baseline;gap:0 6px}.cr-status{font-weight:700;color:#0b6b58;margin:2px 0 14px;font-size:.95rem}
.cr-nf{margin-top:14px}.cr-nf label.l{display:block;font-weight:700;margin:0 0 6px}
.cr-nf form{display:flex;flex-direction:column;gap:8px}
.cr-nf input[type=email]{font:inherit;padding:12px 12px;border:1px solid #6a6f73;border-radius:6px;width:100%;box-sizing:border-box}
.cr-nf button{font:inherit;font-weight:800;padding:13px 14px;border:0;border-radius:6px;background:#0b6b58;color:#fff;cursor:pointer}
.cr-nf button:hover{background:#0e8a70}.cr-nf button:disabled{opacity:.6}
.cr-nf .msg{min-height:1.2em;font-size:.9rem;margin:8px 0 0;font-weight:600}.cr-nf small{display:block;color:var(--mut);font-size:.78rem;margin-top:6px}
.cr-nf .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.cr-inc{margin:18px 0 0}.cr-inc h3{font-size:1rem;margin:0 0 8px}.cr-inc ul{list-style:none;padding:0;margin:0}.cr-inc li{font-size:.88rem;padding:4px 0;display:flex;gap:10px}.cr-inc li i{font-style:normal;width:18px;text-align:center;color:#2b2f37}
.cr-learn{border:1px solid #d1d7dc;padding:20px 22px 12px;margin:0 0 30px;background:#fff}
.cr-learn h2,.cr-main h2{font-size:1.45rem;margin:0 0 14px;text-align:left}.cr-main,.cr-band,.cr-side{text-align:left}
.cr-learn ul{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:1fr 1fr;gap:4px 26px}
.cr-learn li{position:relative;padding:0 0 10px 26px;font-size:.9rem;line-height:1.45}
.cr-learn li:before{content:"✓";position:absolute;left:2px;top:0;font-weight:700}
.cr-sum{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:.88rem;margin:0 0 8px}
.cr-sum button{font:inherit;font-weight:800;color:#0b6b58;background:none;border:0;cursor:pointer;padding:6px 0}
.cr-note{font-size:.85rem;background:#fff7e6;border:1px solid #f5d38a;border-radius:6px;padding:8px 12px;margin:0 0 10px}
.cr-acc{border:1px solid #d1d7dc;margin:0 0 30px;background:#fff}
.cr-acc details{border-top:1px solid #d1d7dc}.cr-acc details:first-child{border-top:0}
.cr-acc summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;padding:14px 18px;background:#f7f9fa;font-weight:700}
.cr-acc summary::-webkit-details-marker{display:none}
.cr-acc summary .ch{transition:transform .15s;font-size:.8rem}.cr-acc details[open] summary .ch{transform:rotate(180deg)}
.cr-acc summary .t{flex:1;line-height:1.35}.cr-acc summary .t small{display:block;font-weight:600;color:var(--mut);font-size:.75rem;text-transform:uppercase;letter-spacing:.04em}
.cr-acc summary .m{font-weight:400;font-size:.85rem;color:#2b2f37;white-space:nowrap}
.cr-acc ul{list-style:none;margin:0;padding:8px 18px 12px}.cr-acc li{display:flex;gap:12px;font-size:.88rem;padding:7px 0;align-items:flex-start}
.cr-acc li .i{width:16px;color:#6a6f73;flex:0 0 16px}.cr-acc li .n{flex:1}.cr-acc li .d{color:#6a6f73;white-space:nowrap}
.cr-main ul.req{padding-left:20px;margin:0 0 30px}.cr-main ul.req li{margin:0 0 8px;font-size:.92rem}
.cr-desc{margin:0 0 30px;font-size:.95rem;line-height:1.6}.cr-desc ul,.cr-desc ol{padding-left:22px}
.cr-ins{display:flex;gap:18px;align-items:flex-start;margin:0 0 30px}.cr-ins img{width:96px;height:96px!important;border-radius:50%;flex:0 0 96px;object-fit:cover}
.cr-ins h3{margin:0;font-size:1.15rem;color:#0b6b58}.cr-ins .hl{color:var(--mut);margin:2px 0 8px;font-size:.9rem}.cr-ins p{font-size:.92rem;line-height:1.55;margin:0 0 8px}
.cr-more{margin:10px 0 0;font-size:.9rem}
@media (max-width:1000px){.cr-page{grid-template-columns:minmax(0,1fr);gap:0}.cr-side{grid-column:1;grid-row:1;position:static;margin-top:20px;max-height:none;overflow:visible}.cr-main{grid-row:2}.cr-band .lc{min-height:0}.cr-box{max-width:560px}}
@media (max-width:620px){.cr-learn ul{grid-template-columns:1fr}.cr-band .in{padding:22px 16px 26px}.cr-page{padding:0 16px 48px}.cr-acc summary{padding:12px 14px}.cr-acc summary .m{white-space:normal;text-align:right;font-size:.78rem}.cr-acc ul{padding:6px 14px 10px}.cr-ins img{width:72px;height:72px;flex-basis:72px}}
.cr-card{position:relative}.cr-card h2 a{color:inherit;text-decoration:none}.cr-card h2 a:after{content:"";position:absolute;inset:0;z-index:1}
.cr-card .pr .cr-pn,.cr-box .cr-pn{order:3;display:block;width:100%;font-size:.78rem;font-weight:600;color:var(--mut)}
.cr-pw{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 8px}.cr-was{color:#6a6f73;font-weight:400;font-size:.7em}.cr-off{font-size:.62em;font-weight:600;color:#2b2f37}.cr-card .cr-was{font-size:.85em}.cr-card .cr-off{font-size:.75em}.cr-pw .cr-pn{order:3;display:block;width:100%}
.cr-disc{margin:12px 0 4px;position:relative;z-index:2}.cr-dl{color:#b32d0f;font-size:.86rem;margin:0 0 6px}.cr-cd{font-weight:600}
.cr-cp{display:flex;align-items:stretch;border:1px dashed #6a6f73;border-radius:6px;overflow:hidden;background:#fafafa}
.cr-cp code{flex:1;padding:8px 10px;font-weight:800;letter-spacing:.06em;font-size:.95rem;background:none;color:#16181d}
.cr-cp button{font:inherit;font-weight:800;font-size:.85rem;border:0;border-left:1px dashed #6a6f73;background:#fff;color:#0b6b58;padding:0 14px;cursor:pointer}
.cr-cpn{font-size:.78rem;color:var(--mut);margin:0 0 6px}.cr-cpn2{font-size:.8rem;color:#2b2f37;margin:6px 0 0}
.cr-disc.sm{margin:8px 0 0}.cr-disc.sm .cr-dl{font-size:.76rem;font-weight:700;margin:0 0 5px}.cr-disc.sm .cr-cp code{padding:6px 8px;font-size:.82rem}.cr-disc.sm .cr-cp button{font-size:.78rem;padding:0 10px}.cr-disc.sm .cr-cpn{margin:4px 0 0;font-size:.7rem}
</style>"""

NF_JS = """<script>(function(){document.querySelectorAll("form[data-course]").forEach(function(f){var e=f.querySelector("input[type=email]"),b=f.querySelector("button"),m=f.parentNode.querySelector(".msg");
f.addEventListener("submit",function(ev){ev.preventDefault();var v=(e.value||"").trim();if(!/^[^\\s@]+@[^\\s@]+\\.[a-z]{2,}$/i.test(v)){m.textContent="Please enter a valid email address.";e.focus();return}
b.disabled=true;m.textContent="Saving…";fetch("/api/notify",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:v,src:"course",course:f.getAttribute("data-course"),website:f.website.value})}).then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})}).then(function(x){if(x.ok&&x.j.ok){m.textContent=x.j.already?"You're already on the list for this course. We'll email you at launch.":"Done! We'll email you when this course launches.";f.style.display="none"}else{m.textContent=(x.j&&x.j.error)||"Something went wrong. Please try again.";b.disabled=false}}).catch(function(){m.textContent="Network problem. Please try again.";b.disabled=false})})});
var x=document.getElementById("cr-xall");if(x){x.addEventListener("click",function(){var ds=document.querySelectorAll(".cr-acc details"),open=x.getAttribute("data-open")!=="1";ds.forEach(function(d){d.open=open});x.setAttribute("data-open",open?"1":"0");x.textContent=open?"Collapse all sections":"Expand all sections"})}})();</script>"""

def card(c):
    meta = " · ".join([p for p in [c["hours"] + (" total" if c["hours"] and "planned" not in c["hours"] else ""), (f"{c['lectures']} lectures" if c["lectures"] else ""), c["level"]] if p]) or "Details coming soon"
    bcls = "cr-badge pl" if c.get("planned") else "cr-badge"
    extra = '<span class="cr-badge dr">Draft curriculum</span>' if c.get("draft") else ""
    return (f'<div class="cr-card"><img src="{c["img"]}" alt="" width="960" height="540" loading="lazy">'
            f'<div class="b"><h2><a href="/courses/{c["slug"]}">{E(c["title"])}</a></h2><span class="ins">Suresh Parimi</span><span class="sh">{E(c["short"])}</span>'
            f'<span class="mt">{E(meta)}</span><span class="pr">{price_html(c, "cr-pv")} <span class="{bcls}">{E(c["badge"])}</span>{extra}</span>{disc_html(c, True)}</div></div>')

GRID = ('<section class="cr-wide cr-hero"><p class="eyebrow">Courses</p><h1>Courses for testers in the AI era</h1>'
        '<p class="lead">Project-based courses by Suresh Parimi on agentic test automation and AI quality. They are coming to Udemy: open a course to see what it covers and get an email when it launches.</p></section>'
        '<section class="cr-wide" style="padding-top:0"><div class="cr-grid">' + "".join(card(c) for c in COURSES) + '</div></section>')
out["courses.html"] = page("/courses", "Courses by Suresh Parimi · Fitwise", "Project-based courses for testers in the AI era: agentic test automation with Playwright + Codex, and AI quality engineering. Coming soon to Udemy.", GRID, extra_head=CR_CSS, scripts=COMMON_JS)

def notify_box(c):
    return (f'<div class="cr-nf"><label class="l" for="nf-{c["slug"]}">Notify me when it launches</label>'
            f'<form data-course="{c["slug"]}" novalidate><label class="hp" aria-hidden="true">Website <input name="website" tabindex="-1" autocomplete="off"></label>'
            f'<input id="nf-{c["slug"]}" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" required maxlength="190">'
            f'<button type="submit">Notify me</button></form><p class="msg" role="status" aria-live="polite"></p>'
            f'<small>One email when this course launches. To be removed, use the <a href="/contact">contact page</a>. See our <a href="/privacy">privacy policy</a>.</small></div>')

def detail(c):
    planned = c.get("planned")
    others = [o for o in COURSES if o["slug"] != c["slug"]]
    band_row = []
    if c.get("draft"): band_row.append('<span class="cr-badge dr">Draft curriculum</span>')
    band_row.append(f'<span class="cr-badge{" pl" if planned else ""}">{E(c["badge"])}</span>')
    if c.get("working_title"): band_row.append('<span class="muted2">Working title</span>')
    meta = []
    if c.get("updated"): meta.append(f'<span>ⓘ Last updated {E(c["updated"])}</span>')
    meta.append(f'<span>🌐 {E(c["lang"])}</span>')
    if c["level"]: meta.append(f'<span>Level: {E(c["level"])}</span>')
    band = (f'<div class="cr-band"><div class="in"><div class="lc"><p class="cr-crumb"><a href="/courses">Courses</a><span>›</span><a href="/courses">Software Testing</a></p>'
            f'<h1>{E(c["title"])}</h1><p class="sub">{E(c["subtitle"])}</p><div class="row">{"".join(band_row)}</div>'
            f'<div class="row"><span>Created by <a href="#instructor">Suresh Parimi</a></span></div><div class="row muted2">{"".join(meta)}</div></div></div></div>')
    inc = "" if planned else ('<div class="cr-inc"><h3>This course includes:</h3><ul>' + "".join(f'<li><i aria-hidden="true">{ICONS[k]}</i>{E(t)}</li>' for k, t in c["includes"]) + '</ul></div>')
    side = (f'<aside class="cr-side"><div class="cr-box"><img src="{c["img"]}" alt="" width="960" height="540"><div class="bd">'
            f'<p class="cr-price">{price_html(c, "cr-pv")}</p><p class="cr-status">{E(c["status"])}</p>{disc_html(c)}{notify_box(c)}{inc}</div></div></aside>')
    if planned:
        main = ('<div class="cr-main"><h2>About this course</h2><div class="cr-desc"><p>A planned course on engineering software delivery with coordinated autonomous agents. '
                'The curriculum is not published yet. Leave your email to hear when it is ready.</p></div>'
                f'<h2 id="instructor">Instructor</h2>{instructor()}<p class="cr-more">More courses: ' + " · ".join(f'<a href="/courses/{o["slug"]}">{E(o["title"])}</a>' for o in others) + '</p></div>')
    else:
        nlec = sum(len([n for n, _ in s["lectures"] if not n.startswith("Assignment")]) for s in c["sections"])
        tot = (c["hours"] + " total length") if "planned" not in c["hours"] else c["hours"].replace("planned", "total length planned")
        secs = []
        for i, s in enumerate(c["sections"]):
            ph = f'<small>{E(s["phase"])} · Section {i+1}</small>' if s.get("phase") else ""
            lis = "".join(f'<li><span class="i" aria-hidden="true">{"✎" if n.startswith(("Mini project", "Assignment")) else "▶"}</span><span class="n">{E(n)}</span><span class="d">{E(dd)}</span></li>' for n, dd in s["lectures"])
            secs.append(f'<details{" open" if i == 0 else ""}><summary><span class="ch" aria-hidden="true">▼</span><span class="t">{ph}{E(s["title"])}</span><span class="m">{len([n for n, _ in s["lectures"] if not n.startswith("Assignment")])} lectures · {E(s["len"])}</span></summary><ul>{lis}</ul></details>')
        note = f'<p class="cr-note">{E(c["content_note"])}</p>' if c.get("content_note") else ""
        main = ('<div class="cr-main">'
                '<div class="cr-learn"><h2>What you\'ll learn</h2><ul>' + "".join(f"<li>{E(x)}</li>" for x in c["learn"]) + '</ul></div>'
                f'<h2>Course content{DRAFT_BADGE if c.get("draft") else ""}</h2>{note}'
                f'<div class="cr-sum"><span>{len(c["sections"])} sections · {nlec} lectures · {E(tot)}</span><button type="button" id="cr-xall" data-open="0">Expand all sections</button></div>'
                '<div class="cr-acc">' + "".join(secs) + '</div>'
                '<h2>Requirements</h2><ul class="req">' + "".join(f"<li>{E(x)}</li>" for x in c["requirements"]) + '</ul>'
                '<h2>Description</h2><div class="cr-desc">' + "".join(c["desc"]) + '</div>'
                '<h2>Who this course is for:</h2><ul class="req">' + "".join(f"<li>{E(x)}</li>" for x in c["who"]) + '</ul>'
                f'<h2 id="instructor">Instructor</h2>{instructor()}'
                '<p class="cr-more">More courses: ' + " · ".join(f'<a href="/courses/{o["slug"]}">{E(o["title"])}</a>' for o in others) + '</p></div>')
    return band + '<div class="cr-page">' + side + main + '</div>'

DRAFT_BADGE = ' <span class="cr-badge dr" style="vertical-align:middle">Draft</span>'
def instructor():
    return ('<div class="cr-ins"><img src="/courses/instructor.jpg" alt="Suresh Parimi" width="96" height="96" loading="lazy"><div>'
            '<h3>Suresh Parimi</h3><p class="hl">Test Architect | Playwright &amp; AI Test Automation | 18+ years</p>' + BIO + '</div></div>')

os.makedirs(os.path.join(S, "courses"), exist_ok=True)
for c in COURSES:
    out["courses/" + c["slug"] + ".html"] = page("/courses/" + c["slug"], E(c["title"]) + " · Courses · Fitwise", E(c["subtitle"]), detail(c), extra_head=CR_CSS, scripts=NF_JS + COMMON_JS)
COURSE_SLUGS = [c["slug"] for c in COURSES]
