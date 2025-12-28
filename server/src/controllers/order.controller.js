const { Order, OrderItem, Product, Resident, Cart } = require('../models/mysql');
const OrderService = require('../services/order.service');
const ResponseUtil = require('../utils/response');
const { Op } = require('sequelize');
const OrderStatusLog = require('../models/mongo/OrderStatusLog');
const { logOperation } = require('../middlewares/logger.middleware');
const ExcelJS = require('exceljs');

/**
 * 订单控制器
 */
class OrderController {
  /**
   * 创建订单(居民端)
   */
  static async createOrder(req, res) {
    try {
      const { cart_ids, address, remark } = req.body;
      const residentId = req.user.id;

      if (!cart_ids || !Array.isArray(cart_ids) || cart_ids.length === 0) {
        return ResponseUtil.error(res, '购物车不能为空');
      }

      if (!address) {
        return ResponseUtil.error(res, '收货地址不能为空');
      }

      // 获取购物车项
      const cartItems = await Cart.findAll({
        where: {
          id: cart_ids,
          resident_id: residentId
        },
        include: [{
          model: Product,
          as: 'product'
        }]
      });

      if (cartItems.length === 0) {
        return ResponseUtil.error(res, '购物车项不存在');
      }

      const items = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      // 创建订单
      const result = await OrderService.createOrder(residentId, items, address, remark);

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      // 删除已下单的购物车项
      await Cart.destroy({
        where: { id: cart_ids }
      });

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'order', 'create', `创建订单:${result.data.order_no},金额:${result.data.total_amount}元`, ip);

      return ResponseUtil.created(res, result.data, '订单创建成功');
    } catch (error) {
      console.error('创建订单错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取订单列表(居民端)
   */
  static async getOrdersForResident(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const { status, payment_status } = req.query;
      const residentId = req.user.id;

      const offset = (page - 1) * pageSize;
      const where = { resident_id: residentId };

      if (status !== undefined && status !== null && status !== '') {
        where.status = parseInt(status);
      }

      if (payment_status !== undefined && payment_status !== null && payment_status !== '') {
        where.payment_status = parseInt(payment_status);
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        attributes: ['id', 'order_no', 'total_amount', 'status', 'created_at'],
        limit: pageSize,
        offset,
        order: [['created_at', 'DESC']]
      });

      const statusMap = { 0: '待确认', 1: '配送中', 2: '已完成', 3: '已取消' };

      const list = await Promise.all(rows.map(async order => {
        const itemCount = await OrderItem.count({ where: { order_id: order.id } });

        return {
          id: order.id,
          order_no: order.order_no,
          total_amount: parseFloat(order.total_amount),
          status: order.status,
          status_text: statusMap[order.status],
          item_count: itemCount,
          created_at: order.created_at
        };
      }));

      return ResponseUtil.success(res, {
        total: count,
        page,
        pageSize,
        list
      });
    } catch (error) {
      console.error('获取订单列表错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取订单详情(居民端)
   */
  static async getOrderDetailForResident(req, res) {
    try {
      const { id } = req.params;
      const residentId = req.user.id;

      const order = await Order.findOne({
        where: { id, resident_id: residentId },
        include: [
          {
            model: Resident,
            as: 'resident',
            attributes: ['id', 'name', 'phone']
          },
          {
            model: OrderItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['image']
            }]
          }
        ]
      });

      if (!order) {
        return ResponseUtil.notFound(res, '订单不存在');
      }

      const statusMap = { 0: '待确认', 1: '配送中', 2: '已完成', 3: '已取消' };

      const data = {
        id: order.id,
        order_no: order.order_no,
        resident_id: order.resident_id,
        resident: {
          name: order.resident.name,
          phone: order.resident.phone
        },
        address: order.address,
        total_amount: parseFloat(order.total_amount),
        status: order.status,
        payment_status: order.payment_status,
        paid_at: order.paid_at,
        status_text: statusMap[order.status],
        created_at: order.created_at,
        items: order.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          subtotal: parseFloat(item.subtotal),
          image: item.product ? item.product.image : ''
        }))
      };

