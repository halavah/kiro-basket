const mongoose = require('../../config/db.mongo');

const stockLogSchema = new mongoose.Schema({
  product_id: {
    type: Number,
    required: true,
    comment: '商品ID'
  },
  product_name: {
    type: String,
    required: true,
    comment: '商品名称'
  },
  change_type: {
    type: String,
    enum: ['sale', 'add', 'cancel'],
    required: true,
    comment: '变动类型:sale销售扣减,add进货增加,cancel取消订单恢复'
  },
  change_quantity: {
    type: Number,
    required: true,
    comment: '变动数量'
  },
  before_stock: {
    type: Number,
    required: true,
    comment: '变动前库存'
  },
  after_stock: {
    type: Number,
    required: true,
    comment: '变动后库存'
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
    comment: '记录时间'
  }
}, {
  collection: 'stock_logs',
  versionKey: false
});

// 创建索引
stockLogSchema.index({ product_id: 1 });
stockLogSchema.index({ created_at: -1 });
stockLogSchema.index({ change_type: 1 });

module.exports = mongoose.model('StockLog', stockLogSchema);
