# Adversarial review

Reviewed through inexperienced operator, experienced practitioner, stressed operator, delegate, accessibility, auditor and inheriting-developer lenses. Findings below distinguish implementation defects from external approval work.

| Finding | Resolution / evidence |
|---|---|
| Dropdown labels included option content in selector text | Separate explicit labels and controls; workflow / axe tests pass |
| Operator could navigate while save was still pending | Saving message and navigation guard; success only after transaction completion; reload test waits for confirmed save |
| Concurrent browser tab could overwrite newer data | Atomic revision check rejects stale writer; repository test |
| Quota / write failure could strand a form | Retain form, visible error, unsaved-draft backup; browser fault injection passes |
| Missing recovery keys in a syntactically valid backup | Require every expected impact / recovery key; malformed-schema test |
| Clear recovery flags could coexist with active unsafe / material impacts at closure | Closure rejects ongoing safety / impact conditions; regression test |
| Register edits could change historical evidence | Freeze selected-centre snapshots; unit test |
| Current action / communication state could be mistaken for prior state | Freeze operation status snapshot at each assessment; exports label current related records separately |
| Event-list filter only covered latest assessments | Searchable all-version history and direct version opening; browser T1 history filter after T2 reassessment |
| UTC review time could display incorrectly in local date-time controls | Normalise control edits to UTC and display local input values |
| Escalation / communication status too low on live page | Add prominent top status strip and retain detailed decision card |
| Raw JSON print was harder to read | Dedicated three-page sample decision report inspected, retaining JSON export |
| Communication could show issued confirmation after a failed write | Only show issued confirmation when commit succeeds |
| Imported same ID could overwrite current evidence silently | Keep-existing default, conflict preview, explicit replacement confirmation, safety backup; unit / browser tests |
| CSV cells could be interpreted as formulas | Escape formula-like prefixes; test |
| Draft source could be mistaken for approved policy | Persistent draft banner, explicit readiness / release conditions |
| Personal Annex A data could be duplicated in code | Role-only configuration; no personal contacts / actual centre data seeded |

No unresolved critical software defect was identified within the completed tests and review. This is bounded evidence, not a guarantee against all defects.

## Residual limits

Browser-local plaintext data, no shared synchronisation / identity enforcement / tamper-proof audit, explicit draft saving, browser eviction / clock dependence, trusted-but-unauthenticated imported evidence, no automated reminder delivery, 20 MB backup guardrail, Chromium-only automated coverage and no certified assistive-technology audit. Recovery closure is a conservative implementation guard recorded as a technical assumption.

Real after-hours reachability, BC Manual routes, delegates, register validity, classification, source-plan approval and target GHES access restrictions require the accountable organisation's validation. Automated tabletop simulation does not close these items.
