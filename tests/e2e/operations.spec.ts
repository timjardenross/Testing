import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, writeFile } from "node:fs/promises";
async function start(p: Page) {
  await p.goto("/");
  await p.getByRole("button", { name: "New assessment", exact: true }).click();
  await p
    .getByLabel("Event name", { exact: true })
    .fill("DEMO — Operational exercise");
  await p.getByLabel("Assessor", { exact: true }).fill("Exercise operator");
  await p.getByLabel("Affected geography").fill("DEMO region");
  await p
    .getByLabel("Authoritative source", { exact: true })
    .fill("Simulated emergency agency");
  await p.getByLabel("Current advice", { exact: true }).selectOption("GENERAL");
  await p.getByLabel("Expected timing").fill("Exercise window");
  await p
    .getByLabel("Forecast / warning / advice details")
    .fill("Exercise only — follow authoritative instructions");
}
async function exposure(p: Page, value = "CONFIRMED") {
  await p.getByRole("button", { name: "2. Exposure", exact: true }).click();
  await p.getByLabel("Relevant exposure", { exact: true }).selectOption(value);
  await p
    .getByLabel("Workforce concentrations")
    .fill("DEMO meaningful workforce concentration");
}
async function impacts(p: Page) {
  await p.getByRole("button", { name: "3. Impact", exact: true }).click();
  for (const label of [
    "People safety",
    "Commuting",
    "Attendance",
    "Business Centre access",
    "Power",
    "Connectivity",
    "Critical scheduled activity",
    "Operational capability",
    "Dependencies",
    "Other",
  ])
    await p.getByLabel(label, { exact: true }).selectOption("NONE");
}
async function threshold(p: Page, level?: string, critical = "NO") {
  await p
    .getByRole("button", { name: "4. Decision test", exact: true })
    .click();
  await p
    .getByLabel("Proportionate action now")
    .fill(
      "Share authoritative guidance; validate safe travel and flexible work.",
    );
  await p
    .getByLabel("Critical Operation concern", { exact: true })
    .selectOption(critical);
  await p
    .getByLabel("Critical Operations rationale and follow-up")
    .fill(
      critical === "NO"
        ? "No operation / dependency exposure identified in exercise."
        : "Dependency unknown; hand off through BC Manual.",
    );
  if (level) {
    await p.getByLabel(new RegExp(`^${level} —`)).check();
    await p
      .getByLabel("Evidence supporting selected trigger prompts")
      .fill("Simulated inject supports this condition.");
  }
}
async function finish(p: Page, override?: string) {
  await p
    .getByRole("button", { name: "5. Decision & review", exact: true })
    .click();
  await p
    .getByLabel("Authority / delegation evidence")
    .fill("Exercise role and delegated mandate confirmed");
  await p
    .getByLabel("Decision-maker", { exact: true })
    .fill("Exercise delegate");
  await p.getByLabel("Next review / update").fill("2026-10-10T19:00");
  if (override) {
    await p.getByLabel("Recorded human posture").selectOption(override);
    await p
      .getByLabel("Override rationale (required)")
      .fill("Precautionary decision based on exercise evidence.");
  }
  await p
    .getByRole("button", { name: "Complete assessment", exact: true })
    .click();
  await expect(
    p.getByRole("heading", { name: "Live Event Decision Card", exact: true }),
  ).toBeVisible();
}
async function posture(p: Page, t: string) {
  await expect(p.locator(".page-heading .posture")).toContainText(t);
}
test("T0 routine monitoring and draft resume", async ({ page: p }) => {
  await start(p);
  await p.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(p.getByRole("status")).toContainText("Saved in this browser.");
  p.once("dialog", (d) => d.accept());
  await p.reload();
  await p.getByRole("button", { name: "Resume draft", exact: true }).click();
  await expect(p.getByLabel("Event name", { exact: true })).toHaveValue(
    "DEMO — Operational exercise",
  );
  await exposure(p, "NONE");
  await impacts(p);
  await threshold(p);
  await finish(p);
  await posture(p, "T0");
});
test("T1 emerging severe storm", async ({ page: p }) => {
  await start(p);
  await exposure(p);
  await impacts(p);
  await threshold(p, "T1");
  await finish(p);
  await posture(p, "T1");
});
test("T1 to T2 flood reassessment preserves previous decision", async ({
  page: p,
}) => {
  await start(p);
  await p.getByLabel("Hazard", { exact: true }).selectOption("flood");
  await exposure(p);
  await impacts(p);
  await threshold(p, "T1");
  await finish(p);
  await p.getByRole("button", { name: "Reassess", exact: true }).click();
  await threshold(p, "T2");
  await finish(p);
  await posture(p, "T2");
  await p
    .getByRole("button", { name: "History & records", exact: true })
    .click();
  await expect(
    p.getByText("Previous human posture: T1", { exact: false }),
  ).toBeVisible();
  await p.getByLabel("Assessment version").selectOption("0");
  await expect(
    p.getByText("HISTORICAL RECORD — immutable assessment snapshot"),
  ).toBeVisible();
  await p.getByRole("button", { name: "02 Assessments", exact: true }).click();
  await p.getByLabel("Posture filter").selectOption("T1");
  await expect(
    p.getByRole("button", { name: "View version 1", exact: true }),
  ).toBeVisible();
  await expect(
    p.getByRole("button", { name: "View version 2", exact: true }),
  ).toHaveCount(0);
  await p.getByRole("button", { name: "View version 1", exact: true }).click();
  await expect(p.getByLabel("Assessment version")).toHaveValue("0");
});
test("rapid T1 to T3 skips levels", async ({ page: p }) => {
  await start(p);
  await exposure(p);
  await impacts(p);
  await threshold(p, "T1");
  await finish(p);
  await p.getByRole("button", { name: "Reassess", exact: true }).click();
  await p.getByLabel("Rate of change").selectOption("RAPID");
  await p.getByRole("button", { name: "3. Impact", exact: true }).click();
  await p
    .getByLabel("Unsafe travel / access or protective action required")
    .check();
  await finish(p);
  await posture(p, "T3");
});
test("bushfire emergency advice activates without known centre exposure", async ({
  page: p,
}) => {
  await start(p);
  await p.getByLabel("Hazard", { exact: true }).selectOption("fire");
  await p
    .getByLabel("Current advice", { exact: true })
    .selectOption("EMERGENCY");
  await exposure(p, "UNKNOWN");
  await impacts(p);
  await threshold(p);
  await finish(p);
  await posture(p, "T3");
});
test("extreme heat with likely transport and power stress prepares", async ({
  page: p,
}) => {
  await start(p);
  await p.getByLabel("Hazard", { exact: true }).selectOption("heat");
  await exposure(p);
  await impacts(p);
  await p.getByLabel("Power", { exact: true }).selectOption("LIKELY");
  await p.getByLabel("Commuting", { exact: true }).selectOption("LIKELY");
  await threshold(p, "T2");
  await finish(p);
  await posture(p, "T2");
});
test("Critical Operation uncertain requires and records enterprise hand-off", async ({
  page: p,
}) => {
  await start(p);
  await exposure(p);
  await impacts(p);
  await threshold(p, "T2", "UNCERTAIN");
  await finish(p);
  await expect(
    p
      .locator(".live-status")
      .getByText("ENTERPRISE ESCALATION REQUIRED", { exact: true }),
  ).toBeVisible();
  await p
    .getByRole("button", { name: "Record escalation", exact: true })
    .click();
  await p.getByLabel("Escalation recorded by").fill("Exercise delegate");
  await p
    .getByLabel("Pathway / recipient role used")
    .fill("BC Manual — simulated enterprise duty role");
  await p.getByRole("button", { name: "Save escalation record" }).click();
  await expect(p.getByText(/INITIATED · BC Manual/)).toBeVisible();
});
test("human override keeps system recommendation", async ({ page: p }) => {
  await start(p);
  await exposure(p);
  await impacts(p);
  await threshold(p, "T1");
  await finish(p, "T2");
  await posture(p, "T2");
  await expect(p.getByText(/System: T1/)).toBeVisible();
});
test("unavailable primary, broader direction approval and protective safeguard", async ({
  page: p,
}) => {
  await start(p);
  await exposure(p);
  await impacts(p);
  await p
    .getByLabel("Unsafe travel / access or protective action required")
    .check();
  await threshold(p, "T3");
  await p
    .getByRole("button", { name: "5. Decision & review", exact: true })
    .click();
  await p.getByLabel("Primary decision-maker available").uncheck();
  await p
    .getByLabel("Recording a broader protective attendance direction")
    .check();
  await p
    .getByLabel("BC Director approval evidence")
    .fill("Exercise approval by Director via Teams");
  await finish(p);
  await posture(p, "T3");
  await expect(
    p.getByText("Primary unavailable — continue the escalation chain."),
  ).toBeVisible();
  await expect(
    p.getByText(/must not delay communication/).first(),
  ).toBeVisible();
});
test("T3 to T4 to normal to closure with action and communication logs", async ({
  page: p,
}) => {
  await start(p);
  await exposure(p);
  await impacts(p);
  await p
    .getByLabel("Unsafe travel / access or protective action required")
    .check();
  await threshold(p);
  await finish(p);
  await p.getByRole("button", { name: "Add to actions" }).first().click();
  await p.getByLabel("Action owner").fill("People Leader");
  await p.getByRole("button", { name: "Save action", exact: true }).click();
  await p.getByLabel(/^Status:/).selectOption("COMPLETE");
  await p
    .getByRole("button", { name: "Record communication", exact: true })
    .click();
  await p.getByLabel("Audience", { exact: true }).fill("DEMO workforce");
  await p.getByLabel("Issued by").fill("Exercise delegate");
  await p.getByRole("button", { name: "Mark issued" }).click();
  await expect(p.getByText("Communication marked issued.")).toBeVisible();
  await p.getByRole("button", { name: "Reassess", exact: true }).click();
  await p.getByLabel("Current advice", { exact: true }).selectOption("EXPIRED");
  await p.getByRole("button", { name: "3. Impact", exact: true }).click();
  await p
    .getByLabel("Unsafe travel / access or protective action required")
    .uncheck();
  await p
    .getByRole("button", { name: "5. Decision & review", exact: true })
    .click();
  await p.getByLabel("Recovery stage").selectOption("RECOVER");
  await finish(p);
  await posture(p, "T4");
  await p.getByRole("button", { name: "Reassess", exact: true }).click();
  await p
    .getByRole("button", { name: "5. Decision & review", exact: true })
    .click();
  await p.getByLabel("Recovery stage").selectOption("NORMAL");
  for (const k of [
    "People welfare and ability to work",
    "Business Centre availability and enterprise advice",
    "Practical access",
    "Transport",
    "Utilities and connectivity",
    "Operational backlog",
    "Current enterprise advice",
    "Communication completed",
    "Lessons identified",
  ])
    await p.getByLabel(k, { exact: true }).selectOption("CLEAR");
  await p
    .getByLabel("Recovery evidence, enterprise advice and lessons")
    .fill("Exercise checks clear; enterprise confirms availability.");
  await finish(p);
  await posture(p, "T0");
  await p
    .getByRole("button", { name: "Recovery & review", exact: true })
    .click();
  await p.getByLabel("Closure decision-maker").fill("Exercise delegate");
  await p
    .getByLabel("Closure rationale / residual hand-off")
    .fill("All checks clear; lessons captured.");
  p.once("dialog", (d) => d.accept());
  await p.getByRole("button", { name: "Close event", exact: true }).click();
  await expect(
    p.getByRole("button", { name: "Reopen event", exact: true }),
  ).toBeVisible();
});
test("export then clean browser restore, reject corrupted import intact", async ({
  page: p,
  browser,
}) => {
  await start(p);
  await exposure(p, "NONE");
  await impacts(p);
  await threshold(p);
  await finish(p);
  await p
    .getByRole("button", { name: "Configuration", exact: false })
    .first()
    .click();
  const wait = p.waitForEvent("download");
  await p.getByRole("button", { name: "Export all data" }).click();
  const dl = await wait;
  const body = await readFile((await dl.path())!);
  const context = await browser.newContext();
  const q = await context.newPage();
  await q.goto("http://127.0.0.1:4173");
  await q
    .getByRole("button", { name: "Configuration", exact: false })
    .first()
    .click();
  await q.getByLabel("Import / restore backup").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: body,
  });
  await expect(q.getByText("Validated backup preview")).toBeVisible();
  q.once("dialog", (d) => d.accept());
  await q.getByRole("button", { name: "Confirm restore" }).click();
  await expect(q.getByRole("status")).toContainText("Saved in this browser.");
  await q
    .getByRole("button", { name: "Current events", exact: false })
    .first()
    .click();
  await expect(
    q.getByRole("rowheader").filter({ hasText: "DEMO — Operational exercise" }),
  ).toBeVisible();
  await q
    .getByRole("button", { name: "Configuration", exact: false })
    .first()
    .click();
  await q.getByLabel("Import / restore backup").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from("{broken"),
  });
  await expect(q.getByRole("alert")).toContainText(
    "Import rejected; existing data unchanged",
  );
  await context.close();
});
test("register import, selection, keyboard focus, axe, responsive and runtime request audit", async ({
  page: p,
}) => {
  const requests: string[] = [];
  p.on("request", (r) => requests.push(r.url()));
  await p.goto("/");
  await expect(
    p.getByRole("heading", { name: "Current events", exact: true }),
  ).toBeVisible();
  await p.keyboard.press("Tab");
  await expect(p.getByText("Skip to main content")).toBeFocused();
  const results: any[] = [];
  results.push(
    await new AxeBuilder({ page: p })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze(),
  );
  await p
    .getByRole("button", { name: "Business Centres", exact: false })
    .first()
    .click();
  await p.getByRole("button", { name: "Prepare DEMO record" }).click();
  await p.getByRole("button", { name: "Save centre", exact: true }).click();
  await expect(p.getByRole("status")).toContainText("Saved in this browser.");
  await p
    .getByRole("button", { name: "Current events", exact: false })
    .first()
    .click();
  await start(p);
  await exposure(p);
  await p.getByLabel(/DEMO — Example Business Centre · DEMO/).check();
  await expect(p.getByText("1 centres · 120 people")).toBeVisible();
  results.push(
    await new AxeBuilder({ page: p })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze(),
  );
  await impacts(p);
  await threshold(p, "T1");
  await finish(p);
  results.push(
    await new AxeBuilder({ page: p })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze(),
  );
  await p.screenshot({ path: "artifacts/live-desktop.png", fullPage: true });
  await p.setViewportSize({ width: 390, height: 844 });
  await p.screenshot({ path: "artifacts/live-mobile.png", fullPage: true });
  expect(
    await p.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await p.setViewportSize({ width: 1440, height: 1000 });
  await p
    .getByRole("button", { name: "History & records", exact: true })
    .click();
  await p.pdf({ path: "artifacts/decision-record-print.pdf", format: "A4" });
  await writeFile(
    "artifacts/accessibility-results.json",
    JSON.stringify(
      results.map((r) => ({
        url: r.url,
        violations: r.violations,
        passes: r.passes.length,
        incomplete: r.incomplete.map((i) => i.id),
      })),
      null,
      2,
    ),
  );
  expect(results.flatMap((r) => r.violations)).toEqual([]);
  expect(
    requests.filter((u) => !u.startsWith("http://127.0.0.1:4173/")),
  ).toEqual([]);
  await writeFile(
    "artifacts/runtime-requests.json",
    JSON.stringify(requests, null, 2),
  );
});
test("storage failure retains entered draft and provides recoverable export", async ({
  page: p,
}) => {
  await start(p);
  await p.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Simulated full storage", "QuotaExceededError");
    };
  });
  await p.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(p.getByRole("alert")).toContainText("Not saved");
  await expect(p.getByLabel("Event name", { exact: true })).toHaveValue(
    "DEMO — Operational exercise",
  );
  const wait = p.waitForEvent("download");
  await p.getByRole("button", { name: "Export unsaved draft" }).click();
  const file = await wait;
  const parsed = JSON.parse(await readFile((await file.path())!, "utf8"));
  expect(parsed.data.events[0].draft.title).toBe("DEMO — Operational exercise");
});
