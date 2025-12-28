import { defineStore } from 'pinia';
import { login, logout, getCaptainInfo } from '@/api/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('captain_token') || '',
    userInfo: JSON.parse(localStorage.getItem('captain_info') || '{}')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    username: (state) => state.userInfo.username || '',
    phone: (state) => state.userInfo.phone || ''
  },

  actions: {
    // 登录
    async login(loginForm) {
      try {
        const { data } = await login(loginForm);
        this.token = data.token;
        this.userInfo = data.userInfo;

        // 保存到 localStorage
        localStorage.setItem('captain_token', data.token);
        localStorage.setItem('captain_info', JSON.stringify(data.userInfo));

        return Promise.resolve(data);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    // 退出登录
    async logout() {
      try {
        await logout();
        this.token = '';
        this.userInfo = {};
        localStorage.removeItem('captain_token');
        localStorage.removeItem('captain_info');
      } catch (error) {
        // 即使接口失败也清除本地数据
        this.token = '';
        this.userInfo = {};
        localStorage.removeItem('captain_token');
        localStorage.removeItem('captain_info');
      }
    },

    // 获取用户信息
    async getUserInfo() {
      try {
        const { data } = await getCaptainInfo();
        this.userInfo = data;
        localStorage.setItem('captain_info', JSON.stringify(data));
        return Promise.resolve(data);
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }
});
