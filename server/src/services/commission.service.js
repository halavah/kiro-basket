const Commission = require('../models/mysql/Commission');
const Order = require('../models/mysql/Order');
const Resident = require('../models/mysql/Resident');
const OrderItem = require('../models/mysql/OrderItem');
const Product = require('../models/mysql/Product');
const { Op } = require('sequelize');
const sequelize = require('../config/db.mysql');

// 确保模型关联已加载
require('../models/mysql');

/**
 * 佣金服务
 */
class CommissionService {
  /**
   * 获取佣金概览
   */
  static async getCommissionOverview(captainId) {
    try {
      // 累计佣金
      const totalResult = await Commission.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
        where: { captain_id: captainId },
        raw: true
      });
      const total_commission = parseFloat(totalResult.total || 0);

      // 今日佣金
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayResult = await Commission.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
        where: {
          captain_id: captainId,
          created_at: { [Op.gte]: today }
        },
        raw: true
      });
      const today_commission = parseFloat(todayResult.total || 0);

      // 本周佣金
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekResult = await Commission.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
        where: {
          captain_id: captainId,
          created_at: { [Op.gte]: weekStart }
        },
        raw: true
      });
      const week_commission = parseFloat(weekResult.total || 0);

      // 本月佣金
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthResult = await Commission.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
        where: {
          captain_id: captainId,
          created_at: { [Op.gte]: monthStart }
        },
        raw: true
      });
      const month_commission = parseFloat(monthResult.total || 0);

      return {
        success: true,
        data: {
          total_commission,
          today_commission,
          week_commission,
          month_commission
        }
      };
    } catch (error) {
      console.error('获取佣金概览失败:', error);
      return { success: false, message: '获取佣金概览失败' };
    }
  }

  /**
   * 获取佣金明细列表
   */
  static async getCommissionList(captainId, page, pageSize, start_date, end_date) {
    try {
      const offset = (page - 1) * pageSize;
      const where = { captain_id: captainId };

      if (start_date && end_date) {
        where.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date + ' 23:59:59')]
        };
      }

      const { count, rows } = await Commission.findAndCountAll({
        where,
        include: [
          {
            model: Order,
            as: 'order',
            attributes: ['id', 'order_no', 'total_amount', 'status', 'resident_id'],
            include: [
              {
                model: Resident,
                as: 'resident',
                attributes: ['name']
              }
            ]
          }
        ],
        limit: pageSize,
        offset,
        order: [['created_at', 'DESC']]
      });

      // 获取每个订单的佣金比例
      const list = await Promise.all(rows.map(async (item) => {
        let commissionRate = 0;

        if (item.order) {
          // 查询该订单的订单项，并关联商品获取佣金比例
          const orderItem = await OrderItem.findOne({
            where: { order_id: item.order_id },
            include: [{
              model: Product,
              as: 'product',
              attributes: ['commission_rate']
            }]
          });

          if (orderItem && orderItem.product) {
            commissionRate = parseFloat(orderItem.product.commission_rate || 0) * 100;
          }
        }

        return {
          id: item.id,
          order_id: item.order_id,
          order_no: item.order ? item.order.order_no : '',
          order_amount: item.order ? parseFloat(item.order.total_amount) : 0,
          commission_amount: parseFloat(item.amount),
          commission_rate: commissionRate,
          resident_name: item.order && item.order.resident ? item.order.resident.name : '',
          status: item.order && item.order.status === 2 ? 1 : 0, // 已完成订单视为已结算
          created_at: item.created_at
        };
      }));

      return {
        success: true,
        data: {
          total: count,
          page,
          pageSize,
          list
        }
      };
    } catch (error) {
      console.error('获取佣金明细失败:', error);
      return { success: false, message: '获取佣金明细失败' };
    }
  }

  /**
   * 获取佣金趋势数据
   */
  static async getCommissionTrend(captainId, days) {
    try {
      const dates = [];
      const commissions = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const dateStr = date.toISOString().split('T')[0];
        dates.push(dateStr);

        // 当日佣金
        const dayCommission = await Commission.sum('amount', {
          where: {
            captain_id: captainId,
            created_at: {
              [Op.gte]: date,
              [Op.lt]: nextDate
            }
          }
        });

        commissions.push(parseFloat(dayCommission) || 0);
      }

      return {
        success: true,
        data: {
          dates,
          commissions
        }
      };
    } catch (error) {
      console.error('获取佣金趋势失败:', error);
      return { success: false, message: '获取佣金趋势失败' };
    }
  }

  /**
   * 导出佣金明细为 CSV
   */
  static async exportCommissions(captainId, start_date, end_date) {
    try {
      const where = { captain_id: captainId };

      if (start_date && end_date) {
        where.created_at = {
          [Op.between]: [new Date(start_date), new Date(end_date + ' 23:59:59')]
        };
      }

      const commissions = await Commission.findAll({
        where,
        include: [{
          model: require('../models/mysql/Order'),
          as: 'order',
          attributes: ['id', 'order_no', 'total_amount']
        }],
        order: [['created_at', 'DESC']]
      });

      // 生成 CSV 内容
      let csv = '\uFEFF'; // UTF-8 BOM for Excel compatibility
      csv += '序号,订单号,订单金额,佣金金额,创建时间\n';

      commissions.forEach((item, index) => {
        csv += `${index + 1},`;
        csv += `${item.order ? item.order.order_no : ''},`;
        csv += `${item.order ? parseFloat(item.order.total_amount).toFixed(2) : '0.00'},`;
        csv += `${parseFloat(item.amount).toFixed(2)},`;
        csv += `${item.created_at}\n`;
      });

      return {
        success: true,
        data: csv
      };
    } catch (error) {
      console.error('导出佣金明细失败:', error);
      return { success: false, message: '导出佣金明细失败' };
    }
  }
}

module.exports = CommissionService;
