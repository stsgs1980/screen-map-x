import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The dev and preview servers bind to loopback by default: the project source
// must not be served to every host on the local network, and Vite's host
// allow-list stays in place so a rebound DNS name cannot reach the server.
// `npm run dev:lan` and `npm run preview:lan` opt into a LAN-exposed server.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  preview: {
    host: "127.0.0.1",
    port: 5173,
  },
});
