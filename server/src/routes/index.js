const express = require('express');
const router = express.Router();
const captainRoutes = require('./captain.routes');
const residentRoutes = require('./resident.routes');
const { uploadMiddleware, avatarUploadMiddleware } = require('../middlewares/upload.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');

/**
 * 路由聚合
 */

// 团长端路由
router.use('/captain', captainRoutes);

// 居民端路由
router.use('/resident', residentRoutes);

// 通用文件上传 (需要认证)
router.post('/upload', authMiddleware, uploadMiddleware, (req, res) => {
  const ResponseUtil = require('../utils/response');

  if (!req.file) {
    return ResponseUtil.error(res, '请选择要上传的文件');
  }

  const fileUrl = `/uploads/products/${req.file.filename}`;

  return ResponseUtil.success(res, {
    url: fileUrl,
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size
  }, '上传成功');
});

// 头像上传
router.post('/upload/avatar', authMiddleware, avatarUploadMiddleware, (req, res) => {
  const ResponseUtil = require('../utils/response');

  if (!req.file) {
    return ResponseUtil.error(res, '请选择要上传的头像');
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  console.log('📸 头像上传成功:', avatarUrl);

  return ResponseUtil.success(res, {
    url: avatarUrl,
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size
  }, '头像上传成功');
});

module.exports = router;
