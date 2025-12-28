#!/usr/bin/env node
/**
 * 数据库连接测试脚本
 * 测试 MySQL 和 MongoDB 连接是否正常
 */

const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

// 数据库配置
const config = {
  mysql: {
    host: 'db4free.net',
    port: 3306,
    user: 'kiro_basket',
    password: 'UE6dzM9T*z6rQv',
    database: 'kiro_basket',
    connectTimeout: 10000
  },
  mongodb: {
    uri: 'mongodb+srv://troyesivens:Hg8dVG18BDFrBqW9@halavah.sbfgy.mongodb.net/kiro_basket_logs?retryWrites=true&w=majority&appName=halavah'
  }
};

// 测试 MySQL 连接
async function testMySQL() {
  console.log('\n🔍 测试 MySQL 连接...');
  console.log('配置信息:', {
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    database: config.mysql.database
  });

  try {
    const connection = await mysql.createConnection(config.mysql);
    console.log('✅ MySQL 连接成功！');

    // 测试查询
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('✅ 查询测试成功:', rows[0]);

    // 检查数据库
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📦 可访问的数据库:', databases.map(db => db.Database));

    // 检查表
    const [tables] = await connection.execute('SHOW TABLES');
    if (tables.length > 0) {
      console.log('📋 现有数据表:', tables.map(t => Object.values(t)[0]));
    } else {
      console.log('⚠️  数据库中还没有表，需要运行初始化脚本');
    }

    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ MySQL 连接失败:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('   💡 提示: 无法解析主机名，请检查网络连接');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   💡 提示: 用户名或密码错误');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   💡 提示: 连接超时，可能是网络问题或服务器不可用');
    }
    return false;
  }
}

// 测试 MongoDB 连接
async function testMongoDB() {
  console.log('\n🔍 测试 MongoDB 连接...');
  console.log('连接地址:', config.mongodb.uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

  const client = new MongoClient(config.mongodb.uri, {
    serverSelectionTimeoutMS: 10000
  });

  try {
    // 连接到 MongoDB
    await client.connect();
    console.log('✅ MongoDB 连接成功！');

    // 获取数据库
    const db = client.db('kiro_basket_logs');

    // 测试写入
    const testCollection = db.collection('connection_test');
    await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: '连接测试成功'
    });
    console.log('✅ 写入测试成功');

    // 测试读取
    const doc = await testCollection.findOne({ test: true });
    console.log('✅ 读取测试成功:', { _id: doc._id, test: doc.test, message: doc.message });

    // 清理测试数据
    await testCollection.deleteMany({ test: true });
    console.log('✅ 清理测试数据完成');

    // 列出所有集合
    const collections = await db.listCollections().toArray();
    if (collections.length > 0) {
      console.log('📦 现有集合:', collections.map(c => c.name));
    } else {
      console.log('⚠️  数据库中还没有集合');
    }

    await client.close();
    return true;
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('   💡 提示: 无法连接到 MongoDB 服务器');
      console.error('   💡 可能原因:');
      console.error('      1. IP 白名单未配置（需要添加 0.0.0.0/0）');
      console.error('      2. 用户名或密码错误');
      console.error('      3. 网络连接问题');
    }
    try {
      await client.close();
    } catch (e) {
      // 忽略关闭错误
    }
    return false;
  }
}

// 主函数
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('    数据库连接测试工具');
  console.log('═══════════════════════════════════════');

  const mysqlOk = await testMySQL();
  const mongodbOk = await testMongoDB();

  console.log('\n═══════════════════════════════════════');
  console.log('测试结果汇总:');
  console.log('═══════════════════════════════════════');
  console.log('MySQL:  ', mysqlOk ? '✅ 正常' : '❌ 失败');
  console.log('MongoDB:', mongodbOk ? '✅ 正常' : '❌ 失败');
  console.log('═══════════════════════════════════════\n');

  if (mysqlOk && mongodbOk) {
    console.log('🎉 所有数据库连接正常！可以开始部署。\n');
    process.exit(0);
  } else {
    console.log('⚠️  部分数据库连接失败，请检查配置后重试。\n');
    process.exit(1);
  }
}

// 运行测试
main().catch(error => {
  console.error('运行出错:', error);
  process.exit(1);
});
