import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCartList, addToCart, updateCartItem, deleteCartItem, clearCart } from '@/api/cart'
import { ElMessage } from 'element-plus'

export const useCartStore = defineStore('cart', () => {
  // 状态
  const cartList = ref([])
  const loading = ref(false)

  // 计算属性：购物车商品数量
  const cartCount = computed(() => {
    return cartList.value.reduce((total, item) => total + item.quantity, 0)
  })

  // 计算属性：购物车总价
  const cartTotal = computed(() => {
    return cartList.value.reduce((total, item) => {
      // 使用后端已经计算好的 subtotal
      return total + (item.subtotal || 0)
    }, 0)
  })

  // 获取购物车列表
  const fetchCartList = async () => {
    try {
      loading.value = true
      const res = await getCartList()
      cartList.value = res.data
    } catch (error) {
      console.error('获取购物车失败：', error)
    } finally {
      loading.value = false
    }
  }

  // 添加到购物车
  const addCart = async (productId, quantity = 1) => {
    try {
      await addToCart({ product_id: productId, quantity })
      ElMessage.success('添加到购物车成功')
      await fetchCartList()
    } catch (error) {
      console.error('添加到购物车失败：', error)
    }
  }

  // 更新��物车商品数量
  const updateCart = async (id, quantity) => {
    try {
      await updateCartItem(id, { quantity })
      await fetchCartList()
    } catch (error) {
      console.error('更新购物车失败：', error)
    }
  }

  // 删除购物车商品
  const deleteCart = async (id) => {
    try {
      await deleteCartItem(id)
      ElMessage.success('删除成功')
      await fetchCartList()
    } catch (error) {
      console.error('删除购物车商品失败：', error)
    }
  }

  // 清空购物车
  const clearCartAll = async () => {
    try {
      await clearCart()
      cartList.value = []
      ElMessage.success('购物车已清空')
    } catch (error) {
      console.error('清空购物车失败：', error)
    }
  }

  return {
    cartList,
    loading,
    cartCount,
    cartTotal,
    fetchCartList,
    addCart,
    updateCart,
    deleteCart,
    clearCartAll
  }
})
