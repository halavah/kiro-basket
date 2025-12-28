import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'

// 创建应用实例
const app = createApp(App)

// 注册 Pinia
const pinia = createPinia()
app.use(pinia)

// 注册 Vue Router
app.use(router)

// 注册 Element Plus
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default',
  zIndex: 3000
})

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误：', err)
  console.error('错误信息：', info)
}

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('全局警告：', msg)
  console.warn('警告追踪：', trace)
}

// 挂载应用
app.mount('#app')

// 开发环境下的调试信息
if (import.meta.env.DEV) {
  console.log('🚀 社区团购管理平台 - 居民端')
  console.log('📦 Vue Version:', app.version)
  console.log('🔧 Environment:', import.meta.env.MODE)
  console.log('🌐 API Base URL:', import.meta.env.VITE_API_BASE_URL || '/api')
}
