const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.mysql');

const Resident = sequelize.define('residents', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码(加密存储)'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '手机号'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '真实姓名'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '收货地址'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像路径'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '注册时间'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  tableName: 'residents',
  timestamps: false
});

module.exports = Resident;
