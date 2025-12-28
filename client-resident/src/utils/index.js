import { TOKEN_KEY, USER_INFO_KEY } from './constants'

/**
 * 存储 token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 获取 token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 移除 token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 存储用户信息
 */
export const setUserInfo = (userInfo) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  const userInfo = localStorage.getItem(USER_INFO_KEY)
  if (!userInfo) return null
  try {
    return JSON.parse(userInfo)
  } catch (err) {
    console.error('Json parse userInfo error: ', err)
    localStorage.removeItem(USER_INFO_KEY)
    return null
  }
}

/**
 * 移除用户信息
 */
export const removeUserInfo = () => {
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 格式化价格
 */
export const formatPrice = (price) => {
  return `¥${Number(price).toFixed(2)}`
}

/**
 * 格式化日期时间
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 格式化日期
 */
export const formatDate = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 手机号脱敏
 */
export const maskPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 获取图片完整URL
 * @param {string} imagePath - 图片路径（如 /uploads/apple.jpg）
 * @returns {string} 完整的图片URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return ''

  // 如果已经是完整URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // 处理路径
  let path = imagePath
  if (!path.startsWith('/')) {
    path = '/' + path
  }

  // 确保包含 /uploads 前缀
  if (!path.startsWith('/uploads')) {
    path = '/uploads' + path
  }

  // 开发环境：直接返回相对路径，通过 Vite proxy 转发
  // 生产环境：需要拼接完整的服务器地址
  const baseURL = import.meta.env.VITE_API_BASE_URL

  // 如果 baseURL 是相对路径（如 /api），说明是开发环境，直接返回 path
  if (baseURL && baseURL.startsWith('/')) {
    return path
  }

  // 生产环境：拼接完整URL（baseURL 是 https://... 格式）
  if (baseURL && (baseURL.startsWith('http://') || baseURL.startsWith('https://'))) {
    // 移除 baseURL 末尾的 /api，只保留域名部分
    const serverURL = baseURL.replace(/\/api.*$/, '')
    return `${serverURL}${path}`
  }

  // 兜底：使用 localhost
  return `http://localhost:3000${path}`
}
