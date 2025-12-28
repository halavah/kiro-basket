const { Captain, Resident } = require('../models/mysql');
const BcryptUtil = require('../utils/bcrypt');
const JWTUtil = require('../utils/jwt');
const LoginLog = require('../models/mongo/LoginLog');

/**
 * 认证服务
 */
class AuthService {
  /**
   * 团长登录
   */
  static async captainLogin(username, password, ip) {
    try {
      console.log('🔐 AuthService.captainLogin 开始');
      console.log('  - 接收参数 username:', username);
      console.log('  - 接收参数 password:', password ? '***存在***' : '❌ 空');
      console.log('  - 接收参数 ip:', ip);

      // 查找团长
      console.log('📊 开始查询数据库...');
      const captain = await Captain.findOne({ where: { username } });
      console.log('📊 数据库查询结果:', captain ? `✅ 找到用户 ID: ${captain.id}` : '❌ 用户不存在');

      if (!captain) {
        console.log('❌ 登录失败: 用户不存在');
        // 记录失败日志
        await LoginLog.create({
          user_type: 'captain',
          user_id: 0,
          username,
          ip,
          login_time: new Date(),
          status: 'failed'
        });
        return { success: false, message: '用户名或密码错误' };
      }

      // 验证密码
      console.log('🔑 开始验证密码...');
      console.log('  - 数据库中的密码哈希:', captain.password);
      console.log('  - 用户输入的密码:', password);
      const isMatch = await BcryptUtil.comparePassword(password, captain.password);
      console.log('🔑 密码验证结果:', isMatch ? '✅ 匹配' : '❌ 不匹配');

      if (!isMatch) {
        console.log('❌ 登录失败: 密码错误');
        // 记录失败日志
        await LoginLog.create({
          user_type: 'captain',
          user_id: captain.id,
          username,
          ip,
          login_time: new Date(),
          status: 'failed'
        });
        return { success: false, message: '用户名或密码错误' };
      }

      // 检查状态
      console.log('👤 检查账号状态:', captain.status, '(1=启用, 0=禁用)');
      if (captain.status !== 1) {
        console.log('❌ 登录失败: 账号已被禁用');
        return { success: false, message: '账号已被禁用' };
      }

      // 生成 token
      console.log('🎫 开始生成 token...');
      const token = JWTUtil.generateToken({
        id: captain.id,
        username: captain.username,
        userType: 'captain'
      });
      console.log('🎫 Token 生成成功');

      // 记录成功日志
      await LoginLog.create({
        user_type: 'captain',
        user_id: captain.id,
        username,
        ip,
        login_time: new Date(),
        status: 'success'
      });

      console.log('✅ 团长登录成功!');
      return {
        success: true,
        data: {
          token,
          userInfo: {
            id: captain.id,
            username: captain.username,
            phone: captain.phone
          }
        }
      };
    } catch (error) {
      console.error('💥 团长登录异常:', error);
      console.error('💥 异常堆栈:', error.stack);
      return { success: false, message: '登录失败,请稍后重试' };
    }
  }

  /**
   * 居民注册
   */
  static async residentRegister(userData) {
    try {
      const { username, password, phone, name, address } = userData;

      // 检查用户名是否已存在
      const existingUsername = await Resident.findOne({ where: { username } });
      if (existingUsername) {
        return { success: false, message: '用户名已存在' };
      }

      // 检查手机号是否已存在
      const existingPhone = await Resident.findOne({ where: { phone } });
      if (existingPhone) {
        return { success: false, message: '手机号已被注册' };
      }

      // 加密密码
      const hashedPassword = await BcryptUtil.hashPassword(password);

      // 创建居民
      const resident = await Resident.create({
        username,
        password: hashedPassword,
        phone,
        name,
        address: address || null
      });

      return {
        success: true,
        data: {
          id: resident.id,
          username: resident.username,
          phone: resident.phone
        }
      };
    } catch (error) {
      console.error('居民注册失败:', error);
      return { success: false, message: '注册失败,请稍后重试' };
    }
  }

  /**
   * 居民登录
   */
  static async residentLogin(username, password, ip) {
    try {
      console.log('🔐 AuthService.residentLogin 开始');
      console.log('  - 接收参数 username:', username);
      console.log('  - 接收参数 password:', password ? '***存在***' : '❌ 空');
      console.log('  - 接收参数 ip:', ip);

      // 查找居民
      console.log('📊 开始查询数据库...');
      const resident = await Resident.findOne({ where: { username } });
      console.log('📊 数据库查询结果:', resident ? `✅ 找到用户 ID: ${resident.id}` : '❌ 用户不存在');

      if (!resident) {
        console.log('❌ 登录失败: 用户不存在');
        // 记录失败日志
        await LoginLog.create({
          user_type: 'resident',
          user_id: 0,
          username,
          ip,
          login_time: new Date(),
          status: 'failed'
        });
        return { success: false, message: '用户名或密码错误' };
      }

      // 验证密码
      console.log('🔑 开始验证密码...');
      console.log('  - 数据库中的密码哈希:', resident.password);
      console.log('  - 用户输入的密码:', password);
      const isMatch = await BcryptUtil.comparePassword(password, resident.password);
      console.log('🔑 密码验证结果:', isMatch ? '✅ 匹配' : '❌ 不匹配');

      if (!isMatch) {
        console.log('❌ 登录失败: 密码错误');
        // 记录失败日志
        await LoginLog.create({
          user_type: 'resident',
          user_id: resident.id,
          username,
          ip,
          login_time: new Date(),
          status: 'failed'
        });
        return { success: false, message: '用户名或密码错误' };
      }

      // 生成 token
      console.log('🎫 开始生成 token...');
      const token = JWTUtil.generateToken({
        id: resident.id,
        username: resident.username,
        userType: 'resident'
      });
      console.log('🎫 Token 生成成功');

      // 记录成功日志
      await LoginLog.create({
        user_type: 'resident',
        user_id: resident.id,
        username,
        ip,
        login_time: new Date(),
        status: 'success'
      });

      console.log('✅ 居民登录成功!');
      return {
        success: true,
        data: {
          token,
          userInfo: {
            id: resident.id,
            username: resident.username,
            name: resident.name,
            phone: resident.phone
          }
        }
      };
    } catch (error) {
      console.error('💥 居民登录异常:', error);
      console.error('💥 异常堆栈:', error.stack);
      return { success: false, message: '登录失败,请稍后重试' };
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(userId, userType) {
    try {
      if (userType === 'captain') {
        const captain = await Captain.findByPk(userId);
        if (!captain) {
          return { success: false, message: '用户不存在' };
        }
        return {
          success: true,
          data: {
            id: captain.id,
            username: captain.username,
            phone: captain.phone,
            userType: 'captain'
          }
        };
      } else {
        const resident = await Resident.findByPk(userId);
        if (!resident) {
          return { success: false, message: '用户不存在' };
        }
        return {
          success: true,
          data: {
            id: resident.id,
            username: resident.username,
            name: resident.name,
            phone: resident.phone,
            address: resident.address,
            userType: 'resident'
          }
        };
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return { success: false, message: '获取用户信息失败' };
    }
  }
}

module.exports = AuthService;
