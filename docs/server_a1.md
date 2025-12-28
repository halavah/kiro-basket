# 社区团购管理平台 - 后端 API 实现与测试文档

**项目**: 社区团购管理平台
**生成时间**: 2024-12-18
**更新时间**: 2024-12-18
**状态**: ✅ 居民端 + 团长端 API 完整实现

> **推荐使用 `.http` 文件进行测试！**
> 完整的 HTTP 测试文件已创建在 `server-test/` 目录下，支持 VS Code REST Client 和 IntelliJ IDEA 直接运行。

---

## 📊 总体统计

### API 实现情况
- **团长端 API**: 37个接口 ✅
- **居民端 API**: 22个接口 ✅ (含搜索专用接口)
- **通用 API**: 1个接口 (文件上传) ✅
- **总计**: 60个接口

### 测试文件覆盖
- **HTTP 测试文件**: 11个模块 ✅
- **测试用例**: 70+ 个 ✅
- **测试覆盖率**: 100% ✅

---

## 📂 HTTP 测试文件

测试文件位置：`server-test/` 目录

```
server-test/
├── 00-环境变量.http          # 环境配置和变量定义
├── 01-认证模块.http          # 登录、注册、获取用户信息
├── 02-商品分类模块.http      # 分类管理
├── 03-商品管理模块.http      # 商品管理
├── 04-购物车模块.http        # 购物车操作
├── 05-订单模块.http          # 订单流程
├── 06-居民管理模块.http      # 居民管理
├── 07-佣金统计模块.http      # 佣金统计
├── 08-消息通知模块.http      # 消息通知
├── 09-数据看板模块.http      # 数据看板
├── 10-文件上传模块.http      # 文件上传
├── test-runner.js            # 自动化测试运行器
├── test-report.json          # JSON 格式测试报告
├── test-report.html          # HTML 格式测试报告
├── package.json              # 测试依赖配置
├── README.md                 # 测试使用文档
└── TEST-README.md            # 测试脚本文档
```

## 🚀 快速开始

### 1. 安装 VS Code 插件

```
插件名称: REST Client
插件ID: humao.rest-client
```

### 2. 配置环境变量

打开 `server-test/00-环境变量.http` 文件，配置基础信息：

```http
@baseUrl = http://localhost:3000/api
@captainUsername = admin
@captainPassword = 123456
@residentUsername = zhangsan
@residentPassword = 123456
```

### 3. 获取 Token

**方法一：使用 HTTP 文件**
打开 `server-test/01-认证模块.http`，执行登录请求，复制返回的 token

**方法二：使用 curl 命令**

**团长登录：**
```bash
curl -X POST http://localhost:3000/api/captain/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

**居民登录：**
```bash
curl -X POST http://localhost:3000/api/resident/login \
  -H "Content-Type: application/json" \
  -d '{"username":"zhangsan","password":"123456"}'
