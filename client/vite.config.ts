import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5176,
    strictPort: true,
    cors: true,
  },

  css: {
    // This tells Vite to use the faster Rust-based transformer
    transformer: "lightningcss",
    lightningcss: {
      targets: {
        // Targets browsers that support nesting (Chrome 111+, etc.)
        chrome: 111,
        safari: 16,
      },
      drafts: {
        nesting: true, // Enables the nesting spec
      },
    },
  },
  build: {
    cssTarget: "chrome111", // Ensures the output doesn't get "flattened" unnecessarily
  },
});
