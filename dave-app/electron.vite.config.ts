import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  main: { plugins: [externalizeDepsPlugin()] },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: { output: { format: "cjs", entryFileNames: "index.cjs" } },
    },
  },
  renderer: {
    plugins: [
      react(),
      {
        name: "development-csp",
        apply: "serve",
        transformIndexHtml: {
          order: "post",
          handler: (html) =>
            html
              .replace(
                "default-src 'self';",
                "default-src 'self'; script-src 'self' 'unsafe-inline';",
              )
              .replace("ws://localhost:5173", "ws://localhost:*"),
        },
      },
    ],
  },
});
