/**
 * MySQL 模型关联关系
 */

const Captain = require('./Captain');
const Resident = require('./Resident');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Commission = require('./Commission');
const Cart = require('./Cart');

// 商品 -> 分类 (多对一)
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

// 订单 -> 居民 (多对一)
Order.belongsTo(Resident, { foreignKey: 'resident_id', as: 'resident' });
Resident.hasMany(Order, { foreignKey: 'resident_id', as: 'orders' });

// 订单 -> 团长 (多对一)
Order.belongsTo(Captain, { foreignKey: 'captain_id', as: 'captain' });
Captain.hasMany(Order, { foreignKey: 'captain_id', as: 'orders' });

// 订单商品 -> 订单 (多对一)
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

// 订单商品 -> 商品 (多对一)
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

// 佣金 -> 团长 (多对一)
Commission.belongsTo(Captain, { foreignKey: 'captain_id', as: 'captain' });
Captain.hasMany(Commission, { foreignKey: 'captain_id', as: 'commissions' });

// 佣金 -> 订单 (多对一)
Commission.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasOne(Commission, { foreignKey: 'order_id', as: 'commission' });

// 购物车 -> 居民 (多对一)
Cart.belongsTo(Resident, { foreignKey: 'resident_id', as: 'resident' });
Resident.hasMany(Cart, { foreignKey: 'resident_id', as: 'cartItems' });

// 购物车 -> 商品 (多对一)
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartItems' });

module.exports = {
  Captain,
  Resident,
  Category,
  Product,
  Order,
  OrderItem,
  Commission,
  Cart
};
