import request from './request'

/**
 * 居民登录
 */
export const residentLogin = (data) => {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

/**
 * 居民注册
 */
export const residentRegister = (data) => {
  return request({
    url: '/register',
    method: 'post',
    data
  })
}

/**
 * 获取当前登录用户信息
 */
export const getCurrentUser = () => {
  return request({
    url: '/profile',
    method: 'get'
  })
}
