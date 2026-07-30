import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Use the worker_threads pool instead of the default 'forks' pool: the
    // forks pool fails to spawn workers on some CI runners ("Failed to start
    // forks worker"), whereas threads start reliably across Node versions.
    pool: 'threads',
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
