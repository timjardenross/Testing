import { describe, it, expect } from "vitest";
import {
  evaluate,
  completionErrors,
  exposureSummary,
} from "../../src/domain/engine";
import { emptyData, emptyCentre, emptyInput } from "../../src/domain/model";
import { input, recovered } from "../fixtures";
import {
  complete,
  saveDraft,
  backup,
  parseBackup,
  mergeBackup,
  changes,
  closeEvent,
  reopen,
  centresCsv,
  importCentres,
  validateData,
} from "../../src/domain/records";
import {
  draftCommunication,
  communicationTypes,
} from "../../src/domain/communications";
import { hazards } from "../../src/config/pack";
describe("condition / exposure engine", () => {
  it("T0 routine monitoring", () =>
    expect(evaluate(input()).posture).toBe("T0"));
  for (const hazard of Object.keys(hazards) as (keyof typeof hazards)[])
    for (const level of ["T1", "T2", "T3"] as const)
      it(`${hazard} ${level} requires supported geographic exposure`, () => {
        expect(
          evaluate(
            input({
              hazard,
              exposure: "CONFIRMED",
              conditions: [level],
              conditionEvidence: "Inject",
            }),
          ).posture,
        ).toBe(level);
        expect(
          evaluate(input({ hazard, exposure: "NONE", conditions: [level] }))
            .posture,
        ).toBe("T0");
      });
  it("skips levels on immediate safety even with exposure unknown", () =>
    expect(evaluate(input({ exposure: "UNKNOWN", unsafe: true })).posture).toBe(
      "T3",
    ));
  it("observed impact does not require warning", () =>
    expect(
      evaluate(input({ impacts: { ...input().impacts, Power: "MATERIAL" } }))
        .posture,
    ).toBe("T3"));
  it("warning expiry with material effects still acts unless recovery explicitly selected", () =>
    expect(
      evaluate(input({ advice: "EXPIRED", impacts: { Power: "MATERIAL" } }))
        .posture,
    ).toBe("T3"));
  it("warning outside footprint does not activate", () =>
    expect(
      evaluate(input({ advice: "WARNING", exposure: "NONE" })).posture,
    ).toBe("T0"));
  it("warning at relevant footprint activates", () =>
    expect(
      evaluate(input({ advice: "WARNING", exposure: "CONFIRMED" })).posture,
    ).toBe("T3"));
  for (const critical of ["YES", "UNCERTAIN"] as const)
    it(`Critical Operation ${critical} always escalates`, () =>
      expect(evaluate(input({ critical })).escalation.join()).toContain(
        "ENTERPRISE ESCALATION REQUIRED",
      ));
  it("unknown advice / conflicting information remain visible", () => {
    const r = evaluate(emptyInput());
    expect(r.unresolved.join()).toContain("authoritative");
    expect(r.unresolved.join()).toContain("unknown");
  });
  it("primary unavailable maintains authority chain", () =>
    expect(
      evaluate(input({ primaryAvailable: false })).escalation.join(),
    ).toContain("Divisional Executive"));
  it("recovery remains T4 until every check clear", () => {
    expect(
      evaluate(input({ phase: "NORMAL", advice: "EXPIRED" })).posture,
    ).toBe("T4");
    expect(evaluate(recovered()).posture).toBe("T0");
    expect(evaluate(recovered({ unsafe: true })).posture).toBe("T3");
  });
  it("broader direction requires approval, not ordinary safety communication", () => {
    expect(
      completionErrors(
        input({ broadDirection: true }),
        "T0",
        "Delegate",
        "",
      ).join(),
    ).toContain("BC Director");
    expect(
      completionErrors(input({ unsafe: true }), "T3", "Delegate", ""),
    ).toEqual([]);
  });
  it("overrides require rationale", () =>
    expect(completionErrors(input(), "T2", "Delegate", "").join()).toContain(
      "Override",
    ));
  it("unknown centre counts stay unknown; total overrides avoid double-count", () => {
    const c = emptyCentre();
    expect(exposureSummary(input({ centres: [c.id] }), [c]).people).toBeNull();
    expect(
      exposureSummary(input({ centres: [c.id], people: 50 }), [
        { ...c, people: 100 },
      ]).people,
    ).toBe(50);
  });
});
describe("records and imports", () => {
  it("preserves snapshots, human override, differences and previous version", () => {
    const d = emptyData(),
      c = { ...emptyCentre(), name: "DEMO" };
    d.centres.push(c);
    const a = complete(
      d,
      "test",
      input({ centres: [c.id] }),
      "T1",
      "Operator",
      "Precautionary heads-up",
    );
    const original = JSON.stringify(a);
    d.centres[0].name = "Changed";
    const b = complete(
      d,
      "test",
      input({ centres: [c.id], unsafe: true }),
      "T3",
      "Director",
      "",
    );
    expect(JSON.stringify(a)).toBe(original);
    expect(a.centres[0].name).toBe("DEMO");
    expect(changes(a, b).some((x) => x.field === "Human posture")).toBe(true);
    expect(a.recommendation.posture).toBe("T0");
  });
  it("draft and reassessment export round trip", () => {
    const d = emptyData();
    complete(d, "test", input(), "T0", "Operator", "");
    saveDraft(d, "test", input({ notes: "Preserve draft" }));
    expect(parseBackup(backup(d))).toEqual(d);
  });
  it("rejects corruption, incompatible schema and duplicates", () => {
    expect(() => parseBackup("{broken")).toThrow();
    const d = emptyData();
    expect(() =>
      parseBackup(backup({ ...d, schemaVersion: 2 } as never)),
    ).toThrow();
    complete(d, "x", input(), "T0", "O", "");
    d.events.push(d.events[0]);
    expect(() => validateData(d)).toThrow("Duplicate event");
  });
  it("unknown future schema is not destructively migrated", () =>
    expect(() => validateData({ ...emptyData(), schemaVersion: 9 })).toThrow());
  it("keep and replace conflict modes explicit, unrelated records survive", () => {
    const a = emptyData(),
      b = emptyData();
    complete(a, "one", input(), "T0", "A", "");
    complete(a, "two", input(), "T0", "A", "");
    complete(b, "one", input({ title: "Imported" }), "T0", "B", "");
    expect(
      mergeBackup(a, b, "KEEP").events[0].versions[0].input.title,
    ).not.toBe("Imported");
    expect(mergeBackup(a, b, "REPLACE").events[0].versions[0].input.title).toBe(
      "Imported",
    );
    expect(mergeBackup(a, b, "REPLACE").events).toHaveLength(2);
  });
  it("closure needs recovery and rationale; reopen preserves evidence", () => {
    const d = emptyData();
    complete(d, "one", input(), "T0", "A", "");
    expect(() => closeEvent(d, "one", "A", "done")).toThrow();
    complete(d, "one", recovered(), "T0", "A", "");
    closeEvent(d, "one", "A", "Checks clear");
    reopen(d, "one");
    expect(d.events[0].versions).toHaveLength(2);
    expect(d.audit.some((a) => a.type === "EVENT CLOSED")).toBe(true);
  });
  it("CSV supports quotes, commas, multiline and unknown numbers", () => {
    const c = {
      ...emptyCentre(),
      name: 'DEMO "North", Centre',
      notes: "line 1\nline 2",
    };
    expect(importCentres(centresCsv([c]))).toEqual([c]);
    expect(() => importCentres('id,name\nx,"broken')).toThrow();
    expect(() =>
      importCentres(JSON.stringify([{ ...c, people: -1 }])),
    ).toThrow();
  });
  it("CSV formula cells are escaped for spreadsheet use", () =>
    expect(centresCsv([{ ...emptyCentre(), name: "=1+1" }])).toContain(
      "'=1+1",
    ));
  for (const type of communicationTypes)
    it(`${type} includes five communication elements`, () => {
      const d = emptyData();
      const v = complete(d, "one", input(), "T0", "A", "");
      const text = draftCommunication(type, v, "next update");
      for (const part of [
        "What:",
        "Where / when:",
        "People / Business Centres:",
        "Action now:",
        "Next update:",
      ])
        expect(text).toContain(part);
    });
});
it("rejects missing recovery keys and broken assessment centre references", () => {
  const d = emptyData();
  const v = complete(d, "test", input(), "T0", "Operator", "");
  delete v.input.recovery["Transport"];
  expect(() => validateData(d)).toThrow();
});
it("cannot close while active safety is retained even with clear recovery checks", () => {
  const d = emptyData();
  complete(d, "test", recovered({ unsafe: true }), "T3", "Operator", "");
  expect(() => closeEvent(d, "test", "Operator", "Warning expired")).toThrow(
    "Unsafe",
  );
});
