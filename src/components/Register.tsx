import { useState } from "react";
import {
  type Data,
  type Centre,
  emptyCentre,
  centreSchema,
} from "../domain/model";
import { audit, importCentres, centresCsv } from "../domain/records";
import { download } from "./Live";
import { Field } from "./Fields";
export function Register({
  data,
  mutate,
}: {
  data: Data;
  mutate: (fn: (d: Data) => void) => Promise<boolean>;
}) {
  const [c, set] = useState<Centre>(emptyCentre()),
    [editing, setEditing] = useState(false),
    [incoming, setIncoming] = useState<Centre[]>([]),
    [error, setError] = useState("");
  const labels: Record<keyof Centre, string> = {
    id: "Business Centre ID",
    name: "Name",
    location: "Address / location",
    state: "State / territory",
    region: "Region / catchment",
    coordinates: "Coordinates (if supplied)",
    status: "Centre status",
    people: "Approximate divisional people",
    attendance: "Normal attendance pattern",
    alternativeWork: "Alternative-work availability",
    hazards: "Relevant hazards",
    dependencies: "Dependencies",
    propertyReference: "Property reference",
    validation: "Validation status",
    validatedAt: "Validation date",
    confidence: "Confidence",
    notes: "Operational notes",
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">EXPOSURE REGISTER</p>
          <h1>Business Centres</h1>
          <p>
            {data.centres.length} records · operational locations require
            internal validation
          </p>
        </div>
        <button
          className="primary"
          onClick={() => {
            set(emptyCentre());
            setEditing(true);
          }}
        >
          Add centre
        </button>
      </div>
      <section className="panel">
        <div className="toolbar">
          <button
            onClick={() =>
              download(
                "business-centres.json",
                JSON.stringify(data.centres, null, 2),
              )
            }
          >
            Export JSON
          </button>
          <button
            onClick={() =>
              download(
                "business-centres.csv",
                centresCsv(data.centres),
                "text/csv",
              )
            }
          >
            Export CSV
          </button>
          <button
            onClick={() => {
              set({
                ...emptyCentre(),
                id: "DEMO-CENTRE-001",
                name: "DEMO — Example Business Centre",
                location: "Synthetic location",
                people: 120,
                validation: "DEMO",
                dependencies: "DEMO power / telecommunications",
                hazards: "DEMO storm / flood",
              });
              setEditing(true);
            }}
          >
            Prepare DEMO record
          </button>
          <label className="field">
            <span>Import register CSV / JSON</span>
            <input
              type="file"
              accept=".csv,.json"
              onChange={async (e) => {
                try {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  if (f.size > 5000000) throw Error("Register limit is 5 MB.");
                  setIncoming(importCentres(await f.text()));
                  setError("");
                } catch (x) {
                  setError(String(x));
                }
              }}
            />
          </label>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {incoming.length > 0 && (
          <div className="attention">
            <h3>Import preview</h3>
            <p>
              {incoming.length} valid records;{" "}
              {
                incoming.filter((c) => data.centres.some((x) => x.id === c.id))
                  .length
              }{" "}
              existing IDs will be kept unchanged.
            </p>
            <ul>
              {incoming.map((c) => (
                <li key={c.id}>
                  {c.id} — {c.name} · {c.validation}
                </li>
              ))}
            </ul>
            <button
              onClick={async () => {
                if (
                  await mutate((d) => {
                    for (const c of incoming)
                      if (!d.centres.some((x) => x.id === c.id))
                        d.centres.push(c);
                    audit(
                      d,
                      "REGISTER IMPORTED",
                      "",
                      `${incoming.length} records reviewed; existing IDs preserved.`,
                    );
                  })
                )
                  setIncoming([]);
              }}
            >
              Confirm import — keep existing IDs
            </button>
            <button onClick={() => setIncoming([])}>Cancel import</button>
          </div>
        )}
        <div className="table-wrap">
          <table>
            <caption>Business Centre & People Exposure Register</caption>
            <thead>
              <tr>
                <th>Name / ID</th>
                <th>Location</th>
                <th>People</th>
                <th>Validation</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {data.centres.map((c) => (
                <tr key={c.id}>
                  <th>
                    {c.name}
                    <small>{c.id}</small>
                  </th>
                  <td>
                    {c.location} · {c.state}
                  </td>
                  <td>{c.people ?? "Unknown"}</td>
                  <td>
                    {c.validation} · {c.validatedAt || "Undated"}
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        set(c);
                        setEditing(true);
                      }}
                    >
                      Edit {c.name}
                    </button>
                    <button
                      className="danger"
                      onClick={() => {
                        if (
                          prompt(
                            `Type DELETE ${c.id} to remove this register record. Historical snapshots are retained.`,
                          ) === `DELETE ${c.id}`
                        )
                          mutate((d) => {
                            if (
                              d.events.some((e) =>
                                e.draft?.centres.includes(c.id),
                              )
                            )
                              throw Error(
                                "A draft uses this centre. Update that draft before deletion.",
                              );
                            d.centres = d.centres.filter((x) => x.id !== c.id);
                            audit(d, "CENTRE DELETED", "", c.id);
                          });
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.centres.length && (
          <p className="empty">
            Your register is empty. Add validated internal records or use
            clearly marked demo data for exercises.
          </p>
        )}
      </section>
      {editing && (
        <section className="panel">
          <h2>Centre record</h2>
          <div className="fields">
            {(Object.keys(labels) as (keyof Centre)[]).map((k) => (
              <Field
                key={k}
                label={labels[k]}
                value={String(c[k] ?? "")}
                onChange={(v) =>
                  set({
                    ...c,
                    [k]: k === "people" ? (v === "" ? null : Number(v)) : v,
                  })
                }
                options={
                  k === "validation"
                    ? ["UNVALIDATED", "VALIDATED", "DEMO"]
                    : k === "confidence"
                      ? ["UNKNOWN", "LOW", "MEDIUM", "HIGH"]
                      : undefined
                }
                type={
                  k === "people"
                    ? "number"
                    : k === "validatedAt"
                      ? "date"
                      : k === "notes"
                        ? "textarea"
                        : "text"
                }
              />
            ))}
          </div>
          <div className="toolbar">
            <button
              className="primary"
              onClick={async () => {
                try {
                  centreSchema.parse(c);
                  if (c.validation === "VALIDATED" && !c.validatedAt)
                    throw Error("Validated records need a validation date.");
                  const existing = data.centres.find((x) => x.id === c.id);
                  if (
                    existing &&
                    !confirm(
                      "Replace the existing centre with this ID? Historical assessment snapshots remain unchanged.",
                    )
                  )
                    return;
                  if (
                    await mutate((d) => {
                      const idx = d.centres.findIndex((x) => x.id === c.id);
                      if (idx < 0) d.centres.push(c);
                      else d.centres[idx] = c;
                      audit(d, "CENTRE SAVED", "", c.id);
                    })
                  )
                    setEditing(false);
                } catch (e) {
                  setError(String(e));
                }
              }}
            >
              Save centre
            </button>
            <button onClick={() => setEditing(false)}>Cancel edit</button>
          </div>
        </section>
      )}
    </>
  );
}
