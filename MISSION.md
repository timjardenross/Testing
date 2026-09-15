MISSION: BUILD THE SELF-CONTAINED CLIMATE & SEVERE WEATHER
OPERATIONAL RESILIENCE ASSESSMENT CAPABILITY

ROLE

Act as a principal software engineer, operational resilience product architect,
decision-support designer, UX engineer, and adversarial QA lead.

Your mission is to design, build, test, document and package a production-quality,
self-contained GitHub Pages capability that operationalises the Climate & Severe
Weather assessment model supplied with this mission.

Do not build a digital copy of a Word document.

Build a usable operational decision-support capability that a Business Continuity
& Resilience practitioner, delegate, or team member can use during both routine
monitoring and a fast-moving severe-weather event.

The finished repository must contain EVERYTHING required to:

- understand the capability
- run it locally
- deploy it through GitHub Pages
- operate it
- maintain its assessment rules
- test it
- validate changes
- recover/export its data
- hand it over to another practitioner or developer

Do not stop at architecture, scaffolding, wireframes, pseudocode or recommendations.

DELIVER THE WORKING CAPABILITY AND ALL SUPPORTING ARTIFACTS.


============================================================
1. SOURCE OF TRUTH
============================================================

First inspect all source material supplied with this mission.

The Climate & Severe Weather Operational Plan is the authoritative source for:

- assessment model
- T0-T4 definitions
- threshold decision test
- hazard triggers
- people actions
- Business Centre actions
- communication requirements
- authority model
- escalation principles
- recovery model
- Live Event Decision Card
- readiness model
- tabletop scenarios and acceptance criteria

Do not silently invent policy, authority, thresholds or enterprise arrangements
that are not present in the source material.

Where implementation requires a technical assumption that is not defined by the
source material:

1. identify the gap;
2. choose the safest reversible technical implementation;
3. record the assumption in the project documentation;
4. do not represent it as ANZ policy.

Keep policy/rules separate from application code wherever practical so that
future changes can be made without rewriting the application.


============================================================
2. PRODUCT OBJECTIVE
============================================================

Build:

CLIMATE & SEVERE WEATHER ASSESSMENT

A self-contained internal operational resilience decision-support application.

The application converts:

SIGNAL
→ EXPOSURE
→ IMPACT
→ POSTURE
→ ACTION
→ ESCALATION
→ COMMUNICATION
→ DECISION RECORD
→ REASSESSMENT
→ RECOVERY

The product should enable an appropriately informed user to move from an
authoritative weather signal to a documented and explainable operational
assessment within minutes.

It must reduce cognitive load during an event.

The interface should answer:

1. What is happening?
2. Who or what is exposed?
3. What could it affect?
4. What posture is appropriate?
5. What should we do now?
6. Who has authority?
7. Does this require enterprise escalation?
8. Who needs to be communicated with?
9. When do we reassess?
10. What changed since the previous assessment?


============================================================
3. NON-NEGOTIABLE ARCHITECTURE
============================================================

V1 MUST BE SELF-CONTAINED.

Assume deployment to an internally restricted GitHub Enterprise Server
GitHub Pages environment.

The application must operate as a static web application.

DO NOT require:

- external APIs
- external databases
- cloud databases
- Supabase
- Firebase
- external authentication
- external AI/LLM services
- analytics services
- telemetry services
- external fonts
- external CDNs
- third-party JavaScript loaded at runtime
- internet access
- BOM API access
- external map services
- external storage services

All runtime assets must be packaged with the application.

After deployment, the application must remain functional if the browser has
no internet connectivity to anything other than the GitHub Pages application.

If using npm packages during development/build, the resulting production
application must not depend on those services at runtime.

Preferred implementation:

- React
- TypeScript
- Vite
- static GitHub Pages deployment
- deterministic rules engine
- browser-native persistent storage

However, inspect the environment and choose alternatives if there is a
materially better reason.

Document the decision.


============================================================
4. DATA MODEL AND LOCAL PERSISTENCE
============================================================

Because V1 is self-contained, implement robust browser-side persistence.

Prefer IndexedDB for structured operational records.

Use LocalStorage only for lightweight preferences/configuration if useful.

The application must support:

- create assessment
- save draft
- resume assessment
- complete assessment
- reopen assessment
- reassess an existing event
- preserve assessment versions
- compare assessments
- close event
- reopen closed event where appropriate
- delete records with deliberate confirmation
- export records
- import previously exported records
- backup all application data
- restore all application data

