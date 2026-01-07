import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Serve the full landing page at `/` during dev while keeping the SPA routes working.
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-landing-root',
      configureServer(server) {
        const landingPath = path.resolve(__dirname, 'public', 'landing_page.html')
        let landingHtml: string | null = null
        try {
          landingHtml = fs.readFileSync(landingPath, 'utf-8')
        } catch (e) {
          // file may not exist yet; ignore
        }

        server.middlewares.use((req, res, next) => {
          const url = req.url ? req.url.split('?')[0] : ''
          if ((url === '/' || url === '') && landingHtml) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            res.end(landingHtml)
            return
          }
          next()
        })
      }
    }
  ]
})
