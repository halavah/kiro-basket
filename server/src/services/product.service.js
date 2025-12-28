const { Product, Category } = require('../models/mysql');
const { Op } = require('sequelize');
const StockLog = require('../models/mongo/StockLog');
const Notification = require('../models/mongo/Notification');

/**
 * 商品服务
 */
class ProductService {
  /**
   * 获取商品列表(团长端)
   */
  static async getProductListForCaptain(page, pageSize, category_id, status, keyword) {
    try {
      const offset = (page - 1) * pageSize;
      const where = { is_deleted: 0 };

      if (category_id) {
        where.category_id = category_id;
      }

      if (status !== undefined && status !== null && status !== '') {
        where.status = status;
      }

      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }],
        limit: pageSize,
        offset,
        order: [['created_at', 'DESC']]
      });

      const list = rows.map(product => ({
        id: product.id,
        category_id: product.category_id,
        category_name: product.category ? product.category.name : '',
        name: product.name,
        price: parseFloat(product.price),
        original_price: parseFloat(product.original_price),
        stock: product.stock,
        image: product.image,
        description: product.description,
        status: product.status,
        commission_rate: parseFloat(product.commission_rate),
        stock_alert: product.stock_alert,
        sales: product.sales,
        created_at: product.created_at,
        updated_at: product.updated_at
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
      console.error('获取商品列表失败:', error);
      return { success: false, message: '获取商品列表失败' };
    }
  }

  /**
   * 获取商品列表(居民端) - 只显示在售商品
   */
  static async getProductListForResident(page, pageSize, category_id, keyword) {
    try {
      const offset = (page - 1) * pageSize;
      const where = { is_deleted: 0, status: 1 };

      if (category_id) {
        where.category_id = category_id;
      }

      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }],
        attributes: ['id', 'category_id', 'name', 'price', 'original_price', 'stock', 'image', 'description', 'sales'],
        limit: pageSize,
        offset,
        order: [['sales', 'DESC'], ['created_at', 'DESC']]
      });

      const list = rows.map(product => ({
        id: product.id,
        category_name: product.category ? product.category.name : '',
        name: product.name,
        price: parseFloat(product.price),
        original_price: parseFloat(product.original_price),
        stock: product.stock,
        image: product.image,
        description: product.description,
        sales: product.sales
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
      console.error('获取商品列表失败:', error);
      return { success: false, message: '获取商品列表失败' };
    }
  }

  /**
   * 获取商品详情
   */
  static async getProductDetail(productId) {
    try {
      const product = await Product.findOne({
        where: { id: productId, is_deleted: 0 },
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }]
      });

      if (!product) {
        return { success: false, message: '商品不存在' };
      }

      return {
        success: true,
        data: {
          id: product.id,
          category_id: product.category_id,
          category_name: product.category ? product.category.name : '',
          name: product.name,
          price: parseFloat(product.price),
          original_price: parseFloat(product.original_price),
          unit: product.unit,
          stock: product.stock,
          stock_alert: product.stock_alert,
          image: product.image,
          description: product.description,
          status: product.status,
          sales: product.sales,
          commission_rate: parseFloat(product.commission_rate || 0),
          created_at: product.created_at
        }
      };
    } catch (error) {
      console.error('获取商品详情失败:', error);
      return { success: false, message: '获取商品详情失败' };
    }
  }

  /**
   * 调整库存
   */
  static async adjustStock(productId, changeType, quantity, captainId) {
    try {
      const product = await Product.findByPk(productId);

      if (!product) {
        return { success: false, message: '商品不存在' };
      }

      const beforeStock = product.stock;
      let afterStock = beforeStock;

      if (changeType === 'add') {
        afterStock = beforeStock + quantity;
      } else if (changeType === 'reduce') {
        afterStock = beforeStock - quantity;
        if (afterStock < 0) {
          return { success: false, message: '库存不足' };
        }
      }

      // 更新��存
      await product.update({ stock: afterStock });

      // 记录库存变动日志
      await StockLog.create({
        product_id: product.id,
        product_name: product.name,
        change_type: changeType,
        change_quantity: quantity,
        before_stock: beforeStock,
        after_stock: afterStock,
        created_at: new Date()
      });

      // 检查库存预警
      if (afterStock <= product.stock_alert) {
        await Notification.create({
          captain_id: captainId || 1,
          type: 'stock_alert',
          title: '库存预警',
          content: `商品【${product.name}】库存不足,当前库存:${afterStock},预警值:${product.stock_alert}`,
          is_read: false,
          created_at: new Date()
        });
      }

      return {
        success: true,
        data: {
          id: product.id,
          before_stock: beforeStock,
          after_stock: afterStock,
          change_quantity: quantity
        }
      };
    } catch (error) {
      console.error('调整库存失败:', error);
      return { success: false, message: '调整库存失败' };
    }
  }
}

module.exports = ProductService;
