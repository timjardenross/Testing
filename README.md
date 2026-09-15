# Testing

## Climate & Severe Weather Assessment

A self-contained operational decision-support workspace for people, Business Centres and severe-weather events. It supports assessment, explainable T0–T4 recommendations, human decisions, versioned reassessment, action / communication / escalation logs, recovery, register maintenance and backup / restore.

**Source status:** Operational Plan v0.6 DRAFT; companion Outlook v1.0 Approved. This software does not approve the draft plan or satisfy its activation gates. Use synthetic data for validation until the accountable owner has confirmed the operating model and local deployment controls.

## Start locally

Requirements: Node.js 22 LTS and npm 10 or compatible, a modern browser with IndexedDB, and approved access to development package sources (or an internal mirror).

```sh
npm ci
npm run dev
```

For the exact production build:

```sh
npm run build
npm run preview -- --port 4173
```

Open the printed local address. Do not open index.html with file://; module loading and storage require a web origin. `dist/` is the complete static application. It needs no npm, Node server, API or internet service after deployment. A prebuilt `pages-site.zip` is supplied alongside the repository archive.

## Validate

```sh
npm test
npx playwright install chromium
npm run build
npm run test:e2e
```

`npm run check` performs unit / component tests, production build and browser E2E. Browser installation is a development prerequisite only. CI runner provisioning is described in [Deployment](docs/DEPLOYMENT.md).

## Start operating

1. Read [Operator guide](docs/OPERATOR-GUIDE.md) and confirm [readiness](docs/USER-GUIDE.md).
2. Add validated Business Centres or explicitly marked DEMO records.
3. Create an assessment from authoritative advice; enter exposure and impacts.
4. Complete the threshold test, record authority, select the human posture and next review.
5. Use Live Event mode to act, communicate, escalate and reassess.
6. Export a backup after material decisions and at handover. Local data is not shared, centrally backed up, tamper-proof or guaranteed against browser eviction.

## Handover map

- [Architecture](docs/ARCHITECTURE.md), [Data model](docs/DATA-MODEL.md), [Rules](docs/RULES-ENGINE.md)
- [Source model](docs/SOURCE-MODEL.md), [Traceability](docs/TRACEABILITY.md), [Assumptions](docs/ASSUMPTIONS.md)
- [User guide](docs/USER-GUIDE.md), [Backup / restore](docs/BACKUP-RESTORE.md)
- [Testing](docs/TESTING.md), [Tabletop](tests/tabletop/SCENARIO.md), [Release report](artifacts/release-readiness.md)
- [Security](SECURITY.md), [Contributing](CONTRIBUTING.md), [Roadmap](docs/ROADMAP.md)

No actual Business Centre records or personal contacts are seeded. Annex A names are intentionally not duplicated in source code or templates.
