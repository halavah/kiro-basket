<template>
  <div class="home-page">
    <!-- 分类导航 -->
    <div class="category-nav">
      <el-button
        :type="currentCategory === 0 ? 'primary' : ''"
        @click="handleCategoryChange(0)"
      >
        🍎 全部
      </el-button>
      <el-button
        v-for="category in CATEGORIES"
        :key="category.id"
        :type="currentCategory === category.id ? 'primary' : ''"
        @click="handleCategoryChange(category.id)"
      >
        {{ category.icon }} {{ category.name }}
      </el-button>
    </div>

    <!-- 商品列表 -->
    <el-skeleton :loading="loading" :rows="6" animated>
      <div v-if="productList.length > 0" class="product-grid">
        <ProductCard
          v-for="product in productList"
          :key="product.id"
          :product="product"
        />
      </div>
      <el-empty v-else description="暂无商品" />
    </el-skeleton>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import { useProductStore } from '@/store/product'
import { CATEGORIES, PAGE_SIZE } from '@/utils/constants'

const productStore = useProductStore()

const currentPage = ref(1)
const pageSize = ref(PAGE_SIZE)
const total = ref(0)

const loading = computed(() => productStore.loading)
const productList = computed(() => productStore.productList)
const currentCategory = computed(() => productStore.currentCategory)

// 切换分类
const handleCategoryChange = (categoryId) => {
  currentPage.value = 1
  fetchProducts(categoryId)
}

// 切换页码
const handlePageChange = (page) => {
  fetchProducts(currentCategory.value, page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 获取商品列表
const fetchProducts = async (categoryId = 0, page = 1) => {
  const params = {
    page,
    limit: pageSize.value
  }
  if (categoryId) {
    params.category_id = categoryId
  }

  try {
    const res = await productStore.fetchProductsByCategory(categoryId)
    if (res.data.pagination) {
      total.value = res.data.pagination.total
    } else {
      total.value = res.data.length
    }
  } catch (error) {
    console.error('获取商品列表失败：', error)
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.home-page {
  padding: 20px 0;
}

.category-nav {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
