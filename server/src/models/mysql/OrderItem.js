const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.mysql');

const OrderItem = sequelize.define('order_items', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  order_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '订单ID'
  },
  product_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '商品ID'
  },
  product_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '商品名称(冗余存储,防止商品删除后无法查看)'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '购买数量'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '商品单价'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '小计金额'
  }
}, {
  tableName: 'order_items',
  timestamps: false
});

module.exports = OrderItem;
