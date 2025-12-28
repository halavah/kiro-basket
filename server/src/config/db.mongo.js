const mongoose = require('mongoose');
require('dotenv').config();

// 连接 MongoDB
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 数据库连接成功');
  } catch (error) {
    console.error('❌ MongoDB 数据库连接失败:', error.message);
    process.exit(1);
  }
};

// 监听连接事件
mongoose.connection.on('connected', () => {
  console.log('MongoDB 连接已建立');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB 连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 连接已断开');
});

connectMongoDB();

module.exports = mongoose;
