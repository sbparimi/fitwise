#!/bin/sh
# Full build of site/worker.mjs (Build 1 - Fitwise full revamp, 22 Nov 2026).
set -e
cd "$(dirname "$0")"
python3 build_pages.py     # legacy pages (privacy, terms, about, contact, checklists, /tailor) + header/footer sync
python3 build_front.py     # Build 1 pages (home, ats-checker, builder, templates, cover letter, dashboard, pricing, signin) + partials.js
python3 build_private.py
cp docmodel.js cvpdf.js render.js extract.js site/
cp events_client.js site/events.js
cat engine.js docmodel.js cvpdf.js render.js formats.js partials.js private_pages.js jobs.js site_routes.js events.js build1_api.js worker_main.js gate.js > site/worker.mjs
node --check site/worker.mjs 2>/dev/null || node -e "import('file://'+process.argv[1]).then(()=>console.log('worker module parses'),e=>{console.error(e.message);process.exit(1)})" "$PWD/site/worker.mjs"
for f in site/fw-core.js site/fw-templates.js site/fw-builder.js site/fw-ats.js site/fw-export.js site/fw-cover.js site/fw-cover-check.js site/fw-dashboard.js site/fw-jobs-match.js site/fw-home.js site/fw-tplgal.js site/fw-pricing.js site/fw-signin.js site/fw-i18n.js; do
  node --check "$f" || exit 1
done
echo "front-end scripts parse clean"
node --test tests/*.test.mjs
echo "front-end scripts parse clean"
echo "built site/worker.mjs ($(wc -c < site/worker.mjs) bytes)"
