# client-captain API 对比表

**项目**: 社区团购管理平台 - 团长端
**生成时间**: 2024-12-18
**状态**: ⚠️ 待修复路径问题

---

## 一、API 路径对照表

### 1. 认证模块

| 功能 | 前端调用路径 | 后端标准路径 | 文件位置 | 问题描述 | 状态 |
|------|------------|------------|---------|---------|------|
| 团长登录 | `/captain/login` | `/api/captain/login` | `auth.js:9` | ✅ 正确（需配合baseURL修改） | 待修复 |
| 退出登录 | `/captain/logout` | - | `auth.js:20` | ⚠️ 后端未实现此接口 | - |
| 获取团长信息 | `/captain/info` | `/api/captain/info` | `auth.js:30` | ✅ 正确（需配合baseURL修改） | 待修复 |

---

### 2. 商品分类模块

| 功能 | 前端调用路径 | 后端标准路径 | 文件位置 | 问题描述 | 状态 |
|------|------------|------------|---------|---------|------|
| 获取分类列表 | `/categories` | `/api/captain/categories` | `product.js:93` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 创建分类 | `/categories` | `/api/captain/categories` | `product.js:104` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 更新分类 | `/categories/:id` | `/api/captain/categories/:id` | `product.js:117` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 删除分类 | `/categories/:id` | `/api/captain/categories/:id` | `product.js:129` | ❌ 缺少 `/captain` 前缀 | 待修复 |

---

### 3. 商品管理模块

| 功能 | 前端调用路径 | 后端标准路径 | 文件位置 | 问题描述 | 状态 |
|------|------------|------------|---------|---------|------|
| 获取商品列表 | `/products` | `/api/captain/products` | `product.js:9` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 获取商品详情 | `/products/:id` | `/api/captain/products/:id` | `product.js:21` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 创建商品 | `/products` | `/api/captain/products` | `product.js:32` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 更新商品 | `/products/:id` | `/api/captain/products/:id` | `product.js:45` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 删除商品 | `/products/:id` | `/api/captain/products/:id` | `product.js:57` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 上架/下架商品 | `/products/:id/status` | `/api/captain/products/:id/status` | `product.js:69` | ❌ 缺少 `/captain` 前缀<br>❌ HTTP方法错误：`PUT`应为`PATCH` | 待修复 |
| 调整商品库存 | `/products/:id/stock` | `/api/captain/products/:id/stock` | `product.js:82` | ❌ 缺少 `/captain` 前缀<br>❌ HTTP方法错误：`PUT`应为`PATCH`<br>❌ 参数错误：`{stock}`应为`{change_type, quantity}` | 待修复 |

---

### 4. 订单管理模块

| 功能 | 前端调用路径 | 后端标准路径 | 文件位置 | 问题描述 | 状态 |
|------|------------|------------|---------|---------|------|
| 获取订单列表 | `/orders` | `/api/captain/orders` | `order.js` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 获取订单详情 | `/orders/:id` | `/api/captain/orders/:id` | `order.js` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 确认订单 | `/orders/:id/confirm` | `/api/captain/orders/:id/confirm` | `order.js` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 完成订单 | `/orders/:id/complete` | `/api/captain/orders/:id/complete` | `order.js` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 取消订单 | `/orders/:id/cancel` | `/api/captain/orders/:id/cancel` | `order.js` | ❌ 缺少 `/captain` 前缀 | 待修复 |

---

### 5. 居民管理模块

| 功能 | 前端调用路径 | 后端标准路径 | 文件位置 | 问题描述 | 状态 |
|------|------------|------------|---------|---------|------|
| 获取居民列表 | `/residents` | `/api/captain/residents` | `resident.js` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 获取居民详情 | `/residents/:id` | `/api/captain/residents/:id` | `resident.js` | ❌ 缺少 `/captain` 前缀 | 待修复 |

---

### 6. 佣金统计模块

| 功能 | 前端调用路径 | 后端标准路径 | 文件位置 | 问题描述 | 状态 |
|------|------------|------------|---------|---------|------|
| 获取佣金概览 | `/commissions/stats` | `/api/captain/commission/overview` | `commission.js:9` | ❌ 缺少 `/captain` 前缀<br>❌ 接口名不匹配：`/commissions/stats` → `/commission/overview` | 待修复 |
| 获取佣金明细列表 | `/commissions` | `/api/captain/commission/list` | `commission.js:21` | ❌ 缺少 `/captain` 前缀<br>❌ 接口名不匹配：`/commissions` → `/commission/list` | 待修复 |
| 获取佣金趋势 | `/commissions/trend` | `/api/captain/commission/trend` | `commission.js:33` | ❌ 缺少 `/captain` 前缀<br>✅ 后端已新增此接口 | 待修复 |
| 导出佣金明细 | `/commissions/export` | `/api/captain/commission/export` | `commission.js:45` | ❌ 缺少 `/captain` 前缀<br>✅ 后端已新增此接口 | 待修复 |

---

### 7. 消息通知模块

| 功能 | 前端调用路径 | 后端标准路径 | 文件位置 | 问题描述 | 状态 |
|------|------------|------------|---------|---------|------|
| 获取通知列表 | `/notifications` | `/api/captain/notifications` | `notification.js` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 获取未读数量 | `/notifications/unread-count` | `/api/captain/notifications/unread-count` | `notification.js` | ❌ 缺少 `/captain` 前缀<br>✅ 后端已新增此接口 | 待修复 |
| 标记已读 | `/notifications/:id/read` | `/api/captain/notifications/:id/read` | `notification.js` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 删除通知 | `/notifications/:id` | `/api/captain/notifications/:id` | `notification.js` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 全部已读 | `/notifications/read-all` | `/api/captain/notifications/read-all` | `notification.js` | ❌ 缺少 `/captain` 前缀 | 待修复 |

