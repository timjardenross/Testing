# Accessibility and visual validation

Target: WCAG 2.2 AA where reasonably achievable. Tested built application with axe-core via Playwright, using WCAG 2 A / AA, 2.1 AA and 2.2 AA tags.

Dashboard, assessment exposure step and Live Event scans returned zero automated violations. Dashboard reported color-contrast as an incomplete check; its visible text / background palette was manually inspected. Assessment and Live Event scans had no incomplete rules in the recorded run. See accessibility-results.json.

Keyboard check: first Tab reaches visible skip link; native buttons, selects, labels and checkboxes are keyboard operable. Explicit focus outlines, semantic navigation, headings, tables / captions and alert / status messages are implemented. The form-label defect found during browser testing was fixed and rerun successfully. No color-only posture meaning is used.

Visual inspection: 1440px desktop and 390px mobile Live Event screenshots; no clipped text or page-wide horizontal overflow. Mobile is a functional fallback and has a longer stacked layout. The standalone sample decision print was rendered as three A4 pages and all pages inspected; text and table rows are legible without clipping. Browser-generated PDF is not claimed to be a tagged accessible PDF.

Limitations: scans cover representative views, not every possible combination of user content. Full screen-reader testing, browser zoom / assistive technology combinations and managed-browser cross-platform validation remain recommended before operational activation. No full WCAG certification is claimed.
