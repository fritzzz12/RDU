import React, { useState, useEffect, useId } from "react";
import { createRoot } from "react-dom/client";
import {
  LayoutDashboard,
  FolderKanban,
  Files,
  ClipboardCheck,
  Archive,
  Users,
  ChartNoAxesCombined,
  Newspaper,
  Sparkles,
  ShieldCheck,
  Settings,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  ChevronRight,
  Check,
  Clock,
  Download,
  Upload,
  FileText,
  LogOut,
  Menu,
  X,
  Activity,
  AlertCircle,
  CheckCircle2,
  Building2,
  ArrowRight,
} from "lucide-react";
import "./styles.css";
import { buildReport, reportNames } from "../shared/reporting.js";
import {
  pageLabels,
  statusLabel,
  phaseDescriptions,
  phaseLabel,
  friendlyError,
  RecordTable,
  SafeForm,
  ModalFrame,
  ConfirmForms,
  WorkspaceErrorBoundary,
} from "./ui.jsx";

async function api(path, method = "GET", body) {
  const r = await fetch("/api" + path, {
    method,
    headers:
      body instanceof FormData
        ? {}
        : body
          ? { "Content-Type": "application/json" }
          : {},
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const v = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(v.error || "Request failed");
  }
  return r.status === 204 ? null : r.json();
}
const initials = (n) =>
  n
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("") || "RD";
const date = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
const time = (d) =>
  d
    ? new Date(d).toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
const cls = (s) => s?.toLowerCase().replaceAll(" ", "-") || "missing";
function Badge({ children }) {
  return (
    <span
      className={
        "badge " + (typeof children === "string" ? cls(children) : "count")
      }
    >
      {typeof children === "string" ? statusLabel(children) : children}
    </span>
  );
}
function Empty({
  title = "Nothing here yet",
  text = "Items will appear here as research progresses.",
}) {
  return (
    <div className="empty">
      <FolderKanban size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Field({ label, children, hint }) {
  const generatedId = useId();
  const id = children.props.id || generatedId;
  return (
    <div className="field">
      <label htmlFor={id} id={id + "-label"}>
        {label}{" "}
        <span className="field-indicator" aria-hidden="true">
          (
          {children.props.required || children.type === "select"
            ? "Required"
            : "Optional"}
          )
        </span>
      </label>
      {React.cloneElement(children, {
        id,
        "aria-labelledby": id + "-label",
        "aria-describedby": hint ? id + "-hint" : undefined,
      })}
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </div>
  );
}
function Progress({ project, checklist }) {
  const items = checklist.flatMap((p) => p.groups.flatMap((g) => g.items));
  let done = items.filter((i) =>
    ["Approved", "Not Applicable"].includes(
      project.requirements?.[i.id]?.status,
    ),
  ).length;
  return (
    <div className="progress-line">
      <div className="progress">
        <i style={{ width: Math.round((done / items.length) * 100) + "%" }} />
      </div>
      <span>{Math.round((done / items.length) * 100)}%</span>
    </div>
  );
}
const navGroups = [
  {
    items: [
      ["Overview", LayoutDashboard],
      ["Pending actions", ClipboardCheck],
      ["Notifications", Bell],
    ],
  },
  {
    title: "Research",
    items: [
      ["Research projects", FolderKanban],
      ["Document submissions", Files],
      ["Review & approvals", ShieldCheck],
      ["Research archive", Archive],
      ["Faculty profiles", Users],
    ],
  },
  {
    title: "Reports and updates",
    items: [
      ["Reports & analytics", ChartNoAxesCombined],
      ["News & announcements", Newspaper],
      ["Research assistant", Sparkles],
    ],
  },
  {
    title: "Administration",
    admin: true,
    items: [
      ["User management", Users],
      ["Roles & permissions", ShieldCheck],
      ["Audit history", Activity],
      ["System settings", Settings],
    ],
  },
];
function ProjectFields({ data, user }) {
  const [dept, setDept] = useState(user.department || data.departments[0]);
  const researcher = user.role === "Researcher";
  return (
    <>
      <fieldset className="form-section">
        <legend>Project category and department</legend>
        <p className="group-note">
          Choose the research type, year, and academic program for this study.
        </p>
        <div className="form-grid">
          <Field label="Research project type">
            <select name="type" required>
              {data.types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Academic year">
            <input
              name="year"
              type="number"
              min="2000"
              max="2100"
              defaultValue={2026}
              required
            />
          </Field>
          <Field label="College department">
            <select
              name="department"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              required
            >
              {data.departments
                .filter(
                  (d) =>
                    !["Researcher", "Department Head"].includes(user.role) ||
                    d === user.department,
                )
                .map((d) => (
                  <option key={d}>{d}</option>
                ))}
            </select>
          </Field>
          <Field label="Academic program">
            <select name="program" key={dept} required>
              {data.programs
                .filter((p) => p.department === dept)
                .map((p) => (
                  <option key={p.id}>{p.name}</option>
                ))}
            </select>
          </Field>
        </div>
        {!researcher && (
          <Field
            label="Research owner"
            hint="Choose the faculty member responsible for this study."
          >
            <select name="ownerId" key={dept} required>
              {data.users
                .filter(
                  (u) =>
                    u.role === "Researcher" &&
                    u.status === "Active" &&
                    u.department === dept,
                )
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                    {data.projects.some(
                      (p) => p.ownerId === u.id && p.status === "Ongoing",
                    )
                      ? " — ongoing study"
                      : ""}
                  </option>
                ))}
            </select>
          </Field>
        )}
      </fieldset>
    </>
  );
}
function App() {
  const [session, setSession] = useState(null),
    [starting, setStarting] = useState(true),
    [data, setData] = useState(null),
    [page, setPage] = useState("Overview"),
    [projectId, setProjectId] = useState(null),
    [tab, setTab] = useState("Checklist"),
    [phase, setPhase] = useState(null),
    [q, setQ] = useState(""),
    [type, setType] = useState(""),
    [department, setDepartment] = useState(""),
    [year, setYear] = useState(""),
    [status, setStatus] = useState(""),
    [modal, setModal] = useState(null),
    [reviewDecision, setReviewDecision] = useState("Approved"),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [busy, setBusy] = useState(false),
    [refreshFailed, setRefreshFailed] = useState(false),
    [mobile, setMobile] = useState(false),
    [smallScreen, setSmallScreen] = useState(
      () => window.matchMedia("(max-width:1000px)").matches,
    ),
    [report, setReport] = useState("Research Inventory"),
    [answer, setAnswer] = useState(""),
    [question, setQuestion] = useState("");
  useEffect(() => {
    api("/session")
      .then((s) => {
        setSession(s);
        if (s.user) return load();
      })
      .catch((e) => setError(friendlyError(e.message)))
      .finally(() => setStarting(false));
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    const mq = window.matchMedia("(max-width:1000px)");
    const update = () => setSmallScreen(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!mobile) return;
    document.querySelector(".sidebar button")?.focus();
    const escape = (e) => {
      if (e.key === "Escape") closeNav();
      if (e.key === "Tab") {
        const nav = document.querySelector(".sidebar");
        const buttons = Array.from(
          nav?.querySelectorAll("button") || [],
        ).filter((b) => !b.disabled);
        const first = buttons[0],
          last = buttons.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [mobile]);
  useEffect(() => {
    if (!smallScreen) setMobile(false);
  }, [smallScreen]);
  useEffect(() => {
    setError("");
    setReviewDecision("Approved");
  }, [modal?.kind, modal?.record?.id, modal?.item?.id]);
  useEffect(() => {
    if (!data || modal || mobile) return;
    document.querySelector("main h1")?.focus();
  }, [page, projectId]);
  function closeNav(restoreFocus = true) {
    setMobile(false);
    if (restoreFocus)
      requestAnimationFrame(() =>
        document.querySelector(".mobile-menu")?.focus(),
      );
  }
  async function load() {
    const d = await api("/bootstrap");
    setData(d);
    return d;
  }
  async function run(fn, message) {
    setBusy(true);
    setError("");
    try {
      await fn();
      try {
        await load();
        setRefreshFailed(false);
      } catch {
        setRefreshFailed(true);
      }
      if (message) setToast(message);
      return true;
    } catch (e) {
      setError(friendlyError(e.message));
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function login(id) {
    setBusy(true);
    setError("");
    try {
      const s = await api("/session", "POST", { userId: id });
      setSession({ ...session, ...s });
      await load();
      setPage("Overview");
      setProjectId(null);
      setQ("");
      setType("");
      setDepartment("");
      setYear("");
      setStatus("");
      setAnswer("");
      setQuestion("");
      setModal(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function go(p) {
    setPage(p);
    setProjectId(null);
    closeNav(false);
    setQ("");
    setStatus("");
  }
  function openProject(id) {
    setProjectId(id);
    setTab("Checklist");
    setPhase(null);
    closeNav(false);
  }
  const user = data?.user,
    isAdmin = user?.role === "Super Admin",
    isHead = user?.role === "Department Head",
    isResearcher = user?.role === "Researcher",
    isPublisher = isAdmin || user?.role === "Research Director";
  const projects = data?.projects || [],
    checklist = data?.checklist || [],
    notifications = data?.notifications || [],
    pendingDocs = (data?.documents || []).filter(
      (d) => d.status === "Pending Review",
    ),
    revisionDocs = (data?.documents || []).filter((d) =>
      ["Needs Revision", "Rejected"].includes(d.status),
    );
  const filtered = projects.filter(
    (p) =>
      (!q ||
        [p.title, p.id, data.users?.find((u) => u.id === p.ownerId)?.name]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())) &&
      (!type || p.type === type) &&
      (!department || p.department === department) &&
      (!year || String(p.year) === year) &&
      (!status || p.status === status),
  );
  const project = projects.find((p) => p.id === projectId),
    unread = notifications.filter((n) => !n.read).length;
  const itemsFor = (p) => checklist[p]?.groups.flatMap((g) => g.items) || [];
  const ready = (p) =>
    itemsFor(p.phase).every((i) =>
      ["Approved", "Not Applicable"].includes(p.requirements?.[i.id]?.status),
    );
  const years = [...new Set(projects.map((p) => String(p.year)))]
    .sort()
    .reverse();
  function filterBar({ search = true } = {}) {
    return (
      <div className="filters">
        {search && (
          <label className="filter-field">
            <span>Find a research project</span>
            <div className="search">
              <Search size={18} />
              <input
                aria-label="Search research"
                placeholder="Title, project number or researcher"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </label>
        )}
        <label className="filter-field">
          <span>Academic year</span>
          <select
            aria-label="Academic year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">All academic years</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          <span>College department</span>
          <select
            aria-label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All departments</option>
            {data.departments.map((d) => (
              <option key={typeof d === "string" ? d : d.name}>
                {typeof d === "string" ? d : d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          <span>Research type</span>
          <select
            aria-label="Research type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All research types</option>
            {data.types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        {(q || type || department || year || status) && (
          <button
            className="text-button"
            onClick={() => {
              setQ("");
              setType("");
              setDepartment("");
              setYear("");
              setStatus("");
            }}
          >
            Show all projects
          </button>
        )}
        <p className="filters-help">
          Leave these choices unchanged to see every project you can access.
        </p>
      </div>
    );
  }
  function header(title, desc, actions) {
    return (
      <div className="page-heading">
        <div>
          <h1 className="page-title-focus" tabIndex={-1}>
            {pageLabels[title] || title}
          </h1>
          <p>{desc}</p>
        </div>
        <div className="heading-actions">{actions}</div>
      </div>
    );
  }
  function projectTable(list = filtered, compact = false) {
    return list.length ? (
      <div className="table-wrap">
        <RecordTable label="Research projects" className="projects-table">
          <thead>
            <tr>
              <th>Research project</th>
              {!compact && <th>Researcher / Department</th>}
              <th>Current stage</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>
                  <button
                    className="project-link"
                    onClick={() => openProject(p.id)}
                  >
                    {p.title}
                  </button>
                  <div className="cell-sub">
                    <span
                      className={"type-dot type-" + data.types.indexOf(p.type)}
                    />
                    {p.type}
                    <span className="muted"> · Project number: {p.id}</span>
                  </div>
                </td>
                {!compact && (
                  <td>
                    <div>
                      {data.users.find((u) => u.id === p.ownerId)?.name ||
                        "Faculty researcher"}
                    </div>
                    <div className="cell-sub">{p.department}</div>
                  </td>
                )}
                <td>
                  <span className="phase-label">
                    <span className="phase-num">{p.phase + 1}</span>
                    {checklist[p.phase]?.name
                      .replace(/^(I+\.|IV\.)\s*/, "")
                      .replace(" PHASE", "")
                      .replace("Phase", "")
                      .toLowerCase()}
                  </span>
                </td>
                <td>
                  <Progress project={p} checklist={checklist} />
                </td>
                <td>
                  <Badge>{p.status}</Badge>
                </td>
                <td>
                  <button
                    className="button small secondary"
                    aria-label={"View project: " + p.title}
                    onClick={() => openProject(p.id)}
                  >
                    View project <ChevronRight size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </RecordTable>
      </div>
    ) : (
      <Empty
        title="No matching research"
        text="Try clearing filters or submit a new project."
      />
    );
  }
  function exportCsv() {
    const params = new URLSearchParams({
      q,
      type,
      department,
      year,
      status,
      report: page === "Reports & analytics" ? report : "Research Inventory",
    });
    window.location.href = "/api/reports.csv?" + params;
    setToast(
      "Your spreadsheet download has been requested using the choices shown on this page.",
    );
  }
  function renderOverview() {
    const active = filtered.filter((p) => p.status === "Ongoing"),
      completed = filtered.filter((p) => p.status === "Completed"),
      scopedIds = new Set(filtered.map((p) => p.id)),
      reviews = pendingDocs.filter((d) => scopedIds.has(d.projectId));
    const byDept = data.departments
      .map((d) => {
        const name = typeof d === "string" ? d : d.name;
        return {
          name,
          n: filtered.filter((p) => p.department === name).length,
        };
      })
      .filter((d) => d.n);
    return (
      <>
        {header(
          "Overview",
          isResearcher
            ? "Your studies, requirements, and next steps in one place."
            : "A clear view of research, from proposal to impact.",
          <>
            <button className="button secondary" onClick={exportCsv}>
              <Download size={16} />
              Export report
            </button>
            <button
              className="button"
              onClick={() =>
                isResearcher
                  ? setModal({ kind: "project" })
                  : go("Research projects")
              }
            >
              {isResearcher ? <Plus size={16} /> : <FolderKanban size={16} />}{" "}
              {isResearcher
                ? "Add a research project"
                : "View research projects"}
            </button>
          </>,
        )}
        {filterBar({ search: false })}
        <div className="metrics">
          {[
            [
              "Total research",
              filtered.length,
              "Projects you can access",
              FolderKanban,
            ],
            [
              "In progress",
              active.length,
              "Studies that are not yet complete",
              Activity,
            ],
            [
              "Completed",
              completed.length,
              "Research with all stages approved",
              CheckCircle2,
            ],
            [
              "Awaiting review",
              reviews.length,
              "Documents requiring attention",
              Clock,
            ],
          ].map(([label, n, sub, Icon], i) => (
            <button
              className="metric"
              key={label}
              onClick={() => {
                if (i === 3) go("Review & approvals");
                else {
                  go("Research projects");
                  setStatus(i === 1 ? "Ongoing" : i === 2 ? "Completed" : "");
                }
              }}
            >
              <div className="metric-label">
                {label}
                <Icon size={18} />
              </div>
              <strong>{n}</strong>
              <span>{sub}</span>
            </button>
          ))}
        </div>
        <div className="overview-grid">
          <section className="panel focus-panel">
            <div className="section-heading">
              <h2>Research in focus</h2>
              <button
                className="text-button"
                onClick={() => go("Research projects")}
              >
                View all <ArrowRight size={14} />
              </button>
            </div>
            {filtered
              .filter((p) => p.status === "Ongoing")
              .slice(0, 4)
              .map((p) => (
                <button
                  className="focus-project"
                  key={p.id}
                  onClick={() => openProject(p.id)}
                >
                  <div className="focus-top">
                    <span
                      className={
                        "project-symbol type-bg-" + data.types.indexOf(p.type)
                      }
                    >
                      <FileText size={19} />
                    </span>
                    <span className="focus-copy">
                      <b>{p.title}</b>
                      <span>
                        {p.type} · {p.department.replace("College of ", "")}
                      </span>
                    </span>
                    <ChevronRight size={17} />
                  </div>
                  <div className="mini-timeline">
                    {checklist.map((phase, i) => (
                      <span
                        key={phase.id}
                        className={i <= p.phase ? "reached" : ""}
                      >
                        <i />
                        {phase.name
                          .replace(/^(I+\.|IV\.)\s*/, "")
                          .replace(" PHASE", "")
                          .toLowerCase()}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            {!active.length && <Empty title="No ongoing research" />}
          </section>
          <section className="panel">
            <div className="section-heading">
              <h2>Research by department</h2>
              <Building2 size={17} className="muted" />
            </div>
            <p className="panel-description">
              Select a department to see its research projects
            </p>
            <div className="department-chart">
              {byDept.map(({ name, n }) => (
                <button
                  key={name}
                  onClick={() => {
                    setDepartment(name);
                    setPage("Research projects");
                  }}
                  title={name}
                >
                  <span>
                    {name
                      .replace("College of ", "")
                      .replace(
                        "Public Administration and Governance",
                        "Public Admin.",
                      )}
                  </span>
                  <div className="bar-track">
                    <i
                      style={{
                        width:
                          (n / Math.max(...byDept.map((d) => d.n), 1)) * 100 +
                          "%",
                      }}
                    />
                  </div>
                  <b>{n}</b>
                </button>
              ))}
            </div>
            <div className="chart-note">
              <span className="legend-square" />
              Research projects · {filtered.length} total
            </div>
          </section>
          <section className="panel">
            <div className="section-heading">
              <h2>What needs attention</h2>
              <button
                className="text-button"
                onClick={() => go("Pending actions")}
              >
                View things to do <ArrowRight size={14} />
              </button>
            </div>
            {[
              [
                pendingDocs.length,
                "Documents awaiting evaluation",
                "Review & approvals",
                "amber",
              ],
              [
                revisionDocs.length,
                "Documents returned for correction",
                "Document submissions",
                "red",
              ],
              [
                projects.filter((p) => p.status === "Ongoing" && ready(p))
                  .length,
                "Projects ready for the next stage",
                "Pending actions",
                "teal",
              ],
              ...(isAdmin
                ? [
                    [
                      data.users.filter((u) => u.status === "Pending").length,
                      "Accounts awaiting approval",
                      "User management",
                      "blue",
                    ],
                  ]
                : []),
            ].map(([n, label, p, color]) => (
              <button
                className="attention-row"
                key={label}
                onClick={() => go(p)}
              >
                <span className={"attention-number " + color}>{n}</span>
                <span>{label}</span>
                <ChevronRight size={15} />
              </button>
            ))}
          </section>
          <section className="panel">
            <div className="section-heading">
              <h2>From the research unit</h2>
              <button
                className="text-button"
                onClick={() => go("News & announcements")}
              >
                All updates <ArrowRight size={14} />
              </button>
            </div>
            {data.announcements
              .filter((a) => a.status === "Published")
              .slice(0, 2)
              .map((a) => (
                <button
                  className="announcement-preview"
                  key={a.id}
                  onClick={() =>
                    setModal({ kind: "announcement-view", record: a })
                  }
                >
                  <span className="small-caps">{a.category}</span>
                  <h3>{a.title}</h3>
                  <span className="muted">
                    {date(a.createdAt)} <ArrowUpRight size={13} />
                  </span>
                </button>
              ))}
          </section>
        </div>
        <div className="data-caption">
          <span className="live-dot" />
          These numbers use the records you can access{" "}
          <span>Example data · {projects.length} projects you can access</span>
        </div>
      </>
    );
  }
  function projectPage() {
    return (
      <>
        {header(
          "Research projects",
          "Find a study, check its progress, or open its list of required documents.",
          <button
            className="button"
            onClick={() => setModal({ kind: "project" })}
          >
            <Plus size={16} />
            Add a research project
          </button>,
        )}
        {filterBar()}
        <div className="tabs">
          <button
            className={!status ? "selected" : ""}
            aria-pressed={!status}
            onClick={() => setStatus("")}
          >
            All projects <span>{projects.length}</span>
          </button>
          {["Ongoing", "Completed", "Archived"].map((s) => (
            <button
              key={s}
              className={status === s ? "selected" : ""}
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
            >
              {statusLabel(s)}
              <span>{projects.filter((p) => p.status === s).length}</span>
            </button>
          ))}
        </div>
        <section className="panel table-panel">{projectTable()}</section>
        <div className="data-caption">
          {filtered.length} projects shown{" "}
          <span>All five categories supported in submissions and reports</span>
        </div>
      </>
    );
  }
  function projectDetail() {
    const current = phase ?? project.phase,
      phaseObj = checklist[current],
      docs = data.documents.filter((d) => d.projectId === project.id);
    return (
      <>
        <button className="back-link" onClick={() => setProjectId(null)}>
          Back to {(pageLabels[page] || page).toLowerCase()}
        </button>
        {header(
          project.title,
          <>
            {project.id} · {project.department} · {project.year}
          </>,
          <Badge>{project.status}</Badge>,
        )}
        <div className="project-meta">
          <span>
            <span
              className={"type-dot type-" + data.types.indexOf(project.type)}
            />
            {project.type}
          </span>
          <span>
            <Users size={15} />
            {data.users.find((u) => u.id === project.ownerId)?.name}
          </span>
          <span>
            <FileText size={15} />
            {docs.length} document versions
          </span>
        </div>
        {project.type.includes("Personally") && (
          <div className="notice">
            <AlertCircle size={18} />
            <span>
              <b>This checklist is temporary for personally funded research.</b>{" "}
              It uses the standard requirements until the Research and
              Development Unit supplies the official separate checklist.
            </span>
          </div>
        )}
        <div className="lifecycle">
          {checklist.map((p, i) => (
            <button
              key={p.id}
              aria-pressed={current === i}
              onClick={() => setPhase(i)}
              className={
                (current === i ? "active " : "") +
                (i < project.phase || project.status !== "Ongoing"
                  ? "complete"
                  : "")
              }
            >
              <span className="stage-marker">
                {i < project.phase || project.status !== "Ongoing" ? (
                  <Check size={18} />
                ) : (
                  i + 1
                )}
              </span>
              <span>
                <small>
                  {i < project.phase || project.status !== "Ongoing"
                    ? "Completed"
                    : i === project.phase
                      ? "Current stage"
                      : "Not started yet"}
                </small>
                <b>{phaseLabel(p.name)}</b>
                <span className="phase-description">
                  {phaseDescriptions[i]}
                </span>
              </span>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
        <div className="tabs">
          {["Checklist", "Documents", "Activity", "Overview"].map((t) => (
            <button
              key={t}
              className={t === tab ? "selected" : ""}
              aria-pressed={t === tab}
              onClick={() => setTab(t)}
            >
              {t === "Checklist"
                ? "Required documents"
                : t === "Activity"
                  ? "Project history"
                  : t === "Overview"
                    ? "Project details"
                    : t}
              {t === "Documents" && <span>{docs.length}</span>}
            </button>
          ))}
        </div>
        {tab === "Checklist" && (
          <>
            <div className="section-heading checklist-heading">
              <div>
                <h2>{phaseObj?.name}</h2>
                <p className="muted">
                  Upload each required PDF, then wait for your Department Head
                  to review it. A submitted document is not yet approved.
                </p>
              </div>
              <div>
                <Badge>
                  {
                    itemsFor(current).filter((i) =>
                      ["Approved", "Not Applicable"].includes(
                        project.requirements?.[i.id]?.status,
                      ),
                    ).length
                  }{" "}
                  / {itemsFor(current).length} complete
                </Badge>
              </div>
            </div>
            {current !== project.phase && (
              <div className="notice">
                {current > project.phase
                  ? "You can view this stage, but cannot submit documents yet. First complete the current stage and get your Department Head’s approval."
                  : "This stage is complete. You can still view its documents and decisions, but cannot change them."}
              </div>
            )}
            {phaseObj?.groups.map((g) => (
              <section className="panel checklist-group" key={g.id}>
                <div className="group-heading">
                  <h3>{g.name}</h3>
                  <span>{g.items.length} requirements</span>
                </div>
                {g.items.map((item) => {
                  const req = project.requirements?.[item.id] || {
                      status: "Missing",
                    },
                    latest = docs
                      .filter((d) => d.requirementId === item.id)
                      .sort((a, b) => b.version - a.version)[0];
                  return (
                    <div className="requirement" key={item.id}>
                      <span
                        className={
                          "requirement-icon " +
                          (["Approved", "Not Applicable"].includes(req.status)
                            ? "checked"
                            : "")
                        }
                      >
                        {["Approved", "Not Applicable"].includes(req.status) ? (
                          <Check size={15} />
                        ) : (
                          <FileText size={16} />
                        )}
                      </span>
                      <div className="requirement-copy">
                        <b>{item.label}</b>
                        {item.conditional && req.status === "Missing" && (
                          <small className="status-help">
                            If this does not apply to your study, ask your
                            Department Head to mark it as not needed.
                          </small>
                        )}
                        {req.feedback && (
                          <small className="feedback">
                            Feedback: {req.feedback}
                          </small>
                        )}
                        {latest && (
                          <small>
                            {latest.name} · Version {latest.version} ·{" "}
                            {date(latest.createdAt)}
                            {latest.staffUpload ? " · Staff upload" : ""}
                          </small>
                        )}
                      </div>
                      <Badge>{req.status}</Badge>
                      <div className="requirement-actions">
                        {latest && (
                          <button
                            className="button small secondary"
                            title="View document"
                            aria-label={"View " + item.label}
                            onClick={() =>
                              setModal({ kind: "document", record: latest })
                            }
                          >
                            <Search size={16} />
                            View document
                          </button>
                        )}
                        {current === project.phase &&
                          project.status === "Ongoing" && (
                            <>
                              {(isHead || project.ownerId === user.id) &&
                                !["Approved", "Not Applicable"].includes(
                                  req.status,
                                ) && (
                                  <button
                                    className="button small secondary"
                                    onClick={() =>
                                      setModal({
                                        kind: "upload",
                                        submissionKey: crypto.randomUUID(),
                                        item,
                                        project,
                                      })
                                    }
                                  >
                                    <Upload size={14} />
                                    {latest
                                      ? "Upload a new version"
                                      : "Upload document"}
                                  </button>
                                )}
                              {isHead &&
                                latest?.status === "Pending Review" && (
                                  <button
                                    className="button small"
                                    onClick={() =>
                                      setModal({
                                        kind: "document",
                                        record: latest,
                                      })
                                    }
                                  >
                                    Review document
                                  </button>
                                )}
                              {isHead &&
                                item.conditional &&
                                req.status !== "Approved" && (
                                  <button
                                    className="text-button small"
                                    onClick={() =>
                                      setModal({
                                        kind: "applicability",
                                        applicable:
                                          req.status === "Not Applicable",
                                        item,
                                        project,
                                      })
                                    }
                                  >
                                    {req.status === "Not Applicable"
                                      ? "Require this document"
                                      : "Mark as not needed"}
                                  </button>
                                )}
                            </>
                          )}
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}
            <section className="advance-panel">
              <div>
                <h3>
                  {project.status !== "Ongoing"
                    ? "This research is complete"
                    : ready(project)
                      ? "Ready for the next step"
                      : "What needs to happen before continuing"}
                </h3>
                <p>
                  {project.status !== "Ongoing"
                    ? "The research stages are complete. You can still view the documents and saved decisions."
                    : ready(project)
                      ? "All required documents for the current stage have been approved or marked as not needed. A Department Head can now confirm the next step."
                      : "Check the current stage for documents that have not been submitted, need changes, or are waiting for review. Your Department Head must approve all required documents before the research can continue."}
                </p>
              </div>
              {isHead && project.status === "Ongoing" && (
                <button
                  className="button"
                  disabled={!ready(project) || current !== project.phase}
                  onClick={() => setModal({ kind: "advance", project })}
                >
                  {project.phase === 2
                    ? "Complete research"
                    : "Approve the next stage"}
                  <ArrowRight size={16} />
                </button>
              )}
            </section>
            <section className="monitoring-note">
              <Activity size={22} />
              <div>
                <h3>IV. MONITORING AND EVALUATION</h3>
                <p>
                  <b>A. Monitoring</b> — Monitoring covers the whole process of
                  the research project.
                </p>
                <p>
                  <b>B. Evaluation</b> — Evaluation is conducted at key stages
                  of the research process, particularly during
                  conceptualization, dissemination and publication.
                </p>
                <button
                  className="text-button"
                  onClick={() => setTab("Activity")}
                >
                  View monitoring and decision history <ArrowRight size={14} />
                </button>
              </div>
            </section>
          </>
        )}
        {tab === "Documents" && documentTable(docs)}
        {tab === "Activity" &&
          auditList(
            data.audit.filter((a) => String(a.entity).includes(project.id)),
          )}
        {tab === "Overview" && (
          <section className="panel prose">
            <h2>Research summary</h2>
            <p>{project.abstract}</p>
            <dl>
              <dt>Project type</dt>
              <dd>{project.type}</dd>
              <dt>Academic program</dt>
              <dd>{project.program || "Not specified"}</dd>
              <dt>Created</dt>
              <dd>{date(project.createdAt)}</dd>
              <dt>Progress</dt>
              <dd>
                <Progress project={project} checklist={checklist} />
              </dd>
            </dl>
            {project.status === "Completed" && !isResearcher && (
              <button
                className="button secondary"
                onClick={() => setModal({ kind: "archive", project })}
              >
                <Archive size={16} />
                Archive completed research
              </button>
            )}
          </section>
        )}
      </>
    );
  }
  function documentTable(docs) {
    return (
      <section className="panel table-panel">
        {docs.length ? (
          <div className="table-wrap">
            <RecordTable
              label="Submitted documents"
              className="documents-table"
            >
              <thead>
                <tr>
                  <th>Document and version</th>
                  <th>Research project</th>
                  <th>Submitted by</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <b className="file-name">
                        <FileText size={17} />
                        {d.name}
                      </b>
                      <div className="cell-sub">
                        Version {d.version} · {date(d.createdAt)}
                        {d.synthetic ? " · Example PDF" : ""}
                      </div>
                    </td>
                    <td>
                      <button
                        className="project-link"
                        onClick={() => openProject(d.projectId)}
                      >
                        {projects.find((p) => p.id === d.projectId)?.title}
                      </button>
                    </td>
                    <td>
                      {d.uploaderName}
                      <div className="cell-sub">
                        {d.staffUpload
                          ? "Uploaded by a staff member"
                          : "Uploaded by the researcher"}
                      </div>
                    </td>
                    <td>
                      <Badge>{d.status}</Badge>
                    </td>
                    <td>
                      <button
                        className="button small secondary"
                        onClick={() =>
                          setModal({ kind: "document", record: d })
                        }
                      >
                        {isHead && d.status === "Pending Review"
                          ? "Review PDF"
                          : "View PDF"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </RecordTable>
          </div>
        ) : (
          <Empty
            title="No documents match"
            text="Upload PDF requirements from a project's checklist."
          />
        )}
      </section>
    );
  }
  function auditList(entries) {
    return (
      <section className="panel">
        {entries.length ? (
          <div className="activity-list">
            {entries.map((a) => (
              <div className="activity-item" key={a.id}>
                <span className="activity-point" />
                <div>
                  <b>{a.action}</b>
                  <p>
                    {a.actor} · {a.entity}
                  </p>
                  {a.reason && <p>{a.reason}</p>}
                </div>
                <time>
                  {date(a.createdAt)}
                  <br />
                  {time(a.createdAt)}
                </time>
              </div>
            ))}
          </div>
        ) : (
          <Empty title="No activity in this view" />
        )}
      </section>
    );
  }
  function actionsPage() {
    const readyProjects = projects.filter(
      (p) => p.status === "Ongoing" && ready(p),
    );
    return (
      <>
        {header(
          "Pending actions",
          "Actionable tasks, separate from informative notifications.",
        )}
        <div className="action-sections">
          <section className="panel">
            <h2>
              {isResearcher
                ? "Documents to correct"
                : "Documents awaiting review"}
            </h2>
            {(isResearcher ? revisionDocs : pendingDocs).length ? (
              (isResearcher ? revisionDocs : pendingDocs).map((d) => (
                <div className="action-item" key={d.id}>
                  <span className="attention-number amber">
                    <FileText size={18} />
                  </span>
                  <div>
                    <b>{d.name}</b>
                    <p>{projects.find((p) => p.id === d.projectId)?.title}</p>
                    {d.feedback && <p className="feedback">{d.feedback}</p>}
                  </div>
                  <button
                    className="button small secondary"
                    onClick={() =>
                      isHead
                        ? setModal({ kind: "document", record: d })
                        : openProject(d.projectId)
                    }
                  >
                    {isHead ? "Review" : "Open project"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))
            ) : (
              <Empty
                title="You're all caught up"
                text="No document tasks require your attention."
              />
            )}
          </section>
          <section className="panel">
            <h2>Ready for the next stage</h2>
            {readyProjects.length ? (
              readyProjects.map((p) => (
                <div className="action-item" key={p.id}>
                  <CheckCircle2 size={22} className="teal" />
                  <div>
                    <b>{p.title}</b>
                    <p>
                      All requirements approved · {checklist[p.phase]?.name}
                    </p>
                  </div>
                  <button
                    className="button small secondary"
                    onClick={() => openProject(p.id)}
                  >
                    Open checklist
                  </button>
                </div>
              ))
            ) : (
              <Empty
                title="No stages are ready yet"
                text="Projects appear here after every mandatory item passes review."
              />
            )}
          </section>
          {isAdmin && (
            <section className="panel">
              <h2>Account approvals</h2>
              {data.users
                .filter((u) => u.status === "Pending")
                .map((u) => (
                  <div className="action-item" key={u.id}>
                    <span className="avatar">{initials(u.name)}</span>
                    <div>
                      <b>{u.name}</b>
                      <p>{u.email}</p>
                    </div>
                    <button
                      className="button small"
                      onClick={() => {
                        go("User management");
                        setModal({ kind: "user", record: u });
                      }}
                    >
                      Review account
                    </button>
                  </div>
                ))}
            </section>
          )}
        </div>
      </>
    );
  }
  function notificationsPage() {
    const list = notifications.filter(
      (n) =>
        (!q ||
          [n.title, n.body]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (!status || (status === "Unread" ? !n.read : n.type === status)),
    );
    return (
      <>
        {header(
          "Notifications",
          "Research updates delivered only to your account.",
          <button
            className="button secondary"
            onClick={() =>
              run(
                () => api("/notifications/read", "POST", { id: "all" }),
                "All notifications marked as read.",
              )
            }
          >
            <Check size={16} />
            Mark all as read
          </button>,
        )}
        <div className="filters">
          <label className="filter-field">
            <span>Find a message</span>
            <div className="search">
              <Search size={18} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search messages"
                aria-label="Search notifications"
              />
            </div>
          </label>
          <label className="filter-field">
            <span>Messages to show</span>
            <select
              aria-label="Notification filter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All updates</option>
              <option>Unread</option>
              {[...new Set(notifications.map((n) => n.type))].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <section className="panel notification-list">
          {list.length ? (
            list.map((n) => (
              <button
                className={"notification " + (!n.read ? "unread" : "")}
                key={n.id}
                onClick={async () => {
                  await run(() =>
                    api("/notifications/read", "POST", { id: n.id }),
                  );
                  if (n.projectId) openProject(n.projectId);
                }}
              >
                <span className="notification-symbol">
                  <Bell size={19} />
                </span>
                <div>
                  <b>{n.title}</b>
                  <p>{n.body}</p>
                  <small>
                    {date(n.createdAt)} · {n.priority || "Normal"} priority{" "}
                    {n.resolved ? "· Resolved" : ""}
                  </small>
                </div>
                {!n.read && <span className="unread-dot" />}
                <ChevronRight size={17} />
              </button>
            ))
          ) : (
            <Empty
              title="No messages to show"
              text="Messages about submissions, reviews, and account changes will appear here."
            />
          )}
        </section>
      </>
    );
  }
  function usersPage(faculty = false) {
    const list = data.users.filter(
      (u) =>
        (!faculty || u.role === "Researcher") &&
        (!q ||
          [u.name, u.email, u.department]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase())),
    );
    return (
      <>
        {header(
          faculty ? "Faculty members" : "User management",
          faculty
            ? "Find a faculty member and see their research projects."
            : "Approve accounts and choose what each person can do and which department they belong to.",
          !faculty && (
            <button
              className="button"
              onClick={() => setModal({ kind: "user" })}
            >
              <Plus size={16} />
              Add account
            </button>
          ),
        )}
        <div className="filters">
          <label className="filter-field">
            <span>Find a person</span>
            <div className="search">
              <Search size={18} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name, email or department"
                aria-label="Search faculty or users"
              />
            </div>
          </label>
        </div>
        <section className="panel table-panel">
          <div className="table-wrap">
            <RecordTable label={faculty ? "Faculty members" : "User accounts"}>
              <thead>
                <tr>
                  <th>Name and email</th>
                  <th>Department</th>
                  <th>{faculty ? "Research participation" : "Role"}</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="person-cell">
                        <span className="avatar">{initials(u.name)}</span>
                        <span>
                          <b>{u.name}</b>
                          <small>{u.email}</small>
                        </span>
                      </div>
                    </td>
                    <td>{u.department || "Not assigned"}</td>
                    <td>
                      {faculty
                        ? projects.filter((p) => p.ownerId === u.id).length +
                          " projects"
                        : u.role}
                    </td>
                    <td>
                      <Badge>{u.status}</Badge>
                    </td>
                    <td>
                      <button
                        className="button small secondary"
                        onClick={() =>
                          setModal({
                            kind: faculty ? "faculty" : "user",
                            record: u,
                          })
                        }
                      >
                        {faculty ? "View profile" : "Manage account"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </RecordTable>
          </div>
          {!list.length && <Empty title="No matching people" />}
        </section>
      </>
    );
  }
  function reportsPage() {
    const result = buildReport(
      { ...data, projects: filtered },
      report,
      checklist,
    );
    return (
      <>
        {header(
          "Reports & analytics",
          "Choose a report, narrow the results if needed, then save or print a copy.",
          <>
            <button
              className="button secondary"
              onClick={async () => {
                if (
                  await run(() =>
                    api("/reports/print", "POST", {
                      report,
                      filters: { q, type, department, year, status },
                    }),
                  )
                )
                  window.print();
              }}
            >
              <FileText size={16} />
              Print / Save PDF
            </button>
            <button className="button" onClick={exportCsv}>
              <Download size={16} />
              Download spreadsheet (CSV)
            </button>
          </>,
        )}
        <div className="report-type">
          <Field label="Report">
            <select value={report} onChange={(e) => setReport(e.target.value)}>
              {reportNames.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <p>
            The preview and downloaded copy use the same records. Choose Print /
            Save PDF to save a PDF copy, or download a spreadsheet file (CSV).
          </p>
        </div>
        {filterBar()}
        <div className="print-header">
          <h1>Research and Development Management System</h1>
          <p>
            {report} · Prepared by {user.name} · {date(new Date())}
          </p>
        </div>
        <section className="report-summary">
          <h2>{report}</h2>
          <div>
            <b>{result.rows.length}</b> report rows ·{" "}
            {department || "All departments you can access"} ·{" "}
            {type || "All research types"} · {year || "All years"}
          </div>
          <p className="muted">
            Prepared {date(new Date())} by {user.name}. This practice system
            uses example data.
          </p>
        </section>
        <section className="panel table-panel">
          {result.rows.length ? (
            <div
              className={
                "table-wrap " +
                (result.columns.length > 7 ? "records-stacked" : "")
              }
            >
              <RecordTable label={report}>
                <thead>
                  <tr>
                    {result.columns.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((value, j) => (
                        <td key={j}>{statusLabel(String(value ?? "—"))}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </RecordTable>
            </div>
          ) : (
            <Empty
              title="No report rows match"
              text="Change filters or select another report."
            />
          )}
        </section>
      </>
    );
  }
  function newsPage() {
    return (
      <>
        {header(
          "News & announcements",
          "Calls for papers, opportunities, and updates from the research unit.",
          isPublisher && (
            <button
              className="button"
              onClick={() => setModal({ kind: "announcement" })}
            >
              <Plus size={16} />
              Create announcement
            </button>
          ),
        )}
        <div className="news-grid">
          {data.announcements.map((a) => (
            <article className="panel news-card" key={a.id}>
              <div className="section-heading">
                <span className="small-caps">{a.category}</span>
                <Badge>{a.status}</Badge>
              </div>
              <h2>{a.title}</h2>
              <p>{a.body.length > 210 ? a.body.slice(0, 210) + "…" : a.body}</p>
              <div className="news-meta">
                {a.author} · {date(a.createdAt)}
                <br />
                Audience: {a.department || "All"}
                {a.deadline && (
                  <>
                    <br />
                    Deadline: {date(a.deadline)}
                  </>
                )}
              </div>
              <div className="news-actions">
                <button
                  className="text-button"
                  onClick={() =>
                    setModal({ kind: "announcement-view", record: a })
                  }
                >
                  Read announcement <ArrowRight size={14} />
                </button>
                {isPublisher && (
                  <button
                    className="text-button"
                    onClick={() =>
                      setModal({ kind: "announcement", record: a })
                    }
                  >
                    Edit announcement
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
        {!data.announcements.length && <Empty title="No announcements yet" />}
      </>
    );
  }
  function assistantPage() {
    return (
      <>
        {header(
          "Research assistant",
          "Ask about your research and find out what to do next.",
        )}
        <section className="assistant-layout">
          <div className="assistant-mark">
            <Sparkles size={29} />
          </div>
          <h2>A little clarity for your next step.</h2>
          <p>
            Find research, understand progress, and identify missing
            requirements.
          </p>
          <div className="suggestions">
            {[
              "Which projects need attention?",
              "Summarize my research projects",
              "What requirements are missing?",
            ].map((s) => (
              <button key={s} onClick={() => setQuestion(s)}>
                {s}
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
          <form
            className="assistant-input"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const a = await api("/assistant", "POST", { question });
                setAnswer(a.answer);
              } catch (e) {
                setError(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <input
              aria-label="Question for research assistant"
              placeholder="Ask a research status question…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
            <button className="button" disabled={busy}>
              Ask <ArrowRight size={17} />
            </button>
          </form>
          {answer && (
            <div className="assistant-answer">
              <h3>Your research summary</h3>
              <p>{answer}</p>
            </div>
          )}
          <div className="assistant-disclaimer">
            <ShieldCheck size={17} />
            <span>
              This practice helper uses the records you can access. It is not a
              live AI service and cannot check whether a document is genuine,
              approve it, or move research to the next stage.
            </span>
          </div>
        </section>
      </>
    );
  }
  function rolesPage() {
    return (
      <>
        {header(
          "Roles & permissions",
          "See what each role can view and do. Only account administrators can change a person’s assigned role.",
        )}
        <section className="panel table-panel">
          <div className="table-wrap">
            <RecordTable label="What each role can do">
              <thead>
                <tr>
                  <th>Action</th>
                  {[
                    "Super Admin",
                    "Research Director",
                    "Department Head",
                    "Researcher",
                  ].map((r) => (
                    <th key={r}>{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "View research projects",
                    "Institution",
                    "Institution",
                    "Own department",
                    "Own projects",
                  ],
                  ["Manage accounts / security", "Yes", "No", "No", "No"],
                  [
                    "Review documents and approve the next stage",
                    "No",
                    "No",
                    "Own department",
                    "No",
                  ],
                  [
                    "Upload a PDF for a researcher",
                    "No",
                    "No",
                    "Own department",
                    "No",
                  ],
                  [
                    "Submit required documents",
                    "No",
                    "No",
                    "For own department",
                    "Own projects",
                  ],
                  ["Publish announcements", "Yes", "Yes", "No", "No"],
                  [
                    "Reports and exports",
                    "Institution",
                    "Institution",
                    "Own department",
                    "Own summary",
                  ],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((v, i) => (
                      <td key={i}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </RecordTable>
          </div>
        </section>
        <div className="notice">
          <ShieldCheck size={20} />
          <span>
            These rules are enforced by the system. Research Directors can
            monitor university-wide research but cannot manage accounts or
            approve documents. Department Heads review only their assigned
            department. A separate Reviewer role is not enabled.
          </span>
        </div>
      </>
    );
  }
  function settingsPage() {
    return (
      <>
        {header(
          "System settings",
          "Change the institution name and see which services are ready to use.",
        )}
        <section className="panel settings-panel">
          <h2>Institution identity</h2>
          <SafeForm
            busy={busy}
            context="Institution name"
            confirmLabel="Confirm and save settings"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              await run(
                () =>
                  api("/settings", "POST", {
                    institution: f.get("institution"),
                  }),
                "Institution setting saved.",
              );
            }}
          >
            <Field label="Institution">
              <input
                name="institution"
                defaultValue={
                  data.settings.institution || "Bukidnon State University"
                }
                required
                maxLength={150}
              />
            </Field>
            <button className="button" disabled={busy}>
              Review changes
            </button>
          </SafeForm>
        </section>
        <section className="panel settings-panel">
          <h2>Connected services and missing information</h2>
          {[
            [
              "Google Single Sign-On",
              "Not configured",
              "Google sign-in is not connected. The account picker is for practice only, not secure sign-in.",
            ],
            [
              "Email delivery",
              "Not configured",
              "Messages appear inside the system, but no emails are being sent. An email service must be connected before this can work.",
            ],
            [
              "Official BukSU / RDU branding",
              "Assets required",
              "The current appearance is temporary. Approved university colors and logos have not been provided.",
            ],
            [
              "Personally funded checklist",
              "Provisional",
              "Personally funded projects temporarily use the standard checklist. The separate official checklist has not been supplied.",
            ],
            [
              "Database and document storage",
              "Saved on this computer",
              "Research records and PDFs are saved together on this computer. Keep a complete backup before moving or resetting the system.",
            ],
          ].map(([name, state, desc]) => (
            <div className="integration" key={name}>
              <div>
                <b>{name}</b>
                <p>{desc}</p>
              </div>
              <Badge>{state}</Badge>
            </div>
          ))}
        </section>
        <section className="panel settings-panel">
          <h2>Academic directory</h2>
          <p className="muted">
            Departments and programs supplied to research forms.
          </p>
          <div className="directory-grid">
            {data.departments.map((d) => (
              <div key={typeof d === "string" ? d : d.name}>
                <Building2 size={17} />
                {typeof d === "string" ? d : d.name}
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }
  function renderPage() {
    if (project) return projectDetail();
    switch (page) {
      case "Overview":
        return renderOverview();
      case "Research projects":
        return projectPage();
      case "Pending actions":
        return actionsPage();
      case "Notifications":
        return notificationsPage();
      case "Document submissions":
        return (
          <>
            {header(
              "Document submissions",
              "Find uploaded PDFs, earlier versions, signatures, and feedback.",
            )}
            {filterBar()}{" "}
            {documentTable(
              data.documents.filter((d) =>
                filtered.some((p) => p.id === d.projectId),
              ),
            )}
          </>
        );
      case "Review & approvals":
        return (
          <>
            {header(
              "Review & approvals",
              isHead
                ? "Open a document, check it against the requirement, and record your decision."
                : "See which documents have been reviewed. Only Department Heads can record a decision.",
            )}
            <div className="tabs">
              {["Pending Review", "Needs Revision", "Approved", "Rejected"].map(
                (s) => (
                  <button
                    key={s}
                    className={
                      (status || "Pending Review") === s ? "selected" : ""
                    }
                    aria-pressed={(status || "Pending Review") === s}
                    onClick={() => setStatus(s)}
                  >
                    {statusLabel(s)}
                    <span>
                      {data.documents.filter((d) => d.status === s).length}
                    </span>
                  </button>
                ),
              )}
            </div>
            {documentTable(
              data.documents.filter(
                (d) => d.status === (status || "Pending Review"),
              ),
            )}
          </>
        );
      case "Research archive":
        return (
          <>
            {header(
              "Research archive",
              "Preserved completed research and its documentary history.",
            )}
            {filterBar()}
            <section className="panel table-panel">
              {projectTable(
                filtered.filter((p) =>
                  ["Completed", "Archived"].includes(p.status),
                ),
              )}
            </section>
          </>
        );
      case "Faculty profiles":
        return usersPage(true);
      case "User management":
        return usersPage();
      case "Reports & analytics":
        return reportsPage();
      case "News & announcements":
        return newsPage();
      case "Research assistant":
        return assistantPage();
      case "Roles & permissions":
        return rolesPage();
      case "Audit history":
        return (
          <>
            {header(
              "Audit history",
              "See who submitted, reviewed, or changed a record, and when it happened. Saved history cannot be edited.",
            )}
            {auditList(data.audit)}
          </>
        );
      case "System settings":
        return settingsPage();
      default:
        return renderOverview();
    }
  }
  function renderModal() {
    if (!modal) return null;
    const m = modal;
    let title = "",
      content;
    if (m.kind === "project") {
      title = "Add a research project";
      content = (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = Object.fromEntries(new FormData(e.currentTarget));
            const ok = await run(
              () => api("/projects", "POST", f),
              "Research project created. Open its checklist to upload requirements.",
            );
            if (ok) {
              setModal(null);
              go("Research projects");
            }
          }}
        >
          <fieldset className="form-section">
            <legend>Name your study</legend>
            <Field label="Research title">
              <input
                name="title"
                required
                maxLength={220}
                placeholder="Enter a descriptive research title"
              />
            </Field>
          </fieldset>
          <ProjectFields data={data} user={user} />
          <fieldset className="form-section">
            <legend>Describe your study</legend>
            <Field
              label="Research abstract"
              hint="Briefly explain the problem, your objectives, and how you plan to carry out the research."
            >
              <textarea
                name="abstract"
                rows="4"
                required
                minLength={20}
                maxLength={6000}
                placeholder="Summarize the problem, objectives, and approach."
              />
            </Field>
          </fieldset>
          <div className="notice">
            <AlertCircle size={17} />
            <span>
              Finish your current study before starting another one. If you
              already have a study in progress, open that project instead.
            </span>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              onClick={(e) =>
                e.currentTarget
                  .closest(".modal")
                  ?.querySelector(".modal-header button")
                  ?.click()
              }
            >
              Cancel
            </button>
            <button className="button" disabled={busy}>
              {busy ? "Submitting…" : "Create research project"}
            </button>
          </div>
        </form>
      );
    }
    if (m.kind === "upload") {
      title = "Upload a required document";
      content = (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            f.set("requirementId", m.item.id);
            f.set("submissionKey", m.submissionKey);
            if (
              await run(
                () => api("/projects/" + m.project.id + "/upload", "POST", f),
                "Your PDF has been submitted for review. Earlier versions are still available.",
              )
            )
              setModal(null);
          }}
        >
          <p className="modal-context">{m.project.title}</p>
          <div className="requirement-callout">{m.item.label}</div>
          <fieldset className="form-section">
            <legend>Choose the document</legend>
            <Field
              label="PDF document"
              hint={`Choose a PDF file no larger than ${data.settings.uploadLimit || 10} MB. Wait for a success message before leaving this page.`}
            >
              <input
                type="file"
                name="file"
                accept="application/pdf,.pdf"
                required
              />
            </Field>
          </fieldset>
          <fieldset className="form-section">
            <legend>Confirm the submission</legend>
            <Field
              label="Your full name for this submission"
              hint="Type your full name to confirm that you are submitting this document. This practice system records a typed signature, not a certified digital signature."
            >
              <input
                name="signature"
                required
                minLength={3}
                defaultValue={user.name}
              />
            </Field>
            <Field
              label={
                isHead
                  ? "Reason for uploading for the researcher"
                  : "Version / correction note"
              }
            >
              <textarea
                name="reason"
                required={isHead}
                rows="3"
                placeholder={
                  isHead
                    ? "Explain why you are uploading on behalf of the researcher."
                    : "Describe corrections or explain this submission."
                }
              />
            </Field>
          </fieldset>
          <div className="notice">
            A Department Head must review every submitted document, including
            files uploaded by staff. An approved document cannot be replaced
            here.
          </div>
          <div className="form-actions">
            <button className="button" disabled={busy}>
              {busy ? "Uploading…" : "Sign & submit PDF"}
              <Upload size={16} />
            </button>
          </div>
        </form>
      );
    }
    if (m.kind === "document") {
      const d = data.documents.find((d) => d.id === m.record.id) || m.record;
      title = "Document review";
      content = (
        <>
          <div className="document-meta">
            <div>
              <h3>{d.name}</h3>
              <p>
                Version {d.version} · {date(d.createdAt)} · {d.uploaderName}
              </p>
            </div>
            <Badge>{d.status}</Badge>
          </div>
          {d.synthetic && (
            <div className="notice">
              This is an example PDF for practice. It is not an actual faculty
              research document.
            </div>
          )}
          <div className="pdf-frame">
            <iframe
              title={"PDF preview: " + d.name}
              src={"/api/documents/" + d.id + "/file"}
            />
          </div>
          <div className="document-toolbar">
            <a
              className="button small secondary"
              href={"/api/documents/" + d.id + "/file"}
              target="_blank"
              rel="noreferrer"
            >
              <ArrowUpRight size={15} />
              Open full PDF
            </a>
            <span>Signed: {d.signature || "Seeded demo signature"}</span>
          </div>
          {d.reason && <p className="muted">Upload note: {d.reason}</p>}
          {d.feedback && (
            <div className="notice">Reviewer feedback: {d.feedback}</div>
          )}
          {isHead && d.status === "Pending Review" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const f = Object.fromEntries(new FormData(e.currentTarget));
                if (
                  await run(
                    () => api("/documents/" + d.id + "/review", "POST", f),
                    "Signed review recorded and researcher notified.",
                  )
                )
                  setModal(null);
              }}
            >
              <div className="form-grid">
                <Field label="Decision">
                  <select
                    name="decision"
                    required
                    value={reviewDecision}
                    onChange={(e) => setReviewDecision(e.target.value)}
                  >
                    <option value="Approved">Approve this document</option>
                    <option value="Needs Revision">Ask for changes</option>
                    <option value="Rejected">
                      Do not accept this document
                    </option>
                  </select>
                </Field>
                <Field
                  label="Your full name for this decision"
                  hint="Your name and decision will be kept in the project history."
                >
                  <input
                    name="signature"
                    defaultValue={user.name}
                    required
                    minLength={3}
                  />
                </Field>
              </div>
              <Field
                label="Review feedback"
                hint="Explain exactly what the researcher should change. Feedback is required when you request changes or do not accept a document, and is kept with your decision."
              >
                <textarea
                  name="feedback"
                  required={reviewDecision !== "Approved"}
                  rows="3"
                  placeholder="Explain your evaluation and any required corrections."
                />
              </Field>
              <div className="form-actions">
                <button className="button" disabled={busy}>
                  Sign & record decision
                  <Check size={16} />
                </button>
              </div>
            </form>
          )}
        </>
      );
    }
    if (m.kind === "advance") {
      title =
        m.project.phase === 2
          ? "Mark research as complete"
          : "Approve the next stage";
      content = (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const signature = new FormData(e.currentTarget).get("signature");
            if (
              await run(
                () =>
                  api("/projects/" + m.project.id + "/advance", "POST", {
                    signature,
                  }),
                "The stage approval has been saved in the project history.",
              )
            ) {
              setModal(null);
              setPhase(null);
            }
          }}
        >
          <p>{m.project.title}</p>
          <div className="notice">
            Every required document will be checked again before the research
            moves forward. Your name and this decision will be saved in the
            project history.
          </div>
          <Field
            label="Your full name for this approval"
            hint="Your name and approval will be recorded with this stage change."
          >
            <input
              name="signature"
              required
              minLength={3}
              defaultValue={user.name}
            />
          </Field>
          <div className="form-actions">
            <button className="button" disabled={busy}>
              Confirm authorized transition
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      );
    }
    if (m.kind === "applicability") {
      title = m.applicable
        ? "Require this document again"
        : "Mark a document as not needed";
      content = (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const reason = new FormData(e.currentTarget).get("reason");
            if (
              await run(
                () =>
                  api("/projects/" + m.project.id + "/applicability", "POST", {
                    requirementId: m.item.id,
                    applicable: Boolean(m.applicable),
                    reason,
                  }),
                "The requirement change and your reason have been saved.",
              )
            )
              setModal(null);
          }}
        >
          <p>{m.item.label}</p>
          <Field
            label={
              m.applicable
                ? "Reason this requirement applies"
                : "Reason this conditional requirement does not apply"
            }
          >
            <textarea name="reason" required minLength={5} rows="4" />
          </Field>
          <div className="notice">
            Only requirements marked as conditional can be treated as not
            needed. Your reason and this change will be kept in the project
            history.
          </div>
          <div className="form-actions">
            <button className="button" disabled={busy}>
              {m.applicable
                ? "Restore as required"
                : "Record as not applicable"}
            </button>
          </div>
        </form>
      );
    }
    if (m.kind === "user") {
      const u = m.record;
      title = u ? "Manage account" : "Add account for approval";
      content = (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = Object.fromEntries(new FormData(e.currentTarget));
            if (
              await run(
                () =>
                  api(
                    "/users" + (u ? "/" + u.id : ""),
                    u ? "PATCH" : "POST",
                    f,
                  ),
                u ? "Account updated." : "Pending account created.",
              )
            )
              setModal(null);
          }}
        >
          {!u ? (
            <>
              <Field label="Full name">
                <input name="name" required maxLength={120} />
              </Field>
              <Field label="Institutional email">
                <input name="email" type="email" required />
              </Field>
            </>
          ) : (
            <div className="person-cell modal-person">
              <span className="avatar">{initials(u.name)}</span>
              <div>
                <b>{u.name}</b>
                <p>{u.email}</p>
              </div>
            </div>
          )}
          <Field label="Role">
            <select name="role" defaultValue={u?.role || "Researcher"}>
              {[
                "Researcher",
                "Department Head",
                "Research Director",
                "Super Admin",
              ].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Assigned department"
            hint="Department Heads can review only projects in their assigned department."
          >
            <select name="department" defaultValue={u?.department || ""}>
              {data.departments.map((d) => (
                <option key={typeof d === "string" ? d : d.name}>
                  {typeof d === "string" ? d : d.name}
                </option>
              ))}
            </select>
          </Field>
          {u && (
            <Field label="Account status">
              <select name="status" defaultValue={u.status}>
                {[
                  "Pending",
                  "Active",
                  "Rejected",
                  "Suspended",
                  "Deactivated",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          )}
          <div className="notice">
            Only Active accounts can sign in. Check the role and department
            carefully: they control what this person can see and do. Every
            change is recorded.
          </div>
          <div className="form-actions">
            <button className="button" disabled={busy}>
              {u ? "Save account decision" : "Create pending account"}
            </button>
          </div>
        </form>
      );
    }
    if (m.kind === "faculty") {
      const u = m.record;
      title = "Faculty research profile";
      content = (
        <>
          <div className="profile-banner">
            <span className="avatar large">{initials(u.name)}</span>
            <div>
              <h2>{u.name}</h2>
              <p>{u.department}</p>
              <a href={"mailto:" + u.email}>{u.email}</a>
            </div>
          </div>
          <h3>Research participation</h3>
          {projects
            .filter((p) => p.ownerId === u.id)
            .map((p) => (
              <button
                className="profile-project"
                key={p.id}
                onClick={() => {
                  setModal(null);
                  openProject(p.id);
                }}
              >
                <span>
                  <b>{p.title}</b>
                  <small>{p.type}</small>
                </span>
                <Badge>{p.status}</Badge>
                <ChevronRight size={16} />
              </button>
            ))}
          {!projects.some((p) => p.ownerId === u.id) && (
            <Empty title="No research projects yet" />
          )}
          <div className="notice">
            Profile contact information is limited to supplied demo records; no
            personal phone or social account is fabricated.
          </div>
        </>
      );
    }
    if (m.kind === "announcement") {
      const a = m.record;
      title = a ? "Edit announcement" : "Create announcement";
      content = (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = Object.fromEntries(new FormData(e.currentTarget));
            if (
              await run(
                () =>
                  api(
                    "/announcements" + (a ? "/" + a.id : ""),
                    a ? "PATCH" : "POST",
                    f,
                  ),
                "Announcement saved. Published updates notify the target audience.",
              )
            )
              setModal(null);
          }}
        >
          <Field label="Title">
            <input
              name="title"
              defaultValue={a?.title}
              required
              maxLength={220}
            />
          </Field>
          <div className="form-grid">
            <Field label="Category">
              <select name="category" defaultValue={a?.category}>
                {[
                  "Call for Papers",
                  "Research Opportunities",
                  "Events",
                  "Deadlines",
                  "General Announcements",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Audience">
              <select name="department" defaultValue={a?.department || "All"}>
                <option>All</option>
                {data.departments.map((d) => (
                  <option key={typeof d === "string" ? d : d.name}>
                    {typeof d === "string" ? d : d.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            label="Announcement content"
            hint="Write your message as plain text. HTML, images, and attachments are not supported in this practice version."
          >
            <textarea
              name="body"
              defaultValue={a?.body}
              rows="7"
              required
              maxLength={10000}
            />
          </Field>
          <div className="form-grid">
            <Field label="Publication status">
              <select name="status" defaultValue={a?.status || "Draft"}>
                <option>Draft</option>
                <option>Published</option>
                <option>Archived</option>
              </select>
            </Field>
            <Field label="Deadline" hint="Leave blank if there is no deadline.">
              <input
                type="date"
                name="deadline"
                defaultValue={a?.deadline?.slice(0, 10)}
              />
            </Field>
          </div>
          <div className="form-actions">
            <button className="button" disabled={busy}>
              Save announcement
            </button>
          </div>
        </form>
      );
    }
    if (m.kind === "archive") {
      title = "Archive completed research";
      content = (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              await run(
                () => api("/projects/" + m.project.id + "/archive", "POST", {}),
                "The completed project is now in the archive.",
              )
            )
              setModal(null);
          }}
        >
          <p>{m.project.title}</p>
          <div className="notice">
            Archiving keeps this completed project and its documents available
            in Completed research. It does not delete any records. Only continue
            if this is the project you intend to archive.
          </div>
          <div className="form-actions">
            <button className="button" disabled={busy}>
              Review archive action
            </button>
          </div>
        </form>
      );
    }
    if (m.kind === "announcement-view") {
      const a = m.record;
      title = a.title;
      content = (
        <article className="prose">
          <div className="section-heading">
            <Badge>{a.category}</Badge>
            <span className="muted">{date(a.createdAt)}</span>
          </div>
          <p className="announcement-body">{a.body}</p>
          <p className="muted">
            Published by {a.author} · Audience: {a.department || "All"}
          </p>
          {a.deadline && (
            <div className="notice">Deadline: {date(a.deadline)}</div>
          )}
        </article>
      );
    }
    const confirmationLabels = {
      project: "Confirm and create project",
      upload: "Confirm and submit document",
      document: "Confirm and save decision",
      advance:
        m.project?.phase === 2
          ? "Confirm research is complete"
          : "Confirm the next stage",
      applicability: "Confirm requirement change",
      user: m.record ? "Confirm account changes" : "Confirm and add account",
      announcement: "Confirm and save announcement",
      archive: "Confirm and archive project",
    };
    return (
      <ModalFrame
        key={
          m.kind +
          ":" +
          (m.record?.id || m.project?.id || "") +
          ":" +
          (m.item?.id || "")
        }
        title={title}
        wide={m.kind === "document"}
        busy={busy}
        error={error}
        onClose={() => {
          setModal(null);
          setError("");
        }}
      >
        <ConfirmForms
          busy={busy}
          context={
            m.project?.title || m.record?.name || m.record?.title || title
          }
          confirmLabel={confirmationLabels[m.kind]}
          note={
            m.kind === "document"
              ? "Check the document, decision, and feedback carefully. Once recorded, a signed review cannot be edited."
              : m.kind === "advance"
                ? "This will move the research forward after all requirements are checked again. Confirm only when the current stage is complete."
                : m.kind === "user"
                  ? "Check the role, department, and account status. These choices control what this person can access."
                  : m.kind === "announcement"
                    ? "If the status is Published, this update will be shared with the selected audience."
                    : m.kind === "upload"
                      ? "This submits the selected PDF for review. It does not approve the document. Earlier versions are kept."
                      : undefined
          }
          validate={
            m.kind === "document"
              ? (f) =>
                  f.get("decision") !== "Approved" &&
                  !String(f.get("feedback") || "").trim()
                    ? "Explain the changes needed in Review feedback before continuing."
                    : null
              : undefined
          }
        >
          {content}
        </ConfirmForms>
      </ModalFrame>
    );
  }
  if (!session || starting)
    return (
      <div className="loading">
        <span className="loading-dot" />
        Loading your research workspace…
        {error && (
          <>
            <p role="alert">{friendlyError(error)}</p>
            <button className="button" onClick={() => window.location.reload()}>
              Try loading again
            </button>
          </>
        )}
      </div>
    );
  if (!data)
    return (
      <div className="login-page">
        <section className="login-story">
          <div className="brand">
            <span className="brand-icon">
              <FolderKanban size={24} />
            </span>
            <b>
              RDMS<span>.</span>
            </b>
          </div>
          <div>
            <h1>
              Research moves forward.
              <br />
              Nothing gets left behind.
            </h1>
            <p>
              One workspace for every proposal, documentary requirement, review,
              and research milestone.
            </p>
            <div className="login-phases">
              <span>Conceptualization</span>
              <ArrowRight size={18} />
              <span>Development</span>
              <ArrowRight size={18} />
              <span>Implementation</span>
            </div>
          </div>
          <small>
            Research and Development Management System
            <br />
            Bukidnon State University · Practice system
          </small>
        </section>
        <section className="login-form">
          <div className="login-inner">
            <h2>Welcome to your research workspace</h2>
            <p>Choose a practice account to explore what each role can do.</p>
            <div className="notice">
              <AlertCircle size={17} />
              <span>
                Local demonstration only. This is not Google authentication.
                Never use confidential research in demo mode.
              </span>
            </div>
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
            <Field
              label="Practice account"
              hint="Each role sees only the pages and actions available to it."
            >
              <select
                id="demo-user"
                defaultValue={
                  session.demoUsers?.find((u) => u.role === "Research Director")
                    ?.id
                }
              >
                {session.demoUsers?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} · {u.role}{" "}
                    {u.status !== "Active" ? "(" + u.status + ")" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <button
              className="button login-button"
              disabled={busy}
              onClick={() => login(document.getElementById("demo-user").value)}
            >
              {busy ? "Opening your workspace…" : "Open practice workspace"}
              <ArrowRight size={17} />
            </button>
            <div className="login-integration">
              <ShieldCheck size={18} />
              <div>
                <b>Google sign-in is not connected yet</b>
                <p>
                  An administrator must connect Google sign-in before this
                  system can be used with real accounts. New accounts will need
                  approval.
                </p>
              </div>
            </div>
            <p className="login-footnote">
              People, projects, and documents shown here are examples. This
              temporary design is not official university branding.
            </p>
          </div>
        </section>
      </div>
    );
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        inert={Boolean(modal) || (smallScreen && mobile)}
      >
        Skip to main content
      </a>
      {mobile && <div className="nav-overlay" onClick={closeNav} />}
      <aside
        className={"sidebar " + (mobile ? "open" : "")}
        inert={Boolean(modal) || (smallScreen && !mobile)}
        aria-hidden={modal || (smallScreen && !mobile) ? true : undefined}
      >
        <button className="brand" onClick={() => go("Overview")}>
          <span className="brand-icon">
            <FolderKanban size={22} />
          </span>
          <b>
            RDMS<span>.</span>
          </b>
        </button>
        <div className="brand-description">
          Research and Development
          <br />
          Management System
        </div>
        {smallScreen && (
          <button className="button secondary nav-close" onClick={closeNav}>
            <X size={20} />
            Close menu
          </button>
        )}
        <nav aria-label="Main navigation">
          {navGroups
            .filter((g) => !g.admin || isAdmin)
            .map((g, i) => (
              <div className="nav-group" key={i}>
                {g.title && <div className="nav-label">{g.title}</div>}
                {g.items.map(([name, Icon]) => (
                  <button
                    key={name}
                    aria-label={pageLabels[name] || name}
                    aria-current={page === name ? "page" : undefined}
                    className={"nav-item " + (page === name ? "active" : "")}
                    onClick={() => go(name)}
                  >
                    <Icon size={18} />
                    <span>{pageLabels[name] || name}</span>
                    {name === "Pending actions" && pendingDocs.length > 0 && (
                      <span className="nav-count">{pendingDocs.length}</span>
                    )}
                    {name === "Notifications" && unread > 0 && (
                      <span className="nav-count">{unread}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
        </nav>
        <div className="sidebar-footer">
          <span className="live-dot" />
          <span>Practice system</span>
          <small>Example data · Temporary branding</small>
        </div>
      </aside>
      <div
        className="main-shell"
        inert={Boolean(modal) || (smallScreen && mobile)}
      >
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="button secondary mobile-menu"
              aria-label="Open menu"
              aria-expanded={mobile}
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
              Menu
            </button>
            <button className="text-button" onClick={() => go("Overview")}>
              Home
            </button>
            {(project || page !== "Overview") && (
              <>
                <ChevronRight size={14} />
                <b>{project ? "Project details" : pageLabels[page] || page}</b>
              </>
            )}
          </div>
          <div className="topbar-actions">
            <span className="demo-label">Practice system</span>
            <button
              className="notification-bell button secondary"
              aria-label={"Messages, " + unread + " unread"}
              onClick={() => go("Notifications")}
            >
              <Bell size={20} />
              Messages
              {unread > 0 && <span>{unread}</span>}
            </button>
            <div className="identity">
              <span className="avatar">{initials(user.name)}</span>
              <div>
                <b>{user.name}</b>
                <span>{user.role}</span>
              </div>
            </div>
            <button
              className="button secondary"
              title="Switch practice account"
              aria-label="Switch account"
              disabled={busy}
              onClick={async () => {
                try {
                  await api("/session", "DELETE");
                  setData(null);
                  setSession(await api("/session"));
                  setError("");
                  setAnswer("");
                  setQuestion("");
                  setModal(null);
                  setToast("");
                  setRefreshFailed(false);
                } catch (e) {
                  setError(friendlyError(e.message));
                }
              }}
            >
              <LogOut size={17} />
              Switch account
            </button>
          </div>
        </header>
        <main className="content" id="main-content" tabIndex={-1}>
          {error && !modal && (
            <div className="error-message" role="alert">
              <AlertCircle size={18} />
              {error}
              <button
                className="button small secondary"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={16} />
                Dismiss
              </button>
            </div>
          )}
          {refreshFailed && (
            <div className="notice" role="status">
              <AlertCircle size={20} />
              <div>
                <b>Your change was saved, but this page could not refresh.</b>
                <p>
                  You do not need to submit it again. Refresh the records to see
                  the latest information.
                </p>
                <button
                  className="button secondary"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await load();
                      setRefreshFailed(false);
                    } catch (e) {
                      setError(friendlyError(e.message));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Refresh records
                </button>
              </div>
            </div>
          )}
          {renderPage()}
          <footer className="page-footer">
            <span>RDMS · Research and Development Management System</span>
            <span>
              Practice system · Google sign-in and email are not connected
            </span>
          </footer>
        </main>
      </div>
      {renderModal()}
      {toast && (
        <div
          className="toast"
          role="status"
          inert={Boolean(modal) || (smallScreen && mobile)}
        >
          <CheckCircle2 size={19} />
          {toast}
          <button
            className="button small secondary"
            onClick={() => setToast("")}
            aria-label="Dismiss notification"
          >
            <X size={15} />
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <WorkspaceErrorBoundary>
    <App />
  </WorkspaceErrorBoundary>,
);
