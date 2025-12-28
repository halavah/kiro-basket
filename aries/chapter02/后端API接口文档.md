# 社区团购管理平台 - 后端 API 接口文档

## 文档说明

- **项目名称**：社区团购管理平台
- **API 版本**：v1.0
- **基础路径**：`http://localhost:3000/api`
- **认证方式**：JWT Token（Bearer Token）
- **响应格式**：JSON

---

## 统一响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 失败响应
```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

### 状态码说明
| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 无效或过期） |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 一、认证模块（Auth）

### 1.1 团长登录

**接口地址**：`POST /api/captain/login`

**请求参数**：
```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "username": "admin",
      "phone": "13800138000"
    }
  }
}
```

**说明**：
- 登录成功后返回 JWT Token
- 后续请求需在 Header 中携带：`Authorization: Bearer {token}`
- 登录日志会记录到 MongoDB

---

### 1.2 居民注册

**接口地址**：`POST /api/resident/register`

**请求参数**：
```json
{
  "username": "zhangsan",
  "password": "123456",
  "phone": "13900139000",
  "name": "张三",
  "address": "1号楼101室"
}
```

**响应示例**：
```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "phone": "13900139000"
  }
}
```

---

### 1.3 居民登录

**接口地址**：`POST /api/resident/login`

**请求参数**：
```json
{
  "username": "zhangsan",
  "password": "123456"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "username": "zhangsan",
      "name": "张三",
      "phone": "13900139000"
    }
  }
}
```

---

### 1.4 获取当前用户信息（团长端）

**接口地址**：`GET /api/captain/info`

**请求头**：
```
Authorization: Bearer {token}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "phone": "13800138000",
    "userType": "captain"
  }
}
```

---

### 1.5 获取当前用户信息（居民端）

**接口地址**：`GET /api/resident/info`

**请求头**：
```
Authorization: Bearer {token}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "name": "张三",
    "phone": "13900139001",
    "address": "1号楼101室",
    "userType": "resident"
  }
}
```

---

## 二、商品分类模块（Category）

### 2.1 获取分类列表

**接口地址**：`GET /api/captain/categories`

**请求参数**：无

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "水果",
      "sort": 1,
      "created_at": "2024-01-01 10:00:00"
    },
    {
      "id": 2,
      "name": "蔬菜",
      "sort": 2,
      "created_at": "2024-01-01 10:05:00"
    }
  ]
}
```

---

### 2.2 创建分类

**接口地址**：`POST /api/captain/categories`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
```json
{
  "name": "肉类",
  "sort": 3
}
```

**响应示例**：
```json
{
  "code": 201,
  "message": "分类创建成功",
  "data": {
    "id": 3,
    "name": "肉类",
    "sort": 3
  }
}
```

---

### 2.3 更新分类

**接口地址**：`PUT /api/captain/categories/:id`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
```json
{
  "name": "肉禽蛋类",
  "sort": 3
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "分类更新成功",
  "data": {
    "id": 3,
    "name": "肉禽蛋类",
    "sort": 3
  }
}
```

---

### 2.4 删除分类

**接口地址**：`DELETE /api/captain/categories/:id`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "分类删除成功",
  "data": null
}
```

**说明**：删除分类前需检查该分类下是否有商品，有商品则不允许删除

---

## 三、商品管理模块（Product）

### 3.1 获取商品列表（团长端）

**接口地址**：`GET /api/captain/products`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| category_id | number | 否 | 分类 ID |
| status | number | 否 | 状态：0 下架，1 在售 |
| keyword | string | 否 | 搜索关键词（商品名称） |

**请求示例**：
```
GET /api/captain/products?page=1&pageSize=10&category_id=1&status=1
```

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "category_id": 1,
        "category_name": "水果",
        "name": "新鲜苹果",
        "price": 5.99,
        "original_price": 8.99,
        "stock": 100,
        "image": "/uploads/apple.jpg",
        "description": "新鲜红富士苹果",
        "status": 1,
        "commission_rate": 0.10,
        "stock_alert": 10,
        "sales": 50,
        "created_at": "2024-01-01 10:00:00",
        "updated_at": "2024-01-05 15:30:00"
      }
    ]
  }
}
```

---

### 3.2 获取商品列表（居民端）

