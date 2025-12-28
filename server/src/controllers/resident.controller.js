const { Resident, Order } = require('../models/mysql');
const ResponseUtil = require('../utils/response');
const { Op } = require('sequelize');
const sequelize = require('../config/db.mysql');

/**
 * 居民管理控制器
 */
class ResidentController {
  /**
   * 获取居民列表(团长端)
   */
  static async getResidents(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const { keyword } = req.query;

      const offset = (page - 1) * pageSize;
      const where = {};

      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } }
        ];
      }

      const { count, rows } = await Resident.findAndCountAll({
        where,
        attributes: ['id', 'username', 'name', 'phone', 'address', 'created_at'],
        limit: pageSize,
        offset,
        order: [['created_at', 'DESC']]
      });

      const list = await Promise.all(rows.map(async resident => {
        // 统计订单数和消费金额
        const orderStats = await Order.findOne({
          attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
            [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
          ],
          where: {
            resident_id: resident.id,
            status: { [Op.in]: [1, 2] } // 配送中和已完成
          },
          raw: true
        });

        // 获取最后下单时间
        const lastOrder = await Order.findOne({
          where: { resident_id: resident.id },
          attributes: ['created_at'],
          order: [['created_at', 'DESC']]
        });

        return {
          id: resident.id,
          username: resident.username,
          name: resident.name,
          phone: resident.phone,
          address: resident.address,
          order_count: parseInt(orderStats.order_count) || 0,
          total_amount: parseFloat(orderStats.total_amount) || 0,
          created_at: resident.created_at,
          last_order_time: lastOrder ? lastOrder.created_at : null
        };
      }));

      return ResponseUtil.success(res, {
        total: count,
        page,
        pageSize,
        list
      });
    } catch (error) {
      console.error('获取居民列表错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取居民详情(团长端)
   */
  static async getResidentDetail(req, res) {
    try {
      const { id } = req.params;

      const resident = await Resident.findByPk(id);

      if (!resident) {
        return ResponseUtil.notFound(res, '居民不存在');
      }

      // 统计数据
      const orderStats = await Order.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount'],
          [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg_amount']
        ],
        where: {
          resident_id: id,
          status: 2 // 已完成
        },
        raw: true
      });

      // 最近订单
      const recentOrders = await Order.findAll({
        where: { resident_id: id },
        attributes: ['id', 'order_no', 'total_amount', 'status', 'created_at'],
        limit: 5,
        order: [['created_at', 'DESC']]
      });

      const statusMap = { 0: '待确认', 1: '配送中', 2: '已完成', 3: '已取消' };

      const data = {
        id: resident.id,
        username: resident.username,
        name: resident.name,
        phone: resident.phone,
        address: resident.address,
        created_at: resident.created_at,
        stats: {
          order_count: parseInt(orderStats.order_count) || 0,
          total_amount: parseFloat(orderStats.total_amount) || 0,
          avg_amount: parseFloat(orderStats.avg_amount) || 0
        },
        recent_orders: recentOrders.map(order => ({
          id: order.id,
          order_no: order.order_no,
          total_amount: parseFloat(order.total_amount),
          status: order.status,
          status_text: statusMap[order.status],
          created_at: order.created_at
        }))
      };

      return ResponseUtil.success(res, data);
    } catch (error) {
      console.error('获取居民详情错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取个人信息(居民端)
   */
  static async getProfile(req, res) {
    try {
      const residentId = req.user.id;

      const resident = await Resident.findByPk(residentId);

      if (!resident) {
        return ResponseUtil.notFound(res, '用户不存在');
      }

      // 统计订单数和消费金额
      const orderStats = await Order.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_amount']
        ],
        where: {
          resident_id: residentId,
          status: 2 // 已完成
        },
        raw: true
      });

      return ResponseUtil.success(res, {
        id: resident.id,
        username: resident.username,
        name: resident.name,
        phone: resident.phone,
        address: resident.address,
        avatar: resident.avatar,
        order_count: parseInt(orderStats.order_count) || 0,
        total_amount: parseFloat(orderStats.total_amount) || 0
      });
    } catch (error) {
      console.error('获取个人信息错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 更新个人信息(居民端)
   */
  static async updateProfile(req, res) {
    try {
      const residentId = req.user.id;
      const { name, phone, address, avatar } = req.body;

      const resident = await Resident.findByPk(residentId);

      if (!resident) {
        return ResponseUtil.notFound(res, '用户不存在');
      }

      // 检查手机号是否被其他用户使用
      if (phone && phone !== resident.phone) {
        const existingPhone = await Resident.findOne({
          where: {
            phone,
            id: { [Op.ne]: residentId }
          }
        });

        if (existingPhone) {
          return ResponseUtil.error(res, '手机号已被其他用户使用');
        }
      }

      const updateData = {
        name: name || resident.name,
        phone: phone || resident.phone,
        address: address !== undefined ? address : resident.address
      };

      // 如果传入了头像路径，则更新头像
      if (avatar !== undefined) {
        updateData.avatar = avatar;
        console.log('📸 更新头像:', avatar);
      }

      await resident.update(updateData);

      return ResponseUtil.success(res, {
        id: resident.id,
        name: resident.name,
        phone: resident.phone,
        address: resident.address,
        avatar: resident.avatar
      }, '信息更新成功');
    } catch (error) {
      console.error('更新个人信息错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 修改密码(居民端)
   */
  static async updatePassword(req, res) {
    try {
      const residentId = req.user.id;
      const { old_password, new_password } = req.body;
      const bcrypt = require('bcryptjs');

      if (!old_password || !new_password) {
        return ResponseUtil.error(res, '原密码和新密码不能为空');
      }

      const resident = await Resident.findByPk(residentId);

      if (!resident) {
        return ResponseUtil.notFound(res, '用户不存在');
      }

      // 验证原密码
      const isMatch = await bcrypt.compare(old_password, resident.password);
      if (!isMatch) {
        return ResponseUtil.error(res, '原密码错误');
      }

      // 加密新密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(new_password, salt);

      await resident.update({
        password: hashedPassword
      });

      return ResponseUtil.success(res, null, '密码修改成功');
    } catch (error) {
      console.error('修改密码错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取居民订单列表(团长端)
   */
  static async getResidentOrders(req, res) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;

      const offset = (page - 1) * pageSize;

      const { count, rows } = await Order.findAndCountAll({
        where: { resident_id: id },
        limit: pageSize,
        offset,
        order: [['created_at', 'DESC']]
      });

      const { OrderItem } = require('../models/mysql');
      const statusMap = { 0: '待确认', 1: '配送中', 2: '已完成', 3: '已取消' };

      const list = await Promise.all(rows.map(async order => {
        const itemCount = await OrderItem.count({ where: { order_id: order.id } });

        return {
          id: order.id,
          order_no: order.order_no,
          total_amount: parseFloat(order.total_amount),
          item_count: itemCount,
          status: order.status,
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
      console.error('获取居民订单列表错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取居民消费统计(团长端)
   */
  static async getResidentStats(req, res) {
    try {
      const { id } = req.params;

      // 统计总订单
      const totalOrders = await Order.count({
        where: { resident_id: id, status: { [Op.in]: [1, 2] } }
      });

      // 统计总消费和平均客单价
      const consumptionStats = await Order.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_consumption'],
          [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg_order_amount']
        ],
        where: {
          resident_id: id,
          status: { [Op.in]: [1, 2] }
        },
        raw: true
      });

      // 统计本月订单
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthlyOrders = await Order.count({
        where: {
          resident_id: id,
          status: { [Op.in]: [1, 2] },
          created_at: { [Op.gte]: firstDayOfMonth }
        }
      });

      return ResponseUtil.success(res, {
        totalOrders: totalOrders || 0,
        total_orders: totalOrders || 0,
        totalConsumption: parseFloat(consumptionStats.total_consumption) || 0,
        total_consumption: parseFloat(consumptionStats.total_consumption) || 0,
        avgOrderAmount: parseFloat(consumptionStats.avg_order_amount) || 0,
        avg_order_amount: parseFloat(consumptionStats.avg_order_amount) || 0,
        monthlyOrders: monthlyOrders || 0,
        monthly_orders: monthlyOrders || 0
      });
    } catch (error) {
      console.error('获取居民消费统计错误:', error);
      return ResponseUtil.serverError(res);
    }
  }
}

module.exports = ResidentController;
