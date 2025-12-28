const { Category, Product } = require('../models/mysql');
const ResponseUtil = require('../utils/response');
const { logOperation } = require('../middlewares/logger.middleware');

/**
 * 分类控制器
 */
class CategoryController {
  /**
   * 获取分类列表
   */
  static async getCategories(req, res) {
    try {
      // 简化查询，不使用 include + group，避免 SQL 错误
      const categories = await Category.findAll({
        order: [['sort', 'ASC']]
      });

      const list = await Promise.all(categories.map(async (cat) => {
        const productCount = await Product.count({
          where: { category_id: cat.id, is_deleted: 0 }
        });

        return {
          id: cat.id,
          name: cat.name,
          sort: cat.sort,
          product_count: productCount,
          productCount: productCount,
          created_at: cat.created_at,
          createdAt: cat.created_at
        };
      }));

      return ResponseUtil.success(res, { list });
    } catch (error) {
      console.error('获取分类列表错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 创建分类
   */
  static async createCategory(req, res) {
    try {
      const { name, sort } = req.body;

      if (!name) {
        return ResponseUtil.error(res, '分类名称不能为空');
      }

      // 检查名称是否已存在
      const existing = await Category.findOne({ where: { name } });
      if (existing) {
        return ResponseUtil.error(res, '分类名称已存在');
      }

      const category = await Category.create({
        name,
        sort: sort || 0
      });

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'category', 'create', `创建分类:${name}`, ip);

      return ResponseUtil.created(res, {
        id: category.id,
        name: category.name,
        sort: category.sort
      }, '分类创建成功');
    } catch (error) {
      console.error('创建分类错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 更新分类
   */
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, sort } = req.body;

      const category = await Category.findByPk(id);

      if (!category) {
        return ResponseUtil.notFound(res, '分类不存在');
      }

      if (name) {
        // 检查名称是否与其他分类重复
        const existing = await Category.findOne({
          where: { name, id: { [require('sequelize').Op.ne]: id } }
        });
        if (existing) {
          return ResponseUtil.error(res, '分类名称已存在');
        }
      }

      await category.update({
        name: name || category.name,
        sort: sort !== undefined ? sort : category.sort
      });

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'category', 'update', `更新分类:${category.name}`, ip);

      return ResponseUtil.success(res, {
        id: category.id,
        name: category.name,
        sort: category.sort
      }, '分类更新成功');
    } catch (error) {
      console.error('更新分类错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 删除分类
   */
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);

      if (!category) {
        return ResponseUtil.notFound(res, '分类不存在');
      }

      // 检查分类下是否有商品
      const productCount = await Product.count({
        where: { category_id: id, is_deleted: 0 }
      });

      if (productCount > 0) {
        return ResponseUtil.error(res, '该分类下存在商品,无法删除');
      }

      await category.destroy();

      // 记录操作日志
      const ip = req.ip || req.connection.remoteAddress;
      await logOperation(req.user, 'category', 'delete', `删除分类:${category.name}`, ip);

      return ResponseUtil.success(res, null, '分类删除成功');
    } catch (error) {
      console.error('删除分类错误:', error);
      return ResponseUtil.serverError(res);
    }
  }
}

module.exports = CategoryController;
