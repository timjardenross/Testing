# Backup and restore

## Backup process

Export all data after material decisions, before handover, before imports / deletion and at the end of an event. Store the downloaded JSON in an approved access-controlled internal location under applicable classification and retention requirements. Backups may contain operationally sensitive information and user-entered names. They are plaintext, not encrypted by the application.

Verify the file exists and is non-empty. Periodically restore into a separate test browser profile, compare event counts, version counts, selected decisions, actions and communications, then securely remove the test copy. Merely clicking download is not evidence of durable backup.

## Restore process

1. Export and verify the current browser's backup.
2. Configuration → Import / restore backup → choose JSON.
3. Read validation errors or the preview counts and conflict totals.
4. KEEP retains all current records / configuration with matching IDs and adds new IDs. REPLACE replaces matching whole events / centres and configuration; unrelated current records stay intact. This is not field-level reconciliation.
5. Confirm restore. A safety backup downloads before the atomic write.
6. Verify the restored event and assessment versions. Retain both source and pre-restore backups.

Malformed files, unsupported versions, duplicate IDs and broken references are rejected before any mutation. Maximum accepted backup text is 20 MB; register files are limited to 5 MB. Browser quotas vary. Failed writes are visible and the prior dataset survives.

## Recovery limitations

A completed decision JSON / CSV is a readable evidence export, not an application backup. Only the versioned `climate-resilience-backup` format restores the full dataset. Unsaved-draft export uses this full format, so it can recover a form when normal save fails. Its conflict mode may need REPLACE to recover an existing event draft; review carefully to avoid losing newer versions.

The app cannot recover a browser profile that has been cleared without a backup. Changing hostname, scheme, port, profile or browser creates a different storage origin. Private browsing, device policy and disk pressure can remove local data. No automatic remote backup, background sync or guaranteed persistent-storage grant is implied.
