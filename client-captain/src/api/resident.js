import request from './request';

/**
 * 获取居民列表
 * @param {Object} params - { page, pageSize, keyword }
 */
export function getResidentList(params) {
  return request({
    url: '/residents',
    method: 'get',
    params
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(resident => ({
        id: resident.id,
        username: resident.username,
        name: resident.name,
        phone: resident.phone,
        address: resident.address,
        orderCount: resident.order_count || 0,
        totalConsumption: resident.total_amount || 0,
        totalAmount: resident.total_amount || 0,
        lastOrderTime: resident.last_order_time || null,
        createdAt: resident.created_at
      }));
    }
    return res;
  });
}

/**
 * 获取居民详情
 * @param {Number} id - 居民ID
 */
export function getResidentDetail(id) {
  return request({
    url: `/residents/${id}`,
    method: 'get'
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data) {
      const resident = res.data;
      res.data = {
        id: resident.id,
        username: resident.username,
        name: resident.name,
        phone: resident.phone,
        address: resident.address,
        orderCount: resident.order_count || 0,
        totalAmount: resident.total_amount || 0,
        totalConsumption: resident.total_amount || 0,
        lastOrderTime: resident.last_order_time || null,
        createdAt: resident.created_at
      };
    }
    return res;
  });
}

/**
 * 获取居民订单列表
 * @param {Number} id - 居民ID
 * @param {Object} params - { page, pageSize }
 */
export function getResidentOrders(id, params) {
  return request({
    url: `/residents/${id}/orders`,
    method: 'get',
    params
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(order => ({
        id: order.id,
        orderNo: order.order_no,
        totalAmount: order.total_amount,
        itemCount: order.item_count,
        status: order.status,
        statusText: order.status_text,
        createdAt: order.created_at
      }));
    }
    return res;
  });
}

/**
 * 获取居民消费统计
 * @param {Number} id - 居民ID
 */
export function getResidentStats(id) {
  return request({
    url: `/residents/${id}/stats`,
    method: 'get'
  });
}