---

### 8. 数据看板模块

| 功能 | 前端调用路径 | 后端标准路径 | 文件位置 | 问题描述 | 状态 |
|------|------------|------------|---------|---------|------|
| 获取核心指标 | `/dashboard/stats` | `/api/captain/dashboard/stats` | `dashboard.js:8` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 获取销售趋势 | `/dashboard/sales-trend` | `/api/captain/dashboard/sales-trend` | `dashboard.js:19` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 获取订单状态分布 | `/dashboard/order-status` | `/api/captain/dashboard/order-status` | `dashboard.js:30` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 获取热销商品 | `/dashboard/top-products` | `/api/captain/dashboard/top-products` | `dashboard.js:40` | ❌ 缺少 `/captain` 前缀 | 待修复 |
| 获取库存预警 | `/dashboard/stock-alerts` | `/api/captain/dashboard/stock-alerts` | `dashboard.js:50` | ❌ 缺少 `/captain` 前缀<br>✅ 后端已新增此接口 | 待修复 |

---

## 二、问题汇总

### 统计数据

- **总接口数**: 35 个
- **需要修复**: 34 个
- **后端缺失**: 1 个（退出登录接口）
- **后端新增**: 4 个（佣金趋势、佣金导出、未读数量、库存预警）

### 问题分类

1. **路径前缀缺失** (34个)
   - 所有接口都缺少 `/captain` 前缀
   - 原因：`baseURL` 只配置了 `/api`，未包含 `/captain`

2. **接口命名不一致** (2个)
   - 佣金概览：`/commissions/stats` → `/commission/overview`
   - 佣金明细：`/commissions` → `/commission/list`

3. **HTTP方法错误** (2个)
   - 商品状态更新：`PUT` → `PATCH`
   - 商品库存调整：`PUT` → `PATCH`

4. **参数结构错误** (1个)
   - 库存调整参数：`{stock}` → `{change_type, quantity}`

---

## 三、修复方案

### 方案A: 修改 baseURL (推荐)

**优点**:
- 一次性解决所有路径前缀问题
- 代码修改量最小
- 统一管理 API 前缀

**需要修改的文件**:

#### 1. request.js (1处修改)
```javascript
// 文件: client-captain/src/api/request.js:6
// 修改前
baseURL: 'http://localhost:3000/api'

// 修改后
baseURL: 'http://localhost:3000/api/captain'
```

#### 2. auth.js (3处修改)
```javascript
// 文件: client-captain/src/api/auth.js

// Line 9: 登录接口
url: '/captain/login' → url: '/login'

// Line 20: 退出接口
url: '/captain/logout' → url: '/logout'

// Line 30: 获取信息
url: '/captain/info' → url: '/info'
```

#### 3. commission.js (4处修改)
```javascript
// 文件: client-captain/src/api/commission.js

// Line 9: 佣金统计
url: '/commissions/stats' → url: '/commission/overview'

// Line 21: 佣金明细
url: '/commissions' → url: '/commission/list'

// Line 33: 佣金趋势
url: '/commissions/trend' → url: '/commission/trend'

// Line 45: 佣金导出
url: '/commissions/export' → url: '/commission/export'
```

#### 4. product.js (2处修改)
```javascript
// 文件: client-captain/src/api/product.js

// Line 69: 商品状态更新
method: 'put' → method: 'patch'

// Line 82-84: 库存调整
method: 'put' → method: 'patch'
data: { stock } → data: { change_type, quantity }
```

**总计**: 需修改 **4个文件**，**10处代码**

---

## 四、后端新增接口说明

以下接口是为了支持前端功能而新增的：

### 1. 获取佣金趋势
- **接口**: `GET /api/captain/commission/trend?days=7`
- **说明**: 用于绘制佣金趋势图表
- **状态**: ✅ 已实现

### 2. 导出佣金明细
- **接口**: `GET /api/captain/commission/export?start_date=xxx&end_date=xxx`
- **说明**: 导出佣金明细为 CSV 文件
- **状态**: ✅ 已实现

### 3. 获取未读通知数量
- **接口**: `GET /api/captain/notifications/unread-count`
- **说明**: 单独获取未读通知数量，用于显示角标
- **状态**: ✅ 已实现

### 4. 获取库存预警商品
- **接口**: `GET /api/captain/dashboard/stock-alerts`
- **说明**: 获取库存低于预警值的商品列表
- **状态**: ✅ 已实现

---

## 五、修复进度

- [ ] 修改 request.js baseURL
- [ ] 修改 auth.js 接口路径
- [ ] 修改 commission.js 接口路径
- [ ] 修改 product.js HTTP方法和参数
- [ ] 测试所有接口连通性
- [ ] 更新前端API文档

---

## 六、注意事项

1. **baseURL 修改后影响范围**
   - 所有通过 request.js 发起的请求都会自动添加 `/captain` 前缀
   - auth.js 中已经手动添加了 `/captain` 前缀的需要去掉

2. **参数调整说明**
   - 库存调整接口需要修改调用代码，传入正确的参数结构：
     ```javascript
     // 修改前
     updateProductStock(id, stock)

     // 修改后
     updateProductStock(id, { change_type: 'add', quantity: 50 })
     ```

3. **接口命名一致性**
   - 佣金相关接口统一为单数 `commission` 而非 `commissions`
   - 注意区分 `/stats` 和 `/overview` 的语义差异

4. **后端退出登录接口**
   - 前端有调用 `/logout` 接口，但后端未实现
   - 建议：前端直接清除本地 token，无需调用后端

---

**文档版本**: v1.0
**最后更新**: 2024-12-18
**维护者**: Claude Code Agent
