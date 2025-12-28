<template>
  <div class="payment-page">
    <div class="header">
      <div class="back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="title">收银台</div>
    </div>

    <el-skeleton :loading="loading" :rows="8" animated>
      <div v-if="order" class="content">
        <div class="amount-section">
          <div class="label">支付金额</div>
          <div class="amount">{{ formatPrice(order.total_amount) }}</div>
          <div class="order-no">订单号：{{ order.order_no }}</div>
        </div>

        <div class="payment-methods">
          <div
            class="method-item"
            :class="{ active: selectedMethod === 'wechat' }"
            @click="selectedMethod = 'wechat'"
          >
            <div class="left">
              <el-icon class="wechat-icon" :size="24"><ChatDotRound /></el-icon>
              <span class="name">微信支付</span>
            </div>
            <div class="right">
              <el-icon v-if="selectedMethod === 'wechat'" color="#07c160"><Select /></el-icon>
              <div v-else class="radio-circle"></div>
            </div>
          </div>

          <div
            class="method-item"
            :class="{ active: selectedMethod === 'alipay' }"
            @click="selectedMethod = 'alipay'"
          >
            <div class="left">
              <el-icon class="alipay-icon" :size="24"><Money /></el-icon>
              <span class="name">支付宝支付</span>
            </div>
            <div class="right">
              <el-icon v-if="selectedMethod === 'alipay'" color="#1677ff"><Select /></el-icon>
              <div v-else class="radio-circle"></div>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <el-button
            type="primary"
            class="pay-btn"
            :loading="paying"
            @click="handlePay"
          >
            立即支付 {{ formatPrice(order.total_amount) }}
          </el-button>
        </div>
      </div>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ChatDotRound, Money, Select } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getOrderDetail, payOrder } from '@/api/order'
import { formatPrice } from '@/utils'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const paying = ref(false)
const order = ref(null)
const selectedMethod = ref('wechat')

const fetchOrderDetail = async () => {
  try {
    const res = await getOrderDetail(route.params.id)
    if (res.code === 200) {
      order.value = res.data
      if (order.value.payment_status === 1) {
        ElMessage.warning('订单已支付')
        router.push(`/order/${order.value.id}`)
      }
    } else {
      ElMessage.error(res.msg || '获取订单失败')
    }
  } catch (error) {
    console.error('获取订单失败:', error)
    ElMessage.error('获取订单失败')
  } finally {
    loading.value = false
  }
}

const handlePay = async () => {
  if (!order.value) return

  paying.value = true
  try {
    // 模拟支付延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    const res = await payOrder(order.value.id)
    if (res.code === 200) {
      ElMessage.success('支付成功')
      router.replace(`/order/${order.value.id}`)
    } else {
      ElMessage.error(res.msg || '支付失败')
    }
  } catch (error) {
    console.error('支付出错:', error)
    ElMessage.error('支付出错，请重试')
  } finally {
    paying.value = false
  }
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 80px;
}

.header {
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  margin-right: 40px;
}

.amount-section {
  background: #fff;
  padding: 40px 20px;
  text-align: center;
  margin-bottom: 12px;
}

.amount-section .label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.amount-section .amount {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.amount-section .order-no {
  font-size: 12px;
  color: #999;
}

.payment-methods {
  background: #fff;
  padding: 0 20px;
}

.method-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.method-item:last-child {
  border-bottom: none;
}

.method-item .left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wechat-icon {
  color: #07c160;
}

.alipay-icon {
  color: #1677ff;
}

.method-item .name {
  font-size: 16px;
  color: #333;
}

.radio-circle {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.pay-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 22px;
}
</style>
