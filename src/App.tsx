import { VersionIndex } from "./components/VersionIndex";
import { useEffect, useState, useRef } from "react";
import { type Data, type Input, emptyInput, uid } from "./domain/model";
import { BrowserRepository } from "./persistence/repository";
import { saveDraft, complete, audit, backup } from "./domain/records";
import { levels, hazards } from "./config/pack";
import { exposureSummary } from "./domain/engine";
import { Assessment } from "./components/Assessment";
import { Live, download } from "./components/Live";
import { Register } from "./components/Register";
import { Readiness, Settings } from "./components/Settings";
import { Field } from "./components/Fields";
const repository = new BrowserRepository();
export default function App() {
  const [data, setData] = useState<Data | null>(null),
    [page, setPage] = useState("Current events"),
    [eventId, setEventId] = useState(""),
    [historyIndex, setHistoryIndex] = useState<number | undefined>(undefined),
    [draft, setDraft] = useState<Input | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("ALL"),
    [hazard, setHazard] = useState("ALL"),
    [from, setFrom] = useState(""),
    [status, setStatus] = useState("ALL");
  const lock = useRef(false);
  useEffect(() => {
    repository
      .load()
      .then(setData)
      .catch((e) =>
        setError(
          "Browser storage unavailable or invalid. No records were reset. " +
            String(e),
        ),
      );
  }, []);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (page === "Assessment") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [page]);
  async function mutate(fn: (d: Data) => void) {
    if (!data) return false;
    if (lock.current) {
      setError(
        "A save is in progress. Wait for confirmation, then retry this action.",
      );
      return false;
    }
    lock.current = true;
    setNotice("Saving — keep this page open.");
    try {
      const next = structuredClone(data);
      fn(next);
      const saved = await repository.commit(next, data.revision);
      setData(saved);
      setError("");
      setNotice("Saved in this browser.");
      return true;
    } catch (e) {
      setNotice("");
      setError(String(e));
      return false;
    } finally {
      lock.current = false;
    }
  }
  function navigate(p: string) {
    if (lock.current) {
      setError("Wait for the current save to finish before navigating.");
      return;
    }
    if (
      page === "Assessment" &&
      !confirm(
        "Leave assessment? Save or export your draft first. Unsaved changes will be lost.",
      )
    )
      return;
    setPage(p);
    setNotice("");
    setError("");
  }
  function begin(id?: string) {
    const e = data?.events.find((e) => e.id === id);
    if (e?.status === "CLOSED") {
      setError("Reopen the event before reassessment.");
      return;
    }
    setHistoryIndex(undefined);
    setEventId(id || uid());
    setDraft(
      structuredClone(e?.draft || e?.versions.at(-1)?.input || emptyInput()),
    );
    setPage("Assessment");
  }
  if (!data)
    return (
      <main>
        <h1>Climate & Severe Weather Assessment</h1>
        {error ? (
          <div role="alert" className="error">
            {error}
            <p>
              Keep this profile intact. Try another supported browser for new
              work and contact your internal support team for recovery. Do not
              clear site data.
            </p>
          </div>
        ) : (
          <p>Opening local records…</p>
        )}
      </main>
    );
  const e = data.events.find((x) => x.id === eventId);
  const readiness = Object.values(data.settings.readiness).filter(
    (x) => x.status !== "CONFIRMED",
  ).length;
  const list = data.events.filter((e) => {
    const v = e.versions.at(-1),
      i = e.draft || v?.input;
    return (
      (page === "Assessments" || e.status === "OPEN") &&
      `${e.id} ${i?.title} ${i?.geography}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (filter === "ALL" || v?.decision.posture === filter) &&
      (hazard === "ALL" || i?.hazard === hazard) &&
      (status === "ALL" ||
        (status === "DRAFT" ? !!e.draft : e.status === status)) &&
      (!from || (v?.at || e.created).slice(0, 10) >= from)
    );
  });
  return (
    <>
      <a className="skip" href="#main">
        Skip to main content
      </a>
      <header className="topbar">
        <div className="brand">
          <span className="brandmark">CR</span>
          <div>
            Climate & Severe Weather
            <small>OPERATIONAL RESILIENCE · LOCAL WORKSPACE</small>
          </div>
        </div>
        <span className="local-tag">Browser-local · no shared sync</span>
      </header>
      <div className="shell">
        <nav className="sidebar no-print" aria-label="Main navigation">
          {[
            "Current events",
            "Assessments",
            "Business Centres",
            "Readiness",
            "Configuration",
          ].map((p, n) => (
            <button
              key={p}
              aria-current={page === p ? "page" : undefined}
              onClick={() => navigate(p)}
            >
              <span>{String(n + 1).padStart(2, "0")}</span>
              {p}
            </button>
          ))}
          <div className="sidebar-note">
            <strong>Plan v0.6 · DRAFT</strong>
            <p>
              Decision support for an informed practitioner. Enterprise
              authorities remain in force.
            </p>
            <small>{readiness} readiness checks unconfirmed</small>
          </div>
        </nav>
        <main id="main">
          <div className="source-banner no-print">
            <strong>Draft operating model</strong>
            <span>
              Confirm activation gates and approved authority before operational
              use.
            </span>
            <button onClick={() => navigate("Readiness")}>
              Review readiness
            </button>
          </div>
          {error && (
            <div role="alert" className="error">
              <strong>Not saved / action not completed</strong>
              <p>{error}</p>
              <button
                onClick={() =>
                  download("recovery-current-memory.json", backup(data))
                }
              >
                Export loaded data
              </button>
            </div>
          )}
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
          {(page === "Current events" || page === "Assessments") && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">OPERATIONS WORKSPACE</p>
                  <h1>{page}</h1>
                  <p>
                    {page === "Current events"
                      ? "Monitor exposure. Record decisions. Keep the next review visible."
                      : "Find events, resume drafts and review preserved decisions."}
                  </p>
                </div>
                <button className="primary" onClick={() => begin()}>
                  New assessment
                </button>
              </div>
              <div className="stats">
                <div>
                  <small>Open events</small>
                  <strong>
                    {data.events.filter((e) => e.status === "OPEN").length}
                  </strong>
                </div>
                <div>
                  <small>Review overdue</small>
                  <strong>
                    {
                      data.events.filter(
                        (e) =>
                          e.status === "OPEN" &&
                          Date.parse(e.nextReview) < Date.now(),
                      ).length
                    }
                  </strong>
                </div>
                <div>
                  <small>Critical Operations hand-offs</small>
                  <strong>
                    {
                      data.events.filter(
                        (e) =>
                          e.status === "OPEN" &&
                          e.versions.at(-1) &&
                          e.versions.at(-1)!.input.critical !== "NO",
                      ).length
                    }
                  </strong>
                </div>
                <div>
                  <small>Saved assessments</small>
                  <strong>
                    {data.events.reduce((n, e) => n + e.versions.length, 0)}
                  </strong>
                </div>
              </div>
              <section className="panel">
                <div className="filters">
                  <Field
                    label="Search event / geography / ID"
                    value={query}
                    onChange={setQuery}
                  />
                  <Field
                    label="Posture filter"
                    value={filter}
                    onChange={setFilter}
                    options={["ALL", ...Object.keys(levels)]}
                  />
                  <Field
                    label="Hazard filter"
                    value={hazard}
                    onChange={setHazard}
                    options={[
                      { value: "ALL", label: "All hazards" },
                      ...Object.entries(hazards).map(([value, h]) => ({
                        value,
                        label: h.name,
                      })),
                    ]}
                  />
                  {page === "Assessments" && (
                    <>
                      <Field
                        label="Assessed from"
                        value={from}
                        onChange={setFrom}
                        type="date"
                      />
                      <Field
                        label="Status filter"
                        value={status}
                        onChange={setStatus}
                        options={["ALL", "OPEN", "CLOSED", "DRAFT"]}
                      />
                    </>
                  )}
                </div>
                {page === "Assessments" ? (
                  <VersionIndex
                    data={data}
                    query={query}
                    filter={filter}
                    hazard={hazard}
                    from={from}
                    status={status}
                    resume={begin}
                    open={(id, index) => {
                      setEventId(id);
                      setHistoryIndex(index);
                      setPage("Live");
                    }}
                    remove={(id) => {
                      if (
                        prompt(
                          `Type DELETE ${id} to delete the whole event and all its assessment versions.`,
                        ) === `DELETE ${id}`
                      ) {
                        download("before-delete-backup.json", backup(data));
                        mutate((d) => {
                          d.events = d.events.filter((e) => e.id !== id);
                          audit(
                            d,
                            "EVENT DELETED",
                            id,
                            "Explicit confirmation; safety backup offered.",
                          );
                        });
                      }
                    }}
                  />
                ) : list.length ? (
                  <div className="table-wrap">
                    <table>
                      <caption>
                        {page === "Current events"
                          ? "Active operational events"
                          : "Assessment events and drafts"}
                      </caption>
                      <thead>
                        <tr>
                          <th>Event / geography</th>
                          <th>Posture</th>
                          <th>Last assessment / next review</th>
                          <th>Exposure</th>
                          <th>Escalation</th>
                          <th>Open</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((e) => {
                          const v = e.versions.at(-1),
                            i = e.draft || v?.input,
                            summary = v
                              ? exposureSummary(v.input, v.centres)
                              : null;
                          return (
                            <tr key={e.id}>
                              <th>
                                {i?.title || "Untitled draft"}
                                <small>
                                  {i?.geography || "Geography not recorded"} ·{" "}
                                  {i && hazards[i.hazard].name}
                                </small>
                              </th>
                              <td>
                                {v ? (
                                  <span
                                    className={`pill ${v.decision.posture}`}
                                  >
                                    {v.decision.posture} —{" "}
                                    {levels[v.decision.posture]}
                                  </span>
                                ) : (
                                  "DRAFT"
                                )}
                                {e.draft && <small>Draft in progress</small>}
                              </td>
                              <td>
                                {v
                                  ? new Date(v.at).toLocaleString()
                                  : "Not completed"}
                                <small>
                                  Next:{" "}
                                  {e.nextReview
                                    ? new Date(e.nextReview).toLocaleString()
                                    : "Not set"}
                                </small>
                              </td>
                              <td>
                                {summary
                                  ? `${summary.centres} centres · ${summary.people ?? "Unknown"} people`
                                  : "Not assessed"}
                              </td>
                              <td>
                                {v?.input.critical !== "NO" && v
                                  ? "REQUIRED"
                                  : "No trigger recorded"}
                                <small>
                                  {e.escalations
                                    .filter((s) => s.version === v?.id)
                                    .at(-1)?.status || "Not recorded"}
                                </small>
                              </td>
                              <td>
                                <button
                                  onClick={() => {
                                    setEventId(e.id);
                                    setHistoryIndex(undefined);
                                    setPage("Live");
                                  }}
                                >
                                  Open event
                                </button>
                                {e.draft && (
                                  <button onClick={() => begin(e.id)}>
                                    Resume draft
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty">
                    <h2>
                      {data.events.length
                        ? "No matching events"
                        : "Ready for your first assessment"}
                    </h2>
                    <p>
                      Start with authoritative advice and identify the people,
                      commuting areas and centres exposed.
                    </p>
                    <button onClick={() => begin()}>Create assessment</button>
                  </div>
                )}
              </section>
            </>
          )}
          {page === "Assessment" && draft && (
            <Assessment
              key={eventId}
              initial={draft}
              data={data}
              eventId={eventId}
              onSave={async (i) => {
                if (await mutate((d) => saveDraft(d, eventId, i))) setDraft(i);
              }}
              onComplete={async (i, p, maker, rationale) => {
                if (
                  await mutate((d) =>
                    complete(d, eventId, i, p, maker, rationale),
                  )
                )
                  setPage("Live");
              }}
              onExport={(i) => {
                const copy = structuredClone(data);
                saveDraft(copy, eventId, i);
                download("unsaved-draft-backup.json", backup(copy));
              }}
            />
          )}
          {page === "Live" && e && (
            <Live
              key={`${e.id}-${e.versions.length}-${historyIndex}`}
              initialVersion={historyIndex}
              event={e}
              data={data}
              mutate={mutate}
              reassess={() => begin(e.id)}
            />
          )}
          {page === "Business Centres" && (
            <Register data={data} mutate={mutate} />
          )}
          {page === "Readiness" && <Readiness data={data} mutate={mutate} />}
          {page === "Configuration" && <Settings data={data} mutate={mutate} />}
          <footer>
            Operational Plan v0.6 DRAFT · Outlook v1.0 Approved · No enterprise
            residual-risk determination.
            <br />
            {data.settings.classification}
          </footer>
        </main>
      </div>
    </>
  );
}