**接口地址**：`GET /api/resident/products`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 12 |
| category_id | number | 否 | 分类 ID |
| keyword | string | 否 | 搜索关键词 |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 20,
    "page": 1,
    "pageSize": 12,
    "list": [
      {
        "id": 1,
        "category_name": "水果",
        "name": "新鲜苹果",
        "price": 5.99,
        "original_price": 8.99,
        "stock": 100,
        "image": "/uploads/apple.jpg",
        "description": "新鲜红富士苹果",
        "sales": 50
      }
    ]
  }
}
```

**说明**：居民端只能看到在售商品（status = 1）

---

### 3.3 获取商品详情（团长端）

**接口地址**：`GET /api/captain/products/:id`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "category_id": 1,
    "category_name": "水果",
    "name": "新鲜苹果",
    "price": 5.99,
    "original_price": 8.99,
    "stock": 100,
    "image": "/uploads/apple.jpg",
    "description": "新鲜红富士苹果，产地：山东烟台",
    "status": 1,
    "commission_rate": 0.10,
    "stock_alert": 10,
    "sales": 50,
    "created_at": "2024-01-01 10:00:00"
  }
}
```

---

### 3.4 获取商品详情（居民端）

**接口地址**：`GET /api/resident/products/:id`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "category_id": 1,
    "category_name": "水果",
    "name": "新鲜苹果",
    "price": 5.99,
    "original_price": 8.99,
    "stock": 100,
    "image": "/uploads/apple.jpg",
    "description": "新鲜红富士苹果，产地：山东烟台",
    "sales": 50,
    "created_at": "2024-01-01 10:00:00"
  }
}
```

**说明**：居民端商品详情不包含 status、commission_rate、stock_alert 等管理字段

---

### 3.5 创建商品

**接口地址**：`POST /api/captain/products`

**请求头**：
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category_id | number | 是 | 分类 ID |
| name | string | 是 | 商品名称 |
| price | number | 是 | 团购价 |
| original_price | number | 是 | 原价 |
| stock | number | 是 | 库存数量 |
| image | file | 是 | 商品图片 |
| description | string | 是 | 商品描述 |
| commission_rate | number | 是 | 佣金比例（0-1，如 0.1 表示 10%） |
| stock_alert | number | 否 | 库存预警值，默认 10 |
| status | number | 否 | 状态，默认 1（在售） |

**响应示例**：
```json
{
  "code": 201,
  "message": "商品创建成功",
  "data": {
    "id": 10,
    "name": "新鲜苹果",
    "price": 5.99,
    "stock": 100
  }
}
```

**说明**：
- 图片上传使用 multipart/form-data
- 图片会保存到 `/uploads` 目录
- 操作日志会记录到 MongoDB

---

### 3.6 更新商品

**接口地址**：`PUT /api/captain/products/:id`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：（参数同创建商品，image 可选）

**响应示例**：
```json
{
  "code": 200,
  "message": "商品更新成功",
  "data": {
    "id": 1,
    "name": "优质苹果",
    "price": 6.99
  }
}
```

---

### 3.7 删除商品（软删除）

**接口地址**：`DELETE /api/captain/products/:id`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "商品删除成功",
  "data": null
}
```

---

### 3.8 上架/下架商品

**接口地址**：`PATCH /api/captain/products/:id/status`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
```json
{
  "status": 1
}
```

**说明**：status = 1 上架，status = 0 下架

**响应示例**：
```json
{
  "code": 200,
  "message": "商品状态更新成功",
  "data": {
    "id": 1,
    "status": 1
  }
}
```

---

### 3.9 调整商品库存

**接口地址**：`PATCH /api/captain/products/:id/stock`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
```json
{
  "change_type": "add",
  "quantity": 50
}
```

**说明**：
- change_type: "add" 增加库存，"reduce" 减少库存
- 库存变动会记录到 MongoDB

**响应示例**：
```json
{
  "code": 200,
  "message": "库存调整成功",
  "data": {
    "id": 1,
    "before_stock": 100,
    "after_stock": 150,
    "change_quantity": 50
  }
}
```

---

## 四、购物车模块（Cart）

### 4.1 获取购物车列表

**接口地址**：`GET /api/resident/cart`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "新鲜苹果",
      "product_price": 5.99,
      "product_image": "/uploads/apple.jpg",
      "product_stock": 100,
      "quantity": 2,
      "subtotal": 11.98
    },
    {
      "id": 2,
      "product_id": 2,
      "product_name": "有机香蕉",
      "product_price": 4.99,
      "product_image": "/uploads/banana.jpg",
      "product_stock": 80,
      "quantity": 3,
      "subtotal": 14.97
    }
  ]
}
```

---

### 4.2 添加商品到购物车

**接口地址**：`POST /api/resident/cart`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**响应示例**：
```json
{
  "code": 201,
  "message": "添加成功",
  "data": {
    "id": 1,
    "product_id": 1,
    "quantity": 2
  }
}
```

**说明**：
- 如果购物车中已有该商品，则累加数量
- 需检查库存是否充足

---

### 4.3 更新购物车商品数量

**接口地址**：`PUT /api/resident/cart/:id`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
```json
{
  "quantity": 5
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "quantity": 5
  }
}
```

---

### 4.4 删除购物车商品

**接口地址**：`DELETE /api/resident/cart/:id`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 4.5 清空购物车

**接口地址**：`DELETE /api/resident/cart`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "购物车已清空",
  "data": null
}
```

