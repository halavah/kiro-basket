import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarCollapsed: false, // 侧边栏是否收起
    unreadNotifications: 0 // 未读通知数量
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    setSidebarCollapsed(collapsed) {
      this.sidebarCollapsed = collapsed;
    },

    setUnreadNotifications(count) {
      this.unreadNotifications = count;
    }
  }
});
