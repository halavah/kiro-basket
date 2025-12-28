const Notification = require('../models/mongo/Notification');

/**
 * 消息通知服务
 */
class NotificationService {
  /**
   * 获取消息列表
   */
  static async getNotificationList(captainId, page, pageSize, type, is_read) {
    try {
      const skip = (page - 1) * pageSize;
      const query = { captain_id: captainId };

      if (type) {
        query.type = type;
      }

      if (is_read !== undefined && is_read !== null && is_read !== '') {
        query.is_read = is_read === 'true' || is_read === true;
      }

      const total = await Notification.countDocuments(query);
      const unread_count = await Notification.countDocuments({
        captain_id: captainId,
        is_read: false
      });

      const list = await Notification.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();

      const formattedList = list.map(item => ({
        id: item._id.toString(),
        type: item.type,
        title: item.title,
        content: item.content,
        is_read: item.is_read,
        created_at: item.created_at
      }));

      return {
        success: true,
        data: {
          total,
          unread_count,
          page,
          pageSize,
          list: formattedList
        }
      };
    } catch (error) {
      console.error('获取消息列表失败:', error);
      return { success: false, message: '获取消息列表失败' };
    }
  }

  /**
   * 标记消息已读
   */
  static async markAsRead(notificationId) {
    try {
      const result = await Notification.findByIdAndUpdate(
        notificationId,
        { is_read: true },
        { new: true }
      );

      if (!result) {
        return { success: false, message: '消息不存在' };
      }

      return {
        success: true,
        data: {
          id: result._id.toString(),
          is_read: result.is_read
        }
      };
    } catch (error) {
      console.error('标记消息已读失败:', error);
      return { success: false, message: '标记消息已读失败' };
    }
  }

  /**
   * 删除消息
   */
  static async deleteNotification(notificationId) {
    try {
      const result = await Notification.findByIdAndDelete(notificationId);

      if (!result) {
        return { success: false, message: '消息不存在' };
      }

      return { success: true, data: null };
    } catch (error) {
      console.error('删除消息失败:', error);
      return { success: false, message: '删除消息失败' };
    }
  }

  /**
   * 一键已读所有消息
   */
  static async markAllAsRead(captainId) {
    try {
      const result = await Notification.updateMany(
        { captain_id: captainId, is_read: false },
        { is_read: true }
      );

      return {
        success: true,
        data: {
          updated_count: result.modifiedCount
        }
      };
    } catch (error) {
      console.error('一键已读失败:', error);
      return { success: false, message: '一键已读失败' };
    }
  }

  /**
   * 获取未读消息数量
   */
  static async getUnreadCount(captainId) {
    try {
      const unread_count = await Notification.countDocuments({
        captain_id: captainId,
        is_read: false
      });

      return {
        success: true,
        data: {
          unread_count
        }
      };
    } catch (error) {
      console.error('获取未读数量失败:', error);
      return { success: false, message: '获取未读数量失败' };
    }
  }
}

module.exports = NotificationService;
