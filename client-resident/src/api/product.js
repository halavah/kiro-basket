import request from './request'

/**
 * 获取商品列表
 */
export const getProductList = (params) => {
  return request({
    url: '/products',
    method: 'get',
    params
  })
}

/**
 * 获取商品详情
 */
export const getProductDetail = (id) => {
  return request({
    url: `/products/${id}`,
    method: 'get'
  })
}

/**
 * 搜索商品
 */
export const searchProducts = (params) => {
  return request({
    url: '/products/search',
    method: 'get',
    params
  })
}
