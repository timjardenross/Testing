# Contributing and maintaining

Read the source model and assumptions before changing rules. The draft plan is authoritative for this implementation; a developer must not invent operational policy. Record source version / section, rationale, affected behaviour, tests and reviewer for each rule change.

Use Node 22, `npm ci`, `npm run check`. Keep runtime services absent. Test changes to imports with valid, duplicate, conflicting and corrupt datasets; test changes to recovery with expired warning and continuing impacts. Never update historical recommendations in place.

Use descriptive functions, strict types and schema validation at repository boundaries. Components may receive domain operations but must not open IndexedDB directly. Record lifecycle events in audit. Every new nullable field must distinguish unknown from false / zero. Do not put personal names, contact details or operational records into fixtures.

Review checklist: source alignment; human / system distinction; authority boundary; Critical Operations uncertainty; previous-version preservation; safe failure; keyboard / label behaviour; print; backup; base-path build; no external requests. Update CHANGELOG, traceability and release-readiness evidence. Run the team tabletop before promoting materially changed authority or thresholds.
