import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

function apiMockPlugin() {
  return {
    name: 'api-mock',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.method === 'POST' && req.url === '/api/verify-turnstile') {
          req.on('end', () => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Set-Cookie', 'turnstile_verified=mock; Path=/; Max-Age=86400; SameSite=Strict')
            res.end(JSON.stringify({ success: true, mock: true }))
          })
          return
        }

        if (req.method === 'POST' && req.url === '/api/contact') {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Set-Cookie', 'turnstile_verified=mock; Path=/; Max-Age=86400; SameSite=Strict')
          res.end(JSON.stringify({ success: true, mock: true }))
          return
        }

        next()
      })
    },
    configurePreviewServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.method === 'POST' && req.url === '/api/verify-turnstile') {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Set-Cookie', 'turnstile_verified=mock; Path=/; Max-Age=86400; SameSite=Strict')
          res.end(JSON.stringify({ success: true, mock: true }))
          return
        }

        if (req.method === 'POST' && req.url === '/api/contact') {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Set-Cookie', 'turnstile_verified=mock; Path=/; Max-Age=86400; SameSite=Strict')
          res.end(JSON.stringify({ success: true, mock: true }))
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiMockPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
  },
})
