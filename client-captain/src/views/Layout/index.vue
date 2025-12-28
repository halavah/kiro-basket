<template>
  <el-container class="layout-container">
    <Sidebar />
    <el-container>
      <Header />
      <el-main class="main-content">
        <router-view />
      </el-main>
      <el-footer class="footer">
        © 2025 社区团购管理平台
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { onMounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Header from '@/components/Header.vue';
import { useAppStore } from '@/store/app';
import { getUnreadCount } from '@/api/notification';

const appStore = useAppStore();

// 获取未读通知数量
const fetchUnreadCount = async () => {
  try {
    const { data } = await getUnreadCount();
    appStore.setUnreadNotifications(data.count || 0);
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
  }
};

onMounted(() => {
  fetchUnreadCount();

  // 每30秒更新一次未读通知数量
  setInterval(() => {
    fetchUnreadCount();
  }, 30000);
});
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.main-content {
  background-color: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
}

.footer {
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #909399;
  height: 50px;
}
</style>
