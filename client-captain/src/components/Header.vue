<template>
  <el-header class="header">
    <div class="header-left">
      <el-icon class="toggle-btn" @click="toggleSidebar">
        <Fold v-if="!collapsed" />
        <Expand v-else />
      </el-icon>
      <h3 class="title">社区团购管理平台 - 团长端</h3>
    </div>

    <div class="header-right">
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-icon">
        <el-icon :size="20" @click="goToNotifications">
          <Bell />
        </el-icon>
      </el-badge>

      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-icon><User /></el-icon>
          <span>{{ username }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import { useAppStore } from '@/store/app';
import { Fold, Expand, Bell, User } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const appStore = useAppStore();

const collapsed = computed(() => appStore.sidebarCollapsed);
const unreadCount = computed(() => appStore.unreadNotifications);
const username = computed(() => userStore.username);

const toggleSidebar = () => {
  appStore.toggleSidebar();
};

const goToNotifications = () => {
  router.push('/notifications');
};

const handleCommand = (command) => {
  if (command === 'logout') {
    handleLogout();
  }
};

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await userStore.logout();
    ElMessage.success('退出成功');
    router.push('/login');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出失败:', error);
    }
  }
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.toggle-btn {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.toggle-btn:hover {
  color: #409eff;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-icon {
  cursor: pointer;
  transition: color 0.3s;
}

.notification-icon:hover {
  color: #409eff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.user-info:hover {
  color: #409eff;
}
</style>
