const AuthService = require('../services/auth.service');
const ResponseUtil = require('../utils/response');

/**
 * 认证控制器
 */
class AuthController {
  /**
   * 团长登录
   */
  static async captainLogin(req, res) {
    try {
      // 详细日志输出 - 用于调试
      console.log('========================================');
      console.log('📥 团长登录请求');
      console.log('时间:', new Date().toISOString());
      console.log('Content-Type:', req.headers['content-type']);
      console.log('原始请求体 (req.body):', JSON.stringify(req.body, null, 2));
      console.log('req.body 类型:', typeof req.body);
      console.log('req.body 是否为空对象:', Object.keys(req.body || {}).length === 0);

      const { username, password } = req.body;

      console.log('解析后的字段:');
      console.log('  - username:', username, '(类型:', typeof username, ')');
      console.log('  - password:', password ? '***存在***' : '❌ undefined/null', '(类型:', typeof password, ')');
      console.log('========================================');

      if (!username || !password) {
        console.log('⚠️  验证失败: 用户名或密码为空');
        return ResponseUtil.error(res, '用户名和密码不能为空');
      }

      const ip = req.ip || req.connection.remoteAddress;
      const result = await AuthService.captainLogin(username, password, ip);

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data, '登录成功');
    } catch (error) {
      console.error('团长登录错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 居民注册
   */
  static async residentRegister(req, res) {
    try {
      const { username, password, phone, name, address } = req.body;

      if (!username || !password || !phone || !name) {
        return ResponseUtil.error(res, '用户名、密码、手机号和姓名不能为空');
      }

      const result = await AuthService.residentRegister({
        username,
        password,
        phone,
        name,
        address
      });

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.created(res, result.data, '注册成功');
    } catch (error) {
      console.error('居民注册错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 居民登录
   */
  static async residentLogin(req, res) {
    try {
      // 详细日志输出 - 用于调试
      console.log('========================================');
      console.log('📥 居民登录请求');
      console.log('时间:', new Date().toISOString());
      console.log('Content-Type:', req.headers['content-type']);
      console.log('原始请求体 (req.body):', JSON.stringify(req.body, null, 2));
      console.log('req.body 类型:', typeof req.body);
      console.log('req.body 是否为空对象:', Object.keys(req.body || {}).length === 0);

      const { username, password } = req.body;

      console.log('解析后的字段:');
      console.log('  - username:', username, '(类型:', typeof username, ')');
      console.log('  - password:', password ? '***存在***' : '❌ undefined/null', '(类型:', typeof password, ')');
      console.log('========================================');

      if (!username || !password) {
        console.log('⚠️  验证失败: 用户名或密码为空');
        return ResponseUtil.error(res, '用户名和密码不能为空');
      }

      const ip = req.ip || req.connection.remoteAddress;
      const result = await AuthService.residentLogin(username, password, ip);

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data, '登录成功');
    } catch (error) {
      console.error('居民登录错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getUserInfo(req, res) {
    try {
      const result = await AuthService.getCurrentUser(req.user.id, req.user.userType);

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      console.error('获取用户信息错误:', error);
      return ResponseUtil.serverError(res);
    }
  }
}

module.exports = AuthController;
