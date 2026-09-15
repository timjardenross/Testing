import {
  type Data,
  type Input,
  type Posture,
  type Version,
  type EventRecord,
  now,
  uid,
  backupSchema,
  dataSchema,
  centreSchema,
  type Centre,
} from "./model";
import { evaluate, completionErrors } from "./engine";
export function audit(d: Data, type: string, event: string, detail: string) {
  d.audit.push({ id: uid(), at: now(), type, event, detail });
}
export function saveDraft(d: Data, id: string, i: Input) {
  let e = d.events.find((e) => e.id === id);
  if (!e) {
    e = {
      id,
      status: "OPEN",
      created: now(),
      versions: [],
      draft: null,
      actions: [],
      communications: [],
      escalations: [],
      nextReview: "",
      closure: null,
    };
    d.events.push(e);
    audit(d, "ASSESSMENT CREATED", id, "Draft created");
  }
  if (e.status === "CLOSED") throw Error("Reopen the event before editing.");
  e.draft = structuredClone(i);
  audit(d, "DRAFT SAVED", id, "Draft stored");
}
export function complete(
  d: Data,
  id: string,
  i: Input,
  p: Posture,
  maker: string,
  rationale: string,
) {
  const errors = completionErrors(i, p, maker, rationale);
  if (errors.length) throw Error(errors.join("\n"));
  saveDraft(d, id, i);
  const e = d.events.find((e) => e.id === id)!;
  const recommendation = evaluate(i);
  const v: Version = {
    id: uid(),
    number: e.versions.length + 1,
    at: now(),
    input: structuredClone(i),
    centres: structuredClone(d.centres.filter((c) => i.centres.includes(c.id))),
    recommendation,
    operations: {
      actions: e.actions.map((a) => ({ id: a.id, status: a.status })),
      communications: e.communications.map((c) => c.id),
      escalations: e.escalations.map((s) => ({ id: s.id, status: s.status })),
    },
    decision: {
      posture: p,
      maker,
      rationale,
      at: now(),
      authority: i.authority,
    },
  };
  e.versions.push(v);
  e.draft = null;
  e.nextReview = i.nextReview;
  audit(d, "POSTURE RECOMMENDED", id, `${v.id}: ${recommendation.posture}`);
  audit(
    d,
    p === recommendation.posture ? "POSTURE ACCEPTED" : "POSTURE OVERRIDDEN",
    id,
    `${p}: ${rationale}`,
  );
  audit(
    d,
    v.number === 1 ? "ASSESSMENT COMPLETED" : "REASSESSMENT COMPLETED",
    id,
    v.id,
  );
  return v;
}
export function closeEvent(d: Data, id: string, by: string, rationale: string) {
  const e = d.events.find((e) => e.id === id)!;
  if (!by.trim() || !rationale.trim())
    throw Error("Closure decision-maker and rationale are required.");
  if (e.draft) throw Error("Complete the draft before closure.");
  const v = e.versions.at(-1);
  if (!v || v.input.phase === "ASSESS")
    throw Error("Complete a recovery assessment before closing.");
  if (
    v.recommendation.posture === "T3" ||
    v.input.unsafe ||
    v.input.protectiveAdvice ||
    Object.values(v.input.impacts).some((x) =>
      ["MATERIAL", "LIKELY", "POSSIBLE"].includes(x),
    )
  )
    throw Error(
      "Unsafe or ongoing impacts remain in the latest assessment. Reassess and resolve or document their hand-off before closure.",
    );
  if (Object.values(v.input.recovery).some((x) => x !== "CLEAR"))
    throw Error(
      "Recovery checks must be clear before closure. Continue T4 or record residual hand-off as clear with supporting rationale.",
    );
  e.status = "CLOSED";
  e.closure = { at: now(), by, rationale };
  audit(d, "EVENT CLOSED", id, `${by}: ${rationale}`);
}
export function reopen(d: Data, id: string) {
  const e = d.events.find((e) => e.id === id)!;
  e.status = "OPEN";
  e.closure = null;
  audit(d, "EVENT REOPENED", id, "Previous closure remains in audit history.");
}
export function backup(d: Data) {
  return JSON.stringify(
    { format: "climate-resilience-backup", exportedAt: now(), data: d },
    null,
    2,
  );
}
export function validateData(value: unknown): Data {
  const d = dataSchema.parse(value);
  function unique(ids: string[], label: string) {
    if (new Set(ids).size !== ids.length)
      throw Error(`Duplicate ${label} IDs.`);
  }
  unique(
    d.events.map((e) => e.id),
    "event",
  );
  unique(
    d.centres.map((c) => c.id),
    "centre",
  );
  unique(
    d.audit.map((a) => a.id),
    "audit",
  );
  for (const e of d.events) {
    unique(
      e.versions.map((v) => v.id),
      "version",
    );
    e.versions.forEach((v, n) => {
      if (
        completionErrors(
          v.input,
          v.decision.posture,
          v.decision.maker,
          v.decision.rationale,
        ).length
      )
        throw Error(
          "Completed assessment is missing mandatory decision evidence.",
        );
      if (v.number !== n + 1)
        throw Error("Non-sequential assessment versions.");
      if (v.input.centres.some((id) => !v.centres.some((c) => c.id === id)))
        throw Error("Assessment centre snapshot is missing.");
    });
    for (const record of [...e.actions, ...e.communications, ...e.escalations])
      if (!e.versions.some((v) => v.id === record.version))
        throw Error("Record references a missing assessment.");
    if (e.draft?.centres.some((id) => !d.centres.some((c) => c.id === id)))
      throw Error("Draft references a missing centre.");
  }
  return d;
}
export function parseBackup(raw: string) {
  if (raw.length > 20000000)
    throw Error(
      "Backup exceeds 20 MB limit. Split / archive data before importing.",
    );
  const b = backupSchema.parse(JSON.parse(raw));
  return validateData(b.data);
}
export function mergeBackup(
  current: Data,
  incoming: Data,
  mode: "KEEP" | "REPLACE",
) {
  const d = structuredClone(current);
  for (const key of ["events", "centres"] as const) {
    for (const entry of incoming[key]) {
      const at = d[key].findIndex((x) => x.id === entry.id);
      if (at < 0)
        (d[key] as (EventRecord | Centre)[]).push(structuredClone(entry));
      else if (mode === "REPLACE")
        (d[key] as (EventRecord | Centre)[])[at] = structuredClone(entry);
    }
  }
  for (const a of incoming.audit)
    if (!d.audit.some((x) => x.id === a.id)) d.audit.push(a);
  if (mode === "REPLACE") d.settings = structuredClone(incoming.settings);
  audit(
    d,
    "DATA IMPORTED",
    "",
    `${mode}: ${incoming.events.length} events, ${incoming.centres.length} centres; existing records not present in import retained.`,
  );
  return validateData(d);
}
export function csv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map(
          (v) =>
            '"' +
            (/^[=+@\-\t\r]/.test(v) ? "'" + v : v).replaceAll('"', '""') +
            '"',
        )
        .join(","),
    )
    .join("\r\n");
}
export function parseCsv(raw: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let n = 0; n < raw.length; n++) {
    const c = raw[n];
    if (c === '"') {
      if (quoted && raw[n + 1] === '"') {
        field += '"';
        n++;
      } else if (!quoted && field) throw Error("Unexpected quote in CSV.");
      else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && raw[n + 1] === "\n") n++;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (quoted) throw Error("Unclosed CSV quote.");
  row.push(field);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
export function importCentres(raw: string): Centre[] {
  let values: unknown;
  if (raw.trim().startsWith("[")) values = JSON.parse(raw);
  else {
    const [headers, ...rows] = parseCsv(raw.replace(/^\uFEFF/, ""));
    if (!headers) throw Error("CSV is empty.");
    if (new Set(headers).size !== headers.length)
      throw Error("Duplicate CSV columns.");
    values = rows.map((row, n) => {
      if (row.length !== headers.length)
        throw Error(`CSV row ${n + 2}: incorrect column count.`);
      return Object.fromEntries(
        headers.map((h, j) => [
          h,
          h === "people" ? (row[j] === "" ? null : Number(row[j])) : row[j],
        ]),
      );
    });
  }
  const result = centreSchema.array().parse(values);
  if (new Set(result.map((c) => c.id)).size !== result.length)
    throw Error("Duplicate centre IDs in import.");
  return result;
}
export function centresCsv(centres: Centre[]) {
  const headers = Object.keys(centreSchema.shape);
  return csv([
    headers,
    ...centres.map((c) =>
      headers.map((k) => String(c[k as keyof Centre] ?? "")),
    ),
  ]);
}
export type Change = {
  field: string;
  before: string;
  after: string;
  kind: string;
};
export function changes(
  previous: Version | undefined,
  current: Version,
): Change[] {
  if (!previous)
    return [
      {
        field: "Assessment",
        before: "No prior assessment",
        after: "Initial assessment",
        kind: "NEW",
      },
    ];
  const result: Change[] = [];
  const before = {
      ...previous.input,
      "Human posture": previous.decision.posture,
      Recommendation: previous.recommendation.posture,
      "Action statuses": previous.operations.actions,
      "Communication records": previous.operations.communications,
      "Escalation statuses": previous.operations.escalations,
      "Centre snapshots": previous.centres,
    },
    after = {
      ...current.input,
      "Human posture": current.decision.posture,
      Recommendation: current.recommendation.posture,
      "Action statuses": current.operations.actions,
      "Communication records": current.operations.communications,
      "Escalation statuses": current.operations.escalations,
      "Centre snapshots": current.centres,
    };
  for (const key of Object.keys(after)) {
    const a = before[key as keyof typeof before],
      b = after[key as keyof typeof after];
    if (JSON.stringify(a) === JSON.stringify(b)) continue;
    if (key === "impacts") {
      for (const k of Object.keys(b as object)) {
        const aa = previous.input.impacts[k],
          bb = current.input.impacts[k];
        if (aa === bb) continue;
        const order = ["NONE", "POSSIBLE", "LIKELY", "MATERIAL"];
        const kind =
          aa === "UNKNOWN" || bb === "UNKNOWN"
            ? "CHANGED"
            : bb === "NONE"
              ? "RESOLVED"
              : order.indexOf(bb) > order.indexOf(aa)
                ? "WORSENED"
                : "IMPROVED";
        result.push({ field: k, before: aa, after: bb, kind });
      }
    } else
      result.push({
        field: key,
        before:
          typeof a === "object" ? JSON.stringify(a) : String(a ?? "Unknown"),
        after:
          typeof b === "object" ? JSON.stringify(b) : String(b ?? "Unknown"),
        kind: "CHANGED",
      });
  }
  return result.length
    ? result
    : [
        {
          field: "Assessment inputs",
          before: "Same",
          after: "Same",
          kind: "UNCHANGED",
        },
      ];
}
export function decisionRecord(e: EventRecord, v: Version) {
  return {
    recordType: "Climate & Severe Weather decision record",
    sourceStatus:
      "Operational Plan v0.6 DRAFT; Outlook v1.0 Approved. Decision support, not enterprise residual risk.",
    schemaVersion: 1,
    eventId: e.id,
    eventStatus: e.status,
    assessment: v,
    actions: e.actions.filter((a) => a.version === v.id),
    communications: e.communications.filter((c) => c.version === v.id),
    escalations: e.escalations.filter((s) => s.version === v.id),
    currentEventNextReview: e.nextReview,
    closure: e.closure,
  };
}
