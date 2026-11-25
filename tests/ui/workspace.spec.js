import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createApp } from "../../server/index.js";
import { syntheticPdf } from "../../server/store.js";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { types, checklist } from "../../shared/catalog.js";
let app, server, url, dir;
test.beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "rdms-ui-"));
  app = createApp({ dataDir: dir });
  server = await new Promise((r) => {
    const s = app.listen(0, "127.0.0.1", () => r(s));
  });
  url = "http://127.0.0.1:" + server.address().port;
});
test.afterEach(async () => {
  await new Promise((r) => server.close(r));
  app.locals.close();
  rmSync(dir, { recursive: true, force: true });
});
async function login(page, id) {
  await page.goto(url);
  await page.locator("#demo-user").selectOption(id);
  await page.getByRole("button", { name: "Open practice workspace" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Home",
      exact: true,
    }),
  ).toBeVisible();
}
// Observe real browser traffic: reaching review must never mutate API state.
const isMutation = (request) =>
  new URL(request.url()).pathname.startsWith("/api/") &&
  !["GET", "HEAD", "OPTIONS"].includes(request.method());
async function reviewAndConfirm(page, label) {
  const mutations = [];
  const record = (request) => {
    if (isMutation(request)) mutations.push(request.url());
  };
  page.on("request", record);
  try {
    await page
      .getByRole("button", { name: "Review before saving", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Check before saving", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: label, exact: true }),
    ).toBeVisible();
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve)),
    );
    expect(mutations, "Review must not send a mutation").toEqual([]);
    await Promise.all([
      page.waitForRequest(isMutation),
      page.getByRole("button", { name: label, exact: true }).click(),
    ]);
  } finally {
    page.off("request", record);
  }
}
test("director can navigate all authorized modules and sees no admin controls", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page, "director");
  await page.screenshot({
    path: ".thinkrail/context/screenshots/accessible-desktop.png",
    fullPage: true,
  });
  await expect(
    page.getByRole("button", { name: "Manage accounts", exact: true }),
  ).toHaveCount(0);
  for (const title of [
    "Things to do",
    "Messages",
    "Research projects",
    "Submitted documents",
    "Review documents",
    "Completed research",
    "Faculty members",
    "Reports",
    "News and opportunities",
    "Research help",
  ]) {
    await page
      .getByRole("navigation")
      .getByRole("button", { name: title, exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: title,
        exact: true,
      }),
    ).toBeVisible();
  }
  await page
    .getByRole("button", { name: "Which projects need attention?" })
    .click();
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your research summary" }),
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
    path: ".thinkrail/context/screenshots/accessible-checklist.png",
    fullPage: true,
  });
  const row = page
    .locator(".requirement")
    .filter({ hasText: "Capsule Proposal of Faculty/Researcher" });
  await expect(row.getByText("Changes needed", { exact: true })).toBeVisible();
  await row
    .getByRole("button", { name: "Upload a new version", exact: true })
    .click();
  await page.getByLabel("PDF document", { exact: false }).setInputFiles({
    name: "corrected-capsule.pdf",
    mimeType: "application/pdf",
    buffer: syntheticPdf("UI test corrected capsule"),
  });
  await page
    .getByLabel("Version / correction note", { exact: false })
    .fill("Corrected scope and objectives.");
  await reviewAndConfirm(page, "Confirm and submit document");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    row.getByText("Waiting for review", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch account" }).click();
  await page.locator("#demo-user").selectOption("head-1");
  await page.getByRole("button", { name: "Open practice workspace" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Review documents", exact: true })
    .click();
  const pending = page
    .locator("tr")
    .filter({ hasText: "corrected-capsule.pdf" });
  await pending.getByRole("button", { name: "Review PDF" }).click();
  await expect(page.locator("iframe")).toBeVisible();
  await page.getByLabel(/^Decision /).selectOption("Approved");
  await reviewAndConfirm(page, "Confirm and save decision");
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
    .getByRole("button", { name: "Manage accounts", exact: true })
    .click();
  const row = page
    .locator("tr")
    .filter({ hasText: "Waiting for approval" })
    .first();
  await row.getByRole("button", { name: "Manage account" }).click();
  await page
    .getByLabel("Account status", { exact: false })
    .selectOption("Active");
  await reviewAndConfirm(page, "Confirm account changes");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "News and opportunities", exact: true })
    .click();
  await page.getByRole("button", { name: "Create announcement" }).click();
  await page
    .getByLabel("Title", { exact: false })
    .fill("Prototype research forum");
  await page
    .getByLabel("Announcement content", { exact: false })
    .fill("Synthetic demo announcement for the faculty research forum.");
  await page
    .getByLabel("Publication status", { exact: false })
    .selectOption("Published");
  await reviewAndConfirm(page, "Confirm and save announcement");
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
  await page
    .getByRole("button", { name: "Add a research project", exact: true })
    .click();
  await expect(
    page.getByLabel("Research project type").locator("option"),
  ).toHaveText(types);
  for (const type of types) {
    await page.getByLabel("Research project type").selectOption(type);
    await expect(page.getByLabel("Research project type")).toHaveValue(type);
  }
  await page
    .getByLabel("Research title", { exact: false })
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
    .getByLabel("College department", { exact: false })
    .selectOption(owners[0].department);
  const bootstrap = await (
    await page.request.get(url + "/api/bootstrap")
  ).json();
  await expect(
    page.getByLabel("Academic program").locator("option"),
  ).toHaveText(
    bootstrap.programs
      .filter((program) => program.department === owners[0].department)
      .map((program) => program.name),
  );
  await page
    .getByLabel("Research owner", { exact: false })
    .selectOption(owners[0].id);
  await page
    .getByLabel("Research project type", { exact: false })
    .selectOption("Equivalent Teaching Research Project (ETL)");
  await page
    .getByLabel("Research abstract", { exact: false })
    .fill(
      "A synthetic study to validate the end-to-end research project submission workflow.",
    );
  await reviewAndConfirm(page, "Confirm and create project");
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
    .getByRole("button", { name: "Review documents", exact: true })
    .click();
  const row = page
    .locator("tr")
    .filter({ hasText: "Community early-warning networks" })
    .first();
  await row.getByRole("button", { name: "Review PDF" }).click();
  await page.getByLabel(/^Decision /).selectOption("Rejected");
  await page
    .getByLabel("Review feedback", { exact: false })
    .fill("Wrong attachment; submit the matching documentary evidence.");
  await reviewAndConfirm(page, "Confirm and save decision");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Switch account" }).click();
  await page.locator("#demo-user").selectOption("researcher-1");
  await page.getByRole("button", { name: "Open practice workspace" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Things to do", exact: true })
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
    .filter({ has: page.getByText("Not accepted", { exact: true }) });
  await rejected.getByRole("button", { name: "Upload a new version" }).click();
  await page.getByLabel("PDF document", { exact: false }).setInputFiles({
    name: "matching-evidence.pdf",
    mimeType: "application/pdf",
    buffer: syntheticPdf("Replacement evidence"),
  });
  await reviewAndConfirm(page, "Confirm and submit document");
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
    path: ".thinkrail/context/screenshots/accessible-mobile.png",
    fullPage: true,
  });
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await expect(page.locator(".sidebar")).toHaveAttribute("inert", "");
  await page.getByRole("button", { name: "Open menu" }).focus();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => {
        const r = document.activeElement.getBoundingClientRect();
        return r.x >= 0 && r.x < innerWidth;
      }),
    ).toBeTruthy();
  }
  await page.getByRole("button", { name: "Open menu" }).click();
  await expectFocusContained(page, page.locator(".sidebar"));
  await expect(page.locator("main").locator("..")).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await page.getByRole("button", { name: "Open menu" }).click();
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
  await assertReadableReflow(page);
});

