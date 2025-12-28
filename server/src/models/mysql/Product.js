const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.mysql');

const Product = sequelize.define('products', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  category_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '分类ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '商品名称'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '团购价格'
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '原价'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '库存数量'
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '商品图片路径'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商品描述'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态:0下架,1在售'
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: false,
    defaultValue: 0.1000,
    comment: '佣金比例(0-1,例如0.1表示10%)'
  },
  stock_alert: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    comment: '库存预警值'
  },
  sales: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '销量'
  },
  is_deleted: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否删除:0否,1是(软删除)'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  tableName: 'products',
  timestamps: false
});

module.exports = Product;
