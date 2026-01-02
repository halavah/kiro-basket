
# Set console encoding to UTF-8
$OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8

$ScriptDir = $PSScriptRoot
$BinDir = Join-Path $ScriptDir "bin"

# Check if bin directory exists
if (-not (Test-Path $BinDir)) {
    Write-Host "[错误] bin 目录不存在: $BinDir"
    Read-Host "Press Enter to continue..."
    exit 1
}

function Show-Menu {
    Clear-Host
    Write-Host "==============================================================="
    Write-Host "   项目管理"
    Write-Host "==============================================================="
    Write-Host ""
    Write-Host "   1. 🚀 启动后端服务器     (start-server.ps1)"
    Write-Host "      -> 启动 Node.js 后端"
    Write-Host ""
    Write-Host "   2. 👨‍💼 启动团长端前端     (start-captain.ps1)"
    Write-Host "      -> 启动 Vue 团长端开发环境"
    Write-Host ""
    Write-Host "   3. 👤 启动居民端前端     (start-resident.ps1)"
    Write-Host "      -> 启动 Vue 居民端开发环境"
    Write-Host ""
    Write-Host "   4. 🗄️  初始化开发数据库   (server-init-dev.ps1)"
    Write-Host "      -> 初始化 MySQL 和 MongoDB 数据库（开发环境）"
    Write-Host ""
    Write-Host "   5. 🗄️  初始化生产数据库（腾讯云）   (server-init-prod.ps1)"
    Write-Host "      -> 初始化腾讯云 MySQL 和 MongoDB 数据库"
    Write-Host ""
    Write-Host "   6. 🗄️  初始化 Render 数据库   (server-init-render.ps1)"
    Write-Host "      -> 初始化 Render 平台 MySQL 和 MongoDB 数据库"
    Write-Host ""
    Write-Host "   7. 🧪 运行 API 测试     (test-api.ps1)"
    Write-Host "      -> 执行服务端 API 自动化测试"
    Write-Host ""
    Write-Host "==============================================================="
    Write-Host ""
    Write-Host "   9. 🚪 退出"
    Write-Host ""
    Write-Host "==============================================================="
    Write-Host ""
}

while ($true) {
    Show-Menu
    $choice = Read-Host "请选择操作 [1-7,9] (默认: 1 - 启动后端)"

    if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

    switch ($choice) {
        "1" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 启动后端服务器"
            Write-Host "============================================================`n"
            & "$BinDir/start-server.ps1"
            Read-Host "Press Enter to return to menu..."
        }
        "2" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 启动团长端前端"
            Write-Host "============================================================`n"
            & "$BinDir/start-captain.ps1"
            Read-Host "Press Enter to return to menu..."
        }
        "3" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 启动居民端前端"
            Write-Host "============================================================`n"
            & "$BinDir/start-resident.ps1"
            Read-Host "Press Enter to return to menu..."
        }
        "4" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 初始化开发数据库"
            Write-Host "============================================================`n"
            & "$BinDir/server-init-dev.ps1"
            Read-Host "Press Enter to return to menu..."
        }
        "5" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 初始化生产数据库（腾讯云）"
            Write-Host "============================================================`n"
            & "$BinDir/server-init-prod.ps1"
            Read-Host "Press Enter to return to menu..."
        }
        "6" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 初始化 Render 数据库"
            Write-Host "============================================================`n"
            & "$BinDir/server-init-render.ps1"
            Read-Host "Press Enter to return to menu..."
        }
        "7" {
            Write-Host "`n============================================================"
            Write-Host "   执行: 运行 API 测试"
            Write-Host "============================================================`n"
            & "$BinDir/test-api.ps1"
            Read-Host "Press Enter to return to menu..."
        }
        "9" {
            exit 0
        }
        Default {
            Write-Host "`n[错误] 无效的选项: $choice"
            Start-Sleep -Seconds 2
        }
    }
}
