import express from "express";
import multer from "multer";
import { randomBytes, createHash } from "node:crypto";
import { existsSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { openStore, id, now } from "./store.js";
import { buildReport, reportNames } from "../shared/reporting.js";
import {
  checklist,
  types,
  departments,
  programs,
  roles,
  phaseItems,
  emptyRequirements,
} from "../shared/catalog.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fail = (status, message) => {
  const e = new Error(message);
  e.status = status;
  throw e;
};
const text = (value, label, max = 500, required = true) => {
  if (value === undefined && !required) return "";
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && !value.trim())
  )
    fail(
      400,
      `${label} must be ${required ? "nonempty " : ""}text (maximum ${max} characters).`,
    );
  return value.trim();
};
const choice = (value, choices, label) =>
  choices.includes(value) ? value : fail(400, `Invalid ${label}.`);
const isAdmin = (u) => u.role === "Super Admin";
const isPublisher = (u) =>
  ["Super Admin", "Research Director"].includes(u.role);
const canSee = (u, p) =>
  isPublisher(u) ||
  (u.role === "Department Head"
    ? u.department === p.department
    : p.ownerId === u.id);
const head = (u, p) => {
  if (u.role !== "Department Head" || u.department !== p.department)
    fail(403, "Only the assigned department head may perform this action.");
};
const admin = (u) => {
  if (!isAdmin(u)) fail(403, "Super Admin permission required.");
};
const ongoing = (p) => {
  if (p.status !== "Ongoing")
    fail(409, "Only ongoing projects can be changed.");
};
const requirement = (p, requirementId) =>
  phaseItems(p.phase).find((x) => x.id === requirementId) ||
  fail(409, "Requirement is not in the current phase.");
const project = (s, u, projectId) => {
  const p = s.projects.find((x) => x.id === projectId);
  if (!p || !canSee(u, p)) fail(404, "Project not found.");
  return p;
};
const audit = (s, u, action, entity, reason = "") =>
  s.audit.push({
    id: id("audit"),
    actor: u.name,
    action,
    entity,
    reason,
    createdAt: now(),
  });
const notify = (
  s,
  recipientId,
  title,
  body,
  projectId,
  type = "Update",
  extra = {},
) =>
  s.notifications.push({
    id: id("notice"),
    recipientId,
    title,
    body,
    projectId,
    read: false,
    createdAt: now(),
    type,
    priority: ["Review", "Revision", "Account"].includes(type)
      ? "High"
      : "Normal",
    resolved: !["Review", "Revision", "Account"].includes(type),
    ...extra,
  });
