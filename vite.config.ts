import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Vite configuration for Lawyer Opportunity Hub
// Optimized for development and production builds
export default defineConfig(({ mode }) => ({
  // Development server configuration
  server: {
    host: "::",
    port: 8080,
    open: false,
    strictPort: false,
  },
  
  // Build configuration
  build: {
    outDir: "dist",
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          supabase: ["@supabase/supabase-js"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
  
  // Plugins
  plugins: [
    react({
      // Enable React Fast Refresh for development
      jsxImportSource: "@emotion/react",
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
  // Path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Define globals
  define: {
    __DEV__: mode === "development",
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "@tanstack/react-query",
    ],
  },
}));
