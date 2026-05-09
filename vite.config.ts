import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 终极修复：强行绕过落后的类型检查，但保留代码压缩和消除 console 的物理能力
  esbuild: {
    drop: ['console', 'debugger'],
  } as any,

  build: {
    // 🚨 商业核心：绝不生成 Source Map
    sourcemap: false, 
  }
})