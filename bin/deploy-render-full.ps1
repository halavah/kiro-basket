
# Set console encoding to UTF-8
$OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8

Write-Host "============================================================"
Write-Host "   📦 部署全栈到 Render (Server + Captain + Resident)"
Write-Host "============================================================"
Write-Host ""

$ScriptDir = $PSScriptRoot

# 部署顺序：Server → Captain → Resident
Write-Host "[信息] 开始部署..."
Write-Host ""

# 1. 部署 Server
Write-Host "[1/3] 部署 Server..."
& "$ScriptDir\deploy-render-server.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] Server 部署失败"
    exit 1
}

Write-Host ""
Write-Host "等待 5 秒后继续..."
Start-Sleep -Seconds 5
Write-Host ""

# 2. 部署 Captain
Write-Host "[2/3] 部署 Captain..."
& "$ScriptDir\deploy-render-captain.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] Captain 部署失败"
    exit 1
}

Write-Host ""
Write-Host "等待 5 秒后继续..."
Start-Sleep -Seconds 5
Write-Host ""

# 3. 部署 Resident
Write-Host "[3/3] 部署 Resident..."
& "$ScriptDir\deploy-render-resident.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] Resident 部署失败"
    exit 1
}

Write-Host ""
Write-Host "[成功] 全栈部署完成！"
Write-Host ""
Write-Host "[信息] 请访问 Render Dashboard 查看所有服务的部署进度"
Write-Host "   https://dashboard.render.com/"
