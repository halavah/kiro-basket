<template>
  <div class="order-list">
    <div class="page-header">
      <h2>订单管理</h2>
    </div>

    <!-- 搜索筛选区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待确认" :value="0" />
            <el-option label="配送中" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="searchForm.paymentStatus" placeholder="请选择" clearable style="width: 150px">
            <el-option label="未支付" :value="0" />
            <el-option label="已支付" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="searchForm.keyword" placeholder="订单号/居民姓名/手机号" clearable />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">导出订单</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">待确认</div>
          <div class="stat-value">{{ stats.pending || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">配送中</div>
          <div class="stat-value">{{ stats.delivering || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">已取消</div>
          <div class="stat-value">{{ stats.cancelled || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">今日完成</div>
          <div class="stat-value">{{ stats.todayCompleted || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单列表 -->
    <el-card class="order-table-card">
      <el-table v-loading="loading" :data="orderList" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="residentName" label="居民姓名" width="100" />
        <el-table-column prop="residentPhone" label="手机号" width="120" />
        <el-table-column label="订单金额" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.totalAmount }}
          </template>
        </el-table-column>
        <el-table-column label="佣金" width="80" align="right">
          <template #default="{ row }">
            ¥{{ row.commission }}
          </template>
        </el-table-column>
        <el-table-column prop="itemCount" label="商品数" width="80" align="center" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="配送地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="下单时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.paymentStatus === 1" type="success" effect="dark">已支付</el-tag>
            <el-tag v-else type="info">未支付</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row.id)">查看详情</el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="success"
              :disabled="row.paymentStatus !== 1"
              :title="row.paymentStatus !== 1 ? '用户未支付，无法确认' : ''"
              @click="handleConfirm(row)"
            >
              确认订单
            </el-button>
            <el-button
              v-if="row.status === 1"
              size="small"
              type="success"
              @click="handleComplete(row)"
            >
              完成订单
            </el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="danger"
              @click="handleCancel(row)"
            >
              取消订单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchOrderList"
          @current-change="fetchOrderList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getOrderList,
  confirmOrder,
  deliverOrder,
  completeOrder,
  cancelOrder,
  exportOrders
} from '@/api/order';
import { formatDateTime } from '@/utils/date';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const orderList = ref([]);
const dateRange = ref([]);

const stats = ref({
  pending: 0,
  delivering: 0,
  cancelled: 0,
  todayCompleted: 0
});

const searchForm = reactive({
  status: route.query.status ? parseInt(route.query.status) : null,
  paymentStatus: null,
  keyword: ''
});

const pagination = reactive({
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

const handleSearch = () => {
  pagination.page = 1;
  fetchOrderList();
};

const handleReset = () => {
  searchForm.status = null;
  searchForm.paymentStatus = null;
  searchForm.keyword = '';
  dateRange.value = [];
  handleSearch();
};

const handleViewDetail = (id) => {
  router.push(`/orders/${id}`);
};

const handleConfirm = async (row) => {
  try {
    await ElMessageBox.confirm('确定要确认该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    });

    await confirmOrder(row.id);
    ElMessage.success('订单已确认');
    fetchOrderList();
    updateStats();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认订单失败:', error);
    }
  }
};

const handleDeliver = async (row) => {
  try {
    await ElMessageBox.confirm('确定要开始配送该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    });

    await deliverOrder(row.id);
    ElMessage.success('已标记为配送中');
    fetchOrderList();
    updateStats();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('标记配送失败:', error);
    }
  }
};

const handleComplete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要完成该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    });

    await completeOrder(row.id);
    ElMessage.success('订单已完成');
    fetchOrderList();
    updateStats();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成订单失败:', error);
    }
  }
};

const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await cancelOrder(row.id);
    ElMessage.success('订单已取消');
    fetchOrderList();
    updateStats();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error);
    }
  }
};

const handleExport = async () => {
  try {
    const params = {
      status: searchForm.status,
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    };

    const blob = await exportOrders(params);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `订单列表_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出订单失败:', error);
  }
};

const fetchOrderList = async () => {
  try {
    loading.value = true;
    const { data } = await getOrderList({
      ...searchForm,
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
      page: pagination.page,
      pageSize: pagination.pageSize
    });

    // API 层已经转换了字段，直接使用
    orderList.value = data.list || [];
    pagination.total = data.total || 0;

    // 更新统计数据
    updateStats();
  } catch (error) {
    console.error('获取订单列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const updateStats = () => {
  const allOrders = orderList.value;
  const today = new Date().toDateString();

  stats.value = {
    pending: allOrders.filter(o => o.status === 0).length,      // 待确认
    delivering: allOrders.filter(o => o.status === 1).length,   // 配送中
    cancelled: allOrders.filter(o => o.status === 3).length,    // 已取消
    todayCompleted: allOrders.filter(o => {
      if (o.status === 2 && o.createdAt) {  // 已完成
        const orderDate = new Date(o.createdAt).toDateString();
        return orderDate === today;
      }
      return false;
    }).length
  };
};

onMounted(() => {
  fetchOrderList();
});
</script>

<style scoped>
.order-list {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.search-card {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  cursor: default;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.order-table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
