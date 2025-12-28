# 后端服务器启动问题修复

## 问题描述
后端服务器启动时报错：`Error: Cannot find module 'D:\software_yare\node192\server\src\app.js'`

## 问题原因
1. `package.json` 中的启动脚本指向了错误的路径 `src/app.js`
2. 实际的 `app.js` 文件位于 `server` 根目录，而不是 `src` 目录
3. `app.js` 文件中的导入路径也不正确

## 修复内容

### 1. 修改 package.json (D:\software_yare\node192\server\package.json)
```json
修改前:
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  }

修改后:
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  }
```

### 2. 修改 app.js 中的导入路径 (D:\software_yare\node192\server\app.js)
```javascript
修改前:
const mysqlDb = require('./config/db.mysql');
const mongoDb = require('./config/db.mongo');
const loggerMiddleware = require('./middleware/logger.middleware');
const routes = require('./routes');

修改后:
const mysqlDb = require('./src/config/db.mysql');
const mongoDb = require('./src/config/db.mongo');
const loggerMiddleware = require('./src/middlewares/logger.middleware');
const routes = require('./src/routes');
```

### 3. 修改静态文件路径
```javascript
修改前:
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

修改后:
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

## 项目结构说明
```
server/
├── app.js                    # 主入口文件（根目录）
├── package.json
├── .env
├── uploads/                  # 文件上传目录
└── src/                      # 源代码目录
    ├── config/               # 配置文件
    │   ├── db.mysql.js
    │   ├── db.mongo.js
    │   └── jwt.js
    ├── controllers/          # 控制器
    ├── middlewares/          # 中间件
    │   ├── auth.middleware.js
    │   ├── logger.middleware.js
    │   └── upload.middleware.js
    ├── models/               # 数据模型
    ├── routes/               # 路由
    │   ├── index.js
    │   ├── captain.routes.js
    │   └── resident.routes.js
    ├── services/             # 业务逻辑
    └── utils/                # 工具函数
```

## 启动方式

### Windows
```bash
D:\software_yare\node192\bin\start-server.bat
```

### Linux/Mac
```bash
bash D:\software_yare\node192\bin\start-server.sh
```

### 手动启动
```bash
cd D:\software_yare\node192\server
npm run dev
```

## 验证修复
现在可以再次运行启动脚本，服务器应该能正常启动了。

修复完成时间：2025年12月18日
