import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
// @ts-expect-error plain JS module shared with the production server
import { handleLeaderboard } from './deploy/leaderboard.mjs'

import { cloudflare } from "@cloudflare/vite-plugin";

// Serve the leaderboard API in dev too (production: deploy/serve.mjs).
const leaderboardApi: Plugin = {
  name: 'leaderboard-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!handleLeaderboard(req, res)) next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [leaderboardApi, react(), tailwindcss(), cloudflare()],
  build: {
    rollupOptions: {
      // Two pages: the landing page and the /play mini-game.
      input: { main: 'index.html', play: 'play/index.html' },
    },
  },
})