**说明**：此接口不带任何路径参数，直接 DELETE /api/resident/cart 即可清空当前用户的购物车

---

## 五、订单模块（Order）

### 5.1 创建订单（居民端）

**接口地址**：`POST /api/resident/orders`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
```json
{
  "cart_ids": [1, 2, 3],
  "address": "1号楼101室",
  "remark": "请轻拿轻放"
}
```

**说明**：
- cart_ids: 购物车项 ID 数组
- 下单后会扣减库存
- 如果库存低于预警值，会生成通知（MongoDB）
- 订单状态为 0（待确认）

**响应示例**：
```json
{
  "code": 201,
  "message": "订单创建成功",
  "data": {
    "order_id": 100001,
    "order_no": "20240101123456789",
    "total_amount": 26.95
  }
}
```

---

### 5.2 获取订单列表（居民端）

**接口地址**：`GET /api/resident/orders`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| status | number | 否 | 订单状态：0 待确认，1 配送中，2 已完成，3 已取消 |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 15,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "order_no": "20240101123456789",
        "total_amount": 26.95,
        "status": 0,
        "status_text": "待确认",
        "item_count": 3,
        "created_at": "2024-01-01 12:34:56"
      }
    ]
  }
}
```

---

### 5.3 获取订单详情（居民端）

**接口地址**：`GET /api/resident/orders/:id`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "order_no": "20240101123456789",
    "resident_id": 1,
    "resident_name": "张三",
    "resident_phone": "13900139000",
    "address": "1号楼101室",
    "total_amount": 26.95,
    "status": 0,
    "status_text": "待确认",
    "created_at": "2024-01-01 12:34:56",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "新鲜苹果",
        "quantity": 2,
        "price": 5.99,
        "subtotal": 11.98
      },
      {
        "id": 2,
        "product_id": 2,
        "product_name": "有机香蕉",
        "quantity": 3,
        "price": 4.99,
        "subtotal": 14.97
      }
    ]
  }
}
```

---

### 5.4 取消订单（居民端）

**接口地址**：`PATCH /api/resident/orders/:id/cancel`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "订单已取消",
  "data": {
    "id": 1,
    "status": 3
  }
}
```

**说明**：
- 只能取消待确认状态的订单
- 取消后会恢复商品库存
- 订单状态变更记录会存入 MongoDB

---

### 5.5 获取订单列表（团长端）

**接口地址**：`GET /api/captain/orders`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| status | number | 否 | 订单状态 |
| keyword | string | 否 | 搜索关键词（订单号、居民姓名） |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "order_no": "20240101123456789",
        "resident_name": "张三",
        "resident_phone": "13900139000",
        "total_amount": 26.95,
        "commission_amount": 2.70,
        "status": 0,
        "status_text": "待确认",
        "created_at": "2024-01-01 12:34:56"
      }
    ]
  }
}
```

---

### 5.6 获取订单详情（团长端）

**接口地址**：`GET /api/captain/orders/:id`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "order_no": "20240101123456789",
    "resident_id": 1,
    "resident_name": "张三",
    "resident_phone": "13900139000",
    "address": "1号楼101室",
    "total_amount": 26.95,
    "commission_amount": 2.70,
    "status": 0,
    "status_text": "待确认",
    "created_at": "2024-01-01 12:34:56",
    "updated_at": "2024-01-01 12:34:56",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "新鲜苹果",
        "quantity": 2,
        "price": 5.99,
        "subtotal": 11.98
      }
    ],
    "status_logs": [
      {
        "from_status": null,
        "to_status": 0,
        "created_at": "2024-01-01 12:34:56"
      }
    ]
  }
}
```

**说明**：status_logs 从 MongoDB 中读取

---

### 5.7 确认订单（团长端）

**接口地址**：`PATCH /api/captain/orders/:id/confirm`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "订单已确认",
  "data": {
    "id": 1,
    "status": 1
  }
}
```

**说明**：
- 待确认 → 配送中
- 状态变更记录到 MongoDB

---

### 5.8 完成订单（团长端）

