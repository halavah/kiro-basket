<template>
  <div class="resident-list">
    <div class="page-header">
      <h2>居民管理</h2>
    </div>

    <!-- 搜索筛选区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="搜索">
          <el-input v-model="searchForm.keyword" placeholder="姓名/手机号/地址" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 居民统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">总居民数</div>
          <div class="stat-value">{{ stats.totalResidents || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">今日新增</div>
          <div class="stat-value">{{ stats.todayNew || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">活跃居民</div>
          <div class="stat-value">{{ stats.activeResidents || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">本月消费总额</div>
          <div class="stat-value">¥{{ stats.monthlyConsumption || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 居民列表 -->
    <el-card class="resident-table-card">
      <el-table v-loading="loading" :data="residentList" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="address" label="地址" width="200" show-overflow-tooltip />
        <el-table-column label="订单数" width="80" align="center">
          <template #default="{ row }">
            {{ row.orderCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="消费总额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.totalConsumption || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="最近下单" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.lastOrderTime) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row.id)">查看详情</el-button>
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
          @size-change="fetchResidentList"
          @current-change="fetchResidentList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getResidentList } from '@/api/resident';
import { formatDateTime } from '@/utils/date';

const router = useRouter();

const loading = ref(false);
const residentList = ref([]);

const stats = ref({
  totalResidents: 0,
  todayNew: 0,
  activeResidents: 0,
  monthlyConsumption: 0
});

const searchForm = reactive({
  keyword: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const handleSearch = () => {
  pagination.page = 1;
  fetchResidentList();
};

const handleReset = () => {
  searchForm.keyword = '';
  handleSearch();
};

const handleViewDetail = (id) => {
  router.push(`/residents/${id}`);
};

const fetchResidentList = async () => {
  try {
    loading.value = true;
    const { data } = await getResidentList({
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    });

    residentList.value = data.list || [];
    pagination.total = data.total || 0;

    // 计算统计数据
    calculateStats();
  } catch (error) {
    console.error('获取居民列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const calculateStats = () => {
  const allResidents = residentList.value;
  const today = new Date().toDateString();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  stats.value = {
    totalResidents: pagination.total || 0,
    todayNew: allResidents.filter(r => {
      if (r.createdAt) {
        const createdDate = new Date(r.createdAt).toDateString();
        return createdDate === today;
      }
      return false;
    }).length,
    activeResidents: allResidents.filter(r => r.orderCount > 0).length,
    monthlyConsumption: allResidents
      .filter(r => {
        if (r.lastOrderTime) {
          const orderDate = new Date(r.lastOrderTime);
          return orderDate.getMonth() === currentMonth &&
                 orderDate.getFullYear() === currentYear;
        }
        return false;
      })
      .reduce((sum, r) => sum + (parseFloat(r.totalConsumption) || 0), 0)
      .toFixed(2)
  };
};

onMounted(() => {
  fetchResidentList();
});
</script>

<style scoped>
.resident-list {
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

.resident-table-card {
  margin-bottom: 20px;
}

.resident-table-card :deep(.el-table__cell) {
  padding: 8px 0;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
