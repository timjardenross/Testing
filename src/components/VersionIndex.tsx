import { type Data } from "../domain/model";
import { hazards, levels } from "../config/pack";
export function VersionIndex({
  data,
  query,
  filter,
  hazard,
  from,
  status,
  open,
  resume,
  remove,
}: {
  data: Data;
  query: string;
  filter: string;
  hazard: string;
  from: string;
  status: string;
  open: (id: string, index: number) => void;
  resume: (id: string) => void;
  remove: (id: string) => void;
}) {
  const versions = data.events
    .flatMap((e) => e.versions.map((v, index) => ({ e, v, index })))
    .filter(
      ({ e, v }) =>
        `${e.id} ${v.input.title} ${v.input.geography}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (filter === "ALL" || v.decision.posture === filter) &&
        (hazard === "ALL" || v.input.hazard === hazard) &&
        (!from || v.at.slice(0, 10) >= from) &&
        (status === "ALL" || status === e.status),
    );
  const drafts = data.events.filter(
    (e) =>
      e.draft &&
      `${e.id} ${e.draft.title} ${e.draft.geography}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      filter === "ALL" &&
      (hazard === "ALL" || e.draft.hazard === hazard) &&
      (status === "ALL" || status === "DRAFT" || status === e.status),
  );
  return (
    <div className="table-wrap">
      <table>
        <caption>
          All saved assessment versions and drafts · {versions.length} versions
          match
        </caption>
        <thead>
          <tr>
            <th>Event / geography</th>
            <th>Version / time</th>
            <th>Hazard / posture</th>
            <th>Status</th>
            <th>Open / manage</th>
          </tr>
        </thead>
        <tbody>
          {versions.map(({ e, v, index }) => (
            <tr key={v.id}>
              <th>
                {v.input.title}
                <small>
                  {v.input.geography} · {e.id}
                </small>
              </th>
              <td>
                Version {v.number}
                <small>{new Date(v.at).toLocaleString()}</small>
              </td>
              <td>
                {hazards[v.input.hazard].name}
                <small>
                  {v.decision.posture} — {levels[v.decision.posture]}
                </small>
              </td>
              <td>{e.status}</td>
              <td>
                <button onClick={() => open(e.id, index)}>
                  View version {v.number}
                </button>
                <button className="danger" onClick={() => remove(e.id)}>
                  Delete whole event
                </button>
              </td>
            </tr>
          ))}
          {drafts.map((e) => (
            <tr key={e.id}>
              <th>
                {e.draft!.title || "Untitled draft"}
                <small>{e.draft!.geography}</small>
              </th>
              <td>Draft</td>
              <td>{hazards[e.draft!.hazard].name}</td>
              <td>DRAFT</td>
              <td>
                <button onClick={() => resume(e.id)}>Resume draft</button>
                <button className="danger" onClick={() => remove(e.id)}>
                  Delete whole event
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!versions.length && !drafts.length && (
        <p>No assessments match these filters.</p>
      )}
    </div>
  );
}
