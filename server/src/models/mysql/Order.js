const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.mysql');

const Order = sequelize.define('orders', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  order_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '订单编号(唯一)'
  },
  resident_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '居民ID'
  },
  captain_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
    comment: '团长ID(默认为1)'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '订单总金额'
  },
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '佣金金额'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '收货地址'
  },
  remark: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '订单备注'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '订单状态:0待确认,1配送中,2已完成,3已取消'
  },
  payment_status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '支付状态:0未支付,1已支付'
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '下单时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  tableName: 'orders',
  timestamps: false
});

module.exports = Order;
