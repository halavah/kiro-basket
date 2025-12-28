// Initialize MongoDB Collections and Sample Data

// Switch to database (though usually this is run against a specific DB)
// db = db.getSiblingDB('kiro_basket_logs');

// ---------------------------------------------------------
// 1. login_logs - 登录日志
// ---------------------------------------------------------
db.createCollection('login_logs');
db.login_logs.createIndex({ "user_type": 1, "user_id": 1 });
db.login_logs.createIndex({ "login_time": -1 });
db.login_logs.createIndex({ "status": 1 });

// Generate login logs for captains and residents
var loginLogs = [];
var residentUsernames = ['zhangsan', 'lisi', 'wangwu', 'zhaoliu', 'sunqi', 'qianba', 'zhoujiu', 'wushi',
  'zhengyi', 'wanger', 'chensan', 'chusi', 'weibao', 'jiangliu', 'shenqi',
  'hanba', 'yangjiu', 'zhushi', 'qinshiyi', 'youshier'];

// Captain login logs
for (let i = 0; i < 20; i++) {
  var daysAgo = Math.floor(Math.random() * 30) + 1;
  loginLogs.push({
    user_type: 'captain',
    user_id: 1,
    username: 'admin',
    ip: '127.0.0.1',
    login_time: new Date(new Date().setDate(new Date().getDate() - daysAgo)),
    status: 'success'
  });
}

// Resident login logs (more for zhangsan)
for (let residentId = 1; residentId <= 20; residentId++) {
  var loginCount = residentId === 1 ? 30 : Math.floor(Math.random() * 15) + 5;
  for (let i = 0; i < loginCount; i++) {
    var daysAgo = Math.floor(Math.random() * 60) + 1;
    var ipSuffix = 100 + residentId;
    loginLogs.push({
      user_type: 'resident',
      user_id: residentId,
      username: residentUsernames[residentId - 1],
      ip: `192.168.1.${ipSuffix}`,
      login_time: new Date(new Date().setDate(new Date().getDate() - daysAgo)),
      status: Math.random() > 0.95 ? 'failed' : 'success'
    });
  }
}

db.login_logs.insertMany(loginLogs);

// ---------------------------------------------------------
// 2. stock_logs - 库存变动日志
// ---------------------------------------------------------
db.createCollection('stock_logs');
db.stock_logs.createIndex({ "product_id": 1 });
db.stock_logs.createIndex({ "created_at": -1 });
db.stock_logs.createIndex({ "type": 1 });

// Generate stock logs for 160 orders (sample - reduced for brevity)
var stockLogs = [];
// Initial stock for all products
for (let pid = 1; pid <= 65; pid++) {
  stockLogs.push({
    product_id: pid,
    quantity: 200,
    type: 'restock',
    remark: 'Initial stock',
    created_at: new Date(new Date().setDate(new Date().getDate() - 60))
  });
}

// Add order deductions (sample for first 50 orders)
for (let i = 1; i <= 50; i++) {
  var daysAgo = Math.floor(Math.random() * 60) + 1;
  var productId = Math.floor(Math.random() * 65) + 1;
  var quantity = Math.floor(Math.random() * 5) + 1;
  stockLogs.push({
    product_id: productId,
    quantity: -quantity,
    type: 'order',
    remark: `Order ORD202512${String(i).padStart(5, '0')}`,
    created_at: new Date(new Date().setDate(new Date().getDate() - daysAgo))
  });
}

db.stock_logs.insertMany(stockLogs);

// ---------------------------------------------------------
// 3. notifications - 系统通知
// ---------------------------------------------------------
db.createCollection('notifications');
db.notifications.createIndex({ "user_type": 1, "user_id": 1 });
db.notifications.createIndex({ "is_read": 1 });
db.notifications.createIndex({ "created_at": -1 });

// Generate notifications for residents and captains
var notifications = [];
var notificationTitles = [
  '订单发货提醒',
  '订单已完成',
  '订单已取消',
  '新品上架通知',
  '优惠活动通知',
  '库存预警',
  '配送延迟提醒',
  '支付成功通知'
];

var notificationContents = [
  '您的订单 {orderNo} 已经发货，请注意查收。',
  '您的订单 {orderNo} 已完成配送。',
  '您的订单 {orderNo} 已被取消。',
  '本周新品上架，欢迎选购！',
  '本周特价优惠，低至5折！',
  '商品库存不足，请及时补货。',
  '由于天气原因，配送可能延迟。',
  '您的订单 {orderNo} 支付成功。'
];

