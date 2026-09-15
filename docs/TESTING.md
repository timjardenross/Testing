# Testing and validation

Run `npm run check` after installing dependencies and provisioning Playwright Chromium. Vitest executes pure-domain and component integration tests; Playwright executes the built static application using a local HTTP server. All fixtures are synthetic.

## Coverage

- Six hazard packs at T1 / T2 / T3, exposure conditions, official warnings, immediate safety, no-warning material disruption, expiry, recovery and normal return.
- Critical Operations YES / UNCERTAIN hand-off independent of posture; primary unavailable; broader direction approval; human override.
- Centre counts / unknown people, immutable selected-centre snapshots, version comparisons, action / communication / escalation snapshots.
- Strict import, incompatible schema, duplicates, corrupt CSV / JSON, complete backup round-trip, keep / replace conflicts, future-schema rejection, closure / reopen.
- IndexedDB persistence and stale-writer rejection; simulated storage failure retains form / export.
- UI assessment, override and centre selection; live recommendation-to-action and recovery views.
- Browser T0, emerging storm, flood reassessment, rapid T1→T3, bushfire, heat, uncertainty, unavailable primary, T3→T4→T0→closed, action / issued communication, clean-profile restore and corruption rejection.
- Automated source tabletop inject sequence; see `tests/tabletop/SCENARIO.md` for the separate human acceptance record.

## Accessibility and visuals

Axe scans target WCAG 2 A / AA, 2.1 AA and 2.2 AA tags on dashboard, assessment and Live Event views. Keyboard skip-link focus, 390px overflow check, desktop / mobile screenshots and browser print PDF are collected. Automated checks cannot certify full WCAG conformance; dedicated screen-reader, additional browser and team usability checks remain recommended before activation.

Review `artifacts/accessibility-results.json` for incomplete rules requiring manual review. Screenshots / print files are synthetic validation artifacts, not operational records.

## Evidence

`artifacts/vitest-results.json` and `artifacts/e2e-results.json` contain machine results. `artifacts/runtime-requests.json` lists production requests from the tested browser journey. `artifacts/test-report.md`, `accessibility-report.md`, `adversarial-review.md` and `release-readiness.md` summarise final evidence and limits. Do not claim broader workflows or target-GHES deployment were verified merely because local tests pass.
