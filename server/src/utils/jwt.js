const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * JWT 工具类
 */
class JWTUtil {
  /**
   * 生成 Token
   * @param {Object} payload - 载荷数据
   * @returns {String} token
   */
  static generateToken(payload) {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });
  }

  /**
   * 验证 Token
   * @param {String} token - JWT token
   * @returns {Object|null} 解析后的载荷数据或null
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      return null;
    }
  }

  /**
   * 解码 Token (不验证)
   * @param {String} token - JWT token
   * @returns {Object|null} 解析后的载荷数据或null
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

module.exports = JWTUtil;
