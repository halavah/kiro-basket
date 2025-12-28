import request from './request';

/**
 * 获取数据看板统计
 */
export function getDashboardStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data) {
      const data = res.data;
      res.data = {
        todayOrders: data.today.order_count || 0,
        todaySales: data.today.sales_amount || 0,
        todayCommission: data.today.commission || 0,
        pendingOrders: data.pending_orders || 0,
        stockAlerts: data.stock_alerts || 0,
        totalOrders: data.total.order_count || 0,
        totalSales: data.total.sales_amount || 0,
        totalCommission: data.total.commission || 0,
        totalResidents: data.total.resident_count || 0,
        avgOrderAmount: data.total.order_count ? (data.total.sales_amount / data.total.order_count).toFixed(2) : 0,
        commissionRate: data.total.sales_amount ? ((data.total.commission / data.total.sales_amount) * 100).toFixed(2) : 0
      };
    }
    return res;
  });
}

/**
 * 获取销售趋势数据
 * @param {Number} days - 天数（默认7天）
 */
export function getSalesTrend(days = 7) {
  return request({
    url: '/dashboard/sales-trend',
    method: 'get',
    params: { days }
  });
}

/**
 * 获取订单状态分布
 */
export function getOrderStatusDistribution() {
  return request({
    url: '/dashboard/order-status',
    method: 'get'
  });
}

/**
 * 获取热销商品 Top 5
 */
export function getTopProducts() {
  return request({
    url: '/dashboard/top-products',
    method: 'get'
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data && Array.isArray(res.data)) {
      res.data = res.data.map(product => ({
        id: product.id,
        name: product.name,
        sales: product.sales || 0,
        salesAmount: product.sales_amount || 0,
        image: product.image
      }));
    }
    return res;
  });
}

/**
 * 获取库存预警商品
 */
export function getStockAlerts() {
  return request({
    url: '/dashboard/stock-alerts',
    method: 'get'
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data && Array.isArray(res.data)) {
      res.data = res.data.map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock || 0,
        alertThreshold: product.alert_threshold || 10,
        categoryName: product.category_name,
        image: product.image
      }));
    }
    return res;
  });
}
