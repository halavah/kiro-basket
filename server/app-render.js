const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: '.env.render' });

const app = express();

// 导入数据库连接
const mysqlDb = require('./src/config/db.mysql');
const mongoDb = require('./src/config/db.mongo');

// 导入数据库初始化工具
const { initializeDatabases } = require('./src/utils/database-initializer');

// 导入中间件
const { loggerMiddleware } = require('./src/middlewares/logger.middleware');

// 导入路由
const routes = require('./src/routes');

/**
 * 中间件配置
 */

// CORS跨域
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
    : '*',
  credentials: true
}));

// Body解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 - 使用 server 目录下的 uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 请求日志
app.use(loggerMiddleware);

/**
 * 路由配置
 */
app.use('/api', routes);

// 根路径 - 服务器信息
app.get('/', (_req, res) => {
  res.json({
    name: '社区团购管理平台 API - Render',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'production',
    platform: 'Render',
    endpoints: {
      api: '/api',
      health: '/health',
      uploads: '/uploads'
    },
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mysql: mysqlDb.connectionManager.pool ? 'connected' : 'disconnected',
    mongodb: mongoDb.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('全局错误:', err);

  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || '服务器内部错误',
    data: null
  });
});

/**
 * 数据库连接和服务启动
 */
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 连接MySQL
    await mysqlDb.authenticate();
    console.log('MySQL数据库连接成功');

    // 初始化数据库（检查并创建表结构和数据）
    await initializeDatabases(mysqlDb, mongoDb);

    // 同步模型（开发环境使用，生产环境建议使用迁移）
    if (process.env.NODE_ENV === 'development') {
      await mysqlDb.sync({ alter: false });
      console.log('MySQL模型同步完成');
    }

    // MongoDB连接在db.mongo.js中自动处理

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`平台: Render`);
      console.log(`API地址: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  await mysqlDb.close();
  await mongoDb.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  await mysqlDb.close();
  await mongoDb.connection.close();
  process.exit(0);
});

// 启动服务器
startServer();

module.exports = app;
