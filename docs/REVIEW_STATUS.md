# Fitwise MVP review status

Date: 22 November 2026

This is an internal role-based engineering review record, not a third-party audit or certification.

## Current implementation snapshot

- GitHub branch: `launch/mvp-security-readiness`; draft PR: https://github.com/sbparimi/fitwise/pull/1
- Latest fully validated source commit: `815b8c85f82631a56491eda85e1c97340e92a9b3`; GitHub Actions run #103 passed.
- A Vercel preview of that commit is READY: `https://fitwise-r8rdqmfc7-shyenaai.vercel.app`.
- On that preview, homepage, builder, ATS checker, templates, sign-in, dashboard, privacy and terms returned HTTP 200; `/worker.mjs` returned HTTP 404. The compiled Worker bundle was removed from the Vercel static output.
- Additional source changes after that validated commit align ATS report retention to 90 days and add Google sign-in to the sign-in page. These latest changes have not yet been validated by a fresh CI run or deployed to a new preview.
- Vercel's deployment API currently rejects additional deployments with HTTP 402 because the team has exceeded its free daily API deployment limit; retry after the stated 24-hour window. Do not change the plan or billing automatically.

## Product success manager pass

**Status: Scope and positioning pass; usability validation pending.**

- Homepage positioning is focused on Resume Builder, ATS-style Checker and Templates.
- The core builder and checker are designed to work without registration.
- The first-time user journey still requires observed browser validation: import → edit → check → fix → export.

## QA pass

**Status: Automated/static pass on commit 815b8c; full end-to-end pass pending.**

- The validated commit's Vercel build ran 10/10 launch contract tests successfully, including the Worker-bundle exclusion test.
- A further contract test was added for Google sign-in wiring after that commit; latest CI result is pending.
- Still required: desktop/mobile browser journeys, keyboard/screen-reader checks, real PDF/DOCX/TXT fixtures, PDF/DOCX exports, and browser-console/network inspection.
- Browser-based test execution is currently blocked because the connected Browser Use project reports insufficient credits.

## Security and privacy pass

**Status: Source-level controls improved; Cloudflare production runtime review pending.**

Implemented in source:
- OTP codes are not returned to clients; delivery must succeed; request limits and five verification attempts are enforced.
- ATS share records store a whitelisted report, generic filename and no source resume/job-description text.
- Legacy ATS rows are scrubbed of stored resume text, job-description text and original filenames when cleanup runs.
- ATS report access and cleanup are now set to the owner's selected 90-day retention period; resume and raw analytics retention are also configured for 90 days.
- Share IDs use 128-bit random tokens and report creation is rate-limited.
- Analytics require explicit opt-in and can be withdrawn.
- Vercel static output no longer includes the compiled Worker bundle on the validated preview.

Still required:
- Verify the 90-day ATS cleanup and resume deletion behavior against the actual production D1 database.
- Verify Cloudflare session ownership, rate limits, secrets, and Worker/D1 bindings in the deployed runtime.
- Verify consent acceptance/rejection/withdrawal interactively.
- Complete processor/subprocessor terms and EEA transfer review. Legal controller identity and postal address are intentionally excluded from this work.

## Authentication and email

- The source now includes Google Identity Services on the Fitwise sign-in page and calls the existing server-side Google ID-token verification route.
- The existing Google OAuth client ID is present in source as a default, but its authorized origins and production callback behavior have not been verified against the Google Cloud project.
- The sign-in UI also supports optional email OTP. The Worker expects a Resend configuration in its runtime app configuration.
- Resend currently has verified domains, but none is a Fitwise-branded sending domain. No Fitwise-specific sending key or sender address has been configured. Do not use another product's verified domain for Fitwise without owner confirmation.
- The Resend connector does not expose the Cloudflare Worker/D1 runtime configuration. No Cloudflare connector is installed in this workspace, and no Cloudflare dashboard session is open in the connected browser.

## Engineering and deployment

**Status: Vercel static preview security fix verified; Cloudflare deployment and runtime verification blocked by unavailable infrastructure access.**

- The Vercel preview of commit 815b8c is READY, core static routes return HTTP 200, and `/worker.mjs` returns HTTP 404.
- The latest Google sign-in and 90-day retention source changes are on the draft branch but not yet in a new preview because the Vercel daily deployment API quota is exhausted.
- Production backend is documented as Cloudflare Worker + D1. No Cloudflare deployment, database migration, secret update or production smoke test has been performed.
- No merge or production deployment has been performed.

## Reviewer status

Role-based Product Success, QA, Security and Engineering review notes are internal review passes only. No external independent reviewer or third-party security audit has approved this release.

## Release decision

**Not cleared for public production launch.**

Remaining non-legal gates: validate latest source with CI; redeploy preview after Vercel quota reset; run full browser journeys; gain Cloudflare access to verify and deploy Worker/D1 changes; configure and test a Fitwise sender domain/key in Resend; verify Google OAuth authorized origins and complete a real sign-in test. Legal controller identity and postal address remain a separate owner-supplied gate.
