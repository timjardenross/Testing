# Security and information handling

## Architecture

The production site contains locally bundled React / Zod code, stylesheet and favicon. Application code has no fetch, XMLHttpRequest, WebSocket, beacon, telemetry, external fonts or runtime service integrations. Sources and references are plain text; entering a URL does not fetch it. All decisions are deterministic and local. Build / testing package downloads are development activities, not application runtime dependencies.

The HTML Content Security Policy restricts assets and connections to the serving origin, disallows plugins / objects and form submissions, and excludes inline scripts. Configure additional server headers (including frame-ancestors / anti-framing and appropriate cache policy) through the GHES environment if required; frame-ancestors is not effective in a meta tag. React escapes text; imported content is never inserted as HTML. CSV output prefixes spreadsheet-formula-like cells.

## Storage

IndexedDB holds plaintext browser-local records. A user with access to the browser profile or developer tools can read or alter them. Role names / decisions are self-declared; there is no application identity verification, authorisation enforcement, encryption-at-rest implementation or tamper-proof audit. Shared devices need managed profile isolation, screen lock and approved cleanup procedures after verified backup.

## Deployment controls

Private repository access does not by itself demonstrate restricted Pages access. Administrators must verify actual Pages visibility and SSO / internal-network controls on the chosen GHES release. Test with an unauthorised account before loading operational data. Deploy only to the approved environment; no external deployment was performed during implementation.

## Import and backups

Strict schemas, size limits, duplicate checks, reference checks, preview and explicit conflict selection protect against accidental corruption. A malicious but schema-valid backup can still contain false evidence. Import only trusted exports and review their origin. This local tool cannot authenticate evidence or prevent a user from editing a JSON file. Treat backup files according to applicable internal classification, access, encryption and retention requirements.

## Maintenance and future services

Use the lockfile and approved internal package mirror, review dependency advisories, and rerun tests before release. No secrets, personal contact details or actual location register data are seeded. For a shared backend, add approved identity, least-privilege access, server-side validation, conditional revisions, audit controls, retention, incident response and approved data residency. Do not expose the browser repository directly as an unauthenticated API.

Report vulnerabilities through your organisation's approved internal security process. Do not publish operational data in public issues.
