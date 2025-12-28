<template>
  <el-aside :width="collapsed ? '64px' : '200px'" class="sidebar">
    <el-menu
      :default-active="activeMenu"
      :collapse="collapsed"
      :default-openeds="['products']"
      router
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
    >
      <el-menu-item index="/dashboard">
        <el-icon><DataAnalysis /></el-icon>
        <span>数据看板</span>
      </el-menu-item>

      <el-sub-menu index="products">
        <template #title>
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </template>
        <el-menu-item index="/products">商品列表</el-menu-item>
        <el-menu-item index="/categories">分类管理</el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/orders">
        <el-icon><Document /></el-icon>
        <span>订单管理</span>
      </el-menu-item>

      <el-menu-item index="/residents">
        <el-icon><User /></el-icon>
        <span>居民管理</span>
      </el-menu-item>

      <el-menu-item index="/commission">
        <el-icon><Coin /></el-icon>
        <span>佣金统计</span>
      </el-menu-item>

      <el-menu-item index="/notifications">
        <el-icon><Bell /></el-icon>
        <span>消息通知</span>
        <el-badge
          v-if="unreadCount > 0"
          :value="unreadCount"
          class="notification-badge"
        />
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/store/app';
import {
  DataAnalysis,
  Goods,
  Document,
  User,
  Coin,
  Bell
} from '@element-plus/icons-vue';

const route = useRoute();
const appStore = useAppStore();

const collapsed = computed(() => appStore.sidebarCollapsed);
const unreadCount = computed(() => appStore.unreadNotifications);
const activeMenu = computed(() => route.path);
</script>

<style scoped>
.sidebar {
  background-color: #304156;
  height: 100vh;
  overflow-y: auto;
  transition: width 0.3s;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.notification-badge {
  position: absolute;
  right: 20px;
}

.el-menu {
  border-right: none;
}
</style>
