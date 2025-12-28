// API 基础地址
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Token 存储键名
export const TOKEN_KEY = 'resident_token'

// 用户信息存储键名
export const USER_INFO_KEY = 'resident_user_info'

// 订单状态映射
export const ORDER_STATUS = {
  0: { label: '待确认', type: 'warning' },
  1: { label: '配送中', type: 'primary' },
  2: { label: '已完成', type: 'success' },
  3: { label: '已取消', type: 'info' }
}

// 分页默认配置
export const PAGE_SIZE = 12

// 商品分类
export const CATEGORIES = [
  { id: 1, name: '水果', icon: '🍎' },
  { id: 2, name: '蔬菜', icon: '🥬' },
  { id: 3, name: '肉禽蛋', icon: '🥩' },
  { id: 4, name: '粮油调味', icon: '🌾' },
  { id: 5, name: '零食饮料', icon: '🍭' }
]
