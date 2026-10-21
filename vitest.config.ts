import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    passWithNoTests: true,
    // Unit tests live next to the code in src/**, next to the scripts in
    // scripts/**, plus the root-level config contracts. Browser scenarios in
    // tests/e2e are Playwright specs and must not be collected by Vitest.
    include: ["src/**/*.{test,spec}.{ts,tsx}", "scripts/**/*.{test,spec}.{ts,tsx}", "*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
