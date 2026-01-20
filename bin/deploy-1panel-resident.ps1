
# ================================================
# 腾讯云配置 - 请根据实际情况修改
# ================================================
# TODO: 请填入你的腾讯云服务器信息
$SERVER_IP = "your-tencent-cloud-ip"
$SSH_USER = "ubuntu"
$REMOTE_DEPLOY_BASE = "/opt/1panel/www/sites"
# 居民端前端路径
$REMOTE_TARGET = "$REMOTE_DEPLOY_BASE/kiro-basket-client-resident/index"

Write-Host "🚀 部署居民端前端 (Client-Resident)..." -ForegroundColor Green

# 获取项目根目录
$ScriptDir = $PSScriptRoot
$ProjectRoot = Split-Path $ScriptDir -Parent

# 1. 构建
Write-Host "📦 构建居民端前端..." -ForegroundColor Green
Push-Location (Join-Path $ProjectRoot "client-resident")
npm install
npm run build --mode prod
Pop-Location

# 2. 打包
Write-Host "📦 打包归档..." -ForegroundColor Green
$ArchivePath = Join-Path $ProjectRoot "client_resident_deploy.tar.gz"
if (Test-Path $ArchivePath) {
    Remove-Item $ArchivePath -Force
}

$DeployTmpDir = Join-Path $ProjectRoot "deploy_tmp_resident"
if (Test-Path $DeployTmpDir) {
    Remove-Item $DeployTmpDir -Recurse -Force
}
New-Item -ItemType Directory -Path $DeployTmpDir | Out-Null

$DistDir = Join-Path $ProjectRoot "client-resident\dist"
Copy-Item -Path "$DistDir\*" -Destination $DeployTmpDir -Recurse -Force

# 创建归档
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

    # A. 清理目标
    echo "   🧹 清理旧文件..."
    mkdir -p \$TARGET
    rm -rf \$TARGET/*

    # 确保日志目录存在（Nginx）
    LOG_DIR="$REMOTE_DEPLOY_BASE/kiro-basket-client-resident/log"
    mkdir -p \$LOG_DIR
    chown -R 1000:1000 \$LOG_DIR

    # B. 解压归档
    echo "   📦 解压归档..."
    tar -xzf /home/$SSH_USER/deploy_upload/client_resident_deploy.tar.gz -C \$TARGET
    rm -rf /home/$SSH_USER/deploy_upload

    # 强制清理 Mac 元数据
    echo "   🧹 清理 Mac 元数据文件..."
    find \$TARGET -name "._*" -delete
    find \$TARGET -name ".DS_Store" -delete

    # C. 权限设置
    chown -R 1000:1000 \$TARGET
'
"@

ssh -o StrictHostKeyChecking=no -t "$SSH_USER@$SERVER_IP" $RemoteScript

Write-Host "✅ 居民端前端部署完成！" -ForegroundColor Green
