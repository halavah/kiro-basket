# 数据库初始化工具

## 📋 简介

这是社区团购管理平台的数据库初始化工具，用于自动创建和初始化 MySQL 和 MongoDB 数据库。

## 🗂️ 文件结构

```
server-init/
├── db/                    # 数据库文件目录
│   └── mysql/            # MySQL 数据库文件
│       ├── schema.sql    # 数据库结构定义
│       └── seed.sql      # 测试数据
├── db.config.env          # 数据库配置文件（需手动配置）
├── server-init.js       # 数据库初始化脚本
├── package.json           # 项目依赖配置
└── README.md              # 本文档
```

## ⚙️ 配置说明

### 1. 配置数据库连接信息

编辑 `db.config.env` 文件，配置你的数据库连接信息：

```env
# MySQL 配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=123456

# MongoDB 配置
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB_NAME=kiro_basket_logs

# 数据库名称
MYSQL_DB_NAME=kiro_basket
```

### 2. 配置项说明

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `MYSQL_HOST` | MySQL 服务器地址 | localhost |
| `MYSQL_PORT` | MySQL 端口 | 3306 |
| `MYSQL_USER` | MySQL 用户名 | root |
| `MYSQL_PASSWORD` | MySQL 密码 | 123456 |
| `MONGO_HOST` | MongoDB 服务器地址 | localhost |
| `MONGO_PORT` | MongoDB 端口 | 27017 |
| `MONGO_DB_NAME` | MongoDB 数据库名称 | kiro_basket_logs |
| `MYSQL_DB_NAME` | MySQL 数据库名称 | kiro_basket |

## 🚀 使用方法

### 方法一：使用项目管理脚本（推荐）

在项目根目录运行管理脚本：

**Windows:**
```bash
manage.bat
# 选择选项 4：初始化数据库
```

**Linux/Mac:**
```bash
./manage.sh
# 选择选项 4：初始化数据库
```

### 方法二：使用独立启动脚本

在项目根目录运行：

**Windows:**
```bash
bin\init-db.bat
```

**Linux/Mac:**
```bash
bin/init-db.sh
```

### 方法三：手动执行

```bash
# 1. 进入 server-init 目录
cd server-init

# 2. 安装依赖（首次运行）
npm install

# 3. 执行初始化脚本
npm run init
```

## 📊 初始化内容

### MySQL 数据库

初始化脚本会创建以下数据表：

1. **captains** - 团长信息表
2. **residents** - 居民信息表（包含头像字段）
3. **categories** - 商品分类表
4. **products** - 商品信息表
5. **orders** - 订单表
6. **order_items** - 订单明细表
7. **commissions** - 佣金记录表
8. **cart** - 购物车表（包含选中状态字段）
9. **addresses** - 收货地址表（新增）
10. **favorites** - 商品收藏表（新增）
11. **order_reviews** - 订单评价表（新增）

**新增功能特性：**
- 居民端支持头像管理
- 购物车支持选中/取消选中功能
- 支持多收货地址管理
- 支持商品收藏功能
- 支持订单评价功能（包含评分和图片）

### MongoDB 数据库

初始化脚本会创建以下集合：

1. **login_logs** - 登录日志
2. **stock_logs** - 库存变动日志
3. **notifications** - 系统通知
4. **order_status_logs** - 订单状态变更日志
5. **dashboard_stats** - 数据统计
6. **operation_logs** - 操作日志

## ✅ 初始化验证

初始化成功后，脚本会输出以下信息：

```
========================================
🎉 所有数据库初始化完成！
========================================
MySQL 数据库: kiro_basket
MongoDB 数据库: kiro_basket_logs
========================================

📊 数据库表数量: 11
📈 数据统计:
   - 团长: 1 条
   - 居民: 5 条
   - 商品: 20 条
   - 订单: 10 条
   - 收货地址: 6 条
   - 商品收藏: 9 条
   - 订单评价: 6 条

📊 集合总数: 6
```

## ⚠️ 注意事项

1. **数据库权限**：确保配置的 MySQL 用户有创建数据库和表的权限
2. **数据覆盖**：初始化会删除已存在的数据库和集合，请谨慎操作
3. **网络连接**：确保 MySQL 和 MongoDB 服务正在运行且可访问
4. **文件路径**：确保 SQL 文件路径配置正确且文件存在

## 🔧 故障排除

### 问题：MySQL 连接失败

**解决方案：**
- 检查 MySQL 服务是否运行
- 验证 `db.config.env` 中的连接信息是否正确
- 确认 MySQL 端口未被防火墙阻止

### 问题：MongoDB 连接失败

**解决方案：**
- 检查 MongoDB 服务是否运行
- 验证 `db.config.env` 中的连接信息是否正确
- 确认 MongoDB 端口未被防火墙阻止

### 问题：SQL 文件找不到

**解决方案：**
- 确认 `db/mysql/schema.sql` 和 `db/mysql/seed.sql` 文件存在
- 检查文件路径是否正确（相对于 server-init 目录）
- 确保文件有读取权限

## 📦 依赖说明

```json
{
  "mysql2": "^3.6.5",      // MySQL 数据库驱动
  "mongodb": "^6.3.0",     // MongoDB 数据库驱动
  "dotenv": "^16.3.1"      // 环境变量加载工具
}
```

## 🔄 重新初始化

如果需要重新初始化数据库：

1. 再次运行初始化脚本即可
2. 脚本会自动删除旧数据并重新创建

**警告：** 重新初始化会清空所有现有数据！

## 📂 数据库文件说明

### schema.sql
包含完整的数据库结构定义，包括：
- 11 个数据表的创建语句
- 所有表的索引定义
- 外键约束配置

### seed.sql
包含测试数据，包括：
- 1 个团长账户（用户名: admin，密码: 123456）
- 5 个居民账户（用户名: zhangsan/lisi/wangwu/zhaoliu/sunqi，密码: 123456）
- 5 个商品分类
- 20 个测试商品
- 10 个测试订单
- 6 个收货地址
- 9 条商品收藏记录
- 6 条订单评价记录

## 📞 技术支持

如遇问题，请检查：
1. 数据库服务是否正常运行
2. 配置文件是否正确填写
3. 网络连接是否正常
4. SQL 文件是否存在于 `db/mysql/` 目录
