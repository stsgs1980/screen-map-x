import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React Flow + elkjs screen map — dev server is exposed as a live preview,
// so bind all interfaces and allow any preview host.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
});
