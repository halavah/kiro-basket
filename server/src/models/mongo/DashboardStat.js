const mongoose = require('../../config/db.mongo');

const dashboardStatSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    comment: '日期:YYYY-MM-DD'
  },
  daily_orders: {
    type: Number,
    required: true,
    default: 0,
    comment: '当日订单数'
  },
  daily_sales: {
    type: Number,
    required: true,
    default: 0,
    comment: '当日销售额'
  },
  daily_commission: {
    type: Number,
    required: true,
    default: 0,
    comment: '当日佣金'
  },
  new_residents: {
    type: Number,
    required: true,
    default: 0,
    comment: '新增居民数'
  },
  top_products: {
    type: [{
      product_id: { type: Number, required: true },
      name: { type: String, required: true },
      sales: { type: Number, required: true }
    }],
    default: [],
    comment: '热销商品列表'
  }
}, {
  collection: 'dashboard_stats',
  versionKey: false
});

// 创建索引
dashboardStatSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('DashboardStat', dashboardStatSchema);
