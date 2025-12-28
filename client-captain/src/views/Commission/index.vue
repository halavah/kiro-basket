<template>
  <div class="commission">
    <div class="page-header">
      <h2>佣金统计</h2>
    </div>

    <!-- 佣金统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">今日佣金</div>
          <div class="stat-value">¥{{ stats.todayCommission || 0 }}</div>
          <div class="stat-trend" :class="stats.todayTrend > 0 ? 'trend-up' : 'trend-down'">
            {{ stats.todayTrend > 0 ? '↑' : '↓' }} {{ Math.abs(stats.todayTrend || 0) }}%
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">本月佣金</div>
          <div class="stat-value">¥{{ stats.monthlyCommission || 0 }}</div>
          <div class="stat-extra">目标：¥{{ stats.monthlyTarget || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">累计佣金</div>
          <div class="stat-value">¥{{ stats.totalCommission || 0 }}</div>
          <div class="stat-extra">{{ stats.totalOrders || 0 }} 笔订单</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-label">平均佣金率</div>
          <div class="stat-value">{{ stats.avgCommissionRate || 0 }}%</div>
          <div class="stat-extra">行业平均: 10%</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 佣金趋势图表 -->
    <el-card class="chart-card">
      <template #header>
        <div class="chart-header">
          <span>佣金趋势</span>
          <el-radio-group v-model="trendDays" @change="fetchCommissionTrend">
            <el-radio-button :label="7">近7天</el-radio-button>
            <el-radio-button :label="15">近15天</el-radio-button>
            <el-radio-button :label="30">近30天</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="trendChartRef" style="height: 300px"></div>
    </el-card>

    <!-- 佣金明细列表 -->
    <el-card class="commission-table-card">
      <template #header>
        <div class="table-header">
          <span>佣金明细</span>
          <el-space>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="fetchCommissionList"
            />
            <el-button type="success" @click="handleExport">导出佣金明细</el-button>
          </el-space>
        </div>
      </template>

      <el-table v-loading="loading" :data="commissionList" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="residentName" label="居民姓名" width="100" />
        <el-table-column label="订单金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.orderAmount }}
          </template>
        </el-table-column>
        <el-table-column label="佣金比例" width="100" align="center">
          <template #default="{ row }">
            {{ row.commissionRate }}%
          </template>
        </el-table-column>
        <el-table-column label="佣金金额" width="120" align="right">
          <template #default="{ row }">
            <span class="commission-amount">¥{{ row.commissionAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已结算' : '未结算' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewOrder(row.orderId)">查看订单</el-button>
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
          @size-change="fetchCommissionList"
          @current-change="fetchCommissionList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import {
  getCommissionStats,
  getCommissionList,
  getCommissionTrend,
  exportCommissions
} from '@/api/commission';
import { formatDateTime } from '@/utils/date';

const router = useRouter();

const loading = ref(false);
const stats = ref({});
const commissionList = ref([]);
const dateRange = ref([]);
const trendDays = ref(7);
const trendChartRef = ref(null);

let trendChart = null;

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const handleViewOrder = (orderId) => {
  router.push(`/orders/${orderId}`);
};

const handleExport = async () => {
  try {
    const params = {
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    };

    const blob = await exportCommissions(params);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `佣金明细_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出佣金明细失败:', error);
  }
};

const fetchCommissionStats = async () => {
  try {
    const { data } = await getCommissionStats();
    stats.value = data;
  } catch (error) {
    console.error('获取佣金统计失败:', error);
  }
};

const fetchCommissionList = async () => {
  try {
    loading.value = true;
    const { data } = await getCommissionList({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1],
      page: pagination.page,
      pageSize: pagination.pageSize
    });

    commissionList.value = data.list || [];
    pagination.total = data.total || 0;
  } catch (error) {
    console.error('获取佣金明细失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchCommissionTrend = async () => {
  try {
    const { data } = await getCommissionTrend(trendDays.value);

    if (!trendChart) {
      trendChart = echarts.init(trendChartRef.value);
    }

    const option = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.dates || []
      },
      yAxis: {
        type: 'value',
        name: '佣金（元）'
      },
      series: [
        {
          name: '佣金',
          type: 'line',
          smooth: true,
          data: data.commissions || [],
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ]
            }
          },
          itemStyle: {
            color: '#409eff'
          }
        }
      ]
    };

    trendChart.setOption(option);
  } catch (error) {
    console.error('获取佣金趋势失败:', error);
  }
};

onMounted(() => {
  fetchCommissionStats();
  fetchCommissionList();
  fetchCommissionTrend();

  // 窗口大小改变时重绘图表
  window.addEventListener('resize', () => {
    trendChart?.resize();
  });
});
</script>

<style scoped>
.commission {
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
  margin-bottom: 10px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 500;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.stat-extra {
  font-size: 12px;
  color: #909399;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.commission-table-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.commission-amount {
  color: #67c23a;
  font-weight: 600;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
