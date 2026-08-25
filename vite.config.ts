import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

/**
 * SINGLE=1 inlines every asset (fonts included) so the build can be folded
 * into one portable .html file. The normal build stays a normal build.
 */
const single = process.env.SINGLE === '1'

export default defineConfig({
  base: './',
  build: single ? { assetsInlineLimit: 100 * 1024 * 1024, cssCodeSplit: false } : {},
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '~': path.resolve(__dirname, 'src') },
  },
})
