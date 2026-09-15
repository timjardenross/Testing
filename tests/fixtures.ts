import {
  emptyInput,
  impactKeys,
  recoveryKeys,
  type Input,
} from "../src/domain/model";
export function input(extra: Partial<Input> = {}): Input {
  return {
    ...emptyInput(),
    title: "DEMO — severe weather exercise",
    assessor: "Exercise operator",
    geography: "DEMO region",
    source: "Simulated emergency agency advice",
    reference: "Tabletop inject",
    advice: "GENERAL",
    adviceDetails: "Exercise only — no live advice",
    timing: "Current exercise window",
    exposure: "NONE",
    impacts: Object.fromEntries(impactKeys.map((k) => [k, "NONE"])),
    proportionateAction: "Monitor and validate local exposure.",
    critical: "NO",
    criticalRationale:
      "Exercise check completed: no operation or dependency exposed.",
    authorityEvidence: "Exercise role / delegated mandate",
    nextReview: "2026-10-10T18:00",
    ...extra,
  };
}
export function recovered(extra: Partial<Input> = {}) {
  return input({
    phase: "NORMAL",
    advice: "EXPIRED",
    recovery: Object.fromEntries(recoveryKeys.map((k) => [k, "CLEAR"])),
    recoveryNotes: "All checks confirmed clear for exercise.",
    ...extra,
  });
}