// Resident notifications (more for zhangsan)
for (let residentId = 1; residentId <= 20; residentId++) {
  var notifCount = residentId === 1 ? 15 : Math.floor(Math.random() * 8) + 2;
  for (let i = 0; i < notifCount; i++) {
    var daysAgo = Math.floor(Math.random() * 30) + 1;
    var titleIdx = Math.floor(Math.random() * notificationTitles.length);
    var orderNo = `ORD202512${String(Math.floor(Math.random() * 160) + 1).padStart(5, '0')}`;
    var content = notificationContents[titleIdx].replace('{orderNo}', orderNo);

    notifications.push({
      user_type: 'resident',
      user_id: residentId,
      title: notificationTitles[titleIdx],
      content: content,
      is_read: Math.random() > 0.3,
      created_at: new Date(new Date().setDate(new Date().getDate() - daysAgo))
    });
  }
}

// Captain notifications
for (let i = 0; i < 10; i++) {
  var daysAgo = Math.floor(Math.random() * 30) + 1;
  notifications.push({
    user_type: 'captain',
    user_id: 1,
    title: '新订单提醒',
    content: '您有新的待处理订单，请及时查看。',
    is_read: Math.random() > 0.5,
    created_at: new Date(new Date().setDate(new Date().getDate() - daysAgo))
  });
}

db.notifications.insertMany(notifications);

// ---------------------------------------------------------
// 4. order_status_logs - 订单状态变更日志
// ---------------------------------------------------------
db.createCollection('order_status_logs');
db.order_status_logs.createIndex({ "order_id": 1 });
db.order_status_logs.createIndex({ "created_at": 1 });

// Generate order status logs for 160 orders
var orderStatusLogs = [];

// Sample order status changes for first 160 orders
for (let orderId = 1; orderId <= 160; orderId++) {
  var orderNo = `ORD202512${String(orderId).padStart(5, '0')}`;
  var daysAgo = Math.floor(Math.random() * 60) + 1;
  var statusRandom = Math.random();

  // All orders start with status 0 (pending)
  orderStatusLogs.push({
    order_id: orderId,
    order_no: orderNo,
    from_status: null,
    to_status: 0,
    created_at: new Date(new Date().setDate(new Date().getDate() - daysAgo))
  });

  // 70% complete, 15% delivering, 5% pending, 10% cancelled
  if (statusRandom < 0.7) {
    // Completed orders (status 0 -> 1 -> 2)
    orderStatusLogs.push({
      order_id: orderId,
      order_no: orderNo,
      from_status: 0,
      to_status: 1,
      created_at: new Date(new Date().setDate(new Date().getDate() - daysAgo + 0.5))
    });
    orderStatusLogs.push({
      order_id: orderId,
      order_no: orderNo,
      from_status: 1,
      to_status: 2,
      created_at: new Date(new Date().setDate(new Date().getDate() - daysAgo + 1))
    });
  } else if (statusRandom < 0.85) {
    // Delivering orders (status 0 -> 1)
    orderStatusLogs.push({
      order_id: orderId,
      order_no: orderNo,
      from_status: 0,
      to_status: 1,
      created_at: new Date(new Date().setDate(new Date().getDate() - daysAgo + 0.5))
    });
  } else if (statusRandom < 0.9) {
    // Pending orders (status 0 only)
    // No additional status change
  } else {
    // Cancelled orders (status 0 -> 3)
    orderStatusLogs.push({
      order_id: orderId,
      order_no: orderNo,
      from_status: 0,
      to_status: 3,
      created_at: new Date(new Date().setDate(new Date().getDate() - daysAgo + 0.5))
    });
  }
}

db.order_status_logs.insertMany(orderStatusLogs);

// ---------------------------------------------------------
// 5. dashboard_stats - 数据统计 (Optional sample)
// ---------------------------------------------------------
db.createCollection('dashboard_stats');
db.dashboard_stats.createIndex({ "date": -1 }, { unique: true });

// ---------------------------------------------------------
// 6. operation_logs - 操作日志
// ---------------------------------------------------------
db.createCollection('operation_logs');
db.operation_logs.createIndex({ "module": 1 });
db.operation_logs.createIndex({ "operator_id": 1 });
db.operation_logs.createIndex({ "created_at": -1 });

print('MongoDB collections, indexes, and sample data initialized successfully.');
