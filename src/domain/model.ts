import { z } from "zod";
export const text = z.string().max(30000);
const id = z.string().min(1).max(150);
const iso = z.string().datetime({ offset: true });
export const posture = z.enum(["T0", "T1", "T2", "T3", "T4"]);
export const centreSchema = z
  .object({
    id,
    name: z.string().min(1).max(300),
    location: text,
    state: text,
    region: text,
    coordinates: text,
    status: text,
    people: z.number().int().nonnegative().nullable(),
    attendance: text,
    alternativeWork: text,
    hazards: text,
    dependencies: text,
    propertyReference: text,
    validation: z.enum(["UNVALIDATED", "VALIDATED", "DEMO"]),
    validatedAt: text,
    confidence: z.enum(["UNKNOWN", "LOW", "MEDIUM", "HIGH"]),
    notes: text,
  })
  .strict();
export type Centre = z.infer<typeof centreSchema>;
export const impactKeys = [
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
] as const;
export const recoveryKeys = [
  "People welfare and ability to work",
  "Business Centre availability and enterprise advice",
  "Practical access",
  "Transport",
  "Utilities and connectivity",
  "Operational backlog",
  "Current enterprise advice",
  "Communication completed",
  "Lessons identified",
] as const;
const impact = z.enum(["UNKNOWN", "NONE", "POSSIBLE", "LIKELY", "MATERIAL"]);
export const inputSchema = z
  .object({
    title: text,
    assessor: text,
    hazard: z.enum(["fire", "heat", "flood", "storm", "tropical", "utilities"]),
    geography: text,
    source: text,
    reference: text,
    advice: z.enum([
      "UNKNOWN",
      "GENERAL",
      "FORECAST",
      "WATCH",
      "WARNING",
      "EMERGENCY",
      "EXPIRED",
    ]),
    adviceDetails: text,
    timing: text,
    rate: z.enum(["UNKNOWN", "STABLE", "CHANGING", "RAPID"]),
    notes: text,
    centres: z.array(id),
    workforce: text,
    people: z.number().int().nonnegative().nullable(),
    commuting: text,
    attendance: text,
    travelling: text,
    remote: text,
    otherExposure: text,
    exposure: z.enum(["UNKNOWN", "NONE", "POTENTIAL", "CONFIRMED"]),
    impacts: z
      .object(Object.fromEntries(impactKeys.map((k) => [k, impact])))
      .strict(),
    impactNotes: text,
    conditions: z.array(z.enum(["T1", "T2", "T3"])),
    conditionEvidence: text,
    protectiveAdvice: z.boolean(),
    unsafe: z.boolean(),
    conflicting: z.boolean(),
    proportionateAction: text,
    critical: z.enum(["NO", "YES", "UNCERTAIN"]),
    criticalOperation: text,
    criticalDependency: text,
    impactTolerance: text,
    criticalRationale: text,
    propertyStatus: text,
    enterpriseNeeds: z.array(text),
    primaryAvailable: z.boolean(),
    authority: text,
    authorityEvidence: text,
    broadDirection: z.boolean(),
    directorApproval: text,
    phase: z.enum(["ASSESS", "RECOVER", "NORMAL"]),
    recovery: z
      .object(
        Object.fromEntries(
          recoveryKeys.map((k) => [
            k,
            z.enum(["UNKNOWN", "AFFECTED", "CLEAR"]),
          ]),
        ),
      )
      .strict(),
    recoveryNotes: text,
    nextReview: text,
  })
  .strict();
export type Input = z.infer<typeof inputSchema>;
export type Posture = z.infer<typeof posture>;
export const recommendationSchema = z
  .object({
    posture,
    why: text,
    evidence: z.array(text),
    actions: z.array(text),
    unresolved: z.array(text),
    escalation: z.array(text),
    communications: z.array(text),
    nextReview: text,
    rulesVersion: text,
  })
  .strict();
export type Recommendation = z.infer<typeof recommendationSchema>;
export const versionSchema = z
  .object({
    id,
    number: z.number().int().positive(),
    at: iso,
    input: inputSchema,
    centres: z.array(centreSchema),
    recommendation: recommendationSchema,
    operations: z
      .object({
        actions: z.array(z.object({ id, status: text }).strict()),
        communications: z.array(id),
        escalations: z.array(z.object({ id, status: text }).strict()),
      })
      .strict(),
    decision: z
      .object({
        posture,
        rationale: text,
        maker: z.string().min(1),
        at: iso,
        authority: text,
      })
      .strict(),
  })
  .strict();
export type Version = z.infer<typeof versionSchema>;
export const actionSchema = z
  .object({
    id,
    text: z.string().min(1),
    owner: z.string().min(1),
    created: iso,
    due: text,
    status: z.enum(["OPEN", "IN PROGRESS", "COMPLETE", "CANCELLED"]),
    completed: iso.nullable(),
    notes: text,
    version: id,
  })
  .strict();
