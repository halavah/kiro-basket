const { Order, Resident, Product } = require('../models/mysql');
const ResponseUtil = require('../utils/response');
const { Op } = require('sequelize');
const sequelize = require('../config/db.mysql');

/**
 * 数据看板控制器
 */
class DashboardController {
  /**
   * 获取核心指标
   */
  static async getStats(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 今日数据
      const todayOrders = await Order.count({
        where: {
          created_at: { [Op.gte]: today }
        }
      });

      const todaySales = await Order.sum('total_amount', {
        where: {
          created_at: { [Op.gte]: today },
          status: { [Op.in]: [1, 2] } // 配送中和已完成
        }
      });

      const todayCommission = await Order.sum('commission_amount', {
        where: {
          created_at: { [Op.gte]: today },
          status: 2 // 已完成
        }
      });

      const todayResidents = await Resident.count({
        where: {
          created_at: { [Op.gte]: today }
        }
      });

      // 累计数据
      const totalOrders = await Order.count();

      const totalSales = await Order.sum('total_amount', {
        where: {
          status: { [Op.in]: [1, 2] }
        }
      });

      const totalCommission = await Order.sum('commission_amount', {
        where: {
          status: 2
        }
      });

      const totalResidents = await Resident.count();

      // 待处理订单
      const pendingOrders = await Order.count({
        where: { status: 0 }
      });

      // 库存预警
      const stockAlerts = await Product.count({
        where: {
          status: 1,
          is_deleted: 0,
          [Op.and]: [
            sequelize.where(
              sequelize.col('stock'),
              '<=',
              sequelize.col('stock_alert')
            )
          ]
        }
      });

      return ResponseUtil.success(res, {
        today: {
          order_count: todayOrders,
          sales_amount: parseFloat(todaySales) || 0,
          commission: parseFloat(todayCommission) || 0,
          new_residents: todayResidents
        },
        total: {
          order_count: totalOrders,
          sales_amount: parseFloat(totalSales) || 0,
          commission: parseFloat(totalCommission) || 0,
          resident_count: totalResidents
        },
        pending_orders: pendingOrders,
        stock_alerts: stockAlerts
      });
    } catch (error) {
      console.error('获取核心指标错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取销售趋势数据
   */
  static async getSalesTrend(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      const dates = [];
      const sales = [];
      const orders = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);

        // 当日销售额
        const daySales = await Order.sum('total_amount', {
          where: {
            created_at: {
              [Op.gte]: date,
              [Op.lt]: nextDate
            },
            status: { [Op.in]: [1, 2] }
          }
        });

        sales.push(parseFloat(daySales) || 0);

        // 当日订单数
        const dayOrders = await Order.count({
          where: {
            created_at: {
              [Op.gte]: date,
              [Op.lt]: nextDate
            }
          }
        });

        orders.push(dayOrders);
      }

      return ResponseUtil.success(res, {
        dates,
        sales,
        orders
      });
    } catch (error) {
      console.error('获取销售趋势错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取订单状态分布
   */
  static async getOrderStatus(req, res) {
    try {
      const statusMap = {
        0: '待确认',
        1: '配送中',
        2: '已完成',
        3: '已取消'
      };

      const data = [];

      for (let status = 0; status <= 3; status++) {
        const count = await Order.count({ where: { status } });
        data.push({
          name: statusMap[status],
          value: count
        });
      }

      return ResponseUtil.success(res, data);
    } catch (error) {
      console.error('获取订单状态分布错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取商品销售排行
   */
  static async getTopProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;

      const products = await Product.findAll({
        where: {
          status: 1,
          is_deleted: 0
        },
        attributes: [
          'id',
          'name',
          'sales',
          'image',
          [sequelize.literal('price * sales'), 'sales_amount']
        ],
        order: [['sales', 'DESC']],
        limit,
        raw: true
      });

      const data = products.map(p => ({
        id: p.id,
        name: p.name,
        sales: p.sales,
        sales_amount: parseFloat(p.sales_amount) || 0,
        image: p.image
      }));

      return ResponseUtil.success(res, data);
    } catch (error) {
      console.error('获取商品销售排行错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取库存预警商品
   */
  static async getStockAlerts(req, res) {
    try {
      const products = await Product.findAll({
        where: {
          status: 1,
          is_deleted: 0,
          [Op.and]: [
            sequelize.where(
              sequelize.col('stock'),
              '<=',
              sequelize.col('stock_alert')
            )
          ]
        },
        attributes: [
          'id',
          'name',
          'stock',
          'stock_alert',
          'category_id'
        ],
        include: [{
          model: require('../models/mysql/Category'),
          as: 'category',
          attributes: ['name']
        }],
        order: [['stock', 'ASC']],
        limit: 20
      });

      const data = products.map(p => ({
        product_id: p.id,
        product_name: p.name,
        category_name: p.category ? p.category.name : '',
        stock: p.stock,
        stock_alert: p.stock_alert
      }));

      return ResponseUtil.success(res, data);
    } catch (error) {
      console.error('获取库存预警错误:', error);
      return ResponseUtil.serverError(res);
    }
  }
}

module.exports = DashboardController;
