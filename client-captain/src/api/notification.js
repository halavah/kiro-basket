import request from './request';

/**
 * 获取通知列表
 * @param {Object} params - { page, pageSize, isRead, type }
 */
export function getNotificationList(params) {
  return request({
    url: '/notifications',
    method: 'get',
    params
  });
}

/**
 * 获取未读通知数量
 */
export function getUnreadCount() {
  return request({
    url: '/notifications/unread-count',
    method: 'get'
  });
}

/**
 * 标记通知为已读
 * @param {Number} id - 通知ID
 */
export function markAsRead(id) {
  return request({
    url: `/notifications/${id}/read`,
    method: 'patch'
  });
}

/**
 * 全部标记为已读
 */
export function markAllAsRead() {
  return request({
    url: '/notifications/read-all',
    method: 'patch'
  });
}

/**
 * 删除通知
 * @param {Number} id - 通知ID
 */
export function deleteNotification(id) {
  return request({
    url: `/notifications/${id}`,
    method: 'delete'
  });
}

/**
 * 删除已读通知
 */
export function deleteReadNotifications() {
  return request({
    url: '/notifications/delete-read',
    method: 'delete'
  });
}
