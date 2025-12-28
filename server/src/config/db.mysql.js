const { Sequelize } = require('sequelize');
require('dotenv').config();

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    timezone: '+08:00',
    define: {
      timestamps: false,
      freezeTableName: true
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: false
  }
);

// 测试连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL 数据库连接成功');
  } catch (error) {
    console.error('❌ MySQL 数据库连接失败:', error.message);
    process.exit(1);
  }
};

testConnection();

module.exports = sequelize;
