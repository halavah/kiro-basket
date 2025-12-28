import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/user';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/views/Layout/index.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: { title: '数据看板' }
      },
      {
        path: 'products',
        name: 'ProductList',
        component: () => import('@/views/Product/ProductList.vue'),
        meta: { title: '商品列表' }
      },
      {
        path: 'products/add',
        name: 'ProductAdd',
        component: () => import('@/views/Product/ProductForm.vue'),
        meta: { title: '添加商品' }
      },
      {
        path: 'products/edit/:id',
        name: 'ProductEdit',
        component: () => import('@/views/Product/ProductForm.vue'),
        meta: { title: '编辑商品' }
      },
      {
        path: 'categories',
        name: 'CategoryManage',
        component: () => import('@/views/Product/CategoryManage.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('@/views/Order/OrderList.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/Order/OrderDetail.vue'),
        meta: { title: '订单详情' }
      },
      {
        path: 'residents',
        name: 'ResidentList',
        component: () => import('@/views/Resident/ResidentList.vue'),
        meta: { title: '居民管理' }
      },
      {
        path: 'residents/:id',
        name: 'ResidentDetail',
        component: () => import('@/views/Resident/ResidentDetail.vue'),
        meta: { title: '居民详情' }
      },
      {
        path: 'commission',
        name: 'Commission',
        component: () => import('@/views/Commission/index.vue'),
        meta: { title: '佣金统计' }
      },
      {
        path: 'notifications',
        name: 'Notification',
        component: () => import('@/views/Notification/index.vue'),
        meta: { title: '消息通知' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 社区团购管理平台` : '社区团购管理平台';

  // 如果需要登录验证
  if (to.meta.requiresAuth) {
    if (userStore.isLoggedIn) {
      next();
    } else {
      next('/login');
    }
  } else {
    // 如果已登录且访问登录页，跳转到首页
    if (to.path === '/login' && userStore.isLoggedIn) {
      next('/dashboard');
    } else {
      next();
    }
  }
});

export default router;
