#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  🚀 部署 Server 到 Render"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/server/.env.render"

# 检查 .env.render 文件是否存在
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗${NC} 环境配置文件不存在: $ENV_FILE"
    exit 1
fi

# 加载环境变量
export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)

# 检查 Deploy Hook URL 是否配置
if [ -z "$RENDER_DEPLOY_HOOK_SERVER" ]; then
    echo -e "${RED}✗${NC} RENDER_DEPLOY_HOOK_SERVER 未配置"
    echo ""
    echo "请在 $ENV_FILE 中配置 Deploy Hook URL"
    echo "获取方式: Render Dashboard > kiro-basket-server > Settings > Deploy Hook"
    exit 1
fi

echo -e "${BLUE}ℹ${NC} Deploy Hook URL: ${RENDER_DEPLOY_HOOK_SERVER:0:50}..."
echo ""

# 触发部署
echo -e "${BLUE}ℹ${NC} 正在触发 Render 部署..."
RESPONSE=$(curl -s -X POST "$RENDER_DEPLOY_HOOK_SERVER")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} 部署请求已发送"
    echo ""
    echo -e "${BLUE}ℹ${NC} 请访问 Render Dashboard 查看部署进度"
    echo "   https://dashboard.render.com/"
else
    echo -e "${RED}✗${NC} 部署请求失败"
    exit 1
fi
