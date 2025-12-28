const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * API 测试验证脚本
 * 自动测试所有 .http 文件中的接口
 */

// 配置
const CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  captainUsername: 'admin',
  captainPassword: '123456',
  residentUsername: 'zhangsan',
  residentPassword: '123456',
  timeout: 10000
};

// 测试结果
const results = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// Token 存储
let tokens = {
  captain: null,
  resident: null
};

/**
 * 颜色输出
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 解析 .http 文件
 */
function parseHttpFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const requests = [];
  const lines = content.split('\n');

  let currentRequest = null;
  let inHeader = false;
  let inBody = false;
  let bodyLines = [];
  let bodyStarted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 跳过注释
    if (trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) {
      continue;
    }

    // 跳过变量定义
    if (trimmedLine.startsWith('@')) {
      continue;
    }

    // 空行处理
    if (trimmedLine === '') {
      if (currentRequest && inHeader && !inBody) {
        // Header 结束，Body 开始
        inHeader = false;
        inBody = true;
        bodyStarted = false;
      } else if (inBody && bodyStarted) {
        // Body 中的空行
        bodyLines.push('');
      }
      continue;
    }

    // 新请求的开始（HTTP 方法）
    if (/^(GET|POST|PUT|PATCH|DELETE)\s+/.test(trimmedLine)) {
      // 保存上一个请求
      if (currentRequest) {
        if (bodyLines.length > 0) {
          // 移除 body 开头的空行
          while (bodyLines.length > 0 && bodyLines[0].trim() === '') {
            bodyLines.shift();
          }
          // 移除 body 结尾的空行
          while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === '') {
            bodyLines.pop();
          }
          if (bodyLines.length > 0) {
            currentRequest.body = bodyLines.join('\n');
          }
        }
        requests.push(currentRequest);
      }

      // 开始新请求
      const [method, url] = trimmedLine.split(/\s+/);
      currentRequest = {
        method,
        url: url.replace('{{baseUrl}}', CONFIG.baseUrl),
        headers: {},
        body: null
      };
      inHeader = true;
      inBody = false;
      bodyLines = [];
      bodyStarted = false;
    }
    // Header 行
    else if (currentRequest && inHeader && trimmedLine.includes(':')) {
      const colonIndex = trimmedLine.indexOf(':');
      const key = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim();
      currentRequest.headers[key] = value;
    }
    // Body 内容
    else if (currentRequest && inBody) {
      bodyLines.push(line.trim());
      bodyStarted = true;
    }
  }

  // 保存最后一个请求
  if (currentRequest) {
    if (bodyLines.length > 0) {
      while (bodyLines.length > 0 && bodyLines[0].trim() === '') {
        bodyLines.shift();
      }
      while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === '') {
        bodyLines.pop();
      }
      if (bodyLines.length > 0) {
        currentRequest.body = bodyLines.join('\n');
      }
    }
    requests.push(currentRequest);
  }

  return requests;
}

/**
 * 执行单个请求
 */
