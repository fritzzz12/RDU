import { test } from "node:test";
import assert from "node:assert/strict";
import { buildReport, reportNames } from "../shared/reporting.js";
import { checklist, emptyRequirements } from "../shared/catalog.js";
const p = {
  id: "a",
  title: "Research A",
  ownerId: "u",
  type: "Agenda Based Research Project",
  department: "College of Technology",
  program: "BS Information Technology",
  year: 2026,
  phase: 0,
  status: "Ongoing",
  requirements: emptyRequirements(),
  synthetic: true,
};
p.requirements["call-1"].status = "Approved";
const data = {
  projects: [p, { ...p, id: "b", title: "Completed B", status: "Completed" }],
  documents: [
    {
      id: "d",
      projectId: "a",
      name: "demo.pdf",
      version: 1,
      status: "Pending Review",
      uploaderName: "Researcher",
      createdAt: "2026-11-01",
    },
  ],
  users: [{ id: "u", name: "Researcher" }],
  audit: [
    {
      entity: "a",
      actor: "Head",
      action: "Review",
      reason: "Signed",
      createdAt: "2026-11-01",
    },
    { entity: "unauthorized", action: "Private" },
  ],
};
test("every report has matching columns and rows", () => {
  for (const report of reportNames) {
    const result = buildReport(data, report, checklist);
    assert.ok(result.columns.length > 0, report);
    for (const row of result.rows)
      assert.equal(row.length, result.columns.length, report);
  }
});
test("specialized reports derive status, compliance, and department aggregation", () => {
  assert.equal(
    buildReport(data, "Completed Research", checklist).rows.length,
    1,
  );
  assert.equal(buildReport(data, "Ongoing Research", checklist).rows.length, 1);
  assert.equal(buildReport(data, "Research Archive", checklist).rows.length, 0);
  assert.equal(
    buildReport(data, "Pending Submissions", checklist).rows[0][0],
    "demo.pdf",
  );
  assert.equal(
    buildReport(data, "Missing Requirements", checklist).rows.length,
    6,
  );
  assert.equal(
    buildReport(data, "Department Performance", checklist).rows[0][5],
    "50%",
  );
  assert.equal(
    buildReport(data, "Research Compliance", checklist).rows[0][9],
    "14%",
  );
  assert.equal(
    buildReport(data, "Research Activity", checklist).rows.length,
    1,
  );
});
