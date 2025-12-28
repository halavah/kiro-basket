# 数据库自动初始化系统

## 功能说明

每次启动服务器（`npm run dev` 或 `npm run prod`）时，系统会自动检查并初始化数据库。

### 自动执行流程

1. **检查 MySQL 表是否存在**
   - 如果表不存在，执行 `schema.sql` 创建所有表结构
   - 然后执行 `seed.sql` 插入初始数据

2. **检查 MongoDB 集合是否存在**
   - 如果集合不存在，创建所有集合和索引
   - 插入样例日志数据

3. **幂等性保证**
   - 多次运行不会重复创建或插入数据
   - 如果表/集合已存在，自动跳过初始化

## 文件结构

```
server/
├── db/
│   ├── mysql/
│   │   ├── schema.sql    # MySQL 表结构定义
│   │   └── seed.sql      # MySQL 初始数据
│   └── mongodb/
│       └── init.js       # MongoDB 集合和索引定义
└── src/
    └── utils/
        └── database-initializer.js  # 初始化工具
```

## 使用方式

### 1. 生产环境启动
```bash
npm run prod
```

### 2. 开发环境启动
```bash
npm run dev
```

启动时会自动执行数据库初始化检查。

## 初始化日志示例

```
========================================
🔄 开始数据库初始化检查...
========================================

开始初始化 MySQL 数据库...
执行 SQL 文件: schema.sql
✓ SQL 文件执行完成: schema.sql
执行 SQL 文件: seed.sql
✓ SQL 文件执行完成: seed.sql
✓ MySQL 数据库初始化完成

开始初始化 MongoDB 数据库...
✓ 创建集合: login_logs
  创建索引: 3 个
✓ 创建集合: stock_logs
  创建索引: 3 个
...
✓ MongoDB 数据库初始化完成

========================================
✅ 数据库初始化完成
========================================
```

## 注意事项

1. **MySQL 初始化失败会阻止服务启动**
   - 确保 MySQL 配置正确（`.env.prod` 或 `.env.dev`）
   - 确保数据库连接可用

2. **MongoDB 初始化失败不会阻止服务启动**
   - MongoDB 主要用于日志记录
   - 即使初始化失败，服务仍可正常运行

3. **初始数据说明**
   - 包含 2 个团长账号（admin / li_captain，密码均为 123456）
   - 包含 20 个居民账号
   - 包含 65 个商品
   - 包含 160 个订单
   - 所有密码已使用 bcrypt 加密

## 重置数据库

如果需要重置数据库，可以删除所有表后重新启动服务器：

```sql
-- MySQL
DROP DATABASE IF EXISTS kiro_basket;
CREATE DATABASE kiro_basket DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

然后重新启动服务器，数据库会自动重新初始化。
