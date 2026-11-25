import { DatabaseSync } from "node:sqlite";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  departments,
  programs,
  types,
  monitoring,
  phaseItems,
  emptyRequirements,
} from "../shared/catalog.js";

export const now = () => new Date().toISOString();
export const id = (prefix) => `${prefix}-${randomUUID()}`;
// A genuine one-page PDF with byte-correct cross-reference offsets, no external dependencies.
export function syntheticPdf(
  label = "Synthetic RDMS demo document - not institutional evidence",
) {
  const text = label.replace(/[^\x20-\x7e]/g, "").replace(/[()\\]/g, "\\$&");
  const stream = `BT /F1 12 Tf 40 750 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((n) => `${String(n).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf);
}

export function openStore(dataDir) {
  mkdirSync(join(dataDir, "files"), { recursive: true });
  const db = new DatabaseSync(join(dataDir, "rdms.sqlite"));
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY, ownerId TEXT NOT NULL REFERENCES users(id), json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY, projectId TEXT NOT NULL REFERENCES projects(id), json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY, recipientId TEXT NOT NULL REFERENCES users(id), json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS announcements(id TEXT PRIMARY KEY, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS audit(id TEXT PRIMARY KEY, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings(id TEXT PRIMARY KEY, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY, documentId TEXT NOT NULL REFERENCES documents(id), json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL);
    CREATE UNIQUE INDEX IF NOT EXISTS document_submission_key ON documents(json_extract(json,'$.submissionKey')) WHERE json_extract(json,'$.submissionKey') IS NOT NULL;
    CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON audit BEGIN SELECT RAISE(ABORT,'Audit is immutable'); END;
    CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON audit BEGIN SELECT RAISE(ABORT,'Audit is immutable'); END;
    CREATE TRIGGER IF NOT EXISTS review_no_update BEFORE UPDATE ON reviews BEGIN SELECT RAISE(ABORT,'Review is immutable'); END;
    CREATE TRIGGER IF NOT EXISTS review_no_delete BEFORE DELETE ON reviews BEGIN SELECT RAISE(ABORT,'Review is immutable'); END;`);
  const tables = [
    "users",
    "projects",
    "documents",
    "notifications",
    "announcements",
    "audit",
    "reviews",
  ];
  function load() {
    return Object.fromEntries([
      ...tables.map((t) => [
        t,
        db
          .prepare(`SELECT json FROM ${t} ORDER BY rowid`)
          .all()
          .map((r) => JSON.parse(r.json)),
      ]),
      [
        "settings",
        JSON.parse(
          db.prepare("SELECT json FROM settings WHERE id=?").get("main")
            ?.json || "{}",
        ),
      ],
    ]);
  }
  function save(s) {
    db.exec("BEGIN IMMEDIATE");
    try {
      for (const table of tables)
        for (const row of s[table]) {
          const refs =
            table === "projects"
              ? ["ownerId"]
              : table === "documents"
                ? ["projectId"]
                : table === "notifications"
                  ? ["recipientId"]
                  : table === "reviews"
                    ? ["documentId"]
                    : [];
          const columns = ["id", ...refs, "json"];
          const conflict = ["audit", "reviews"].includes(table)
            ? "DO NOTHING"
            : `DO UPDATE SET ${[...refs, "json"].map((c) => `${c}=excluded.${c}`).join(",")}`;
          db.prepare(
            `INSERT INTO ${table}(${columns.join(",")}) VALUES(${columns.map(() => "?").join(",")}) ON CONFLICT(id) ${conflict}`,
          ).run(row.id, ...refs.map((r) => row[r]), JSON.stringify(row));
        }
      db.prepare(
        "INSERT INTO settings(id,json) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET json=excluded.json",
      ).run("main", JSON.stringify(s.settings));
      db.exec("COMMIT");
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  }
  if (!db.prepare("SELECT id FROM users LIMIT 1").get()) save(seed(dataDir));
  return { db, load, save, close: () => db.close() };
}

function seed(dataDir) {
  const createdAt = now();
  const users = [
    {
      id: "admin",
      name: "Alex Rivera",
      role: "Super Admin",
      department: departments[0],
    },
    {
      id: "director",
      name: "Morgan Santos",
      role: "Research Director",
      department: departments[0],
    },
    ...departments.map((department, i) => ({
      id: `head-${i + 1}`,
      name: [
        "Elena Cruz",
        "Rafael Lim",
        "Isabel Tan",
        "Gabriel Reyes",
        "Sofia Ramos",
        "Daniel Flores",
        "Lucia Garcia",
      ][i],
      role: "Department Head",
      department,
    })),
    ...Array.from({ length: 14 }, (_, i) => ({
      id: `researcher-${i + 1}`,
      name: [
        "Maya Dela Cruz",
        "Luis Navarro",
        "Nina Torres",
        "Paolo Mendoza",
        "Clara Aquino",
        "Marco Diaz",
        "Ana Castillo",
        "Leo Valdez",
        "Iris Salazar",
        "Noel Mercado",
        "Rose Villanueva",
        "Jules Bautista",
        "Lara Santiago",
        "Ben Romero",
      ][i],
      role: "Researcher",
      department: departments[i % 7],
    })),
    {
      id: "researcher-15",
      name: "Tessa Manalo",
      role: "Researcher",
      department: departments[0],
    },
    {
      id: "researcher-16",
      name: "Adrian Velasco",
      role: "Researcher",
      department: departments[1],
    },
    {
      id: "pending",
      name: "Sam Perez",
      role: "Researcher",
      department: departments[0],
      status: "Pending",
    },
  ].map((u) => ({
    ...u,
    email: `${u.id}@demo.example`,
    status: u.status || "Active",
  }));
  const s = {
    users,
    projects: [],
    documents: [],
    notifications: [],
    announcements: [],
    audit: [],
    reviews: [],
    settings: {
      institution: "Bukidnon State University · RDU",
      uploadLimit: 10,
      monitoring,
      demo: true,
      synthetic: true,
      personallyFundedChecklist:
        "Provisional — shares supplied standard checklist pending official configuration.",
      google: "Not configured — demo sessions only",
      email: "Not configured — in-app notifications only",
      branding: "Provisional; official assets not supplied",
    },
  };
  const titles = [
    "Community early-warning networks",
    "Simulation in nursing education",
    "Reading pathways in rural classrooms",
    "Watershed biodiversity mapping",
    "Digital livelihoods and microenterprises",
    "Participatory local governance",
    "Primary care referral pathways",
    "Accessible campus navigation",
    "Clinical mentoring outcomes",
    "Inclusive classroom assessment",
    "Indigenous language documentation",
    "Financial resilience of cooperatives",
    "Public service delivery mapping",
    "Preventive health outreach",
    "Renewable energy learning kits",
    "Student wellbeing and belonging",
    "Learning through community archives",
    "Climate-smart campus practices",
    "Women-led enterprise networks",
    "Open research data literacy",
  ];
  for (let i = 0; i < 20; i++) {
    const owner = users.find((u) => u.id === `researcher-${(i % 14) + 1}`);
    const phase = i < 14 ? i % 3 : 2;
    const p = {
      id: `project-${i + 1}`,
      title: titles[i],
      type: types[i % 5],
      ownerId: owner.id,
      department: owner.department,
      program: programs.find((x) => x.department === owner.department).name,
      abstract:
        "Synthetic demonstration research record for exploring the RDMS workflow. Not an actual institutional study.",
      year: 2026 - (i % 3),
      phase,
      status: i < 14 ? "Ongoing" : i < 17 ? "Completed" : "Archived",
      createdAt,
      requirements: emptyRequirements(),
      synthetic: true,
    };
    s.projects.push(p);
    for (let ph = 0; ph <= phase; ph++)
      for (const [j, item] of phaseItems(ph).entries()) {
        const complete = ph < phase || p.status !== "Ongoing";
        if (complete && item.conditional) {
          p.requirements[item.id] = {
            status: "Not Applicable",
            feedback:
              "Synthetic demo applicability decision: not required for this sample study.",
            versions: [],
          };
          continue;
        }
        if (!complete && j > 2) continue;
        const status = complete
          ? "Approved"
          : i === 0 && j === 1
            ? "Needs Revision"
            : j === 0
              ? "Approved"
              : "Pending Review";
        const doc = {
          id: `seed-doc-${i + 1}-${item.id}`,
          projectId: p.id,
          requirementId: item.id,
          name: `Synthetic - ${item.label.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 65)}.pdf`,
          version: 1,
          status,
          uploaderName: owner.name,
          reason: "Synthetic demo evidence",
          signature: `${owner.name} (demo)`,
          createdAt,
          feedback:
            status === "Needs Revision"
              ? "Please clarify the objectives and align the proposed methodology before resubmission."
              : "",
          staffUpload: false,
          synthetic: true,
        };
        if (["Approved", "Needs Revision"].includes(status)) {
          doc.review = {
            decision: status,
            feedback: doc.feedback,
            signature: "Synthetic department head",
            createdAt,
          };
          s.reviews.push({
            id: `seed-review-${doc.id}`,
            documentId: doc.id,
            ...doc.review,
          });
        }
        s.documents.push(doc);
        writeFileSync(join(dataDir, "files", `${doc.id}.pdf`), syntheticPdf());
        p.requirements[item.id] = {
          status,
          feedback: doc.feedback,
          versions: [doc.id],
        };
        if (status === "Pending Review")
          s.notifications.push({
            id: id("notice"),
            recipientId: `head-${departments.indexOf(owner.department) + 1}`,
            title: "Submission awaiting review",
            body: `${p.title}: ${item.label}`,
            projectId: p.id,
            documentId: doc.id,
            read: false,
            createdAt,
            type: "Review",
            priority: "High",
            resolved: false,
          });
        if (status === "Needs Revision")
          s.notifications.push({
            id: id("notice"),
            recipientId: owner.id,
            title: "Revision requested",
            body: doc.feedback,
            projectId: p.id,
            documentId: doc.id,
            read: false,
            createdAt,
            type: "Revision",
            priority: "High",
            resolved: false,
          });
      }
  }
  s.notifications.push({
    id: id("notice"),
    recipientId: "admin",
    title: "Pending demo account",
    body: "Sam Perez is awaiting account approval.",
    read: false,
    createdAt,
    type: "Account",
    priority: "High",
    resolved: false,
    userId: "pending",
  });
  s.announcements.push(
    {
      id: "announcement-1",
      title: "Research proposal clinic",
      body: "Synthetic demo announcement: bring your capsule proposal and questions to the research development clinic.",
      category: "Events",
      status: "Published",
      department: "All",
      author: "Morgan Santos",
      authorId: "director",
      createdAt,
      deadline: "2026-12-15",
    },
    {
      id: "announcement-2",
      title: "Call for interdisciplinary research",
      body: "Synthetic demo call for proposals across departments. Dates and opportunities are illustrative only.",
      category: "Call for Papers",
      status: "Published",
      department: "All",
      author: "Morgan Santos",
      authorId: "director",
      createdAt,
      deadline: "2026-12-30",
    },
  );
  s.audit.push({
    id: id("audit"),
    actor: "System",
    action: "Seeded synthetic demonstration records",
    entity: "demo",
    reason: "All people, projects and evidence are synthetic.",
    createdAt,
  });
  return s;
}
