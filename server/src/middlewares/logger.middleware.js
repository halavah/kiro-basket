const OperationLog = require('../models/mongo/OperationLog');

/**
 * 日志记录中间件
 */
const loggerMiddleware = async (req, res, next) => {
  // 记录请求信息
  const startTime = Date.now();

  // 保存原始的 res.json 方法
  const originalJson = res.json.bind(res);

  // 重写 res.json 方法
  res.json = function(body) {
    // 计算响应时间
    const duration = Date.now() - startTime;

    // 记录日志
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);

    // 调用原始方法
    return originalJson(body);
  };

  next();
};

/**
 * 操作日志记录工具
 */
const logOperation = async (user, module, action, details, ip) => {
  try {
    await OperationLog.create({
      user_type: user.userType,
      user_id: user.id,
      module,
      action,
      details,
      ip,
      created_at: new Date()
    });
  } catch (error) {
    console.error('操作日志记录失败:', error);
  }
};

module.exports = {
  loggerMiddleware,
  logOperation
};
