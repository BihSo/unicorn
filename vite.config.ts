import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: '0.0.0.0', // Listen on all network interfaces
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:9090',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})
