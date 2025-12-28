<template>
  <el-card class="product-card" shadow="hover" @click="handleClick">
    <template #header>
      <div class="product-image">
        <el-image
          :src="getImageUrl(product.image)"
          fit="cover"
          :alt="product.name"
        >
          <template #error>
            <div class="image-slot">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
    </template>

    <div class="product-info">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="price-section">
        <span class="current-price">{{ formatPrice(product.price) }}</span>
        <span class="original-price">{{ formatPrice(product.original_price) }}</span>
      </div>
      <div class="product-meta">
        <span class="stock">库存: {{ product.stock }}</span>
        <span class="sales">销量: {{ product.sales }}</span>
      </div>
      <el-button
        type="primary"
        class="add-cart-btn"
        @click.stop="handleAddToCart"
      >
        加入购物车
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart'
import { formatPrice, getImageUrl } from '@/utils'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const cartStore = useCartStore()

// 点击卡片跳转详情
const handleClick = () => {
  router.push(`/product/${props.product.id}`)
}

// 加入购物车
const handleAddToCart = () => {
  cartStore.addCart(props.product.id, 1)
}
</script>

<style scoped>
.product-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.product-info {
  padding: 10px 0;
}

.product-name {
  font-size: 16px;
  font-weight: normal;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-section {
  margin-bottom: 10px;
}

.current-price {
  font-size: 20px;
  color: #f56c6c;
  font-weight: bold;
  margin-right: 10px;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.add-cart-btn {
  width: 100%;
}
</style>
