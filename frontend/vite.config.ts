import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// In Docker the backend is reachable as http://backend:8000; on the host it's localhost.
const apiTarget = process.env.API_PROXY_TARGET ?? "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Bind mounts from Windows don't emit file events inside Linux containers.
    watch: process.env.VITE_POLL ? { usePolling: true } : undefined,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
