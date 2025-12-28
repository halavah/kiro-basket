<template>
  <div class="order-detail-page">
    <el-skeleton :loading="loading" :rows="10" animated>
      <div v-if="order" class="order-detail-content">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator=">" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/order' }">我的订单</el-breadcrumb-item>
          <el-breadcrumb-item>订单详情</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 订单状态 -->
        <el-card class="status-card">
          <div class="status-header">
            <div class="status-info">
              <el-tag :type="ORDER_STATUS[order.status].type" size="large">
                {{ ORDER_STATUS[order.status].label }}
              </el-tag>
              <el-tag
                v-if="order.payment_status === 1"
                type="success"
                size="large"
                effect="dark"
              >
                已支付
              </el-tag>
              <el-tag
                v-else-if="order.status !== 3"
                type="info"
                size="large"
                effect="plain"
              >
                未支付
              </el-tag>
              <span class="order-no">订单号：{{ order.order_no }}</span>
            </div>
            <div class="status-time">
              <span v-if="order.paid_at" style="margin-right: 15px">支付时间：{{ formatDateTime(order.paid_at) }}</span>
              <span>下单时间：{{ formatDateTime(order.created_at) }}</span>
            </div>
          </div>

          <!-- 订单状态流转时间线 -->
          <el-divider />
          <el-timeline>
            <el-timeline-item
              v-if="order.created_at"
              timestamp="订单创建"
              :time="formatDateTime(order.created_at)"
            >
              您的订单已创建
            </el-timeline-item>
            <el-timeline-item
              v-if="order.confirmed_at"
              timestamp="订单确认"
              :time="formatDateTime(order.confirmed_at)"
            >
              团长已确认订单
            </el-timeline-item>
            <el-timeline-item
              v-if="order.delivering_at"
              timestamp="配送中"
              :time="formatDateTime(order.delivering_at)"
            >
              订单正在配送中
            </el-timeline-item>
            <el-timeline-item
              v-if="order.completed_at"
              timestamp="已完成"
              :time="formatDateTime(order.completed_at)"
              type="success"
            >
              订单已完成
            </el-timeline-item>
            <el-timeline-item
              v-if="order.cancelled_at"
              timestamp="已取消"
              :time="formatDateTime(order.cancelled_at)"
              type="danger"
            >
              订单已取消
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 商品信息 -->
        <el-card class="items-card">
          <template #header>
            <h3>商品信息</h3>
          </template>
          <el-table :data="order.items" border>
            <el-table-column label="商品" min-width="300">
              <template #default="{ row }">
                <div class="product-cell">
                  <el-image
                    :src="row.image || '/placeholder.png'"
                    fit="cover"
                    class="product-image"
                  >
                    <template #error>
                      <div class="image-slot">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="product-info">
                    <div class="product-name">{{ row.product_name }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="120" align="center">
              <template #default="{ row }">
                <span class="price">{{ formatPrice(row.price) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="100" align="center" prop="quantity" />
            <el-table-column label="小计" width="120" align="center">
              <template #default="{ row }">
                <span class="subtotal">{{ formatPrice(row.subtotal) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 订单金额 -->
        <el-card class="amount-card">
          <template #header>
            <h3>订单金额</h3>
          </template>
          <div class="amount-detail">
            <div class="amount-row">
              <span class="label">商品总额：</span>
              <span class="value">{{ formatPrice(order.total_amount) }}</span>
            </div>
            <div class="amount-row">
              <span class="label">配送费：</span>
              <span class="value">¥0.00</span>
            </div>
            <el-divider />
            <div class="amount-row total">
              <span class="label">实付款：</span>
              <span class="value">{{ formatPrice(order.total_amount) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 收货信息 -->
        <el-card class="address-card">
          <template #header>
            <h3>收货信息</h3>
          </template>
          <div class="address-detail">
            <div class="info-row">
              <span class="label">收货人：</span>
              <span class="value">{{ order.resident?.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">联系电话：</span>
              <span class="value">{{ order.resident?.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">收货地址：</span>
              <span class="value">{{ order.address }}</span>
            </div>
          </div>
        </el-card>

        <!-- 订单操作 -->
        <div class="order-actions">
          <el-button @click="$router.push('/order')">返回订单列表</el-button>
          <el-button
            v-if="order.status === 0 && order.payment_status !== 1"
            type="primary"
            @click="handlePay"
          >
            立即支付
          </el-button>
          <el-button
            v-if="order.status === 0"
            type="danger"
            @click="handleCancel"
          >
            取消订单
          </el-button>
        </div>
      </div>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { getOrderDetail, cancelOrder, payOrder } from '@/api/order'
import { formatPrice, formatDateTime } from '@/utils'
import { ORDER_STATUS } from '@/utils/constants'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const order = ref(null)

// 获取订单详情
const fetchOrderDetail = async () => {
  loading.value = true
  try {
    const res = await getOrderDetail(route.params.id)
    order.value = res.data
  } catch (error) {
    console.error('获取订单详情失败：', error)
    ElMessage.error('订单不存在或已被删除')
    router.push('/order')
  } finally {
    loading.value = false
  }
}

// 支付订单
const handlePay = () => {
  router.push(`/payment/${order.value.id}`)
}

// 取消订单
const handleCancel = () => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await cancelOrder(order.value.id)
      ElMessage.success('订单已取消')
      fetchOrderDetail()
    } catch (error) {
      console.error('取消订单失败：', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  padding: 20px 0;
}

.breadcrumb {
  margin-bottom: 20px;
}

.order-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.status-card :deep(.el-card__body) {
  color: #fff;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.order-no {
  font-size: 16px;
  font-weight: bold;
}

.status-time {
  font-size: 14px;
  opacity: 0.9;
}

.el-timeline {
  padding-left: 0;
  margin-top: 20px;
}

.el-timeline :deep(.el-timeline-item__timestamp) {
  color: rgba(255, 255, 255, 0.9);
  font-weight: bold;
}

.el-timeline :deep(.el-timeline-item__content) {
  color: rgba(255, 255, 255, 0.8);
}

.items-card,
.amount-card,
.address-card {
  background: #fff;
}

.product-cell {
  display: flex;
  gap: 15px;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  flex-shrink: 0;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: bold;
}

.price {
  font-size: 16px;
  color: #f56c6c;
}

.subtotal {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.amount-detail,
.address-detail {
  padding: 10px 0;
}

.amount-row,
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 16px;
}

.amount-row .label,
.info-row .label {
  color: #606266;
}

.amount-row .value,
.info-row .value {
  color: #303133;
  font-weight: 500;
}

.amount-row.total {
  font-size: 20px;
}

.amount-row.total .value {
  color: #f56c6c;
  font-weight: bold;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 0;
}
</style>
