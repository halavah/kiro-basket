import request from './request';

/**
 * 获取订单列表
 * @param {Object} params - { page, pageSize, status, paymentStatus, keyword, startDate, endDate }
 */
export function getOrderList(params) {
  // 转换字段名：camelCase -> snake_case
  const requestParams = {
    page: params.page,
    pageSize: params.pageSize,
    status: params.status,
    payment_status: params.paymentStatus,
    keyword: params.keyword,
    startDate: params.startDate,
    endDate: params.endDate
  };

  return request({
    url: '/orders',
    method: 'get',
    params: requestParams
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(order => ({
        id: order.id,
        orderNo: order.order_no,
        residentName: order.resident_name,
        residentPhone: order.resident_phone,
        totalAmount: order.total_amount,
        commission: order.commission_amount,
        itemCount: order.item_count,
        address: order.address,
        status: order.status,
        paymentStatus: order.payment_status,
        paidAt: order.paid_at,
        statusText: order.status_text,
        createdAt: order.created_at
      }));
    }
    return res;
  });
}

/**
 * 获取订单详情
 * @param {Number} id - 订单ID
 */
export function getOrderDetail(id) {
  return request({
    url: `/orders/${id}`,
    method: 'get'
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data) {
      const order = res.data;

      // 状态映射
      const statusMap = {
        0: '待确认',
        1: '配送中',
        2: '已完成',
        3: '已取消'
      };

      res.data = {
        id: order.id,
        orderNo: order.order_no,
        residentId: order.resident_id,
        residentName: order.resident_name,
        residentPhone: order.resident_phone,
        address: order.address,
        totalAmount: order.total_amount,
        commission: order.commission_amount,
        status: order.status,
        paymentStatus: order.payment_status,
        paidAt: order.paid_at,
        statusText: order.status_text,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        note: order.remark,
        items: (order.items || []).map(item => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          productImage: item.product?.image || '',
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        logs: (order.status_logs || []).map(log => ({
          action: `订单状态从 "${statusMap[log.from_status] || '未知'}" 变更为 "${statusMap[log.to_status] || '未知'}"`,
          createdAt: log.created_at,
          fromStatus: log.from_status,
          toStatus: log.to_status
        }))
      };
    }
    return res;
  });
}

/**
 * 确认订单
 * @param {Number} id - 订单ID
 */
export function confirmOrder(id) {
  return request({
    url: `/orders/${id}/confirm`,
    method: 'patch'
  });
}

/**
 * 标记订单为配送中（注意：后端无此接口，订单确认后直接进入配送中状态）
 * @param {Number} id - 订单ID
 * @deprecated 后端未实现此接口，请使用 confirmOrder
 */
export function deliverOrder(id) {
  return request({
    url: `/orders/${id}/deliver`,
    method: 'patch'
  });
}

/**
 * 完成订单
 * @param {Number} id - 订单ID
 */
export function completeOrder(id) {
  return request({
    url: `/orders/${id}/complete`,
    method: 'patch'
  });
}

/**
 * 取消订单
 * @param {Number} id - 订单ID
 * @param {String} reason - 取消原因（可选）
 */
export function cancelOrder(id, reason) {
  return request({
    url: `/orders/${id}/cancel`,
    method: 'patch',
    data: reason ? { reason } : {}
  });
}

/**
 * 导出订单
 * @param {Object} params - { status, startDate, endDate }
 */
export function exportOrders(params) {
  return request({
    url: '/orders/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}
