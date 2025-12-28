const bcrypt = require('bcryptjs');

/**
 * 密码加密工具类
 */
class BcryptUtil {
  /**
   * 加密密码
   * @param {String} password - 明文密码
   * @returns {Promise<String>} 加密后的密码
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * 验证密码
   * @param {String} password - 明文密码
   * @param {String} hashedPassword - 加密后的密码
   * @returns {Promise<Boolean>} 是否匹配
   */
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = BcryptUtil;
