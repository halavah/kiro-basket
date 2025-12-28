<template>
  <div class="notification">
    <div class="page-header">
      <h2>消息通知</h2>
      <el-space>
        <el-button type="primary" @click="handleMarkAllAsRead">全部标为已读</el-button>
      </el-space>
    </div>

    <!-- 筛选标签 -->
    <el-card class="filter-card">
      <el-radio-group v-model="filterType" @change="handleFilterChange">
        <el-radio-button label="">全部 ({{ stats.total || 0 }})</el-radio-button>
        <el-radio-button label="0">未读 ({{ stats.unread || 0 }})</el-radio-button>
        <el-radio-button label="1">已读 ({{ stats.read || 0 }})</el-radio-button>
      </el-radio-group>

      <el-divider direction="vertical" />

      <el-radio-group v-model="filterTypeCategory" @change="handleFilterChange">
        <el-radio-button label="">全部类型</el-radio-button>
        <el-radio-button label="order">订单通知</el-radio-button>
        <el-radio-button label="product">商品通知</el-radio-button>
        <el-radio-button label="system">系统通知</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 通知列表 -->
    <el-card class="notification-list-card">
      <el-empty v-if="!loading && notificationList.length === 0" description="暂无通知" />

      <div v-loading="loading" class="notification-list">
        <div
          v-for="item in notificationList"
          :key="item.id"
          :class="['notification-item', { 'is-read': item.isRead === 1 }]"
          @click="handleReadNotification(item)"
        >
          <div class="notification-icon">
            <el-icon :size="24" :color="getTypeColor(item.type)">
              <component :is="getTypeIcon(item.type)" />
            </el-icon>
          </div>

          <div class="notification-content">
            <div class="notification-title">
              <span>{{ item.title }}</span>
              <el-tag v-if="item.isRead === 0" type="danger" size="small">未读</el-tag>
            </div>
            <div class="notification-message">{{ item.message }}</div>
            <div class="notification-footer">
              <span class="notification-time">{{ item.createdAt }}</span>
              <el-tag :type="getTypeTagType(item.type)" size="small">
                {{ getTypeText(item.type) }}
              </el-tag>
            </div>
          </div>

          <div class="notification-actions">
            <el-button
              size="small"
              @click.stop="handleView(item)"
            >
              查看
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click.stop="handleDelete(item.id)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="notificationList.length > 0" class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchNotificationList"
          @current-change="fetchNotificationList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Bell, ShoppingCart, Goods, Warning } from '@element-plus/icons-vue';
import {
  getNotificationList,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '@/api/notification';
import { useAppStore } from '@/store/app';

const router = useRouter();
const appStore = useAppStore();

const loading = ref(false);
const notificationList = ref([]);
const filterType = ref('');
const filterTypeCategory = ref('');

const stats = ref({
  total: 0,
  unread: 0,
  read: 0
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const getTypeIcon = (type) => {
  const iconMap = {
    order: ShoppingCart,
    product: Goods,
    system: Warning
  };
  return iconMap[type] || Bell;
};

const getTypeColor = (type) => {
  const colorMap = {
    order: '#409eff',
    product: '#67c23a',
    system: '#e6a23c'
  };
  return colorMap[type] || '#909399';
};

const getTypeTagType = (type) => {
  const tagTypeMap = {
    order: 'primary',
    product: 'success',
    system: 'warning'
  };
  return tagTypeMap[type] || 'info';
};

const getTypeText = (type) => {
  const textMap = {
    order: '订单通知',
    product: '商品通知',
    system: '系统通知'
  };
  return textMap[type] || '通知';
};

const handleFilterChange = () => {
  pagination.page = 1;
  fetchNotificationList();
};

const handleReadNotification = (item) => {
  if (item.isRead === 0) {
    handleMarkAsRead(item.id);
  }
};

const handleView = async (item) => {
  // 如果未读，先标记为已读
  if (item.isRead === 0) {
    try {
      await markAsRead(item.id);
      updateUnreadCount();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }

  // 根据通知类型跳转到对应页面
  if (item.type === 'order' || item.type === 'new_order') {
    // 订单通知 - 跳转到订单详情
    if (item.relatedId) {
      router.push(`/orders/${item.relatedId}`);
    } else {
      router.push('/orders');
    }
  } else if (item.type === 'product' || item.type === 'stock_alert') {
    // 商品通知 - 跳转到商品编辑页
    if (item.relatedId) {
      router.push(`/products/edit/${item.relatedId}`);
    } else {
      router.push('/products');
    }
  } else if (item.type === 'system') {
    // 系统通知 - 跳转到首页
    router.push('/');
  } else {
    // 默认跳转到首页
    router.push('/');
  }
};

const handleMarkAsRead = async (id) => {
  try {
    await markAsRead(id);
    ElMessage.success('已标记为已读');
    fetchNotificationList();
    updateUnreadCount();
  } catch (error) {
    console.error('标记已读失败:', error);
  }
};

const handleMarkAllAsRead = async () => {
  try {
    await ElMessageBox.confirm('确定要将所有通知标记为已读吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    });

    await markAllAsRead();
    ElMessage.success('已全部标记为已读');
    fetchNotificationList();
    updateUnreadCount();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('标记全部已读失败:', error);
    }
  }
};

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该通知吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await deleteNotification(id);
    ElMessage.success('删除成功');
    fetchNotificationList();
    updateUnreadCount();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除通知失败:', error);
    }
  }
};



const fetchNotificationList = async () => {
  try {
    loading.value = true;
    const { data } = await getNotificationList({
      isRead: filterType.value,
      type: filterTypeCategory.value,
      page: pagination.page,
      pageSize: pagination.pageSize
    });

    notificationList.value = data.list || [];
    pagination.total = data.total || 0;

    // 更新统计
    if (data.stats) {
      stats.value = data.stats;
    }
  } catch (error) {
    console.error('获取通知列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const updateUnreadCount = () => {
  // 更新全局未读通知数
  const unreadCount = notificationList.value.filter(n => n.isRead === 0).length;
  appStore.setUnreadNotifications(unreadCount);
};

onMounted(() => {
  fetchNotificationList();
});
</script>

<style scoped>
.notification {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.notification-list-card {
  margin-bottom: 20px;
}

.notification-list {
  min-height: 200px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.is-read {
  opacity: 0.6;
}

.notification-icon {
  flex-shrink: 0;
  margin-right: 15px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 50%;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.notification-message {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.notification-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.notification-actions {
  flex-shrink: 0;
  margin-left: 15px;
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
