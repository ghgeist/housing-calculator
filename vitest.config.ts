import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "artifacts/**/*.{test,spec}.{ts,tsx}",
    ],
    environmentMatchGlobs: [
      ["**/*.component.test.{ts,tsx}", "jsdom"],
      ["**/*.dom.test.{ts,tsx}", "jsdom"],
      ["**/*.smoke.test.{ts,tsx}", "jsdom"],
    ],
  },
});