async function navigate(page, title) {
  const menu = page.getByRole("button", { name: "Open menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: title, exact: true })
    .click();
  await expect(page.locator("main h1.page-title-focus")).toHaveText(title);
}

async function assertReadableReflow(page) {
  const issues = await page.evaluate(() => {
    const errors = [];
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return (
        rect.width &&
        rect.height &&
        style.visibility !== "hidden" &&
        !el.closest('[hidden],[inert],[aria-hidden="true"]')
      );
    };
    if (document.documentElement.scrollWidth > innerWidth)
      errors.push(
        `Document width ${document.documentElement.scrollWidth} exceeds ${innerWidth}`,
      );
    document.querySelectorAll(".table-wrap,.table-panel").forEach((el) => {
      if (visible(el) && el.scrollWidth > el.clientWidth)
        errors.push(
          `Table wrapper scrolls sideways: ${el.className} (${el.scrollWidth}/${el.clientWidth})`,
        );
    });
    document
      .querySelectorAll(
        "p,small,label,button,input,select,textarea,th,td,h1,h2,h3,span,b,a,legend,dt,dd",
      )
      .forEach((el) => {
        if (
          !visible(el) ||
          !(el.textContent.trim() || el.matches("input,textarea"))
        )
          return;
        const minimum = el.matches(
          ".button,.field input,.requirement b,table td",
        )
          ? 16
          : 14;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size < minimum)
          errors.push(
            `${el.tagName}.${el.className}: ${size}px < ${minimum}px (${el.textContent.trim().slice(0, 55)})`,
          );
      });
    document
      .querySelectorAll(
        'button,input:not([type="hidden"]),select,textarea,a.button',
      )
      .forEach((el) => {
        if (!visible(el)) return;
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44)
          errors.push(
            `Small control ${el.getAttribute("aria-label") || el.textContent.trim() || el.name}: ${rect.width}×${rect.height}`,
          );
      });
    return errors;
  });
  expect
    .soft(
      issues,
      `Readability/reflow at ${page.viewportSize().width}px on ${await page.locator("main h1.page-title-focus").textContent()}`,
    )
    .toEqual([]);
}

