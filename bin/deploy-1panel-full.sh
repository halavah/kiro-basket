#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  📦 部署全栈到 1Panel (Server + Captain + Resident)"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 部署顺序：Server → Captain → Resident → Restart
echo -e "${BLUE}ℹ${NC} 开始部署..."
echo ""

# 1. 部署 Server
echo -e "${YELLOW}[1/3]${NC} 部署 Server..."
bash "$SCRIPT_DIR/deploy-1panel-server.sh"
if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} Server 部署失败"
    exit 1
fi

echo ""
echo -e "${YELLOW}等待 3 秒后继续...${NC}"
sleep 3
echo ""

# 2. 部署 Captain
echo -e "${YELLOW}[2/3]${NC} 部署 Captain..."
bash "$SCRIPT_DIR/deploy-1panel-captain.sh"
if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} Captain 部署失败"
    exit 1
fi

echo ""
echo -e "${YELLOW}等待 3 秒后继续...${NC}"
sleep 3
echo ""

# 3. 部署 Resident
echo -e "${YELLOW}[3/3]${NC} 部署 Resident..."
bash "$SCRIPT_DIR/deploy-1panel-resident.sh"
if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} Resident 部署失败"
    exit 1
fi

echo ""

# 4. 重启服务
echo -e "${BLUE}ℹ${NC} 重启服务..."
bash "$SCRIPT_DIR/deploy-1panel-restart.sh"
if [ $? -ne 0 ]; then
    echo -e "${RED}✗${NC} 重启服务失败"
    exit 1
fi

echo ""
echo -e "${GREEN}✓${NC} 全栈部署完成！"
