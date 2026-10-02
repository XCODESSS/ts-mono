import { http, HttpResponse } from "msw";

import { expect, test } from "./fixtures/app";
import { serveEvalLog } from "./fixtures/serve-log";
import { createEvalLog, createEvalStats } from "./fixtures/test-data";

for (const status of ["cancelled", "error", "success"] as const) {
  test(`${status} log with empty completion shows unavailable timing`, async ({
    page,
    network,
  }) => {
    const log = createEvalLog();
    log.status = status;
    log.stats = createEvalStats({ completed_at: "" });
    serveEvalLog(network, log, "empty-completion.json");
    await page.goto("/#/logs/empty-completion.json");
    if (status === "success") {
      await expect(
        page.getByRole("navigation").filter({ hasText: "Duration" })
      ).toContainText("unavailable");
      await expect(
        page.getByRole("navigation").filter({ hasText: "Duration" })
      ).not.toContainText("NaN");
    } else {
      await expect(
        page.getByRole("navigation").filter({ hasText: "Duration" })
      ).toHaveCount(0);
    }
    await page.getByRole("tab", { name: "Task", exact: true }).click();
    const card = page.locator('[id="task-card-config"]').first();
    await expect(card).toContainText("2025");
    await expect(card.getByText("unavailable", { exact: true })).toHaveCount(2);
    await expect(card).not.toContainText("1970");
    await expect(card).not.toContainText("NaN");
    await expect(page.getByTestId("error-panel")).not.toBeVisible();
  });
}

for (const status of ["success", "error"] as const) {
  test(`${status} log with normal completion keeps its duration`, async ({
    page,
    network,
  }) => {
    const log = createEvalLog();
    log.status = status;
    serveEvalLog(network, log, "complete-timing.json");
    await page.goto("/#/logs/complete-timing.json");
    if (status === "success") {
      await expect(
        page.getByRole("navigation").filter({ hasText: "Duration" })
      ).toContainText("5 min 0 sec");
    }
    await page.getByRole("tab", { name: "Task", exact: true }).click();
    const card = page.locator('[id="task-card-config"]').first();
    await expect(card).toContainText("5 min 0 sec");
    await expect(card).not.toContainText("unavailable");
  });
}

test("an evaluation without timing does not display epoch dates", async ({
  page,
  network,
}) => {
  const log = createEvalLog();
  log.stats = createEvalStats({ started_at: "", completed_at: "" });
  serveEvalLog(network, log, "no-timing.json");
  await page.goto("/#/logs/no-timing.json");
  await page.getByRole("tab", { name: "Task", exact: true }).click();
  const card = page.locator('[id="task-card-config"]').first();
  await expect(card.getByText("unavailable", { exact: true })).toHaveCount(3);
  await expect(card).not.toContainText("1970");
});

test("a known end remains visible without a start", async ({
  page,
  network,
}) => {
  const log = createEvalLog();
  log.stats = createEvalStats({ started_at: "" });
  serveEvalLog(network, log, "missing-start.json");
  await page.goto("/#/logs/missing-start.json");
  await page.getByRole("tab", { name: "Task", exact: true }).click();
  const card = page.locator('[id="task-card-config"]').first();
  await expect(card).toContainText("2025");
  await expect(card.getByText("unavailable", { exact: true })).toHaveCount(2);
  await expect(card).not.toContainText("1970");
});

test("absent statistics show unavailable task timing", async ({
  page,
  network,
}) => {
  const log = createEvalLog();
  serveEvalLog(network, log, "missing-stats.json");
  network.use(
    http.get("*/api/logs/:file", () =>
      HttpResponse.json({ ...log, stats: undefined })
    )
  );
  await page.goto("/#/logs/missing-stats.json");
  await page.getByRole("tab", { name: "Task", exact: true }).click();
  const card = page.locator('[id="task-card-config"]').first();
  await expect(card.getByText("unavailable", { exact: true })).toHaveCount(3);
  await expect(card).not.toContainText("1970");
});
