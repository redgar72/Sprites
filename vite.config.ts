import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoName = process.env.REPO_NAME || 'Sprites';
const base = process.env.GITHUB_PAGES ? `/${repoName}/` : '/';

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 3000,
    host: true
  }
});
