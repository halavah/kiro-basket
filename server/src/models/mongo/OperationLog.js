const mongoose = require('../../config/db.mongo');

const operationLogSchema = new mongoose.Schema({
  user_type: {
    type: String,
    enum: ['captain', 'resident'],
    required: true,
    comment: '用户类型'
  },
  user_id: {
    type: Number,
    required: true,
    comment: '用户ID'
  },
  module: {
    type: String,
    required: true,
    comment: '模块名称:product,order,resident,category'
  },
  action: {
    type: String,
    enum: ['create', 'update', 'delete', 'status_change'],
    required: true,
    comment: '操作类型'
  },
  details: {
    type: String,
    comment: '操作详情'
  },
  ip: {
    type: String,
    comment: 'IP地址'
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
    comment: '操作时间'
  }
}, {
  collection: 'operation_logs',
  versionKey: false
});

// 创建索引
operationLogSchema.index({ user_type: 1, user_id: 1 });
operationLogSchema.index({ module: 1 });
operationLogSchema.index({ created_at: -1 });

module.exports = mongoose.model('OperationLog', operationLogSchema);
