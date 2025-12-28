SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for captains
-- ----------------------------
DROP TABLE IF EXISTS `captains`;
CREATE TABLE `captains` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码(加密存储)',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态:0禁用,1启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='团长信息表';

-- ----------------------------
-- Table structure for residents
-- ----------------------------
DROP TABLE IF EXISTS `residents`;
CREATE TABLE `residents` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码(加密存储)',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `name` varchar(50) NOT NULL COMMENT '真实姓名',
  `address` varchar(255) DEFAULT NULL COMMENT '收货地址',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像路径',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='居民信息表';

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(50) NOT NULL COMMENT '分类名称',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序值,数字越小越靠前',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='商品分类表';

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `category_id` int unsigned NOT NULL COMMENT '分类ID',
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `price` decimal(10,2) NOT NULL COMMENT '团购价格',
  `original_price` decimal(10,2) NOT NULL COMMENT '原价',
  `unit` varchar(20) DEFAULT '件' COMMENT '单位',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存数量',
  `image` varchar(255) DEFAULT NULL COMMENT '商品图片路径',
  `description` text COMMENT '商品描述',
  `status` tinyint NOT NULL DEFAULT '1' COMMENT '状态:0下架,1在售',
  `commission_rate` decimal(5,4) NOT NULL DEFAULT '0.1000' COMMENT '佣金比例(0-1,例如0.1表示10%)',
  `stock_alert` int NOT NULL DEFAULT '10' COMMENT '库存预警值',
  `sales` int NOT NULL DEFAULT '0' COMMENT '销量',
  `is_deleted` tinyint NOT NULL DEFAULT '0' COMMENT '是否删除:0否,1是(软删除)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='商品信息表';

-- ----------------------------
-- Table structure for carts
-- ----------------------------
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `resident_id` int unsigned NOT NULL COMMENT '居民ID',
  `product_id` int unsigned NOT NULL COMMENT '商品ID',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '商品数量',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='购物车表';

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单编号(唯一)',
  `resident_id` int unsigned NOT NULL COMMENT '居民ID',
  `captain_id` int unsigned NOT NULL DEFAULT '1' COMMENT '团长ID(默认为1)',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总金额',
  `commission_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '佣金金额',
  `address` varchar(255) DEFAULT NULL COMMENT '收货地址',
  `remark` varchar(500) DEFAULT NULL COMMENT '订单备注',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '订单状态:0待确认,1配送中,2已完成,3已取消',
  `payment_status` tinyint NOT NULL DEFAULT '0' COMMENT '支付状态:0未支付,1已支付',
  `paid_at` datetime DEFAULT NULL COMMENT '支付时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='订单表';

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_id` int unsigned NOT NULL COMMENT '订单ID',
  `product_id` int unsigned NOT NULL COMMENT '商品ID',
  `product_name` varchar(100) NOT NULL COMMENT '商品名称(冗余存储)',
  `quantity` int NOT NULL COMMENT '购买数量',
  `price` decimal(10,2) NOT NULL COMMENT '商品单价',
  `subtotal` decimal(10,2) NOT NULL COMMENT '小计金额',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='订单明细表';

-- ----------------------------
-- Table structure for commissions
-- ----------------------------
DROP TABLE IF EXISTS `commissions`;
CREATE TABLE `commissions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `captain_id` int unsigned NOT NULL COMMENT '团长ID',
  `order_id` int unsigned NOT NULL COMMENT '订单ID',
  `amount` decimal(10,2) NOT NULL COMMENT '佣金金额',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生成时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='佣金记录表';

SET FOREIGN_KEY_CHECKS = 1;
