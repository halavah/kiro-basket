
# ================================================
# 腾讯云配置 - 请根据实际情况修改
# ================================================
# TODO: 请填入你的腾讯云服务器信息
$SERVER_IP = "your-tencent-cloud-ip"
$SSH_USER = "ubuntu"
# 统一部署基础路径
$REMOTE_DEPLOY_BASE = "/opt/1panel/www/sites"
# 后端服务路径
$REMOTE_TARGET = "$REMOTE_DEPLOY_BASE/kiro-basket-server"
# 后端容器名称
$BACKEND_CONTAINER = "kiro-basket-server"

# ================================================
# 颜色定义
# ================================================
Write-Host "🚀 部署后端服务 (Server)..." -ForegroundColor Green

# 获取项目根目录
$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path $ScriptDir -Parent

# 1. 准备后端文件
Write-Host "📦 准备后端文件..." -ForegroundColor Green
$DeployTmpDir = Join-Path $ProjectRoot "deploy_tmp_server"
if (Test-Path $DeployTmpDir) {
    Remove-Item $DeployTmpDir -Recurse -Force
}
New-Item -ItemType Directory -Path $DeployTmpDir | Out-Null

# 复制文件，排除特定目录
$ServerDir = Join-Path $ProjectRoot "server"
$ExcludeDirs = @("node_modules", ".git", "uploads")
$ExcludeFiles = @(".env.*")

Get-ChildItem -Path $ServerDir -Recurse | ForEach-Object {
    $relativePath = $_.FullName.Substring($ServerDir.Length)
    $shouldExclude = $false
    foreach ($exclude in $ExcludeDirs) {
        if ($relativePath -like "*\$exclude\*" -or $relativePath -like "*/$exclude/*") {
            $shouldExclude = $true
            break
        }
    }
    foreach ($exclude in $ExcludeFiles) {
        if ($_.Name -like $exclude) {
            $shouldExclude = $true
            break
        }
    }
    if (-not $shouldExclude) {
        $targetPath = Join-Path $DeployTmpDir $relativePath
        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
        } else {
            $targetDir = Split-Path $targetPath -Parent
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            Copy-Item $_.FullName -Destination $targetPath -Force
        }
    }
}

# 2. 打包
Write-Host "📦 打包归档..." -ForegroundColor Green
$ArchivePath = Join-Path $ProjectRoot "server_deploy.tar.gz"
if (Test-Path $ArchivePath) {
    Remove-Item $ArchivePath -Force
}

# 使用 tar 打包（需要 Windows 10 1803+ 或安装 tar）
Push-Location $DeployTmpDir
tar -czf $ArchivePath *
Pop-Location
Remove-Item $DeployTmpDir -Recurse -Force

# 3. 上传
Write-Host "📤 上传归档到 $SERVER_IP..." -ForegroundColor Green
$REMOTE_UPLOAD_BASE = "/home/$SSH_USER/deploy_upload"
ssh -o StrictHostKeyChecking=no "$SSH_USER@$SERVER_IP" "mkdir -p $REMOTE_UPLOAD_BASE && chmod 777 $REMOTE_UPLOAD_BASE"
scp -o StrictHostKeyChecking=no $ArchivePath "$SSH_USER@$SERVER_IP`:$REMOTE_UPLOAD_BASE/"
Remove-Item $ArchivePath -Force

# 4. 远程安装
Write-Host "🔧 远程安装..." -ForegroundColor Green
$RemoteScript = @"
sudo bash -c '
    TARGET="$REMOTE_TARGET"
    echo "   目标路径: \$TARGET"

    # A. 停止服务
    echo "   🛑 停止容器 $BACKEND_CONTAINER..."
    CONTAINER_ID=\$(docker ps -aqf name=$BACKEND_CONTAINER)
    if [ ! -z "\$CONTAINER_ID" ]; then
         docker stop \$CONTAINER_ID
    fi

    # B. 清理旧文件（保留 uploads）
    echo "   🧹 清理旧文件（保留 uploads）..."
    mkdir -p \$TARGET
    find \$TARGET -mindepth 1 -maxdepth 1 ! -name "uploads" -exec rm -rf {} +

    # 确保日志目录存在
    LOG_DIR="$REMOTE_DEPLOY_BASE/kiro-basket-server/log"
    mkdir -p \$LOG_DIR
    chown -R 1000:1000 \$LOG_DIR

    # C. 解压归档
    echo "   📦 解压归档..."
    tar -xzf /home/$SSH_USER/deploy_upload/server_deploy.tar.gz -C \$TARGET
    rm -rf /home/$SSH_USER/deploy_upload

    # 强制清理 Mac 元数据
    echo "   🧹 清理 Mac 元数据文件..."
    find \$TARGET -name "._*" -delete
    find \$TARGET -name ".DS_Store" -delete

    # D. 权限设置
    chown -R 1000:1000 \$TARGET

    # E. 启动服务
    echo "   🚀 启动容器..."
    if [ ! -z "\$CONTAINER_ID" ]; then
        docker restart \$CONTAINER_ID
        echo "   ✅ 服务已重启"
    else
        echo "   ⚠️ 容器 $BACKEND_CONTAINER 未找到。请手动创建。"
    fi
'
"@

ssh -o StrictHostKeyChecking=no -t "$SSH_USER@$SERVER_IP" $RemoteScript

Write-Host "✅ 后端部署完成！" -ForegroundColor Green
