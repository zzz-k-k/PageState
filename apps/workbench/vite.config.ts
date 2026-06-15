import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@pagestate/commands": resolve(__dirname, "../../packages/commands/src/index.ts"),
      "@pagestate/ir": resolve(__dirname, "../../packages/ir/src/index.ts")
    }
  }
});
