import { defineStore } from 'pinia'
import { ref } from 'vue'
import { residentLogin, getCurrentUser } from '@/api/auth'
import { setToken, getToken, removeToken, setUserInfo, getUserInfo, removeUserInfo } from '@/utils'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(getToken())
  const userInfo = ref(getUserInfo())

  // 登录
  const login = async (loginForm) => {
    try {
      const res = await residentLogin(loginForm)
      token.value = res.data.token
      userInfo.value = res.data.user
      setToken(res.data.token)
      setUserInfo(res.data.user)
      return res
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const res = await getCurrentUser()
      userInfo.value = res.data
      setUserInfo(res.data)
      return res
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = null
    removeToken()
    removeUserInfo()
  }

  return {
    token,
    userInfo,
    login,
    fetchUserInfo,
    logout
  }
})