const sharedModules = [
  "Home",
  "Things to do",
  "Messages",
  "Research projects",
  "Submitted documents",
  "Review documents",
  "Completed research",
  "Faculty members",
  "Reports",
  "News and opportunities",
  "Research help",
];
const adminModules = [
  "Manage accounts",
  "Access and permissions",
  "Activity history",
  "Settings",
];
for (const identity of ["admin", "director", "head-1", "researcher-1"]) {
  test(`${identity}: every authorized module reflows at 390px with readable text and touch targets`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, identity);
    for (const title of [
      ...sharedModules,
      ...(identity === "admin" ? adminModules : []),
    ]) {
      await navigate(page, title);
      await assertReadableReflow(page);
      if (identity === "admin" && title === "Manage accounts")
        await page.screenshot({
          path: ".thinkrail/context/screenshots/accessible-admin-mobile.png",
          fullPage: true,
        });
    }
    await navigate(page, "Research projects");
    await page.locator(".project-link").first().click();
    await assertProjectReflow(page);
    if (identity !== "admin") {
      await page
        .getByRole("button", { name: "Open menu", exact: true })
        .click();
      for (const title of adminModules)
        await expect(
          page
            .getByRole("navigation")
            .getByRole("button", { name: title, exact: true }),
        ).toHaveCount(0);
    }
  });
}

for (const width of [1440, 1024, 320, 720]) {
  test(`all admin modules reflow at ${width}px${width === 720 ? " (1440px at 200% zoom-equivalent layout viewport)" : ""}`, async ({
    page,
  }) => {
    // Halving the CSS layout viewport exercises 200% zoom reflow without CSS transforms.
    await page.setViewportSize({ width, height: 1000 });
    await login(page, "admin");
    for (const title of [...sharedModules, ...adminModules]) {
      await navigate(page, title);
      await assertReadableReflow(page);
    }
    await navigate(page, "Research projects");
    await page.locator(".project-link").first().click();
    await expect(page.locator(".lifecycle")).toBeVisible();
    await assertProjectReflow(page);
  });
}

async function assertProjectReflow(page) {
  for (let phase = 0; phase < checklist.length; phase++) {
    await page.locator(".lifecycle button").nth(phase).click();
    await expect(
      page.getByRole("heading", { name: checklist[phase].name, exact: true }),
    ).toBeVisible();
    await assertReadableReflow(page);
  }
  for (const title of ["Documents", "Project history", "Project details"]) {
    await page
      .locator(".tabs")
      .getByRole("button", {
        name: title === "Documents" ? /^Documents/ : title,
        exact: true,
      })
      .click();
    await assertReadableReflow(page);
  }
}

async function openCorrection(page) {
  await navigate(page, "Research projects");
  await page.locator(".project-link").first().click();
  const row = page
    .locator(".requirement")
    .filter({ hasText: "Capsule Proposal of Faculty/Researcher" });
  await row
    .getByRole("button", { name: "Upload a new version", exact: true })
    .click();
}

