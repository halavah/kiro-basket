const express = require('express');
const router = express.Router();
const { authMiddleware, captainAuth } = require('../middlewares/auth.middleware');
const AuthController = require('../controllers/auth.controller');
const CategoryController = require('../controllers/category.controller');
const ProductController = require('../controllers/product.controller');
const OrderController = require('../controllers/order.controller');
const ResidentController = require('../controllers/resident.controller');
const CommissionController = require('../controllers/commission.controller');
const NotificationController = require('../controllers/notification.controller');
const DashboardController = require('../controllers/dashboard.controller');

/**
 * 团长端路由
 */

// 认证相关
router.post('/login', AuthController.captainLogin);
router.get('/info', authMiddleware, captainAuth, AuthController.getUserInfo);

// 分类管理
router.get('/categories', authMiddleware, captainAuth, CategoryController.getCategories);
router.post('/categories', authMiddleware, captainAuth, CategoryController.createCategory);
router.put('/categories/:id', authMiddleware, captainAuth, CategoryController.updateCategory);
router.delete('/categories/:id', authMiddleware, captainAuth, CategoryController.deleteCategory);

// 商品管理
router.get('/products', authMiddleware, captainAuth, ProductController.getProductsForCaptain);
router.get('/products/:id', authMiddleware, captainAuth, ProductController.getProductDetail);
router.post('/products', authMiddleware, captainAuth, ProductController.createProduct);
router.put('/products/:id', authMiddleware, captainAuth, ProductController.updateProduct);
router.delete('/products/:id', authMiddleware, captainAuth, ProductController.deleteProduct);
router.patch('/products/:id/status', authMiddleware, captainAuth, ProductController.updateProductStatus);
router.patch('/products/:id/stock', authMiddleware, captainAuth, ProductController.adjustProductStock);

// 订单管理
router.get('/orders', authMiddleware, captainAuth, OrderController.getOrdersForCaptain);
router.get('/orders/export', authMiddleware, captainAuth, OrderController.exportOrders);
router.get('/orders/:id', authMiddleware, captainAuth, OrderController.getOrderDetailForCaptain);
router.patch('/orders/:id/confirm', authMiddleware, captainAuth, OrderController.confirmOrder);
router.patch('/orders/:id/complete', authMiddleware, captainAuth, OrderController.completeOrder);
router.patch('/orders/:id/cancel', authMiddleware, captainAuth, OrderController.cancelOrderByCaptain);

// 居民管理
router.get('/residents', authMiddleware, captainAuth, ResidentController.getResidents);
router.get('/residents/:id', authMiddleware, captainAuth, ResidentController.getResidentDetail);
router.get('/residents/:id/orders', authMiddleware, captainAuth, ResidentController.getResidentOrders);
router.get('/residents/:id/stats', authMiddleware, captainAuth, ResidentController.getResidentStats);

// 佣金统计
router.get('/commission/overview', authMiddleware, captainAuth, CommissionController.getCommissionOverview);
router.get('/commission/list', authMiddleware, captainAuth, CommissionController.getCommissionList);
router.get('/commission/trend', authMiddleware, captainAuth, CommissionController.getCommissionTrend);
router.get('/commission/export', authMiddleware, captainAuth, CommissionController.exportCommissions);

// 消息通知
router.get('/notifications', authMiddleware, captainAuth, NotificationController.getNotifications);
router.get('/notifications/unread-count', authMiddleware, captainAuth, NotificationController.getUnreadCount);
router.patch('/notifications/:id/read', authMiddleware, captainAuth, NotificationController.markAsRead);
router.delete('/notifications/:id', authMiddleware, captainAuth, NotificationController.deleteNotification);
router.patch('/notifications/read-all', authMiddleware, captainAuth, NotificationController.markAllAsRead);

// 数据看板
router.get('/dashboard/stats', authMiddleware, captainAuth, DashboardController.getStats);
router.get('/dashboard/sales-trend', authMiddleware, captainAuth, DashboardController.getSalesTrend);
router.get('/dashboard/order-status', authMiddleware, captainAuth, DashboardController.getOrderStatus);
router.get('/dashboard/top-products', authMiddleware, captainAuth, DashboardController.getTopProducts);
router.get('/dashboard/stock-alerts', authMiddleware, captainAuth, DashboardController.getStockAlerts);

module.exports = router;
