
# Set console encoding to UTF-8
$OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8

function Show-Menu {
    Clear-Host
    Write-Host "═══════════════════════════════════════════════════════════"
    Write-Host "  Kiro Basket 部署工具"
    Write-Host "═══════════════════════════════════════════════════════════"
    Write-Host ""

    Write-Host "  Render 平台部署"
    Write-Host "  1. 🚀 部署 Server (Render Web Service)"
    Write-Host "     → 触发 Render Server 重新部署"
    Write-Host ""

    Write-Host "  2. 🌐 部署 Captain (Render Static Site)"
    Write-Host "     → 触发 Render Captain 重新部署"
    Write-Host ""

    Write-Host "  3. 🛒 部署 Resident (Render Static Site)"
    Write-Host "     → 触发 Render Resident 重新部署"
    Write-Host ""

    Write-Host "  4. 📦 部署全栈 (Render All)"
    Write-Host "     → 依次部署 Server + Captain + Resident"
    Write-Host ""

    Write-Host "  5. 🗄️  初始化 Render 数据库"
    Write-Host "     → 初始化 Render MySQL + MongoDB"
    Write-Host ""

    Write-Host "═══════════════════════════════════════════════════════════"
    Write-Host ""

    Write-Host "  1Panel 平台部署"
    Write-Host "  6. ⚙️  部署 Server (1Panel)"
    Write-Host "     → SSH 部署后端到腾讯云"
    Write-Host ""

    Write-Host "  7. 🌐 部署 Captain (1Panel)"
    Write-Host "     → SSH 部署团长端到腾讯云"
    Write-Host ""

    Write-Host "  8. 🛒 部署 Resident (1Panel)"
    Write-Host "     → SSH 部署居民端到腾讯云"
    Write-Host ""

    Write-Host "  9. 📦 部署全栈 (1Panel All)"
    Write-Host "     → 依次部署 Server + Captain + Resident + 重启"
    Write-Host ""

    Write-Host " 10. 🗄️  初始化 1Panel 数据库"
    Write-Host "     → 初始化腾讯云 MySQL + MongoDB"
    Write-Host ""

    Write-Host " 11. 🔄 重启服务 (1Panel)"
    Write-Host "     → 重启后端容器和 Nginx"
    Write-Host ""

    Write-Host "═══════════════════════════════════════════════════════════"
    Write-Host ""

    Write-Host " 99. 🚪 退出"
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════"
    Write-Host ""
}

function Run-Script {
    param (
        [string]$ScriptName,
        [string]$Header
    )

    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════"
    Write-Host "  $Header"
    Write-Host "════════════════════════════════════════════════════════════"
    Write-Host ""

    $ScriptPath = Join-Path $BinDir $ScriptName
    if (Test-Path $ScriptPath) {
        Write-Host "[信息] 正在执行: $ScriptName"
        & $ScriptPath
    } else {
        Write-Host "[错误] 脚本未找到: $ScriptPath"
    }
}

$ScriptDir = $PSScriptRoot
$BinDir = Join-Path $ScriptDir "bin"

while ($true) {
    Show-Menu
    $choice = Read-Host "请选择操作 [1-11, 99]"

    switch ($choice) {
        "1" {
            Run-Script "deploy-render-server.ps1" "执行: 部署 Server (Render)"
        }
        "2" {
            Run-Script "deploy-render-captain.ps1" "执行: 部署 Captain (Render)"
        }
        "3" {
            Run-Script "deploy-render-resident.ps1" "执行: 部署 Resident (Render)"
        }
        "4" {
            Run-Script "deploy-render-full.ps1" "执行: 部署全栈 (Render)"
        }
        "5" {
            Run-Script "deploy-render-init-db.ps1" "执行: 初始化 Render 数据库"
        }
        "6" {
            Run-Script "deploy-1panel-server.ps1" "执行: 部署 Server (1Panel)"
        }
        "7" {
            Run-Script "deploy-1panel-captain.ps1" "执行: 部署 Captain (1Panel)"
        }
        "8" {
            Run-Script "deploy-1panel-resident.ps1" "执行: 部署 Resident (1Panel)"
        }
        "9" {
            Run-Script "deploy-1panel-full.ps1" "执行: 部署全栈 (1Panel)"
        }
        "10" {
            Run-Script "deploy-1panel-init-db.ps1" "执行: 初始化 1Panel 数据库"
        }
        "11" {
            Run-Script "deploy-1panel-restart.ps1" "执行: 重启服务 (1Panel)"
        }
        "99" {
            Write-Host "再见!"
            exit 0
        }
        default {
            Write-Host "[错误] 无效的选项"
        }
    }

    Write-Host ""
    Read-Host "按 Enter 键返回主菜单"
}
