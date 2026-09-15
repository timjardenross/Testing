import { DecisionRecord } from "./DecisionRecord";
import { useState } from "react";
import {
  type EventRecord,
  type Data,
  uid,
  now,
  type Version,
} from "../domain/model";
import {
  changes,
  audit,
  closeEvent,
  reopen,
  decisionRecord,
  csv,
} from "../domain/records";
import { exposureSummary } from "../domain/engine";
import {
  draftCommunication,
  communicationTypes,
} from "../domain/communications";
import { levels, hazards, authority, safeguard } from "../config/pack";
import { Field } from "./Fields";
export function download(
  name: string,
  body: string,
  type = "application/json",
) {
  const u = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
export function Live({
  event: e,
  data,
  mutate,
  reassess,
  initialVersion,
}: {
  event: EventRecord;
  data: Data;
  mutate: (fn: (d: Data) => void) => Promise<boolean>;
  reassess: () => void;
  initialVersion?: number;
}) {
  const [tab, setTab] = useState(
      initialVersion === undefined ? "Decision card" : "History & records",
    ),
    [idx, setIdx] = useState(initialVersion ?? e.versions.length - 1),
    [action, setAction] = useState(""),
    [owner, setOwner] = useState(""),
    [due, setDue] = useState(""),
    [notes, setNotes] = useState(""),
    [type, setType] = useState(communicationTypes[0]),
    [body, setBody] = useState(""),
    [audience, setAudience] = useState(""),
    [channel, setChannel] = useState(data.settings.workforceChannel),
    [by, setBy] = useState(""),
    [path, setPath] = useState(""),
    [esStatus, setEsStatus] = useState<
      "INITIATED" | "ACKNOWLEDGED" | "RESOLVED"
    >("INITIATED"),
    [review, setReview] = useState(e.nextReview),
    [closure, setClosure] = useState(""),
    [message, setMessage] = useState("");
  const v = e.versions[idx] || e.versions.at(-1);
  if (!v)
    return (
      <section className="panel">
        <h1>Draft event</h1>
        <button onClick={reassess}>Resume draft</button>
      </section>
    );
  const latest = e.versions.at(-1)!,
    summary = exposureSummary(latest.input, latest.centres),
    historical = v.id !== latest.id;
  const eventMutate = (fn: (e: EventRecord, d: Data) => void) =>
    mutate((d) =>
      fn(
        d.events.find((x) => x.id === e.id)!,
        d,
      ),
    );
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied.");
    } catch {
      setMessage(
        "Clipboard unavailable. Select and copy the visible text or export it.",
      );
    }
  }
  const record = JSON.stringify(decisionRecord(e, v), null, 2);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            LIVE EVENT · {e.status} · {e.id}
          </p>
          <h1>{latest.input.title}</h1>
          <p>
            {hazards[latest.input.hazard].name} · {latest.input.geography}
          </p>
        </div>
        <div className={`posture ${latest.decision.posture}`}>
          {latest.decision.posture} — {levels[latest.decision.posture]}
        </div>
      </div>
      <div className="stats">
        <div>
          <small>Human decision</small>
          <strong>{latest.decision.maker}</strong>
          <span>{latest.input.authority}</span>
        </div>
        <div>
          <small>Last assessed</small>
          <strong>{new Date(latest.at).toLocaleString()}</strong>
          <span>Version {latest.number}</span>
        </div>
        <div>
          <small>Next review</small>
          <strong>
            {e.nextReview ? new Date(e.nextReview).toLocaleString() : "Not set"}
          </strong>
          <span>
            {Date.parse(e.nextReview) < Date.now() && e.status === "OPEN"
              ? "REVIEW OVERDUE"
              : "Operator scheduled"}
          </span>
        </div>
        <div>
          <small>Exposure</small>
          <strong>
            {summary.centres} centres · {summary.people ?? "Unknown"} people
          </strong>
          <span>
            {latest.centres.map((c) => c.name).join(", ") ||
              "Workforce / other exposure"}
          </span>
        </div>
      </div>
      <div className="live-status no-print">
        <strong>
          {latest.input.critical !== "NO"
            ? "ENTERPRISE ESCALATION REQUIRED"
            : "Critical Operations: no concern recorded"}
        </strong>
        <span>
          {e.communications.filter((c) => c.version === latest.id).length}{" "}
          communications issued for current assessment
        </span>
        <span>
          {
            e.actions.filter((a) => ["OPEN", "IN PROGRESS"].includes(a.status))
              .length
          }{" "}
          open / in-progress actions
        </span>
      </div>
      <div className="toolbar no-print">
        {e.status === "OPEN" ? (
          <button className="primary" onClick={reassess}>
            {e.draft ? "Resume draft" : "Reassess"}
          </button>
        ) : (
          <button onClick={() => mutate((d) => reopen(d, e.id))}>
            Reopen event
          </button>
        )}
        <button onClick={() => setTab("Actions")}>Record action</button>
        <button
          onClick={() => {
            setTab("Communications");
            setBody(draftCommunication(type, latest, e.nextReview));
          }}
        >
          Record communication
        </button>
        <button onClick={() => setTab("Escalation")}>Record escalation</button>
        <button onClick={() => setTab("Recovery & review")}>
          Set next review / close
        </button>
        <button
          onClick={() => download(`decision-${e.id}-v${v.number}.json`, record)}
        >
          Export decision record
        </button>
      </div>
      <nav className="tabs no-print" aria-label="Event views">
        {[
          "Decision card",
          "Actions",
          "Communications",
          "Escalation",
          "History & records",
          "Recovery & review",
        ].map((t) => (
          <button
            key={t}
            aria-current={tab === t ? "page" : undefined}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>
      {message && <p role="status">{message}</p>}
      {tab === "Decision card" && (
        <div className="live-grid">
          <section className="panel">
            <h2>Live Event Decision Card</h2>
            <dl className="card-list">
              <dt>01 · Event</dt>
              <dd>
                {latest.input.advice}: {latest.input.adviceDetails}
                <br />
                {latest.input.source} · {latest.input.reference}
                <br />
                {latest.input.timing} · {latest.input.rate}
              </dd>
              <dt>02 · Exposure</dt>
              <dd>
                {latest.input.workforce || "Not recorded"} ·{" "}
                {latest.input.commuting || "Commuting not recorded"}
                <br />
                Property: {latest.input.propertyStatus} · Remote work:{" "}
                {latest.input.remote || "Unknown"}
              </dd>
              <dt>03 · T-level</dt>
              <dd>
                System: {latest.recommendation.posture} —{" "}
                {latest.recommendation.why}
                <br />
                <strong>
                  Human: {latest.decision.posture} —{" "}
                  {latest.decision.rationale || "Recommendation accepted"}
                </strong>
              </dd>
              <dt>04 · Action</dt>
              <dd>
                {latest.input.proportionateAction}
                <br />
                {
                  e.actions.filter((a) =>
                    ["OPEN", "IN PROGRESS"].includes(a.status),
                  ).length
                }{" "}
                current actions
              </dd>
              <dt>05 · Authority</dt>
              <dd>
                {authority}
                <br />
                {latest.input.authorityEvidence}
                <p>{safeguard}</p>
                {!latest.input.primaryAvailable && (
                  <strong>
                    Primary unavailable — continue the escalation chain.
                  </strong>
                )}
              </dd>
              <dt>06 · Enterprise</dt>
              <dd>
                <strong>
                  {latest.input.critical !== "NO"
                    ? "ENTERPRISE ESCALATION REQUIRED"
                    : "Critical Operations: NO recorded"}
                </strong>
                <p>{data.settings.enterpriseReference}</p>
                {latest.recommendation.escalation.map((x) => (
                  <p key={x}>{x}</p>
                ))}
                <strong>
                  {e.escalations.filter((s) => s.version === latest.id).at(-1)
                    ?.status || "No escalation recorded for this assessment"}
                </strong>
              </dd>
              <dt>07 · Communicate</dt>
              <dd>
                {e.communications.filter((c) => c.version === latest.id).length}{" "}
                communications recorded for this assessment. Workforce:{" "}
                {data.settings.workforceChannel}; core:{" "}
                {data.settings.coreChannel}.
              </dd>
              <dt>08 · Next review</dt>
              <dd>{e.nextReview || "Not set"}</dd>
              <dt>09 · Recovery</dt>
              <dd>
                {latest.input.phase};{" "}
                {latest.input.recoveryNotes ||
                  "Recovery checks required before normal attendance."}
              </dd>
            </dl>
          </section>
          <aside>
            <section className="panel">
              <h2>Do now</h2>
              {latest.recommendation.actions.map((a) => (
                <div className="suggestion" key={a}>
                  <p>{a}</p>
                  <button
                    disabled={e.status === "CLOSED"}
                    onClick={() => {
                      setAction(a);
                      setTab("Actions");
                    }}
                  >
                    Add to actions
                  </button>
                </div>
              ))}
            </section>
            <section className="panel">
              <h2>Unresolved information</h2>
              <ul>
                {latest.recommendation.unresolved.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      )}
      {tab === "Actions" && (
        <section className="panel">
          <h2>Actions</h2>
          <div className="fields">
            <Field
              label="Action"
              value={action}
              onChange={setAction}
              type="textarea"
              wide
            />
            <Field label="Action owner" value={owner} onChange={setOwner} />
            <Field
              label="Due time"
              value={due}
              onChange={setDue}
              type="datetime-local"
            />
            <Field
              label="Action notes"
              value={notes}
              onChange={setNotes}
              type="textarea"
            />
          </div>
          <button
            className="primary"
            disabled={e.status === "CLOSED"}
            onClick={async () => {
              if (!action.trim() || !owner.trim()) {
                setMessage("Action and owner are required.");
                return;
              }
              if (
                await eventMutate((ev, d) => {
                  ev.actions.push({
                    id: uid(),
                    text: action,
                    owner,
                    created: now(),
                    due,
                    status: "OPEN",
                    completed: null,
                    notes,
                    version: latest.id,
                  });
                  audit(d, "ACTION CREATED", e.id, action);
                })
              )
                setAction("");
            }}
          >
            Save action
          </button>
          <div className="table-wrap">
            <table>
              <caption>Event action log</caption>
              <thead>
                <tr>
                  <th>Action / notes</th>
                  <th>Owner / due</th>
                  <th>Status</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {e.actions.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.text}
                      <small>{a.notes}</small>
                    </td>
                    <td>
                      {a.owner}
                      <small>{a.due || "Not set"}</small>
                    </td>
                    <td>
                      <select
                        aria-label={`Status: ${a.text}`}
                        value={a.status}
                        disabled={e.status === "CLOSED"}
                        onChange={(ev) =>
                          eventMutate((ee, d) => {
                            const aa = ee.actions.find((x) => x.id === a.id)!;
                            aa.status = ev.target.value as typeof a.status;
                            aa.completed =
                              aa.status === "COMPLETE" ? now() : null;
                            audit(
                              d,
                              aa.status === "COMPLETE"
                                ? "ACTION COMPLETED"
                                : "ACTION UPDATED",
                              e.id,
                              `${aa.id}: ${aa.status}`,
                            );
                          })
                        }
                      >
                        {["OPEN", "IN PROGRESS", "COMPLETE", "CANCELLED"].map(
                          (x) => (
                            <option key={x}>{x}</option>
                          ),
                        )}
                      </select>
                    </td>
                    <td>{a.completed || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {tab === "Communications" && (
        <section className="panel">
          <h2>Communication drafting & issue log</h2>
          <p>
            Review and send through approved channels yourself. Mark issued only
            after sending.
          </p>
          <div className="fields">
            <Field
              label="Communication type"
              options={communicationTypes}
              value={type}
              onChange={setType}
            />
            <button
              onClick={() => {
                if (!body || confirm("Replace the current draft text?"))
                  setBody(draftCommunication(type, latest, e.nextReview));
              }}
            >
              Generate draft
            </button>
            <Field label="Audience" value={audience} onChange={setAudience} />
            <Field label="Channel" value={channel} onChange={setChannel} />
            <Field label="Issued by" value={by} onChange={setBy} />
            <Field
              label="Final communication text"
              value={body}
              onChange={setBody}
              type="textarea"
              wide
            />
          </div>
          <div className="toolbar">
            <button onClick={() => copy(body)}>Copy draft</button>
            <button
              onClick={() => download("communication.txt", body, "text/plain")}
            >
              Export text
            </button>
            <button
              className="primary"
              disabled={e.status === "CLOSED"}
              onClick={async () => {
                if (
                  !audience.trim() ||
                  !channel.trim() ||
                  !by.trim() ||
                  !body.trim()
                ) {
                  setMessage(
                    "Audience, channel, issuer and final text are required.",
                  );
                  return;
                }
                const saved = await eventMutate((ee, d) => {
                  ee.communications.push({
                    id: uid(),
                    type,
                    audience,
                    channel,
                    at: now(),
                    by,
                    text: body,
                    version: latest.id,
                  });
                  audit(
                    d,
                    "COMMUNICATION RECORDED",
                    e.id,
                    `${type}: ${audience}`,
                  );
                });
                if (saved) setMessage("Communication marked issued.");
              }}
            >
              Mark issued
            </button>
          </div>
          {e.communications.map((c) => (
            <details key={c.id}>
              <summary>
                {c.type} · {c.audience} · {c.channel} ·{" "}
                {new Date(c.at).toLocaleString()} · {c.by}
              </summary>
              <pre>{c.text}</pre>
            </details>
          ))}
        </section>
      )}
      {tab === "Escalation" && (
        <section className="panel">
          <h2>Enterprise / authority escalation</h2>
          <p className="attention">
            {latest.input.critical !== "NO"
              ? "ENTERPRISE ESCALATION REQUIRED"
              : "No Critical Operations hand-off trigger recorded."}
          </p>
          <p>{data.settings.enterpriseReference}</p>
          <p>{safeguard}</p>
          <div className="fields">
            <Field label="Escalation recorded by" value={by} onChange={setBy} />
            <Field
              label="Pathway / recipient role used"
              value={path}
              onChange={setPath}
            />
            <Field
              label="Escalation status"
              options={["INITIATED", "ACKNOWLEDGED", "RESOLVED"]}
              value={esStatus}
              onChange={(v) => setEsStatus(v as typeof esStatus)}
            />
            <Field
              label="Escalation evidence / notes"
              value={notes}
              onChange={setNotes}
              type="textarea"
              wide
            />
          </div>
          <button
            disabled={e.status === "CLOSED"}
            onClick={async () => {
              if (!by.trim() || !path.trim()) {
                setMessage("Recorder and actual pathway used are required.");
                return;
              }
              await eventMutate((ee, d) => {
                ee.escalations.push({
                  id: uid(),
                  at: now(),
                  by,
                  path,
                  status: esStatus,
                  notes,
                  version: latest.id,
                });
                audit(d, "ESCALATION RECORDED", e.id, `${path}: ${esStatus}`);
              });
            }}
          >
            Save escalation record
          </button>
          {e.escalations.map((s) => (
            <p key={s.id}>
              {s.at} · {s.status} · {s.path} · {s.by} — {s.notes}
            </p>
          ))}
        </section>
      )}
      {tab === "History & records" && (
        <section className="panel history-record">
          <h2>Assessment history & decision record</h2>
          <Field
            label="Assessment version"
            value={String(idx)}
            options={e.versions.map((x, n) => ({
              value: String(n),
              label: `Version ${x.number} · ${new Date(x.at).toLocaleString()} · ${x.decision.posture}`,
            }))}
            onChange={(x) => setIdx(Number(x))}
          />
          <p>
            {historical
              ? "HISTORICAL RECORD — immutable assessment snapshot"
              : "LATEST ASSESSMENT"}
          </p>
          <p>
            Previous human posture:{" "}
            {e.versions[idx - 1]?.decision.posture || "None"} · Recommendation:{" "}
            {v.recommendation.posture} · Human decision: {v.decision.posture}
          </p>
          <h3>What changed?</h3>
          <div className="table-wrap">
            <table>
              <caption>Compared with preceding assessment</caption>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Previous</th>
                  <th>Current</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {changes(e.versions[idx - 1], v).map((c, n) => (
                  <tr key={n}>
                    <th>{c.field}</th>
                    <td>{c.before}</td>
                    <td>{c.after}</td>
                    <td>{c.kind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="toolbar no-print">
            <button onClick={() => window.print()}>Print / save as PDF</button>
            <button
              onClick={() =>
                copy(
                  draftCommunication(
                    "EVENT STATUS SUMMARY",
                    v,
                    v.input.nextReview,
                  ),
                )
              }
            >
              Copy summary
            </button>
            <button onClick={() => copy(record)}>Copy complete record</button>
            <button
              onClick={() =>
                download(`decision-${e.id}-v${v.number}.json`, record)
              }
            >
              Export JSON
            </button>
            <button
              onClick={() =>
                download(
                  "assessments.csv",
                  csv([
                    [
                      "event",
                      "version",
                      "timestamp",
                      "recommendation",
                      "human",
                      "decision maker",
                      "rationale",
                    ],
                    ...e.versions.map((v) => [
                      e.id,
                      String(v.number),
                      v.at,
                      v.recommendation.posture,
                      v.decision.posture,
                      v.decision.maker,
                      v.decision.rationale,
                    ]),
                  ]),
                  "text/csv",
                )
              }
            >
              Export assessment CSV
            </button>
          </div>
          <DecisionRecord event={e} version={v} />
          <details className="no-print">
            <summary>Machine-readable JSON</summary>
            <pre className="record">{record}</pre>
          </details>
          <h3>Event audit history</h3>
          {data.audit
            .filter((a) => a.event === e.id)
            .map((a) => (
              <p key={a.id}>
                {a.at} · {a.type} · {a.detail}
              </p>
            ))}
        </section>
      )}
      {tab === "Recovery & review" && (
        <section className="panel">
          <h2>Recovery & next review</h2>
          <div className="fields">
            <Field
              label="Next event review"
              value={review}
              onChange={setReview}
              type="datetime-local"
            />
            <button
              disabled={e.status === "CLOSED"}
              onClick={() =>
                eventMutate((ee, d) => {
                  if (!review || !Number.isFinite(Date.parse(review)))
                    throw Error("Set a valid review time.");
                  ee.nextReview = review;
                  audit(d, "NEXT REVIEW SET", e.id, review);
                })
              }
            >
              Save next review
            </button>
          </div>
          <p>
            Warning expiry does not mean normal attendance. Reassess with
            RECOVER to continue T4, or NORMAL after checks are clear to return
            to T0.
          </p>
          <button disabled={e.status === "CLOSED"} onClick={reassess}>
            Start recovery reassessment
          </button>
          <dl>
            {Object.entries(latest.input.recovery).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p>{latest.input.recoveryNotes}</p>
          <div className="fields">
            <Field label="Closure decision-maker" value={by} onChange={setBy} />
            <Field
              label="Closure rationale / residual hand-off"
              value={closure}
              onChange={setClosure}
              type="textarea"
              wide
            />
          </div>
          <button
            className="danger"
            disabled={e.status === "CLOSED"}
            onClick={() => {
              if (
                confirm(
                  "Close this event? History is preserved and the event can be reopened.",
                )
              )
                mutate((d) => closeEvent(d, e.id, by, closure));
            }}
          >
            Close event
          </button>
          {e.closure && (
            <p>
              Closed {e.closure.at} by {e.closure.by}: {e.closure.rationale}
            </p>
          )}
        </section>
      )}
    </>
  );
}