Design data structures with explicit schema versions.

Do not design persistence in a way that prevents a future migration to an
approved shared internal data service.

Create a clean repository/data abstraction between UI and persistence.

The future implementation should be capable of replacing:

Browser Repository

with:

Shared Enterprise Repository

without rewriting the assessment engine or primary UI.


============================================================
5. CORE ASSESSMENT EXPERIENCE
============================================================

Implement a guided assessment workflow.


STEP 1 — EVENT

Capture:

- assessment/event ID
- assessment date/time
- assessor
- hazard type
- affected geography
- authoritative source
- source/reference details
- current forecast/watch/warning/advice
- expected timing
- rate of change
- relevant notes


STEP 2 — EXPOSURE

Capture/select:

- Business Centres
- workforce concentrations
- approximate people exposure
- commuting/access exposure
- expected attendance
- travelling teams
- remote-work capability
- relevant geographic exposure
- other known exposure


STEP 3 — IMPACT

Assess potential/current impact to:

- people safety
- commuting
- attendance
- Business Centre access
- power
- telecommunications/connectivity
- critical scheduled activity
- operational capability
- dependencies
- other relevant impacts


STEP 4 — THRESHOLD DECISION TEST

Operationalise the six-question test from the source plan:

1. What is the authoritative advice?
2. Who/what is exposed?
3. When could impact occur?
4. What could it reasonably disrupt?
5. What action is proportionate now?
6. Could a Critical Operation be affected?

Question 6 must explicitly consider:

- CPS 230 Critical Operation
- supporting resource/dependency
- applicable impact tolerance

If YES or UNCERTAIN:

flag:

ENTERPRISE ESCALATION REQUIRED

This is a hand-off trigger.

The application must NOT attempt to determine enterprise residual risk.


============================================================
6. T0-T4 DECISION ENGINE
============================================================

Implement the source model:

T0 — MONITOR
T1 — HEADS-UP
T2 — PREPARE
T3 — ACT
T4 — RECOVER

The engine must be deterministic and explainable.

DO NOT create an opaque numerical risk score and map arbitrary totals to
T-levels.

The source model is condition- and exposure-based.

Fast-onset events may skip levels.

The rules engine must:

- consume assessment inputs
- evaluate hazard triggers
- evaluate exposure
- evaluate current impacts
- evaluate authoritative advice
- evaluate escalation conditions
- recommend a T-level
- explain why
- recommend relevant actions
- identify unresolved information
- identify escalation requirements
- identify communication requirements

Every recommendation must include:

RECOMMENDED POSTURE
WHY
EVIDENCE / CONDITIONS
RECOMMENDED ACTIONS
ESCALATION
COMMUNICATION
NEXT REVIEW


============================================================
7. HUMAN DECISION AUTHORITY
============================================================

This is decision support, not automated decision-making.

The user must be able to accept or override a recommended posture.

If overriding:

require:

- selected posture
- rationale
- decision-maker
- timestamp

Clearly distinguish:

SYSTEM RECOMMENDATION

from:

RECORDED HUMAN DECISION

Never silently replace one with the other.

Preserve both in the decision record.


============================================================
8. HAZARD PACKS
============================================================

Implement configurable hazard logic for:

- Bushfire / smoke
- Extreme heat
- Flood / intense rainfall
- Severe storm
- Tropical severe weather
- Power / telecommunications disruption associated with external hazard

Extract the T1/T2/T3 trigger prompts from the supplied Operational Plan.

Store hazard definitions in maintainable configuration rather than scattering
them through UI code.

For example:

/src/config/hazards/

or equivalent.

Each hazard definition should support:

- identifier
- display name
- T1 conditions
- T2 conditions
- T3 conditions
- assessment prompts
- likely impacts
- recommended actions
- escalation prompts

Design this so additional assessment packs can eventually be added.


============================================================
9. BUSINESS CENTRE REGISTER
============================================================

Create an internal Business Centre & People Exposure Register capability.

Allow records to contain, where available:

- Business Centre ID
- name
- address/location
- state/territory
- region/catchment
- coordinates if supplied
- centre status
- approximate divisional people
- normal attendance pattern
- alternative-work availability
- relevant hazards
- dependencies
- Property reference
- validation status
- validation date
- confidence
- operational notes

