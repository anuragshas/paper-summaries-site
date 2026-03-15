import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const base = process.env.VITE_SITE_BASE_PATH || '/paper-summaries-site/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
});
