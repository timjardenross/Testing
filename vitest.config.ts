import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.tsx"],
    environment: "jsdom",
    reporters: ["default", "json"],
    outputFile: "artifacts/vitest-results.json",
  },
});
