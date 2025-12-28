const { Cart, Product } = require('../models/mysql');
const ResponseUtil = require('../utils/response');

/**
 * 购物车控制器
 */
class CartController {
  /**
   * 获取购物车列表
   */
  static async getCartList(req, res) {
    try {
      const residentId = req.user.id;

      const cartItems = await Cart.findAll({
        where: { resident_id: residentId },
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image', 'stock', 'status', 'is_deleted']
        }],
        order: [['created_at', 'DESC']]
      });

      const list = cartItems
        .filter(item => item.product && item.product.is_deleted === 0)
        .map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product.name,
          product_price: parseFloat(item.product.price),
          product_image: item.product.image,
          product_stock: item.product.stock,
          quantity: item.quantity,
          subtotal: parseFloat((item.product.price * item.quantity).toFixed(2))
        }));

      return ResponseUtil.success(res, list);
    } catch (error) {
      console.error('获取购物车列表错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 添加商品到购物车
   */
  static async addToCart(req, res) {
    try {
      const { product_id, quantity } = req.body;
      const residentId = req.user.id;

      if (!product_id || !quantity) {
        return ResponseUtil.error(res, '商品ID和数量不能为空');
      }

      if (quantity <= 0) {
        return ResponseUtil.error(res, '数量必须大于0');
      }

      // 检查商品是否存在且可购买
      const product = await Product.findByPk(product_id);

      if (!product || product.is_deleted === 1 || product.status !== 1) {
        return ResponseUtil.error(res, '商品不可购买');
      }

      if (product.stock < quantity) {
        return ResponseUtil.error(res, '商品库存不足');
      }

      // 检查购物车中是否已存在该商品
      const existingItem = await Cart.findOne({
        where: {
          resident_id: residentId,
          product_id
        }
      });

      if (existingItem) {
        // 累加数量
        const newQuantity = existingItem.quantity + quantity;

        if (product.stock < newQuantity) {
          return ResponseUtil.error(res, '商品库存不足');
        }

        await existingItem.update({ quantity: newQuantity });

        return ResponseUtil.success(res, {
          id: existingItem.id,
          product_id: existingItem.product_id,
          quantity: existingItem.quantity
        }, '添加成功');
      } else {
        // 创建新的购物车项
        const cartItem = await Cart.create({
          resident_id: residentId,
          product_id,
          quantity
        });

        return ResponseUtil.created(res, {
          id: cartItem.id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity
        }, '添加成功');
      }
    } catch (error) {
      console.error('添加到购物车错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 更新购物车商品数量
   */
  static async updateCartItem(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const residentId = req.user.id;

      if (!quantity || quantity <= 0) {
        return ResponseUtil.error(res, '数量必须大于0');
      }

      const cartItem = await Cart.findOne({
        where: { id, resident_id: residentId },
        include: [{
          model: Product,
          as: 'product'
        }]
      });

      if (!cartItem) {
        return ResponseUtil.notFound(res, '购物车项不存在');
      }

      if (cartItem.product.stock < quantity) {
        return ResponseUtil.error(res, '商品库存不足');
      }

      await cartItem.update({ quantity });

      return ResponseUtil.success(res, {
        id: cartItem.id,
        quantity: cartItem.quantity
      }, '更新成功');
    } catch (error) {
      console.error('更新购物车错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 删除购物车商品
   */
  static async deleteCartItem(req, res) {
    try {
      const { id } = req.params;
      const residentId = req.user.id;

      const cartItem = await Cart.findOne({
        where: { id, resident_id: residentId }
      });

      if (!cartItem) {
        return ResponseUtil.notFound(res, '购物车项不存在');
      }

      await cartItem.destroy();

      return ResponseUtil.success(res, null, '删除成功');
    } catch (error) {
      console.error('删除购物车项错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 清空购物车
   */
  static async clearCart(req, res) {
    try {
      const residentId = req.user.id;

      await Cart.destroy({
        where: { resident_id: residentId }
      });

      return ResponseUtil.success(res, null, '购物车已清空');
    } catch (error) {
      console.error('清空购物车错误:', error);
      return ResponseUtil.serverError(res);
    }
  }
}

module.exports = CartController;
