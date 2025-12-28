const JWTUtil = require('../utils/jwt');
const ResponseUtil = require('../utils/response');

/**
 * JWT 认证中间件
 */
const authMiddleware = (req, res, next) => {
  try {
    // 获取 token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtil.unauthorized(res, '未提供认证令牌');
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证 token
    const decoded = JWTUtil.verifyToken(token);

    if (!decoded) {
      return ResponseUtil.unauthorized(res, '认证令牌无效或已过期');
    }

    // 将用户信息附加到 req 对象
    req.user = {
      id: decoded.id,
      username: decoded.username,
      userType: decoded.userType // 'captain' 或 'resident'
    };

    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return ResponseUtil.unauthorized(res, '认证失败');
  }
};

/**
 * 团长权限验证中间件
 */
const captainAuth = (req, res, next) => {
  if (req.user.userType !== 'captain') {
    return ResponseUtil.forbidden(res, '需要团长权限');
  }
  next();
};

/**
 * 居民权限验证中间件
 */
const residentAuth = (req, res, next) => {
  if (req.user.userType !== 'resident') {
    return ResponseUtil.forbidden(res, '需要居民权限');
  }
  next();
};

module.exports = {
  authMiddleware,
  captainAuth,
  residentAuth
};
