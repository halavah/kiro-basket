#!/bin/bash

# ================================================
# 腾讯云配置 - 请根据实际情况修改
# ================================================
# TODO: 请填入你的腾讯云服务器信息
SERVER_IP="your-tencent-cloud-ip"
SSH_USER="ubuntu"
# 统一部署基础路径
REMOTE_DEPLOY_BASE="/opt/1panel/www/sites"
# 后端服务路径
REMOTE_TARGET="$REMOTE_DEPLOY_BASE/kiro-basket-server"
# 后端容器名称
BACKEND_CONTAINER="kiro-basket-server"

# ================================================
# 颜色定义
# ================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}🚀 部署后端服务 (Server)...${NC}"

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 1. 准备后端文件
echo -e "${GREEN}📦 准备后端文件...${NC}"
mkdir -p "$PROJECT_ROOT/deploy_tmp_server"
# 复制文件，排除 node_modules, .env.*, uploads, .git
rsync -av --progress "$PROJECT_ROOT/server/" "$PROJECT_ROOT/deploy_tmp_server/" \
    --exclude node_modules \
    --exclude .env.* \
    --exclude .git \
    --exclude uploads

# 2. 打包
echo -e "${GREEN}📦 打包归档...${NC}"
rm -f "$PROJECT_ROOT/server_deploy.tar.gz"
# 清理 Mac 元数据文件
find "$PROJECT_ROOT/deploy_tmp_server" -name "._*" -delete
find "$PROJECT_ROOT/deploy_tmp_server" -name ".DS_Store" -delete
# 创建归档
COPYFILE_DISABLE=1 tar -czf "$PROJECT_ROOT/server_deploy.tar.gz" -C "$PROJECT_ROOT/deploy_tmp_server" .
rm -rf "$PROJECT_ROOT/deploy_tmp_server"

# 3. 上传
echo -e "${GREEN}📤 上传归档到 $SERVER_IP...${NC}"
REMOTE_UPLOAD_BASE="/home/$SSH_USER/deploy_upload"
ssh -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "mkdir -p $REMOTE_UPLOAD_BASE && chmod 777 $REMOTE_UPLOAD_BASE"
scp -o StrictHostKeyChecking=no "$PROJECT_ROOT/server_deploy.tar.gz" "$SSH_USER@$SERVER_IP:$REMOTE_UPLOAD_BASE/"
rm -f "$PROJECT_ROOT/server_deploy.tar.gz"

# 4. 远程安装
echo -e "${GREEN}🔧 远程安装...${NC}"
ssh -o StrictHostKeyChecking=no -t $SSH_USER@$SERVER_IP "sudo bash -c '
    TARGET=\"$REMOTE_TARGET\"
    echo \"   目标路径: \$TARGET\"

    # A. 停止服务
    echo \"   🛑 停止容器 $BACKEND_CONTAINER...\"
    CONTAINER_ID=\$(docker ps -aqf name=$BACKEND_CONTAINER)
    if [ ! -z \"\$CONTAINER_ID\" ]; then
         docker stop \$CONTAINER_ID
    fi

    # B. 清理旧文件（保留 uploads）
    echo \"   🧹 清理旧文件（保留 uploads）...\"
    mkdir -p \$TARGET
    find \$TARGET -mindepth 1 -maxdepth 1 ! -name \"uploads\" -exec rm -rf {} +

    # 确保日志目录存在
    LOG_DIR=\"$REMOTE_DEPLOY_BASE/kiro-basket-server/log\"
    mkdir -p \$LOG_DIR
    chown -R 1000:1000 \$LOG_DIR

    # C. 解压归档
    echo \"   📦 解压归档...\"
    tar -xzf /home/$SSH_USER/deploy_upload/server_deploy.tar.gz -C \$TARGET
    rm -rf /home/$SSH_USER/deploy_upload

    # 强制清理 Mac 元数据
    echo \"   🧹 清理 Mac 元数据文件...\"
    find \$TARGET -name \"._*\" -delete
    find \$TARGET -name \".DS_Store\" -delete

    # D. 权限设置
    chown -R 1000:1000 \$TARGET

    # E. 启动服务
    echo \"   🚀 启动容器...\"
    if [ ! -z \"\$CONTAINER_ID\" ]; then
        docker restart \$CONTAINER_ID
        echo \"   ✅ 服务已重启\"
    else
        echo \"   ⚠️ 容器 $BACKEND_CONTAINER 未找到。请手动创建。\"
    fi
'"
echo -e "${GREEN}✅ 后端部署完成！${NC}"
