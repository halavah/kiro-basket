<template>
  <el-card class="order-card">
    <div class="order-header">
      <div class="order-info">
        <span class="order-no">订单号：{{ order.order_no }}</span>
        <span class="order-time">下单时间：{{ formatDateTime(order.created_at) }}</span>
      </div>
      <el-tag :type="ORDER_STATUS[order.status].type">
        {{ ORDER_STATUS[order.status].label }}
      </el-tag>
    </div>

    <el-divider />

    <div class="order-items">
      <div
        v-for="item in order.items"
        :key="item.id"
        class="order-item"
      >
        <el-image
          :src="item.image || '/placeholder.png'"
          fit="cover"
          class="item-image"
        >
          <template #error>
            <div class="image-slot">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
        <div class="item-info">
          <div class="item-name">{{ item.product_name }}</div>
          <div class="item-price">{{ formatPrice(item.price) }} x {{ item.quantity }}</div>
        </div>
        <div class="item-subtotal">{{ formatPrice(item.subtotal) }}</div>
      </div>
    </div>

    <el-divider />

    <div class="order-footer">
      <div class="order-total">
        订单总额：<span class="total-amount">{{ formatPrice(order.total_amount) }}</span>
      </div>
      <div class="order-actions">
        <el-button size="small" @click="handleViewDetail">查看详情</el-button>
        <el-button
          v-if="order.status === 0"
          type="danger"
          size="small"
          @click="handleCancel"
        >
          取消订单
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { cancelOrder } from '@/api/order'
import { formatPrice, formatDateTime } from '@/utils'
import { ORDER_STATUS } from '@/utils/constants'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['refresh'])

const router = useRouter()

// 查看详情
const handleViewDetail = () => {
  router.push(`/order/${props.order.id}`)
}

// 取消订单
const handleCancel = () => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await cancelOrder(props.order.id)
      ElMessage.success('订单已取消')
      emit('refresh')
    } catch (error) {
      console.error('取消订单失败：', error)
    }
  }).catch(() => {})
}
</script>

<style scoped>
.order-card {
  margin-bottom: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.order-no {
  font-weight: bold;
}

.order-time {
  font-size: 14px;
  color: #909399;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
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

.item-info {
  flex: 1;
}

.item-name {
  font-size: 16px;
  margin-bottom: 5px;
}

.item-price {
  font-size: 14px;
  color: #909399;
}

.item-subtotal {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-total {
  font-size: 16px;
}

.total-amount {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
  margin-left: 10px;
}

.order-actions {
  display: flex;
  gap: 10px;
}
</style>
