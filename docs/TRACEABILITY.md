# Source to capability traceability

The Operational Plan v0.6 DRAFT is the operating model; Outlook v1.0 Approved is a background baseline. Mission-only technical requirements are identified separately. Source document hashes are retained in artifacts/source-provenance.json. See SOURCE-MODEL.md for the role-based canonical extract.

| Source requirement | Source section | Capability | Location | Coverage |
|---|---|---|---|---|
| Source status and ownership | Document control; 1; 16 | Draft banner, source version, readiness; approved Outlook contextual only | src/config/pack.ts; src/App.tsx | Browser dashboard; source provenance |
| Authority / after hours | 3; 9; 14 | Role chain, unavailable primary, approval evidence and safeguard | src/domain/engine.ts; components/Assessment.tsx | Unavailable-primary browser; authority unit; tabletop |
| Exposure | 4 | Register selection, people estimate, dependencies and snapshots | src/domain/engine.ts; components/Register.tsx | Centre aggregation unit / component / browser |
| Authoritative sources | 5 | Manual source / advice, protective precedence, unresolved conflicts | components/Assessment.tsx; domain/engine.ts | Warnings and conflicting / unknown unit cases |
| T0–T4 framework | 6 | Condition-based deterministic engine; levels may skip | src/config/pack.ts; domain/engine.ts | All hazard-level unit cases; T0/T1/T2/T3/T4 browser |
| Threshold decision test | 7 | Six-question summary and explicit operation / dependency / tolerance | components/Assessment.tsx | Critical uncertainty browser and unit |
| Hazard triggers | 8 | Six configurable packs with T1 / T2 / T3 source prompts | src/config/pack.ts | 18 hazard-level unit cases |
| People and centre actions | 9 | Posture actions; add to action log; approval boundaries | src/config/pack.ts; components/Live.tsx | Live-action component; action browser |
| Communication | 10 | Four deterministic templates; editable text / issue log | src/domain/communications.ts | Four template unit cases; issue browser |
| Enterprise / CPS 230 | 11 | YES / UNCERTAIN hand-off; current BC Manual reference | src/domain/engine.ts; components/Live.tsx | Escalation unit / browser / tabletop |
| Recovery | 12 | Nine checks, T4 / NORMAL, guarded closure, rationale | src/domain/engine.ts; domain/records.ts | Recovery unit / browser / tabletop |
| Seasonal rhythm | 13 | Readiness review dates and per-event next review | components/Settings.tsx; Live.tsx | Browser review / readiness inspection |
| Live Event Decision Card | 14 | Dedicated nine-part live surface and quick actions | components/Live.tsx | Live component and browser tests |
| Activation gates | 15 | Local evidence and status for readiness; no approval claim | components/Settings.tsx | Browser readiness inspection; pending human approval |
| Embedded tabletop | 16 | Inject scenario and software simulation | tests/tabletop/SCENARIO.md | tests/unit/tabletop.test.ts; e2e/operations.spec.ts |
| Local persistence and versions | Mission 4; 11; 20 | IndexedDB adapter, snapshots, audit and stale-tab rejection | src/persistence/repository.ts; domain/records.ts | Repository transaction unit; draft / reassessment browser |
| Register import / export | Mission 9 | CSV / JSON strict validation, preview and keep-existing import | components/Register.tsx; domain/records.ts | CSV unit; register browser |
| Decision exports | Mission 14 | Independent JSON / CSV / print and summary copy | components/Live.tsx; domain/records.ts | Browser print export; JSON round trip |
| Backup restore | Mission 21 | Versioned backup, preview, KEEP / REPLACE, atomic validation | components/Settings.tsx; domain/records.ts | Import corruption / duplicate / conflict unit; clean-browser restore |
| Accessibility | Mission 22; 23 | Labels, focus, semantic tables, responsive and print styles | components/Fields.tsx; src/style.css | axe browser; keyboard, mobile and visual checks |
| Security / deployment | Mission 27; 29 | Bundled static build, CSP, Enterprise branch procedure | index.html; vite.config.ts; .github/workflows | Build; runtime request audit; deployment guide |

The human tabletop, actual enterprise contact routes and activation approval remain external acceptance work. Technical implementation is not evidence that these governance steps have happened.