**接口地址**：`PATCH /api/captain/orders/:id/complete`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "订单已完成",
  "data": {
    "id": 1,
    "status": 2,
    "commission_amount": 2.70
  }
}
```

**说明**：
- 配送中 → 已完成
- 生成佣金记录（写入 commissions 表）
- 更新商品销量
- 状态变更记录到 MongoDB

---

### 5.9 取消订单（团长端）

**接口地址**：`PATCH /api/captain/orders/:id/cancel`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
```json
{
  "reason": "商品缺货"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "订单已取消",
  "data": {
    "id": 1,
    "status": 3
  }
}
```

**说明**：
- 恢复商品库存
- 取消原因记录到 MongoDB

---

## 六、居民管理模块（Resident）

### 6.1 获取居民列表

**接口地址**：`GET /api/captain/residents`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| keyword | string | 否 | 搜索关键词（姓名、手机号） |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 30,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "username": "zhangsan",
        "name": "张三",
        "phone": "13900139000",
        "address": "1号楼101室",
        "order_count": 15,
        "total_amount": 356.50,
        "created_at": "2024-01-01 10:00:00",
        "last_order_time": "2024-01-05 15:30:00"
      }
    ]
  }
}
```

---

### 6.2 获取居民详情

**接口地址**：`GET /api/captain/residents/:id`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "name": "张三",
    "phone": "13900139000",
    "address": "1号楼101室",
    "created_at": "2024-01-01 10:00:00",
    "stats": {
      "order_count": 15,
      "total_amount": 356.50,
      "avg_amount": 23.77
    },
    "recent_orders": [
      {
        "id": 10,
        "order_no": "20240105153000000",
        "total_amount": 26.95,
        "status": 2,
        "created_at": "2024-01-05 15:30:00"
      }
    ]
  }
}
```

---

### 6.3 获取居民个人信息（居民端）

**接口地址**：`GET /api/resident/profile`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan",
    "name": "张三",
    "phone": "13900139000",
    "address": "1号楼101室",
    "order_count": 15,
    "total_amount": 356.50
  }
}
```

---

### 6.4 更新居民信息（居民端）

**接口地址**：`PUT /api/resident/profile`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
```json
{
  "name": "张三",
  "phone": "13900139001",
  "address": "1号楼102室"
}
```

**响应示例**：
```json
{
  "code": 200,
  "message": "信息更新成功",
  "data": {
    "id": 1,
    "name": "张三",
    "phone": "13900139001",
    "address": "1号楼102室"
  }
}
```

---

## 七、佣金统计模块（Commission）

### 7.1 获取佣金概览

**接口地址**：`GET /api/captain/commission/overview`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total_commission": 1256.80,
    "today_commission": 45.60,
    "week_commission": 235.40,
    "month_commission": 856.30
  }
}
```

---

### 7.2 获取佣金明细列表

**接口地址**：`GET /api/captain/commission/list`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| start_date | string | 否 | 开始日期 YYYY-MM-DD |
| end_date | string | 否 | 结束日期 YYYY-MM-DD |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "order_id": 1,
        "order_no": "20240101123456789",
        "order_amount": 26.95,
        "commission_amount": 2.70,
        "created_at": "2024-01-01 13:00:00"
      }
    ]
  }
}
```

---

## 八、消息通知模块（Notification）

### 8.1 获取消息列表

**接口地址**：`GET /api/captain/notifications`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |
| type | string | 否 | 消息类型：stock_alert, new_order |
| is_read | boolean | 否 | 是否已读 |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 15,
    "unread_count": 5,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "id": "65a1234567890abcdef12345",
        "type": "stock_alert",
        "title": "库存预警",
        "content": "商品【新鲜苹果】库存不足，当前库存：8，预警值：10",
        "is_read": false,
        "created_at": "2024-01-05 15:30:00"
      },
      {
        "id": "65a1234567890abcdef12346",
        "type": "new_order",
        "title": "新订单提醒",
        "content": "您有新的订单【20240105153000000】待处理",
        "is_read": false,
        "created_at": "2024-01-05 15:25:00"
      }
    ]
  }
}
```

**说明**：消息数据从 MongoDB 读取

---

### 8.2 标记消息已读

**接口地址**：`PATCH /api/captain/notifications/:id/read`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "标记成功",
  "data": {
    "id": "65a1234567890abcdef12345",
    "is_read": true
  }
}
```

---

### 8.3 删除消息

**接口地址**：`DELETE /api/captain/notifications/:id`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 8.4 一键已读所有消息

