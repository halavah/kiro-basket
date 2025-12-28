import request from './request'

/**
 * 获取个人信息
 */
export const getProfile = () => {
  return request({
    url: '/profile',
    method: 'get'
  })
}

/**
 * 更新个人信息
 */
export const updateProfile = (data) => {
  return request({
    url: '/profile',
    method: 'put',
    data
  })
}
