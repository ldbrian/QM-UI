import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // 🚨 绝对核心：确保生产环境绝不生成 Source Map！
    sourcemap: false, 
    
    // 可选：压缩代码，进一步增加逆向工程的难度
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除线上的 console.log
        drop_debugger: true,
      },
    },
  }
})