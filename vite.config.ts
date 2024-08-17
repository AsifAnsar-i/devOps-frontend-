import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  preview:{
    host:true,
    port:5173
  },
  define: {
    'process.env': process.env
  }
})
