import request from './request';

/**
 * 团长登录
 * @param {Object} data - { username, password }
 */
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  });
}

/**
 * 退出登录
 */
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  });
}

/**
 * 获取团长信息
 */
export function getCaptainInfo() {
  return request({
    url: '/info',
    method: 'get'
  });
}
