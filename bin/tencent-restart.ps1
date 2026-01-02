
# ================================================
# 腾讯云配置 - 请根据实际情况修改
# ================================================
# TODO: 请填入你的腾讯云服务器信息
$SERVER_IP = "your-tencent-cloud-ip"
$SSH_USER = "ubuntu"

# 容器名称（根据实际情况修改）
$BACKEND_CONTAINER = "kiro-basket-server"
$FRONTEND_CONTAINER = "1Panel-openresty-xxxx"

Write-Host "ℹ 正在执行: 服务重启 (Frontend Reload & Backend Restart)..." -ForegroundColor Blue

$RemoteScript = @"
sudo bash -c '
    # 1. 重启后端
    echo "   检查后端容器 ($BACKEND_CONTAINER)..."
    CONTAINER_ID=\$(docker ps -aqf name=$BACKEND_CONTAINER)
    if [ ! -z "\$CONTAINER_ID" ]; then
         echo "   🔄 重启后端容器..."
         docker restart \$CONTAINER_ID
    else
         echo "   ⚠️ 后端容器未找到"
    fi

    # 2. 重载前端
    echo "   检查前端容器 ($FRONTEND_CONTAINER)..."
    NGINX_ID=\$(docker ps -aqf name=$FRONTEND_CONTAINER)
    if [ ! -z "\$NGINX_ID" ]; then
         echo "   🔄 重载 Nginx..."
         docker exec \$NGINX_ID nginx -s reload
    else
         echo "   ⚠️ 前端容器未找到"
    fi
'
"@

ssh -o StrictHostKeyChecking=no -t "$SSH_USER@$SERVER_IP" $RemoteScript

Write-Host "✅ 服务重启完成" -ForegroundColor Green
