<template>
  <div class="cart-page">
    <h1 class="page-title">🛒 我的购物车</h1>

    <el-skeleton :loading="loading" :rows="8" animated>
      <div v-if="cartList.length > 0" class="cart-content">
        <!-- 收货信息 (Moved to top) -->
        <div class="section-title">收货信息（必填）</div>
        <el-form :model="addressForm" :rules="rules" ref="addressFormRef" label-width="80px" class="address-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="收货人" prop="contact">
                <el-input v-model="addressForm.contact" placeholder="请输入收货人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="addressForm.phone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="收货地址" prop="address">
            <el-input v-model="addressForm.address" placeholder="请输入详细收货地址" />
          </el-form-item>
        </el-form>

        <div class="section-title">商品信息</div>
        <el-table
          :data="cartList"
          border
          class="cart-table"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="商品信息" min-width="300">
            <template #default="{ row }">
              <div class="product-cell">
                <el-image
                  :src="getImageUrl(row.product_image)"
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
                  <div class="stock-info">库存：{{ row.product_stock }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120" align="center">
            <template #default="{ row }">
              <span class="price">{{ formatPrice(row.product_price) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="180" align="center">
            <template #default="{ row }">
              <el-input-number
                :model-value="row.quantity"
                :min="1"
                :max="row.product_stock"
                @change="(val) => handleQuantityChange(row.id, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120" align="center">
            <template #default="{ row }">
              <span class="subtotal">{{ formatPrice(row.subtotal) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button
                type="danger"
                text
                @click="handleDelete(row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="cart-footer">
          <div class="footer-left">
            <el-button @click="handleClearCart">清空购物车</el-button>
          </div>
          <div class="footer-right">
            <div class="total-info">
              <span class="label">已选商品：</span>
              <span class="count">{{ cartCount }} 件</span>
              <span class="label">合计：</span>
              <span class="total-price">{{ formatPrice(cartTotal) }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              :disabled="cartList.length === 0"
              @click="handleCheckout"
            >
              去结算
            </el-button>
          </div>
        </div>
      </div>
      <el-empty v-else description="购物车是空的，快去选购商品吧">
        <el-button type="primary" @click="$router.push('/')">去逛逛</el-button>
      </el-empty>
    </el-skeleton>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { useCartStore } from '@/store/cart'
import { formatPrice, getImageUrl } from '@/utils'
import { createOrder } from '@/api/order'
import { updateProfile } from '@/api/profile'

const router = useRouter()
const cartStore = useCartStore()

const loading = computed(() => cartStore.loading)
const cartList = computed(() => cartStore.cartList)
const cartCount = computed(() => cartStore.cartCount)
const cartTotal = computed(() => cartStore.cartTotal)

// 表单引用和数据
const addressFormRef = ref(null)
const addressForm = ref({
  contact: '',
  phone: '',
  address: ''
})

const rules = {
  contact: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  address: [{ required: true, message: '请输入收货地址', trigger: 'blur' }]
}

// 初始化表单数据
// 初始化表单数据
onMounted(() => {
  // 用户要求手动填写，不自动填充
})

// 修改数量
const handleQuantityChange = (id, quantity) => {
  cartStore.updateCart(id, quantity)
}

// 删除商品
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.deleteCart(id)
  }).catch(() => {})
}

// 清空购物车
const handleClearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartStore.clearCartAll()
  }).catch(() => {})
}

// 去结算
const handleCheckout = async () => {
  if (cartList.value.length === 0) {
    ElMessage.warning('购物车是空的')
    return
  }

  // 验证表单
  if (!addressFormRef.value) return

  await addressFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      // 验证通过，先更新用户信息，再下单
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
      userInfo.name = addressForm.value.contact
      userInfo.phone = addressForm.value.phone
      userInfo.address = addressForm.value.address

      try {
        // 同步更新服务器端用户信息
        await updateProfile({
          name: userInfo.name,
          phone: userInfo.phone,
          address: userInfo.address
        })

        localStorage.setItem('user_info', JSON.stringify(userInfo))

        // 下单
        await submitOrder(userInfo.address)
      } catch (error) {
        console.error('更新用户信息失败:', error)
        ElMessage.error('下单前更新信息失败，请重试')
      }
    } else {
      ElMessage.warning('请填写完整的收货信息')
      return false
    }
  })
}

const submitOrder = async (address) => {
  try {
    const cart_ids = cartList.value.map(item => item.id)

    const res = await createOrder({
      cart_ids,
      address,
      remark: ''
    })
    ElMessage.success('下单成功')
    cartStore.clearCartAll()
    router.push(`/order/${res.data.order_id}`)
  } catch (error) {
    console.error('下单失败：', error)
  }
}
</script>

<style scoped>
.cart-page {
  padding: 20px 0;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
}

.cart-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
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
  margin-bottom: 5px;
}

.product-desc {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stock-info {
  font-size: 12px;
  color: #909399;
}

.price {
  font-size: 16px;
  color: #f56c6c;
}

.subtotal {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
}

.label {
  color: #606266;
}

.count {
  color: #f56c6c;
  font-weight: bold;
}

.total-price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: bold;
}

/* New styles for refactored layout */
.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.address-form {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px dashed #e4e7ed;
}
</style>
