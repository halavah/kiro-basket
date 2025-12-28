/**
 * 统一响应格式工具
 */

class ResponseUtil {
  /**
   * 成功响应
   * @param {Object} res - Express response 对象
   * @param {*} data - 响应数据
   * @param {String} message - 响应消息
   * @param {Number} code - 状态码
   */
  static success(res, data = null, message = 'success', code = 200) {
    return res.status(code).json({
      code,
      message,
      data
    });
  }

  /**
   * 失败响应
   * @param {Object} res - Express response 对象
   * @param {String} message - 错误消息
   * @param {Number} code - 状态码
   * @param {*} data - 响应数据
   */
  static error(res, message = '请求失败', code = 400, data = null) {
    return res.status(code).json({
      code,
      message,
      data
    });
  }

  /**
   * 创建成功响应
   */
  static created(res, data = null, message = '创建成功') {
    return this.success(res, data, message, 201);
  }

  /**
   * 未授权响应
   */
  static unauthorized(res, message = '未授权,请先登录') {
    return this.error(res, message, 401);
  }

  /**
   * 禁止访问响应
   */
  static forbidden(res, message = '无权限访问') {
    return this.error(res, message, 403);
  }

  /**
   * 未找到响应
   */
  static notFound(res, message = '资源不存在') {
    return this.error(res, message, 404);
  }

  /**
   * 服务器错误响应
   */
  static serverError(res, message = '服务器内部错误') {
    return this.error(res, message, 500);
  }
}

module.exports = ResponseUtil;