**接口地址**：`PATCH /api/captain/notifications/read-all`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "全部标记已读",
  "data": {
    "updated_count": 5
  }
}
```

---

## 九、数据看板模块（Dashboard）

### 9.1 获取核心指标

**接口地址**：`GET /api/captain/dashboard/stats`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "today": {
      "order_count": 15,
      "sales_amount": 356.80,
      "commission": 35.68,
      "new_residents": 2
    },
    "total": {
      "order_count": 500,
      "sales_amount": 12560.50,
      "commission": 1256.05,
      "resident_count": 85
    }
  }
}
```

---

### 9.2 获取销售趋势数据

**接口地址**：`GET /api/captain/dashboard/sales-trend`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| days | number | 否 | 天数，默认 7 |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dates": ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05", "2024-01-06", "2024-01-07"],
    "sales": [356.50, 428.30, 512.80, 395.60, 467.20, 521.90, 598.40],
    "orders": [12, 15, 18, 13, 16, 19, 21]
  }
}
```

**说明**：用于绘制折线图

---

### 9.3 获取订单状态分布

**接口地址**：`GET /api/captain/dashboard/order-status`

**请求头**：`Authorization: Bearer {token}`

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    { "name": "待确认", "value": 8 },
    { "name": "配送中", "value": 12 },
    { "name": "已完成", "value": 450 },
    { "name": "已取消", "value": 30 }
  ]
}
```

**说明**：用于绘制饼图

---

### 9.4 获取商品销售排行

**接口地址**：`GET /api/captain/dashboard/top-products`

**请求头**：`Authorization: Bearer {token}`

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 返回数量，默认 5 |

**响应示例**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "product_id": 1,
      "product_name": "新鲜苹果",
      "sales": 350,
      "sales_amount": 2096.50
    },
    {
      "product_id": 2,
      "product_name": "有机香蕉",
      "sales": 280,
      "sales_amount": 1397.20
    },
    {
      "product_id": 3,
      "product_name": "进口橙子",
      "sales": 220,
      "sales_amount": 1538.00
    },
    {
      "product_id": 4,
      "product_name": "新鲜草莓",
      "sales": 180,
      "sales_amount": 1618.20
    },
    {
      "product_id": 5,
      "product_name": "葡萄",
      "sales": 150,
      "sales_amount": 1197.00
    }
  ]
}
```

**说明**：用于绘制柱状图

---

## 十、文件上传模块（Upload）

### 10.1 上传文件

**接口地址**：`POST /api/upload`

**请求头**：
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 文件（支持图片等，最大 10MB） |

**响应示例**：
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/uploads/20240101123456_apple.jpg",
    "filename": "20240101123456_apple.jpg",
    "originalname": "apple.jpg",
    "size": 102400
  }
}
```

**说明**：
- 支持上传商品图片等文件
- 文件会保存到 `/uploads` 目录
- 返回的 url 可直接用于商品 image 字段

---

## 附录

### A. 订单状态说明
| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 0 | 待确认 | 居民下单后，等待团长确认 |
| 1 | 配送中 | 团长确认订单，准备配送 |
| 2 | 已完成 | 订单完成，生成佣金 |
| 3 | 已取消 | 订单被取消，恢复库存 |

### B. 商品状态说明
| 状态值 | 状态名称 | 说明 |
|--------|----------|------|
| 0 | 已下架 | 商品不在售 |
| 1 | 在售 | 商品正常销售 |

### C. 消息类型说明
| 类型值 | 类型名称 | 说明 |
|--------|----------|------|
| stock_alert | 库存预警 | 商品库存低于预警值 |
| new_order | 新订单 | 有新订单待处理 |

### D. 佣金计算公式
```
佣金金额 = 订单总额 × 商品佣金比例
```

### E. 库存预警触发条件
```
当前库存 <= 商品预警值
```

---

## 更新日志

### v1.0.1 (2024-12-18)
- 修正认证模块路由路径，移除 `/auth/` 子路径
  - 团长登录：`/api/captain/auth/login` → `/api/captain/login`
  - 居民注册：`/api/resident/auth/register` → `/api/resident/register`
  - 居民登录：`/api/resident/auth/login` → `/api/resident/login`
- 分离团长和居民的用户信息接口
  - 团长端：`GET /api/captain/info`
  - 居民端：`GET /api/resident/info`
- 分离团长和居民的商品详情接口
  - 团长端：`GET /api/captain/products/:id`
  - 居民端：`GET /api/resident/products/:id`
- 修正购物车清空接口：`/api/resident/cart/clear` → `/api/resident/cart`
- 修正文件上传接口：`/api/upload/product-image` → `/api/upload`

### v1.0 (2024-01-01)
- 初始版本
- 完成所有核心接口定义
