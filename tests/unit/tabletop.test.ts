import { it, expect } from "vitest";
import { input, recovered } from "../fixtures";
import { emptyData, now, uid } from "../../src/domain/model";
import { complete, closeEvent } from "../../src/domain/records";
import { evaluate } from "../../src/domain/engine";
import { draftCommunication } from "../../src/domain/communications";
it("embedded after-hours inject sequence preserves decisions and enterprise hand-off", () => {
  const d = emptyData();
  let i = input({
    exposure: "CONFIRMED",
    conditions: ["T1"],
    conditionEvidence: "Emerging severe storm",
    workforce: "DEMO concentration",
  });
  complete(d, "tabletop", i, "T1", "BC&R Lead", "Emerging threat");
  i = { ...i, primaryAvailable: false, conditions: ["T2"] };
  expect(evaluate(i).escalation.join()).toContain("Divisional Executive");
  complete(d, "tabletop", i, "T2", "Delegate", "Preparation within mandate");
  i = {
    ...i,
    conditions: ["T3"],
    unsafe: true,
    critical: "UNCERTAIN",
    criticalRationale: "Supporting dependency uncertain; BC Manual hand-off",
    broadDirection: true,
    directorApproval: "Exercise Director approval via Teams",
  };
  const act = complete(
    d,
    "tabletop",
    i,
    "T3",
    "BC Director",
    "Protective attendance direction approved",
  );
  expect(act.recommendation.escalation.join()).toContain(
    "ENTERPRISE ESCALATION REQUIRED",
  );
  const e = d.events[0];
  e.communications.push({
    id: uid(),
    at: now(),
    by: "Delegate",
    type: "WORKFORCE UPDATE",
    audience: "DEMO workforce",
    channel: "Email",
    text: draftCommunication("WORKFORCE UPDATE", act, i.nextReview),
    version: act.id,
  });
  e.escalations.push({
    id: uid(),
    at: now(),
    by: "Delegate",
    path: "Exercise BC Manual enterprise route",
    status: "INITIATED",
    notes: "Property and Critical Operation dependency uncertain",
    version: act.id,
  });
  i = {
    ...i,
    advice: "EXPIRED",
    phase: "RECOVER",
    unsafe: false,
    conditions: [],
    impacts: { ...i.impacts, Power: "MATERIAL" },
  };
  complete(d, "tabletop", i, "T4", "Delegate", "Utilities remain disrupted");
  expect(() =>
    closeEvent(d, "tabletop", "Delegate", "Warning expired"),
  ).toThrow();
  complete(
    d,
    "tabletop",
    recovered(),
    "T0",
    "Delegate",
    "Enterprise advice / recovery checks clear",
  );
  closeEvent(
    d,
    "tabletop",
    "Delegate",
    "Recovery and communications complete; lessons recorded",
  );
  expect(e.versions.map((v) => v.decision.posture)).toEqual([
    "T1",
    "T2",
    "T3",
    "T4",
    "T0",
  ]);
  expect(e.versions[3].operations.communications).toHaveLength(1);
  expect(e.status).toBe("CLOSED");
});