export const communicationSchema = z
  .object({
    id,
    type: text,
    audience: z.string().min(1),
    channel: z.string().min(1),
    at: iso,
    by: z.string().min(1),
    text: z.string().min(1),
    version: id,
  })
  .strict();
export const escalationSchema = z
  .object({
    id,
    at: iso,
    by: z.string().min(1),
    path: z.string().min(1),
    status: z.enum(["INITIATED", "ACKNOWLEDGED", "RESOLVED"]),
    notes: text,
    version: id,
  })
  .strict();
export const auditSchema = z
  .object({ id, at: iso, type: text, event: text, detail: text })
  .strict();
export const eventSchema = z
  .object({
    id,
    status: z.enum(["OPEN", "CLOSED"]),
    created: iso,
    versions: z.array(versionSchema),
    draft: inputSchema.nullable(),
    actions: z.array(actionSchema),
    communications: z.array(communicationSchema),
    escalations: z.array(escalationSchema),
    nextReview: text,
    closure: z
      .object({ at: iso, by: text, rationale: text })
      .strict()
      .nullable(),
  })
  .strict();
export type EventRecord = z.infer<typeof eventSchema>;
export const settingsSchema = z
  .object({
    enterpriseReference: text,
    authorityReference: text,
    workforceChannel: text,
    coreChannel: text,
    classification: text,
    readiness: z.record(
      z
        .object({
          status: z.enum(["NOT CONFIRMED", "IN PROGRESS", "CONFIRMED"]),
          evidence: text,
          date: text,
        })
        .strict(),
    ),
  })
  .strict();
export const dataSchema = z
  .object({
    schemaVersion: z.literal(1),
    revision: z.number().int().nonnegative(),
    events: z.array(eventSchema),
    centres: z.array(centreSchema),
    settings: settingsSchema,
    audit: z.array(auditSchema),
  })
  .strict();
export type Data = z.infer<typeof dataSchema>;
export const backupSchema = z
  .object({
    format: z.literal("climate-resilience-backup"),
    exportedAt: iso,
    data: dataSchema,
  })
  .strict();
export const uid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const readinessGates = [
  "Business Centre register validation",
  "Authority and delegates / contacts",
  "Communication channels and distribution lists",
  "After-hours mechanism",
  "Attendance authority boundaries",
  "Enterprise escalation reference",
  "Tabletop and actions",
  "Last seasonal / Outlook review",
  "Last plan / rules review",
];
export function emptyData(): Data {
  return {
    schemaVersion: 1,
    revision: 0,
    events: [],
    centres: [],
    audit: [],
    settings: {
      enterpriseReference:
        "Refer to the current BC Manual for authoritative enterprise contacts and escalation pathways.",
      authorityReference:
        "BC&R Lead → BC Director → Divisional Executive / nominated delegate. Current role holders and contacts: controlled Annex A.",
      workforceChannel: "Email",
      coreChannel: "Microsoft Teams",
      classification: "Classification must be confirmed before distribution",
      readiness: Object.fromEntries(
        readinessGates.map((k) => [
          k,
          { status: "NOT CONFIRMED", evidence: "", date: "" },
        ]),
      ),
    },
  };
}
export function emptyInput(): Input {
  return {
    title: "",
    assessor: "",
    hazard: "storm",
    geography: "",
    source: "",
    reference: "",
    advice: "UNKNOWN",
    adviceDetails: "",
    timing: "",
    rate: "UNKNOWN",
    notes: "",
    centres: [],
    workforce: "",
    people: null,
    commuting: "",
    attendance: "",
    travelling: "",
    remote: "",
    otherExposure: "",
    exposure: "UNKNOWN",
    impacts: Object.fromEntries(impactKeys.map((k) => [k, "UNKNOWN"])),
    impactNotes: "",
    conditions: [],
    conditionEvidence: "",
    protectiveAdvice: false,
    unsafe: false,
    conflicting: false,
    proportionateAction: "",
    critical: "UNCERTAIN",
    criticalOperation: "",
    criticalDependency: "",
    impactTolerance: "",
    criticalRationale: "",
    propertyStatus: "UNKNOWN",
    enterpriseNeeds: [],
    primaryAvailable: true,
    authority: "Business Continuity & Resilience Lead",
    authorityEvidence: "",
    broadDirection: false,
    directorApproval: "",
    phase: "ASSESS",
    recovery: Object.fromEntries(recoveryKeys.map((k) => [k, "UNKNOWN"])),
    recoveryNotes: "",
    nextReview: "",
  };
}
export function emptyCentre(): Centre {
  return {
    id: uid(),
    name: "",
    location: "",
    state: "",
    region: "",
    coordinates: "",
    status: "UNKNOWN",
    people: null,
    attendance: "",
    alternativeWork: "",
    hazards: "",
    dependencies: "",
    propertyReference: "",
    validation: "UNVALIDATED",
    validatedAt: "",
    confidence: "UNKNOWN",
    notes: "",
  };
}