Do not hard-code actual ANZ Business Centre data unless supplied as an
authoritative project data source.

Provide:

- empty/default register
- sample/demo records clearly marked DEMO
- CSV import
- JSON import/export
- CSV export
- validation/error reporting

During an assessment users should be able to select affected Business Centres
from this register.

Automatically aggregate:

- number of centres
- approximate people exposed
- relevant dependencies
- known hazard attributes

where the underlying data supports this.


============================================================
10. LIVE EVENT MODE
============================================================

Implement a dedicated LIVE EVENT MODE.

This is not merely the assessment wizard displayed again.

It should optimise the interface for operational use.

Display prominently:

EVENT
CURRENT POSTURE
HUMAN DECISION
LAST ASSESSED
NEXT REVIEW
HAZARD
GEOGRAPHY
BUSINESS CENTRES EXPOSED
PEOPLE EXPOSED
CURRENT ACTIONS
COMMUNICATION STATUS
ENTERPRISE ESCALATION STATUS

Operationalise the Live Event Decision Card:

1. EVENT
2. EXPOSURE
3. T-LEVEL
4. ACTION
5. AUTHORITY
6. ENTERPRISE
7. COMMUNICATE
8. NEXT REVIEW
9. RECOVERY

Provide quick actions:

REASSESS
RECORD ACTION
RECORD COMMUNICATION
RECORD ESCALATION
SET NEXT REVIEW
EXPORT DECISION RECORD
CLOSE EVENT


============================================================
11. REASSESSMENT AND CHANGE DETECTION
============================================================

This is a critical capability.

A reassessment must not overwrite the previous assessment.

Create an immutable or append-oriented assessment history.

Compare the new assessment with the previous assessment.

Show:

PREVIOUS POSTURE
CURRENT RECOMMENDATION
CURRENT HUMAN DECISION

and:

WHAT CHANGED?

Examples:

- warning strengthened/weakened
- geography changed
- Business Centres added/removed
- people exposure changed
- attendance changed
- transport impact changed
- Property status changed
- power/connectivity changed
- Critical Operations concern changed
- escalation status changed
- communication status changed

Classify differences where useful:

NEW
WORSENED
IMPROVED
UNCHANGED
RESOLVED

Do not infer a change where the data does not support one.


============================================================
12. ACTION TRACKING
============================================================

Each active event must support lightweight action management.

Action fields:

- action
- owner
- created time
- due time
- status
- completion time
- notes
- related assessment version

Statuses:

OPEN
IN PROGRESS
COMPLETE
CANCELLED

Recommended actions generated by the rules engine should be capable of being
added to the action list without retyping.


============================================================
13. COMMUNICATION SUPPORT
============================================================

The source plan requires communications to state:

- what is happening
- where/when it matters
- what it means for people/Business Centres
- what people should do now
- when the next update will occur

Implement deterministic communication drafting.

DO NOT use an LLM.

Generate draft templates using assessment data.

Support at least:

WORKFORCE UPDATE
PEOPLE LEADER UPDATE
SENIOR LEADERSHIP BRIEF
EVENT STATUS SUMMARY

Allow editing before copying/exporting.

Record when a communication is marked as issued:

- communication type
- audience
- channel
- timestamp
- issued by
- final text

Default operating model from source material:

Core decision coordination:
Microsoft Teams

Workforce:
Email

People Leader cascade:
where required

Enterprise escalation:
current BC Manual


============================================================
14. DECISION RECORD
============================================================

Generate a complete decision record for each assessment/reassessment.

Include:

- event ID
- assessment version
- timestamp
- assessor
- hazard
- geography
- authoritative advice/source
- exposure
- Business Centres
- people exposure
- impacts
- recommended posture
- recommendation rationale
- human-decided posture
- override rationale if applicable
- authority
- actions
- Critical Operations question/result
- enterprise escalation
- communications
- next review
- unresolved information
- recovery status

Support:

PRINT
SAVE AS PDF USING BROWSER PRINT
COPY SUMMARY
EXPORT JSON
EXPORT CSV where meaningful

Create a clean print stylesheet.

Decision records must remain understandable when viewed independently of
the application.


============================================================
15. RECOVERY
============================================================

Implement T4 / recovery assessment.

Do not automatically return an event to normal merely because a warning has
expired.

Prompt for:

