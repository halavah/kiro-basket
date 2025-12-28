const { Order, OrderItem, Product, Resident } = require('../models/mysql');
const sequelize = require('../config/db.mysql');
const { Op } = require('sequelize');
const OrderStatusLog = require('../models/mongo/OrderStatusLog');
const StockLog = require('../models/mongo/StockLog');
const Notification = require('../models/mongo/Notification');
const Commission = require('../models/mysql/Commission');

/**
 * 订单服务
 */
class OrderService {
  /**
   * 生成订单编号
   */
  static generateOrderNo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${year}${month}${day}${hour}${minute}${second}${random}`;
  }

  /**
   * 创建订单
   */
  static async createOrder(residentId, cartItems, address, remark) {
    const t = await sequelize.transaction();

    try {
      // 计算订单总额和佣金
      let totalAmount = 0;
      let commissionAmount = 0;
      const orderItems = [];

      for (const item of cartItems) {
        const product = await Product.findByPk(item.product_id);

        if (!product || product.is_deleted === 1 || product.status !== 1) {
          await t.rollback();
          return { success: false, message: `商品【${item.product_id}】不可购买` };
        }

        if (product.stock < item.quantity) {
          await t.rollback();
          return { success: false, message: `商品【${product.name}】库存不足` };
        }

        const subtotal = parseFloat(product.price) * item.quantity;
        totalAmount += subtotal;
        commissionAmount += subtotal * parseFloat(product.commission_rate);

        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          price: product.price,
          subtotal
        });

        // 扣减库存
        const beforeStock = product.stock;
        const afterStock = beforeStock - item.quantity;
        await product.update({ stock: afterStock }, { transaction: t });

        // 记录库存变动
        await StockLog.create({
          product_id: product.id,
          product_name: product.name,
          change_type: 'sale',
          change_quantity: item.quantity,
          before_stock: beforeStock,
          after_stock: afterStock,
          created_at: new Date()
        });

        // 检查库存预警
        if (afterStock <= product.stock_alert) {
          await Notification.create({
            captain_id: 1,
            type: 'stock_alert',
            title: '库存预警',
            content: `商品【${product.name}】库存不足,当前库存:${afterStock},预警值:${product.stock_alert}`,
            is_read: false,
            created_at: new Date()
          });
        }
      }

      // 创建订单
      const orderNo = this.generateOrderNo();
      const order = await Order.create({
        order_no: orderNo,
        resident_id: residentId,
        captain_id: 1,
        total_amount: totalAmount.toFixed(2),
        commission_amount: commissionAmount.toFixed(2),
        address,
        remark,
        status: 0
      }, { transaction: t });

      // 创建订单商品
      for (const item of orderItems) {
        await OrderItem.create({
          order_id: order.id,
          ...item
        }, { transaction: t });
      }

      // 记录订单状态变更
      await OrderStatusLog.create({
        order_id: order.id,
        order_no: orderNo,
        from_status: null,
        to_status: 0,
        created_at: new Date()
      });

      // 生成新订单通知
      await Notification.create({
        captain_id: 1,
        type: 'new_order',
        title: '新订单提醒',
        content: `您有新的订单【${orderNo}】待处理,订单金额:${totalAmount.toFixed(2)}元`,
        is_read: false,
        created_at: new Date()
      });

      await t.commit();

      return {
        success: true,
        data: {
          order_id: order.id,
          order_no: orderNo,
          total_amount: parseFloat(totalAmount.toFixed(2))
        }
      };
    } catch (error) {
      await t.rollback();
      console.error('创建订单失败:', error);
      return { success: false, message: '创建订单失败' };
    }
  }

  /**
   * 确认订单(团长端)
   */
  static async confirmOrder(orderId) {
    try {
      const order = await Order.findByPk(orderId);

      if (!order) {
        return { success: false, message: '订单不存在' };
      }

      if (order.status !== 0) {
        return { success: false, message: '只能确认待确认状态的订单' };
      }

      await order.update({ status: 1 });

      // 记录状态变更
      await OrderStatusLog.create({
        order_id: order.id,
        order_no: order.order_no,
        from_status: 0,
        to_status: 1,
        created_at: new Date()
      });

      return {
        success: true,
        data: { id: order.id, status: 1 }
      };
    } catch (error) {
      console.error('确认订单失败:', error);
      return { success: false, message: '确认订单失败' };
    }
  }

  /**
   * 完成订单(团长端)
   */
  static async completeOrder(orderId) {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, { transaction: t });

      if (!order) {
        await t.rollback();
        return { success: false, message: '订单不存在' };
      }

      if (order.status !== 1) {
        await t.rollback();
        return { success: false, message: '只能完成配送中状态的订单' };
      }

      // 更新订单状态
      await order.update({ status: 2 }, { transaction: t });

      // 创建佣金记录
      await Commission.create({
        captain_id: order.captain_id,
        order_id: order.id,
        amount: order.commission_amount
      }, { transaction: t });

      // 更新商品销量
      const orderItems = await OrderItem.findAll({
        where: { order_id: order.id },
        transaction: t
      });

      for (const item of orderItems) {
        const product = await Product.findByPk(item.product_id, { transaction: t });
        if (product) {
          await product.update({
            sales: product.sales + item.quantity
          }, { transaction: t });
        }
      }

      // 记录状态变更
      await OrderStatusLog.create({
        order_id: order.id,
        order_no: order.order_no,
        from_status: 1,
        to_status: 2,
        created_at: new Date()
      });

      await t.commit();

      return {
        success: true,
        data: {
          id: order.id,
          status: 2,
          commission_amount: parseFloat(order.commission_amount)
        }
      };
    } catch (error) {
      await t.rollback();
      console.error('完成订单失败:', error);
      return { success: false, message: '完成订单失败' };
    }
  }

  /**
   * 支付订单
   */
  static async payOrder(orderId) {
    try {
      const order = await Order.findByPk(orderId);

      if (!order) {
        return { success: false, message: '订单不存在' };
      }

      if (order.status === 3) {
        return { success: false, message: '订单已取消，无法支付' };
      }

      if (order.payment_status === 1) {
        return { success: false, message: '订单已支付' };
      }

      await order.update({
        payment_status: 1,
        paid_at: new Date()
      });

      // 记录状态变更
      await OrderStatusLog.create({
        order_id: order.id,
        order_no: order.order_no,
        from_status: order.status,
        to_status: order.status, // 状态不变，只更新支付状态
        remark: '用户支付成功',
        created_at: new Date()
      });

      return {
        success: true,
        data: {
          id: order.id,
          payment_status: 1,
          paid_at: order.paid_at
        }
      };
    } catch (error) {
      console.error('支付订单失败:', error);
      return { success: false, message: '支付订单失败' };
    }
  }

  /**
   * 取消订单
   */
  static async cancelOrder(orderId, reason) {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, { transaction: t });

      if (!order) {
        await t.rollback();
        return { success: false, message: '订单不存在' };
      }

      if (order.status !== 0) {
        await t.rollback();
        return { success: false, message: '只能取消待确认状态的订单' };
      }

      // 更新订单状态
      await order.update({ status: 3 }, { transaction: t });

      // 恢复库存
      const orderItems = await OrderItem.findAll({
        where: { order_id: order.id },
        transaction: t
      });

      for (const item of orderItems) {
        const product = await Product.findByPk(item.product_id, { transaction: t });
        if (product) {
          const beforeStock = product.stock;
          const afterStock = beforeStock + item.quantity;
          await product.update({ stock: afterStock }, { transaction: t });

          // 记录库存变动
          await StockLog.create({
            product_id: product.id,
            product_name: product.name,
            change_type: 'cancel',
            change_quantity: item.quantity,
            before_stock: beforeStock,
            after_stock: afterStock,
            created_at: new Date()
          });
        }
      }

      // 记录状态变更
      await OrderStatusLog.create({
        order_id: order.id,
        order_no: order.order_no,
        from_status: 0,
        to_status: 3,
        created_at: new Date()
      });

      await t.commit();

      return {
        success: true,
        data: { id: order.id, status: 3 }
      };
    } catch (error) {
      await t.rollback();
      console.error('取消订单失败:', error);
      return { success: false, message: '取消订单失败' };
    }
  }
}

module.exports = OrderService;
