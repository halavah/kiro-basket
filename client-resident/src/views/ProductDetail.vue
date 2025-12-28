<template>
  <div class="product-detail-page">
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-skeleton :loading="loading" :rows="10" animated>
      <div v-if="product.id" class="product-content">
        <div class="product-main">
          <!-- 商品图片 -->
          <div class="product-images">
            <el-image
              :src="getImageUrl(product.image)"
              fit="contain"
              class="main-image"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>

          <!-- 商品信息 -->
          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>

            <div class="product-meta">
              <span>分类：{{ getCategoryName(product.category_id) }}</span>
              <span>销量：{{ product.sales }} 件</span>
            </div>

            <div class="price-box">
              <div class="price-item">
                <span class="label">团购价：</span>
                <span class="current-price">{{ formatPrice(product.price) }}</span>
              </div>
              <div class="price-item">
                <span class="label">原价：</span>
                <span class="original-price">{{ formatPrice(product.original_price) }}</span>
              </div>
            </div>

            <div class="stock-info">
              <span>库存：{{ product.stock }} 件</span>
            </div>

            <div class="quantity-selector">
              <span class="label">购买数量：</span>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="product.stock"
                size="large"
              />
              <span class="max-hint">(最多购买 {{ product.stock }} 件)</span>
            </div>

            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                :disabled="product.stock === 0"
                @click="handleAddToCart"
              >
                加入购物车
              </el-button>
              <el-button
                type="danger"
                size="large"
                :disabled="product.stock === 0"
                @click="handleBuyNow"
              >
                立即购买
              </el-button>
            </div>
          </div>
        </div>

        <!-- 商品详情 -->
        <div class="product-description">
          <h2>商品详情</h2>
          <div class="description-content">
            <p>{{ product.description }}</p>
          </div>
        </div>
      </div>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { getProductDetail } from '@/api/product'
import { useCartStore } from '@/store/cart'
import { formatPrice, getImageUrl } from '@/utils'
import { CATEGORIES } from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref({})
const loading = ref(false)
const quantity = ref(1)

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = CATEGORIES.find(c => c.id === categoryId)
  return category ? category.name : ''
}

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    loading.value = true
    const res = await getProductDetail(route.params.id)
    product.value = res.data
  } catch (error) {
    console.error('获取商品详情失败：', error)
    ElMessage.error('商品不存在')
    router.push('/')
  } finally {
    loading.value = false
  }
}

// 加入购物车
const handleAddToCart = async () => {
  await cartStore.addCart(product.value.id, quantity.value)
}

// 立即购买
const handleBuyNow = async () => {
  await cartStore.addCart(product.value.id, quantity.value)
  router.push('/cart')
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-page {
  padding: 20px 0;
}

.breadcrumb {
  margin-bottom: 20px;
}

.product-content {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
}

.product-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.product-images {
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-image {
  width: 100%;
  max-width: 500px;
  height: 500px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 60px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.product-meta {
  display: flex;
  gap: 30px;
  color: #909399;
  font-size: 14px;
}

.price-box {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.price-item {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
}

.price-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 14px;
  color: #606266;
  margin-right: 10px;
}

.current-price {
  font-size: 32px;
  color: #f56c6c;
  font-weight: bold;
}

.original-price {
  font-size: 18px;
  color: #909399;
  text-decoration: line-through;
}

.stock-info {
  font-size: 16px;
  color: #606266;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 15px;
}

.max-hint {
  font-size: 14px;
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.action-buttons .el-button {
  flex: 1;
}

.product-description {
  border-top: 1px solid #e4e7ed;
  padding-top: 30px;
}

.product-description h2 {
  font-size: 20px;
  margin: 0 0 20px 0;
}

.description-content {
  line-height: 1.8;
  color: #606266;
}
</style>
