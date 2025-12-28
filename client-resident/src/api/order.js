import request from './request'

/**
 * 创建订单
 */
export const createOrder = (data) => {
  return request({
    url: '/orders',
    method: 'post',
    data
  })
}

/**
 * 获取订单列表
 */
export const getOrderList = (params) => {
  return request({
    url: '/orders',
    method: 'get',
    params
  })
}

/**
 * 获取订单详情
 */
export const getOrderDetail = (id) => {
  return request({
    url: `/orders/${id}`,
    method: 'get'
  })
}

/**
 * 取消订单
 */
export const cancelOrder = (id) => {
  return request({
    url: `/orders/${id}/cancel`,
    method: 'patch'
  })
}

/**
 * 支付订单
 */
export const payOrder = (id) => {
  return request({
    url: `/orders/${id}/pay`,
    method: 'post'
  })
}
