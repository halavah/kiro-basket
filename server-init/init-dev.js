#!/usr/bin/env node
/**
 * 开发环境数据库初始化脚本
 * 独立脚本，包含完整的初始化逻辑
 */

const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════');
console.log('   🗄️  开发环境数据库初始化');
console.log('═══════════════════════════════════════════════════');
console.log('');
console.log('🎯 环境: DEV');
console.log('📁 配置: .env.dev');
console.log('');

// 加载开发环境配置
const configPath = path.join(__dirname, '.env.dev');
if (!fs.existsSync(configPath)) {
  console.error('❌ 配置文件不存在: .env.dev');
  process.exit(1);
}

require('dotenv').config({ path: configPath });

// 数据库配置
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '123456',
  connectTimeout: 10000,
  multipleStatements: true
};

const MYSQL_DB_NAME = process.env.MYSQL_DATABASE || 'kiro_basket';

// MongoDB 配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kiro_basket_logs';

// 从 URI 中提取数据库名
const MONGO_DB_NAME = MONGODB_URI.split('/').pop().split('?')[0];

// SQL 文件路径
const SQL_FILES = {
  schema: path.join(__dirname, 'db', 'mysql', 'schema.sql'),
  seed: path.join(__dirname, 'db', 'mysql', 'seed.sql')
};

// ================================================
// MySQL 初始化
// ================================================
async function initMySQL() {
  let connection;
  try {
    console.log('🔄 开始初始化 MySQL 数据库...');

    connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ MySQL 连接成功');

    // 删除数据库（如果存在）
    console.log(`🗑️  删除数据库 ${MYSQL_DB_NAME}（如果存在）...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${MYSQL_DB_NAME}\`;`);

    // 创建数据库
    console.log(`📦 创建数据库 ${MYSQL_DB_NAME}...`);
    await connection.query(`CREATE DATABASE \`${MYSQL_DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
    await connection.query(`USE \`${MYSQL_DB_NAME}\`;`);

    // 执行 schema.sql
    console.log('📄 执行 schema.sql...');
    const schemaSQL = fs.readFileSync(SQL_FILES.schema, 'utf8');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query(schemaSQL);
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ 数据库结构创建完成');

    // 执行 seed.sql
    console.log('📄 执行 seed.sql...');
    const seedSQL = fs.readFileSync(SQL_FILES.seed, 'utf8');
    await connection.query(seedSQL);
    console.log('✅ 测试数据插入完成');

    // 验证数据
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = '${MYSQL_DB_NAME}'`
    );
    const [captains] = await connection.query(`SELECT COUNT(*) as count FROM ${MYSQL_DB_NAME}.captains`);
    const [residents] = await connection.query(`SELECT COUNT(*) as count FROM ${MYSQL_DB_NAME}.residents`);
    const [products] = await connection.query(`SELECT COUNT(*) as count FROM ${MYSQL_DB_NAME}.products`);

    console.log('📈 数据统计:');
    console.log(`   - 数据表: ${tables.length} 个`);
    console.log(`   - 团长: ${captains[0].count} 条`);
    console.log(`   - 居民: ${residents[0].count} 条`);
    console.log(`   - 商品: ${products[0].count} 条`);

    console.log('✅ MySQL 初始化完成\n');
  } catch (error) {
    console.error('❌ MySQL 初始化失败:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// ================================================
// MongoDB 初始化
// ================================================
async function initMongoDB() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  });

  try {
    console.log('🔄 开始初始化 MongoDB 数据库...');

    await client.connect();
    console.log('✅ MongoDB 连接成功');

    const db = client.db(MONGO_DB_NAME);

    // 删除现有集合
    const existingCollections = await db.listCollections().toArray();
    if (existingCollections.length > 0) {
      console.log(`🗑️  删除 ${existingCollections.length} 个现有集合...`);
      for (const collection of existingCollections) {
        await db.collection(collection.name).drop();
      }
    }

    // 创建集合
    const collections = [
      'login_logs',
      'stock_logs',
      'notifications',
      'order_status_logs',
      'dashboard_stats',
      'operation_logs'
    ];

    console.log('📦 创建集合...');
    for (const name of collections) {
      await db.createCollection(name);
      console.log(`   ✅ ${name}`);
    }

    // 插入示例通知
    await db.collection('notifications').insertOne({
      type: 'system',
      title: '开发环境初始化完成',
      content: '数据库已成功初始化',
      created_at: new Date()
    });

    console.log('✅ MongoDB 初始化完成\n');
  } catch (error) {
    console.error('❌ MongoDB 初始化失败:', error.message);
    throw error;
  } finally {
    await client.close();
  }
}

// ================================================
// 主函数
// ================================================
async function main() {
  try {
    await initMySQL();
    await initMongoDB();

    console.log('═══════════════════════════════════════════════════');
    console.log('   ✅ 开发环境数据库初始化完成！');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('📝 默认测试账号:');
    console.log('   团长端: admin / 123456');
    console.log('   居民端: zhangsan / 123456');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('   ❌ 数据库初始化失败');
    console.error('═══════════════════════════════════════════════════');
    console.error('');
    console.error('错误详情:', error.message);
    console.error('');
    process.exit(1);
  }
}

main();