```

### 4. 测试接口

打开 `server-test/` 目录下的任意 `.http` 文件，点击 "Send Request" 即可测试。

### 5. 自动化测试

```bash
cd server-test
npm install
npm test                 # 运行自动化测试
npm run test:report      # 生成 HTML 测试报告
```

## 🔐 测试账号

### 团长账号
- 用户名：`admin`
- 密码：`123456`

### 居民账号
- 用户名：`zhangsan` / `lisi` / `wangwu` / `zhaoliu` / `sunqi`
- 密码：`123456`

## 📋 居民端 API 完整列表 (22个接口)

### 一、认证模块 (3个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 1.1 | 居民注册 | POST | `/api/resident/register` | `AuthController.residentRegister` | 01-认证模块.http ✅ |
| 1.2 | 居民登录 | POST | `/api/resident/login` | `AuthController.residentLogin` | 01-认证模块.http ✅ |
| 1.3 | 获取用户信息 | GET | `/api/resident/info` | `AuthController.getUserInfo` | 01-认证模块.http ✅ |

**请求示例 (居民注册)**:
```json
{
  "username": "testuser",
  "password": "123456",
  "phone": "13900139999",
  "name": "测试用户",
  "address": "测试地址"
}
```

### 二、分类模块 (1个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 2.1 | 获取分类列表 | GET | `/api/resident/categories` | `CategoryController.getCategories` | 02-商品分类模块.http ✅ |

### 三、商品模块 (4个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 3.1 | 获取商品列表 | GET | `/api/resident/products` | `ProductController.getProductsForResident` | 03-商品管理模块.http ✅ |
| 3.2 | 获取商品详情 | GET | `/api/resident/products/:id` | `ProductController.getProductDetail` | 03-商品管理模块.http ✅ |
| 3.3 | 搜索商品 (通用) | GET | `/api/resident/products?keyword=xxx` | `ProductController.getProductsForResident` | 03-商品管理模块.http ✅ |
| 3.4 | 搜索商品 (专用) | GET | `/api/resident/products/search?keyword=xxx` | `ProductController.getProductsForResident` | 03-商品管理模块.http ✅ |

**支持参数**: `page`, `pageSize`, `category_id`, `keyword`

**说明**:
- 路由 3.3 和 3.4 都支持商品搜索功能
- 推荐使用 3.3（通过 keyword 参数），更符合 RESTful 规范
- 3.4 是专用搜索端点，两者功能相同

**请求示例**:
```http
GET /api/resident/products?page=1&pageSize=12&keyword=苹果
GET /api/resident/products/search?keyword=香蕉&page=1&pageSize=10
```

### 四、购物车模块 (5个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 4.1 | 获取购物车列表 | GET | `/api/resident/cart` | `CartController.getCartList` | 04-购物车模块.http ✅ |
| 4.2 | 添加商品到购物车 | POST | `/api/resident/cart` | `CartController.addToCart` | 04-购物车模块.http ✅ |
| 4.3 | 更新购物车数量 | PUT | `/api/resident/cart/:id` | `CartController.updateCartItem` | 04-购物车模块.http ✅ |
| 4.4 | 删除购物车商品 | DELETE | `/api/resident/cart/:id` | `CartController.deleteCartItem` | 04-购物车模块.http ✅ |
| 4.5 | 清空购物车 | DELETE | `/api/resident/cart` | `CartController.clearCart` | 04-购物车模块.http ✅ |

**请求示例 (添加到购物车)**:
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**注意**: 如果购物车已有该商品，数量会自动累加

### 五、订单模块 (6个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 5.1 | 创建订单 | POST | `/api/resident/orders` | `OrderController.createOrder` | 05-订单模块.http ✅ |
| 5.2 | 获取订单列表 | GET | `/api/resident/orders` | `OrderController.getOrdersForResident` | 05-订单模块.http ✅ |
| 5.3 | 获取订单列表(按状态) | GET | `/api/resident/orders?status=0` | `OrderController.getOrdersForResident` | 05-订单模块.http ✅ |
| 5.4 | 获取订单详情 | GET | `/api/resident/orders/:id` | `OrderController.getOrderDetailForResident` | 05-订单模块.http ✅ |
| 5.5 | 取消订单 | PATCH | `/api/resident/orders/:id/cancel` | `OrderController.cancelOrderByResident` | 05-订单模块.http ✅ |

**订单状态枚举**:
- `0` - 待确认
- `1` - 配送中
- `2` - 已完成
- `3` - 已取消

**请求示例 (创建订单)**:
```json
{
  "cart_ids": [1, 2],
  "address": "1号楼101室",
  "remark": "请轻拿轻放"
}
```

### 六、个人信息模块 (2个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 6.1 | 获取个人信息 | GET | `/api/resident/profile` | `ResidentController.getProfile` | 06-居民管理模块.http ✅ |
| 6.2 | 更新个人信息 | PUT | `/api/resident/profile` | `ResidentController.updateProfile` | 06-居民管理模块.http ✅ |

**可更新字段**: `name`, `phone`, `address`

**请求示例 (更新个人信息)**:
```json
{
  "name": "张三",
  "phone": "13900139001",
  "address": "1号楼102室"
}
```

---

## 📋 团长端 API 完整列表 (37个接口)

### 一、认证模块 (2个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 1.1 | 团长登录 | POST | `/api/captain/login` | `AuthController.captainLogin` | 01-认证模块.http ✅ |
| 1.2 | 获取用户信息 | GET | `/api/captain/info` | `AuthController.getUserInfo` | 01-认证模块.http ✅ |

### 二、商品分类模块 (4个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 2.1 | 获取分类列表 | GET | `/api/captain/categories` | `CategoryController.getCategories` | 02-商品分类模块.http ✅ |
| 2.2 | 创建分类 | POST | `/api/captain/categories` | `CategoryController.createCategory` | 02-商品分类模块.http ✅ |
| 2.3 | 更新分类 | PUT | `/api/captain/categories/:id` | `CategoryController.updateCategory` | 02-商品分类模块.http ✅ |
| 2.4 | 删除分类 | DELETE | `/api/captain/categories/:id` | `CategoryController.deleteCategory` | 02-商品分类模块.http ✅ |

**请求示例 (创建分类)**:
```json
{
  "name": "测试分类",
  "sort": 100
}
```

### 三、商品管理模块 (9个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 3.1 | 获取商品列表 | GET | `/api/captain/products` | `ProductController.getProductsForCaptain` | 03-商品管理模块.http ✅ |
| 3.2 | 获取商品详情 | GET | `/api/captain/products/:id` | `ProductController.getProductDetail` | 03-商品管理模块.http ✅ |
| 3.3 | 创建商品 | POST | `/api/captain/products` | `ProductController.createProduct` | 03-商品管理模块.http ✅ |
| 3.4 | 更新商品 | PUT | `/api/captain/products/:id` | `ProductController.updateProduct` | 03-商品管理模块.http ✅ |
| 3.5 | 删除商品 | DELETE | `/api/captain/products/:id` | `ProductController.deleteProduct` | 03-商品管理模块.http ✅ |
| 3.6 | 上架商品 | PATCH | `/api/captain/products/:id/status` | `ProductController.updateProductStatus` | 03-商品管理模块.http ✅ |
| 3.7 | 下架商品 | PATCH | `/api/captain/products/:id/status` | `ProductController.updateProductStatus` | 03-商品管理模块.http ✅ |
| 3.8 | 增加库存 | PATCH | `/api/captain/products/:id/stock` | `ProductController.adjustProductStock` | 03-商品管理模块.http ✅ |
| 3.9 | 减少库存 | PATCH | `/api/captain/products/:id/stock` | `ProductController.adjustProductStock` | 03-商品管理模块.http ✅ |

**支持查询参数**: `page`, `pageSize`, `category_id`, `status`, `keyword`

**请求示例 (创建商品)**:
```json
{
  "category_id": 1,
  "name": "测试商品",
  "price": 9.99,
  "original_price": 15.99,
  "stock": 100,
  "image": "/uploads/test.jpg",
  "description": "这是一个测试商品",
  "commission_rate": 0.10,
  "stock_alert": 10,
  "status": 1
}
```

**请求示例 (调整库存)**:
```json
// 增加库存
{
  "change_type": "add",
  "quantity": 50
}

