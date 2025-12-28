import request from './request'

/**
 * 获取分类列表
 */
export const getCategoryList = () => {
  return request({
    url: '/categories',
    method: 'get'
  })
}
