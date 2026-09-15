import {
  type Input,
  type Centre,
  type Recommendation,
  impactKeys,
  recoveryKeys,
} from "./model";
import { actions, hazards, rulesVersion } from "../config/pack";
export function exposureSummary(i: Input, centres: Centre[]) {
  const selected = centres.filter((c) => i.centres.includes(c.id));
  const known = selected
    .filter((c) => c.people !== null)
    .reduce((n, c) => n + c.people!, 0);
  return {
    centres: selected.length,
    people:
      i.people ??
      (selected.length && selected.every((c) => c.people !== null)
        ? known
        : null),
    knownCentrePeople: known,
    dependencies: [
      ...new Set(selected.map((c) => c.dependencies).filter(Boolean)),
    ],
    hazards: [...new Set(selected.map((c) => c.hazards).filter(Boolean))],
  };
}
export function evaluate(i: Input): Recommendation {
  const evidence: string[] = [],
    unresolved: string[] = [],
    escalation: string[] = [];
  const exposed = i.exposure === "POTENTIAL" || i.exposure === "CONFIRMED";
  const material = Object.values(i.impacts).includes("MATERIAL");
  const likely = Object.values(i.impacts).includes("LIKELY");
  const possible = Object.values(i.impacts).includes("POSSIBLE");
  const activeProtect =
    i.protectiveAdvice || i.unsafe || i.advice === "EMERGENCY";
  let p: Recommendation["posture"] = "T0";
  if (
    exposed &&
    (i.conditions.includes("T1") ||
      ["FORECAST", "WATCH"].includes(i.advice) ||
      possible)
  ) {
    p = "T1";
    evidence.push("Credible emerging threat intersects identified exposure.");
  }
  if (exposed && (i.conditions.includes("T2") || likely)) {
    p = "T2";
    evidence.push(
      "Material exposure increasingly likely; preparation is proportionate.",
    );
  }
  if (
    activeProtect ||
    material ||
    (exposed && (i.advice === "WARNING" || i.conditions.includes("T3")))
  ) {
    p = "T3";
    evidence.push(
      activeProtect
        ? "Protective advice or unsafe conditions require action."
        : material
          ? "Material disruption is recorded, including where no warning is current."
          : "Relevant official warning / T3 hazard condition intersects exposure.",
    );
  }
  const ongoingImmediate =
    activeProtect ||
    ((i.advice === "WARNING" || i.conditions.includes("T3")) &&
      i.phase === "ASSESS");
  const allClear = recoveryKeys.every((k) => i.recovery[k] === "CLEAR");
  if (i.phase !== "ASSESS" && !ongoingImmediate) {
    p =
      i.phase === "NORMAL" && allClear && !material && !likely && !possible
        ? "T0"
        : "T4";
    evidence.push(
      p === "T0"
        ? "All recovery checks are clear and return to normal is explicitly assessed."
        : "Immediate threat marked passed; residual or unresolved recovery checks remain.",
    );
  }
  if (!evidence.length)
    evidence.push(
      "No confirmed near-term exposure / impact trigger has been established. This is not evidence that unknown conditions are safe.",
    );
  for (const c of i.conditions)
    evidence.push(
      `${hazards[i.hazard].name} ${c}: ${hazards[i.hazard][c]} Evidence: ${i.conditionEvidence || "not recorded"}`,
    );
  if (!i.source.trim() || !i.adviceDetails.trim() || i.advice === "UNKNOWN")
    unresolved.push(
      "Obtain / clarify authoritative advice and source. Do not downgrade official advice.",
    );
  if (i.exposure === "UNKNOWN")
    unresolved.push(
      "Exposure is unknown; validate people, commuting catchments and Business Centres urgently.",
    );
  if (!i.centres.length)
    unresolved.push(
      "No Business Centres selected; confirm whether workforce / travelling-team exposure is sufficient.",
    );
  if (i.people === null)
    unresolved.push(
      "Total people exposure is not entered; review the register estimate and uncounted workforce.",
    );
  if (impactKeys.some((k) => i.impacts[k] === "UNKNOWN" || !i.impacts[k]))
    unresolved.push("Some impact assessments are unknown.");
  if (i.conflicting)
    unresolved.push(
      "Conflicting information recorded; reconcile sources and retain protective advice.",
    );
  if (i.conditions.length && !i.conditionEvidence.trim())
    unresolved.push("Hazard trigger evidence is missing.");
  if (
    i.exposure === "NONE" &&
    (material || activeProtect || i.conditions.length)
  )
    unresolved.push(
      "No exposure conflicts with recorded triggers / impacts; resolve before relying on this assessment.",
    );
  if (i.rate === "RAPID")
    unresolved.push(
      "Rapidly changing conditions: reassess as new advice arrives; levels may be skipped.",
    );
  if (i.phase !== "ASSESS" && !allClear)
    unresolved.push(
      "Recovery checks remain affected / unknown; warning expiry does not authorise normal attendance.",
    );
  if (!i.primaryAvailable)
    escalation.push(
      "Primary unavailable: continue BC&R Lead → BC Director → Divisional Executive / nominated delegate using Microsoft Teams and the confirmed after-hours mechanism.",
    );
  if (i.critical !== "NO")
    escalation.push(
      "ENTERPRISE ESCALATION REQUIRED — Critical Operation / supporting dependency / impact tolerance: " +
        i.critical +
        ". Hand off through the current BC Manual; no enterprise residual-risk assessment.",
    );
  if (i.propertyStatus === "UNKNOWN" && exposed)
    escalation.push(
      "Clarify enterprise Property / site status using the current BC Manual.",
    );
  for (const x of i.enterpriseNeeds)
    escalation.push(
      `${x}: refer to the current BC Manual for authoritative hand-off.`,
    );
  if (i.broadDirection)
    escalation.push(
      "Broader protective attendance direction requires Business Continuity Director approval. " +
        (i.directorApproval
          ? "Approval evidence recorded."
          : "Approval is not recorded."),
    );
  return {
    posture: p,
    why: {
      T0: "Routine monitoring / explicitly validated return to normal.",
      T1: "Validate exposure and issue proportionate awareness.",
      T2: "Prepare for increasingly likely operational effects.",
      T3: "Act on unsafe conditions, relevant warnings or material disruption.",
      T4: "Manage residual effects before returning to normal.",
    }[p],
    evidence,
    actions: [...actions[p]],
    unresolved,
    escalation,
    communications: [
      "Core decision coordination: Microsoft Teams.",
      "Workforce: Email; People Leader cascade where required.",
      "State what, where / when, implications, action and next update.",
    ],
    nextReview:
      i.nextReview ||
      "Operator must set next review; no policy interval is inferred.",
    rulesVersion,
  };
}
export function completionErrors(
  i: Input,
  decision: string,
  maker: string,
  rationale: string,
) {
  const e: string[] = [];
  for (const [k, label] of [
    ["title", "Event name"],
    ["assessor", "Assessor"],
    ["geography", "Geography"],
    ["source", "Authoritative source"],
    ["adviceDetails", "Advice details"],
    ["timing", "Expected timing"],
    ["proportionateAction", "Proportionate action"],
    ["criticalRationale", "Critical Operations rationale"],
    ["authorityEvidence", "Authority / delegation evidence"],
  ] as const)
    if (!i[k].trim())
      e.push(
        `${label} is required (record unknown with follow-up where needed).`,
      );
  if (!maker.trim()) e.push("Decision-maker is required.");
  if (decision !== evaluate(i).posture && !rationale.trim())
    e.push("Override rationale is required.");
  if (!i.nextReview || !Number.isFinite(Date.parse(i.nextReview)))
    e.push("A valid next review is required.");
  if (i.broadDirection && !i.directorApproval.trim())
    e.push(
      "Record BC Director approval before recording a broader protective attendance direction. Protective advice can still be communicated.",
    );
  return e;
}
