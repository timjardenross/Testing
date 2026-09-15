import { useState } from "react";
import { type Data, readinessGates } from "../domain/model";
import { backup, parseBackup, mergeBackup, audit } from "../domain/records";
import { download } from "./Live";
import { Field } from "./Fields";
import { levels, definitions, hazards, rulesVersion } from "../config/pack";
export function Readiness({
  data,
  mutate,
}: {
  data: Data;
  mutate: (fn: (d: Data) => void) => Promise<boolean>;
}) {
  return (
    <>
      <p className="eyebrow">PREPAREDNESS</p>
      <h1>Readiness</h1>
      <p className="attention">
        Source plan v0.6 is DRAFT. Confirming these local checks does not
        approve the plan or certify operational activation.
      </p>
      <section className="panel">
        <h2>Readiness checks</h2>
        {readinessGates.map((k) => {
          const r = data.settings.readiness[k] || {
            status: "NOT CONFIRMED",
            evidence: "",
            date: "",
          };
          return (
            <form
              className="readiness-row"
              key={k}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                mutate((d) => {
                  d.settings.readiness[k] = {
                    status: f.get("status") as typeof r.status,
                    evidence: String(f.get("evidence")),
                    date: String(f.get("date")),
                  };
                  audit(d, "READINESS UPDATED", "", k);
                });
              }}
            >
              <h3>{k}</h3>
              <label>
                Status
                <select name="status" defaultValue={r.status}>
                  {["NOT CONFIRMED", "IN PROGRESS", "CONFIRMED"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                Evidence / owner
                <input name="evidence" defaultValue={r.evidence} />
              </label>
              <label>
                Validated / reviewed
                <input type="date" name="date" defaultValue={r.date} />
              </label>
              <button>Save {k}</button>
            </form>
          );
        })}
      </section>
    </>
  );
}
export function Settings({
  data,
  mutate,
}: {
  data: Data;
  mutate: (fn: (d: Data) => void) => Promise<boolean>;
}) {
  const [s, set] = useState(data.settings),
    [incoming, setIncoming] = useState<Data | null>(null),
    [mode, setMode] = useState<"KEEP" | "REPLACE">("KEEP"),
    [error, setError] = useState("");
  return (
    <>
      <p className="eyebrow">CONFIGURATION & DATA CARE</p>
      <h1>Configuration</h1>
      <section className="panel">
        <h2>Operating references</h2>
        <div className="fields">
          {(
            [
              "enterpriseReference",
              "authorityReference",
              "workforceChannel",
              "coreChannel",
              "classification",
            ] as const
          ).map((k) => (
            <Field
              key={k}
              label={
                {
                  enterpriseReference: "Enterprise escalation reference",
                  authorityReference: "Authority / contact register reference",
                  workforceChannel: "Workforce channel",
                  coreChannel: "Core decision channel",
                  classification: "Information classification / handling",
                }[k]
              }
              value={s[k]}
              onChange={(v) => set({ ...s, [k]: v })}
              type="textarea"
            />
          ))}
        </div>
        <button
          className="primary"
          onClick={() =>
            mutate((d) => {
              d.settings = {
                ...d.settings,
                ...s,
                readiness: d.settings.readiness,
              };
              audit(d, "CONFIGURATION UPDATED", "", rulesVersion);
            })
          }
        >
          Save configuration
        </button>
      </section>
      <section className="panel">
        <h2>Backup & restore</h2>
        <p>
          Records exist only in this browser profile and site origin. Export
          after material decisions and at shift handover. Store backups in an
          approved internal location.
        </p>
        <button
          onClick={() =>
            download(
              `climate-backup-${new Date().toISOString().slice(0, 10)}.json`,
              backup(data),
            )
          }
        >
          Export all data
        </button>
        <label className="field">
          <span>Import / restore backup</span>
          <input
            type="file"
            accept=".json"
            onChange={async (e) => {
              setIncoming(null);
              try {
                const f = e.target.files?.[0];
                if (!f) return;
                if (f.size > 20000000) throw Error("Backup exceeds 20 MB.");
                setIncoming(parseBackup(await f.text()));
                setError("");
              } catch (e) {
                setError(
                  "Import rejected; existing data unchanged. " + String(e),
                );
              }
            }}
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {incoming && (
          <div className="attention">
            <h3>Validated backup preview</h3>
            <p>
              {incoming.events.length} events ·{" "}
              {incoming.events.reduce((n, e) => n + e.versions.length, 0)}{" "}
              assessment versions · {incoming.centres.length} centres ·{" "}
              {incoming.audit.length} audit entries
            </p>
            <p>
              {
                incoming.events.filter((e) =>
                  data.events.some((x) => x.id === e.id),
                ).length
              }{" "}
              event ID conflicts;{" "}
              {
                incoming.centres.filter((c) =>
                  data.centres.some((x) => x.id === c.id),
                ).length
              }{" "}
              centre ID conflicts.
            </p>
            <Field
              label="Conflict handling"
              value={mode}
              onChange={(v) => setMode(v as typeof mode)}
              options={[
                {
                  value: "KEEP",
                  label: "Keep existing records and configuration",
                },
                {
                  value: "REPLACE",
                  label:
                    "Replace matching records and configuration from backup",
                },
              ]}
            />
            <p>
              Records absent from the backup are retained. Replacement can
              remove newer versions within matching events. A safety backup
              downloads before restore.
            </p>
            <button
              onClick={async () => {
                if (!confirm(`Confirm restore with ${mode} conflict handling?`))
                  return;
                download("before-restore-backup.json", backup(data));
                if (
                  await mutate((d) =>
                    Object.assign(d, mergeBackup(d, incoming, mode)),
                  )
                )
                  setIncoming(null);
              }}
            >
              Confirm restore
            </button>
            <button onClick={() => setIncoming(null)}>Cancel restore</button>
          </div>
        )}
      </section>
      <section className="panel">
        <h2>Assessment pack · {rulesVersion}</h2>
        <p>
          Operational Plan v0.6 DRAFT, Sections 6–12. Outlook v1.0 Approved is
          background intelligence, not an event warning. Change rules through
          reviewed source configuration, tests and tabletop validation.
        </p>
        {Object.entries(levels).map(([k, v]) => (
          <p key={k}>
            <strong>
              {k} — {v}
            </strong>
            : {definitions[k as keyof typeof definitions]}
          </p>
        ))}
        {Object.values(hazards).map((h) => (
          <details key={h.name}>
            <summary>{h.name}</summary>
            <p>T1: {h.T1}</p>
            <p>T2: {h.T2}</p>
            <p>T3: {h.T3}</p>
          </details>
        ))}
      </section>
    </>
  );
}
