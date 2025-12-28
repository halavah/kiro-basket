const { Product, Category } = require('../models/mysql');
const ProductService = require('../services/product.service');
const ResponseUtil = require('../utils/response');
const { logOperation } = require('../middlewares/logger.middleware');
const path = require('path');

/**
 * 商品控制器
 */
class ProductController {
  /**
   * 获取商品列表(团长端)
   */
  static async getProductsForCaptain(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const { category_id, status, keyword } = req.query;

      const result = await ProductService.getProductListForCaptain(
        page,
        pageSize,
        category_id ? parseInt(category_id) : null,
        status,
        keyword
      );

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      console.error('获取商品列表错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取商品列表(居民端)
   */
  static async getProductsForResident(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 12;
      const { category_id, keyword } = req.query;

      const result = await ProductService.getProductListForResident(
        page,
        pageSize,
        category_id ? parseInt(category_id) : null,
        keyword
      );

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      console.error('获取商品列表错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取商品详情
   */
  static async getProductDetail(req, res) {
    try {
      const { id } = req.params;

      const result = await ProductService.getProductDetail(parseInt(id));

      if (!result.success) {
        return ResponseUtil.notFound(res, result.message);
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      console.error('获取商品详情错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 创建商品
   */
  static async createProduct(req, res) {
    try {
      const {
        category_id,
        name,
        price,
        original_price,
        stock,
        description,
        commission_rate,
        stock_alert,
        status
      } = req.body;

      // 调试日志
      console.log('📦 创建商品请求 - 收到的数据:', {
        category_id,
        name,
        price,
        original_price,
        stock,
        description,
        commission_rate,
        stock_alert,
        status
      });

      // 验证必填字段（正确处理 0 值，description 允许为空）
      if (
        category_id === undefined ||
        !name ||
        name.trim() === '' ||
        price === undefined ||
        price === null ||
        original_price === undefined ||
        original_price === null ||
        stock === undefined ||
        stock === null ||
        commission_rate === undefined ||
        commission_rate === null
      ) {
        console.log('❌ 验证失败 - 缺少必填字段:', {
          category_id: category_id === undefined,
          name: !name || name.trim() === '',
          price: price === undefined || price === null,
          original_price: original_price === undefined || original_price === null,
          stock: stock === undefined || stock === null,
          commission_rate: commission_rate === undefined || commission_rate === null
        });
        return ResponseUtil.error(res, '请填写完整的商品信息');
      }

      // 验证分类是否存在
      const category = await Category.findByPk(category_id);
      if (!category) {
        console.log('❌ 商品分类不存在:', category_id);
        return ResponseUtil.error(res, '商品分类不存在');
      }

      // 转换佣金比例：前端传的是百分比（如 10），转换为小数（0.1）
      const commissionRateDecimal = parseFloat(commission_rate) / 100;
      console.log('💰 佣金比例转换:', commission_rate, '% →', commissionRateDecimal);

      // 处理图片
      let imagePath = null;
      if (req.file) {
        // 如果是 multipart 上传
        imagePath = `/uploads/products/${req.file.filename}`;
      } else if (req.body.image) {
        // 如果是 JSON body 中已有图片路径
        imagePath = req.body.image;
      }
      console.log('🖼️  图片路径:', imagePath);

      const product = await Product.create({
        category_id,
        name,
        price,
        original_price,
        stock,
        image: imagePath,
        description,
        commission_rate: commissionRateDecimal,
        stock_alert: stock_alert || 10,
        status: status !== undefined ? status : 1
      });

      console.log('✅ 商品创建成功:', product.id);

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'product', 'create', `创建商品:${name}`, ip);

      return ResponseUtil.created(res, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        stock: product.stock
      }, '商品创建成功');
    } catch (error) {
      console.error('创建商品错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 更新商品
   */
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);

      if (!product || product.is_deleted === 1) {
        return ResponseUtil.notFound(res, '商品不存在');
      }

      console.log('🔄 更新商品请求 - ID:', id, '收到的数据:', req.body);

      const updateData = {};
      const fields = ['category_id', 'name', 'price', 'original_price', 'stock', 'description', 'stock_alert', 'status'];

      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      // 处理佣金比例：前端传的是百分比，转换为小数
      if (req.body.commission_rate !== undefined) {
        const commissionRateDecimal = parseFloat(req.body.commission_rate) / 100;
        updateData.commission_rate = commissionRateDecimal;
        console.log('💰 佣金比例转换:', req.body.commission_rate, '% →', commissionRateDecimal);
      }

      // 处理图片
      if (req.file) {
        // 如果是 multipart 上传
        updateData.image = `/uploads/products/${req.file.filename}`;
      } else if (req.body.image !== undefined) {
        // 如果是 JSON body 中的图片路径（可能为空字符串表示删除）
        updateData.image = req.body.image;
      }

      console.log('📝 准备更新的数据:', updateData);

      await product.update(updateData);

      console.log('✅ 商品更新成功:', product.id);

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'product', 'update', `更新商品:${product.name}`, ip);

      return ResponseUtil.success(res, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price)
      }, '商品更新成功');
    } catch (error) {
      console.error('更新商品错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 删除商品(软删除)
   */
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);

      if (!product || product.is_deleted === 1) {
        return ResponseUtil.notFound(res, '商品不存在');
      }

      await product.update({ is_deleted: 1 });

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'product', 'delete', `删除商品:${product.name}`, ip);

      return ResponseUtil.success(res, null, '商品删除成功');
    } catch (error) {
      console.error('删除商品错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 上架/下架商品
   */
  static async updateProductStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (status === undefined || (status !== 0 && status !== 1)) {
        return ResponseUtil.error(res, '状态值无效');
      }

      const product = await Product.findByPk(id);

      if (!product || product.is_deleted === 1) {
        return ResponseUtil.notFound(res, '商品不存在');
      }

      await product.update({ status });

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      const statusText = status === 1 ? '上架' : '下架';
      await logOperation(req.user, 'product', 'status_change', `${statusText}商品:${product.name}`, ip);

      return ResponseUtil.success(res, {
        id: product.id,
        status: product.status
      }, '商品状态更新成功');
    } catch (error) {
      console.error('更新商品状态错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 调整商品库存
   */
  static async adjustProductStock(req, res) {
    try {
      const { id } = req.params;
      const { change_type, quantity } = req.body;

      if (!change_type || !quantity) {
        return ResponseUtil.error(res, '变动类型和数量不能为空');
      }

      if (change_type !== 'add' && change_type !== 'reduce') {
        return ResponseUtil.error(res, '变动类型无效');
      }

      if (quantity <= 0) {
        return ResponseUtil.error(res, '数量必须大于0');
      }

      const result = await ProductService.adjustStock(
        parseInt(id),
        change_type,
        parseInt(quantity),
        req.user.id
      );

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'product', 'update', `调整商品库存:${change_type === 'add' ? '增加' : '减少'}${quantity}`, ip);

      return ResponseUtil.success(res, result.data, '库存调整成功');
    } catch (error) {
      console.error('调整库存错误:', error);
      return ResponseUtil.serverError(res);
    }
  }
}

module.exports = ProductController;
