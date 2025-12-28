
$ErrorActionPreference = "Stop"

# Navigate to script directory context
$ScriptDir = $PSScriptRoot
Set-Location "$ScriptDir/../server-init"

Write-Host "==================================================="
Write-Host "   数据库初始化 (生产环境)"
Write-Host "==================================================="
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "检测到缺少依赖，正在安装..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "依赖安装失败"
        Read-Host "Press Enter to continue..."
        exit 1
    }
    Write-Host "依赖安装成功"
    Write-Host ""
}

# Run init-prod.js
Write-Host "运行生产环境初始化..."
Write-Host "警告：这将连接到生产数据库！"
Write-Host ""

try {
    node init-prod.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n初始化完成"
    } else {
        Write-Host "`n初始化失败"
    }
} catch {
    Write-Host "`n初始化失败: $_"
}

Read-Host "Press Enter to continue..."
