import request from './request'

/**
 * 获取购物车列表
 */
export const getCartList = () => {
  return request({
    url: '/cart',
    method: 'get'
  })
}

/**
 * 添加商品到购物车
 */
export const addToCart = (data) => {
  return request({
    url: '/cart',
    method: 'post',
    data
  })
}

/**
 * 更��购物车商品数量
 */
export const updateCartItem = (id, data) => {
  return request({
    url: `/cart/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除购物车商品
 */
export const deleteCartItem = (id) => {
  return request({
    url: `/cart/${id}`,
    method: 'delete'
  })
}

/**
 * 清空购物车
 */
export const clearCart = () => {
  return request({
    url: '/cart',
    method: 'delete'
  })
}