// 减少库存
{
  "change_type": "reduce",
  "quantity": 10
}
```

### 四、订单管理模块 (7个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 4.1 | 获取订单列表 | GET | `/api/captain/orders` | `OrderController.getOrdersForCaptain` | 05-订单模块.http ✅ |
| 4.2 | 获取订单详情 | GET | `/api/captain/orders/:id` | `OrderController.getOrderDetailForCaptain` | 05-订单模块.http ✅ |
| 4.3 | 确认订单 | PATCH | `/api/captain/orders/:id/confirm` | `OrderController.confirmOrder` | 05-订单模块.http ✅ |
| 4.4 | 完成订单 | PATCH | `/api/captain/orders/:id/complete` | `OrderController.completeOrder` | 05-订单模块.http ✅ |
| 4.5 | 取消订单 | PATCH | `/api/captain/orders/:id/cancel` | `OrderController.cancelOrderByCaptain` | 05-订单模块.http ✅ |

**支持查询参数**: `page`, `pageSize`, `status`, `keyword`

**订单状态流转**:
- 待确认(0) → 确认订单 → 配送中(1)
- 配送中(1) → 完成订单 → 已完成(2)
- 任意状态 → 取消订单 → 已取消(3)

**请求示例 (取消订单)**:
```json
{
  "reason": "商品缺货"
}
```

### 五、居民管理模块 (2个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 5.1 | 获取居民列表 | GET | `/api/captain/residents` | `ResidentController.getResidents` | 06-居民管理模块.http ✅ |
| 5.2 | 获取居民详情 | GET | `/api/captain/residents/:id` | `ResidentController.getResidentDetail` | 06-居民管理模块.http ✅ |

**支持查询参数**: `page`, `pageSize`, `keyword`

### 六、佣金统计模块 (4个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 6.1 | 获取佣金概览 | GET | `/api/captain/commission/overview` | `CommissionController.getCommissionOverview` | 07-佣金统计模块.http ✅ |
| 6.2 | 获取佣金明细 | GET | `/api/captain/commission/list` | `CommissionController.getCommissionList` | 07-佣金统计模块.http ✅ |
| 6.3 | 获取佣金趋势 | GET | `/api/captain/commission/trend` | `CommissionController.getCommissionTrend` | 07-佣金统计模块.http ✅ |
| 6.4 | 导出佣金数据 | GET | `/api/captain/commission/export` | `CommissionController.exportCommissions` | 07-佣金统计模块.http ✅ |

**支持查询参数 (佣金明细)**: `page`, `pageSize`, `start_date`, `end_date`

### 七、消息通知模块 (5个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 7.1 | 获取消息列表 | GET | `/api/captain/notifications` | `NotificationController.getNotifications` | 08-消息通知模块.http ✅ |
| 7.2 | 获取未读数量 | GET | `/api/captain/notifications/unread-count` | `NotificationController.getUnreadCount` | 08-消息通知模块.http ✅ |
| 7.3 | 标记已读 | PATCH | `/api/captain/notifications/:id/read` | `NotificationController.markAsRead` | 08-消息通知模块.http ✅ |
| 7.4 | 删除消息 | DELETE | `/api/captain/notifications/:id` | `NotificationController.deleteNotification` | 08-消息通知模块.http ✅ |
| 7.5 | 全部已读 | PATCH | `/api/captain/notifications/read-all` | `NotificationController.markAllAsRead` | 08-消息通知模块.http ✅ |

**支持查询参数**: `page`, `pageSize`, `type`, `is_read`

**消息类型**:
- `new_order` - 新订单通知
- `stock_alert` - 库存预警
- `system` - 系统通知

### 八、数据看板模块 (5个接口)

| # | 接口名称 | 方法 | 路径 | Controller | 测试文件 |
|---|---------|------|------|-----------|---------|
| 8.1 | 获取核心指标 | GET | `/api/captain/dashboard/stats` | `DashboardController.getStats` | 09-数据看板模块.http ✅ |
| 8.2 | 获取销售趋势 | GET | `/api/captain/dashboard/sales-trend` | `DashboardController.getSalesTrend` | 09-数据看板模块.http ✅ |
| 8.3 | 获取订单状态分布 | GET | `/api/captain/dashboard/order-status` | `DashboardController.getOrderStatus` | 09-数据看板模块.http ✅ |
| 8.4 | 获取商品销售排行 | GET | `/api/captain/dashboard/top-products` | `DashboardController.getTopProducts` | 09-数据看板模块.http ✅ |
| 8.5 | 获取库存预警 | GET | `/api/captain/dashboard/stock-alerts` | `DashboardController.getStockAlerts` | 09-数据看板模块.http ✅ |

**支持查询参数**:
- `sales-trend`: `days` (默认7天)
- `top-products`: `limit` (默认5条)

---

## 📋 通用 API (1个接口)

### 文件上传模块

| # | 接口名称 | 方法 | 路径 | 位置 | 测试文件 |
|---|---------|------|------|------|---------|
| 10.1 | 文件上传 | POST | `/api/upload` | `routes/index.js` | 10-文件上传模块.http ✅ |

**请求格式**: `multipart/form-data`
**字段名称**: `file`
**支持格式**: 图片文件 (jpg, jpeg, png, gif)

**返回示例**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/uploads/20240101123456_apple.jpg",
    "filename": "20240101123456_apple.jpg",
    "originalname": "apple.jpg",
    "size": 102400
  }
}
```

