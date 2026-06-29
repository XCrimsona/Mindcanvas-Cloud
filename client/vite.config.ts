import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3176,
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
        firefox: 113, // Firefox added nesting support here
        edge: 111,
        ios_saf: 16, // Mobile Safari
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
