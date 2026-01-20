
# Set console encoding to UTF-8
$OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================================"
Write-Host "   🗄️  初始化腾讯云数据库"
Write-Host "============================================================"
Write-Host ""

$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path $ScriptDir -Parent
$InitDir = Join-Path $ProjectRoot "server-init"

# 检查 server-init 目录是否存在
if (-not (Test-Path $InitDir)) {
    Write-Host "[错误] server-init 目录不存在: $InitDir"
    exit 1
}

# 进入 server-init 目录
Set-Location $InitDir

Write-Host "[信息] 正在执行: node init-prod.js（腾讯云配置）"
Write-Host ""

# 检查 Node.js 是否安装
try {
    $null = Get-Command node -ErrorAction Stop
} catch {
    Write-Host "[错误] Node.js 未安装"
    exit 1
}

# 检查 init-prod.js 是否存在
if (-not (Test-Path "init-prod.js")) {
    Write-Host "[错误] init-prod.js 文件不存在"
    exit 1
}

# 执行初始化脚本
node init-prod.js

# 返回原目录
Set-Location $ScriptDir
