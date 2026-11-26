import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createApp } from "../../server/index.js";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let app, server, dir, url;
test.beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "rdms-profile-"));
  app = createApp({ dataDir: dir });
  server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  url = "http://127.0.0.1:" + server.address().port;
});
test.afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
  app.locals.close();
  rmSync(dir, { recursive: true, force: true });
});
async function login(page, id = "director") {
  await page.goto(url);
  await page.locator("#demo-user").selectOption(id);
  await page.getByRole("button", { name: "Open Practice Workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Home", exact: true }),
  ).toBeVisible();
}
async function directory(page) {
  if (
    await page
      .getByRole("button", { name: "Open Menu", exact: true })
      .isVisible()
  )
    await page.getByRole("button", { name: "Open Menu", exact: true }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Faculty Members", exact: true })
    .click();
}
async function profile(page, name) {
  await directory(page);
  await page
    .getByRole("textbox", { name: "Search faculty or accounts" })
    .fill(name);
  await page.getByRole("button", { name: "View Profile", exact: true }).click();
  await expect(page.getByRole("heading", { name, exact: true })).toBeFocused();
}

test("profile is a full page with recorded details and project cards, with directory/project return paths", async ({
  page,
}) => {
  await login(page);
  const mutations = [];
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname.startsWith("/api/") &&
      !["GET", "HEAD", "OPTIONS"].includes(request.method())
    )
      mutations.push(request.url());
  });
  await profile(page, "Maya Dela Cruz");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator("main table")).toHaveCount(0);
  await expect(page.locator(".researcher-about")).toContainText(
    "College of Technology",
  );
  await expect(page.locator(".researcher-about")).toContainText(
    "researcher-1@demo.example",
  );
  await expect(page.locator(".researcher-about")).toContainText("Active");
  await expect(
    page.getByRole("link", { name: "Email Researcher" }),
  ).toHaveAttribute("href", "mailto:researcher-1@demo.example");
  await expect(page.locator(".researcher-project")).toHaveCount(2);
  await expect(page.locator(".researcher-summary")).toContainText(
    "2 research projects",
  );
  const card = page
    .locator(".researcher-project")
    .filter({ hasText: "Community early-warning networks" });
  await expect(card).toContainText("2026");
  await expect(card).toContainText("Synthetic demonstration research record");
  await page.screenshot({
    path: ".thinkrail/context/screenshots/researcher-profile-desktop.png",
    fullPage: true,
  });
  await card
    .getByRole("button", {
      name: "View Research: Community early-warning networks",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Community early-warning networks",
      exact: true,
    }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Back to Researcher Profile", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Maya Dela Cruz", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Back to Faculty Members", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Search faculty or accounts" }),
  ).toHaveValue("Maya Dela Cruz");
  await expect(
    page.getByRole("table", { name: "Faculty members", exact: true }),
  ).toBeVisible();
  expect(mutations).toEqual([]);
});

for (const actor of ["admin", "head-1", "researcher-1"]) {
  test(`${actor} profile cards and totals use only authorized owner projects`, async ({
    page,
  }) => {
    await login(page, actor);
    const snapshot = await (
      await page.request.get(url + "/api/bootstrap")
    ).json();
    await profile(page, "Maya Dela Cruz");
    const owned = snapshot.projects.filter((p) => p.ownerId === "researcher-1");
    await expect(page.locator(".researcher-project")).toHaveCount(owned.length);
    await expect(page.locator(".researcher-summary")).toContainText(
      `${owned.length} research projects`,
    );
    for (const project of owned)
      await expect(
        page
          .locator(".researcher-project h3")
          .filter({ hasText: project.title }),
      ).toHaveCount(1);
    for (const project of snapshot.projects.filter(
      (p) => p.ownerId !== "researcher-1",
    ))
      await expect(
        page
          .locator(".researcher-project h3")
          .filter({ hasText: project.title }),
      ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Switch Account", exact: true })
      .click();
    await page.locator("#demo-user").selectOption("researcher-2");
    await page.getByRole("button", { name: "Open Practice Workspace" }).click();
    await expect(
      page.getByRole("heading", { name: "Home", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".researcher-profile")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(
      "researcher-1@demo.example",
    );
  });
}

test("empty and archived research states are explicit without fabricated profile fields", async ({
  page,
}) => {
  await login(page, "admin");
  await profile(page, "Tessa Manalo");
  await expect(
    page.getByRole("heading", {
      name: "No research projects yet",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".researcher-summary")).toContainText(
    "0 research projects",
  );
  await expect(page.locator(".researcher-about")).toContainText(
    "No photo or biography has been supplied",
  );
  await page
    .getByRole("button", { name: "Back to Faculty Members", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search faculty or accounts" })
    .fill("Marco Diaz");
  await page.getByRole("button", { name: "View Profile", exact: true }).click();
  await expect(page.locator(".researcher-summary")).toContainText("1 archived");
  await expect(
    page
      .locator(".researcher-project")
      .filter({ hasText: "Open research data literacy" }),
  ).toContainText("Archived");
});

test("missing fields and unusually long content remain readable without invented details", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  const longName = "Researcher " + "LongRecordedName".repeat(8);
  await page.route("**/api/bootstrap", async (route) => {
    const response = await route.fetch();
    const snapshot = await response.json();
    const person = snapshot.users.find((u) => u.id === "researcher-1");
    Object.assign(person, { name: longName, email: "", department: "" });
    for (const p of snapshot.projects.filter((p) => p.ownerId === person.id))
      Object.assign(p, {
        title: "LongRecordedTitle".repeat(18),
        program: "",
        abstract: "",
        year: null,
      });
    await route.fulfill({ response, json: snapshot });
  });
  await login(page);
  await profile(page, longName);
  await expect(
    page.getByRole("link", { name: "Email Researcher" }),
  ).toHaveCount(0);
  await expect(page.locator(".researcher-about")).toContainText("Not assigned");
  await expect(page.locator(".researcher-about")).toContainText("Not recorded");
  await expect(page.locator(".researcher-project").first()).toContainText(
    "No abstract recorded for this research.",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});

for (const width of [320, 390, 720, 1440]) {
  test(`profile reflows accessibly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await login(page);
    await profile(page, "Maya Dela Cruz");
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    const issues = await page.locator(".researcher-profile").evaluate((root) =>
      [...root.querySelectorAll("button, a")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width < 44 || r.height < 44;
        })
        .map((el) => el.textContent),
    );
    expect(issues).toEqual([]);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    if (width === 390)
      await page.screenshot({
        path: ".thinkrail/context/screenshots/researcher-profile-mobile.png",
        fullPage: true,
      });
  });
}
