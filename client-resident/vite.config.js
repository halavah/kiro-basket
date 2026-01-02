import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 20302,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:20300',
        changeOrigin: true
        // 注释说明：
        // 前端 API 文件中的路径已经包含 /resident 前缀
        // 例如：/resident/products, /resident/cart 等
        // baseURL 是 /api，所以完整路径是 /api/resident/products
        // Vite 代理会转发到 http://localhost:20300/api/resident/products
        // 这样就正确匹配后端路由了 ✅
      },
      '/uploads': {
        target: 'http://localhost:20300',
        changeOrigin: true
      }
    }
  }
})
