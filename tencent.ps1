
# Set console encoding to UTF-8
$OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8

$ScriptDir = $PSScriptRoot
$BinDir = Join-Path $ScriptDir "bin"

# 执行脚本
function Run-Script {
    param($scriptName)
    $scriptPath = Join-Path $BinDir $scriptName
    if (Test-Path $scriptPath) {
        Write-Host "[信息] 正在执行: $scriptName"
        Push-Location $BinDir
        & $scriptPath
        Pop-Location
    } else {
        Write-Host "[错误] 脚本未找到: $scriptPath"
    }
}

# 显示菜单
function Show-Menu {
    Clear-Host
    Write-Host "==============================================================="
    Write-Host "   腾讯云部署工具"
    Write-Host "==============================================================="
    Write-Host ""
    Write-Host "   1. 🌐 部署团长端前端 (Captain)"
    Write-Host "      -> 构建并部署团长端 Vue 应用"
    Write-Host ""
    Write-Host "   2. 🛒 部署居民端前端 (Resident)"
    Write-Host "      -> 构建并部署居民端 Vue 应用"
    Write-Host ""
    Write-Host "   3. ⚙️  部署后端服务 (Server)"
    Write-Host "      -> 打包并部署 Node.js 后端"
    Write-Host ""
    Write-Host "==============================================================="
    Write-Host ""
    Write-Host "   4. 🚀 部署全栈 (All)"
    Write-Host "      -> 依次部署后端 + 团长端 + 居民端"
    Write-Host ""
    Write-Host "==============================================================="
    Write-Host ""
    Write-Host "   5. 🔄 重启服务"
    Write-Host "      -> 重启后端容器和 Nginx"
    Write-Host ""
    Write-Host "   6. 🗄️  初始化腾讯云数据库"
    Write-Host "      -> 初始化腾讯云 MySQL 和 MongoDB"
    Write-Host ""
    Write-Host "==============================================================="
    Write-Host ""
    Write-Host "   9. 🚪 退出"
    Write-Host ""
    Write-Host "==============================================================="
    Write-Host ""
}

# 重启服务
function Restart-Services {
    Run-Script "tencent-restart.ps1"
}

# 主循环
while ($true) {
    Show-Menu
    $choice = Read-Host "请选择操作 [1-6, 9]"

    switch ($choice) {
        "1" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 部署团长端前端"
            Write-Host "============================================================`n"
            Run-Script "tencent-deploy-client-captain.ps1"
            Restart-Services
        }
        "2" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 部署居民端前端"
            Write-Host "============================================================`n"
            Run-Script "tencent-deploy-client-resident.ps1"
            Restart-Services
        }
        "3" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 部署后端服务"
            Write-Host "============================================================`n"
            Run-Script "tencent-deploy-server.ps1"
            Restart-Services
        }
        "4" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 部署全栈 (后端 + 团长端 + 居民端)"
            Write-Host "============================================================`n"
            Run-Script "tencent-deploy-server.ps1"
            Write-Host "`n等待 3 秒后继续部署团长端..."
            Start-Sleep -Seconds 3
            Run-Script "tencent-deploy-client-captain.ps1"
            Write-Host "`n等待 3 秒后继续部署居民端..."
            Start-Sleep -Seconds 3
            Run-Script "tencent-deploy-client-resident.ps1"
            Restart-Services
        }
        "5" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 重启服务"
            Write-Host "============================================================`n"
            Restart-Services
        }
        "6" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 初始化腾讯云数据库"
            Write-Host "============================================================`n"
            Run-Script "tencent-init-db.ps1"
        }
        "9" {
            Write-Host "再见!"
            exit 0
        }
        Default {
            Write-Host "`n[错误] 无效的选项: $choice"
            Start-Sleep -Seconds 2
        }
    }

    Write-Host ""
    Read-Host "按 Enter 键返回主菜单..."
}