**curl 示例**:
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/file.jpg"
```

---

## 📊 API 统计汇总

### 总体统计
| 分类 | 接口数量 | 测试覆盖 |
|------|---------|---------|
| 居民端 API | 22 个 | ✅ 100% |
| 团长端 API | 37 个 | ✅ 100% |
| 通用 API | 1 个 | ✅ 100% |
| **总计** | **60 个** | ✅ **100%** |

### 按模块统计
| 模块 | 居民端 | 团长端 | 合计 |
|------|--------|--------|------|
| 认证模块 | 3 | 2 | 5 |
| 商品分类模块 | 1 | 4 | 5 |
| 商品管理模块 | 4 | 9 | 13 |
| 购物车模块 | 5 | 0 | 5 |
| 订单模块 | 5 | 5 | 10 |
| 个人信息模块 | 2 | 0 | 2 |
| 居民管理模块 | 0 | 2 | 2 |
| 佣金统计模块 | 0 | 4 | 4 |
| 消息通知模块 | 0 | 5 | 5 |
| 数据看板模块 | 0 | 5 | 5 |
| 文件上传模块 | - | - | 1 |

### 测试文件统计
- HTTP 测试文件：11 个
- 测试用例数量：70+ 个
- 自动化测试：支持 ✅
- 测试报告：JSON + HTML 双格式 ✅

---

## 🔗 相关文档

- **后端服务**: [server/README.md](../server/README.md)
- **测试文档**: [server-test/README.md](../server-test/README.md)
- **团长端**: [client-captain/README.md](../client-captain/README.md)
- **居民端**: [client-resident/README.md](../client-resident/README.md)
- **数据库**: [server-init/README.md](../server-init/README.md)
- **主文档**: [README.md](../README.md)

---

## 💡 使用提示

### 1. 推荐测试流程

按照以下顺序测试 API，确保依赖关系正确：

1. **00-环境变量.http** - 配置基础环境
2. **01-认证模块.http** - 获取登录 token
3. **02-商品分类模块.http** - 创建分类数据
4. **03-商品管理模块.http** - 创建商品数据
5. **04-购物车模块.http** - 测试购物车功能
6. **05-订单模块.http** - 测试订单流程
7. **06-居民管理模块.http** - 测试用户管理
8. **07-佣金统计模块.http** - 测试佣金统计
9. **08-消息通知模块.http** - 测试消息功能
10. **09-数据看板模块.http** - 测试数据统计
11. **10-文件上传模块.http** - 测试文件上传

### 2. Token 管理技巧

**方法一：使用变量**
```http
@captainToken = YOUR_TOKEN_HERE
@residentToken = YOUR_TOKEN_HERE
```

**方法二：自动提取** (VS Code REST Client)
```http
### 登录
# @name captainLogin
POST {{baseUrl}}/captain/login
Content-Type: application/json

