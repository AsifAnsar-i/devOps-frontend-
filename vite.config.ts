import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-w9xd.onrender.com', // Make sure this is correct
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview:{
    host:true,
    port:5173
  },
  define: {
    'process.env': process.env
  }
})
