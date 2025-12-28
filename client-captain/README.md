# 社区团购管理平台 - 团长端前端

## 项目说明

这是社区团购管理平台的团长端前端项目，使用 Vue 3 + Element Plus 构建。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **UI 库**: Element Plus
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **HTTP 请求**: Axios
- **图表库**: ECharts
- **构建工具**: Vite

## 项目结构

```
client-captain/
├── public/                    # 静态资源
├── src/
│   ├── api/                   # API 接口封装
│   │   ├── request.js         # Axios 基础配置
│   │   ├── auth.js            # 认证相关接口
│   │   ├── product.js         # 商品相关接口
│   │   ├── order.js           # 订单相关接口
│   │   ├── resident.js        # 居民相关接口
│   │   ├── commission.js      # 佣金相关接口
│   │   ├── notification.js    # 通知相关接口
│   │   └── dashboard.js       # 数据看板接口
│   ├── assets/                # 资源文件
│   │   ├── css/               # 样式文件
│   │   └── images/            # 图片文件
│   ├── components/            # 公共组件
│   │   ├── Header.vue         # 顶部导航栏
│   │   ├── Sidebar.vue        # 侧边导航栏
│   │   └── StatCard.vue       # 数据卡片组件
│   ├── router/                # 路由配置
│   │   └── index.js
│   ├── store/                 # Pinia 状态管理
│   │   ├── index.js
│   │   ├── user.js            # 用户状态
│   │   └── app.js             # 应用状态
│   ├── views/                 # 页面组件
│   │   ├── Login/             # 登录页
│   │   ├── Layout/            # 布局组件
│   │   ├── Dashboard/         # 数据看板
│   │   ├── Product/           # 商品管理
│   │   ├── Order/             # 订单管理
│   │   ├── Resident/          # 居民管理
│   │   ├── Commission/        # 佣金统计
│   │   └── Notification/      # 消息通知
│   ├── App.vue                # 根组件
│   └── main.js                # 入口文件
├── index.html                 # HTML 模板
├── vite.config.js             # Vite 配置
└── package.json               # 项目配置

```

## 功能模块

### 1. 用户认证
- 团长登录
- 退出登录
- 路由守卫

### 2. 数据看板
- 今日/累计数据统计
- 销售趋势图表
- 订单状态分布
- 热销商品排行
- 待处理订单快捷入口
- 库存预警快捷入口

### 3. 商品管理
- 商品列表（搜索、筛选、分页）
- 添加/编辑商品
- 商品上下架
- 调整库存
- 删除商品
- 分类管理

### 4. 订单管理
- 订单列表（按状态筛选）
- 订单详情
- 确认订单
- 标记配送中
- 完成订单
- 取消订单
- 导出订单

### 5. 居民管理
- 居民列表
- 居民详情
- 居民订单记录
- 居民消费统计

### 6. 佣金统计
- 今日/本月/累计佣金
- 佣金趋势图表
- 佣金明细列表
- 日期筛选
- 导出佣金明细

### 7. 消息通知
- 通知列表（全部/未读/已读）
- 标记已读
- 全部标为已读
- 删除通知
- 删除已读通知
- 实时未读数量显示

## 开发说明

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:5173 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## API 配置

后端 API 地址配置在 `src/api/request.js` 中：

```javascript
baseURL: 'http://localhost:3000/api/captain'
```

## 注意事项

1. 默认登录用户名：admin，密码：123456
2. Token 存储在 localStorage 中
3. 路由守卫会验证登录状态
4. 未读通知每 30 秒自动更新一次
5. 部分页面（订单管理、居民管理等）为占位页面，需要进一步完善

## 已完成功能

- ✅ 项目初始化
- ✅ 路由配置
- ✅ API 接口封装
- ✅ Pinia 状态管理
- ✅ 登录页面
- ✅ 布局组件（Header + Sidebar）
- ✅ 数据看板页面（含图表）
- ✅ 商品列表页面（含搜索筛选）
- ✅ 商品表单页面（添加/编辑）

## 待完善功能

- 🔲 完善订单管理页面
- 🔲 完善居民管理页面
- 🔲 完善佣金统计页面
- 🔲 完善消息通知页面
- 🔲 完善商品分类管理页面
- 🔲 添加图片上传功能
- 🔲 添加数据导出功能
- 🔲 优化移动端响应式布局

## License

ISC
