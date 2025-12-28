const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在 - 使用 server 目录下的 uploads
const productUploadDir = path.join(__dirname, '../../uploads/products');
const avatarUploadDir = path.join(__dirname, '../../uploads/avatars');

if (!fs.existsSync(productUploadDir)) {
  fs.mkdirSync(productUploadDir, { recursive: true });
}

if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

// 商品图片存储配置
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productUploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const filename = `${timestamp}_${Buffer.from(basename, 'latin1').toString('utf8')}${ext}`;
    cb(null, filename);
  }
});

// 头像存储配置
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarUploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${timestamp}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持上传 JPG、PNG、GIF 格式的图片'), false);
  }
};

// 创建 multer 实例 - 商品图片
const productUpload = multer({
  storage: productStorage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE) || 2) * 1024 * 1024
  },
  fileFilter: fileFilter
});

// 创建 multer 实例 - 头像
const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 头像限制 5MB
  },
  fileFilter: fileFilter
});

/**
 * 商品图片上传中间件
 */
const uploadMiddleware = (req, res, next) => {
  productUpload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          code: 400,
          message: '文件大小不能超过 2MB',
          data: null
        });
      }
      return res.status(400).json({
        code: 400,
        message: '文件上传错误: ' + err.message,
        data: null
      });
    } else if (err) {
      return res.status(400).json({
        code: 400,
        message: err.message,
        data: null
      });
    }
    next();
  });
};

/**
 * 头像上传中间件
 */
const avatarUploadMiddleware = (req, res, next) => {
  avatarUpload.single('avatar')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          code: 400,
          message: '头像大小不能超过 5MB',
          data: null
        });
      }
      return res.status(400).json({
        code: 400,
        message: '头像上传错误: ' + err.message,
        data: null
      });
    } else if (err) {
      return res.status(400).json({
        code: 400,
        message: err.message,
        data: null
      });
    }
    next();
  });
};

module.exports = {
  uploadMiddleware,
  avatarUploadMiddleware
};