async function executeRequest(request, testName) {
  results.total++;

  try {
    // 替换 Token
    if (request.headers.Authorization) {
      if (request.headers.Authorization.includes('YOUR_CAPTAIN_TOKEN_HERE')) {
        if (!tokens.captain) {
          log(`  ⊘ ${testName} - 跳过（需要团长 Token）`, 'gray');
          results.skipped++;
          return { status: 'skipped', reason: '需要团长 Token' };
        }
        request.headers.Authorization = request.headers.Authorization.replace('YOUR_CAPTAIN_TOKEN_HERE', tokens.captain);
      }
      if (request.headers.Authorization.includes('YOUR_RESIDENT_TOKEN_HERE')) {
        if (!tokens.resident) {
          log(`  ⊘ ${testName} - 跳过（需要居民 Token）`, 'gray');
          results.skipped++;
          return { status: 'skipped', reason: '需要居民 Token' };
        }
        request.headers.Authorization = request.headers.Authorization.replace('YOUR_RESIDENT_TOKEN_HERE', tokens.resident);
      }
      if (request.headers.Authorization.includes('{{captainToken}}')) {
        if (!tokens.captain) {
          log(`  ⊘ ${testName} - 跳过（需要团长 Token）`, 'gray');
          results.skipped++;
          return { status: 'skipped', reason: '需要团长 Token' };
        }
        request.headers.Authorization = request.headers.Authorization.replace('{{captainToken}}', tokens.captain);
      }
      if (request.headers.Authorization.includes('{{residentToken}}')) {
        if (!tokens.resident) {
          log(`  ⊘ ${testName} - 跳过（需要居民 Token）`, 'gray');
          results.skipped++;
          return { status: 'skipped', reason: '需要居民 Token' };
        }
        request.headers.Authorization = request.headers.Authorization.replace('{{residentToken}}', tokens.resident);
      }
    }

    // 解析 Body
    let data = null;
    if (request.body) {
      try {
        data = JSON.parse(request.body);
      } catch (e) {
        data = request.body;
      }
    }

    // 发送请求
    const response = await axios({
      method: request.method.toLowerCase(),
      url: request.url,
      headers: request.headers,
      data: data,
      timeout: CONFIG.timeout,
      validateStatus: () => true // 接受所有状态码
    });

    // 判断是否成功
    const isSuccess = response.data.code === 200 || response.data.code === 201;

    if (isSuccess) {
      log(`  ✓ ${testName} - ${response.status} ${response.statusText}`, 'green');
      results.success++;
      return {
        status: 'success',
        code: response.data.code,
        message: response.data.message,
        data: response.data.data
      };
    } else {
      log(`  ✗ ${testName} - ${response.data.code} ${response.data.message}`, 'yellow');
      results.failed++;
      return {
        status: 'failed',
        code: response.data.code,
        message: response.data.message
      };
    }
  } catch (error) {
    log(`  ✗ ${testName} - 错误: ${error.message}`, 'red');
    results.failed++;
    return {
      status: 'error',
      message: error.message
    };
  }
}

/**
 * 获取登录 Token
 */
async function getTokens() {
  log('\n🔐 获取认证 Token...', 'blue');

  try {
    // 团长登录
    const captainRes = await axios.post(`${CONFIG.baseUrl}/captain/login`, {
      username: CONFIG.captainUsername,
      password: CONFIG.captainPassword
    });

    if (captainRes.data.code === 200) {
      tokens.captain = captainRes.data.data.token;
      log('  ✓ 团长登录成功', 'green');
    } else {
      log('  ✗ 团长登录失败', 'red');
    }
  } catch (error) {
    log(`  ✗ 团长登录错误: ${error.message}`, 'red');
  }

  try {
    // 居民登录
    const residentRes = await axios.post(`${CONFIG.baseUrl}/resident/login`, {
      username: CONFIG.residentUsername,
      password: CONFIG.residentPassword
    });

    if (residentRes.data.code === 200) {
      tokens.resident = residentRes.data.data.token;
      log('  ✓ 居民登录成功', 'green');
    } else {
      log('  ✗ 居民登录失败', 'red');
    }
  } catch (error) {
    log(`  ✗ 居民登录错误: ${error.message}`, 'red');
  }
}

/**
 * 测试单个 .http 文件
 */
