import { expect, test } from "@playwright/test";

test("support page renders core fields", async ({ page }) => {
  await page.goto("/support");

  await expect(page.getByRole("heading", { name: "Support the official project" })).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Custom amount (CAD)")).toBeVisible();
});
