import { expect, test } from "@playwright/test";

test("pipeline board renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Pipeline")).toBeVisible();
  await expect(page.getByText("Incoming")).toBeVisible();
});

test("deal page shows left panel", async ({ page }) => {
  await page.goto("/deal/1001");
  await expect(page.getByText("DEAL #1001")).toBeVisible();
  await expect(page.getByText("Activity")).toBeVisible();
});
