import { test, expect } from "@playwright/test";
import { createApp } from "../../server/index.js";
import { syntheticPdf } from "../../server/store.js";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
let app, server, url, dir;
test.beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "rdms-ui-"));
  app = createApp({ dataDir: dir });
  server = await new Promise((r) => {
    const s = app.listen(0, "127.0.0.1", () => r(s));
  });
  url = "http://127.0.0.1:" + server.address().port;
});
test.afterAll(async () => {
  await new Promise((r) => server.close(r));
  app.locals.close();
  rmSync(dir, { recursive: true, force: true });
});
async function login(page, id) {
  await page.goto(url);
  await page.locator("#demo-user").selectOption(id);
  await page.getByRole("button", { name: "Enter demo workspace" }).click();
  await expect(
    page.getByRole("heading", {
      name: /Research overview|Your research, in focus/,
    }),
  ).toBeVisible();
}
test("director can navigate all authorized modules and sees no admin controls", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page, "director");
  await page.screenshot({
    path: ".thinkrail/context/screenshots/desktop.png",
    fullPage: true,
  });
  await expect(
    page.getByRole("button", { name: "User management", exact: true }),
  ).toHaveCount(0);
  for (const title of [
    "Pending actions",
    "Notifications",
    "Research projects",
    "Document submissions",
    "Review & approvals",
    "Research archive",
    "Faculty profiles",
    "Reports & analytics",
    "News & announcements",
    "Research assistant",
  ]) {
    await page
      .getByRole("navigation")
      .getByRole("button", { name: title, exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name:
          title === "Faculty profiles" ? "Faculty research profiles" : title,
        exact: true,
      }),
    ).toBeVisible();
  }
  await page
    .getByRole("button", { name: "Which projects need attention?" })
    .click();
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Authorized research summary" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("researcher submits corrected PDF, head reviews signed new version", async ({
  page,
}) => {
  await login(page, "researcher-1");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Research projects", exact: true })
    .click();
  await page.locator(".project-link").first().click();
  await expect(page.locator(".lifecycle")).toBeVisible();
  await page.screenshot({
    path: ".thinkrail/context/screenshots/checklist.png",
    fullPage: true,
  });
  const row = page
    .locator(".requirement")
    .filter({ hasText: "Capsule Proposal of Faculty/Researcher" });
  await expect(row.getByText("Needs Revision", { exact: true })).toBeVisible();
  await row.getByRole("button", { name: "Resubmit", exact: true }).click();
  await page.getByLabel("PDF document", { exact: true }).setInputFiles({
    name: "corrected-capsule.pdf",
    mimeType: "application/pdf",
    buffer: syntheticPdf("UI test corrected capsule"),
  });
  await page
    .getByLabel("Version / correction note", { exact: true })
    .fill("Corrected scope and objectives.");
  await page.getByRole("button", { name: "Sign & submit PDF" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(row.getByText("Pending Review", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Switch demo identity" }).click();
  await page.locator("#demo-user").selectOption("head-1");
  await page.getByRole("button", { name: "Enter demo workspace" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Review & approvals", exact: true })
    .click();
  const pending = page
    .locator("tr")
    .filter({ hasText: "corrected-capsule.pdf" });
  await pending.getByRole("button", { name: "Review PDF" }).click();
  await expect(page.locator("iframe")).toBeVisible();
  await page.getByLabel("Decision", { exact: true }).selectOption("Approved");
  await page.getByRole("button", { name: "Sign & record decision" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .locator(".tabs")
    .getByRole("button", { name: /Approved/ })
    .click();
  await expect(
    page.getByText("corrected-capsule.pdf", { exact: true }),
  ).toBeVisible();
});
test("admin approves pending account and creates safe announcement", async ({
  page,
}) => {
  await login(page, "admin");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "User management", exact: true })
    .click();
  const row = page.locator("tr").filter({ hasText: "Pending" }).first();
  await row.getByRole("button", { name: "Manage" }).click();
  await page
    .getByLabel("Account status", { exact: true })
    .selectOption("Active");
  await page.getByRole("button", { name: "Save account decision" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "News & announcements", exact: true })
    .click();
  await page.getByRole("button", { name: "Create announcement" }).click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("Prototype research forum");
  await page
    .getByLabel("Announcement content", { exact: true })
    .fill("Synthetic demo announcement for the faculty research forum.");
  await page
    .getByLabel("Publication status", { exact: true })
    .selectOption("Published");
  await page.getByRole("button", { name: "Save announcement" }).click();
  await expect(
    page.getByRole("heading", { name: "Prototype research forum" }),
  ).toBeVisible();
});
test("new project form uses department-specific programs and persists submission", async ({
  page,
}) => {
  await login(page, "admin");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Research projects", exact: true })
    .click();
  await page.getByRole("button", { name: "New research", exact: true }).click();
  await page
    .getByLabel("Research title", { exact: true })
    .fill("Interactive prototype category submission");
  const owners = await page.evaluate(async () => {
    const d = await (await fetch("/api/bootstrap")).json();
    return d.users.filter(
      (u) =>
        u.role === "Researcher" &&
        u.status === "Active" &&
        !d.projects.some((p) => p.ownerId === u.id && p.status === "Ongoing"),
    );
  });
  expect(owners.length).toBeGreaterThan(0);
  await page
    .getByLabel("College department", { exact: true })
    .selectOption(owners[0].department);
  await page
    .getByLabel("Research owner", { exact: true })
    .selectOption(owners[0].id);
  await page
    .getByLabel("Research project type", { exact: true })
    .selectOption("Equivalent Teaching Research Project (ETL)");
  await page
    .getByLabel("Research abstract", { exact: true })
    .fill(
      "A synthetic study to validate the end-to-end research project submission workflow.",
    );
  await page.getByRole("button", { name: "Create research project" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Interactive prototype category submission",
      exact: true,
    }),
  ).toBeVisible();
});
test("rejected evidence remains actionable and can be resubmitted", async ({
  page,
}) => {
  await login(page, "head-1");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Review & approvals", exact: true })
    .click();
  const row = page
    .locator("tr")
    .filter({ hasText: "Community early-warning networks" })
    .first();
  await row.getByRole("button", { name: "Review PDF" }).click();
  await page.getByLabel("Decision", { exact: true }).selectOption("Rejected");
  await page
    .getByLabel("Review feedback", { exact: true })
    .fill("Wrong attachment; submit the matching documentary evidence.");
  await page.getByRole("button", { name: "Sign & record decision" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Switch demo identity" }).click();
  await page.locator("#demo-user").selectOption("researcher-1");
  await page.getByRole("button", { name: "Enter demo workspace" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Pending actions", exact: true })
    .click();
  await expect(
    page.getByText(
      "Wrong attachment; submit the matching documentary evidence.",
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open project", exact: true })
    .first()
    .click();
  const rejected = page
    .locator(".requirement")
    .filter({ has: page.getByText("Rejected", { exact: true }) });
  await rejected.getByRole("button", { name: "Resubmit" }).click();
  await page
    .getByLabel("PDF document", { exact: true })
    .setInputFiles({
      name: "matching-evidence.pdf",
      mimeType: "application/pdf",
      buffer: syntheticPdf("Replacement evidence"),
    });
  await page.getByRole("button", { name: "Sign & submit PDF" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByText("matching-evidence.pdf", { exact: false }),
  ).toBeVisible();
});
test("mobile navigation, checklist and dialog fit a 390px viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, "researcher-1");
  await page.screenshot({
    path: ".thinkrail/context/screenshots/mobile.png",
    fullPage: true,
  });
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
  await expect(page.locator(".sidebar")).toHaveAttribute("inert", "");
  await page.getByRole("button", { name: "Open navigation" }).focus();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => {
        const r = document.activeElement.getBoundingClientRect();
        return r.x >= 0 && r.x < innerWidth;
      }),
    ).toBeTruthy();
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Research projects", exact: true })
    .click();
  await page.locator(".project-link").first().click();
  await expect(page.locator(".lifecycle")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: ".thinkrail/context/screenshots/mobile-checklist.png",
    fullPage: true,
  });
});
