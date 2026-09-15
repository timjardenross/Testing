# Implementation plan

Build a local operational workspace with a guided assessment and a separate Live Event Decision Card. The user-selected destination is GitHub Enterprise Server Pages; no Sites hosting, cloud services, APIs or analytics are used.

1. Inspect the mission and both supplied documents. Extract plan sections 3–16 as the canonical model; record draft status and unresolved governance gates.
2. Implement a typed assessment pack, deterministic engine and versioned domain model. Use explicit conditions, exposure, evidence and human decisions; never calculate a numerical risk score.
3. Implement IndexedDB behind a repository interface with atomic commits and stale-writer rejection. Preserve assessment and centre snapshots.
4. Implement guided assessment, live operation, register, readiness, configuration, exports and previewed restore.
5. Test hazard / escalation / recovery rules, operational workflows, persistence and corruption. Exercise the embedded after-hours scenario with synthetic data.
6. Review accessibility, production runtime requests, print output, mobile layout, failure handling and handover documentation.
7. Package source, lockfile, static build, test evidence, traceability, operational guides and Enterprise-compatible deployment instructions.

Visual direction: a restrained blue operational workspace with a persistent event posture, prominent review time, legible text labels, and explicit recommendation versus decision. No maps or charts imply unsupported location intelligence.
