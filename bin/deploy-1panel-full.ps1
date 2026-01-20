
# Set console encoding to UTF-8
$OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================================"
Write-Host "   📦 部署全栈到 1Panel (Server + Captain + Resident)"
Write-Host "============================================================"
Write-Host ""

$ScriptDir = $PSScriptRoot

# 部署顺序：Server → Captain → Resident → Restart
Write-Host "[信息] 开始部署..."
Write-Host ""

# 1. 部署 Server
Write-Host "[1/3] 部署 Server..."
& "$ScriptDir\deploy-1panel-server.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] Server 部署失败"
    exit 1
}

Write-Host ""
Write-Host "等待 3 秒后继续..."
Start-Sleep -Seconds 3
Write-Host ""

# 2. 部署 Captain
Write-Host "[2/3] 部署 Captain..."
& "$ScriptDir\deploy-1panel-captain.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] Captain 部署失败"
    exit 1
}

Write-Host ""
Write-Host "等待 3 秒后继续..."
Start-Sleep -Seconds 3
Write-Host ""

# 3. 部署 Resident
Write-Host "[3/3] 部署 Resident..."
& "$ScriptDir\deploy-1panel-resident.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] Resident 部署失败"
    exit 1
}

Write-Host ""

# 4. 重启服务
Write-Host "[信息] 重启服务..."
& "$ScriptDir\deploy-1panel-restart.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] 重启服务失败"
    exit 1
}

Write-Host ""
Write-Host "[成功] 全栈部署完成！"
