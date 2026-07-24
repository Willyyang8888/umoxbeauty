import { defineConfig } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

function resolveChromiumExecutable() {
  const localAppData = process.env.LOCALAPPDATA;

  if (!localAppData) {
    return undefined;
  }

  const root = path.join(localAppData, "ms-playwright");

  if (!fs.existsSync(root)) {
    return undefined;
  }

  const chromiumFolder = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("chromium-"))
    .map((entry) => entry.name)
    .sort()
    .reverse()[0];

  if (!chromiumFolder) {
    return undefined;
  }

  const executablePath = path.join(root, chromiumFolder, "chrome-win64", "chrome.exe");
  return fs.existsSync(executablePath) ? executablePath : undefined;
}

export default defineConfig({
  testDir: "./src/tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    headless: true,
    launchOptions: {
      executablePath: resolveChromiumExecutable()
    }
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
