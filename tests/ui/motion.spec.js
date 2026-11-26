import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createApp } from "../../server/index.js";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let app, server, dir, url;
test.beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "rdms-motion-"));
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
async function login(page) {
  await page.goto(url);
  await page.locator("#demo-user").selectOption("admin");
  await page.getByRole("button", { name: "Open Practice Workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Home", exact: true }),
  ).toBeVisible();
}
const nav = (page, name) =>
  page.getByRole("navigation").getByRole("button", { name, exact: true });

async function recordMotion(page) {
  await page.addInitScript(() => {
    window.motionCalls = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (options?.id === "rdms-view-reveal")
        window.motionCalls.push({ frames, options });
      return animate.call(this, frames, options);
    };
    window.motionShifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.motionShifts.push(entry.value);
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}

test("shared motion uses bounded properties and hover adds no layout shift", async ({
  page,
}) => {
  await recordMotion(page);
  await login(page);
  expect(
    await page
      .locator(".skip-link")
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  const button = page.getByRole("button", {
    name: "View Research Projects",
    exact: true,
  });
  const initial = await button.evaluate((el) => ({
    x: el.offsetLeft,
    y: el.offsetTop,
    w: el.offsetWidth,
    h: el.offsetHeight,
  }));
  await button.hover();
  await expect
    .poll(() => button.evaluate((el) => getComputedStyle(el).transform))
    .toBe("matrix(1, 0, 0, 1, 0, -1)");
  expect(
    await button.evaluate((el) => ({
      x: el.offsetLeft,
      y: el.offsetTop,
      w: el.offsetWidth,
      h: el.offsetHeight,
    })),
  ).toEqual(initial);
  const result = await button.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      properties: s.transitionProperty,
      duration: s.transitionDuration,
      tokens: [
        "--motion-fast",
        "--motion-standard",
        "--motion-view",
        "--motion-overlay",
      ].map((name) => s.getPropertyValue(name).trim()),
    };
  });
  expect(result.properties).toBe(
    "background-color, color, border-color, opacity, transform",
  );
  expect(result.duration).toBe("0.15s");
  expect(
    result.tokens.map(
      (value) => parseFloat(value) * (value.endsWith("ms") ? 1 : 1000),
    ),
  ).toEqual([150, 200, 220, 250]);
  await page.evaluate(() =>
    Promise.all(
      document.getAnimations().map((a) => a.finished.catch(() => {})),
    ),
  );
  await page.evaluate(() => {
    window.motionShifts = [];
  });
  await page.mouse.move(1400, 900);
  await page.evaluate(() =>
    Promise.all(
      document.getAnimations().map((a) => a.finished.catch(() => {})),
    ),
  );
  expect(await page.evaluate(() => window.motionShifts)).toEqual([]);
});

test("view and tab fades preserve the mounted container and rapid navigation", async ({
  page,
}) => {
  await recordMotion(page);
  await login(page);
  const view = await page.locator(".motion-view").elementHandle();
  await nav(page, "Research Projects").click();
  await page.locator(".project-link").first().click();
  await page
    .getByRole("button", { name: "Project Details", exact: true })
    .click();
  const before = await page.evaluate(() => window.motionCalls.length);
  await page
    .getByRole("button", { name: "Project History", exact: true })
    .click();
  expect(await page.evaluate(() => window.motionCalls.length)).toBeGreaterThan(
    before,
  );
  expect(
    await view.evaluate((el) => el === document.querySelector(".motion-view")),
  ).toBe(true);
  for (const title of ["Messages", "Reports", "Home"])
    await nav(page, title).click();
  await expect(
    page.getByRole("heading", { name: "Home", exact: true }),
  ).toBeVisible();
  const calls = await page.evaluate(() => window.motionCalls);
  expect(calls.length).toBeGreaterThanOrEqual(7);
  expect(
    calls.every(
      (c) =>
        c.options.duration === 220 &&
        Number(c.frames[0].opacity) === 0.96 &&
        c.frames[1].opacity === 1,
    ),
  ).toBe(true);
  expect(
    await page
      .locator(".motion-view")
      .evaluate((el) => el.getAnimations().length),
  ).toBeLessThanOrEqual(1);
});

test("dialog and mobile menu fade without sweeping transforms or focus delays", async ({
  page,
}) => {
  await login(page);
  await nav(page, "Research Projects").click();
  await page
    .getByRole("button", { name: "Add Research Project", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(
    await dialog.evaluate((el) => ({
      animation: getComputedStyle(el).animationName,
      transform: getComputedStyle(el).transform,
    })),
  ).toEqual({ animation: "motion-reveal", transform: "none" });
  await expect(
    dialog.getByRole("button", { name: "Close", exact: true }),
  ).toBeFocused();
  const scan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(scan.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Add Research Project", exact: true }),
  ).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open Menu", exact: true }).click();
  expect(
    await page
      .locator(".sidebar")
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe("none");
  await expect
    .poll(() =>
      page.locator(".sidebar").evaluate((el) => getComputedStyle(el).opacity),
    )
    .toBe("1");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open Menu", exact: true }),
  ).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});

test("reduced motion suppresses CSS and view animations including live preference changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await recordMotion(page);
  await login(page);
  await nav(page, "Research Projects").click();
  expect(await page.evaluate(() => window.motionCalls.length)).toBe(0);
  expect(
    await page
      .locator(".nav-item.active")
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  await page
    .getByRole("button", { name: "Add Research Project", exact: true })
    .click();
  expect(
    await page
      .getByRole("dialog")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await page.keyboard.press("Escape");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--motion-view", "1000ms");
    document.querySelector('nav button[aria-label="Home"]').click();
  });
  await expect
    .poll(() =>
      page.locator(".motion-view").evaluate((el) => el.getAnimations().length),
    )
    .toBe(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page.locator(".motion-view").evaluate((el) => el.getAnimations().length),
    )
    .toBe(0);
  await expect(
    page.getByRole("heading", { name: "Home", exact: true }),
  ).toBeVisible();
});

test("initial loading is dark and static while data fetching remains unchanged", async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/api/session", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto(url);
    const loader = page.locator(".loading");
    await expect(loader).toBeVisible();
    expect(
      await loader.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe("rgb(16, 11, 56)");
    expect(
      await page
        .locator(".loading-dot")
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
  } finally {
    release();
  }
  await expect(page.locator("#demo-user")).toBeVisible();
});
