import { useState } from "react";
import {
  type Input,
  type Data,
  type Posture,
  impactKeys,
  recoveryKeys,
} from "../domain/model";
import { evaluate, exposureSummary, completionErrors } from "../domain/engine";
import { hazards, levels, authority, safeguard } from "../config/pack";
import { Field, Check } from "./Fields";
export function Assessment({
  initial,
  data,
  eventId,
  onSave,
  onComplete,
  onExport,
}: {
  initial: Input;
  data: Data;
  eventId: string;
  onSave: (i: Input) => Promise<void>;
  onComplete: (
    i: Input,
    p: Posture,
    maker: string,
    rationale: string,
  ) => Promise<void>;
  onExport: (i: Input) => void;
}) {
  const [i, set] = useState(initial),
    [step, setStep] = useState(0),
    [selected, setSelected] = useState<Posture | null>(null),
    [maker, setMaker] = useState(""),
    [rationale, setRationale] = useState(""),
    [errors, setErrors] = useState<string[]>([]),
    [busy, setBusy] = useState(false);
  const update = <K extends keyof Input>(k: K, v: Input[K]) =>
    set((old) => ({ ...old, [k]: v }));
  const f = (
    k: keyof Input,
    label: string,
    options?: string[],
    type = "text",
    wide = false,
  ) => (
    <Field
      key={k}
      label={label}
      value={String(i[k] ?? "")}
      onChange={(v) => update(k, v as never)}
      options={options}
      type={type}
      wide={wide}
    />
  );
  const r = evaluate(i),
    p = selected ?? r.posture,
    summary = exposureSummary(i, data.centres);
  const steps = [
    "Event",
    "Exposure",
    "Impact",
    "Decision test",
    "Decision & review",
  ];
  async function finish() {
    const e = completionErrors(i, p, maker, rationale);
    setErrors(e);
    if (e.length) return;
    setBusy(true);
    try {
      await onComplete(i, p, maker, rationale);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">GUIDED ASSESSMENT · {eventId}</p>
          <h1>
            {data.events.find((e) => e.id === eventId)?.versions.length
              ? "Reassess event"
              : "New assessment"}
          </h1>
        </div>
        <button onClick={() => onExport(i)}>Export unsaved draft</button>
      </div>
      <div className="wizard-layout">
        <section className="panel">
          <nav className="steps" aria-label="Assessment steps">
            {steps.map((s, n) => (
              <button
                key={s}
                aria-current={step === n ? "step" : undefined}
                onClick={() => setStep(n)}
              >
                {n + 1}. {s}
              </button>
            ))}
          </nav>
          <h2>
            {step + 1}. {steps[step]}
          </h2>
          <div className="fields">
            {step === 0 && (
              <>
                {f("title", "Event name")}
                {f("assessor", "Assessor")}
                <Field
                  label="Hazard"
                  value={i.hazard}
                  onChange={(v) =>
                    set({
                      ...i,
                      hazard: v as Input["hazard"],
                      conditions: [],
                      conditionEvidence: "",
                    })
                  }
                  options={Object.entries(hazards).map(([value, h]) => ({
                    value,
                    label: h.name,
                  }))}
                />
                {f("geography", "Affected geography")}
                {f("source", "Authoritative source")}
                {f("reference", "Source / reference details")}
                {f("advice", "Current advice", [
                  "UNKNOWN",
                  "GENERAL",
                  "FORECAST",
                  "WATCH",
                  "WARNING",
                  "EMERGENCY",
                  "EXPIRED",
                ])}
                {f("timing", "Expected timing")}
                {f("rate", "Rate of change", [
                  "UNKNOWN",
                  "STABLE",
                  "CHANGING",
                  "RAPID",
                ])}
                {f(
                  "adviceDetails",
                  "Forecast / warning / advice details",
                  undefined,
                  "textarea",
                  true,
                )}
                {f("notes", "Relevant notes", undefined, "textarea", true)}
                <div className="wide">
                  <Check
                    label="Information conflicts or requires reconciliation"
                    checked={i.conflicting}
                    onChange={(v) => update("conflicting", v)}
                  />
                </div>
              </>
            )}
            {step === 1 && (
              <>
                {f("exposure", "Relevant exposure", [
                  "UNKNOWN",
                  "NONE",
                  "POTENTIAL",
                  "CONFIRMED",
                ])}
                {f("workforce", "Workforce concentrations")}
                <fieldset className="wide">
                  <legend>Affected Business Centres</legend>
                  {data.centres.length ? (
                    data.centres.map((c) => (
                      <Check
                        key={c.id}
                        label={`${c.name} · ${c.validation} · ${c.people ?? "Unknown"} people`}
                        checked={i.centres.includes(c.id)}
                        onChange={(v) =>
                          update(
                            "centres",
                            v
                              ? [...i.centres, c.id]
                              : i.centres.filter((id) => id !== c.id),
                          )
                        }
                      />
                    ))
                  ) : (
                    <p>
                      No register records yet. You can assess workforce / travel
                      exposure and add centres later.
                    </p>
                  )}
                </fieldset>
                <Field
                  label="Total approximate people exposed (optional)"
                  type="number"
                  value={i.people === null ? "" : String(i.people)}
                  onChange={(v) =>
                    update("people", v === "" ? null : Number(v))
                  }
                  hint="A manual total replaces the centre estimate; include uncounted teams without double counting."
                />
                <div className="metric">
                  <strong>
                    {summary.centres} centres · {summary.people ?? "Unknown"}{" "}
                    people
                  </strong>
                  <small>
                    Known centre subtotal: {summary.knownCentrePeople}.
                    Dependencies:{" "}
                    {summary.dependencies.join("; ") || "Not recorded"}. Hazard
                    attributes: {summary.hazards.join("; ") || "Not recorded"}.
                  </small>
                </div>
                {f("commuting", "Commuting / access exposure")}
                {f("attendance", "Expected attendance")}
                {f("travelling", "Travelling teams")}
                {f("remote", "Remote-work capability")}
                {f(
                  "otherExposure",
                  "Other / geographic exposure",
                  undefined,
                  "textarea",
                  true,
                )}
              </>
            )}
            {step === 2 && (
              <>
                <p className="wide muted">
                  Likely pathways: {hazards[i.hazard].impacts}. Record current
                  evidence; unknown is distinct from no impact.
                </p>
                {impactKeys.map((k) => (
                  <Field
                    key={k}
                    label={k}
                    value={i.impacts[k] || "UNKNOWN"}
                    options={[
                      "UNKNOWN",
                      "NONE",
                      "POSSIBLE",
                      "LIKELY",
                      "MATERIAL",
                    ]}
                    onChange={(v) =>
                      update("impacts", {
                        ...i.impacts,
                        [k]: v as Input["impacts"][string],
                      })
                    }
                  />
                ))}
                {f(
                  "impactNotes",
                  "Impact evidence / dependencies",
                  undefined,
                  "textarea",
                  true,
                )}
                {f("propertyStatus", "Enterprise Property status", [
                  "UNKNOWN",
                  "AVAILABLE",
                  "RESTRICTED",
                  "CLOSED",
                  "NOT APPLICABLE",
                ])}
                <div className="wide">
                  <Check
                    label="Unsafe travel / access or protective action required"
                    checked={i.unsafe}
                    onChange={(v) => update("unsafe", v)}
                  />
                  <Check
                    label="Official advice directs avoidance, evacuation or protective action"
                    checked={i.protectiveAdvice}
                    onChange={(v) => update("protectiveAdvice", v)}
                  />
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <ol className="decision-test wide">
                  <li>
                    <strong>What is the authoritative advice?</strong>
                    <p>
                      {i.source || "Not recorded"} · {i.advice}:{" "}
                      {i.adviceDetails || "Not recorded"}
                    </p>
                  </li>
                  <li>
                    <strong>Who / what is exposed?</strong>
                    <p>
                      {i.geography || "Not recorded"} · {summary.centres}{" "}
                      centres · {i.workforce || "Workforce not recorded"}
                    </p>
                  </li>
                  <li>
                    <strong>When could impact occur?</strong>
                    <p>
                      {i.timing || "Not recorded"} · {i.rate}. Timing does not
                      override current conditions.
                    </p>
                  </li>
                  <li>
                    <strong>What could it reasonably disrupt?</strong>
                    <p>
                      {Object.entries(i.impacts)
                        .filter(([, v]) => v !== "NONE")
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </p>
                  </li>
                  <li>
                    <strong>What action is proportionate now?</strong>
                  </li>
                </ol>
                {f(
                  "proportionateAction",
                  "Proportionate action now",
                  undefined,
                  "textarea",
                  true,
                )}
                <fieldset className="wide">
                  <legend>
                    Hazard trigger conditions — select those evidenced
                  </legend>
                  {(["T1", "T2", "T3"] as const).map((t) => (
                    <Check
                      key={t}
                      label={`${t} — ${hazards[i.hazard][t]}`}
                      checked={i.conditions.includes(t)}
                      onChange={(v) =>
                        update(
                          "conditions",
                          v
                            ? [...i.conditions, t]
                            : i.conditions.filter((x) => x !== t),
                        )
                      }
                    />
                  ))}
                </fieldset>
                {f(
                  "conditionEvidence",
                  "Evidence supporting selected trigger prompts",
                  undefined,
                  "textarea",
                  true,
                )}
                <h3 className="wide">
                  6. Could a Critical Operation be affected?
                </h3>
                <p className="wide">
                  Consider a CPS 230 Critical Operation, its supporting
                  resources / dependencies, and ability to remain within an
                  applicable impact tolerance. YES or UNCERTAIN requires an
                  enterprise hand-off.
                </p>
                {f("critical", "Critical Operation concern", [
                  "UNCERTAIN",
                  "YES",
                  "NO",
                ])}
                {f("criticalOperation", "CPS 230 Critical Operation / unknown")}
                {f("criticalDependency", "Supporting resource / dependency")}
                {f("impactTolerance", "Applicable impact tolerance / unknown")}
                {f(
                  "criticalRationale",
                  "Critical Operations rationale and follow-up",
                  undefined,
                  "textarea",
                  true,
                )}
                <fieldset className="wide">
                  <legend>Other enterprise hand-offs</legend>
                  {[
                    "Property / site",
                    "Technology",
                    "Safety / Security",
                    "Incident / Crisis",
                    "Enterprise communications",
                  ].map((x) => (
                    <Check
                      key={x}
                      label={x}
                      checked={i.enterpriseNeeds.includes(x)}
                      onChange={(v) =>
                        update(
                          "enterpriseNeeds",
                          v
                            ? [...i.enterpriseNeeds, x]
                            : i.enterpriseNeeds.filter((a) => a !== x),
                        )
                      }
                    />
                  ))}
                </fieldset>
              </>
            )}
            {step === 4 && (
              <>
                <div className="wide authority">
                  <strong>Decision authority</strong>
                  <p>{authority}</p>
                  <p>{data.settings.authorityReference}</p>
                  <p>{safeguard}</p>
                </div>
                <div className="wide">
                  <Check
                    label="Primary decision-maker available"
                    checked={i.primaryAvailable}
                    onChange={(v) => update("primaryAvailable", v)}
                  />
                  <Check
                    label="Recording a broader protective attendance direction"
                    checked={i.broadDirection}
                    onChange={(v) => update("broadDirection", v)}
                  />
                </div>
                {f("authority", "Decision authority / role")}
                {f("authorityEvidence", "Authority / delegation evidence")}
                {i.broadDirection &&
                  f(
                    "directorApproval",
                    "BC Director approval evidence",
                    undefined,
                    "textarea",
                    true,
                  )}
                {f("phase", "Recovery stage", ["ASSESS", "RECOVER", "NORMAL"])}
                {i.phase !== "ASSESS" && (
                  <>
                    {recoveryKeys.map((k) => (
                      <Field
                        key={k}
                        label={k}
                        options={["UNKNOWN", "AFFECTED", "CLEAR"]}
                        value={i.recovery[k] || "UNKNOWN"}
                        onChange={(v) =>
                          update("recovery", {
                            ...i.recovery,
                            [k]: v as Input["recovery"][string],
                          })
                        }
                      />
                    ))}
                    {f(
                      "recoveryNotes",
                      "Recovery evidence, enterprise advice and lessons",
                      undefined,
                      "textarea",
                      true,
                    )}
                  </>
                )}
                <Field
                  label="Recorded human posture"
                  value={p}
                  onChange={(v) => setSelected(v as Posture)}
                  options={Object.entries(levels).map(([value, label]) => ({
                    value,
                    label: `${value} — ${label}`,
                  }))}
                />
                <Field
                  label="Decision-maker"
                  value={maker}
                  onChange={setMaker}
                />
                <Field
                  label={
                    p !== r.posture
                      ? "Override rationale (required)"
                      : "Decision rationale"
                  }
                  value={rationale}
                  onChange={setRationale}
                  type="textarea"
                  wide
                />
                {f(
                  "nextReview",
                  "Next review / update",
                  undefined,
                  "datetime-local",
                )}
                <p className="wide muted">
                  Assessment and decision timestamps are recorded on completion.
                  The selected human decision never changes the stored system
                  recommendation.
                </p>
              </>
            )}
          </div>
          {errors.length > 0 && (
            <div role="alert" className="error">
              <strong>Complete these items</strong>
              <ul>
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="toolbar">
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onSave(i);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save draft
            </button>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)}>Back</button>
            )}
            {step < 4 ? (
              <button className="primary" onClick={() => setStep(step + 1)}>
                Continue
              </button>
            ) : (
              <button className="primary" disabled={busy} onClick={finish}>
                Complete assessment
              </button>
            )}
          </div>
        </section>
        <aside className="panel recommendation">
          <p className="eyebrow">SYSTEM RECOMMENDATION</p>
          <div className={`posture ${r.posture}`}>
            {r.posture} — {levels[r.posture]}
          </div>
          <h3>Why</h3>
          <p>{r.why}</p>
          <ul>
            {r.evidence.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <h3>Actions</h3>
          <ul>
            {r.actions.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <h3>Escalation</h3>
          {r.escalation.length ? (
            r.escalation.map((x) => (
              <p key={x} className="attention">
                {x}
              </p>
            ))
          ) : (
            <p>No trigger recorded.</p>
          )}
          <details>
            <summary>Unresolved information ({r.unresolved.length})</summary>
            <ul>
              {r.unresolved.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </details>
          <h3>Communication</h3>
          <p>{r.communications.join(" ")}</p>
          <h3>Next review</h3>
          <p>{r.nextReview}</p>
        </aside>
      </div>
    </>
  );
}
