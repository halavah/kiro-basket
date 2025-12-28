const mongoose = require('../../config/db.mongo');

const notificationSchema = new mongoose.Schema({
  captain_id: {
    type: Number,
    required: true,
    comment: '团长ID'
  },
  type: {
    type: String,
    enum: ['stock_alert', 'new_order'],
    required: true,
    comment: '通知类型:stock_alert库存预警,new_order新订单'
  },
  title: {
    type: String,
    required: true,
    comment: '通知标题'
  },
  content: {
    type: String,
    required: true,
    comment: '通知内容'
  },
  related_id: {
    type: Number,
    comment: '关联ID（订单ID或商品ID）'
  },
  is_read: {
    type: Boolean,
    required: true,
    default: false,
    comment: '是否已读'
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
    comment: '创建时间'
  }
}, {
  collection: 'notifications',
  versionKey: false
});

// 创建索引
notificationSchema.index({ captain_id: 1, is_read: 1 });
notificationSchema.index({ created_at: -1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
