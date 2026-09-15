# Rules engine

Rules implement the supplied v0.6 draft Sections 5–12. They are decision support; the human may override the recommendation with rationale, decision-maker and timestamp. Both outcomes are retained. No residual enterprise risk or numerical score is calculated.

## Evaluation order

1. Start T0 with explicit wording that absence of an established trigger does not prove unknown conditions are safe.
2. Relevant potential / confirmed exposure plus T1 prompt, forecast/watch or possible impact produces T1.
3. Relevant exposure plus T2 prompt or likely impact produces T2.
4. Relevant official warning / T3 prompt, material observed impact, unsafe access or protective / emergency advice produces T3. Safety and material-impact flags may override unknown exposure. Fast events skip levels.
5. An explicit recovery phase can yield T4 after the immediate threat has passed. Active protective advice / unsafe flags retain T3. A NORMAL request yields T0 only when all recovery checks are clear and no possible, likely or material impacts remain.
6. YES / UNCERTAIN for the Critical Operations question always produces the enterprise hand-off requirement, independently of posture. Other enterprise needs and unavailable authority create separate hand-off prompts.

Highest active condition wins within the response phase. T4 is a recovery phase, not numerically more severe than T3. No arbitrary time bands are used. Operator-selected next review is required; no scheduled alert or guaranteed background reminder exists.

## Human-entered interpretation

Users determine whether a source intersects relevant geography, select evidenced hazard prompts and describe impact likelihood / materiality. The software does not parse forecasts, infer geofences, measure heat thresholds or define 'meaningful' workforce counts. These qualitative source terms deliberately remain practitioner judgments. National Outlook ratings never map directly to T-levels.

A source warning label must distinguish formal warning / emergency advice from emerging forecast / watch intelligence. The tabletop's initial 'credible warning emerges' is represented by emerging T1 evidence; formal protective warning or unsafe conditions at an exposed location require reconsideration toward T3.

## Completeness and authority

Required completion fields: event, assessor, geography, source and advice, timing, proportionate action, Critical Operations rationale, authority evidence, decision-maker and review time. Unknown details may be recorded explicitly with follow-up. Unresolved facts remain visible rather than preventing safety communication.

Ordinary People Leader attendance / flexible-work decisions remain within normal authority. A recorded broader protective attendance direction requires BC Director approval evidence. If unavailable, keep that direction unapproved and communicate authoritative emergency advice / reasonable precautions; continue the source authority chain.

## Change control

Update `src/config/pack.ts`, the matching input enum if adding a hazard, source traceability, tests and rules version. Keep previous version recommendations as historical snapshots. Do not recompute old recommendations when loading records. Migration / import validation checks record completeness but does not replace historical recommendation evidence. Review changes with BC&R and the plan approver; rerun the tabletop when authority or thresholds change.
