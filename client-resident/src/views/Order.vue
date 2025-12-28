<template>
  <div class="order-page">
    <h1 class="page-title">📦 我的订单</h1>

    <div class="order-filters">
      <el-tabs v-model="activeStatus" @tab-change="handleStatusChange">
        <el-tab-pane label="全部订单" :name="-1" />
        <el-tab-pane label="待支付" :name="-2" />
        <el-tab-pane label="待确认" :name="0" />
        <el-tab-pane label="配送中" :name="1" />
        <el-tab-pane label="已完成" :name="2" />
        <el-tab-pane label="已取消" :name="3" />
      </el-tabs>

      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号或商品名称"
          clearable
          class="search-input"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />
      </div>
    </div>

    <el-skeleton :loading="loading" :rows="8" animated>
      <div v-if="orderList.length > 0" class="order-list">
        <OrderCard
          v-for="order in orderList"
          :key="order.id"
          :order="order"
          @refresh="fetchOrders"
        />

        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
      <el-empty v-else description="暂无订单记录">
        <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
      </el-empty>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getOrderList } from '@/api/order'
import OrderCard from '@/components/OrderCard.vue'

const loading = ref(false)
const orderList = ref([])
const activeStatus = ref(-1)
const searchKeyword = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }

    // 添加状态筛选
    if (activeStatus.value === -2) {
      // 待支付：状态为0且支付状态为0
      params.status = 0
      params.payment_status = 0
    } else if (activeStatus.value === 0) {
      // 待确认：状态为0且支付状态为1
      params.status = 0
      params.payment_status = 1
    } else if (activeStatus.value !== -1) {
      params.status = activeStatus.value
    }

    // 添加搜索关键词
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }

    // 添加日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0].toISOString().split('T')[0]
      params.end_date = dateRange.value[1].toISOString().split('T')[0]
    }

    const res = await getOrderList(params)
    orderList.value = res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取订单列表失败：', error)
  } finally {
    loading.value = false
  }
}

// 状态切换
const handleStatusChange = () => {
  currentPage.value = 1
  fetchOrders()
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

// 日期范围变化
const handleDateChange = () => {
  currentPage.value = 1
  fetchOrders()
}

// 分页变化
const handlePageChange = () => {
  fetchOrders()
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-page {
  padding: 20px 0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
}

.order-filters {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.order-list {
  display: flex;
  flex-direction: column;
}

.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
