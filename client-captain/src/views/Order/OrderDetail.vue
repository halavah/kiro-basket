<template>
  <div class="order-detail">
    <div class="page-header">
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>订单详情</h2>
    </div>

    <el-card v-loading="loading" class="detail-card">
      <!-- 订单基本信息 -->
      <div class="section">
        <h3 class="section-title">订单信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ orderDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(orderDetail.status)">
              {{ getStatusText(orderDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ orderDetail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ orderDetail.updatedAt }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">
            ¥{{ orderDetail.totalAmount }}
          </el-descriptions-item>
          <el-descriptions-item label="佣金">
            ¥{{ orderDetail.commission }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 居民信息 -->
      <div class="section">
        <h3 class="section-title">居民信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ orderDetail.residentName }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ orderDetail.residentPhone }}</el-descriptions-item>
          <el-descriptions-item label="配送地址" :span="2">
            {{ orderDetail.address }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ orderDetail.note || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 商品列表 -->
      <div class="section">
        <h3 class="section-title">商品明细</h3>
        <el-table :data="orderDetail.items" border>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="productName" label="商品名称" min-width="150" />
          <el-table-column label="商品图片" width="100" align="center">
            <template #default="{ row }">
              <el-image
                v-if="row.productImage"
                :src="row.productImage"
                :preview-src-list="[row.productImage]"
                fit="cover"
                style="width: 50px; height: 50px; border-radius: 4px;"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="100" align="right">
            <template #default="{ row }">
              ¥{{ row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column label="小计" width="100" align="right">
            <template #default="{ row }">
              ¥{{ (row.price * row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>

        <div class="order-summary">
          <div class="summary-item">
            <span>商品总额：</span>
            <span class="amount">¥{{ orderDetail.totalAmount }}</span>
          </div>
          <div class="summary-item highlight">
            <span>订单总计：</span>
            <span class="amount">¥{{ orderDetail.totalAmount }}</span>
          </div>
        </div>
      </div>

      <!-- 订单操作 -->
      <div class="section">
        <h3 class="section-title">订单操作</h3>
        <el-space>
          <el-button
            v-if="orderDetail.status === 0"
            type="success"
            :disabled="orderDetail.paymentStatus !== 1"
            :title="orderDetail.paymentStatus !== 1 ? '用户未支付，无法确认' : ''"
            @click="handleConfirm"
          >
            确认订单
          </el-button>
          <el-button
            v-if="orderDetail.status === 1"
            type="success"
            @click="handleComplete"
          >
            完成订单
          </el-button>
          <el-button
            v-if="orderDetail.status === 0"
            type="danger"
            @click="handleCancel"
          >
            取消订单
          </el-button>
        </el-space>
      </div>

      <!-- 订单日志 -->
      <div class="section">
        <h3 class="section-title">订单日志</h3>
        <el-timeline v-if="orderDetail.logs && orderDetail.logs.length > 0">
          <el-timeline-item
            v-for="(log, index) in orderDetail.logs"
            :key="index"
            :timestamp="formatDateTime(log.createdAt)"
            placement="top"
          >
            <p>{{ log.action }}</p>
            <p v-if="log.note" class="log-note">{{ log.note }}</p>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无日志记录" :image-size="100" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import {
  getOrderDetail,
  confirmOrder,
  completeOrder,
  cancelOrder
} from '@/api/order';
import { formatDateTime } from '@/utils/date';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const orderDetail = ref({
  items: [],
  logs: []
});

const getStatusType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'primary',
    2: 'success',
    3: 'danger'
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

const handleConfirm = async () => {
  try {
    await ElMessageBox.confirm('确定要确认该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    });

    await confirmOrder(route.params.id);
    ElMessage.success('订单已确认，进入配送状态');
    fetchOrderDetail();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认订单失败:', error);
    }
  }
};

const handleComplete = async () => {
  try {
    await ElMessageBox.confirm('确定要完成该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    });

    await completeOrder(route.params.id);
    ElMessage.success('订单已完成');
    fetchOrderDetail();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成订单失败:', error);
    }
  }
};

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await cancelOrder(route.params.id);
    ElMessage.success('订单已取消');
    fetchOrderDetail();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error);
    }
  }
};

const fetchOrderDetail = async () => {
  try {
    loading.value = true;
    const { data } = await getOrderDetail(route.params.id);
    orderDetail.value = data;
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessage.error('获取订单详情失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrderDetail();
});
</script>

<style scoped>
.order-detail {
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

.order-summary {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 250px;
  margin-bottom: 10px;
  font-size: 14px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item.highlight {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
}

.summary-item .amount {
  font-weight: 600;
}

.log-note {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #909399;
}
</style>