- people welfare/ability to work
- Business Centre availability
- practical access
- transport
- utilities/connectivity
- operational backlog/disruption
- current enterprise advice
- communication completed
- lessons identified

Support:

CONTINUE T4
RETURN TO T0
CLOSE EVENT

Require rationale for event closure.


============================================================
16. DASHBOARD
============================================================

Create a useful landing dashboard.

Recommended navigation:

CURRENT EVENTS
ASSESSMENTS
BUSINESS CENTRES
READINESS
CONFIGURATION

Current Events should show:

- event
- hazard
- geography
- posture
- last assessment
- next review
- centres exposed
- people exposed
- escalation status

Assessment History should be searchable/filterable by:

- date
- event
- hazard
- geography
- T-level
- status

Do not overbuild analytics in V1.


============================================================
17. READINESS
============================================================

Include a lightweight readiness view based on the plan.

Support status for:

- Business Centre register validation
- authority/contact configuration
- communication channels
- after-hours mechanism
- enterprise escalation reference
- tabletop/exercise
- last seasonal review
- last plan/rules review

This is a readiness aid, not a replacement for governance documentation.


============================================================
18. CONFIGURATION
============================================================

Separate configuration from application logic.

Configuration should include where appropriate:

- role titles
- communication channels
- enterprise escalation reference text
- hazard packs
- T-level definitions
- recommended actions
- readiness gates
- application metadata
- plan/rules version

Do not embed personal contact information in default source code.

Provide UI/configuration mechanisms where practical.


============================================================
19. TRACEABILITY
============================================================

This is important.

Create a traceability artifact showing how the application maps to the source
Operational Plan.

For example:

SOURCE REQUIREMENT
SOURCE SECTION
APPLICATION CAPABILITY
RULE/CONFIG LOCATION
TEST COVERAGE

Examples:

T0-T4 model
→ Section 6
→ Assessment Engine
→ /src/config/t-levels.ts
→ relevant unit tests

Threshold Decision Test
→ Section 7
→ Assessment Wizard / Engine
→ ...
→ ...

Live Event Decision Card
→ Section 14
→ Live Event Mode
→ ...
→ ...

This must allow a future reviewer to establish that the application continues
to reflect the approved operating model.


============================================================
20. AUDITABILITY
============================================================

Within the constraints of self-contained browser storage, maintain an event
history.

Record important operations such as:

ASSESSMENT CREATED
ASSESSMENT COMPLETED
POSTURE RECOMMENDED
POSTURE OVERRIDDEN
ACTION CREATED
ACTION COMPLETED
COMMUNICATION RECORDED
ESCALATION RECORDED
REASSESSMENT COMPLETED
EVENT CLOSED
EVENT REOPENED
DATA IMPORTED

Each entry should include timestamp and relevant identifiers.

Do not pretend this browser-local audit history is tamper-proof.

Document that limitation clearly.


============================================================
21. BACKUP / RESTORE
============================================================

Because V1 has no shared backend, backup/restore is mandatory.

Provide:

EXPORT ALL DATA

which creates a versioned application backup.

Provide:

IMPORT / RESTORE BACKUP

with:

- schema validation
- preview
- conflict handling
- explicit confirmation
- error reporting

Never silently destroy existing records during import.

Provide a recommended operational backup process in the user guide.


============================================================
22. UX REQUIREMENTS
============================================================

Design for operational use under time pressure.

Priorities:

1. clarity
2. speed
3. explainability
4. accessibility
5. low cognitive load
6. consistency
7. visual polish

Use a restrained enterprise visual language.

Avoid:

- decorative dashboards
- excessive animation
- tiny text
- unnecessary modal dialogs
- hidden critical actions
- ambiguous icons
- colour-only meaning
- excessive scrolling during live assessment

T-levels should be immediately distinguishable but always include their
text label, not colour alone.

Responsive behaviour must support:

- desktop
- laptop
- tablet
- reasonable mobile fallback

Primary target is desktop/laptop operational use.


============================================================
23. ACCESSIBILITY
============================================================

Target WCAG 2.2 AA where reasonably achievable.

Ensure:

- keyboard navigation
- semantic HTML
- correct labels
- visible focus states
- sufficient contrast
- screen-reader meaningful controls
- accessible tables
- accessible error messages
- colour is never the sole indicator
- reduced-motion compatibility where applicable

Test accessibility.


