const mongoose = require('../../config/db.mongo');

const loginLogSchema = new mongoose.Schema({
  user_type: {
    type: String,
    enum: ['captain', 'resident'],
    required: true,
    comment: '用户类型:captain团长,resident居民'
  },
  user_id: {
    type: Number,
    required: true,
    comment: '用户ID'
  },
  username: {
    type: String,
    required: true,
    comment: '用户名'
  },
  ip: {
    type: String,
    required: true,
    comment: '登录IP地址'
  },
  login_time: {
    type: Date,
    required: true,
    default: Date.now,
    comment: '登录时间'
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true,
    comment: '登录状态:success成功,failed失败'
  }
}, {
  collection: 'login_logs',
  versionKey: false
});

// 创建索引
loginLogSchema.index({ user_type: 1, user_id: 1 });
loginLogSchema.index({ login_time: -1 });
loginLogSchema.index({ status: 1 });

module.exports = mongoose.model('LoginLog', loginLogSchema);