async function expectFocusContained(page, container) {
  // Check actual first/last focusable controls, not merely a few interior Tab stops.
  const controls = container
    .locator('button,input,select,textarea,a[href],[tabindex="0"]')
    .filter({ visible: true });
  await controls.last().focus();
  await page.keyboard.press("Tab");
  await expect(controls.first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(controls.last()).toBeFocused();
}

test("upload review is inline, preserves text/file on edit, and protects dirty close with focus restoration", async ({
  page,
}) => {
  await login(page, "researcher-1");
  await openCorrection(page);
  const dialog = page.getByRole("dialog");
  await expect(dialog).toHaveCount(1);
  await expect(page.locator(".sidebar")).toHaveAttribute("inert", "");
  await expect(page.locator("main").locator("..")).toHaveAttribute("inert", "");
  await expectFocusContained(page, dialog);
  const file = page.getByLabel("PDF document");
  const note = page.getByLabel("Version / correction note");
  const signature = page.getByLabel("Your full name for this submission");
  await file.setInputFiles({
    name: "kept-evidence.pdf",
    mimeType: "application/pdf",
    buffer: syntheticPdf("Retained file"),
  });
  await note.fill("Keep this correction and the selected PDF while editing.");
  await signature.fill("Dr Sample Researcher");
  const mutations = [];
  page.on("request", (request) => {
    if (isMutation(request)) mutations.push(request.url());
  });
  await page
    .getByRole("button", { name: "Review before saving", exact: true })
    .click();
  const review = page.getByRole("region", { name: "Check before saving" });
  await expect(review).toContainText("kept-evidence.pdf");
  await expect(review).toContainText(
    "Keep this correction and the selected PDF while editing.",
  );
  await expect(review).toContainText("Dr Sample Researcher");
  await expect(
    page.getByRole("heading", { name: "Check before saving", exact: true }),
  ).toBeFocused();
  await expect(dialog).toHaveCount(1);
  await page.screenshot({
    path: ".thinkrail/context/screenshots/accessible-form-review.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Go back and edit", exact: true })
    .click();
  await expect(note).toHaveValue(
    "Keep this correction and the selected PDF while editing.",
  );
  await expect(signature).toHaveValue("Dr Sample Researcher");
  expect(
    await file.evaluate((el) => Array.from(el.files, (f) => f.name)),
  ).toEqual(["kept-evidence.pdf"]);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Leave without saving?", exact: true }),
  ).toBeVisible();
  await expect(dialog).toHaveCount(1);
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(note).toHaveValue(
    "Keep this correction and the selected PDF while editing.",
  );
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .getByRole("button", { name: "Leave without saving", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page
      .locator(".requirement")
      .filter({ hasText: "Capsule Proposal of Faculty/Researcher" })
      .getByRole("button", { name: "Upload a new version", exact: true }),
  ).toBeFocused();
  expect(
    mutations,
    "Review, edit, keep and discard must never mutate the server",
  ).toEqual([]);
});

test("required fields and feedback block review before any mutation", async ({
  page,
}) => {
  await login(page, "head-1");
  await navigate(page, "Review documents");
  await page
    .getByRole("button", { name: "Review PDF", exact: true })
    .first()
    .click();
  const signature = page.getByLabel("Your full name for this decision");
  await signature.fill("");
  const mutations = [];
  page.on("request", (request) => {
    if (isMutation(request)) mutations.push(request.url());
  });
  await page
    .getByRole("button", { name: "Review before saving", exact: true })
    .click();
  expect(await signature.evaluate((el) => el.validity.valueMissing)).toBe(true);
  await expect(signature).toBeFocused();
  await expect(
    page.getByRole("button", {
      name: "Confirm and save decision",
      exact: true,
    }),
  ).toBeHidden();
  await signature.fill("Dr Sample Department Head");
  for (const decision of ["Needs Revision", "Rejected"]) {
    await page.getByLabel(/^Decision \(Required\)$/).selectOption(decision);
    await page.getByLabel("Review feedback").fill("   ");
    await page
      .getByRole("button", { name: "Review before saving", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText(
      "Explain the changes needed in Review feedback before continuing.",
    );
    await expect(
      page.getByRole("button", {
        name: "Confirm and save decision",
        exact: true,
      }),
    ).toBeHidden();
  }
  expect(mutations).toEqual([]);
  await page
    .getByLabel("Review feedback")
    .fill("Please correct the evidence and upload a matching document.");
  await reviewAndConfirm(page, "Confirm and save decision");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("official checklist wording is retained in every research phase", async ({
  page,
}) => {
  await login(page, "researcher-1");
  await navigate(page, "Research projects");
  await page.locator(".project-link").first().click();
  const phaseButtons = page.locator(".lifecycle button");
  await expect(phaseButtons).toHaveCount(3);
  for (let phase = 0; phase < checklist.length; phase++) {
    await phaseButtons.nth(phase).click();
    await expect(page.locator(".checklist-heading .badge")).toHaveText(
      /^\d+\s*\/\s*\d+\s+complete$/,
    );
    await expect(
      page.getByRole("heading", { name: checklist[phase].name, exact: true }),
    ).toBeVisible();
    for (const group of checklist[phase].groups) {
      await expect(
        page.getByRole("heading", { name: group.name, exact: true }),
      ).toBeVisible();
      for (const item of group.items)
        await expect(
          page.locator(".requirement").getByText(item.label, { exact: true }),
        ).toBeVisible();
    }
    await assertReadableReflow(page);
  }
});

test("head cannot advance until authoritative server requirements are ready; approval also requires review", async ({
  page,
}) => {
  await login(page, "head-1");
  let response = await page.request.get(url + "/api/bootstrap");
  expect(response.ok()).toBe(true);
  const data = await response.json();
  const project = data.projects.find(
    (p) => p.status === "Ongoing" && p.phase === 0,
  );
  expect(project).toBeTruthy();
  await navigate(page, "Research projects");
  await page.getByRole("button", { name: project.title, exact: true }).click();
  const advance = page.getByRole("button", {
    name: "Approve the next stage",
    exact: true,
  });
  await expect(advance).toBeDisabled();
  response = await page.request.post(
    `${url}/api/projects/${project.id}/advance`,
    { data: { signature: data.user.name } },
  );
  expect(response.status()).toBe(409);
  for (const item of checklist[0].groups.flatMap((g) => g.items)) {
    const requirement = project.requirements[item.id];
    if (
      requirement.status === "Approved" ||
      requirement.status === "Not Applicable"
    )
      continue;
    let documentId = requirement.versions.at(-1);
    if (requirement.status !== "Pending Review") {
      response = await page.request.post(
        `${url}/api/projects/${project.id}/upload`,
        {
          multipart: {
            requirementId: item.id,
            signature: data.user.name,
            reason: "Prepare real evidence for UI readiness regression.",
            file: {
              name: "ready-evidence.pdf",
              mimeType: "application/pdf",
              buffer: syntheticPdf(item.label),
            },
          },
        },
      );
      expect(response.ok(), await response.text()).toBe(true);
      documentId = (await response.json()).id;
    }
    response = await page.request.post(
      `${url}/api/documents/${documentId}/review`,
      {
        data: {
          decision: "Approved",
          signature: data.user.name,
          feedback: "Evidence checked for regression scenario.",
        },
      },
    );
    expect(response.ok(), await response.text()).toBe(true);
  }
  await page.reload();
  await expect(page.locator("main h1.page-title-focus")).toHaveText("Home");
  await navigate(page, "Research projects");
  await page.getByRole("button", { name: project.title, exact: true }).click();
  await expect(advance).toBeEnabled();
  await advance.click();
  await expect(page.getByLabel("Your full name for this approval")).toHaveValue(
    data.user.name,
  );
  await reviewAndConfirm(page, "Confirm the next stage");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  response = await page.request.get(url + "/api/bootstrap");
  expect(
    (await response.json()).projects.find((p) => p.id === project.id).phase,
  ).toBe(1);
});

for (const width of [390, 320, 720]) {
  test(`upload form and inline review reflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await login(page, "researcher-1");
    await openCorrection(page);
    await assertReadableReflow(page);
    await page.getByLabel("PDF document").setInputFiles({
      name: "mobile-evidence.pdf",
      mimeType: "application/pdf",
      buffer: syntheticPdf("Mobile evidence for review"),
    });
    await page
      .getByLabel("Version / correction note")
      .fill("A correction note remains readable on a narrow screen.");
    await page
      .getByRole("button", { name: "Review before saving", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Check before saving", exact: true }),
    ).toBeVisible();
    await assertReadableReflow(page);
    await expectFocusContained(page, page.getByRole("dialog"));
    await page
      .getByRole("button", { name: "Go back and edit", exact: true })
      .click();
    await expect(page.getByLabel("Version / correction note")).toHaveValue(
      "A correction note remains readable on a narrow screen.",
    );
  });
}

// No dependency changes: enable a real axe scan automatically when the host supplies it.
test("axe WCAG AA checks on home, checklist and inline review", async ({
  page,
}) => {
  await login(page, "researcher-1");
  const scan = async () => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  };
  await scan();
  await navigate(page, "Research projects");
  await page.locator(".project-link").first().click();
  await scan();
  await page
    .locator(".requirement")
    .filter({ hasText: "Capsule Proposal of Faculty/Researcher" })
    .getByRole("button", { name: "Upload a new version", exact: true })
    .click();
  await page.getByLabel("PDF document").setInputFiles({
    name: "axe-evidence.pdf",
    mimeType: "application/pdf",
    buffer: syntheticPdf("Accessible review"),
  });
  await page
    .getByRole("button", { name: "Review before saving", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Check before saving", exact: true }),
  ).toBeVisible();
  await scan();
});
