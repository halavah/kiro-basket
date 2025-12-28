<template>
  <header class="header">
    <div class="header-container">
      <div class="header-left">
        <h1 class="logo" @click="$router.push('/')">🛒 社区团购</h1>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品"
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </div>

      <div class="header-right">
        <el-badge :value="cartCount" :hidden="cartCount === 0" class="cart-badge">
          <el-button text @click="$router.push('/cart')">
            <el-icon :size="20"><ShoppingCart /></el-icon>
            购物车
          </el-button>
        </el-badge>

        <el-button text @click="$router.push('/order')">
          <el-icon :size="20"><List /></el-icon>
          我的订单
        </el-button>

        <el-button text @click="$router.push('/profile')">
          <el-icon :size="20"><User /></el-icon>
          我的
        </el-button>

        <el-button text @click="handleLogout">退出</el-button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, ShoppingCart, User, List } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { useCartStore } from '@/store/cart'
import { useProductStore } from '@/store/product'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const productStore = useProductStore()

const searchKeyword = ref('')

const cartCount = computed(() => cartStore.cartCount)

// 搜索商品
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  productStore.searchProduct(searchKeyword.value)
  if (router.currentRoute.value.path !== '/') {
    router.push('/')
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}
</script>

<style scoped>
.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  cursor: pointer;
  margin: 0;
}

.search-box {
  width: 400px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-badge {
  margin-right: 10px;
}
</style>
