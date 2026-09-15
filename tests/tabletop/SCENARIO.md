# Embedded tabletop and acceptance record

Source: Operational Plan v0.6 DRAFT, Section 16. Automated simulation exercises software behaviour only. It cannot prove real after-hours reachability, the contents of the current BC Manual, organisational understanding or approval.

## Facilitated exercise

Run outside normal business hours using clearly synthetic exposure. Required participants: BC&R Lead, BC Director, Divisional Executive / nominated delegate and representative People Leaders. Enterprise roles can be simulated using actual approved BC Manual pathways.

| Inject                                                                     | Expected evidence / outcome                                                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1. Credible emerging severe-weather signal intersects meaningful workforce | T1 supported by geography / source, Teams coordination, targeted email decision                              |
| 2. Primary decision-maker unavailable                                      | Continue authority chain; record route and person / role reached; do not delay authoritative safety advice   |
| 3. Confidence / travel and attendance effects increase                     | T2; People Leader flexible-work action within normal authority; next review                                  |
| 4. Unsafe travel or protective advice                                      | T3, levels may be skipped; BC Director approval for broader attendance direction; email workforce action     |
| 5. Property status unclear and Critical Operation / dependency uncertain   | Current BC Manual used; enterprise hand-off recorded; no residual-risk scoring                               |
| 6. Warning passes, utilities / transport still disrupted                   | T4; retain restrictions, confirm enterprise advice and next communication; normal only after recovery checks |

## Acceptance checklist

- Exposed people / centre identified; posture defensible without time-band thresholds.
- Authority chain works when primary unavailable.
- People Leader versus BC Director decision rights applied correctly.
- Teams decision coordination and workforce email exercised.
- Actual current BC Manual pathway identified and used / simulated explicitly.
- CPS 230 operation, supporting dependency and tolerance considered.
- Live Event Decision Card sufficient for the core decision.
- Every material issue has an owner and due date; closed or explicitly accepted before source-plan promotion.

## Automated evidence

`tests/unit/tabletop.test.ts` runs the complete inject sequence and checks immutable T1 / T2 / T3 / T4 / T0 records, hand-off, communications and closure. Browser tests exercise these outcomes through the UI, including unavailable primary, approval evidence, reassessment and issued communications. Detailed results are in artifacts.

## Human exercise record — not yet completed

Exercise date / facilitator: pending. Participants: pending. Outcome: pending (PASS / PASS WITH ACTIONS / RE-RUN REQUIRED). BC Manual pathway validated: pending. After-hours reachability: pending. Issues with owner / due: pending. BC Director approval and date: pending.

Do not convert automated software results into a completed organisational tabletop record.