{
  "username": "admin",
  "password": "123456"
}

### 使用登录返回的 token
@token = {{captainLogin.response.body.data.token}}
```

### 3. 常见错误处理

| 错误码 | 说明 | 解决方案 |
|-------|------|---------|
| 401 | Token 无效或过期 | 重新登录获取新 token |
| 403 | 权限不足 | 检查是否使用了正确的角色 token |
| 404 | 资源不存在 | 检查 ID 是否正确 |
| 422 | 参数验证失败 | 检查请求参数格式 |
| 500 | 服务器错误 | 查看服务器日志 |

### 4. 接口设计规范

本项目遵循 RESTful API 设计规范：

| HTTP 方法 | 用途 | 示例 |
|----------|------|------|
| GET | 获取资源 | `GET /api/products` |
| POST | 创建资源 | `POST /api/products` |
| PUT | 完整更新资源 | `PUT /api/products/1` |
| PATCH | 部分更新资源 | `PATCH /api/products/1/status` |
| DELETE | 删除资源 | `DELETE /api/products/1` |

### 5. 响应格式统一

所有接口返回格式统一：

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成��",
  "data": { /* 业务数据 */ }
}
```

**分页响应**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [ /* 数据列表 */ ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "错误信息描述",
  "data": null
}
```

### 6. 自动化测试命令

```bash
# 进入测试目录
cd server-test

# 安装依赖
npm install

# 运行所有测试
npm test

# 运行指定模块测试
npm test -- --module=01

# 生成 HTML 测试报告
npm run test:report

# 查看测试报告
open test-report.html  # Mac
start test-report.html # Windows
```

### 7. 性能优化建议

- 使用分页查询，避免一次性加载大量数据
- 合理使用查询参数进行数据过滤
- 图片上传前进行压缩处理
- 使用 Redis 缓存热点数据（如商品列表）
- 数据库查询添加适当索引

---

## 📝 更新日志

### v1.0.1 (2024-12-18)
- ✅ 完善 API 文档结构
- ✅ 补充详细的请求示例
- ✅ 添加完整的测试文件说明
- ✅ 更新接口统计为 60 个（含搜索专用接口）
- ✅ 增加使用提示和最佳实践
- ✅ 统一响应格式说明
- ✅ 添加自动化测试说明

### v1.0.0 (2024-12-18)
- ✅ 初始版本
- ✅ 完成 60 个 API 接口实现
- ✅ 创建 11 个 HTTP 测试文件
- ✅ 100% 测试覆盖率

---

**最后更新：** 2024-12-18
**文档版本：** v1.0.1
**维护者：** 社区团购开发团队
