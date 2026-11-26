import { test, expect } from "@playwright/test";
import { createApp } from "../../server/index.js";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let app, server, dir, url;
test.beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "rdms-copy-"));
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
async function login(page, actor = "admin") {
  await page.goto(url);
  await page.locator("#demo-user").selectOption(actor);
  await page
    .getByRole("button", { name: "Open Practice Workspace", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Home", exact: true }),
  ).toBeVisible();
}
const nav = (page, name) =>
  page.getByRole("navigation").getByRole("button", { name, exact: true });

test("static navigation/actions use Title Case and phase casing does not rename canonical values", async ({
  page,
}) => {
  await page.goto(url);
  await expect(page.locator(".login-story h1")).toHaveText(
    "Bukidnon State University - Research and Development Unit",
  );
  expect(
    await page
      .locator(".login-story h1")
      .evaluate((el) => getComputedStyle(el).textTransform),
  ).toBe("none");
  await page.locator("#demo-user").selectOption("admin");
  await page
    .getByRole("button", { name: "Open Practice Workspace", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Home", exact: true }),
  ).toBeVisible();
  await expect(page.locator("nav .nav-item")).toHaveText([
    "Home",
    /Things to Do/,
    /Messages/,
    "Research Projects",
    "Submitted Documents",
    "Review Documents",
    "Completed Research",
    "Faculty Members",
    "Reports",
    "News and Opportunities",
    "Research Help",
    "Manage Accounts",
    "Access and Permissions",
    "Activity History",
    "Settings",
  ]);
  await nav(page, "Research Projects").click();
  await expect(
    page.locator(".tabs").getByRole("button", { name: /^In Progress/ }),
  ).toBeVisible();
  const snapshot = await (
    await page.request.get(url + "/api/bootstrap")
  ).json();
  expect(snapshot.checklist[0].name).toBe("I. CONCEPTUALIZATION PHASE");
  expect(snapshot.projects[0].status).toBe("Ongoing");
  await page.locator(".project-link").first().click();
  await expect(
    page.getByRole("heading", {
      name: "I. Conceptualization Phase",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "IV. Monitoring and Evaluation",
      exact: true,
    }),
  ).toBeVisible();
  for (const group of snapshot.checklist[0].groups)
    for (const item of group.items)
      await expect(
        page.locator(".requirement").getByText(item.label, { exact: true }),
      ).toBeVisible();
});

test("user text and emails retain original casing, including titles that resemble status enums", async ({
  page,
}) => {
  await page.route("**/api/bootstrap", async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    const person = data.users.find((u) => u.id === "researcher-1");
    person.name = "mAYA dELA Cruz";
    person.email = "MiXeD@demo.example";
    Object.assign(data.projects[0], {
      title: "Missing",
      abstract: "KEEP This exact User TEXT.",
    });
    const announcement = data.announcements[0];
    Object.assign(announcement, {
      title: "USER WROTE THIS TITLE",
      body: "Keep THIS wording.",
    });
    data.notifications[0].title = "USER notification TITLE";
    data.notifications[0].body = "Keep THIS message body.";
    await route.fulfill({ response, json: data });
  });
  await login(page);
  await nav(page, "Reports").click();
  const row = page
    .getByRole("table", { name: "Research Inventory", exact: true })
    .locator("tbody tr")
    .first();
  await expect(row.locator("td").nth(0)).toHaveText("Missing");
  await expect(row.locator("td").nth(1)).toHaveText("mAYA dELA Cruz");
  await expect(row.locator("td").nth(7)).toHaveText("In progress");
  await expect(row.locator("td").nth(6)).toHaveText(
    "I. Conceptualization Phase",
  );
  await nav(page, "Faculty Members").click();
  await page
    .getByRole("textbox", { name: "Search faculty or accounts" })
    .fill("mAYA dELA Cruz");
  await page.getByRole("button", { name: "View Profile", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "mAYA dELA Cruz", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".researcher-about")).toContainText(
    "MiXeD@demo.example",
  );
  await expect(page.locator(".researcher-project").first()).toContainText(
    "KEEP This exact User TEXT.",
  );
  await nav(page, "News and Opportunities").click();
  await expect(
    page.getByRole("heading", { name: "USER WROTE THIS TITLE", exact: true }),
  ).toBeVisible();
  await nav(page, "Messages").click();
  await expect(page.locator(".notification-list")).toContainText(
    "USER notification TITLE",
  );
  await expect(page.locator(".notification-list")).toContainText(
    "Keep THIS message body.",
  );
});

test("report captions stay aligned with CSV while canonical report selections remain unchanged", async ({
  page,
}) => {
  await login(page);
  await nav(page, "Reports").click();
  const names = [
    "Research Inventory",
    "Research Progress",
    "Completed Research",
    "Ongoing Research",
    "Pending Submissions",
    "Missing Requirements",
    "Department Performance",
    "Faculty Research Profile",
    "Research Productivity",
    "Research Review",
    "Research Compliance",
    "Research Activity",
    "Research Archive",
  ];
  await expect(
    page
      .getByRole("combobox", { name: "Report", exact: true })
      .locator("option"),
  ).toHaveText(names);
  await page
    .getByRole("combobox", { name: "Report", exact: true })
    .selectOption("Research Compliance");
  const table = page.getByRole("table", {
    name: "Research Compliance",
    exact: true,
  });
  await expect(table.locator("th")).toHaveText([
    "Research title",
    "Type",
    "Department",
    "Stage",
    "Approved",
    "Not needed",
    "Waiting for review",
    "Changes needed / not accepted",
    "Missing",
    "Compliance",
  ]);
  const response = await page.request.get(
    url + "/api/reports.csv?report=Research%20Compliance",
  );
  expect(response.ok()).toBe(true);
  const csv = await response.text();
  expect(csv.split(/\r?\n/)[0]).toContain("Changes needed / not accepted");
  expect(csv.split(/\r?\n/)[0]).toContain("Stage");
});