============================================================
24. ERROR AND EDGE CASE DESIGN
============================================================

Explicitly handle:

- no Business Centres selected
- unknown people exposure
- conflicting information
- incomplete authoritative advice
- rapidly changing conditions
- no current warning but material observed impact
- warning expires while impacts remain
- recommendation lower than current human posture
- recommendation higher than current human posture
- Critical Operation = UNCERTAIN
- primary decision-maker unavailable
- corrupted import
- incompatible backup version
- browser storage failure
- duplicate event IDs
- reassessment with missing prior data

Fail safely and visibly.

Never silently discard assessment information.


============================================================
25. TESTING
============================================================

Build comprehensive automated tests.

At minimum:

UNIT TESTS
- rules engine
- T-level recommendations
- hazard logic
- escalation logic
- change detection
- data validation
- communication generation
- import/export
- migrations

COMPONENT TESTS
- assessment workflow
- override workflow
- Business Centre selection
- Live Event mode
- action management
- recovery workflow

END-TO-END TESTS
Cover at least:

1. T0 routine monitoring
2. T1 emerging severe storm
3. T1 → T2 flood escalation
4. rapid T1 → T3 event
5. bushfire / emergency advice
6. extreme heat with transport/power exposure
7. Critical Operation = UNCERTAIN
8. human override of recommendation
9. unavailable primary decision-maker scenario
10. T3 → T4 → closed event
11. export → wipe/test environment → restore
12. corrupted import rejected safely

Use the embedded tabletop scenario from the source Operational Plan as an
important acceptance test.

Do not simply test that components render.

Test operational outcomes.


============================================================
26. ADVERSARIAL REVIEW
============================================================

Before declaring the mission complete, attempt to break the capability.

Act as:

- an inexperienced BC practitioner
- an experienced BC practitioner
- a stressed operator during a fast-moving event
- a delegate covering the role
- an accessibility user
- an auditor
- a developer inheriting the repository

Find:

- confusing decisions
- missing states
- unsafe assumptions
- ways data can be lost
- inconsistent recommendations
- rules that contradict each other
- dead ends
- misleading language
- stale configuration risk
- import/export failures
- inaccessible workflows
- opportunities for accidental destructive actions

Fix material findings.

Do not merely report them.


============================================================
27. SECURITY / INFORMATION HANDLING
============================================================

Assume the capability operates inside an ANZ-controlled GitHub Enterprise
Server environment, but do not use that assumption as an excuse for poor
security design.

Do not:

- send data externally
- embed telemetry
- make external requests
- include secrets
- commit credentials
- include actual personal contact details unless explicitly supplied and
  approved for inclusion
- expose application data through URLs/query strings unnecessarily

Create:

SECURITY.md

Document:

- architecture
- local data storage
- no-external-call design
- information-handling assumptions
- backup considerations
- browser/shared-device considerations
- known limitations
- future shared-data implications


============================================================
28. REPOSITORY STRUCTURE
============================================================

Create a clean repository.

Use a structure along these lines, adapting where technically justified:

/
├── README.md
├── MISSION.md
├── CHANGELOG.md
├── SECURITY.md
├── CONTRIBUTING.md
├── LICENSE-or-internal-use-note.md
├── package.json
├── vite.config.*
├── tsconfig.*
├── index.html
│
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── pages.yml
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── USER-GUIDE.md
│   ├── OPERATOR-GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── DATA-MODEL.md
│   ├── RULES-ENGINE.md
│   ├── TRACEABILITY.md
│   ├── TESTING.md
│   ├── BACKUP-RESTORE.md
│   ├── ASSUMPTIONS.md
│   └── ROADMAP.md
│
├── src/
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── assessment/
│   ├── rules/
│   ├── config/
│   │   ├── hazards/
│   │   ├── t-levels.*
│   │   ├── actions.*
│   │   └── application.*
│   ├── data/
│   ├── persistence/
│   ├── events/
│   ├── communications/
│   ├── export/
│   ├── import/
│   ├── audit/
│   ├── accessibility/
│   ├── types/
│   └── utils/
│
├── public/
│   └── bundled static assets only
│
├── templates/
│   ├── business-centres.csv
│   ├── business-centres-demo.csv
│   └── configuration-example.*
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── fixtures/
│   └── tabletop/
│
└── artifacts/
    ├── traceability-matrix.*
    ├── test-report.*
    ├── accessibility-report.*
    └── release-readiness.*

