# Kiro 系列项目端口分配方案

## 端口分配规范

遵循 Libra 模块端口分配标准：
- **开发环境 (Dev)**: 20xxx
- **测试环境 (Test)**: 21xxx
- **生产环境 (Prod)**: 22xxx

---

## 端口分配表

| 模块分组 | 服务名称 | Dev端口 | Test端口 | Prod端口 | 说明 |
|---------|---------|---------|----------|----------|------|
| **核心业务** | | | | | |
| | kiro-basket (后端API) | **20300** | **21300** | **22300** | 篮球系统主后端服务 |
| | kiro-basket (团长端) | **20301** | **21301** | **22301** | 团长管理前台 |
| | kiro-basket (居民端) | **20302** | **21302** | **22302** | 居民购物前台 |
| **业务模块** | | | | | |
| | kiro-travel | **20310** | **21310** | **22310** | 旅游系统 (Next.js全栈) |
| **内容管理** | | | | | |
| | quartz-flare | **20400** | **21400** | **22400** | JAMstack静态站点 |
| | quartz-online | **20410** | **21410** | **22410** | Next.js静态博客 |

---

## 端口段规划

```
20000-20099  核心入口 (网关、基础服务)
20100-20199  框架示例
20200-20299  基础设施
20300-20399  核心业务 ⭐ Kiro系列主区域
  ├─ 20300-20309  kiro-basket (篮球系统)
  ├─ 20310-20319  kiro-travel (旅游系统)
  └─ 20320-20329  未来扩展
20400-20499  内容管理
  ├─ 20400-20409  quartz-flare
  └─ 20410-20419  quartz-online
```

---

## 配置文件修改清单

### kiro-basket

#### 环境变量文件
- ✅ `server/.env.dev` - PORT=20300
- ✅ `server/.env.test` - PORT=21300
- ✅ `server/.env.prod` - PORT=22300
- ✅ `server/.env.render` - PORT=22300 (Render平台)
- ✅ `server/.env.tencent` - PORT=22300 (腾讯云)

#### 前端配置
- ✅ `client-captain/vite.config.js` - server.port: 20301
- ✅ `client-captain/.env.dev` - VITE_API_BASE_URL=http://localhost:20300/api
- ✅ `client-resident/vite.config.js` - server.port: 20302
- ✅ `client-resident/.env.dev` - VITE_API_BASE_URL=http://localhost:20300/api

### kiro-travel
- ✅ `.env.dev` - PORT=20310
- ✅ `.env.test` - PORT=21310
- ✅ `.env.prod` - PORT=22310
- ✅ `.env.render` - PORT=22310
- ✅ `.env.tencent` - PORT=22310

---

## 快速参考

### 本地开发
```bash
# kiro-basket
cd server && node app-dev.js      # 运行在 20300
cd client-captain && npm run dev  # 运行在 20301
cd client-resident && npm run dev # 运行在 20302

# kiro-travel
npm run dev                       # 运行在 20310
```

### 环境切换
```bash
# 开发环境 (20300)
NODE_ENV=development node app-dev.js

# 测试环境 (21300)
NODE_ENV=test node app-test.js

# 生产环境 (22300)
NODE_ENV=production node app-prod.js
```

---

## 注意事项

1. **端口冲突**: 确保本地没有其他服务占用这些端口
2. **防火墙**: 生产环境需要在防火墙开放对应端口
3. **Nginx反向代理**: 生产环境通常使用 Nginx 反向代理，内部服务端口不需要对外开放
4. **容器化部署**: Docker 容器内部使用配置的端口，映射到宿主机的端口可以自定义

---

*最后更新: 2025-01-02*
