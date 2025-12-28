import request from './request';

/**
 * 获取商品列表
 * @param {Object} params - { page, pageSize, keyword, categoryId, status }
 */
export function getProductList(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(product => ({
        id: product.id,
        name: product.name,
        categoryId: product.category_id,
        categoryName: product.category_name,
        price: product.price,
        originalPrice: product.original_price,
        unit: product.unit,
        stock: product.stock,
        stockAlert: product.stock_alert,
        sales: product.sales || 0,
        status: product.status,
        image: product.image,
        // 转换佣金比例：后端存储的是小数（0.1），前端显示为百分比（10）
        commissionRate: (product.commission_rate || 0) * 100,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));
    }
    return res;
  });
}

/**
 * 获取商品详情
 * @param {Number} id - 商品ID
 */
export function getProductDetail(id) {
  return request({
    url: `/products/${id}`,
    method: 'get'
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data) {
      const product = res.data;
      res.data = {
        id: product.id,
        name: product.name,
        categoryId: product.category_id,
        categoryName: product.category_name,
        price: product.price,
        originalPrice: product.original_price,
        unit: product.unit,
        stock: product.stock,
        stockAlert: product.stock_alert,
        sales: product.sales || 0,
        status: product.status,
        image: product.image,
        description: product.description,
        // 转换佣金比例：后端存储的是小数（0.1），前端显示为百分比（10）
        commissionRate: (product.commission_rate || 0) * 100,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      };
    }
    return res;
  });
}

/**
 * 创建商品
 * @param {Object} data - 商品数据
 */
export function createProduct(data) {
  // 转换字段名：camelCase -> snake_case
  const requestData = {
    category_id: data.categoryId,
    name: data.name,
    price: data.price,
    original_price: data.originalPrice,
    stock: data.stock,
    stock_alert: data.stockAlert,
    commission_rate: data.commissionRate,
    status: data.status,
    description: data.description,
    image: data.image
  };

  return request({
    url: '/products',
    method: 'post',
    data: requestData
  });
}

/**
 * 更新商品
 * @param {Number} id - 商品ID
 * @param {Object} data - 商品数据
 */
export function updateProduct(id, data) {
  // 转换字段名：camelCase -> snake_case
  const requestData = {
    category_id: data.categoryId,
    name: data.name,
    price: data.price,
    original_price: data.originalPrice,
    stock: data.stock,
    stock_alert: data.stockAlert,
    commission_rate: data.commissionRate,
    status: data.status,
    description: data.description,
    image: data.image
  };

  return request({
    url: `/products/${id}`,
    method: 'put',
    data: requestData
  });
}

/**
 * 删除商品
 * @param {Number} id - 商品ID
 */
export function deleteProduct(id) {
  return request({
    url: `/products/${id}`,
    method: 'delete'
  });
}

/**
 * 上架/下架商品
 * @param {Number} id - 商品ID
 * @param {Number} status - 状态 (1:在售, 0:下架)
 */
export function updateProductStatus(id, status) {
  return request({
    url: `/products/${id}/status`,
    method: 'patch',
    data: { status }
  });
}

/**
 * 调整商品库存
 * @param {Number} id - 商品ID
 * @param {String} change_type - 变更类型 ('add' 增加 | 'reduce' 减少 | 'set' 设置)
 * @param {Number} quantity - 变更数量
 */
export function updateProductStock(id, change_type, quantity) {
  return request({
    url: `/products/${id}/stock`,
    method: 'patch',
    data: { change_type, quantity }
  });
}

/**
 * 获取商品分类列表
 */
export function getCategoryList() {
  return request({
    url: '/categories',
    method: 'get'
  }).then(res => {
    // 转换字段名：snake_case -> camelCase
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(category => ({
        id: category.id,
        name: category.name,
        sort: category.sort,
        productCount: category.product_count || 0,
        createdAt: category.created_at
      }));
    }
    return res;
  });
}

/**
 * 创建商品分类
 * @param {Object} data - { name, sort }
 */
export function createCategory(data) {
  return request({
    url: '/categories',
    method: 'post',
    data
  });
}

/**
 * 更新商品分类
 * @param {Number} id - 分类ID
 * @param {Object} data - { name, sort }
 */
export function updateCategory(id, data) {
  return request({
    url: `/categories/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除商品分类
 * @param {Number} id - 分类ID
 */
export function deleteCategory(id) {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  });
}
