import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import basicSsl from "@vitejs/plugin-basic-ssl"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [basicSsl(), inspectAttr(), react()],
  server: {
    https: {},
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
