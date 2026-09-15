import { type EventRecord, type Version } from "../domain/model";
import { hazards, levels } from "../config/pack";
function label(k: string) {
  return k
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}
function value(v: unknown): string {
  if (v === null || v === undefined || v === "")
    return "Not recorded / unknown";
  if (typeof v === "boolean") return v ? "YES" : "NO";
  if (Array.isArray(v))
    return v.length ? v.map(value).join("; ") : "None recorded";
  if (typeof v === "object")
    return Object.entries(v)
      .map(([k, x]) => `${label(k)}: ${value(x)}`)
      .join("; ");
  return String(v);
}
export function DecisionRecord({
  event: e,
  version: v,
}: {
  event: EventRecord;
  version: Version;
}) {
  return (
    <article className="print-record">
      <h2>Climate & Severe Weather decision record</h2>
      <p>
        Event {e.id} · Assessment {v.number} · {v.at}
      </p>
      <p>
        <strong>{v.input.title}</strong> · {hazards[v.input.hazard].name} ·{" "}
        {v.input.geography}
      </p>
      <p>
        Operational Plan v0.6 DRAFT · Rules {v.recommendation.rulesVersion}.
        Decision support; no enterprise residual-risk determination. Times
        include UTC offset where recorded.
      </p>
      <h3>System recommendation and human decision</h3>
      <p>
        <strong>
          Recommended: {v.recommendation.posture} —{" "}
          {levels[v.recommendation.posture]}
        </strong>
        <br />
        {v.recommendation.why}
      </p>
      <ul>
        {v.recommendation.evidence.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <p>
        <strong>
          Human: {v.decision.posture} — {levels[v.decision.posture]}
        </strong>
        <br />
        Decision-maker: {v.decision.maker} · Authority: {v.decision.authority} ·
        At: {v.decision.at}
        <br />
        Decision / override rationale:{" "}
        {v.decision.rationale ||
          "Recommendation accepted without additional rationale."}
      </p>
      <h3>Assessment evidence</h3>
      <dl className="record-fields">
        {Object.entries(v.input).map(([k, x]) => (
          <div key={k}>
            <dt>{label(k)}</dt>
            <dd>{value(x)}</dd>
          </div>
        ))}
      </dl>
      <h3>Business Centre snapshots</h3>
      {v.centres.length ? (
        v.centres.map((c) => <p key={c.id}>{value(c)}</p>)
      ) : (
        <p>
          No Business Centres selected. Refer to workforce / other exposure
          evidence above.
        </p>
      )}
      <h3>Recommended actions</h3>
      <ul>
        {v.recommendation.actions.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h3>Enterprise escalation</h3>
      <p>
        {v.recommendation.escalation.join("\n") ||
          "No system hand-off trigger recorded."}
      </p>
      <h3>Communication and next review</h3>
      <p>
        {v.recommendation.communications.join(" ")}
        <br />
        Assessed next review: {v.input.nextReview}
        <br />
        Current event review (may have changed later): {e.nextReview}
      </p>
      <h3>Unresolved information</h3>
      <ul>
        {v.recommendation.unresolved.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <h3>Operational statuses at this assessment</h3>
      <p>{value(v.operations)}</p>
      <h3>Related action, communication and escalation records</h3>
      <p>
        Records below are related to this version; action statuses reflect their
        current state at export. The assessment-time statuses above are frozen.
      </p>
      {[...e.actions, ...e.communications, ...e.escalations]
        .filter((x) => x.version === v.id)
        .map((x) => (
          <p key={x.id}>{value(x)}</p>
        ))}
      <h3>Event recovery / closure</h3>
      <p>
        Current event status: {e.status}.{" "}
        {e.closure ? value(e.closure) : "No current closure."}
      </p>
    </article>
  );
}
