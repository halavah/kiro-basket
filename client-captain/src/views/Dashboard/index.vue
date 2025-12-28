<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>数据看板</h2>
      <span class="date">{{ currentDate }}</span>
    </div>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="今日订单数"
          :value="stats.todayOrders || 0"
          :trend="stats.ordersTrend"
          :clickable="true"
          @click="goToOrders"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="今日销售额"
          :value="`¥${stats.todaySales || 0}`"
          :trend="stats.salesTrend"
          :clickable="true"
          @click="goToOrders"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="今日佣金"
          :value="`¥${stats.todayCommission || 0}`"
          :trend="stats.commissionTrend"
          :clickable="true"
          @click="goToOrders"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="quick-link-card clickable" :body-style="{ padding: '20px' }" @click="goToOrders">
          <div class="quick-link-title">待处理订单</div>
          <div class="quick-link-value">{{ stats.pendingOrders || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="累计订单数"
          :value="stats.totalOrders || 0"
          :extra="`居民: ${stats.totalResidents || 0}`"
          :clickable="true"
          @click="goToOrders"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="累计销售额"
          :value="`¥${stats.totalSales || 0}`"
          :extra="`客单价: ¥${stats.avgOrderAmount || 0}`"
          :clickable="true"
          @click="goToOrders"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <StatCard
          title="累计佣金"
          :value="`¥${stats.totalCommission || 0}`"
          :extra="`比例: ${stats.commissionRate || 0}%`"
          :clickable="true"
          @click="goToOrders"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="quick-link-card clickable" :body-style="{ padding: '20px' }" @click="goToProducts">
          <div class="quick-link-title">库存预警</div>
          <div class="quick-link-value">{{ stats.stockAlerts || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 销售趋势图 -->
    <el-card class="chart-card">
      <template #header>
        <span>销售趋势（近7天）</span>
      </template>
      <div ref="salesChartRef" style="height: 300px"></div>
    </el-card>

    <!-- 订单状态分布和热销商品 -->
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <span>订单状态分布</span>
          </template>
          <div ref="orderStatusChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-card">
          <template #header>
            <span>热销商品 Top 5</span>
          </template>
          <el-table :data="topProducts" style="width: 100%">
            <el-table-column type="index" label="排名" width="60" />
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="sales" label="销量" width="80" align="center" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import StatCard from '@/components/StatCard.vue';
import {
  getDashboardStats,
  getSalesTrend,
  getOrderStatusDistribution,
  getTopProducts
} from '@/api/dashboard';

const router = useRouter();

const currentDate = new Date().toLocaleDateString('zh-CN');
const stats = ref({});
const topProducts = ref([]);
const salesChartRef = ref(null);
const orderStatusChartRef = ref(null);

let salesChart = null;
let orderStatusChart = null;

const goToOrders = () => {
  router.push('/orders?status=0');
};

const goToProducts = () => {
  router.push('/products');
};

const fetchDashboardStats = async () => {
  try {
    const { data } = await getDashboardStats();
    stats.value = data;
  } catch (error) {
    console.error('获取数据看板统计失败:', error);
  }
};

const initSalesChart = async () => {
  try {
    const { data } = await getSalesTrend(7);

    salesChart = echarts.init(salesChartRef.value);
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: data.dates || []
      },
      yAxis: {
        type: 'value',
        name: '销售额（元）'
      },
      series: [
        {
          data: data.sales || [],
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#409eff'
          }
        }
      ]
    };
    salesChart.setOption(option);
  } catch (error) {
    console.error('获取销售趋势失败:', error);
  }
};

const initOrderStatusChart = async () => {
  try {
    const { data } = await getOrderStatusDistribution();

    orderStatusChart = echarts.init(orderStatusChartRef.value);
    const option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          type: 'pie',
            radius: '50%',
            data: data || [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
      orderStatusChart.setOption(option);
    } catch (error) {
      console.error('获取订单状态分布失败:', error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const { data } = await getTopProducts();
      topProducts.value = data || [];
    } catch (error) {
      console.error('获取热销商品失败:', error);
    }
  };

onMounted(() => {
  fetchDashboardStats();
  initSalesChart();
  initOrderStatusChart();
  fetchTopProducts();

  // 窗口大小改变时重绘图表
  window.addEventListener('resize', () => {
    salesChart?.resize();
    orderStatusChart?.resize();
  });
});
</script>

<style scoped>
.dashboard {
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

.date {
  font-size: 14px;
  color: #909399;
}

.stats-row {
  margin-bottom: 20px;
}

.quick-link-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.quick-link-card.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-link-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.quick-link-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 15px;
}

.quick-link-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 0;
}

.chart-card {
  margin-bottom: 20px;
}
</style>
