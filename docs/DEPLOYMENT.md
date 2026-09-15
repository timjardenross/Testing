# GitHub Enterprise Server Pages deployment

## Build and package

```sh
npm ci
npm run check
node scripts/package-pages.mjs
```

The deployable tree is `dist/`; the release archive is `artifacts/pages-static.tar.gz`. It contains index.html, a local favicon, local CSS / JavaScript and `.nojekyll`. Vite uses `base: './'`; navigation is state-based so no history API rewrite is required. A project subpath works without hard-coded repository names. Runtime users do not need Node, npm or external network access beyond the Pages site.

For a build-free deployment, use the supplied `pages-site.zip`. For local preview of the repository build use `npm run preview -- --port 4173`.

## GHES compatibility decision

The server version is not supplied. GitHub's GHES 3.20 publishing-source documentation supports branch publishing and describes Actions publishing subject to administrator enablement. The deploy-pages action documents version-specific GHES support rather than universal compatibility. This repository therefore supplies a validated static build workflow plus the explicit branch-publishing alternative below; it does not assume github.com artifact / deploy action versions work on an unknown appliance.

References verified during build on 2026-09-15:

- [GHES 3.20 publishing sources](https://docs.github.com/en/enterprise-server%403.20/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Official deploy-pages GHES compatibility](https://github.com/actions/deploy-pages)

Consult the documentation for your exact installed GHES version before enabling an automated deployment action.

## Enterprise-compatible branch publishing

1. Administrator enables Pages and confirms its internal hostname, TLS, visibility / access controls and allowed source options.
2. Create a dedicated deployment branch (for example `pages-release`) in the approved repository. Use an isolated clone / worktree and an ordinary branch commit. Put the CONTENTS of `dist/` at its root, including `.nojekyll`. Do not put the repository's source, tests, operational records or source documents in the published tree.
3. Push that commit using the approved human / service identity. Avoid force pushes; retain the previous release commit for rollback.
4. Repository Settings → Pages → select branch publishing, the chosen deployment branch and `/ (root)`.
5. Verify the site loads under its final subpath. Test with an unauthorised account / network location to confirm actual Pages restrictions. Private repository membership alone is not sufficient evidence.
6. Run a synthetic assessment, export / restore, reload, print and no-external-request check on the final managed browser / Pages origin before adding operational data.

This method uses Pages' branch publishing rather than a github.com-specific upload action. If administrators require Actions publication, select supported versions of configure-pages / upload-pages-artifact / deploy-pages from the compatibility documentation, mirror / pin them internally and configure the approved Pages environment / permissions. That appliance-specific integration is external configuration.

## CI prerequisites

On GHES, the supplied workflows run on a trusted `self-hosted` runner with Node 22, npm, Git and Playwright Chromium pre-provisioned. On runner setup, use `npx playwright install chromium` and required OS libraries through your approved package process. Configure an internal npm mirror or approved package cache. Sync / allow `actions/checkout@v4` or replace it with an internally mirrored pinned equivalent compatible with your server and runner. Workflow files intentionally do not assume github.com hosted runners or upload-artifact v4 support on GHES.

`pages.yml` builds, tests and packages; it does not push a deployment branch or claim to deploy. The operator retrieves the validated `dist/` / tarball from the controlled build workspace or an approved internal CI artifact mechanism and publishes as above. If Actions is disabled, run the same commands on an approved build machine.

## External configuration checklist

Exact GHES version; Pages enabled; internal DNS / TLS; repository and Pages access controls; source branch / root; CI availability and runner trust; allowed action versions; approved npm registry / browsers; serving CSP / security headers where configurable; classification and operational approval; backup destination and retention.

## Rollback and troubleshooting

Keep each deployed build paired with its source commit, lockfile and test evidence. Roll back with a normal commit restoring the prior static tree; do not clear browser records. Before introducing a new schema, verify backwards / migration behaviour and take backups.

Blank page: check that asset paths remain relative and every dist asset was copied. A file:// launch is unsupported. Missing access: check Pages visibility separately from Git permissions. Storage error: preserve browser profile, export unsaved draft and inspect quota / policy / stale-tab errors. Changed hostname / scheme / port: restore a verified backup on the new origin. No notifications after closing the browser: expected; review times are visible prompts, not a background alert service.

## Requested GitHub.com repository

The user selected the private repository `timjardenross/Testing` for source delivery. On github.com the validation workflow uses ubuntu-latest, setup-node and upload-artifact; on GHES it selects self-hosted and skips those github.com-only steps. The Pages workflow remains build/package-only. Repository upload does not enable Pages or change repository visibility. Retain the GHES branch publication path when deploying internally.
