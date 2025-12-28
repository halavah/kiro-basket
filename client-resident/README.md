# 社区团购管理平台 - 居民端

## 项目介绍

基于 Vue 3 + Element Plus 的社区团购居民端前端项目。居民可以通过本系统浏览商品、加入购物车、下单购买、查看订单、管理个人信息等。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **UI 库**: Element Plus 2.6+
- **状态管理**: Pinia 2.1+
- **路由**: Vue Router 4.3+
- **HTTP 请求**: Axios 1.6+
- **构建工具**: Vite 5.2+
- **开发语言**: JavaScript (ES6+)

## 环境要求

- **Node.js**: 16.x 或更高版本
- **npm**: 8.x 或更高版本
- **后端服务**: 需要运行后端 API 服务（默认地址：http://localhost:3000）

## 快速开始

### 1. 安装依赖

```bash
cd client-resident
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 http://localhost:5174 启动

> **注意**: 居民端默认使用 5174 端口，团长端使用 5173 端口，避免端口冲突

### 3. 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist/` 目录

### 4. 预览生产构建

```bash
npm run preview
```

## 测试账号

### 居民账号

| 用户名 | 密码 | 姓名 | 手机号 |
|--------|------|------|--------|
| zhangsan | 123456 | 张三 | 13900139001 |
| lisi | 123456 | 李四 | 13900139002 |
| wangwu | 123456 | 王五 | 13900139003 |
| zhaoliu | 123456 | 赵六 | 13900139004 |
| sunqi | 123456 | 孙七 | 13900139005 |

> **注意**: 测试账号密码已使用 bcrypt 加密存储在数据库中

## 项目结构

```
client-resident/
├── public/                  # 静态资源
├── src/
│   ├── api/                 # API 接口封装
│   │   ├── request.js       # Axios 请求封装（拦截器）
│   │   ├── auth.js          # 认证相关接口
│   │   ├── product.js       # 商品相关接口
│   │   ├── cart.js          # 购物车相关接口
│   │   └── order.js         # 订单相关接口
│   ├── assets/              # 静态资源（图片、样式等）
│   ├── components/          # 公共组件
│   │   ├── Header.vue       # 页面头部（导航、搜索、购物车）
│   │   ├── Footer.vue       # 页面底部
│   │   ├── ProductCard.vue  # 商品卡片组件
│   │   └── OrderCard.vue    # 订单卡片组件
│   ├── router/              # 路由配置
│   │   └── index.js         # 路由定义（含登录鉴权）
│   ├── store/               # Pinia 状态管理
│   │   ├── user.js          # 用户状态（登录、登出）
│   │   ├── cart.js          # 购物车状态
│   │   └── product.js       # 商品状态
│   ├── utils/               # 工具函数
│   │   ├── constants.js     # 常量定义（订单状态、分类等）
│   │   └── index.js         # 工具函数（格式化、token 管理）
│   ├── views/               # 页面组件
│   │   ├── Layout.vue       # 主布局（包含 Header 和 Footer）
│   │   ├── Login.vue        # 登录注册页
│   │   ├── Home.vue         # 首页（商品列表）
│   │   ├── ProductDetail.vue # 商品详情页
│   │   ├── Cart.vue         # 购物车页
│   │   ├── Order.vue        # 订单列表页
│   │   ├── OrderDetail.vue  # 订单详情页
│   │   └── Profile.vue      # 个人中心页
│   ├── App.vue              # 根组件
│   └── main.js              # 应用入口
├── index.html               # HTML 入口
├── vite.config.js           # Vite 配置（含代理设置）
├── package.json             # 项目依赖
└── README.md                # 项目文档

```

## 功能模块

### 1. 用户认证
- ✅ 用户登录（用户名/手机号 + 密码）
- ✅ 用户注册（用户名、密码、姓名、手机号、地址）
- ✅ 自动登录（JWT Token 持久化）
- ✅ 登出功能

### 2. 商品浏览
- ✅ 商品列表展示（分页）
- ✅ 分类筛选（水果、蔬菜、肉类、海鲜、日用品）
- ✅ 商品搜索（关键词搜索）
- ✅ 商品卡片（图片、名称、价格、库存、销量）