function resolveTasks(s) {
  for (const n of s.notifications) {
    if (n.type === "Account")
      n.resolved = s.users.find((u) => u.id === n.userId)?.status !== "Pending";
    if (["Review", "Revision"].includes(n.type)) {
      const d = s.documents.find((x) => x.id === n.documentId);
      const p = s.projects.find((x) => x.id === n.projectId);
      const recipient = s.users.find((x) => x.id === n.recipientId);
      n.resolved =
        !d ||
        !p ||
        !recipient ||
        recipient.status !== "Active" ||
        !canSee(recipient, p) ||
        p.status !== "Ongoing" ||
        p.requirements[d.requirementId]?.versions.at(-1) !== d.id ||
        (n.type === "Review"
          ? d.status !== "Pending Review" ||
            recipient.role !== "Department Head"
          : !["Needs Revision", "Rejected"].includes(d.status));
    }
  }
}
export function createApp({
  dataDir = process.env.RDMS_DATA_DIR || join(root, "data"),
} = {}) {
  dataDir = resolve(dataDir);
  const store = openStore(dataDir);
  const app = express();
  app.locals.store = store;
  app.locals.close = () => store.close();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    if (req.path.startsWith("/api/")) res.set("Cache-Control", "no-store");
    // SameSite cookies plus same-origin mutation checks; Vite's same-origin proxy is supported.
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.headers.origin
    ) {
      try {
        if (new URL(req.headers.origin).host !== req.headers.host)
          return res
            .status(403)
            .json({ error: "Cross-origin mutations are not allowed." });
      } catch {
        return res.status(403).json({ error: "Invalid origin." });
      }
    }
    next();
  });
  app.use(express.json({ limit: "100kb" }));
  app.use((req, res, next) => {
    req.body ??= {};
    next();
  });
  const tokenOf = (req) =>
    (req.headers.cookie || "")
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("rdms_session="))
      ?.slice(13);
  const sessionUser = (req, s) => {
    const session = store.db
      .prepare("SELECT userId FROM sessions WHERE token=? AND expires>?")
      .get(tokenOf(req) || "", Date.now());
    return (
      session &&
      s.users.find((u) => u.id === session.userId && u.status === "Active")
    );
  };
  const save = (s) => {
    resolveTasks(s);
    store.save(s);
  };
  app.get("/api/health", (req, res) => res.json({ ok: true, demo: true }));
  app.get("/api/session", (req, res) => {
    const s = store.load();
    res.json({
      user: sessionUser(req, s) || null,
      demoUsers: s.users.map(({ id, name, role, department, status }) => ({
        id,
        name,
        role,
        department,
        status,
      })),
      demo: true,
    });
  });
  app.post("/api/session", (req, res) => {
    const s = store.load();
    const u = s.users.find((x) => x.id === req.body?.userId);
    if (!u || u.status !== "Active")
      fail(403, "Only active demo accounts can sign in.");
    const token = randomBytes(32).toString("hex");
    store.db
      .prepare("DELETE FROM sessions WHERE token=? OR expires<?")
      .run(tokenOf(req) || "", Date.now());
    store.db
      .prepare("INSERT INTO sessions VALUES(?,?,?)")
      .run(token, u.id, Date.now() + 12 * 60 * 60 * 1000);
    res.cookie("rdms_session", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: req.secure,
      path: "/",
      maxAge: 12 * 60 * 60 * 1000,
    });
    res.json({ user: u, demo: true });
  });
  app.delete("/api/session", (req, res) => {
    store.db
      .prepare("DELETE FROM sessions WHERE token=?")
      .run(tokenOf(req) || "");
    res.clearCookie("rdms_session", { path: "/" });
    res.json({ user: null, demo: true });
  });
  app.use("/api", (req, res, next) => {
    req.state = store.load();
    req.user = sessionUser(req, req.state);
    if (!req.user)
      return res
        .status(401)
        .json({ error: "An active demo session is required." });
    next();
  });
  app.get("/api/bootstrap", (req, res) => {
    const { state: s, user: u } = req;
    resolveTasks(s);
    const projects = s.projects.filter((p) => canSee(u, p));
    const ids = new Set(projects.map((p) => p.id));
    const users = isAdmin(u)
      ? s.users
      : s.users.filter(
          (x) =>
            x.id === u.id ||
            (x.role === "Researcher" &&
              (isPublisher(u) ||
                (u.role === "Department Head" &&
                  x.department === u.department))),
        );
    res.json({
      user: u,
      users,
      projects,
      documents: s.documents.filter((d) => ids.has(d.projectId)),
      notifications: s.notifications.filter((n) => n.recipientId === u.id),
      announcements: s.announcements.filter(
        (a) =>
          isPublisher(u) ||
          (a.status === "Published" &&
            ["All", u.department].includes(a.department)),
      ),
      audit: s.audit.filter(
        (a) =>
          isAdmin(u) ||
          ids.has(a.entity) ||
          (isPublisher(u) &&
            (a.entity.startsWith("announcement:") ||
              a.entity.startsWith("report:"))),
      ),
      departments,
      programs,
      checklist,
      types,
      settings: s.settings,
    });
  });
  app.post("/api/projects", (req, res) => {
    const { state: s, user: u, body: b } = req;
    const ownerId = u.role === "Researcher" ? u.id : b.ownerId || u.id;
    const owner = s.users.find(
      (x) => x.id === ownerId && x.status === "Active",
    );
    if (!owner || (owner.id !== u.id && owner.role !== "Researcher"))
      fail(400, "Select an active researcher.");
    const department = choice(
      b.department || owner.department,
      departments,
      "department",
    );
    if (
      department !== owner.department ||
      (u.role === "Department Head" && department !== u.department) ||
      (u.role === "Researcher" && department !== u.department)
    )
      fail(403, "Project must belong to the owner’s authorized department.");
    if (
      s.projects.some((p) => p.ownerId === owner.id && p.status === "Ongoing")
    )
      fail(
        409,
        "The researcher already has an ongoing project. Complete it before starting another.",
      );
    const program = text(b.program, "Program");
    if (
      !programs.some((p) => p.name === program && p.department === department)
    )
      fail(400, "Program does not belong to the department.");
    const year = Number(b.year);
    if (!Number.isInteger(year) || year < 1900 || year > 2100)
      fail(400, "Year must be between 1900 and 2100.");
    const p = {
      id: id("project"),
      title: text(b.title, "Title", 300),
      type: choice(b.type, types, "research type"),
      ownerId,
      department,
      program,
      abstract: text(b.abstract, "Abstract", 10000),
      year,
      phase: 0,
      status: "Ongoing",
      createdAt: now(),
      requirements: emptyRequirements(),
      synthetic: false,
    };
    s.projects.push(p);
    audit(s, u, "Created project", p.id);
    save(s);
    res.status(201).json(p);
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
      fields: 6,
      fieldSize: 20000,
    },
  });
  app.post(
    "/api/projects/:id/upload",
    (req, res, next) => {
      try {
        const p = project(req.state, req.user, req.params.id);
        if (req.user.role !== "Researcher" || p.ownerId !== req.user.id)
          head(req.user, p);
        next();
      } catch (e) {
        next(e);
      }
    },
    upload.single("file"),
    (req, res) => {
      // Multipart parsing is asynchronous: re-read authoritative state and session after it finishes.
      const s = store.load();
      const u = sessionUser(req, s);
      const b = req.body;
      if (!u) fail(401, "An active demo session is required.");
      const p = project(s, u, req.params.id);
      if (u.role !== "Researcher" || p.ownerId !== u.id) head(u, p);
      const staffUpload = u.role === "Department Head";
      const reason = text(b.reason, "Reason", 2000, staffUpload);
      const signature = text(b.signature, "Signature", 5000);
      const file = req.file;
      if (
        !file ||
        !file.originalname.toLowerCase().endsWith(".pdf") ||
        file.buffer.subarray(0, 5).toString() !== "%PDF-" ||
        !file.buffer.includes(Buffer.from("%%EOF"))
      )
        fail(400, "Upload a valid PDF file with a .pdf filename.");
      if (file.size > s.settings.uploadLimit * 1024 * 1024)
        fail(413, `PDF exceeds the ${s.settings.uploadLimit} MB upload limit.`);
      const submissionKey = b.submissionKey
        ? text(b.submissionKey, "Submission key", 128)
        : undefined;
      const fingerprint = createHash("sha256")
        .update(file.buffer)
        .update(
          JSON.stringify([
            p.id,
            u.id,
            b.requirementId,
            file.originalname,
            signature,
            reason,
          ]),
        )
        .digest("hex");
      if (submissionKey) {
        const previous = s.documents.find(
          (d) => d.submissionKey === submissionKey,
        );
        if (previous) {
          if (previous.fingerprint !== fingerprint)
            fail(
              409,
              "This submission key was already used for different content. Start a new upload.",
            );
          return res.json(previous);
        }
      }
      ongoing(p);
      requirement(p, b.requirementId);
      const r = p.requirements[b.requirementId];
      if (["Approved", "Not Applicable"].includes(r.status))
        fail(409, "Approved or waived requirements cannot be replaced.");
      const prior = s.documents.find((d) => d.id === r.versions.at(-1));
      if (prior) prior.status = "Superseded";
      const d = {
        id: id("doc"),
        projectId: p.id,
        requirementId: b.requirementId,
        name: file.originalname
          .replace(/[\\/\r\n\x00-\x1f]/g, "_")
          .slice(0, 200),
        version: r.versions.length + 1,
        status: "Pending Review",
        uploaderName: u.name,
        reason,
        signature,
        createdAt: now(),
        feedback: "",
        staffUpload,
        submissionKey,
        fingerprint,
        synthetic: false,
      };
      s.documents.push(d);
      r.versions.push(d.id);
      r.status = "Pending Review";
      r.feedback = "";
      const path = join(dataDir, "files", `${d.id}.pdf`);
      writeFileSync(path, file.buffer, { flag: "wx" });
      audit(
        s,
        u,
        staffUpload ? "Staff PDF upload" : "Signed PDF submission",
        p.id,
        `${d.id}: ${reason}`,
      );
      for (const h of s.users.filter(
        (x) =>
          x.role === "Department Head" &&
          x.department === p.department &&
          x.status === "Active",
      ))
        notify(
          s,
          h.id,
          "Submission awaiting review",
          `${p.title}: ${d.name}`,
          p.id,
          "Review",
          { documentId: d.id },
        );
      if (staffUpload)
        notify(
          s,
          p.ownerId,
          "Staff document uploaded",
          `${u.name} uploaded ${d.name}. Reason: ${reason}`,
          p.id,
        );
      try {
        save(s);
      } catch (e) {
        unlinkSync(path);
        throw e;
      }
      res.status(201).json(d);
    },
  );
  app.get("/api/documents/:id/file", (req, res) => {
    const d = req.state.documents.find((x) => x.id === req.params.id);
    if (!d) fail(404, "Document not found.");
    project(req.state, req.user, d.projectId);
    const path = join(dataDir, "files", `${d.id}.pdf`);
    if (!existsSync(path)) fail(404, "Stored PDF is unavailable.");
    res.type("application/pdf");
    res.set(
      "Content-Disposition",
      `inline; filename="${d.name.replace(/[^a-zA-Z0-9 ._-]/g, "_")}"`,
    );
    res.sendFile(path);
  });
  app.post("/api/documents/:id/review", (req, res) => {
    const { state: s, user: u, body: b } = req;
    const d = s.documents.find((x) => x.id === req.params.id);
    if (!d) fail(404, "Document not found.");
    const p = project(s, u, d.projectId);
    head(u, p);
    ongoing(p);
    requirement(p, d.requirementId);
    const r = p.requirements[d.requirementId];
    if (r.versions.at(-1) !== d.id || d.status !== "Pending Review" || d.review)
      fail(
        409,
        "Only the latest pending version can receive one immutable review.",
      );
    const decision = choice(
      b.decision,
      ["Approved", "Needs Revision", "Rejected"],
      "decision",
    );
    const feedback = text(
      b.feedback,
      "Feedback",
      5000,
      decision !== "Approved",
    );
    const signature = text(b.signature, "Signature", 5000);
    d.status = decision;
    d.feedback = feedback;
    d.review = {
      decision,
      feedback,
      signature,
      reviewer: u.name,
      createdAt: now(),
    };
    s.reviews.push({ id: id("review"), documentId: d.id, ...d.review });
    r.status = decision;
    r.feedback = feedback;
    audit(
      s,
      u,
      `Signed review: ${decision}`,
      p.id,
      `${d.id}; ${feedback}; signature: ${signature}`,
    );
    notify(
      s,
      p.ownerId,
      `Document ${decision.toLowerCase()}`,
      feedback || `${d.name} approved.`,
      p.id,
      ["Needs Revision", "Rejected"].includes(decision) ? "Revision" : "Update",
      { documentId: d.id },
    );
    save(s);
    res.json(d);
  });
  app.post("/api/projects/:id/advance", (req, res) => {
    const { state: s, user: u } = req;
    const p = project(s, u, req.params.id);
    head(u, p);
    ongoing(p);
    const signature = text(req.body.signature, "Signature", 5000);
    const missing = phaseItems(p.phase).filter((item) => {
      const r = p.requirements[item.id];
      return (
        r.status !== "Approved" &&
        !(item.conditional && r.status === "Not Applicable" && r.feedback)
      );
    });
    if (missing.length)
      fail(
        409,
        `${missing.length} current-phase requirements still need approval or an explicit conditional applicability decision.`,
      );
    if (p.phase === 2) p.status = "Completed";
    else p.phase++;
    audit(
      s,
      u,
      p.status === "Completed" ? "Completed research" : "Advanced phase",
      p.id,
      `Phase ${p.phase + 1}; signature: ${signature}`,
    );
    notify(
      s,
      p.ownerId,
      p.status === "Completed" ? "Research completed" : "Phase advanced",
      `${p.title}: ${p.status === "Completed" ? "All phases approved." : checklist[p.phase].name}`,
      p.id,
    );
    save(s);
    res.json(p);
  });
  app.post("/api/projects/:id/applicability", (req, res) => {
    const { state: s, user: u, body: b } = req;
    const p = project(s, u, req.params.id);
    head(u, p);
    ongoing(p);
    const item = requirement(p, b.requirementId);
    if (!item.conditional)
      fail(400, "Mandatory requirements cannot be waived.");
    if (typeof b.applicable !== "boolean")
      fail(400, "Applicable must be a boolean.");
    const reason = text(b.reason, "Reason", 2000);
    const r = p.requirements[item.id];
    if (r.status === "Approved")
      fail(409, "Approved requirements are immutable.");
    const prior = s.documents.find((d) => d.id === r.versions.at(-1));
    if (prior) prior.status = "Superseded"; // Retain signed submissions and decisions; close pending review tasks.
    r.status = b.applicable ? "Missing" : "Not Applicable";
    r.feedback = reason;
    audit(
      s,
      u,
      b.applicable
        ? "Requirement applicable"
        : "Conditional requirement waived",
      p.id,
      `${item.label}: ${reason}`,
    );
    save(s);
    res.json(p);
  });
  app.post("/api/projects/:id/archive", (req, res) => {
    const { state: s, user: u } = req;
    const p = project(s, u, req.params.id);
    if (!isPublisher(u)) head(u, p);
    if (p.status !== "Completed")
      fail(409, "Only completed projects can be archived.");
    p.status = "Archived";
    audit(s, u, "Archived project", p.id);
    save(s);
    res.json(p);
  });
  app.post("/api/users", (req, res) => {
    const { state: s, user: u, body: b } = req;
    admin(u);
    const email = text(b.email, "Email", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, "Invalid email.");
    if (s.users.some((x) => x.email.toLowerCase() === email))
      fail(409, "Email already exists.");
    const user = {
      id: id("user"),
      name: text(b.name, "Name", 120),
      email,
      role: choice(b.role, roles, "role"),
      department: choice(b.department, departments, "department"),
      status: "Pending",
    };
    s.users.push(user);
    audit(s, u, "Created pending account", `user:${user.id}`);
    for (const a of s.users.filter((x) => isAdmin(x) && x.status === "Active"))
      notify(
        s,
        a.id,
        "Account awaiting approval",
        user.name,
        undefined,
        "Account",
        { userId: user.id },
      );
    save(s);
    res.status(201).json(user);
  });
  app.patch("/api/users/:id", (req, res) => {
    const { state: s, user: u, body: b } = req;
    admin(u);
    const target = s.users.find((x) => x.id === req.params.id);
    if (!target) fail(404, "User not found.");
    const updated = { ...target };
    if (b.status !== undefined)
      updated.status = choice(
        b.status,
        ["Pending", "Active", "Rejected", "Suspended", "Deactivated"],
        "account status",
      );
    if (b.role !== undefined) updated.role = choice(b.role, roles, "role");
    if (b.department !== undefined)
      updated.department = choice(b.department, departments, "department");
    if (
      isAdmin(target) &&
      target.status === "Active" &&
      (!isAdmin(updated) || updated.status !== "Active") &&
      s.users.filter((x) => isAdmin(x) && x.status === "Active").length === 1
    )
      fail(409, "Retain at least one active Super Admin.");
    Object.assign(target, updated);
    audit(
      s,
      u,
      "Updated account scope/status",
      `user:${target.id}`,
      JSON.stringify({
        status: target.status,
        role: target.role,
        department: target.department,
      }),
    );
    save(s);
    res.json(target);
  });
  app.post("/api/notifications/read", (req, res) => {
    const { state: s, user: u } = req;
    const target = req.body.id || "all";
    if (
      target !== "all" &&
      !s.notifications.some((n) => n.id === target && n.recipientId === u.id)
    )
      fail(404, "Notification not found.");
    for (const n of s.notifications)
      if (n.recipientId === u.id && (target === "all" || n.id === target))
        n.read = true;
    save(s);
    res.json({ ok: true });
  });
  const announcementFields = (b, existing = {}) => {
    const a = { ...existing };
    for (const [key, max] of [
      ["title", 250],
      ["body", 20000],
      ["category", 100],
    ])
      if (!existing.id || b[key] !== undefined) a[key] = text(b[key], key, max);
    // Announcements are plain text, never executable rich HTML.
    if (/[<>]/.test(a.title + a.body))
      fail(400, "Announcements must be plain text, not HTML.");
    if (!existing.id || b.department !== undefined)
      a.department = choice(
        b.department || "All",
        ["All", ...departments],
        "announcement department",
      );
    if (!existing.id || b.status !== undefined)
      a.status = choice(
        b.status || "Draft",
        ["Published", "Draft", "Archived"],
        "announcement status",
      );
    if (!existing.id || b.deadline !== undefined) {
      a.deadline = text(b.deadline || "", "Deadline", 40, false);
      if (
        a.deadline &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(a.deadline) ||
          Number.isNaN(Date.parse(a.deadline)))
      )
        fail(400, "Deadline must be YYYY-MM-DD.");
    }
    return a;
  };
  const announceNotifications = (s, a) => {
    for (const u of s.users.filter(
      (u) =>
        u.status === "Active" &&
        (a.department === "All" || u.department === a.department),
    ))
      notify(s, u.id, a.title, a.body.slice(0, 300), undefined, "Announcement");
  };
  app.post("/api/announcements", (req, res) => {
    const { state: s, user: u } = req;
    if (!isPublisher(u))
      fail(403, "Announcement publishing authority required.");
    const a = {
      ...announcementFields(req.body),
      id: id("announcement"),
      author: u.name,
      authorId: u.id,
      createdAt: now(),
    };
    s.announcements.push(a);
    audit(s, u, `Announcement ${a.status}`, `announcement:${a.id}`);
    if (a.status === "Published") announceNotifications(s, a);
    save(s);
    res.status(201).json(a);
  });
  app.patch("/api/announcements/:id", (req, res) => {
    const { state: s, user: u } = req;
    const a = s.announcements.find((x) => x.id === req.params.id);
    if (!a) fail(404, "Announcement not found.");
    if (!isPublisher(u) && a.authorId !== u.id)
      fail(403, "Author or publishing authority required.");
    if (
      !isPublisher(u) &&
      req.body.status !== undefined &&
      req.body.status !== a.status
    )
      fail(403, "Publishing authority required.");
    const old = { ...a };
    Object.assign(a, announcementFields(req.body, a));
    audit(
      s,
      u,
      `Updated announcement: ${a.status}`,
      `announcement:${a.id}`,
      JSON.stringify(old),
    );
    if (a.status === "Published" && old.status !== "Published")
      announceNotifications(s, a);
    save(s);
    res.json(a);
  });
  app.get("/api/reports.csv", (req, res) => {
    const { state: s, user: u, query: q } = req;
    for (const value of Object.values(q))
      if (typeof value !== "string") fail(400, "Report filters must be text.");
    const projects = s.projects.filter(
      (p) =>
        canSee(u, p) &&
        (!q.q ||
          `${p.title} ${p.id} ${s.users.find((x) => x.id === p.ownerId)?.name}`
            .toLowerCase()
            .includes(q.q.toLowerCase())) &&
        ["type", "department", "status", "year"].every(
          (key) => !q[key] || String(p[key]) === q[key],
        ),
    );
    const cell = (value) => {
      let str = String(value ?? "");
      if (/^[\s]*[=+@\-\t\r\n]/.test(str)) str = `'${str}`;
      return `"${str.replaceAll('"', '""')}"`;
    };
    const report = choice(
      q.report || "Research Inventory",
      reportNames,
      "report",
    );
    const result = buildReport({ ...s, projects }, report, checklist);
    const rows = [result.columns, ...result.rows];
    audit(
      s,
      u,
      `Exported ${report} CSV`,
      `report:${u.id}`,
      `${projects.length} rows; ${JSON.stringify(q)}`,
    );
    save(s);
    res.set(
      "Content-Disposition",
      `attachment; filename="rdms-${report.toLowerCase().replaceAll(" ", "-")}.csv"`,
    );
    res
      .type("text/csv")
      .send("\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n"));
  });
  app.post("/api/reports/print", (req, res) => {
    const { state: s, user: u, body: b } = req;
    const report = choice(b.report, reportNames, "report");
    const filters = b.filters || {};
    if (
      typeof filters !== "object" ||
      Array.isArray(filters) ||
      Object.values(filters).some((v) => typeof v !== "string")
    )
      fail(400, "Invalid report filters.");
    audit(
      s,
      u,
      `Requested printable ${report}`,
      `report:${u.id}`,
      JSON.stringify(filters),
    );
    save(s);
    res.json({ ok: true });
  });
  app.post("/api/settings", (req, res) => {
    const { state: s, user: u, body: b } = req;
    admin(u);
    if (Object.keys(b).some((k) => !["institution", "uploadLimit"].includes(k)))
      fail(400, "Only institution and uploadLimit may be configured.");
    if (b.institution !== undefined)
      s.settings.institution = text(b.institution, "Institution", 200);
    if (b.uploadLimit !== undefined) {
      if (
        typeof b.uploadLimit !== "number" ||
        !Number.isFinite(b.uploadLimit) ||
        b.uploadLimit < 1 ||
        b.uploadLimit > 10
      )
        fail(400, "Upload limit must be 1–10 MB.");
      s.settings.uploadLimit = b.uploadLimit;
    }
    audit(s, u, "Updated safe system settings", "settings", JSON.stringify(b));
    save(s);
    res.json(s.settings);
  });
  app.post("/api/assistant", (req, res) => {
    const { state: s, user: u } = req;
    const question = text(req.body.question, "Question", 2000).toLowerCase();
    const projects = s.projects.filter((p) => canSee(u, p));
    const selected = projects.filter(
      (p) =>
        question.includes(p.id.toLowerCase()) ||
        question.includes(p.title.toLowerCase()),
    );
    const relevant = selected.length ? selected : projects;
    const ongoingProjects = relevant.filter((p) => p.status === "Ongoing");
    const revisions = ongoingProjects.reduce(
      (n, p) =>
        n +
        phaseItems(p.phase).filter((item) =>
          ["Needs Revision", "Rejected"].includes(
            p.requirements[item.id].status,
          ),
        ).length,
      0,
    );
    const pending = ongoingProjects.reduce(
      (n, p) =>
        n +
        phaseItems(p.phase).filter(
          (item) => p.requirements[item.id].status === "Pending Review",
        ).length,
      0,
    );
    const details = selected
      .map(
        (p) =>
          `${p.title}: ${p.status}, ${checklist[p.phase].name}. ${phaseItems(p.phase).filter((item) => !["Approved", "Not Applicable"].includes(p.requirements[item.id].status)).length} outstanding requirements. ${phaseItems(
            p.phase,
          )
            .filter((item) => p.requirements[item.id].feedback)
            .map((item) => `${item.label}: ${p.requirements[item.id].feedback}`)
            .join(" ")}`,
      )
      .join("\n");
    res.json({
      answer: `Advisory only — deterministic local metadata summary, not an AI verification or approval. In your authorized scope: ${relevant.length} projects, ${ongoingProjects.length} ongoing, ${pending} current-phase documents awaiting review, ${revisions} requiring correction.\n${details || "Open an authorized project and ask using its full title for its checklist summary."}\nOnly the assigned Department Head can approve documents or advance phases. No document content or external sources were analyzed.`,
    });
  });
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "API endpoint not found." }),
  );
  const dist = join(root, "dist");
  app.use(express.static(dist));
  app.get("/{*path}", (req, res) =>
    existsSync(join(dist, "index.html"))
      ? res.sendFile(join(dist, "index.html"))
      : res.status(404).json({
          error:
            "Frontend build not found. Run npm run build or use the Vite development server.",
        }),
  );
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status =
      err instanceof multer.MulterError
        ? err.code === "LIMIT_FILE_SIZE"
          ? 413
          : 400
        : err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({
      error:
        err instanceof multer.MulterError
          ? err.code === "LIMIT_FILE_SIZE"
            ? "PDF exceeds the 10 MB maximum."
            : err.message
          : status >= 500
            ? "An internal server error occurred."
            : err.message,
    });
  });
  return app;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const app = createApp();
  const port = Number(process.env.PORT || 3001);
  const server = app.listen(port, "127.0.0.1", () =>
    console.log(
      `RDMS local demo: http://localhost:${port} (demo identities; synthetic data)`,
    ),
  );
  const stop = () =>
    server.close(() => {
      app.locals.close();
      process.exit(0);
    });
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}
