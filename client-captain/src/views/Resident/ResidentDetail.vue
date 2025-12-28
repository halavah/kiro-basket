<template>
  <div class="resident-detail">
    <div class="page-header">
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>居民详情</h2>
    </div>

    <el-card v-loading="loading" class="detail-card">
      <!-- 居民基本信息 -->
      <div class="section">
        <h3 class="section-title">基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ residentDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ residentDetail.phone }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">
            {{ residentDetail.address }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ residentDetail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="最近下单">{{ residentDetail.lastOrderTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 消费统计 -->
      <div class="section">
        <h3 class="section-title">消费统计</h3>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card">
              <div class="stat-label">订单总数</div>
              <div class="stat-value">{{ stats.totalOrders || 0 }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card">
              <div class="stat-label">消费总额</div>
              <div class="stat-value">¥{{ stats.totalConsumption || 0 }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card">
              <div class="stat-label">平均客单价</div>
              <div class="stat-value">¥{{ stats.avgOrderAmount || 0 }}</div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="stat-card">
              <div class="stat-label">本月订单</div>
              <div class="stat-value">{{ stats.monthlyOrders || 0 }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 订单列表 -->
      <div class="section">
        <h3 class="section-title">订单记录</h3>
        <el-table :data="orderList" border>
          <el-table-column prop="orderNo" label="订单号" width="180" />
          <el-table-column label="订单金额" width="100" align="right">
            <template #default="{ row }">
              ¥{{ row.totalAmount }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="itemCount" label="商品数" width="80" align="center" />
          <el-table-column label="下单时间" width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleViewOrder(row.id)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="orderPagination.page"
            v-model:page-size="orderPagination.pageSize"
            :total="orderPagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="fetchOrders"
            @current-change="fetchOrders"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { getResidentDetail, getResidentOrders, getResidentStats } from '@/api/resident';
import { formatDateTime } from '@/utils/date';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const residentDetail = ref({});
const stats = ref({});
const orderList = ref([]);

const orderPagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const getStatusType = (status) => {
  const typeMap = {
    0: 'warning',   // 待确认
    1: 'primary',   // 配送中
    2: 'success',   // 已完成
    3: 'danger'     // 已取消
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status) => {
  const textMap = {
    0: '待确认',
    1: '配送中',
    2: '已完成',
    3: '已取消'
  };
  return textMap[status] || '未知';
};

const handleBack = () => {
  router.back();
};

const handleViewOrder = (orderId) => {
  router.push(`/orders/${orderId}`);
};

const fetchResidentDetail = async () => {
  try {
    loading.value = true;
    const { data } = await getResidentDetail(route.params.id);
    residentDetail.value = data;
  } catch (error) {
    console.error('获取居民详情失败:', error);
    ElMessage.error('获取居民详情失败');
  } finally {
    loading.value = false;
  }
};

const fetchStats = async () => {
  try {
    const { data } = await getResidentStats(route.params.id);
    stats.value = data;
  } catch (error) {
    console.error('获取消费统计失败:', error);
  }
};

const fetchOrders = async () => {
  try {
    const { data } = await getResidentOrders(route.params.id, {
      page: orderPagination.page,
      pageSize: orderPagination.pageSize
    });

    orderList.value = data.list || [];
    orderPagination.total = data.total || 0;
  } catch (error) {
    console.error('获取订单记录失败:', error);
  }
};

onMounted(() => {
  fetchResidentDetail();
  fetchStats();
  fetchOrders();
});
</script>

<style scoped>
.resident-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.detail-card {
  margin-bottom: 20px;
}

.section {
  margin-bottom: 30px;
}

.section :deep(.el-table__cell) {
  padding: 8px 0;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.stat-card {
  text-align: center;
  cursor: default;
  margin-bottom: 20px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
