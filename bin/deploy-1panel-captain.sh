#!/bin/bash

# ================================================
# 腾讯云配置 - 请根据实际情况修改
# ================================================
# TODO: 请填入你的腾讯云服务器信息
SERVER_IP="your-tencent-cloud-ip"
SSH_USER="ubuntu"
REMOTE_DEPLOY_BASE="/opt/1panel/www/sites"
# 团长端前端路径
REMOTE_TARGET="$REMOTE_DEPLOY_BASE/kiro-basket-client-captain/index"

# 颜色定义
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}🚀 部署团长端前端 (Client-Captain)...${NC}"

# 获取项目根目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 1. 构建
echo -e "${GREEN}📦 构建团长端前端...${NC}"
cd "$PROJECT_ROOT/client-captain"
npm install
npm run build --mode prod
cd "$SCRIPT_DIR"

# 2. 打包
echo -e "${GREEN}📦 打包归档...${NC}"
rm -f "$PROJECT_ROOT/client_captain_deploy.tar.gz"
rm -rf "$PROJECT_ROOT/deploy_tmp_captain"
mkdir -p "$PROJECT_ROOT/deploy_tmp_captain"
cp -r "$PROJECT_ROOT/client-captain/dist/"* "$PROJECT_ROOT/deploy_tmp_captain/"

# 清理 Mac 元数据文件
find "$PROJECT_ROOT/deploy_tmp_captain" -name "._*" -delete
find "$PROJECT_ROOT/deploy_tmp_captain" -name ".DS_Store" -delete

# 创建归档
COPYFILE_DISABLE=1 tar -czf "$PROJECT_ROOT/client_captain_deploy.tar.gz" -C "$PROJECT_ROOT/deploy_tmp_captain" .
rm -rf "$PROJECT_ROOT/deploy_tmp_captain"

# 3. 上传
echo -e "${GREEN}📤 上传归档到 $SERVER_IP...${NC}"
REMOTE_UPLOAD_BASE="/home/$SSH_USER/deploy_upload"
ssh -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "mkdir -p $REMOTE_UPLOAD_BASE && chmod 777 $REMOTE_UPLOAD_BASE"
scp -o StrictHostKeyChecking=no "$PROJECT_ROOT/client_captain_deploy.tar.gz" "$SSH_USER@$SERVER_IP:$REMOTE_UPLOAD_BASE/"
rm -f "$PROJECT_ROOT/client_captain_deploy.tar.gz"

# 4. 远程安装
echo -e "${GREEN}🔧 远程安装...${NC}"
ssh -o StrictHostKeyChecking=no -t $SSH_USER@$SERVER_IP "sudo bash -c '
    TARGET=\"$REMOTE_TARGET\"
    echo \"   目标路径: \$TARGET\"

    # A. 清理目标
    echo \"   🧹 清理旧文件...\"
    mkdir -p \$TARGET
    rm -rf \$TARGET/*

    # 确保日志目录存在（Nginx）
    LOG_DIR=\"$REMOTE_DEPLOY_BASE/kiro-basket-client-captain/log\"
    mkdir -p \$LOG_DIR
    chown -R 1000:1000 \$LOG_DIR

    # B. 解压归档
    echo \"   📦 解压归档...\"
    tar -xzf /home/$SSH_USER/deploy_upload/client_captain_deploy.tar.gz -C \$TARGET
    rm -rf /home/$SSH_USER/deploy_upload

    # 强制清理 Mac 元数据
    echo \"   🧹 清理 Mac 元数据文件...\"
    find \$TARGET -name \"._*\" -delete
    find \$TARGET -name \".DS_Store\" -delete

    # C. 权限设置
    chown -R 1000:1000 \$TARGET
'"
echo -e "${GREEN}✅ 团长端前端部署完成！${NC}"
