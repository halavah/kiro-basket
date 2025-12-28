const mongoose = require('../../config/db.mongo');

const orderStatusLogSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    required: true,
    comment: '订单ID'
  },
  order_no: {
    type: String,
    required: true,
    comment: '订单编号'
  },
  from_status: {
    type: Number,
    default: null,
    comment: '原状态:null新建,0待确认,1配送中,2已完成,3已取消'
  },
  to_status: {
    type: Number,
    required: true,
    comment: '新状态:0待确认,1配送中,2已完成,3已取消'
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
    comment: '状态变更时间'
  }
}, {
  collection: 'order_status_logs',
  versionKey: false
});

// 创建索引
orderStatusLogSchema.index({ order_id: 1 });
orderStatusLogSchema.index({ order_no: 1 });
orderStatusLogSchema.index({ created_at: -1 });

module.exports = mongoose.model('OrderStatusLog', orderStatusLogSchema);
