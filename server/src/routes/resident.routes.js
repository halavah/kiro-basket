const express = require('express');
const router = express.Router();
const { authMiddleware, residentAuth } = require('../middlewares/auth.middleware');
const AuthController = require('../controllers/auth.controller');
const CategoryController = require('../controllers/category.controller');
const ProductController = require('../controllers/product.controller');
const CartController = require('../controllers/cart.controller');
const OrderController = require('../controllers/order.controller');
const ResidentController = require('../controllers/resident.controller');

/**
 * 居民端路由
 */

// 认证相关
router.post('/register', AuthController.residentRegister);
router.post('/login', AuthController.residentLogin);
router.get('/info', authMiddleware, residentAuth, AuthController.getUserInfo);

// 分类列表
router.get('/categories', authMiddleware, residentAuth, CategoryController.getCategories);

// 商品浏览
router.get('/products', authMiddleware, residentAuth, ProductController.getProductsForResident);
router.get('/products/search', authMiddleware, residentAuth, ProductController.getProductsForResident);
router.get('/products/:id', authMiddleware, residentAuth, ProductController.getProductDetail);

// 购物车管理
router.get('/cart', authMiddleware, residentAuth, CartController.getCartList);
router.post('/cart', authMiddleware, residentAuth, CartController.addToCart);
router.put('/cart/:id', authMiddleware, residentAuth, CartController.updateCartItem);
router.delete('/cart/:id', authMiddleware, residentAuth, CartController.deleteCartItem);
router.delete('/cart', authMiddleware, residentAuth, CartController.clearCart);

// 订单管理
router.post('/orders', authMiddleware, residentAuth, OrderController.createOrder);
router.get('/orders', authMiddleware, residentAuth, OrderController.getOrdersForResident);
router.get('/orders/:id', authMiddleware, residentAuth, OrderController.getOrderDetailForResident);
router.patch('/orders/:id/cancel', authMiddleware, residentAuth, OrderController.cancelOrderByResident);
router.post('/orders/:id/pay', authMiddleware, residentAuth, OrderController.payOrder);

// 个人信息
router.get('/profile', authMiddleware, residentAuth, ResidentController.getProfile);
router.put('/profile', authMiddleware, residentAuth, ResidentController.updateProfile);
router.put('/change-password', authMiddleware, residentAuth, ResidentController.updatePassword);

module.exports = router;