Do not create documentation files merely to satisfy this structure.

Every artifact must contain useful content.


============================================================
29. GITHUB PAGES DEPLOYMENT
============================================================

Provide a complete GitHub Pages deployment workflow appropriate to GitHub
Enterprise Server.

Do not assume github.com-specific behaviour without checking compatibility.

The repository must include:

- build command
- test command
- production build
- correct base path handling
- Pages artifact generation
- deployment workflow or documented Enterprise-compatible alternative
- local preview instructions
- troubleshooting

If the Enterprise Server environment requires administrator-specific Pages
configuration that cannot be encoded in the repository, document exactly
what must be configured externally.


============================================================
30. FUTURE EXTENSIBILITY
============================================================

Architect the core as an:

OPERATIONAL RESILIENCE ASSESSMENT ENGINE

Climate & Severe Weather is Assessment Pack #1.

Do not implement the future packs now unless required for architecture tests.

But ensure the architecture can later support packs such as:

- Technology Disruption
- Supplier Disruption
- Workforce Disruption
- Property / Site Disruption
- Telecommunications
- Critical Operations Impact

Keep:

ENGINE

separate from:

ASSESSMENT PACK

where practical.


============================================================
31. DEFINITION OF DONE
============================================================

The mission is NOT complete because:

- code exists
- the UI renders
- tests pass
- GitHub Pages deploys

It is complete when:

1. A user can create an assessment.
2. The assessment reflects the source operating model.
3. The application recommends an explainable T-level.
4. A user can accept or override it.
5. The correct actions are presented.
6. Critical Operations YES/UNCERTAIN triggers enterprise escalation.
7. Business Centre exposure can be included.
8. A live event can be operated.
9. The event can be reassessed.
10. Changes are clearly identified.
11. Previous decisions are preserved.
12. Communications can be generated and recorded.
13. Actions can be tracked.
14. Recovery can be assessed.
15. The event can be closed with rationale.
16. Decision records can be exported.
17. All application data can be backed up and restored.
18. The capability works without external runtime services.
19. Automated tests cover critical operational paths.
20. The tabletop scenario passes.
21. Accessibility has been tested.
22. Material adversarial findings have been fixed.
23. Documentation is sufficient for another developer to maintain it.
24. Documentation is sufficient for another BC practitioner to operate it.
25. The repository contains all artifacts required for GitHub Pages deployment.
26. Source-to-capability traceability is documented.
27. No unresolved Critical defects remain.


============================================================
32. FINAL MISSION REPORT
============================================================

When implementation is complete, provide a final report containing:

BUILD
- what was built
- architecture
- major design decisions

SOURCE ALIGNMENT
- how the Operational Plan was translated
- any ambiguities or assumptions
- traceability status

FUNCTIONAL VALIDATION
- workflows tested
- tabletop result
- edge cases tested

TESTS
- unit results
- integration results
- E2E results

ACCESSIBILITY
- checks performed
- findings
- fixes

ADVERSARIAL REVIEW
- issues discovered
- issues fixed
- residual limitations

SECURITY
- external-call verification
- persistence model
- information-handling considerations

DEPLOYMENT
- GitHub Pages readiness
- external Enterprise configuration still required, if any

KNOWN LIMITATIONS
- especially browser-local storage and multi-user limitations

FUTURE
- recommended route to shared internal persistence
- assessment-pack extensibility

VERDICT

Return exactly one:

READY FOR TABLETOP
READY WITH CONDITIONS
NOT READY

Do not return READY FOR TABLETOP if any Critical defect or unresolved issue
could produce an unsafe, misleading or lost operational assessment.


============================================================
33. EXECUTION INSTRUCTION
============================================================

Now execute the mission.

Start by:

1. inspecting the supplied source material;
2. extracting the canonical assessment requirements;
3. inspecting the repository/environment;
4. documenting the implementation plan;
5. building the capability;
6. continuously testing as you build;
7. running the complete validation and adversarial review;
8. fixing findings;
9. producing the final repository artifacts;
10. returning the Final Mission Report.

Do not stop after planning.

Do not ask for approval between normal implementation phases.

Where a non-critical ambiguity exists, make the safest reversible assumption,
document it and continue.

Only stop for user input where proceeding would require inventing a material
ANZ policy, authority or decision rule.