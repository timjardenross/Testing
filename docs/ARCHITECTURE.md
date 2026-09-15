# Architecture

React, TypeScript and Vite produce ordinary bundled HTML, CSS and JavaScript with relative asset paths. Zod validates local and imported records. All runtime code is bundled locally. Application state is never transmitted by application code.

## Boundaries

- `src/config/pack.ts`: climate pack version, hazard prompts, T-level labels / definitions, actions and authority wording.
- `src/domain/engine.ts`: pure deterministic assessment evaluation and completion validation. No browser or repository dependencies.
- `src/domain/model.ts`: explicit schema v1 and typed data contracts.
- `src/domain/records.ts`: version creation, audit operations, change detection, import / export and closure rules.
- `src/domain/communications.ts`: deterministic editable communication generation.
- `src/persistence/repository.ts`: Repository interface, IndexedDB adapter, atomic revision checks.
- `src/components`: assessment, live operation, register and administration views.
- `src/App.tsx`: navigation and commit orchestration.

## Persistence and concurrency

IndexedDB database `climate-resilience-v1`, object store `state`, key `data` holds one versioned dataset. A single read/write transaction compares the persisted revision before writing. Only the transaction completion event produces a successful save. Failed validation, quota errors and stale-tab writes leave the previous snapshot intact. No localStorage fallback silently substitutes less durable storage.

The UI retains the assessment form after a failed save and offers an unsaved-draft backup. A before-unload warning and explicit navigation warning protect forms. Browser crash before an explicit draft save is a limitation; operators must save drafts during longer assessments. Use one active editing tab per origin.

Whole-state transactions are appropriate for a small local operational log and simplify integrity. They are not intended as a high-volume database. The 20 MB backup limit is a technical guardrail. Archive closed events by verified export before local deletion; retain backups under approved internal controls.

## Assessment pack extensibility

The first pack is Climate & Severe Weather. Evaluation is pure and persistence accepts typed version records independent of the UI. Future packs should introduce a `packId` / discriminated input schema and an `AssessmentPack` interface (evaluate, validate, prompts, actions, version). This is deliberately a future schema migration, not unimplemented claims of plug-and-play compatibility. Other hazard types can be added to the climate configuration with the matching schema enum and tests. No future packs are implemented.

## Shared repository route

An approved internal adapter can replace BrowserRepository using `load` / conditional `commit` first. For scale, evolve the interface to event-level revisions and atomic commands while keeping evaluation pure. A shared implementation must add server-enforced authorisation, identity, audit retention, conflicts and transactional validation; browser assertions are not enterprise controls.
