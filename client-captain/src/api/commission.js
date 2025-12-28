import request from './request';

/**
 * 获取佣金统计
 * @param {Object} params - { startDate, endDate }
 */
export function getCommissionStats(params) {
  return request({
    url: '/commission/overview',
    method: 'get',
    params
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data) {
      const data = res.data;
      res.data = {
        totalCommission: data.total_commission || 0,
        todayCommission: data.today_commission || 0,
        monthlyCommission: data.month_commission || 0,
        weekCommission: data.week_commission || 0,
        // 添加前端页面需要的其他字段
        avgCommissionRate: 0, // 需要后端计算
        totalOrders: 0, // 需要后端计算
        todayTrend: 0, // 需要后端计算
        monthlyTarget: 0 // 默认值
      };
    }
    return res;
  });
}

/**
 * 获取佣金明细列表
 * @param {Object} params - { page, pageSize, startDate, endDate }
 */
export function getCommissionList(params) {
  return request({
    url: '/commission/list',
    method: 'get',
    params
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(item => ({
        id: item.id,
        orderId: item.order_id,
        orderNo: item.order_no,
        orderAmount: item.order_amount || 0,
        commissionAmount: item.commission_amount || 0,
        commissionRate: item.commission_rate || 0,
        residentName: item.resident_name || '',
        status: item.status || 0,
        createdAt: item.created_at
      }));
    }
    return res;
  });
}

/**
 * 获取佣金趋势数据
 * @param {Number} days - 天数（默认7天）
 */
export function getCommissionTrend(days = 7) {
  return request({
    url: '/commission/trend',
    method: 'get',
    params: { days }
  });
}

/**
 * 导出佣金明细
 * @param {Object} params - { startDate, endDate }
 */
export function exportCommissions(params) {
  return request({
    url: '/commission/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}
