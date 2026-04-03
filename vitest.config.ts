import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["artifacts/**/*.{test,spec}.{ts,tsx}", "lib/**/*.{test,spec}.{ts,tsx}", "scripts/**/*.{test,spec}.{ts,tsx}"],
    environmentMatchGlobs: [
      ["**/*.component.test.{ts,tsx}", "jsdom"],
      ["**/*.dom.test.{ts,tsx}", "jsdom"],
    ],
  },
});
