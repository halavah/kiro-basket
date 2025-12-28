const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.mysql');

const Commission = sequelize.define('commissions', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  captain_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '团长ID'
  },
  order_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '订单ID'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '佣金金额'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '生成时间'
  }
}, {
  tableName: 'commissions',
  timestamps: false
});

module.exports = Commission;
