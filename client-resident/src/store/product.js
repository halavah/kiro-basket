import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getProductList, searchProducts } from '@/api/product'

export const useProductStore = defineStore('product', () => {
  // 状态
  const productList = ref([])
  const loading = ref(false)
  const currentCategory = ref(0) // 0 表示全部
  const searchKeyword = ref('')

  // 获取商品列表
  const fetchProductList = async (params = {}) => {
    try {
      loading.value = true
      const res = await getProductList(params)
      productList.value = res.data.list || res.data
      return res
    } catch (error) {
      console.error('获取商品列表失败：', error)
      return Promise.reject(error)
    } finally {
      loading.value = false
    }
  }

  // 按分类获取商品
  const fetchProductsByCategory = async (categoryId) => {
    currentCategory.value = categoryId
    const params = categoryId ? { category_id: categoryId } : {}
    return fetchProductList(params)
  }

  // 搜索商品
  const searchProduct = async (keyword) => {
    try {
      loading.value = true
      searchKeyword.value = keyword
      const res = await searchProducts({ keyword })
      productList.value = res.data.list || res.data
      return res
    } catch (error) {
      console.error('搜索商品失败：', error)
      return Promise.reject(error)
    } finally {
      loading.value = false
    }
  }

  return {
    productList,
    loading,
    currentCategory,
    searchKeyword,
    fetchProductList,
    fetchProductsByCategory,
    searchProduct
  }
})
