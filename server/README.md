# 社区团购管理平台 - 后端服务

## 📋 简介

这是社区团购管理平台的后端服务，使用 Node.js + Express 框架构建，采用 MySQL + MongoDB 双数据库架构。

## 🛠️ 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **Sequelize** - MySQL ORM
- **Mongoose** - MongoDB ODM
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Multer** - 文件上传
- **dotenv** - 环境变量管理

## 🗂️ 项目结构

```
server/
├── app.js                      # 应用入口文件
├── package.json                # 项目依赖配置
├── .env                        # 环境变量配置（需手动创建）
├── uploads/                    # 文件上传目录
└── src/
    ├── config/                 # 配置文件
    │   ├── db.mysql.js        # MySQL 连接配置
    │   └── db.mongo.js        # MongoDB 连接配置
    ├── models/                 # 数据模型
    │   ├── mysql/             # MySQL 模型（8个）
    │   │   ├── Captain.js     # 团长模型
    │   │   ├── Resident.js    # 居民模型
    │   │   ├── Category.js    # 分类模型
    │   │   ├── Product.js     # 商品模型
    │   │   ├── Order.js       # 订单模型
    │   │   ├── OrderItem.js   # 订单明细模型
    │   │   ├── Commission.js  # 佣金模型
    │   │   ├── Cart.js        # 购物车模型
    │   │   └── index.js       # 模型关联配置
    │   └── mongodb/           # MongoDB 模型（6个）
    │       ├── LoginLog.js    # 登录日志
    │       ├── StockLog.js    # 库存日志
    │       ├── Notification.js # 通知
    │       ├── OrderStatusLog.js # 订单状态日志
    │       ├── DashboardStat.js # 统计数据
    │       └── OperationLog.js # 操作日志
    ├── middleware/            # 中间件
    │   ├── auth.middleware.js # 认证中间件
    │   ├── logger.middleware.js # 日志中间件
    │   └── upload.middleware.js # 文件上传中间件
    ├── services/              # 业务逻辑层
    │   ├── auth.service.js    # 认证服务
    │   ├── product.service.js # 商品服务
    │   ├── order.service.js   # 订单服务
    │   ├── commission.service.js # 佣金服务
    │   └── notification.service.js # 通知服务
    ├── controllers/           # 控制器层
    │   ├── auth.controller.js # 认证控制器
    │   ├── category.controller.js # 分类控制器
    │   ├── product.controller.js # 商品控制器
    │   ├── cart.controller.js # 购物车控制器
    │   ├── order.controller.js # 订单控制器
    │   ├── resident.controller.js # 居民控制器
    │   ├── commission.controller.js # 佣金控制器
    │   ├── notification.controller.js # 通知控制器
    │   └── dashboard.controller.js # 数据看板控制器
    ├── routes/                # 路由层
    │   ├── captain.routes.js  # 团长端路由
    │   ├── resident.routes.js # 居民端路由
    │   └── index.js           # 路由聚合
    └── utils/                 # 工具函数
        ├── response.js        # 统一响应格式
        ├── jwt.js             # JWT 工具
        └── bcrypt.js          # 密码加密工具
```

## ⚙️ 环境配置

### 1. 创建 .env 文件

在 `server` 目录下创建 `.env` 文件：

```env
# MySQL 配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=kiro_basket

# MongoDB 配置
MONGO_URI=mongodb://localhost:27017/kiro_basket_logs

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# CORS 配置
CORS_ORIGIN=*

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=2097152
```

### 2. 配置项说明

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `MYSQL_HOST` | MySQL 服务器地址 | localhost |
| `MYSQL_PORT` | MySQL 端口 | 3306 |
| `MYSQL_USER` | MySQL 用户名 | root |
| `MYSQL_PASSWORD` | MySQL 密码 | - |
| `MYSQL_DATABASE` | MySQL 数据库名 | kiro_basket |
| `MONGO_URI` | MongoDB 连接 URI | mongodb://localhost:27017/... |
| `JWT_SECRET` | JWT 密钥（请使用强密码） | - |
| `JWT_EXPIRES_IN` | Token 过期时间 | 7d |
| `PORT` | 服务器端口 | 3000 |
| `NODE_ENV` | 运行环境 | development |
| `CORS_ORIGIN` | 跨域配置 | * |
| `UPLOAD_PATH` | 上传文件路径 | ./uploads |
| `MAX_FILE_SIZE` | 最大文件大小（字节） | 2097152 (2MB) |

## 🚀 启动服务

### 方法一：使用项目管理脚本（推荐）

在项目根目录运行：

**Windows:**
```bash
manage.bat
# 选择选项 1：启动后端服务器
```

**Linux/Mac:**
```bash
./manage.sh
# 选择选项 1：启动后端服务器
```

### 方法二：使用独立启动脚本

在项目根目录运行：

**Windows:**
```bash
bin\start-server.bat
```

**Linux/Mac:**
```bash
bin/start-server.sh
```

### 方法三：手动启动

```bash
# 1. 进入 server 目录
cd server

# 2. 安装依赖（首次运行）
npm install

# 3. 启动开发服务器
npm run dev

# 或启动生产服务器
npm start
```

