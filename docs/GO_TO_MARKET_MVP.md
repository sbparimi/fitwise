# Fitwise go-to-market MVP

## Product promise

Fitwise launches as two connected tools:

1. **Resume Builder** — create or import a resume, edit structured sections, preview 20 templates, save locally, and export PDF or DOCX.
2. **ATS-style Resume Checker** — run 28 deterministic checks for common formatting, structure, readability, impact and job-description keyword issues.

The checker is a diagnostic. It is not an integration, certification or guarantee for Workday, Greenhouse, Lever, iCIMS, Taleo or any employer ATS.

## Primary user journey

1. Visitor lands on the homepage and understands the two core jobs Fitwise performs.
2. Visitor opens the builder or checker without registration.
3. Visitor creates a resume from scratch, pastes text, or imports PDF/DOCX/TXT.
4. Visitor edits the structured content and reviews the live preview.
5. Visitor runs the ATS-style checker and receives actionable findings.
6. Visitor returns to the builder, makes changes and exports PDF or DOCX.
7. Optional sign-in/cloud sync is secondary and must never block the core journey.

## Release acceptance gates

### Product success manager review
- A first-time visitor can identify the builder and checker without navigating unrelated features.
- Primary calls to action lead directly to the correct workflow.
- Supported file types, local storage behavior and ATS limitations are stated clearly.
- The complete builder → checker → builder → export journey is understandable.

### Independent QA review
- Desktop and mobile checks at 1440px, 1024px, 768px and 390px widths.
- PDF, DOCX and TXT import tested with multiple real-world documents, including large files and malformed files.
- Scratch creation, sample loading, paste, autosave, reopening, template switching, section ordering, PDF export and DOCX export verified.
- ATS checks verified with short, long, sparse, multilingual and malformed resumes.
- Share links reopen the report without exposing resume text or job-description text.
- Keyboard navigation, focus visibility, labels, errors and screen-reader names reviewed.
- No uncaught browser exceptions, broken links or failed required API requests.

### Security and privacy review
- Email OTP codes are never returned to clients and verification attempts are bounded.
- Uploaded files are size/type checked and parsed in the browser.
- ATS share storage contains report metadata only, not source resume or job-description text.
- Share reports expire after 30 days.
- Cloud-synced resumes are protected by account ownership checks.
- Secrets are absent from source control and public frontend bundles.
- Privacy notice accurately explains local storage, optional cloud sync, optional AI-provider processing and analytics.

### Engineering review
- ./build.sh passes.
- node --test tests/*.test.mjs passes.
- Worker bundle parses.
- Production Worker + D1 bindings are verified on the canonical production host.
- Smoke tests cover public pages and the ATS report API.
- Rollback procedure is documented and tested.

## Deliberately deferred

- Job board and job matching
- Cover-letter generation and checking
- AI Copilot and model-provider management
- Payments, credit packs and subscriptions
- Autopilot and application automation
- Advanced analytics and admin features

Do not advertise deferred features as generally available from the MVP homepage.

## External launch blockers requiring owner action

- **Legal controller details:** publish the operating legal entity/name and postal contact address in the privacy notice. These details must not be invented.
- **Email sign-in:** optional email OTP remains unavailable until a verified Resend sender/domain and runtime key are configured. Core builder/checker use must continue without sign-in.
- **Production verification:** run the full browser matrix against https://fitwise.sites.tab.bot/. Repository CI is not a substitute for real browser testing.
- **AI processing:** keep AI features out of the core launch promise. If enabled, verify provider configuration, data disclosures and factuality controls first.
- **Commercial launch:** do not enable payments until the operator identity, consumer terms, pricing, billing and cancellation flows are complete.

## Review record

Review roles are separate release gates, not claims that a third-party auditor has certified the product. Record the reviewer, date, evidence, defects and disposition for each gate before production promotion.