### 3. 商品详情
- ✅ 商品详细信息展示
- ✅ 数量选择器（限制库存范围）
- ✅ 加入购物车
- ✅ 立即购买（跳转购物车结算）

### 4. 购物车管理
- ✅ 购物车列表展示
- ✅ 修改商品数量
- ✅ 删除单个商品
- ✅ 清空购物车
- ✅ 购物车统计（商品数量、总金额）
- ✅ 去结算（创建订单）

### 5. 订单管理
- ✅ 订单列表（分页、状态筛选）
- ✅ 订单搜索（订单号、商品名称）
- ✅ 订单详情查看
- ✅ 订单状态流转时间线
- ✅ 取消待确认订单

### 6. 个人中心
- ✅ 用户信息展示
- ✅ 用户统计（订单数、累计消费、待确认订单）
- ✅ 修改个人资料（姓名、手机号、地址）
- ✅ 修改密码
- ✅ 快捷操作（购物车、订单、首页）

## 核心技术实现

### 1. 状态管理 (Pinia)

```javascript
// 用户状态管理
const userStore = useUserStore()
userStore.login(loginForm)        // 登录
userStore.fetchUserInfo()         // 获取用户信息
userStore.logout()                // 登出

// 购物车状态管理
const cartStore = useCartStore()
cartStore.addCart(productId, quantity)  // 加入购物车
cartStore.updateCart(id, quantity)      // 更新数量
cartStore.deleteCart(id)                // 删除商品
cartStore.clearCartAll()                // 清空购物车
```

### 2. 路由鉴权

```javascript
// 路由守卫：未登录用户自动跳转到登录页
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = getToken()

  if (requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})
```

### 3. HTTP 请求拦截

```javascript
// 请求拦截器：自动添加 JWT Token
request.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Token 失效，跳转登录
      removeToken()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

## API 接口说明

### 基础配置
- **Base URL**: `/api` (代理到 http://localhost:3000)
- **认证方式**: JWT Bearer Token
- **请求格式**: JSON
- **响应格式**: JSON

### 主要接口

| 功能 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 登录 | POST | /auth/resident/login | 居民登录 |
| 注册 | POST | /auth/resident/register | 居民注册 |
| 获取用户信息 | GET | /auth/me | 获取当前用户信息 |
| 商品列表 | GET | /products | 获取商品列表 |
| 商品详情 | GET | /products/:id | 获取商品详情 |
| 购物车列表 | GET | /cart | 获取购物车 |
| 添加购物车 | POST | /cart | 添加商品到购物车 |
| 更新购物车 | PUT | /cart/:id | 更新购物车数量 |
| 删除购物车 | DELETE | /cart/:id | 删除购物车商品 |
| 创建订单 | POST | /orders | 创建订单 |
| 订单列表 | GET | /orders | 获取订单列表 |
| 订单详情 | GET | /orders/:id | 获取订单详情 |
| 取消订单 | PUT | /orders/:id/cancel | 取消订单 |

## 常见问题

### 1. 启动项目报错？
- 确保已安装 Node.js 16.x 或更高版本
- 删除 `node_modules` 和 `package-lock.json`，重新 `npm install`
- 检查端口 5174 是否被占用

### 2. 登录失败？
- 确保后端服务已启动（http://localhost:3000）
- 检查数据库是否已初始化
- 使用测试账号登录（zhangsan / 123456）

### 3. 接口请求 404？
- 检查 Vite 代理配置（vite.config.js）
- 确认后端服务运行在 http://localhost:3000
- 查看浏览器控制台的网络请求

### 4. 图片不显示？
- 确保商品数据中包含 `image` 字段
- 检查图片路径是否正确
- 组件已实现错误占位符显示

## 开发规范

### 代码风格
- 使用 Vue 3 Composition API + `<script setup>` 语法
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 使用 ES6+ 语法

### 提交规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具链相关

## 部署说明

### 生产环境部署

1. 构建项目
```bash
npm run build
```

2. 将 `dist/` 目录部署到 Web 服务器（Nginx、Apache 等）

3. 配置 Nginx 反向代理
```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

本项目仅供学习和研究使用。

## 联系方式

如有问题，请通过以下方式联系：
- 项目 Issues
- 项目管理员

---

**祝您使用愉快！** 🎉