async function testHttpFile(filePath) {
  const fileName = path.basename(filePath);
  log(`\n📄 测试文件: ${fileName}`, 'blue');

  const requests = parseHttpFile(filePath);

  if (requests.length === 0) {
    log('  ⊘ 未找到可测试的请求', 'gray');
    return;
  }

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    const testName = `${request.method} ${request.url.replace(CONFIG.baseUrl, '')}`;

    const result = await executeRequest(request, testName);
    results.details.push({
      file: fileName,
      test: testName,
      ...result
    });

    // 短暂延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * 生成测试报告
 */
function generateReport() {
  const reportPath = path.join(__dirname, 'test-report.json');
  const htmlReportPath = path.join(__dirname, 'test-report.html');

  // JSON 报告
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      total: results.total,
      success: results.success,
      failed: results.failed,
      skipped: results.skipped,
      successRate: ((results.success / (results.total - results.skipped)) * 100).toFixed(2) + '%'
    },
    details: results.details,
    timestamp: new Date().toISOString()
  }, null, 2));

  // HTML 报告
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>API 测试报告</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
    .stat-card { padding: 20px; border-radius: 8px; text-align: center; }
    .stat-card h3 { margin: 0; font-size: 36px; }
    .stat-card p { margin: 10px 0 0 0; color: #666; }
    .total { background: #E3F2FD; color: #1976D2; }
    .success { background: #E8F5E9; color: #388E3C; }
    .failed { background: #FFEBEE; color: #D32F2F; }
    .skipped { background: #FFF3E0; color: #F57C00; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: bold; }
    .status-success { color: #388E3C; }
    .status-failed { color: #D32F2F; }
    .status-skipped { color: #F57C00; }
    .status-error { color: #D32F2F; }
    .timestamp { color: #666; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 API 接口测试报告</h1>

    <div class="summary">
      <div class="stat-card total">
        <h3>${results.total}</h3>
        <p>总测试数</p>
      </div>
      <div class="stat-card success">
        <h3>${results.success}</h3>
        <p>成功</p>
      </div>
      <div class="stat-card failed">
        <h3>${results.failed}</h3>
        <p>失败</p>
      </div>
      <div class="stat-card skipped">
        <h3>${results.skipped}</h3>
        <p>跳过</p>
      </div>
    </div>

    <h2>成功率: ${((results.success / (results.total - results.skipped)) * 100).toFixed(2)}%</h2>

    <table>
      <thead>
        <tr>
          <th>文件</th>
          <th>测试</th>
          <th>状态</th>
          <th>消息</th>
        </tr>
      </thead>
      <tbody>
        ${results.details.map(detail => `
          <tr>
            <td>${detail.file}</td>
            <td>${detail.test}</td>
            <td class="status-${detail.status}">${detail.status.toUpperCase()}</td>
            <td>${detail.message || detail.reason || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <p class="timestamp">生成时间: ${new Date().toLocaleString('zh-CN')}</p>
  </div>
</body>
</html>
`;

  fs.writeFileSync(htmlReportPath, html);

  log(`\n📊 测试报告已生成:`, 'blue');
  log(`  - JSON: ${reportPath}`, 'gray');
  log(`  - HTML: ${htmlReportPath}`, 'gray');
}

/**
 * 主函数
 */
async function main() {
  log('========================================', 'blue');
  log('  社区团购管理平台 - API 接口测试', 'blue');
  log('========================================', 'blue');

  // 检查服务器是否运行
  try {
    await axios.get(`${CONFIG.baseUrl.replace('/api', '')}/health`, { timeout: 5000 });
    log('✓ 服务器运行正常\n', 'green');
  } catch (error) {
    log('✗ 无法连接到服务器，请确保服务器已启动', 'red');
    log(`  URL: ${CONFIG.baseUrl}`, 'gray');
    process.exit(1);
  }

  // 获取 Token
  await getTokens();

  // 获取所有 .http 文件
  const httpFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.http') && file !== '00-环境变量.http')
    .sort();

  // 测试每个文件
  for (const file of httpFiles) {
    await testHttpFile(path.join(__dirname, file));
  }

  // 打印总结
  log('\n========================================', 'blue');
  log('  测试总结', 'blue');
  log('========================================', 'blue');
  log(`总计: ${results.total}`, 'blue');
  log(`成功: ${results.success}`, 'green');
  log(`失败: ${results.failed}`, results.failed > 0 ? 'red' : 'gray');
  log(`跳过: ${results.skipped}`, 'yellow');
  log(`成功率: ${((results.success / (results.total - results.skipped)) * 100).toFixed(2)}%`, 'blue');
  log('========================================\n', 'blue');

  // 生成报告
  generateReport();

  // 退出码
  process.exit(results.failed > 0 ? 1 : 0);
}

// 运行
main().catch(error => {
  log(`\n✗ 测试执行失败: ${error.message}`, 'red');
  process.exit(1);
});