      return ResponseUtil.success(res, data);
    } catch (error) {
      console.error('获取订单详情错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 支付订单(居民端)
   */
  static async payOrder(req, res) {
    try {
      const { id } = req.params;
      const residentId = req.user.id;

      const order = await Order.findOne({
        where: { id, resident_id: residentId }
      });

      if (!order) {
        return ResponseUtil.notFound(res, '订单不存在');
      }

      const result = await OrderService.payOrder(parseInt(id));

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'order', 'pay', `支付订单:${order.order_no},金额:${order.total_amount}`, ip);

      return ResponseUtil.success(res, result.data, '订单支付成功');
    } catch (error) {
      console.error('支付订单错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 取消订单(居民端)
   */
  static async cancelOrderByResident(req, res) {
    try {
      const { id } = req.params;
      const residentId = req.user.id;

      const order = await Order.findOne({
        where: { id, resident_id: residentId }
      });

      if (!order) {
        return ResponseUtil.notFound(res, '订单不存在');
      }

      const result = await OrderService.cancelOrder(parseInt(id));

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'order', 'status_change', `取消订单:${order.order_no}`, ip);

      return ResponseUtil.success(res, result.data, '订单已取消');
    } catch (error) {
      console.error('取消订单错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取订单列表(团长端)
   */
  static async getOrdersForCaptain(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const { status, payment_status, keyword } = req.query;

      const offset = (page - 1) * pageSize;
      const where = {};

      if (status !== undefined && status !== null && status !== '') {
        where.status = parseInt(status);
      }

      if (payment_status !== undefined && payment_status !== null && payment_status !== '') {
        where.payment_status = parseInt(payment_status);
      }

      if (keyword) {
        const resident = await Resident.findOne({
          where: {
            [Op.or]: [
              { name: { [Op.like]: `%${keyword}%` } },
              { phone: { [Op.like]: `%${keyword}%` } }
            ]
          }
        });

        if (resident) {
          where.resident_id = resident.id;
        } else {
          where.order_no = { [Op.like]: `%${keyword}%` };
        }
      }

      const { count, rows } = await Order.findAndCountAll({
        where,
        include: [{
          model: Resident,
          as: 'resident',
          attributes: ['name', 'phone']
        }],
        limit: pageSize,
        offset,
        order: [['created_at', 'DESC']]
      });

      const statusMap = { 0: '待确认', 1: '配送中', 2: '已完成', 3: '已取消' };

      const list = await Promise.all(rows.map(async (order) => {
        const itemCount = await OrderItem.count({ where: { order_id: order.id } });

        return {
          id: order.id,
          order_no: order.order_no,
          resident_name: order.resident.name,
          resident_phone: order.resident.phone,
          total_amount: parseFloat(order.total_amount),
          commission_amount: parseFloat(order.commission_amount),
          item_count: itemCount,
          address: order.address,
          status: order.status,
          payment_status: order.payment_status,
          paid_at: order.paid_at,
          status_text: statusMap[order.status],
          created_at: order.created_at
        };
      }));

      return ResponseUtil.success(res, {
        total: count,
        page,
        pageSize,
        list
      });
    } catch (error) {
      console.error('获取订单列表错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取订单详情(团长端)
   */
  static async getOrderDetailForCaptain(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id, {
        include: [
          {
            model: Resident,
            as: 'resident',
            attributes: ['id', 'name', 'phone']
          },
          {
            model: OrderItem,
            as: 'items'
          }
        ]
      });

      if (!order) {
        return ResponseUtil.notFound(res, '订单不存在');
      }

      // 获取状态流转日志
      const statusLogs = await OrderStatusLog.find({ order_id: parseInt(id) })
        .sort({ created_at: 1 })
        .lean();

      const statusMap = { 0: '待确认', 1: '配送中', 2: '已完成', 3: '已取消' };

      const data = {
        id: order.id,
        order_no: order.order_no,
        resident_id: order.resident_id,
        resident_name: order.resident.name,
        resident_phone: order.resident.phone,
        address: order.address,
        total_amount: parseFloat(order.total_amount),
        commission_amount: parseFloat(order.commission_amount),
        status: order.status,
        payment_status: order.payment_status,
        paid_at: order.paid_at,
        status_text: statusMap[order.status],
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: order.items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          subtotal: parseFloat(item.subtotal)
        })),
        status_logs: statusLogs.map(log => ({
          from_status: log.from_status,
          to_status: log.to_status,
          created_at: log.created_at
        }))
      };

      return ResponseUtil.success(res, data);
    } catch (error) {
      console.error('获取订单详情错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 确认订单(团长端)
   */
  static async confirmOrder(req, res) {
    try {
      const { id } = req.params;

      const result = await OrderService.confirmOrder(parseInt(id));

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      const order = await Order.findByPk(id);

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'order', 'status_change', `确认订单:${order.order_no}`, ip);

      return ResponseUtil.success(res, result.data, '订单已确认');
    } catch (error) {
      console.error('确认订单错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 完成订单(团长端)
   */
  static async completeOrder(req, res) {
    try {
      const { id } = req.params;

      const result = await OrderService.completeOrder(parseInt(id));

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      const order = await Order.findByPk(id);

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'order', 'status_change', `完成订单:${order.order_no}`, ip);

      return ResponseUtil.success(res, result.data, '订单已完成');
    } catch (error) {
      console.error('完成订单错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 取消订单(团长端)
   */
  static async cancelOrderByCaptain(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const result = await OrderService.cancelOrder(parseInt(id), reason);

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      const order = await Order.findByPk(id);

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'order', 'status_change', `取消订单:${order.order_no},原因:${reason}`, ip);

      return ResponseUtil.success(res, result.data, '订单已取消');
    } catch (error) {
      console.error('取消订单错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 导出订单列表(团长端)
   */
  static async exportOrders(req, res) {
    try {
      const { status, startDate, endDate } = req.query;

      const where = {};

      if (status !== undefined && status !== null && status !== '') {
        where.status = parseInt(status);
      }

      if (startDate && endDate) {
        where.created_at = {
          [Op.between]: [new Date(startDate), new Date(endDate + ' 23:59:59')]
        };
      }

      const orders = await Order.findAll({
        where,
        include: [{
          model: Resident,
          as: 'resident',
          attributes: ['name', 'phone']
        }],
        order: [['created_at', 'DESC']]
      });

      const statusMap = { 0: '待确认', 1: '配送中', 2: '已完成', 3: '已取消' };

      // 格式化日期时间
      const formatDateTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      // 创建工作簿
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('订单列表');

      // 定义列
      worksheet.columns = [
        { header: '序号', key: 'index', width: 8 },
        { header: '订单号', key: 'orderNo', width: 20 },
        { header: '居民姓名', key: 'residentName', width: 12 },
        { header: '手机号', key: 'phone', width: 15 },
        { header: '订单金额', key: 'totalAmount', width: 12 },
        { header: '佣金金额', key: 'commission', width: 12 },
        { header: '配送地址', key: 'address', width: 35 },
        { header: '订单状态', key: 'status', width: 12 },
        { header: '下单时间', key: 'createdAt', width: 20 }
      ];

      // 设置表头样式
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // 添加数据
      orders.forEach((order, index) => {
        worksheet.addRow({
          index: index + 1,
          orderNo: order.order_no,
          residentName: order.resident ? order.resident.name : '',
          phone: order.resident ? order.resident.phone : '',
          totalAmount: parseFloat(order.total_amount).toFixed(2),
          commission: parseFloat(order.commission_amount).toFixed(2),
          address: order.address || '',
          status: statusMap[order.status],
          createdAt: formatDateTime(order.created_at)
        });
      });

      // 设置数据行样式
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.alignment = { vertical: 'middle' };
          // 金额列右对齐
          row.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };
          row.getCell(6).alignment = { vertical: 'middle', horizontal: 'right' };
        }
      });

      // 设置响应头
      const filename = `orders_${Date.now()}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

      // 写入响应
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('导出订单错误:', error);
      return ResponseUtil.serverError(res);
    }
  }
}

module.exports = OrderController;
