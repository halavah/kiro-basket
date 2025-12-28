const NotificationService = require('../services/notification.service');
const ResponseUtil = require('../utils/response');

/**
 * 消息通知控制器
 */
class NotificationController {
  /**
   * 获取消息列表
   */
  static async getNotifications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const { type, is_read } = req.query;
      const captainId = req.user.id;

      const result = await NotificationService.getNotificationList(
        captainId,
        page,
        pageSize,
        type,
        is_read
      );

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      console.error('获取消息列表错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 标记消息已读
   */
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const result = await NotificationService.markAsRead(id);

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data, '标记成功');
    } catch (error) {
      console.error('标记消息已读错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 删除消息
   */
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      const result = await NotificationService.deleteNotification(id);

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, null, '删除成功');
    } catch (error) {
      console.error('删除消息错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 一键已读所有消息
   */
  static async markAllAsRead(req, res) {
    try {
      const captainId = req.user.id;

      const result = await NotificationService.markAllAsRead(captainId);

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data, '全部标记已读');
    } catch (error) {
      console.error('一键已读错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取未读消息数量
   */
  static async getUnreadCount(req, res) {
    try {
      const captainId = req.user.id;

      const result = await NotificationService.getUnreadCount(captainId);

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      console.error('获取未读数量错误:', error);
      return ResponseUtil.serverError(res);
    }
  }
}

module.exports = NotificationController;
