# Data model and schema evolution

`schemaVersion: 1` identifies the current application dataset. `revision` is a local concurrency token, not an assessment version. All record identifiers are UUIDs except user-managed centre IDs and imported event IDs. Duplicate IDs in backups are rejected. A new assessment timestamp is generated when completed, while a draft has an event creation time.

An event contains append-oriented completed versions, an optional editable draft, current review time, actions, communications, escalations and closure status. Reopen preserves completed assessments and audit history. A reassessment starts from the latest version but saves a new version. Reopening a completed assessment is implemented as this new draft / version; previous evidence is never edited in place.

Each version freezes input, selected Business Centre records, rules version, system result, human decision / rationale / authority and completion timestamps. Operational status snapshots at assessment completion support communication, escalation and action change comparisons. Centre counts derive from selected records. Manual total people exposure replaces the centre subtotal to prevent double counting; null means unknown, zero means explicitly zero.

Actions retain owner, creation / due / completion time, notes, status and related version. Communications retain final text, audience, channel, issuer, issued-record time and version. Mark issued only after actually sending; the app sends nothing. Escalations append actual pathway, status, recorder, notes and version. Audit entries include time, type, event ID and relevant details. This browser-local history is mutable by someone with browser access and is not tamper-proof.

## Time

Completion / audit times are ISO UTC instants. Input and due / review date controls use browser local time. The build normalises date-time control changes to UTC. Operator-entered prose timings remain unchanged. The browser clock is trusted; this is not a certified time source.

## Validation and migration

Schemas reject unknown structural fields, invalid enum values, negative people counts, duplicate IDs, broken version references and incompatible schema versions. Every expected impact and recovery field must be present. Corrupted imports are rejected before any commit.

V1 is the first released schema; there is no invented legacy format to migrate. Loading schema 1 is identity validation; unsupported versions fail visibly without erasing data. A future migration must be a pure function that preserves a pre-migration export, validates its result and writes atomically. Tests must include every actual prior supported schema and malformed inputs. Never increment IndexedDB's database version as a substitute for an application data migration.