## 📡 API 接口

服务启动后，API 将运行在：`http://localhost:3000/api`

### 健康检查

```
GET /health
```

### 团长端接口 (`/api/captain`)

| 功能 | 方法 | 路径 | 认证 |
|------|------|------|------|
| 团长登录 | POST | `/captain/login` | ✗ |
| 获取用户信息 | GET | `/captain/info` | ✓ |
| 分类管理 | GET/POST/PUT/DELETE | `/captain/categories` | ✓ |
| 商品管理 | GET/POST/PUT/DELETE/PATCH | `/captain/products` | ✓ |
| 订单管理 | GET/PATCH | `/captain/orders` | ✓ |
| 居民管理 | GET | `/captain/residents` | ✓ |
| 佣金统计 | GET | `/captain/commission` | ✓ |
| 消息通知 | GET/PATCH/DELETE | `/captain/notifications` | ✓ |
| 数据看板 | GET | `/captain/dashboard` | ✓ |

### 居民端接口 (`/api/resident`)

| 功能 | 方法 | 路径 | 认证 |
|------|------|------|------|
| 居民注册 | POST | `/resident/register` | ✗ |
| 居民登录 | POST | `/resident/login` | ✗ |
| 获取用户信息 | GET | `/resident/info` | ✓ |
| 商品浏览 | GET | `/resident/products` | ✓ |
| 购物车管理 | GET/POST/PUT/DELETE | `/resident/cart` | ✓ |
| 订单管理 | GET/POST/PATCH | `/resident/orders` | ✓ |
| 个人信息 | GET/PUT | `/resident/profile` | ✓ |

### 通用接口

| 功能 | 方法 | 路径 | 认证 |
|------|------|------|------|
| 文件上传 | POST | `/api/upload` | ✗ |

## 🔐 身份认证

API 使用 JWT 进行身份认证。

### 认证流程

1. 用户登录后获取 Token
2. 后续请求在 Header 中携带 Token：
   ```
   Authorization: Bearer <your_token>
   ```

### Token 说明

- Token 有效期：7 天（可配置）
- Token 包含信息：用户 ID、用户类型（captain/resident）
- Token 失效后需重新登录

## 📊 数据库架构

### MySQL 数据库

用于存储核心业务数据：
- 用户信息（团长、居民）
- 商品信息
- 订单信息
- 佣金记录
- 购物车数据

### MongoDB 数据库

用于存储日志和统计数据：
- 登录日志
- 库存变动日志
- 操作日志
- 订单状态变更日志
- 统计数据
- 系统通知

## 🔧 开发说明

### 添加新接口

1. 在 `models/` 中创建/修改模型
2. 在 `services/` 中实现业务逻辑
3. 在 `controllers/` 中创建控制器方法
4. 在 `routes/` 中注册路由

### 统一响应格式

所有 API 响应使用统一格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 错误处理

使用 `ResponseUtil` 工具返回标准错误响应：

```javascript
// 成功响应
return ResponseUtil.success(res, data, '操作成功');

// 错误响应
return ResponseUtil.error(res, '错误信息', 400);

// 未授权
return ResponseUtil.unauthorized(res, '未登录');
```

## 📦 依赖说明

### 核心依赖

```json
{
  "express": "^4.18.2",           // Web 框架
  "sequelize": "^6.35.2",         // MySQL ORM
  "mysql2": "^3.6.5",             // MySQL 驱动
  "mongoose": "^8.0.3",           // MongoDB ODM
  "jsonwebtoken": "^9.0.2",       // JWT 认证
  "bcryptjs": "^2.4.3",           // 密码加密
  "multer": "^1.4.5-lts.1",       // 文件上传
  "cors": "^2.8.5",               // CORS 支持
  "dotenv": "^16.3.1"             // 环境变量
}
```

### 开发依赖

```json
{
  "nodemon": "^3.0.2"             // 热重载
}
```

## ⚠️ 注意事项

1. **首次运行前**：
   - 确保已初始化数据库（运行 `server-init` 脚本）
   - 确保已创建 `.env` 文件并配置正确
   - 确保 MySQL 和 MongoDB 服务正在运行

2. **生产环境部署**：
   - 修改 `NODE_ENV=production`
   - 使用强 JWT 密钥
   - 配置合适的 CORS 策略
   - 关闭数据库模型自动同步

3. **安全建议**：
   - 不要将 `.env` 文件提交到版本控制
   - 定期更新依赖包
   - 使用强密码和密钥

## 🐛 故障排除

### 问题：无法连接数据库

**解决方案：**
- 检查数据库服务是否运行
- 验证 `.env` 中的连接信息
- 确认数据库已初始化

### 问题：Token 验证失败

**解决方案：**
- 检查 JWT_SECRET 配置
- 确认 Token 格式正确：`Bearer <token>`
- 检查 Token 是否过期

### 问题：文件上传失败

**解决方案：**
- 确认 `uploads` 目录存在
- 检查文件大小是否超限
- 验证文件类型是否允许

## 📞 技术支持

遇到问题请检查：
1. 环境配置是否正确
2. 数据库是否正常运行
3. 依赖是否完整安装
4. 端口是否被占用
