import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' → statisch hostbar (z. B. GitHub Pages); Routing über HashRouter.
export default defineConfig({
  base: './',
  plugins: [react()],
});
