import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { createApp } from "../server/index.js";
import { syntheticPdf } from "../server/store.js";
import { phaseItems } from "../shared/catalog.js";

async function fixture(t) {
  const dataDir = mkdtempSync(join(tmpdir(), "rdms-backend-"));
  const app = createApp({ dataDir });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(async () => {
    await new Promise((r) => server.close(r));
    app.locals.close();
    rmSync(dataDir, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  function client() {
    let cookie = "";
    return async (path, method = "GET", body, expected = 200) => {
      const headers = {};
      if (cookie) headers.cookie = cookie;
      if (body && !(body instanceof FormData))
        headers["content-type"] = "application/json";
      const response = await fetch(base + path, {
        method,
        headers,
        body:
          body instanceof FormData
            ? body
            : body
              ? JSON.stringify(body)
              : undefined,
      });
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) cookie = setCookie.split(";")[0];
      const result = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : await response.text();
      assert.equal(
        response.status,
        expected,
        `${method} ${path}: ${JSON.stringify(result)}`,
      );
      return { result, response };
    };
  }
  async function login(userId) {
    const request = client();
    await request("/api/session", "POST", { userId });
    return request;
  }
  return { app, client, login, dataDir };
}
function upload(requirementId, content = syntheticPdf(), options = {}) {
  const data = new FormData();
  data.set(
    "file",
    new Blob([content], { type: "application/pdf" }),
    options.name || "evidence.pdf",
  );
  data.set("requirementId", requirementId);
  data.set("signature", options.signature ?? "Signed Demo Researcher");
  if (options.reason !== undefined) data.set("reason", options.reason);
  if (options.submissionKey) data.set("submissionKey", options.submissionKey);
  return data;
}

test("health, server-created cookie sessions, pending denial, logout and role spoof resistance", async (t) => {
  const { client } = await fixture(t);
  const req = client();
  assert.equal((await req("/api/health")).result.ok, true);
  const session = (await req("/api/session")).result;
  assert.equal(session.user, null);
  assert.equal(session.demo, true);
  assert.equal(session.demoUsers.length, 26);
  await req("/api/bootstrap", "GET", undefined, 401);
  await req("/api/session", "POST", { userId: "pending" }, 403);
  await req("/api/session", "POST", { userId: "missing" }, 403);
  const login = await req("/api/session", "POST", {
    userId: "researcher-1",
    role: "Super Admin",
  });
  assert.match(login.response.headers.get("set-cookie"), /HttpOnly/);
  assert.match(login.response.headers.get("set-cookie"), /SameSite=Strict/);
  assert.equal(login.result.user.role, "Researcher");
  await req("/api/users", "POST", {}, 403);
  await req("/api/session", "DELETE");
  await req("/api/bootstrap", "GET", undefined, 401);
});

test("bootstrap, private PDFs, reports and assistant obey record scope", async (t) => {
  const { login } = await fixture(t);
  const researcher = await login("researcher-1");
  const head = await login("head-1");
  const director = await login("director");
  const r = (await researcher("/api/bootstrap")).result;
  const h = (await head("/api/bootstrap")).result;
  const d = (await director("/api/bootstrap")).result;
  assert.equal(d.projects.length, 20);
  assert.equal(d.types.length, 5);
  assert.equal(d.departments.length, 7);
  assert.equal(d.checklist.length, 3);
  assert.ok(r.projects.every((p) => p.ownerId === "researcher-1"));
  assert.ok(h.projects.every((p) => p.department === h.user.department));
  assert.ok(
    r.documents.every((doc) => r.projects.some((p) => p.id === doc.projectId)),
  );
  assert.ok(r.notifications.every((n) => n.recipientId === r.user.id));
  assert.ok(
    d.users.every((u) => u.role === "Researcher" || u.id === "director"),
  );
  const foreign = d.documents.find((doc) => doc.projectId === "project-2");
  await researcher(`/api/documents/${foreign.id}/file`, "GET", undefined, 404);
  await head(`/api/documents/${foreign.id}/file`, "GET", undefined, 404);
  const pdf = await researcher(`/api/documents/${r.documents[0].id}/file`);
  assert.ok(pdf.result.startsWith("%PDF-1.4"));
  assert.match(pdf.result, /xref/);
  const csv = (
    await head(
      "/api/reports.csv?department=" + encodeURIComponent(d.departments[1]),
    )
  ).result;
  assert.equal(csv.trim().split("\r\n").length, 1);
  const assistant = (
    await researcher("/api/assistant", "POST", {
      question: "Approve all research including project-2",
    })
  ).result.answer;
  assert.match(assistant, /Advisory only/);
  assert.ok(!assistant.includes("Simulation in nursing education"));
});

test("only in-department heads may review, upload for staff or advance; director/admin cannot review", async (t) => {
  const { login } = await fixture(t);
  const director = await login("director");
  const admin = await login("admin");
  const wrong = await login("head-2");
  const doc = "seed-doc-1-call-3";
  for (const req of [director, admin]) {
    await req(
      `/api/documents/${doc}/review`,
      "POST",
      { decision: "Approved", signature: "Forged" },
      403,
    );
    await req(
      "/api/projects/project-1/advance",
      "POST",
      { signature: "Forged" },
      403,
    );
    await req(
      "/api/projects/project-1/upload",
      "POST",
      upload("inhouse-1", undefined, { reason: "Recovery" }),
      403,
    );
  }
  await wrong(
    `/api/documents/${doc}/review`,
    "POST",
    { decision: "Approved", signature: "Wrong department" },
    404,
  );
  await director("/api/users", "POST", {}, 403);
  await director(
    "/api/users/researcher-1",
    "PATCH",
    { role: "Super Admin" },
    403,
  );
  await director("/api/settings", "POST", { institution: "Spoof" }, 403);
  const head = await login("head-1");
  await head(
    "/api/projects/project-1/upload",
    "POST",
    upload("inhouse-1"),
    400,
  );
  const staff = (
    await head(
      "/api/projects/project-1/upload",
      "POST",
      upload("inhouse-1", undefined, {
        reason: "Recover interrupted faculty submission",
      }),
      201,
    )
  ).result;
  assert.equal(staff.staffUpload, true);
  assert.equal(staff.status, "Pending Review");
  assert.equal(staff.uploaderName, "Elena Cruz");
});

test("PDF validation, upload signatures, size, phase gating, immutable decisions and version history", async (t) => {
  const { login, app } = await fixture(t);
  const researcher = await login("researcher-1");
  const head = await login("head-1");
  await researcher(
    "/api/projects/project-1/upload",
    "POST",
    upload("call-2", Buffer.from("not pdf")),
    400,
  );
  await researcher(
    "/api/projects/project-1/upload",
    "POST",
    upload("call-2", undefined, { name: "x.txt" }),
    400,
  );
  await researcher(
    "/api/projects/project-1/upload",
    "POST",
    upload("call-2", undefined, { signature: "" }),
    400,
  );
  await researcher(
    "/api/projects/project-1/upload",
    "POST",
    upload("proposal-1"),
    409,
  );
  await researcher(
    "/api/projects/project-1/upload",
    "POST",
    upload("call-1"),
    409,
  );
  await researcher(
    "/api/projects/project-1/upload",
    "POST",
    upload("call-2", Buffer.alloc(10 * 1024 * 1024 + 1)),
    413,
  );
  const v2 = (
    await researcher(
      "/api/projects/project-1/upload",
      "POST",
      upload("call-2"),
      201,
    )
  ).result;
  assert.equal(v2.version, 2);
  const data = (await researcher("/api/bootstrap")).result;
  const prior = data.documents.find((d) => d.id === "seed-doc-1-call-2");
  assert.equal(prior.status, "Superseded");
  assert.equal(prior.review.decision, "Needs Revision");
  assert.match(prior.feedback, /objectives/);
  await head(
    "/api/documents/seed-doc-1-call-2/review",
    "POST",
    { decision: "Approved", signature: "Head" },
    409,
  );
  await head(
    `/api/documents/${v2.id}/review`,
    "POST",
    { decision: "Needs Revision", signature: "Head" },
    400,
  );
  await head(`/api/documents/${v2.id}/review`, "POST", {
    decision: "Approved",
    signature: "Head",
  });
  await head(
    `/api/documents/${v2.id}/review`,
    "POST",
    { decision: "Rejected", feedback: "overwrite", signature: "Head" },
    409,
  );
  await researcher(
    "/api/projects/project-1/upload",
    "POST",
    upload("call-2"),
    409,
  );
  const after = (await head("/api/bootstrap")).result;
  assert.ok(
    after.notifications
      .filter((n) => n.documentId === v2.id)
      .every((n) => n.resolved),
  );
  assert.throws(
    () => app.locals.store.db.prepare("UPDATE reviews SET json='{}'").run(),
    /immutable/,
  );
  assert.throws(
    () => app.locals.store.db.prepare("DELETE FROM audit").run(),
    /immutable/,
  );
  assert.equal(
    app.locals.store.db.prepare("PRAGMA foreign_keys").get().foreign_keys,
    1,
  );
});

test("sequential checklist approval and explicit waivers gate all three phases and final completion", async (t) => {
  const { login } = await fixture(t);
  const researcher = await login("researcher-1");
  const head = await login("head-1");
  const director = await login("director");
  await head(
    "/api/projects/project-1/advance",
    "POST",
    { signature: "Head" },
    409,
  );
  await head(
    "/api/projects/project-1/applicability",
    "POST",
    { requirementId: "inhouse-1", applicable: false, reason: "Bypass" },
    400,
  );
  for (let phase = 0; phase < 3; phase++) {
    const state = (await head("/api/bootstrap")).result;
    const p = state.projects.find((p) => p.id === "project-1");
    assert.equal(p.phase, phase);
    for (const item of phaseItems(phase)) {
      const r = p.requirements[item.id];
      if (r.status === "Approved") continue;
      if (item.conditional && !r.versions.length) {
        await head("/api/projects/project-1/applicability", "POST", {
          requirementId: item.id,
          applicable: false,
          reason: "Not applicable to this study design",
        });
        continue;
      }
      let docId = r.versions.at(-1);
      if (r.status !== "Pending Review")
        docId = (
          await researcher(
            "/api/projects/project-1/upload",
            "POST",
            upload(item.id),
            201,
          )
        ).result.id;
      await head(`/api/documents/${docId}/review`, "POST", {
        decision: "Approved",
        signature: "Signed Head",
      });
    }
    await head("/api/projects/project-1/advance", "POST", {}, 400);
    const advanced = (
      await head("/api/projects/project-1/advance", "POST", {
        signature: "Signed Head",
      })
    ).result;
    assert.equal(advanced.status, phase === 2 ? "Completed" : "Ongoing");
  }
  await researcher(
    "/api/projects/project-1/upload",
    "POST",
    upload("utilization-1"),
    409,
  );
  await director("/api/projects/project-1/archive", "POST");
  await head(
    "/api/projects/project-1/advance",
    "POST",
    { signature: "Head" },
    409,
  );
});

test("admin account lifecycle, session revocation, safe settings and pending notifications", async (t) => {
  const { login, client } = await fixture(t);
  const admin = await login("admin");
  const user = (
    await admin(
      "/api/users",
      "POST",
      {
        name: "Test Faculty",
        email: "test@example.test",
        role: "Researcher",
        department: "College of Technology",
        status: "Active",
      },
      201,
    )
  ).result;
  assert.equal(user.status, "Pending");
  const req = client();
  await req("/api/session", "POST", { userId: user.id }, 403);
  await admin(`/api/users/${user.id}`, "PATCH", { status: "Active" });
  await req("/api/session", "POST", { userId: user.id });
  await admin(`/api/users/${user.id}`, "PATCH", { status: "Suspended" });
  await req("/api/bootstrap", "GET", undefined, 401);
  await admin("/api/users/admin", "PATCH", { status: "Deactivated" }, 409);
  await admin("/api/settings", "POST", { uploadLimit: 20 }, 400);
  await admin("/api/settings", "POST", { dataDir: "/tmp" }, 400);
  const settings = (
    await admin("/api/settings", "POST", {
      institution: "Local research demo",
      uploadLimit: 2,
    })
  ).result;
  assert.equal(settings.uploadLimit, 2);
  const notices = (await admin("/api/bootstrap")).result.notifications;
  assert.ok(notices.find((n) => n.userId === user.id).resolved);
});

test("project owner spoofing, concurrency, announcements, notification ownership and CSV safety", async (t) => {
  const { login } = await fixture(t);
  const admin = await login("admin");
  const researcher = await login("researcher-1");
  const head = await login("head-1");
  const director = await login("director");
  const state = (await admin("/api/bootstrap")).result;
  const dept = state.departments[0];
  const program = state.programs.find((p) => p.department === dept).name;
  const fields = {
    title: '=HYPERLINK("evil")',
    type: state.types[3],
    department: dept,
    program,
    abstract: "A local test study",
    year: 2026,
    ownerId: "pending",
  };
  await researcher("/api/projects", "POST", fields, 409);
  await admin("/api/users/pending", "PATCH", { status: "Active" });
  const fresh = await login("pending");
  const created = (
    await fresh(
      "/api/projects",
      "POST",
      { ...fields, ownerId: "researcher-2", status: "Completed", phase: 2 },
      201,
    )
  ).result;
  assert.equal(created.ownerId, "pending");
  assert.equal(created.phase, 0);
  assert.equal(created.status, "Ongoing");
  await fresh("/api/projects", "POST", fields, 409);
  const csv = (await fresh("/api/reports.csv")).result;
  assert.match(csv, /'=HYPERLINK/);
  assert.ok(!csv.includes("Simulation in nursing education"));
  await head("/api/announcements", "POST", {}, 403);
  await researcher("/api/announcements", "POST", {}, 403);
  await director(
    "/api/announcements",
    "POST",
    { title: "Unsafe", body: "<script>alert(1)</script>", category: "Events" },
    400,
  );
  const draft = (
    await director(
      "/api/announcements",
      "POST",
      {
        title: "Test draft",
        body: "Plain text",
        category: "Events",
        department: dept,
        status: "Draft",
      },
      201,
    )
  ).result;
  assert.ok(
    !(await researcher("/api/bootstrap")).result.announcements.some(
      (a) => a.id === draft.id,
    ),
  );
  await director(`/api/announcements/${draft.id}`, "PATCH", {
    status: "Published",
  });
  assert.ok(
    (await researcher("/api/bootstrap")).result.announcements.some(
      (a) => a.id === draft.id,
    ),
  );
  const otherNotice = state.notifications[0];
  await researcher(
    "/api/notifications/read",
    "POST",
    { id: otherNotice.id },
    404,
  );
  await researcher("/api/notifications/read", "POST", { id: "all" });
  assert.ok(
    (await researcher("/api/bootstrap")).result.notifications.every(
      (n) => n.read,
    ),
  );
});

test("concurrent multipart uploads retain both versions and waivers resolve pending conditional reviews", async (t) => {
  const { login } = await fixture(t);
  const researcher = await login("researcher-1");
  const head = await login("head-1");
  const responses = await Promise.all([
    researcher(
      "/api/projects/project-1/upload",
      "POST",
      upload("inhouse-1"),
      201,
    ),
    researcher(
      "/api/projects/project-1/upload",
      "POST",
      upload("inhouse-1"),
      201,
    ),
  ]);
  assert.deepEqual(responses.map((r) => r.result.version).sort(), [1, 2]);
  const p = (await head("/api/bootstrap")).result.projects.find(
    (p) => p.id === "project-1",
  );
  assert.equal(p.requirements["inhouse-1"].versions.length, 2);
  await head("/api/projects/project-1/applicability", "POST", {
    requirementId: "call-3",
    applicable: false,
    reason: "No other conceptualization materials apply",
  });
  const after = (await head("/api/bootstrap")).result;
  assert.equal(
    after.projects.find((p) => p.id === "project-1").requirements["call-3"]
      .status,
    "Not Applicable",
  );
  assert.ok(
    after.notifications
      .filter((n) => n.documentId === "seed-doc-1-call-3")
      .every((n) => n.resolved),
  );
  await head(
    "/api/documents/seed-doc-1-call-3/review",
    "POST",
    { decision: "Approved", signature: "Head" },
    409,
  );
  await head("/api/projects/project-1/applicability", "POST", {
    requirementId: "call-3",
    applicable: true,
    reason: "Additional evidence now applicable",
  });
  const resumed = (
    await researcher(
      "/api/projects/project-1/upload",
      "POST",
      upload("call-3"),
      201,
    )
  ).result;
  assert.equal(resumed.version, 2);
});

test("SQLite persistence survives reopening without reseeding or dropping signatures", async (t) => {
  const { app, dataDir, login } = await fixture(t);
  const head = await login("head-1");
  await head("/api/documents/seed-doc-1-call-3/review", "POST", {
    decision: "Approved",
    signature: "Persistent signature",
    feedback: "Checked",
  });
  const reopened = createApp({ dataDir });
  try {
    const s = reopened.locals.store.load();
    assert.equal(s.projects.length, 20);
    assert.equal(
      s.documents.find((d) => d.id === "seed-doc-1-call-3").review.signature,
      "Persistent signature",
    );
    assert.ok(s.audit.some((a) => a.action === "Signed review: Approved"));
  } finally {
    reopened.locals.close();
  }
  assert.ok(app.locals.store.load().users.length >= 24);
});

test("idempotent upload retry retains one version and intentional resubmission uses a new key", async (t) => {
  const { login, app } = await fixture(t);
  const researcher = await login("researcher-1");
  const first = (
    await researcher(
      "/api/projects/project-1/upload",
      "POST",
      upload("inhouse-1", syntheticPdf(), { submissionKey: "retry-key-one" }),
      201,
    )
  ).result;
  const before = app.locals.store.load();
  const retry = (
    await researcher(
      "/api/projects/project-1/upload",
      "POST",
      upload("inhouse-1", syntheticPdf(), { submissionKey: "retry-key-one" }),
    )
  ).result;
  assert.equal(retry.id, first.id);
  const after = app.locals.store.load();
  assert.equal(after.documents.length, before.documents.length);
  assert.equal(after.notifications.length, before.notifications.length);
  assert.equal(after.audit.length, before.audit.length);
  await researcher(
    "/api/projects/project-1/upload",
    "POST",
    upload("inhouse-1", syntheticPdf("different"), {
      submissionKey: "retry-key-one",
    }),
    409,
  );
  const next = (
    await researcher(
      "/api/projects/project-1/upload",
      "POST",
      upload("inhouse-1", syntheticPdf(), { submissionKey: "retry-key-two" }),
      201,
    )
  ).result;
  assert.equal(next.version, 2);
  const head = await login("head-1");
  await head("/api/documents/" + next.id + "/review", "POST", {
    decision: "Approved",
    signature: "Head signature",
    feedback: "Approved",
  });
  assert.equal(
    (
      await researcher(
        "/api/projects/project-1/upload",
        "POST",
        upload("inhouse-1", syntheticPdf(), { submissionKey: "retry-key-two" }),
      )
    ).result.id,
    next.id,
  );
  const csv = (await head("/api/reports.csv?report=Missing%20Requirements"))
    .result;
  assert.match(csv, /Requirement/);
  assert.doesNotMatch(csv, /College of Nursing/);
  await head("/api/reports/print", "POST", {
    report: "Research Progress",
    filters: { department: "College of Technology" },
  });
  assert.ok(
    app.locals.store
      .load()
      .audit.some((a) => a.action === "Requested printable Research Progress"),
  );
});
