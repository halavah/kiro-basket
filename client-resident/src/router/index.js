import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils'
import { ElMessage } from 'element-plus'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    redirect: '/home',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: '首页',
          requiresAuth: true
        }
      },
      {
        path: '/product/:id',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetail.vue'),
        meta: {
          title: '商品详情',
          requiresAuth: true
        }
      },
      {
        path: '/cart',
        name: 'Cart',
        component: () => import('@/views/Cart.vue'),
        meta: {
          title: '购物车',
          requiresAuth: true
        }
      },
      {
        path: '/order',
        name: 'Order',
        component: () => import('@/views/Order.vue'),
        meta: {
          title: '我的订单',
          requiresAuth: true
        }
      },
      {
        path: '/order/:id',
        name: 'OrderDetail',
        component: () => import('@/views/OrderDetail.vue'),
        meta: {
          title: '订单详情',
          requiresAuth: true
        }
      },
      {
        path: '/payment/:id',
        name: 'Payment',
        component: () => import('@/views/Payment.vue'),
        meta: {
          title: '收银台',
          requiresAuth: true
        }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: {
          title: '个人中心',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/home'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 社区团购管理平台`
  } else {
    document.title = '社区团购管理平台'
  }

  // 检查是否需要登录
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = getToken()

  if (requiresAuth && !token) {
    // 需要登录但未登录，跳转到登录页
    ElMessage.warning('请先登录')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (to.path === '/login' && token) {
    // 已登录用户访问登录页，跳转到首页
    next('/home')
  } else {
    next()
  }
})

// 全局后置钩子
router.afterEach(() => {
  // 页面滚动到顶部
  window.scrollTo(0, 0)
})

export default router
